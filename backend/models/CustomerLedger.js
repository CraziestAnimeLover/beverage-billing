import mongoose from 'mongoose';

const customerLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['OPENING', 'INVOICE', 'PAYMENT', 'RETURN', 'ADJUSTMENT'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    debit: {
      type: Number,
      default: 0,
      min: 0,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
    runningBalance: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

customerLedgerSchema.index({ userId: 1, date: 1, createdAt: 1 });

const CustomerLedger = mongoose.model('CustomerLedger', customerLedgerSchema);
export default CustomerLedger;
