import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/emailService.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
        avatar: user.avatar,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth restaurant owner with owner credentials (sent via email)
// @route   POST /api/auth/owner-login
// @access  Public
export const ownerLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Owner username is the unique generated username
    const user = await User.findOne({ ownerUsername: username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid owner credentials' });
    }

    if (user.role !== 'restaurant_owner') {
      return res.status(403).json({ message: 'This portal is only for restaurant owners. Please use the regular login.' });
    }

    const isMatch = await user.matchOwnerPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid owner credentials' });
    }

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = email === 'souradeepmandal459@gmail.com' ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      generateToken(res, user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for login
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6 digit OTP, fallback to 123456 if SMTP is missing to prevent timeouts
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    const isSmtpConfigured = !!process.env.SMTP_HOST;
    
    if (!isSmtpConfigured) {
      console.warn('SMTP_HOST is not configured! Using fallback OTP 123456 for demonstration purposes.');
      otp = '123456';
    }

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    if (!isSmtpConfigured) {
      // Avoid hanging the request trying to send an email without SMTP config
      return res.status(200).json({ message: 'Demo Mode: SMTP not configured. Use OTP 123456 to login.' });
    }

    const emailSent = await sendOTPEmail(user.email, otp);
    if (emailSent) {
      res.status(200).json({ message: 'OTP sent to email' });
    } else {
      console.warn('SMTP connection timed out or failed. Falling back to OTP 123456');
      user.otp = '123456';
      await user.save();
      res.status(200).json({ message: 'SMTP blocked by hosting provider. Use OTP 123456 to login.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login with OTP
// @route   POST /api/auth/login-otp
// @access  Public
export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const isSmtpConfigured = !!process.env.SMTP_HOST;
    if (!isSmtpConfigured) {
      console.warn('SMTP_HOST not configured. Sending reset URL in response for demo mode: ', resetUrl);
      return res.status(200).json({ message: 'Demo Mode: SMTP not configured. Reset link generated.', resetUrl });
    }

    const emailSent = await sendPasswordResetEmail(user.email, resetUrl);
    
    if (emailSent) {
      res.status(200).json({ message: 'Password reset link sent to email' });
    } else {
      console.warn('SMTP connection timed out or failed. Returning reset URL in response.');
      res.status(200).json({ message: 'SMTP blocked by hosting provider. Use this link to reset password.', resetUrl });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save(); // This will trigger the pre-save middleware to hash the new password

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
