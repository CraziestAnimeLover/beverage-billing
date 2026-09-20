import mongoose from 'mongoose';

const ewayBillSchema = new mongoose.Schema(
  {
    ewayBillNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    supplierGstin: {
      type: String,
      required: true,
      trim: true,
    },
    customerGstin: {
      type: String,
      default: 'URP', // Unregistered Person / Consumer or GSTIN
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    transporter: {
      type: String,
      default: 'Self / Direct Logistics',
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    transportMode: {
      type: String,
      enum: ['Road', 'Rail', 'Air', 'Ship'],
      default: 'Road',
    },
    distanceKm: {
      type: Number,
      default: 25,
      min: 1,
    },
    fromPlace: {
      type: String,
      default: 'Dealer Central Warehouse',
    },
    toPlace: {
      type: String,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const EwayBill = mongoose.model('EwayBill', ewayBillSchema);
export default EwayBill;
