import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import { getOutstandingReminderMessage } from '../utils/whatsappHelper.js';
import BusinessSettings from '../models/BusinessSettings.js';

// @desc    Get Admin Dashboard KPI metrics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Today's Sales (Invoices generated today)
    const todayInvoices = await Invoice.find({ invoiceDate: { $gte: today } });
    const todaySales = todayInvoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // 2. Today's Orders
    const todayOrdersCount = await Order.countDocuments({ createdAt: { $gte: today } });

    // 3. Today's Payments Collected
    const todayPayments = await Payment.find({ paymentDate: { $gte: today } });
    const todayCollection = todayPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 4. Monthly Sales & Collection
    const monthInvoices = await Invoice.find({ invoiceDate: { $gte: firstDayOfMonth } });
    const monthlySales = monthInvoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const monthPayments = await Payment.find({ paymentDate: { $gte: firstDayOfMonth } });
    const monthlyCollection = monthPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 5. Total Receivables (Outstanding)
    const customers = await User.find({ role: 'user' });
    const totalReceivable = customers.reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0);
    const totalUsers = customers.length;

    // 6. Products & Stock Value
    const products = await Product.find({ status: 'active' });
    let stockValuation = 0;
    let lowStockCount = 0;

    products.forEach((p) => {
      const avail = Math.max(0, (p.stock || 0) - (p.reservedStock || 0));
      stockValuation += (p.stock || 0) * (p.purchasePrice || 0);
      if (avail <= (p.minimumStock || 10)) {
        lowStockCount++;
      }
    });

    // 7. Unpaid Invoices & Pending Orders
    const unpaidInvoicesCount = await Invoice.countDocuments({
      status: { $in: ['generated', 'sent', 'partially_paid', 'overdue'] },
    });
    const pendingOrdersCount = await Order.countDocuments({ status: 'pending' });

    // 8. Recent Orders
    const recentOrders = await Order.find()
      .populate('userId', 'name businessName mobile')
      .sort({ createdAt: -1 })
      .limit(6);

    // 9. Recent Invoices
    const recentInvoices = await Invoice.find()
      .populate('userId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        todaySales,
        todayOrders: todayOrdersCount,
        todayCollection,
        monthlySales,
        monthlyCollection,
        totalReceivable,
        stockValuation,
        totalUsers,
        totalProducts: products.length,
        lowStockCount,
        unpaidInvoicesCount,
        pendingOrdersCount,
      },
      recentOrders,
      recentInvoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Sales Reports (Daily, Monthly, User-wise, Product-wise)
// @route   GET /api/reports/sales
// @access  Private/Admin
export const getSalesReports = async (req, res) => {
  try {
    const { timeframe = 'monthly' } = req.query;

    // User-wise sales aggregation
    const userSales = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$userId',
          totalAmount: { $sum: '$totalAmount' },
          invoiceCount: { $sum: 1 },
          paidAmount: { $sum: '$paidAmount' },
          balanceAmount: { $sum: '$balanceAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userName: '$user.name',
          businessName: '$user.businessName',
          mobile: '$user.mobile',
          totalAmount: 1,
          invoiceCount: 1,
          paidAmount: 1,
          balanceAmount: 1,
        },
      },
    ]);

    // Product-wise sales aggregation
    const productSales = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          brand: { $first: '$items.brand' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.amount' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Monthly revenue trend (Last 6 months)
    const monthlyTrend = await Invoice.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
          },
          revenue: { $sum: '$totalAmount' },
          invoicesCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      userSales,
      productSales,
      monthlyTrend,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Outstanding Report with 1-click WhatsApp reminder
// @route   GET /api/reports/outstanding
// @access  Private/Admin
export const getOutstandingReport = async (req, res) => {
  try {
    const settings = (await BusinessSettings.findOne()) || {};
    const customers = await User.find({ role: 'user', outstandingBalance: { $gt: 0 } })
      .sort({ outstandingBalance: -1 })
      .select('name businessName mobile whatsapp gstin creditLimit paymentTerms outstandingBalance');

    const totalOutstanding = customers.reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0);

    const formattedCustomers = customers.map((c) => {
      const wa = getOutstandingReminderMessage({ customer: c, settings });
      const creditUtilization = c.creditLimit > 0 ? ((c.outstandingBalance / c.creditLimit) * 100).toFixed(1) : '100';

      return {
        _id: c._id,
        name: c.name,
        businessName: c.businessName,
        mobile: c.mobile,
        whatsapp: c.whatsapp,
        outstandingBalance: c.outstandingBalance,
        creditLimit: c.creditLimit,
        creditUtilization: Number(creditUtilization),
        isOverLimit: c.outstandingBalance > c.creditLimit,
        paymentTerms: c.paymentTerms,
        whatsappUrl: wa.url,
      };
    });

    res.json({
      success: true,
      totalOutstanding,
      count: customers.length,
      customers: formattedCustomers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Estimated Profit & Loss Report
// @route   GET /api/reports/profit
// @access  Private/Admin
export const getProfitReport = async (req, res) => {
  try {
    // 1. Total Sales Revenue (from active Invoices)
    const invoices = await Invoice.find({ status: { $ne: 'cancelled' } });
    const totalSales = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // 2. Cost of Goods Sold (COGS calculated in O(1) via batch product lookup)
    const products = await Product.find().select('_id purchasePrice').lean();
    const productCostMap = new Map();
    products.forEach((p) => productCostMap.set(p._id.toString(), p.purchasePrice || 0));

    let totalCogs = 0;
    for (const inv of invoices) {
      if (inv.items) {
        for (const item of inv.items) {
          const pId = item.productId?.toString();
          const costPerCase = pId && productCostMap.has(pId) ? productCostMap.get(pId) : item.rate * 0.85;
          totalCogs += (item.quantity || 1) * costPerCase;
        }
      }
    }

    const grossProfit = Math.max(0, totalSales - totalCogs);

    // 3. Operational Expenses
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 4. Net Profit Estimate
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(2) : 0;

    // Expenses breakdown by category
    const expenseBreakdown = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      profitData: {
        totalSales,
        totalCogs,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin: Number(profitMargin),
        disclaimer:
          'This is an internal operational estimate calculated as (Total Sales Revenue - Cost of Goods Sold - Recorded Expenses) and does not constitute statutory accounting advice.',
      },
      expenseBreakdown,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
