import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'Fuel',
        'Transport',
        'Warehouse',
        'Electricity',
        'Salary',
        'Loading',
        'Unloading',
        'Repair',
        'Other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer'],
      default: 'cash',
    },
    vendor: {
      type: String,
      default: '',
      trim: true,
    },
    billNumber: {
      type: String,
      default: '',
      trim: true,
    },
    vehicleNumber: {
      type: String,
      default: '',
      trim: true,
    },
    liters: {
      type: String,
      default: '',
      trim: true,
    },
    billImage: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
