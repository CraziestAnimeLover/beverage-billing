import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Invoice from '../models/Invoice.js';
import CustomerLedger from '../models/CustomerLedger.js';

// @desc    Record customer payment (Admin)
// @route   POST /api/payments
// @access  Private/Admin
export const recordPayment = async (req, res) => {
  try {
    const { userId, invoiceId, amount, method, transactionId, paymentDate, notes } = req.body;

    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Customer and valid payment amount are required' });
    }

    const customer = await User.findById(userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const payAmount = Number(amount);

    // Generate Payment Receipt Number
    const count = await Payment.countDocuments();
    const paymentNumber = `PAY-2026-${String(count + 1).padStart(5, '0')}`;

    let allocatedInvoice = null;
    if (invoiceId) {
      allocatedInvoice = await Invoice.findById(invoiceId);
      if (allocatedInvoice) {
        allocatedInvoice.paidAmount = (allocatedInvoice.paidAmount || 0) + payAmount;
        allocatedInvoice.balanceAmount = Math.max(0, allocatedInvoice.totalAmount - allocatedInvoice.paidAmount);
        allocatedInvoice.status = allocatedInvoice.balanceAmount === 0 ? 'paid' : 'partially_paid';
        await allocatedInvoice.save();
      }
    }

    const payment = new Payment({
      paymentNumber,
      userId: customer._id,
      invoiceId: allocatedInvoice ? allocatedInvoice._id : undefined,
      amount: payAmount,
      method: method || 'upi',
      transactionId: transactionId || '',
      paymentDate: paymentDate || new Date(),
      notes: notes || '',
      recordedBy: req.user._id,
    });

    await payment.save();

    // Update customer outstanding balance & CustomerLedger
    const previousBalance = customer.outstandingBalance || 0;
    const newBalance = Math.max(0, previousBalance - payAmount);
    customer.outstandingBalance = newBalance;
    await customer.save();

    const desc = `Payment received via ${method ? method.toUpperCase() : 'UPI'}${
      transactionId ? ` (Ref: ${transactionId})` : ''
    }${allocatedInvoice ? ` for Inv #${allocatedInvoice.invoiceNumber}` : ''}`;

    await CustomerLedger.create({
      userId: customer._id,
      type: 'PAYMENT',
      referenceId: payment._id,
      referenceNumber: paymentNumber,
      debit: 0,
      credit: payAmount,
      runningBalance: newBalance,
      description: desc,
      date: paymentDate || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded and ledger updated successfully',
      payment,
      updatedBalance: newBalance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payments (Admin views all; Customer views only their own)
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const { method, userId } = req.query;
    const query = {};

    // Multi-tenant isolation:
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }

    if (method) query.method = method;

    const payments = await Payment.find(query)
      .populate('userId', 'name businessName mobile')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort({ paymentDate: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payment details
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const payment = await Payment.findOne(query)
      .populate('userId', 'name businessName mobile address')
      .populate('invoiceId');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
