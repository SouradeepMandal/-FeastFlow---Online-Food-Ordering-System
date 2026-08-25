import express from 'express';
import { addOrderItems, getOrderById, createPaymentIntent, updateOrderStatus, getMyOrders, getOrders, getAnalytics, instantBuy } from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/admin/analytics').get(protect, admin, getAnalytics);
router.route('/myorders').get(protect, getMyOrders);
router.route('/instant-buy').post(protect, instantBuy);
router.route('/create-payment-intent').post(protect, createPaymentIntent);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

export default router;

