import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, adminOnly, getExpenses).post(protect, adminOnly, createExpense);
router.delete('/:id', protect, adminOnly, deleteExpense);

export default router;
