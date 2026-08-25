import express from 'express';
import { authUser, ownerLogin, registerUser, logoutUser, getUserProfile, sendOtp, loginWithOtp, forgotPassword, resetPassword } from '../controllers/authController.js';
import { updateUserProfile, toggleWishlist, getWishlist, getUsers, deleteUser, updateUserRole } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/owner-login', ownerLogin);
router.post('/send-otp', sendOtp);
router.post('/login-otp', loginWithOtp);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);

router.put('/profile', protect, updateUserProfile);
router.route('/wishlist').post(protect, toggleWishlist).get(protect, getWishlist);

router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
