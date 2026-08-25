import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  getPlatformAnalytics,
  getAllGlobalOrders,
  getOnboardingRequests,
  updateOnboardingStatus,
  sendAnnouncement,
  inviteUser
} from '../controllers/adminController.js';

const router = express.Router();

router.route('/analytics').get(protect, admin, getPlatformAnalytics);
router.route('/orders').get(protect, admin, getAllGlobalOrders);
router.route('/onboarding').get(protect, admin, getOnboardingRequests);
router.route('/onboarding/:id').put(protect, admin, updateOnboardingStatus);
router.route('/announcements').post(protect, admin, sendAnnouncement);
router.route('/invite').post(protect, admin, inviteUser);

export default router;
