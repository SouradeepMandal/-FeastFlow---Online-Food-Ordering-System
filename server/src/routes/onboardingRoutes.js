import express from 'express';
import { triggerOnboarding, submitDocuments } from '../controllers/onboardingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/trigger', protect, triggerOnboarding);
router.post('/submit', protect, submitDocuments);

export default router;
