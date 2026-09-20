import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variant: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      sparse: true,
      trim: true,
    },
    hsn: {
      type: String,
      default: '2202',
      trim: true,
    },
    packSize: {
      type: String,
      required: true,
      default: '1 Case = 24 Bottles',
    },
    bottlesPerCase: {
      type: Number,
      default: 24,
    },
    unit: {
      type: String,
      default: 'Case',
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    mrpPerBottle: {
      type: Number,
      min: 0,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 18, // GST %
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      default: 10,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['all', 'custom'],
      default: 'all',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('availableStock').get(function () {
  return Math.max(0, (this.stock || 0) - (this.reservedStock || 0));
});

// Performance Indexes for catalog filtering & stock checking
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ status: 1, stock: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
