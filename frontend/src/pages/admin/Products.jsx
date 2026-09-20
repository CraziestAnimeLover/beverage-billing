import React, { useState, useEffect } from 'react';
import { productApi, userApi } from '../../services/api';
import {
  FiPackage,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiEdit,
  FiTrash2,
  FiX,
  FiCheck,
  FiTag,
  FiLayers,
} from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add/Edit Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Custom Pricing Modal
  const [pricingModalProduct, setPricingModalProduct] = useState(null);
  const [productCustomPrices, setProductCustomPrices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customPriceVal, setCustomPriceVal] = useState('');
  const [pricingLoading, setPricingLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Coca Cola',
    category: 'Soft Drinks',
    variant: '750ml Pet Bottle',
    sku: '',
    barcode: '',
    hsn: '2202',
    packSize: '1 Case = 24 Bottles',
    bottlesPerCase: 24,
    unit: 'Case',
    mrp: 960,
    mrpPerBottle: 40,
    purchasePrice: 760,
    sellingPrice: 850,
    taxRate: 18,
    stock: 100,
    minimumStock: 20,
    status: 'active',
  });

  const fetchProducts = async () => {
    try {
      const res = await productApi.getProducts({ search, category: categoryFilter });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await userApi.getUsers({ role: 'user' });
      if (res.data.success) {
        setCustomers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, [search, categoryFilter]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct._id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const openPricingModal = async (product) => {
    setPricingModalProduct(product);
    setPricingLoading(true);
    try {
      const res = await productApi.getProductById(product._id);
      if (res.data.success) {
        setProductCustomPrices(res.data.customPrices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleSetCustomPrice = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !customPriceVal) return;
    try {
      await productApi.setCustomPrice({
        userId: selectedCustomerId,
        productId: pricingModalProduct._id,
        customPrice: Number(customPriceVal),
      });
      // Refresh custom prices
      const res = await productApi.getProductById(pricingModalProduct._id);
      setProductCustomPrices(res.data.customPrices || []);
      setSelectedCustomerId('');
      setCustomPriceVal('');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating custom price');
    }
  };

  const handleDeleteCustomPrice = async (priceId) => {
    try {
      await productApi.deleteCustomPrice(priceId);
      const res = await productApi.getProductById(pricingModalProduct._id);
      setProductCustomPrices(res.data.customPrices || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing price');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Products & Pricing Catalog</h1>
          <p className="text-sm text-slate-400">
            Beverage inventory catalog, standard MRP, purchase rates, and customer-specific pricing.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              brand: 'Coca Cola',
              category: 'Soft Drinks',
              variant: '750ml Pet Bottle',
              sku: '',
              barcode: '',
              hsn: '2202',
              packSize: '1 Case = 24 Bottles',
              bottlesPerCase: 24,
              unit: 'Case',
              mrp: 960,
              mrpPerBottle: 40,
              purchasePrice: 760,
              sellingPrice: 850,
              taxRate: 18,
              stock: 100,
              minimumStock: 20,
              status: 'active',
            });
            setShowProductModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <FiPlus className="text-lg" /> Add Product SKU
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="sm:col-span-2 flex items-center gap-3">
          <FiSearch className="text-slate-500 text-lg ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, brand, SKU..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="Soft Drinks">Soft Drinks</option>
          <option value="Juice">Juice</option>
          <option value="Water">Water</option>
          <option value="Energy Drinks">Energy Drinks</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Beverage Product</th>
                <th className="py-3 px-4">Pack / Unit</th>
                <th className="py-3 px-4 text-right">MRP (Case)</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Dealer Selling Rate</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const avail = Math.max(0, (p.stock || 0) - (p.reservedStock || 0));
                  const isLow = avail <= (p.minimumStock || 10);
                  const margin = p.sellingPrice - p.purchasePrice;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-xs text-indigo-400">
                          {p.brand} • {p.category}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          SKU: {p.sku || '-'} | HSN: {p.hsn || '2202'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        <div>{p.packSize}</div>
                        <div className="text-slate-500">Unit: {p.unit}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-xs">
                        ₹{(p.mrp || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-xs">
                        ₹{(p.purchasePrice || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-white font-mono">
                          ₹{(p.sellingPrice || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          +₹{margin} margin/case
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-white">{avail} Cases</div>
                        {p.reservedStock > 0 && (
                          <div className="text-[10px] text-amber-400">
                            ({p.reservedStock} reserved)
                          </div>
                        )}
                        {isLow && (
                          <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-semibold">
                            Low Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* User Pricing Matrix Modal Button */}
                          <button
                            onClick={() => openPricingModal(p)}
                            title="Manage Customer-Specific Pricing Matrix"
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1 transition"
                          >
                            <FiTag /> Customer Rates
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setFormData({
                                ...p,
                              });
                              setShowProductModal(true);
                            }}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            <FiEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer-Specific Pricing Modal */}
      {pricingModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Customer-Specific Pricing Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Product: <strong className="text-white">{pricingModalProduct.name}</strong> • Standard Rate:{' '}
                  <strong className="text-emerald-400 font-mono">₹{pricingModalProduct.sellingPrice} / Case</strong>
                </p>
              </div>
              <button
                onClick={() => setPricingModalProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Set New Customer Rate Form */}
            <form onSubmit={handleSetCustomPrice} className="mt-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Assign Custom Rate to Customer
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Select Customer Shop</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.businessName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Custom Rate (₹/Case)</label>
                  <input
                    type="number"
                    required
                    value={customPriceVal}
                    onChange={(e) => setCustomPriceVal(e.target.value)}
                    placeholder="e.g. 830"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                >
                  Save Custom Rate
                </button>
              </div>
            </form>

            {/* Existing Custom Rates List */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Active Customer Custom Rates ({productCustomPrices.length})
              </h4>

              {pricingLoading ? (
                <p className="text-xs text-slate-500">Loading custom rates...</p>
              ) : productCustomPrices.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center bg-slate-800/30 rounded-xl">
                  No custom rates assigned yet. All customers purchase at standard ₹{pricingModalProduct.sellingPrice}.
                </p>
              ) : (
                <div className="space-y-2">
                  {productCustomPrices.map((cp) => (
                    <div
                      key={cp._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {cp.userId?.businessName || cp.userId?.name || 'Customer'}
                        </p>
                        <p className="text-xs text-slate-400">Mobile: {cp.userId?.mobile}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-emerald-400">
                            ₹{cp.customPrice} / Case
                          </span>
                          <p className="text-[10px] text-slate-400">
                            (Discount ₹{pricingModalProduct.sellingPrice - cp.customPrice})
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteCustomPrice(cp._id)}
                          title="Remove custom rate"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product SKU Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                {editingProduct ? 'Edit Product SKU' : 'Add New Beverage Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Coca Cola 750ml"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Coca Cola, PepsiCo, Bisleri"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="Soft Drinks">Soft Drinks</option>
                    <option value="Juice">Juice</option>
                    <option value="Water">Water</option>
                    <option value="Energy Drinks">Energy Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Variant</label>
                  <input
                    type="text"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    placeholder="750ml Pet Bottle"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={formData.hsn}
                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                    placeholder="2202"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pack Size Description</label>
                  <input
                    type="text"
                    value={formData.packSize}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="1 Case = 24 Bottles"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bottles per Case</label>
                  <input
                    type="number"
                    value={formData.bottlesPerCase}
                    onChange={(e) => setFormData({ ...formData, bottlesPerCase: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">MRP / Case (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Purchase Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Selling Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock (Cases)</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
