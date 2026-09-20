import React, { useState, useEffect } from 'react';
import { orderApi } from '../../services/api';
import {
  FiShoppingBag,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiX,
  FiPackage,
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">My Orders</h1>
          <p className="text-xs text-slate-400">Track real-time fulfillment, warehouse dispatch, and delivery status.</p>
        </div>

        <NavLink
          to="/user/products"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          + Place New Order
        </NavLink>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">You have not placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const totalCases = o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
            return (
              <div
                key={o._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400 text-sm">{o.orderNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        o.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : o.status === 'confirmed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : o.status === 'dispatched'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {totalCases} Cases • {o.items?.length || 0} Products • Placed on {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-base font-black text-white font-mono">
                      ₹{o.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <FiEye /> View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">
                  Status: <span className="text-indigo-400 font-semibold capitalize">{selectedOrder.status}</span>
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Line items list */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ordered Beverage SKUs</h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/30 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.packSize}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{item.quantity} Cases</p>
                      <p className="font-mono text-indigo-400">@ ₹{item.unitPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-800/50 text-xs flex justify-between items-center">
              <span className="text-slate-400 font-medium">Order Total (Incl Tax):</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>

            {selectedOrder.deliveryAddress && (
              <div className="mt-3 text-xs text-slate-400">
                <span className="font-bold text-slate-300 block">Delivery Address:</span>
                {selectedOrder.deliveryAddress}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
