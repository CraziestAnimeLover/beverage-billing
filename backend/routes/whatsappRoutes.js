import express from 'express';
import {
  sendInvoiceWhatsApp,
  sendPaymentWhatsApp,
  sendReminderWhatsApp,
} from '../controllers/whatsappController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/invoice/:id', protect, adminOnly, sendInvoiceWhatsApp);
router.post('/payment/:id', protect, adminOnly, sendPaymentWhatsApp);
router.post('/reminder/:userId', protect, adminOnly, sendReminderWhatsApp);

export default router;
