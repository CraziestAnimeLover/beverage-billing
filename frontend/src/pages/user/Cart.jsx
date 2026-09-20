import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../services/api';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

const UserCart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalCases, subtotal, taxAmount, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const currentOutstanding = user?.outstandingBalance || 0;
  const creditLimit = user?.creditLimit || 50000;
  const creditLimitExceeded = currentOutstanding + totalAmount > creditLimit;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
      }));

      const res = await orderApi.createOrder({
        items: itemsPayload,
        deliveryAddress,
        notes,
      });

      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        setOrderSuccess(res.data.order);
        clearCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto my-8 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
          <FiCheckCircle />
        </div>
        <h2 className="text-2xl font-bold text-white font-['Outfit']">Order Confirmed!</h2>
        <p className="text-sm text-slate-300">
          Order <strong>#{orderSuccess.orderNumber}</strong> has been transmitted to Royal Beverage Distributors.
        </p>

        {orderSuccess.creditLimitExceeded && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold">
            ⚠️ Order exceeds current trade credit limit and is pending distributor approval.
          </div>
        )}

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate('/user/orders')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            Track Order Status
          </button>
          <button
            onClick={() => navigate('/user/products')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Continue Ordering
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-3xl mx-auto">
          <FiShoppingCart />
        </div>
        <h2 className="text-xl font-bold text-white font-['Outfit']">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Explore our wholesale catalog and add beverage cases to place your shop order.
        </p>
        <NavLink
          to="/user/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
        >
          Browse Beverage Catalog <FiArrowRight />
        </NavLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Order Cart ({totalCases} Cases)</h1>
          <p className="text-xs text-slate-400">Review selected beverages and confirm delivery details</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div
              key={item.product._id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate font-['Outfit']">
                  {item.product.name}
                </h4>
                <p className="text-xs text-slate-400">{item.product.packSize}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-bold text-indigo-400 text-sm font-mono">
                    ₹{item.product.sellingPrice}
                  </span>
                  <span className="text-[11px] text-slate-500">/ Case</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <FiMinus className="text-xs" />
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-white min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <FiPlus className="text-xs" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-bold text-white font-mono">
                    ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary Box */}
        <div className="space-y-4">
          <form
            onSubmit={handlePlaceOrder}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Quantity:</span>
                <span className="font-bold text-white font-mono">{totalCases} Cases</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxable Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated GST (18%):</span>
                <span className="font-mono">₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-slate-800">
                <span>Total Payable:</span>
                <span className="text-emerald-400 font-mono">
                  ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Credit Limit Exceeded Warning Indicator */}
            {creditLimitExceeded && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-start gap-2">
                <FiAlertTriangle className="text-base shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Credit Limit Exceeded</p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    Order total + current balance (₹{currentOutstanding}) exceeds your credit limit (₹{creditLimit}). Admin approval required.
                  </p>
                </div>
              </div>
            )}

            {/* Delivery address */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Delivery Address
              </label>
              <textarea
                rows={2}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Confirm shop delivery address"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Delivery notes */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Order Notes / Delivery Time Preference
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deliver before 2 PM"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition duration-150 disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserCart;
