import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

// @desc    Get current inventory status with stock health
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const query = { status: 'active' };

    if (category) query.category = category;

    const products = await Product.find(query).sort({ stock: 1 });

    const inventoryData = products.map((p) => {
      const available = Math.max(0, (p.stock || 0) - (p.reservedStock || 0));
      const isLow = available <= (p.minimumStock || 10);
      const stockValue = (p.stock || 0) * (p.purchasePrice || 0);
      const retailValue = (p.stock || 0) * (p.sellingPrice || 0);

      return {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        variant: p.variant,
        packSize: p.packSize,
        unit: p.unit,
        physicalStock: p.stock,
        reservedStock: p.reservedStock,
        availableStock: available,
        minimumStock: p.minimumStock,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stockValue,
        retailValue,
        isLowStock: isLow,
      };
    });

    const filtered = lowStock === 'true' ? inventoryData.filter((i) => i.isLowStock) : inventoryData;

    // Calculate totals
    const totalPhysicalCases = inventoryData.reduce((acc, curr) => acc + curr.physicalStock, 0);
    const totalReservedCases = inventoryData.reduce((acc, curr) => acc + curr.reservedStock, 0);
    const totalAvailableCases = inventoryData.reduce((acc, curr) => acc + curr.availableStock, 0);
    const totalStockValuation = inventoryData.reduce((acc, curr) => acc + curr.stockValue, 0);
    const lowStockCount = inventoryData.filter((i) => i.isLowStock).length;

    res.json({
      success: true,
      summary: {
        totalPhysicalCases,
        totalReservedCases,
        totalAvailableCases,
        totalStockValuation,
        lowStockCount,
      },
      items: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust inventory (Damage, Manual correction, Stock Out)
// @route   POST /api/inventory/adjust
// @access  Private/Admin
export const adjustStock = async (req, res) => {
  try {
    const { productId, type, quantity, reason } = req.body; // type: DAMAGE, ADJUSTMENT, RETURN

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousStock = product.stock;
    const qtyChange = Number(quantity); // positive adds, negative subtracts

    const newStock = Math.max(0, previousStock + qtyChange);
    product.stock = newStock;
    await product.save();

    const transaction = await InventoryTransaction.create({
      productId: product._id,
      type: type || (qtyChange < 0 ? 'DAMAGE' : 'ADJUSTMENT'),
      quantity: qtyChange,
      previousStock,
      newStock,
      reason: reason || 'Manual inventory adjustment',
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
      },
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory audit transactions log
// @route   GET /api/inventory/transactions
// @access  Private/Admin
export const getInventoryTransactions = async (req, res) => {
  try {
    const { productId, type, limit = 50 } = req.query;
    const query = {};

    if (productId) query.productId = productId;
    if (type) query.type = type;

    const transactions = await InventoryTransaction.find(query)
      .populate('productId', 'name brand variant packSize')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
