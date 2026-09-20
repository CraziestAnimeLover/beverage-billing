import express from 'express';
import {
  getDashboardStats,
  getSalesReports,
  getOutstandingReport,
  getProfitReport,
} from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/sales', protect, adminOnly, getSalesReports);
router.get('/outstanding', protect, adminOnly, getOutstandingReport);
router.get('/profit', protect, adminOnly, getProfitReport);

export default router;
