import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import BusinessSettings from '../models/BusinessSettings.js';
import {
  getInvoiceWhatsAppMessage,
  getPaymentWhatsAppMessage,
  getOrderStatusWhatsAppMessage,
  getOutstandingReminderMessage,
} from '../utils/whatsappHelper.js';

// @desc    Generate WhatsApp trigger link for an invoice
// @route   POST /api/whatsapp/invoice/:id
// @access  Private/Admin
export const sendInvoiceWhatsApp = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('userId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const settings = (await BusinessSettings.findOne()) || {};
    const payload = getInvoiceWhatsAppMessage({
      invoice,
      customer: invoice.userId,
      settings,
    });

    res.json({ success: true, ...payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate WhatsApp trigger link for a payment receipt
// @route   POST /api/whatsapp/payment/:id
// @access  Private/Admin
export const sendPaymentWhatsApp = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('userId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const settings = (await BusinessSettings.findOne()) || {};
    const payload = getPaymentWhatsAppMessage({
      payment,
      customer: payment.userId,
      settings,
    });

    res.json({ success: true, ...payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate WhatsApp trigger link for outstanding balance reminder
// @route   POST /api/whatsapp/reminder/:userId
// @access  Private/Admin
export const sendReminderWhatsApp = async (req, res) => {
  try {
    const customer = await User.findById(req.params.userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const settings = (await BusinessSettings.findOne()) || {};
    const payload = getOutstandingReminderMessage({
      customer,
      settings,
    });

    res.json({ success: true, ...payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
