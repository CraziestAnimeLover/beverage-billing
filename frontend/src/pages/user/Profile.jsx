import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { userApi } from '../../services/api';
import { FiUser, FiCheck, FiShield } from 'react-icons/fi';
import ThemeToggle from '../../components/common/ThemeToggle';

const UserProfile = () => {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    whatsapp: user?.whatsapp || '',
    email: user?.email || '',
    gstin: user?.gstin || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await userApi.updateProfile(formData);
      if (res.data.success) {
        setSuccess(true);
        refreshUser();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">Business Profile</h1>
        <p className="text-xs text-slate-400">Registered retail shop credentials and authorized credit parameters.</p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <FiCheck /> Profile updated successfully!
        </div>
      )}

      {/* Credit & Terms Card (Read-Only as per Section 34 spec) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <FiShield className="text-base" /> Trade Terms & Credit Line (Distributor Assigned)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Approved Credit Limit</span>
            <span className="font-bold text-white font-mono text-sm">
              ₹{(user?.creditLimit || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Credit Settlement Period</span>
            <span className="font-bold text-white font-mono text-sm">
              {user?.paymentTerms || 15} Days
            </span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Account Status</span>
            <span className="font-bold text-emerald-400 uppercase text-xs">
              Active Trade Partner
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          * Credit limit and special price matrices are managed directly by Royal Beverage Distributors.
        </p>
      </div>

      {/* Theme Preference */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
          Appearance & Theme Mode
        </h3>
        <p className="text-xs text-slate-400">
          Choose between Dark and Light mode interface for optimal visibility.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <ThemeToggle showLabel={true} className="px-4 py-2" />
          <span className="text-xs text-slate-400">
            Currently active: <strong className="text-white capitalize">{theme} Mode</strong>
          </span>
        </div>
      </div>

      {/* Editable Business Information Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
          Shop & Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Business Name</label>
            <input
              type="text"
              disabled
              value={user?.businessName || ''}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-400 text-xs cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Proprietor Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Registered Mobile (Login)</label>
            <input
              type="text"
              disabled
              value={user?.mobile || ''}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-slate-400 text-xs font-mono cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp for Invoices</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">PIN Code</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
