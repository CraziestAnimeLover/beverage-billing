import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ purchaseDate: -1 });
    res.json({ success: true, count: purchases.length, purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record new purchase from manufacturer / distributor
// @route   POST /api/purchases
// @access  Private/Admin
export const createPurchase = async (req, res) => {
  try {
    const { supplierName, supplierGstin, supplierInvoiceNo, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one purchase item' });
    }

    // Generate purchase number
    const count = await Purchase.countDocuments();
    const purchaseNumber = `PO-2026-${String(count + 1).padStart(5, '0')}`;

    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    // Process items and update stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const qty = Number(item.quantity);
      const cost = Number(item.unitCost);
      const taxRate = Number(item.taxRate || product.taxRate || 18);
      const lineSubtotal = qty * cost;
      const lineTax = (lineSubtotal * taxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxAmount += lineTax;

      processedItems.push({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        packSize: product.packSize,
        quantity: qty,
        unitCost: cost,
        taxRate,
        taxAmount: lineTax,
        total: lineTotal,
      });

      // Update physical stock
      const previousStock = product.stock;
      product.stock = previousStock + qty;
      product.purchasePrice = cost; // Update latest purchase cost
      await product.save();

      // Record inventory transaction
      await InventoryTransaction.create({
        productId: product._id,
        type: 'PURCHASE',
        quantity: qty,
        previousStock,
        newStock: product.stock,
        referenceNumber: purchaseNumber,
        reason: `Procurement from ${supplierName}`,
        createdBy: req.user._id,
      });
    }

    const totalAmount = subtotal + taxAmount;

    const purchase = new Purchase({
      purchaseNumber,
      supplierName,
      supplierGstin,
      supplierInvoiceNo,
      items: processedItems,
      subtotal,
      taxAmount,
      totalAmount,
      notes,
    });

    await purchase.save();

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and stock replenished successfully',
      purchase,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
