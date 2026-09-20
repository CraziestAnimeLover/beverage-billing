import express from 'express';
import {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  downloadInvoicePdf,
} from '../controllers/invoiceController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, adminOnly, generateInvoice);
router.get('/:id/pdf', protect, downloadInvoicePdf);
router.route('/').get(protect, getInvoices);
router.route('/:id').get(protect, getInvoiceById);

export default router;
