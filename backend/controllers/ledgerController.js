import CustomerLedger from '../models/CustomerLedger.js';
import User from '../models/User.js';

// @desc    Get customer ledger entries (Admin views any user; User views only their own)
// @route   GET /api/ledger
// @access  Private
export const getCustomerLedger = async (req, res) => {
  try {
    let targetUserId;

    if (req.user.role === 'admin') {
      targetUserId = req.query.userId;
      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'Please provide customer userId' });
      }
    } else {
      // Customer can ONLY see their own ledger
      targetUserId = req.user._id;
    }

    const customer = await User.findById(targetUserId).select(
      'name businessName mobile gstin creditLimit paymentTerms outstandingBalance'
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const entries = await CustomerLedger.find({ userId: targetUserId }).sort({ date: 1, createdAt: 1 });

    // Financial totals
    const totalDebit = entries.reduce((acc, curr) => acc + (curr.debit || 0), 0);
    const totalCredit = entries.reduce((acc, curr) => acc + (curr.credit || 0), 0);
    const calculatedBalance = totalDebit - totalCredit;

    const availableCredit = Math.max(0, (customer.creditLimit || 0) - (customer.outstandingBalance || 0));

    res.json({
      success: true,
      customer,
      summary: {
        totalDebit,
        totalCredit,
        outstandingBalance: customer.outstandingBalance,
        creditLimit: customer.creditLimit,
        availableCredit,
      },
      entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
