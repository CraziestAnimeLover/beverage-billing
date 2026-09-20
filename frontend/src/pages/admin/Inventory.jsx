import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../services/api';
import {
  FiLayers,
  FiAlertTriangle,
  FiTrendingUp,
  FiCheckCircle,
  FiSliders,
  FiRefreshCw,
  FiX,
  FiClock,
} from 'react-icons/fi';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'transactions'
  const [inventory, setInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('DAMAGE');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getInventory({ lowStock: lowStockOnly ? 'true' : 'false' });
      if (res.data.success) {
        setInventory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await inventoryApi.getTransactions();
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, [lowStockOnly]);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;
    setAdjustSubmitting(true);
    try {
      const qtyNum = Number(adjustQty);
      // If DAMAGE, quantity subtracted
      const finalQty = adjustType === 'DAMAGE' ? -Math.abs(qtyNum) : qtyNum;

      await inventoryApi.adjustStock({
        productId: selectedProduct._id,
        type: adjustType,
        quantity: finalQty,
        reason: adjustReason,
      });

      setShowAdjustModal(false);
      setSelectedProduct(null);
      setAdjustQty('');
      setAdjustReason('');
      fetchInventory();
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Warehouse Inventory & Stock</h1>
          <p className="text-sm text-slate-400">
            Real-time physical counts, reserved order stock, available cases, and audit trails.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stock' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Stock Status
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'transactions' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiClock /> Audit Log
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Physical Stock</span>
          <p className="text-2xl font-bold text-white font-['Outfit'] mt-1">
            {inventory?.summary?.totalPhysicalCases || 0} <span className="text-xs font-normal text-slate-400">Cases</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Reserved for Orders</span>
          <p className="text-2xl font-bold text-amber-400 font-['Outfit'] mt-1">
            {inventory?.summary?.totalReservedCases || 0} <span className="text-xs font-normal text-slate-400">Cases</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Available for Sale</span>
          <p className="text-2xl font-bold text-emerald-400 font-['Outfit'] mt-1">
            {inventory?.summary?.totalAvailableCases || 0} <span className="text-xs font-normal text-slate-400">Cases</span>
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Warehouse Valuation</span>
          <p className="text-2xl font-bold text-teal-400 font-['Outfit'] mt-1">
            ₹{(inventory?.summary?.totalStockValuation || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-4">
          {/* Low stock filter chip */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              Show Low Stock SKUs Only ({inventory?.summary?.lowStockCount || 0})
            </label>

            <button
              onClick={fetchInventory}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Stock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">Physical Stock</th>
                    <th className="py-3 px-4 text-center">Reserved</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-right">Cost Value</th>
                    <th className="py-3 px-4 text-center">Health</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        Loading inventory...
                      </td>
                    </tr>
                  ) : inventory?.items?.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No inventory records match filters.
                      </td>
                    </tr>
                  ) : (
                    inventory?.items?.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-xs text-slate-400">
                            {item.brand} • {item.packSize}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-white font-mono">
                          {item.physicalStock} Cases
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-amber-400 font-mono">
                          {item.reservedStock}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block font-bold font-mono px-2 py-0.5 rounded-lg text-sm ${
                              item.availableStock === 0
                                ? 'bg-red-500/20 text-red-400'
                                : item.isLowStock
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {item.availableStock} Cases
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
                          ₹{item.stockValue.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {item.isLowStock ? (
                            <span className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
                              <FiAlertTriangle /> Low Stock
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                              <FiCheckCircle /> Optimal
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setShowAdjustModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                          >
                            <FiSliders className="inline mr-1" /> Adjust
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Transactions Audit Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-['Outfit']">Audit Trail & Movement History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-center">Action Type</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-center">Before / After</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN')}{' '}
                        {new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{tx.productId?.name || 'Beverage Product'}</div>
                        <div className="text-xs text-slate-400">{tx.productId?.packSize}</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            tx.type === 'PURCHASE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tx.type === 'SALE'
                              ? 'bg-blue-500/20 text-blue-400'
                              : tx.type === 'RESERVATION'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-4 text-center font-bold font-mono ${
                          tx.quantity > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                        {tx.previousStock} ➔ {tx.newStock}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-300">
                        <div>{tx.reason || '-'}</div>
                        {tx.referenceNumber && (
                          <span className="text-[10px] text-indigo-400 font-mono">Ref: {tx.referenceNumber}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Manual Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-xs text-slate-400">Product</p>
                <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
                <p className="text-xs text-emerald-400 mt-1">Current Physical Stock: {selectedProduct.physicalStock} Cases</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                >
                  <option value="DAMAGE">Breakage / Damage (Subtract)</option>
                  <option value="RETURN">Customer Return (Add)</option>
                  <option value="ADJUSTMENT">Physical Audit Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity (Cases) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bottle broken during warehouse transit"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  {adjustSubmitting ? 'Adjusting...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
