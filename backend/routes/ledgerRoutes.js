import express from 'express';
import { getCustomerLedger } from '../controllers/ledgerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCustomerLedger);

export default router;
