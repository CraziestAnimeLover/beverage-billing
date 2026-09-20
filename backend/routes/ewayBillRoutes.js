import express from 'express';
import {
  createEwayBill,
  getEwayBills,
  getEwayBillById,
  downloadEwayBillPdf,
} from '../controllers/ewayBillController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getEwayBills).post(protect, adminOnly, createEwayBill);
router.route('/:id').get(protect, getEwayBillById);
router.route('/:id/pdf').get(protect, downloadEwayBillPdf);

export default router;

