import express from 'express';
import { recordPayment, getPayments, getPaymentById } from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getPayments).post(protect, adminOnly, recordPayment);
router.route('/:id').get(protect, getPaymentById);

export default router;
