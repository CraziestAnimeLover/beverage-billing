import React, { useState, useEffect } from 'react';
import { purchaseApi, productApi } from '../../services/api';
import { FiTruck, FiPlus, FiX, FiCheck, FiLayers } from 'react-icons/fi';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [supplierName, setSupplierName] = useState('Hindustan Coca-Cola Beverages Pvt Ltd');
  const [supplierGstin, setSupplierGstin] = useState('06AAACH2244P1Z3');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 50, unitCost: 760, taxRate: 18 },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purRes, prodRes] = await Promise.all([
        purchaseApi.getPurchases(),
        productApi.getProducts(),
      ]);
      if (purRes.data.success) setPurchases(purRes.data.purchases);
      if (prodRes.data.success) setProducts(prodRes.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { productId: '', quantity: 20, unitCost: 750, taxRate: 18 }]);
  };

  const handleRemoveItemRow = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // If selecting product, auto-fill unitCost with current purchasePrice
    if (field === 'productId') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        updated[index].unitCost = prod.purchasePrice || 750;
        updated[index].taxRate = prod.taxRate || 18;
      }
    }
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitCost) || 0), 0);
  };

  const calculateTax = () => {
    return items.reduce((acc, curr) => {
      const line = (Number(curr.quantity) || 0) * (Number(curr.unitCost) || 0);
      return acc + (line * (Number(curr.taxRate) || 18)) / 100;
    }, 0);
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (items.some((i) => !i.productId)) {
      alert('Please select a beverage product for every item row');
      return;
    }
    setSubmitting(true);
    try {
      await purchaseApi.createPurchase({
        supplierName,
        supplierGstin,
        supplierInvoiceNo,
        items,
        notes,
      });
      setShowModal(false);
      fetchData();
      alert('Purchase recorded! Physical stock has been auto-replenished.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording purchase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Supplier Purchases (Inward Stock)</h1>
          <p className="text-sm text-slate-400">
            Record stock replenishment from beverage manufacturers. Automatically increments warehouse physical inventory.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <FiPlus className="text-lg" /> Inward New Stock
        </button>
      </div>

      {/* Purchases List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier & GSTIN</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4 text-right">Taxable</th>
                <th className="py-3 px-4 text-right">Total (Incl GST)</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading purchases...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No supplier purchases recorded yet.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {p.purchaseNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.supplierName}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {p.supplierGstin ? `GST: ${p.supplierGstin}` : 'Inv: ' + (p.supplierInvoiceNo || '-')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {p.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.quantity} Cases • {item.name}
                        </div>
                      ))}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
                      ₹{(p.subtotal || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{(p.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                      {new Date(p.purchaseDate).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Record Inward Stock Procurement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Supplier / Distributor *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Supplier GSTIN</label>
                  <input
                    type="text"
                    value={supplierGstin}
                    onChange={(e) => setSupplierGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Manufacturer Invoice Ref No</label>
                <input
                  type="text"
                  value={supplierInvoiceNo}
                  onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                  placeholder="e.g. HCCB/2026/09/8812"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Purchased SKUs (Cases)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40 items-center">
                    <div className="col-span-5">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
                      >
                        <option value="">Select Beverage SKU</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.packSize})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cases"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono text-center focus:outline-none"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate ₹"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono text-right focus:outline-none"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-red-400 hover:text-red-300 text-xs px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>GST Tax Amount:</span>
                  <span className="font-mono">₹{calculateTax().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-700">
                  <span>Total Procurement Cost:</span>
                  <span className="text-emerald-400 font-mono">
                    ₹{(calculateSubtotal() + calculateTax()).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  {submitting ? 'Updating Inventory...' : 'Confirm Inward Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
