import React, { useState, useEffect } from 'react';
import { orderApi, invoiceApi } from '../../services/api';
import {
  FiShoppingBag,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiTruck,
  FiFileText,
  FiAlertTriangle,
  FiX,
  FiMessageCircle,
} from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders({ status: statusFilter });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await orderApi.updateStatus(orderId, { status: newStatus });
      if (res.data.success) {
        fetchOrders();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data.order);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    setActionLoading(true);
    try {
      const res = await invoiceApi.generateInvoice({ orderId });
      if (res.data.success) {
        alert(`Tax Invoice #${res.data.invoice.invoiceNumber} generated! Ledger has been debited.`);
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating invoice');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Sales Orders</h1>
          <p className="text-sm text-slate-400">
            Process incoming retail orders, verify customer credit limits, reserve warehouse stock, and dispatch.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed (Stock Reserved)</option>
            <option value="ready">Ready</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer Shop</th>
                <th className="py-3 px-4 text-center">Items (Cases)</th>
                <th className="py-3 px-4 text-right">Order Total</th>
                <th className="py-3 px-4 text-center">Credit Status</th>
                <th className="py-3 px-4 text-center">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No orders matching filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const totalCases = o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
                  return (
                    <tr key={o._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                        {o.orderNumber}
                        <div className="text-[11px] text-slate-500 font-normal">
                          {new Date(o.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {o.userId?.businessName || o.userId?.name || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-400">📞 {o.userId?.mobile}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-white font-mono">{totalCases}</span> Cases
                        <div className="text-[11px] text-slate-400">({o.items?.length || 0} SKUs)</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {o.creditLimitExceeded ? (
                          <span className="text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <FiAlertTriangle /> Exceeded
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                            Within Limit
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                            o.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : o.status === 'confirmed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : o.status === 'dispatched'
                              ? 'bg-purple-500/20 text-purple-400'
                              : o.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition inline-flex items-center gap-1"
                        >
                          <FiEye /> View / Process
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Processing Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Customer & Credit info banner */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-semibold text-white">
                  {selectedOrder.userId?.businessName || selectedOrder.userId?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Outstanding</span>
                <span className="font-mono font-bold text-amber-400">
                  ₹{(selectedOrder.userId?.outstandingBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Credit Limit</span>
                <span className="font-mono text-slate-300">
                  ₹{(selectedOrder.userId?.creditLimit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Credit Status</span>
                {selectedOrder.creditLimitExceeded ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <FiAlertTriangle /> Exceeded
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Approved</span>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Order Line Items</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Cases</th>
                      <th className="p-2.5 text-right">Assigned Rate</th>
                      <th className="p-2.5 text-right">Tax (18%)</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-2.5">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.packSize}</div>
                        </td>
                        <td className="p-2.5 text-center font-bold text-white font-mono">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-slate-300">₹{item.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono text-slate-400">
                          ₹{((item.quantity * item.unitPrice * (item.taxRate || 18)) / 100).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          ₹{item.itemTotal?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-right">
                <span className="text-xs text-slate-400 mr-2">Grand Total:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Set Status:</span>
                {selectedOrder.status === 'pending' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'confirmed')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                  >
                    Confirm (Reserve Stock)
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'dispatched')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                  >
                    Mark Dispatched (Fulfill Stock)
                  </button>
                )}
                {selectedOrder.status === 'dispatched' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!selectedOrder.invoiceCreated ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleGenerateInvoice(selectedOrder._id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                  >
                    <FiFileText /> Generate Tax Invoice
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <FiCheckCircle /> Invoice Generated
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
