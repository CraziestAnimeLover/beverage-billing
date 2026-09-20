import Expense from '../models/Expense.js';

// @desc    Get all recorded expenses
// @route   GET /api/expenses
// @access  Private/Admin
export const getExpenses = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;

    const expenses = await Expense.find(query).sort({ date: -1 });
    const totalAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({ success: true, count: expenses.length, totalAmount, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record new business expense
// @route   POST /api/expenses
// @access  Private/Admin
export const createExpense = async (req, res) => {
  try {
    const {
      category,
      title,
      amount,
      date,
      paymentMethod,
      notes,
      vendor,
      billNumber,
      vehicleNumber,
      liters,
      billImage,
    } = req.body;

    if (!category || !title || !amount) {
      return res.status(400).json({ success: false, message: 'Category, title, and amount are required' });
    }

    const expense = new Expense({
      category,
      title,
      amount: Number(amount),
      date: date || new Date(),
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      vendor: vendor || '',
      billNumber: billNumber || '',
      vehicleNumber: vehicleNumber || '',
      liters: liters || '',
      billImage: billImage || '',
      createdBy: req.user._id,
    });

    await expense.save();

    res.status(201).json({ success: true, message: 'Expense recorded successfully', expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
export const deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
