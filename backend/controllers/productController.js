import Product from '../models/Product.js';
import UserProductPrice from '../models/UserProductPrice.js';

// @desc    Get products list (Admin sees all details; User sees assigned prices)
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { category, brand, search, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    // Role-specific product retrieval
    if (req.user.role === 'admin') {
      if (status) query.status = status;
      const products = await Product.find(query).sort({ category: 1, name: 1 });
      return res.json({ success: true, count: products.length, products });
    }

    // User / Customer view:
    query.status = 'active';

    const rawProducts = await Product.find(query).sort({ category: 1, name: 1 }).lean();

    // Fetch user-specific prices
    const userPrices = await UserProductPrice.find({
      userId: req.user._id,
      status: 'active',
    }).lean();

    const priceMap = new Map();
    userPrices.forEach((up) => {
      priceMap.set(up.productId.toString(), up.customPrice);
    });

    // Map products with assigned rate
    const customerProducts = rawProducts.map((p) => {
      const pId = p._id.toString();
      const hasCustomPrice = priceMap.has(pId);
      const effectivePrice = hasCustomPrice ? priceMap.get(pId) : p.sellingPrice;

      return {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        variant: p.variant,
        sku: p.sku,
        hsn: p.hsn,
        packSize: p.packSize,
        bottlesPerCase: p.bottlesPerCase,
        unit: p.unit,
        mrp: p.mrp,
        mrpPerBottle: p.mrpPerBottle,
        sellingPrice: effectivePrice, // User's assigned price
        standardPrice: p.sellingPrice,
        isCustomPrice: hasCustomPrice,
        taxRate: p.taxRate,
        stock: p.stock,
        availableStock: Math.max(0, (p.stock || 0) - (p.reservedStock || 0)),
        inStock: Math.max(0, (p.stock || 0) - (p.reservedStock || 0)) > 0,
        image: p.image,
      };
    });

    res.json({ success: true, count: customerProducts.length, products: customerProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'admin') {
      const customPrices = await UserProductPrice.find({ productId: product._id })
        .populate('userId', 'businessName name mobile')
        .lean();
      return res.json({ success: true, product, customPrices });
    }

    // User view
    const userPrice = await UserProductPrice.findOne({
      userId: req.user._id,
      productId: product._id,
      status: 'active',
    });

    const effectivePrice = userPrice ? userPrice.customPrice : product.sellingPrice;

    res.json({
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        variant: product.variant,
        sku: product.sku,
        hsn: product.hsn,
        packSize: product.packSize,
        unit: product.unit,
        mrp: product.mrp,
        sellingPrice: effectivePrice,
        taxRate: product.taxRate,
        availableStock: Math.max(0, (product.stock || 0) - (product.reservedStock || 0)),
        image: product.image,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      variant,
      sku,
      barcode,
      hsn,
      packSize,
      bottlesPerCase,
      unit,
      mrp,
      mrpPerBottle,
      purchasePrice,
      sellingPrice,
      taxRate,
      stock = 0,
      minimumStock = 10,
      image,
      status = 'active',
    } = req.body;

    const product = new Product({
      name,
      brand,
      category,
      variant,
      sku: sku || `${brand.substring(0, 2).toUpperCase()}-${variant}-${Date.now().toString().slice(-4)}`,
      barcode,
      hsn: hsn || '2202',
      packSize: packSize || '1 Case = 24 Bottles',
      bottlesPerCase: bottlesPerCase || 24,
      unit: unit || 'Case',
      mrp: Number(mrp),
      mrpPerBottle: mrpPerBottle ? Number(mrpPerBottle) : Number(mrp) / (bottlesPerCase || 24),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      taxRate: Number(taxRate || 18),
      stock: Number(stock),
      minimumStock: Number(minimumStock),
      image,
      status,
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set or update customer-specific price (Admin)
// @route   POST /api/products/custom-price
// @access  Private/Admin
export const setCustomPrice = async (req, res) => {
  try {
    const { userId, productId, customPrice } = req.body;

    if (!userId || !productId || customPrice === undefined) {
      return res.status(400).json({ success: false, message: 'UserId, productId, and customPrice are required' });
    }

    const priceRecord = await UserProductPrice.findOneAndUpdate(
      { userId, productId },
      { customPrice: Number(customPrice), status: 'active', effectiveFrom: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Customer price updated successfully', priceRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete custom price (reverts to standard)
// @route   DELETE /api/products/custom-price/:id
// @access  Private/Admin
export const deleteCustomPrice = async (req, res) => {
  try {
    await UserProductPrice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Custom price removed. User will get standard dealer price.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product categories and brands
// @route   GET /api/products/meta/categories
// @access  Private
export const getProductMeta = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    res.json({ success: true, categories, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
