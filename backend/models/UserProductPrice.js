import mongoose from 'mongoose';

const userProductPriceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    customPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one price record per user per product
userProductPriceSchema.index({ userId: 1, productId: 1 }, { unique: true });

const UserProductPrice = mongoose.model('UserProductPrice', userProductPriceSchema);
export default UserProductPrice;
