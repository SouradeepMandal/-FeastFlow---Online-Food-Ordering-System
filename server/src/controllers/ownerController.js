import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Restaurant from '../models/Restaurant.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { GoogleGenAI } from '@google/genai';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// @desc    Get logged in owner's orders
// @route   GET /api/owner/orders
// @access  Private/Owner
export const getOwnerOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { restaurant: req.user.restaurantId };
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching owner orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Update order status
// @route   PUT /api/owner/orders/:id/status
// @access  Private/Owner
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, restaurant: req.user.restaurantId };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not authorized' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// @desc    Get owner analytics
// @route   GET /api/owner/analytics
// @access  Private/Owner
export const getOwnerAnalytics = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    
    const query = req.user.role === 'admin' ? {} : { restaurant: restaurantId };
    const orders = await Order.find(query);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    // active orders (not delivered or cancelled)
    const activeOrders = orders.filter(
      o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    ).length;

    res.json({
      totalOrders,
      totalRevenue,
      activeOrders,
    });
  } catch (error) {
    console.error('Error fetching owner analytics:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// @desc    Get owner menu items
// @route   GET /api/owner/menu
// @access  Private/Owner
export const getOwnerMenu = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { restaurant: req.user.restaurantId };
    const menu = await FoodItem.find(query).populate('category', 'name');
    res.json(menu);
  } catch (error) {
    console.error('Error fetching owner menu:', error);
    res.status(500).json({ message: 'Server error fetching menu' });
  }
};

// @desc    Create a new menu item
// @route   POST /api/owner/menu
// @access  Private/Owner
export const createMenuItem = async (req, res) => {
  try {
    let { name, description, category, price, image, countInStock } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(category)) {
      let existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (!existingCategory) {
        existingCategory = await Category.create({ name: category });
      }
      category = existingCategory._id;
    }

    let restaurantId = req.user.restaurantId;
    if (!restaurantId) {
      let restaurant = await Restaurant.findOne({ ownerId: req.user._id });
      if (!restaurant) {
        restaurant = await Restaurant.create({ 
          ownerId: req.user._id, 
          name: `${req.user.name}'s Restaurant`,
          fssaiNumber: 'PENDING'
        });
      }
      restaurantId = restaurant._id;
      req.user.restaurantId = restaurantId;
      await req.user.save();
    }

    const foodItem = new FoodItem({
      name,
      description,
      category,
      price,
      image,
      countInStock: countInStock || 0,
      restaurant: restaurantId,
    });
    
    const createdItem = await foodItem.save();
    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Server error creating menu item' });
  }
};

// @desc    Update a menu item
// @route   PUT /api/owner/menu/:id
// @access  Private/Owner
export const updateMenuItem = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, restaurant: req.user.restaurantId };
    const item = await FoodItem.findOne(query);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found or not authorized' });
    }

    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    
    if (req.body.category) {
      let category = req.body.category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        let existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (!existingCategory) {
          existingCategory = await Category.create({ name: category });
        }
        category = existingCategory._id;
      }
      item.category = category;
    }

    item.price = req.body.price || item.price;
    item.image = req.body.image || item.image;
    
    if (req.body.countInStock !== undefined) {
      item.countInStock = req.body.countInStock;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Server error updating menu item' });
  }
};

// @desc    Extract description from uploaded PDF/TXT
// @route   POST /api/owner/extract-description
// @access  Private/Owner
export const extractDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    let text = '';
    const mimetype = req.file.mimetype;
    
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else if (mimetype === 'text/plain') {
      text = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or TXT.' });
    }
    
    res.json({ text: text.trim() });
  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).json({ message: 'Failed to extract text from file' });
  }
};

// @desc    AI Marketing Module
// @route   POST /api/owner/marketing-ai
// @access  Private/Owner
export const marketingAI = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { prompt } = req.body;
    
    // Fetch owner's menu to provide context to Gemini
    const menu = await FoodItem.find({ restaurant: req.user.restaurantId });
    const menuContext = menu.map(item => `${item.name}: $${item.price}`).join(', ');

    const systemPrompt = `You are "FeastFlow AI", an elite, world-class Restaurant Marketing Expert and Chief Growth Officer. 
Your ultimate goal is to help this restaurant owner dramatically boost their sales, customer retention, and brand visibility.

### Context:
- **Restaurant Menu:** ${menuContext ? menuContext : "No menu items added yet."}

### Task:
The restaurant owner has requested your expertise with the following prompt:
"${prompt}"

### Guidelines for Your Response:
1. **Be Actionable & Specific:** Don't just give generic advice. Provide concrete, step-by-step strategies tailored to their specific menu and request.
2. **High-Converting Copy:** If they ask for social media posts, emails, or ad copy, write it in a highly engaging, persuasive, and appetizing tone. Use emojis where appropriate.
3. **Structured & Beautiful Formatting:** Use Markdown extensively. Utilize bold text for emphasis, bullet points for readability, and headers to structure your strategy.
4. **Data-Driven Approach:** Suggest strategies involving promotions, limited-time offers (LTOs), or loyalty programs if it fits their request.
5. **Tone:** Professional, encouraging, highly creative, and culinary-focused.

Deliver your masterclass marketing strategy below:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: systemPrompt,
    });
    
    res.json({ result: response.text });
  } catch (error) {
    console.error('Error in marketing AI:', error);
    res.status(500).json({ message: 'AI Marketing generation failed' });
  }
};
