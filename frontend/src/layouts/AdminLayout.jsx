import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiPackage,
  FiLayers,
  FiTruck,
  FiShoppingBag,
  FiFileText,
  FiCreditCard,
  FiBookOpen,
  FiMapPin,
  FiBarChart2,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiMessageCircle,
} from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
      { name: 'Products & Pricing', path: '/admin/products', icon: FiPackage },
      { name: 'Inventory & Stock', path: '/admin/inventory', icon: FiLayers },
      { name: 'Purchases (Inward)', path: '/admin/purchases', icon: FiTruck },
      { name: 'Orders', path: '/admin/orders', icon: FiShoppingBag },
      { name: 'Invoices', path: '/admin/invoices', icon: FiFileText },
    ],
  },
  {
    title: 'FINANCE & CUSTOMERS',
    items: [
      { name: 'Users & Customers', path: '/admin/users', icon: FiUsers },
      { name: 'Payments Received', path: '/admin/payments', icon: FiCreditCard },
      { name: 'Customer Ledger', path: '/admin/ledger', icon: FiBookOpen },
      { name: 'E-Way Bills', path: '/admin/eway-bills', icon: FiMapPin },
      { name: 'Reports & Analytics', path: '/admin/reports', icon: FiBarChart2 },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { name: 'Operating Expenses', path: '/admin/expenses', icon: FiDollarSign },
      { name: 'Business Settings', path: '/admin/settings', icon: FiSettings },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F5F9] dark:bg-slate-950 text-[#11142D] dark:text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-[#EDEFF5] dark:border-slate-800 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Header (Coursue-style Sparkle Emblem) */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-[#EDEFF5] dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-[#6355F6] flex items-center justify-center text-white text-lg shadow-md shadow-[#6355F6]/30 select-none">
            ✦
          </div>
          <div>
            <h1 className="font-bold text-base text-[#11142D] dark:text-white tracking-tight font-['Outfit',sans-serif] leading-tight">
              Tota Ram Traders
            </h1>
            <span className="text-[11px] text-[#808191] dark:text-slate-400 font-medium">Faridabad • GST Dealer</span>
          </div>
        </div>

        {/* Navigation Links with Categorized Sections */}
        <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="text-[10px] font-bold tracking-widest text-[#9A9FA5] uppercase px-3 pb-1 select-none">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#F0EFFF] dark:bg-[#6355F6]/20 text-[#6355F6] dark:text-[#8B7AFE] font-semibold shadow-sm'
                          : 'text-[#808191] dark:text-slate-400 hover:text-[#11142D] dark:hover:text-white hover:bg-[#F4F5F9] dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="text-lg shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Logout (Bottom) */}
        <div className="p-4 border-t border-[#EDEFF5] dark:border-slate-800 bg-[#FAFBFD] dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#F0EFFF] dark:bg-[#6355F6]/20 text-[#6355F6] dark:text-[#8B7AFE] font-bold text-sm flex items-center justify-center border border-[#6355F6]/20">
                {user?.name ? user.name[0] : 'A'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-[#11142D] dark:text-white truncate leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#808191] dark:text-slate-400 truncate">{user?.mobile || 'Dealer Admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-[#FF6A55] hover:bg-[#FF6A55]/10 rounded-xl transition"
            >
              <FiLogOut className="text-lg" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-[#EDEFF5] p-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDEFF5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#6355F6] flex items-center justify-center text-white text-sm">✦</div>
                <span className="font-bold text-base text-[#11142D] dark:text-white font-['Outfit']">Tota Ram Traders</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-700">
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>
            <nav className="flex-1 mt-4 space-y-4 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-[#9A9FA5] uppercase px-2 pb-1">
                    {section.title}
                  </p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                            isActive
                              ? 'bg-[#F0EFFF] text-[#6355F6] font-semibold'
                              : 'text-[#808191] hover:bg-[#F4F5F9]'
                          }`
                        }
                      >
                        <Icon className="text-lg" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#FF6A55] hover:bg-[#FF6A55]/10 rounded-xl"
            >
              <FiLogOut className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Pill Search + Circular Action Buttons) */}
        <header className="h-20 border-b border-[#EDEFF5] dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            >
              <FiMenu className="text-xl" />
            </button>

            {/* Pill Search Input like Reference UI */}
            <div className="relative w-full max-w-md hidden sm:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9FA5] text-base" />
              <input
                type="text"
                placeholder="Search products, orders, customers, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#F8F9FD] dark:bg-slate-800/80 border border-[#EDEFF5] dark:border-slate-700 text-xs text-[#11142D] dark:text-white placeholder-[#9A9FA5] focus:outline-none focus:border-[#6355F6] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Circular Message / WhatsApp button */}
            <a
              href="https://wa.me/919015088766"
              target="_blank"
              rel="noopener noreferrer"
              title="Dealer WhatsApp Hub"
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 flex items-center justify-center text-[#11142D] dark:text-slate-200 hover:bg-[#F4F5F9] dark:hover:bg-slate-700 shadow-sm transition"
            >
              <FiMessageCircle className="text-base text-[#059669]" />
            </a>

            {/* Circular Notifications button */}
            <button
              title="Notifications"
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 flex items-center justify-center text-[#11142D] dark:text-slate-200 hover:bg-[#F4F5F9] dark:hover:bg-slate-700 shadow-sm transition relative"
            >
              <FiBell className="text-base text-[#808191]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#6355F6]"></span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle showLabel={false} className="rounded-full shadow-sm" />

            {/* Live Database status pill */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
              Live Portal
            </div>
          </div>
        </header>

        {/* Scrollable View Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F4F5F9] dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
