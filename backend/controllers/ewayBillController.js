import EwayBill from '../models/EwayBill.js';
import Invoice from '../models/Invoice.js';
import BusinessSettings from '../models/BusinessSettings.js';
import { generateEwayBillPDF } from '../utils/pdfGenerator.js';

// @desc    Generate / Record E-Way Bill (Admin)
// @route   POST /api/eway-bills
// @access  Private/Admin
export const createEwayBill = async (req, res) => {
  try {
    const {
      invoiceId,
      vehicleNumber,
      transporter = 'Direct Delivery Fleet',
      transportMode = 'Road',
      distanceKm = 30,
      fromPlace,
      toPlace,
      validDays = 2,
    } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('userId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const settings = (await BusinessSettings.findOne()) || {};
    const customer = invoice.userId;

    // Generate 12-digit Indian standard E-Way Bill number format
    const random12Digits = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + Number(validDays));

    const ewayBill = new EwayBill({
      ewayBillNumber: random12Digits,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      supplierGstin: settings.gstin || '06AAAAA0000A1Z5',
      customerGstin: customer.gstin || 'URP',
      customerName: customer.businessName || customer.name,
      transporter,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      transportMode,
      distanceKm: Number(distanceKm),
      fromPlace: fromPlace || settings.city || 'Faridabad',
      toPlace: toPlace || customer.city || 'Faridabad',
      validUntil,
      status: 'active',
    });

    await ewayBill.save();

    // Link back to Invoice
    invoice.ewayBillNumber = ewayBill.ewayBillNumber;
    invoice.ewayBillRequired = true;
    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'E-Way Bill recorded successfully',
      ewayBill,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get E-Way Bills (Admin views all; Customer views only their own)
// @route   GET /api/eway-bills
// @access  Private
export const getEwayBills = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      // Find invoices belonging to this user
      const userInvoices = await Invoice.find({ userId: req.user._id }).select('_id');
      const invoiceIds = userInvoices.map((i) => i._id);
      query = { invoiceId: { $in: invoiceIds } };
    }

    const bills = await EwayBill.find(query).populate('invoiceId').sort({ createdAt: -1 });
    res.json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single E-Way Bill details
// @route   GET /api/eway-bills/:id
// @access  Private
export const getEwayBillById = async (req, res) => {
  try {
    const ewayBill = await EwayBill.findById(req.params.id).populate({
      path: 'invoiceId',
      populate: { path: 'userId' },
    });

    if (!ewayBill) {
      return res.status(404).json({ success: false, message: 'E-Way bill not found' });
    }

    // Tenant check if customer
    if (req.user.role !== 'admin') {
      if (ewayBill.invoiceId?.userId?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this document' });
      }
    }

    res.json({ success: true, ewayBill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Official GST E-Way Bill PDF
// @route   GET /api/eway-bills/:id/pdf
// @access  Private
export const downloadEwayBillPdf = async (req, res) => {
  try {
    const ewayBill = await EwayBill.findById(req.params.id).populate({
      path: 'invoiceId',
      populate: { path: 'userId' },
    });

    if (!ewayBill) {
      return res.status(404).json({ success: false, message: 'E-Way bill not found' });
    }

    // Tenant check if customer
    if (req.user.role !== 'admin') {
      if (ewayBill.invoiceId?.userId?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this document' });
      }
    }

    const settings = (await BusinessSettings.findOne()) || {};
    const invoice = ewayBill.invoiceId || {};

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="EwayBill-${ewayBill.ewayBillNumber}.pdf"`);

    generateEwayBillPDF(ewayBill, invoice, settings, res);
  } catch (error) {
    console.error('E-Way Bill PDF generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

