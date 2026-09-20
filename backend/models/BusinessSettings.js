import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      default: 'TOTA RAM TRADERS - FARIDABAD',
    },
    ownerName: {
      type: String,
      default: 'Tota Ram',
    },
    logo: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: 'Shop No 1040, Block - C, 27 Feet Road, Dabua Colony',
    },
    city: {
      type: String,
      default: 'Faridabad',
    },
    state: {
      type: String,
      default: 'Haryana',
    },
    pincode: {
      type: String,
      default: '121001',
    },
    mobile: {
      type: String,
      default: '+91 90150 88766',
    },
    whatsapp: {
      type: String,
      default: '919015088766',
    },
    email: {
      type: String,
      default: 'totaramtraders@gmail.com',
    },
    gstin: {
      type: String,
      default: '06AZHPK1822E1ZR',
    },
    pan: {
      type: String,
      default: 'AZHPK1822E',
    },
    bankName: {
      type: String,
      default: 'HDFC Bank Ltd',
    },
    accountNumber: {
      type: String,
      default: '50200012345678',
    },
    ifscCode: {
      type: String,
      default: 'HDFC0001234',
    },
    branch: {
      type: String,
      default: 'Faridabad',
    },
    upiId: {
      type: String,
      default: 'totaramtraders@hdfcbank',
    },
    invoicePrefix: {
      type: String,
      default: 'INV-2026-',
    },
    orderPrefix: {
      type: String,
      default: 'ORD-2026-',
    },
    invoiceTerms: {
      type: String,
      default:
        '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within stipulated time.\n3. Subject to Haryana jurisdiction only.',
    },
    invoiceFooter: {
      type: String,
      default: 'Thank you for your business! For queries contact TOTA RAM TRADERS - FARIDABAD.',
    },
  },
  {
    timestamps: true,
  }
);

const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);
export default BusinessSettings;
