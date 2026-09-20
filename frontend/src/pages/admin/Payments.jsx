import React, { useState, useEffect } from 'react';
import { paymentApi, userApi, whatsappApi } from '../../services/api';
import {
  FiCreditCard,
  FiPlus,
  FiDollarSign,
  FiCheckCircle,
  FiMessageCircle,
  FiX,
} from 'react-icons/fi';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    method: 'upi',
    transactionId: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, userRes] = await Promise.all([
        paymentApi.getPayments(),
        userApi.getUsers({ role: 'user' }),
      ]);
      if (payRes.data.success) setPayments(payRes.data.payments);
      if (userRes.data.success) setCustomers(userRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.amount) return;
    setSubmitting(true);
    try {
      await paymentApi.recordPayment(formData);
      setShowModal(false);
      setFormData({
        userId: '',
        amount: '',
        method: 'upi',
        transactionId: '',
        notes: '',
      });
      fetchData();
      alert('Payment recorded! Customer ledger has been credited.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsAppReceipt = async (payment) => {
    try {
      const res = await whatsappApi.sendPayment(payment._id);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating WhatsApp receipt');
    }
  };

  const selectedCustomerObj = customers.find((c) => c._id === formData.userId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Payment Collections</h1>
          <p className="text-sm text-slate-400">
            Record customer collections via UPI, Cash, NEFT/RTGS, and Cheque. Automatically credits ledger.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition self-start sm:self-auto"
        >
          <FiPlus className="text-lg" /> Record Collection
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer Shop</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Payment Mode</th>
                <th className="py-3 px-4">Txn / Ref No</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No payment collections recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {p.paymentNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {p.userId?.businessName || p.userId?.name}
                      </div>
                      <div className="text-xs text-slate-400">📞 {p.userId?.mobile}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {p.method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {p.transactionId || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendWhatsAppReceipt(p)}
                        title="Send WhatsApp Payment Receipt"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium inline-flex items-center gap-1 transition"
                      >
                        <FiMessageCircle /> WhatsApp Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Record Customer Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Customer Shop *</label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.businessName} (Outstanding: ₹{c.outstandingBalance})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomerObj && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex justify-between">
                  <span className="text-slate-400">Current Outstanding:</span>
                  <span className="font-bold font-mono text-amber-400">
                    ₹{selectedCustomerObj.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 10000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none uppercase font-semibold"
                  >
                    <option value="upi">UPI / QR</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer (NEFT)</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Ref No</label>
                  <input
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g. UPI92817281"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Received via PhonePe QR"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                >
                  {submitting ? 'Recording...' : 'Confirm Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
