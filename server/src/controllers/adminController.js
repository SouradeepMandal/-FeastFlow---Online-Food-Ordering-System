import crypto from 'crypto';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import OnboardingRequest from '../models/OnboardingRequest.js';
import { processApproval } from './onboardingController.js';
import Notification from '../models/Notification.js';
import { generateRejectionMessageWithGemini } from '../services/geminiService.js';

// @desc    Get platform wide analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const allOrders = await Order.find();
    
    const totalGMV = allOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    
    const activeRestaurants = await Restaurant.countDocuments({ status: 'active' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingOnboarding = await Restaurant.countDocuments({ status: 'pending' });

    res.json({
      totalOrders,
      totalGMV,
      activeRestaurants,
      totalCustomers,
      pendingOnboarding
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

// @desc    Get all global orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllGlobalOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching global orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Get onboarding requests for manual review
// @route   GET /api/admin/onboarding
// @access  Private/Admin
export const getOnboardingRequests = async (req, res) => {
  try {
    const requests = await OnboardingRequest.find({ status: 'manual_review' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching onboarding requests:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

// @desc    Approve or reject onboarding request
// @route   PUT /api/admin/onboarding/:id
// @access  Private/Admin
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await OnboardingRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    if (status === 'approved') {
      processApproval(request._id).catch(console.error);
    } else if (status === 'rejected') {
      generateRejectionMessageWithGemini(request.restaurantDetails.name)
        .then(async (rejectionMessage) => {
          await Notification.create({
            userId: request.userId,
            type: 'status_update',
            message: rejectionMessage,
          });
        })
        .catch(console.error);
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// @desc    Send broadcast announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
export const sendAnnouncement = async (req, res) => {
  try {
    const { audience, subject, description, userIds } = req.body;
    
    let users = [];

    if (audience === 'specific' && Array.isArray(userIds) && userIds.length > 0) {
      // Send only to specifically selected users
      users = await User.find({ _id: { $in: userIds } });
    } else {
      let query = {};
      if (audience === 'customers') query.role = 'customer';
      else if (audience === 'owners') query.role = 'restaurant_owner';
      // 'all' => no filter
      users = await User.find(query);
    }

    const notifications = users.map(user => ({
      userId: user._id,
      type: 'general',
      message: `📢 ${subject}\n\n${description}`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: `Announcement sent to ${notifications.length} user(s)` });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ message: 'Server error sending announcement' });
  }
};

// @desc    Invite User (Admin or Owner)
// @route   POST /api/admin/invite
// @access  Private/Admin
export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!['admin', 'restaurant_owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for invitation' });
    }

    const generatedPassword = crypto.randomBytes(6).toString('hex');
    
    let user = await User.findOne({ email });
    if (user) {
      user.role = role;
      user.password = generatedPassword;
      await user.save();
    } else {
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: generatedPassword,
        role
      });
    }

    const loginLink = `http://localhost:5173/login`;
    
    res.json({ 
      message: 'User invited successfully. Share these credentials.', 
      credentials: { email, password: generatedPassword, loginLink, role }
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Server error inviting user' });
  }
};
