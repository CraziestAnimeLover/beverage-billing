import express from 'express';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, adminOnly, getPurchases).post(protect, adminOnly, createPurchase);

export default router;
