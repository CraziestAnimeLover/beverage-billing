import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import CustomerLedger from '../models/CustomerLedger.js';
import BusinessSettings from '../models/BusinessSettings.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

// @desc    Generate Invoice from Order (Admin)
// @route   POST /api/invoices/generate
// @access  Private/Admin
export const generateInvoice = async (req, res) => {
  try {
    const { orderId, discount = 0, notes } = req.body;

    const order = await Order.findById(orderId).populate('userId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.invoiceCreated) {
      return res.status(400).json({ success: false, message: 'Invoice already generated for this order' });
    }

    const customer = order.userId;
    const settings = (await BusinessSettings.findOne()) || {};

    // Generate Invoice Number
    const count = await Invoice.countDocuments();
    const prefix = settings.invoicePrefix || 'INV-2026-';
    const invoiceNumber = `${prefix}${String(count + 1).padStart(5, '0')}`;

    // Calculate Taxes
    const subtotal = order.subtotal;
    const discountAmount = Number(discount);
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    // Intra-state (Same State) -> CGST 9% + SGST 9%; Inter-state -> IGST 18%
    const dealerState = (settings.state || 'Haryana').trim().toLowerCase();
    const isInterState = customer.state && customer.state.trim().toLowerCase() !== dealerState;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = (taxableAmount * 18) / 100;
    } else {
      cgst = (taxableAmount * 9) / 100;
      sgst = (taxableAmount * 9) / 100;
    }

    const totalAmount = Math.round((taxableAmount + cgst + sgst + igst) * 100) / 100;

    // Due date
    const termsDays = customer.paymentTerms || 15;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + termsDays);

    // E-Way Bill requirement (> ₹50,000 in India)
    const ewayBillRequired = totalAmount >= 50000;

    const invoiceItems = order.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      hsn: '2202',
      packSize: item.packSize,
      unit: item.unit,
      quantity: item.quantity,
      rate: item.unitPrice,
      taxRate: item.taxRate,
      taxAmount: (item.quantity * item.unitPrice * item.taxRate) / 100,
      amount: item.itemTotal,
    }));

    const invoice = new Invoice({
      invoiceNumber,
      orderId: order._id,
      userId: customer._id,
      items: invoiceItems,
      subtotal,
      discount: discountAmount,
      cgst,
      sgst,
      igst,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      dueDate,
      ewayBillRequired,
      notes: notes || order.notes,
      status: 'generated',
    });

    await invoice.save();

    // Link invoice to order
    order.invoiceCreated = true;
    order.invoiceId = invoice._id;
    if (order.status === 'pending') order.status = 'confirmed';
    await order.save();

    // Update customer outstanding balance & CustomerLedger
    const previousBalance = customer.outstandingBalance || 0;
    const newBalance = previousBalance + totalAmount;
    customer.outstandingBalance = newBalance;
    await customer.save();

    await CustomerLedger.create({
      userId: customer._id,
      type: 'INVOICE',
      referenceId: invoice._id,
      referenceNumber: invoice.invoiceNumber,
      debit: totalAmount,
      credit: 0,
      runningBalance: newBalance,
      description: `Tax Invoice #${invoice.invoiceNumber} (Order #${order.orderNumber})`,
      date: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Tax Invoice generated and ledger updated successfully',
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all invoices (Admin views all; Customer views only their own)
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    // Tenant isolation
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('userId', 'name businessName mobile gstin address city')
      .populate('orderId', 'orderNumber status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice details
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const invoice = await Invoice.findOne(query)
      .populate('userId', 'name businessName mobile whatsapp gstin address city state pincode')
      .populate('orderId', 'orderNumber status');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download PDF Tax Invoice
// @route   GET /api/invoices/:id/pdf
// @access  Private
export const downloadInvoicePdf = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const invoice = await Invoice.findOne(query).populate('userId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const settings = (await BusinessSettings.findOne()) || {};

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Invoice-${invoice.invoiceNumber}.pdf`);

    generateInvoicePDF(invoice, settings, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
