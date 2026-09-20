import express from 'express';
import { getInventory, adjustStock, getInventoryTransactions } from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, getInventory);
router.post('/adjust', protect, adminOnly, adjustStock);
router.get('/transactions', protect, adminOnly, getInventoryTransactions);

export default router;
