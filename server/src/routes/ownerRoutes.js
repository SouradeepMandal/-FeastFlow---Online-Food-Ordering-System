import express from 'express';
import { protect, isOwner } from '../middlewares/authMiddleware.js';
import {
  getOwnerOrders,
  updateOrderStatus,
  getOwnerAnalytics,
  getOwnerMenu,
  createMenuItem,
  updateMenuItem,
  extractDescription,
  marketingAI,
  getOwnerRestaurant,
} from '../controllers/ownerController.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// GET own restaurant info (for sidebar name display)
router.route('/restaurant').get(protect, isOwner, getOwnerRestaurant);
router.route('/orders').get(protect, isOwner, getOwnerOrders);
router.route('/orders/:id/status').put(protect, isOwner, updateOrderStatus);
router.route('/analytics').get(protect, isOwner, getOwnerAnalytics);
router.route('/menu').get(protect, isOwner, getOwnerMenu).post(protect, isOwner, createMenuItem);
router.route('/menu/:id').put(protect, isOwner, updateMenuItem);
router.route('/extract-description').post(protect, isOwner, upload.single('document'), extractDescription);
router.route('/marketing-ai').post(protect, isOwner, marketingAI);

export default router;
