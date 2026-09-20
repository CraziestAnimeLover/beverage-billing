import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../services/api';
import { FiCreditCard, FiCheckCircle } from 'react-icons/fi';

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPayments = async () => {
      try {
        setLoading(true);
        const res = await paymentApi.getPayments();
        if (res.data.success) {
          setPayments(res.data.payments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">Payment History</h1>
        <p className="text-xs text-slate-400">Payments recorded by the dealer towards your account settlements.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No payment receipts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{p.paymentNumber}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Success
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Paid on {new Date(p.paymentDate).toLocaleDateString('en-IN')} via <strong className="uppercase text-slate-300">{p.method}</strong>
                  {p.transactionId && ` (Ref: ${p.transactionId})`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  + ₹{p.amount?.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-500">Credited to Ledger</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPayments;
