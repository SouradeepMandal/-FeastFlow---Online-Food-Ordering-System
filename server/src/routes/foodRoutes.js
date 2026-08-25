import express from 'express';
import { getFoods, getFoodById, createFoodReview, createFood, updateFood, deleteFood } from '../controllers/foodController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(getFoods).post(protect, admin, createFood);
router.route('/:id').get(getFoodById).put(protect, admin, updateFood).delete(protect, admin, deleteFood);
router.route('/:id/reviews').post(protect, createFoodReview);

export default router;
