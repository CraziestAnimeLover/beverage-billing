import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  FiShoppingBag,
  FiSearch,
  FiPlus,
  FiMinus,
  FiCheck,
  FiAlertCircle,
  FiShoppingCart,
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const UserProducts = () => {
  const [products, setProducts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [addedMessage, setAddedMessage] = useState('');

  const { addToCart, totalCases } = useCart();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({ category: categoryFilter, search });
        if (res.data.success) {
          setProducts(res.data.products);
          // initialize quantities
          const initialQ = {};
          res.data.products.forEach((p) => {
            initialQ[p._id] = 1;
          });
          setQuantities((prev) => ({ ...initialQ, ...prev }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [categoryFilter, search]);

  const handleQtyChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product._id] || 1;
    addToCart(product, qty);
    setAddedMessage(`Added ${qty} Case(s) of ${product.name} to Cart`);
    setTimeout(() => setAddedMessage(''), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Beverage Catalog</h1>
          <p className="text-sm text-slate-400">
            Wholesale beverages with your authorized dealer pricing. Case order quantities.
          </p>
        </div>

        {totalCases > 0 && (
          <NavLink
            to="/user/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
          >
            <FiShoppingCart className="text-base" /> View Cart ({totalCases} Cases)
          </NavLink>
        )}
      </div>

      {addedMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <FiCheck /> {addedMessage}
        </div>
      )}

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3 py-2.5 rounded-2xl border border-slate-800">
          <FiSearch className="text-slate-500 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beverages by name, brand..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none">
          {['', 'Soft Drinks', 'Juice', 'Water', 'Energy Drinks'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat || 'All Categories'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid (Section 13) */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No beverage products found matching search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const qty = quantities[p._id] || 1;
            const inStock = p.availableStock > 0;

            return (
              <div
                key={p._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden"
              >
                {/* Special Assigned Price Tag */}
                {p.isCustomPrice && (
                  <span className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Your Assigned Rate
                  </span>
                )}

                <div>
                  <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                    {p.brand} • {p.category}
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Outfit'] mt-1 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.packSize}</p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono font-['Outfit']">
                      ₹{p.sellingPrice}
                    </span>
                    <span className="text-xs text-slate-400">/ Case</span>

                    {p.mrp && (
                      <span className="text-xs text-slate-500 line-through ml-1 font-mono">
                        MRP: ₹{p.mrp}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs">
                    {inStock ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available ({p.availableStock} Cases in Stock)
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span> Currently Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Stepper & Add Button (Matches Section 13 [-] 2 [+] [ Add to Cart ]) */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      disabled={!inStock || qty <= 1}
                      onClick={() => handleQtyChange(p._id, -1)}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white min-w-[32px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      disabled={!inStock || qty >= p.availableStock}
                      onClick={() => handleQtyChange(p._id, 1)}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={() => handleAddToCart(p)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserProducts;
