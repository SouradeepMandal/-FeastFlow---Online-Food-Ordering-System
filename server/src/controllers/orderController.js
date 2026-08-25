import Order from '../models/Order.js';
import Stripe from 'stripe';
import Restaurant from '../models/Restaurant.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// @desc    Instant Buy - Create order, mark paid & delivered immediately
// @route   POST /api/orders/instant-buy
// @access  Private
export const instantBuy = async (req, res) => {
  try {
    const {
      orderItems,
      deliveryAddress,
      itemsPrice,
      taxPrice,
      deliveryFee,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Derive restaurantId from the first item if present
    let restaurantId;
    if (orderItems[0].restaurantId) {
      restaurantId = orderItems[0].restaurantId;
    } else if (orderItems[0].restaurant) {
      const rest = await Restaurant.findOne({ name: orderItems[0].restaurant });
      restaurantId = rest?._id;
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      restaurant: restaurantId,
      deliveryAddress: deliveryAddress || { street: 'Instant Purchase', city: 'N/A', country: 'N/A', zipCode: '000000' },
      paymentMethod: 'Instant Buy (Pay Later)',
      itemsPrice,
      taxPrice,
      deliveryFee,
      totalPrice,
      isPaid: false,
      orderStatus: 'Placed',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      deliveryAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      deliveryFee,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const order = new Order({
      orderItems,
      user: req.user._id,
      deliveryAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      deliveryFee,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    
    // Convert to smallest currency unit (cents)
    const amount = Math.round(totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      // In latest api versions, automatic_payment_methods is enabled by default
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = req.body.status;
      
      if (req.body.status === 'Delivered') {
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

      // Emit socket event to the specific order room
      const io = req.app.get('io');
      if (io) {
        io.to(req.params.id).emit('orderStatusUpdated', {
          orderId: order._id,
          status: updatedOrder.orderStatus,
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics
// @route   GET /api/orders/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    
    // Quick mock of daily sales for chart
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => ({
      name: date,
      sales: Math.floor(Math.random() * 500) + 100 // Mock data
    }));

    res.json({ ordersCount, revenue, chartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
