import React, { useState, useEffect } from 'react';
import { reportApi } from '../../services/api';
import { NavLink } from 'react-router-dom';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiDollarSign,
  FiLayers,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiArrowRight,
  FiFileText,
  FiCreditCard,
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await reportApi.getDashboard();
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
          setRecentInvoices(res.data.recentInvoices || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Banner (Matches Reference Screenshot Gradient & Pill Action) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5B4DF5] via-[#6355F6] to-[#8075FF] p-7 md:p-8 text-white shadow-xl shadow-[#6355F6]/20">
        {/* Subtle decorative sparkles matching the screenshot */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/15 text-8xl pointer-events-none select-none font-thin">
          ✦
        </div>
        <div className="absolute right-32 bottom-4 text-white/20 text-4xl pointer-events-none select-none">
          ✦
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-white/80 mb-2">
            ✦ BEVERAGE DISTRIBUTION MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] leading-tight tracking-tight text-white mb-2">
            Sharpen Your Business Operations with Real-Time Dealer Management
          </h1>
          <p className="text-xs sm:text-sm text-white/85 max-w-lg mb-5 font-normal">
            Real-time sales, live inventory valuation, GST tax invoicing, and instant double-entry customer ledger.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink
              to="/admin/orders"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#11142D] hover:bg-black text-white text-xs font-bold transition shadow-lg"
            >
              <span>Manage Orders</span>
              <span className="w-5 h-5 rounded-full bg-white text-[#11142D] flex items-center justify-center text-[10px] font-black">
                ➔
              </span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition"
            >
              <FiPlus /> Add Customer
            </NavLink>

            <NavLink
              to="/admin/purchases"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition"
            >
              <FiLayers /> Inward Stock
            </NavLink>
          </div>
        </div>
      </div>

      {/* 4 Summary Pill Cards (Matches Reference Screenshot Row with Soft Pastels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pill 1: Lavender / Purple - Today's Sales */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] dark:bg-[#6355F6]/20 flex items-center justify-center text-[#6355F6] dark:text-[#8B7AFE] text-xl shrink-0">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#808191] dark:text-slate-400">Billed Revenue Today</p>
              <h3 className="text-lg font-bold text-[#11142D] dark:text-white font-['Outfit'] leading-snug">
                ₹{(stats?.todaySales || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <span className="text-[#9A9FA5] text-sm cursor-pointer hover:text-[#11142D] px-1">⋮</span>
        </div>

        {/* Pill 2: Soft Pink - Orders Pending */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] dark:bg-[#EC4899]/20 flex items-center justify-center text-[#EC4899] text-xl shrink-0">
              <FiShoppingBag />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#808191] dark:text-slate-400">Pending Orders Review</p>
              <h3 className="text-lg font-bold text-[#11142D] dark:text-white font-['Outfit'] leading-snug">
                {stats?.pendingOrdersCount || 0} Orders
              </h3>
            </div>
          </div>
          <span className="text-[#9A9FA5] text-sm cursor-pointer hover:text-[#11142D] px-1">⋮</span>
        </div>

        {/* Pill 3: Soft Cyan - Total Customer Balance */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] dark:bg-[#0284C7]/20 flex items-center justify-center text-[#0284C7] text-xl shrink-0">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#808191] dark:text-slate-400">Total Receivables</p>
              <h3 className="text-lg font-bold text-[#11142D] dark:text-white font-['Outfit'] leading-snug">
                ₹{(stats?.totalReceivable || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <span className="text-[#9A9FA5] text-sm cursor-pointer hover:text-[#11142D] px-1">⋮</span>
        </div>

        {/* Pill 4: Soft Amber - Stock Valuation */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] dark:bg-[#D97706]/20 flex items-center justify-center text-[#D97706] text-xl shrink-0">
              <FiLayers />
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#808191] dark:text-slate-400">Warehouse Valuation</p>
              <h3 className="text-lg font-bold text-[#11142D] dark:text-white font-['Outfit'] leading-snug">
                ₹{(stats?.stockValuation || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <span className="text-[#9A9FA5] text-sm cursor-pointer hover:text-[#11142D] px-1">⋮</span>
        </div>
      </div>

      {/* Secondary Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Low Stock SKUs</p>
            <p className="text-base font-bold text-white">{stats?.lowStockCount || 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Today's Collection</p>
            <p className="text-base font-bold text-emerald-400">
              ₹{(stats?.todayCollection || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <FiUsers />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Total Customers</p>
            <p className="text-base font-bold text-white">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <FiFileText />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Unpaid Invoices</p>
            <p className="text-base font-bold text-white">{stats?.unpaidInvoicesCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">New & Recent Orders</h3>
              <p className="text-xs text-slate-400">Customer requests awaiting processing</p>
            </div>
            <NavLink
              to="/admin/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              All Orders <FiArrowRight />
            </NavLink>
          </div>

          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      #{order.orderNumber?.slice(-4)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate">
                        {order.userId?.businessName || order.userId?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.items?.length || 0} Items • {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.status === 'confirmed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : order.status === 'dispatched'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Recent Tax Invoices</h3>
              <p className="text-xs text-slate-400">Generated GST billing</p>
            </div>
            <NavLink
              to="/admin/invoices"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              All Invoices <FiArrowRight />
            </NavLink>
          </div>

          <div className="mt-4 space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No invoices generated yet.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      INV
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate">
                        {inv.userId?.businessName || inv.userId?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-slate-400">{inv.invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : inv.status === 'partially_paid'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {inv.status?.replace('_', ' ')}
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

export default Dashboard;
