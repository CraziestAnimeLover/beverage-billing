import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderApi, invoiceApi } from '../../services/api';
import { NavLink } from 'react-router-dom';
import {
  FiShoppingBag,
  FiFileText,
  FiBookOpen,
  FiCreditCard,
  FiPlus,
  FiArrowRight,
  FiAlertCircle,
  FiClock,
} from 'react-icons/fi';

const UserDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orderRes, invRes] = await Promise.all([
          orderApi.getOrders(),
          invoiceApi.getInvoices(),
        ]);
        if (orderRes.data.success) setRecentOrders(orderRes.data.orders.slice(0, 3));
        if (invRes.data.success) setRecentInvoices(invRes.data.invoices.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const outstanding = user?.outstandingBalance || 0;
  const creditLimit = user?.creditLimit || 50000;
  const availableCredit = Math.max(0, creditLimit - outstanding);
  const creditPercent = creditLimit > 0 ? Math.min(100, Math.round((outstanding / creditLimit) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Section 7) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Retail Partner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] mt-1">
            Hello, {user?.businessName || user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Welcome to your dedicated beverage dealer ordering dashboard. Browse assigned wholesale prices, manage credit, and track deliveries.
          </p>
        </div>
      </div>

      {/* Credit & Outstanding Cards (Matches Section 7 in spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outstanding Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Outstanding Balance
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono font-['Outfit'] mt-2">
            ₹{outstanding.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Due within {user?.paymentTerms || 15} days credit term</p>
        </div>

        {/* Credit Limit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Approved Credit Limit
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-mono font-['Outfit'] mt-2">
            ₹{creditLimit.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Dealer authorized trade line</p>
        </div>

        {/* Available Credit */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Credit for Orders
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono font-['Outfit'] mt-2">
            ₹{availableCredit.toLocaleString('en-IN')}
          </h3>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                creditPercent > 90 ? 'bg-red-500' : creditPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${creditPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions (Matches Section 7 in spec) */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NavLink
            to="/user/products"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 transition group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg mb-2 shadow-md shadow-indigo-600/30 group-hover:scale-105 transition">
              <FiPlus />
            </div>
            <span className="text-xs font-bold text-white">New Order</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Browse Catalog</span>
          </NavLink>

          <NavLink
            to="/user/orders"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition">
              <FiShoppingBag />
            </div>
            <span className="text-xs font-bold text-white">My Orders</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Track Dispatches</span>
          </NavLink>

          <NavLink
            to="/user/invoices"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition">
              <FiFileText />
            </div>
            <span className="text-xs font-bold text-white">My Invoices</span>
            <span className="text-[10px] text-slate-400 mt-0.5">GST PDF Copies</span>
          </NavLink>

          <NavLink
            to="/user/ledger"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition group text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition">
              <FiBookOpen />
            </div>
            <span className="text-xs font-bold text-white">My Ledger</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Financial Statement</span>
          </NavLink>
        </div>
      </div>

      {/* Recent Orders & Invoices Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-['Outfit']">Recent Orders</h3>
            <NavLink to="/user/orders" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </NavLink>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No orders placed yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <div>
                    <p className="text-sm font-semibold text-white">{o.orderNumber}</p>
                    <p className="text-xs text-slate-400">
                      {o.items?.length || 0} Items • {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-semibold text-indigo-400 capitalize">{o.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-['Outfit']">Recent Tax Invoices</h3>
            <NavLink to="/user/invoices" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </NavLink>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No invoices generated yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <div>
                    <p className="text-sm font-semibold text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-semibold text-amber-400">
                      Bal: ₹{inv.balanceAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
