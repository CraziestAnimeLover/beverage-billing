import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  FiHome,
  FiShoppingBag,
  FiShoppingCart,
  FiFileText,
  FiUser,
  FiLogOut,
  FiPhoneCall,
  FiMessageCircle,
} from 'react-icons/fi';
import ThemeToggle from '../components/common/ThemeToggle';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const { totalCases } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F4F5F9] dark:bg-slate-950 text-[#11142D] dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 border-b border-[#EDEFF5] dark:border-slate-800 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#6355F6] flex items-center justify-center text-white text-sm shadow-md shadow-[#6355F6]/25">
            ✦
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#11142D] dark:text-white tracking-tight leading-tight font-['Outfit']">
              {user?.businessName || user?.name || 'Customer Portal'}
            </h1>
            <p className="text-xs text-[#808191] dark:text-slate-400">
              Outstanding: <span className="text-amber-500 font-bold">₹{(user?.outstandingBalance || 0).toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="rounded-full shadow-sm" />

          <a
            href="https://wa.me/919015088766?text=Hi%20Distributor%2C%20I%20need%20assistance%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with Dealer on WhatsApp"
            className="p-2 text-[#059669] hover:bg-[#ECFDF5] rounded-full transition flex items-center gap-1 text-xs"
          >
            <FiMessageCircle className="text-lg" />
            <span className="hidden sm:inline font-medium">Dealer WhatsApp</span>
          </a>

          <NavLink
            to="/user/cart"
            className="relative p-2 text-[#808191] hover:text-[#11142D] hover:bg-[#F4F5F9] rounded-full transition"
          >
            <FiShoppingCart className="text-xl" />
            {totalCases > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#6355F6] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalCases}
              </span>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-[#FF6A55] hover:bg-[#FF6A55]/10 rounded-full transition"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </header>

      {/* Main Screen Content with mobile padding bottom for fixed bottom bar */}
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full pb-24 sm:pb-12">
        <Outlet />
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (FiHome, FiShoppingBag, FiShoppingCart, FiFileText, FiUser) */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t border-[#EDEFF5] dark:border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around sm:hidden shadow-lg">
        <NavLink
          to="/user/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-[#6355F6] font-bold' : 'text-[#808191] hover:text-[#11142D]'
            }`
          }
        >
          <FiHome className="text-xl mb-0.5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/user/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-[#6355F6] font-bold' : 'text-[#808191] hover:text-[#11142D]'
            }`
          }
        >
          <FiShoppingBag className="text-xl mb-0.5" />
          <span className="text-[10px]">Products</span>
        </NavLink>

        <NavLink
          to="/user/cart"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-[#6355F6] font-bold' : 'text-[#808191] hover:text-[#11142D]'
            }`
          }
        >
          <div className="relative">
            <FiShoppingCart className="text-xl mb-0.5" />
            {totalCases > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#6355F6] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCases}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </NavLink>

        <NavLink
          to="/user/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-[#6355F6] font-bold' : 'text-[#808191] hover:text-[#11142D]'
            }`
          }
        >
          <FiFileText className="text-xl mb-0.5" />
          <span className="text-[10px]">Orders</span>
        </NavLink>

        <NavLink
          to="/user/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <FiUser className="text-xl mb-0.5" />
          <span className="text-[10px]">Me</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default UserLayout;
