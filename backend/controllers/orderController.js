import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import UserProductPrice from '../models/UserProductPrice.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

// @desc    Create new order (Customer)
// @route   POST /api/orders
// @access  Private (User)
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
    }

    const customer = await User.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Fetch custom pricing assigned to this customer
    const userPrices = await UserProductPrice.find({
      userId: customer._id,
      status: 'active',
    }).lean();

    const priceMap = new Map();
    userPrices.forEach((p) => priceMap.set(p.productId.toString(), p.customPrice));

    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name || 'item'} is currently unavailable`,
        });
      }

      const available = Math.max(0, (product.stock || 0) - (product.reservedStock || 0));
      const requestedQty = Number(item.quantity);

      if (requestedQty > available) {
        return res.status(400).json({
          success: false,
          message: `Insufficient available stock for ${product.name}. Available: ${available} Cases`,
        });
      }

      // Determine price (custom or standard)
      const pId = product._id.toString();
      const unitPrice = priceMap.has(pId) ? priceMap.get(pId) : product.sellingPrice;
      const itemTaxRate = Number(product.taxRate || 18);

      const lineSubtotal = requestedQty * unitPrice;
      const lineTax = (lineSubtotal * itemTaxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxAmount += lineTax;

      processedItems.push({
        productId: product._id,
        name: product.name,
        brand: product.brand,
        variant: product.variant,
        packSize: product.packSize,
        unit: product.unit,
        quantity: requestedQty,
        unitPrice,
        mrp: product.mrp,
        taxRate: itemTaxRate,
        itemTotal: lineTotal,
      });
    }

    const totalAmount = subtotal + taxAmount;

    // Check Credit Limit
    const currentOutstanding = customer.outstandingBalance || 0;
    const creditLimit = customer.creditLimit || 50000;
    const creditLimitExceeded = currentOutstanding + totalAmount > creditLimit;

    // Generate Order Number
    const count = await Order.countDocuments();
    const orderNumber = `ORD-2026-${String(count + 1).padStart(5, '0')}`;

    const order = new Order({
      orderNumber,
      userId: customer._id,
      items: processedItems,
      subtotal,
      taxAmount,
      totalAmount,
      deliveryAddress: deliveryAddress || customer.address,
      notes: notes || '',
      creditLimitExceeded,
      status: 'pending',
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: creditLimitExceeded
        ? 'Order placed successfully! Note: Order total exceeds current credit limit and requires dealer approval.'
        : 'Order placed successfully!',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders (Admin views all; User views only their own)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    // Critical tenant isolation rule:
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name businessName mobile gstin address city creditLimit outstandingBalance')
      .populate('invoiceId', 'invoiceNumber totalAmount status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const query = { _id: req.params.id };

    // Strict multi-tenant security
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'name businessName mobile whatsapp gstin address city state creditLimit outstandingBalance')
      .populate('invoiceId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.status;

    // Transition 1: 'pending' -> 'confirmed' (Reserves Stock)
    if (prevStatus === 'pending' && status === 'confirmed') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.reservedStock = (product.reservedStock || 0) + item.quantity;
          await product.save();

          await InventoryTransaction.create({
            productId: product._id,
            type: 'RESERVATION',
            quantity: item.quantity,
            previousStock: product.stock,
            newStock: product.stock,
            referenceNumber: order.orderNumber,
            reason: `Stock reserved for confirmed order ${order.orderNumber}`,
            createdBy: req.user._id,
          });
        }
      }
    }

    // Transition 2: From confirmed/ready -> 'dispatched' (Fulfills stock: deducts physical stock and clears reservation)
    if (['confirmed', 'processing', 'ready'].includes(prevStatus) && status === 'dispatched') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prevStock = product.stock;
          product.stock = Math.max(0, product.stock - item.quantity);
          product.reservedStock = Math.max(0, (product.reservedStock || 0) - item.quantity);
          await product.save();

          await InventoryTransaction.create({
            productId: product._id,
            type: 'SALE',
            quantity: -item.quantity,
            previousStock: prevStock,
            newStock: product.stock,
            referenceNumber: order.orderNumber,
            reason: `Order dispatched ${order.orderNumber}`,
            createdBy: req.user._id,
          });
        }
      }
    }

    // Transition 3: Direct dispatch from pending (deducts stock directly)
    if (prevStatus === 'pending' && status === 'dispatched') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prevStock = product.stock;
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();

          await InventoryTransaction.create({
            productId: product._id,
            type: 'SALE',
            quantity: -item.quantity,
            previousStock: prevStock,
            newStock: product.stock,
            referenceNumber: order.orderNumber,
            reason: `Order dispatched directly ${order.orderNumber}`,
            createdBy: req.user._id,
          });
        }
      }
    }

    // Transition 4: Cancellation/Rejection after stock was reserved
    if (['confirmed', 'processing', 'ready'].includes(prevStatus) && ['cancelled', 'rejected'].includes(status)) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.reservedStock = Math.max(0, (product.reservedStock || 0) - item.quantity);
          await product.save();

          await InventoryTransaction.create({
            productId: product._id,
            type: 'RELEASE',
            quantity: -item.quantity,
            previousStock: product.stock,
            newStock: product.stock,
            referenceNumber: order.orderNumber,
            reason: `Reservation released on order ${status}`,
            createdBy: req.user._id,
          });
        }
      }
    }

    order.status = status;
    if (notes) order.notes = notes;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
