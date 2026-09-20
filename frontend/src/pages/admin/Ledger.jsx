import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ledgerApi, userApi, whatsappApi } from '../../services/api';
import {
  FiBookOpen,
  FiUser,
  FiDollarSign,
  FiMessageCircle,
  FiDownload,
  FiArrowDownLeft,
  FiArrowUpRight,
} from 'react-icons/fi';

const Ledger = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId') || '';

  const [customers, setCustomers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await userApi.getUsers({ role: 'user' });
        if (res.data.success) {
          setCustomers(res.data.users);
          if (!selectedUserId && res.data.users.length > 0) {
            setSelectedUserId(res.data.users[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await ledgerApi.getLedger({ userId: selectedUserId });
        if (res.data.success) {
          setLedgerData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedUserId]);

  const handleSendReminder = async () => {
    if (!selectedUserId) return;
    try {
      const res = await whatsappApi.sendReminder(selectedUserId);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating reminder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Customer Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Customer Financial Ledger</h1>
          <p className="text-sm text-slate-400">
            Double-entry accounting statement detailing invoices, payments, and live running balance.
          </p>
        </div>

        {/* Customer Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Select Shop:</label>
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setSearchParams({ userId: e.target.value });
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.businessName} ({c.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {ledgerData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Debited (Sales)</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              ₹{(ledgerData.summary?.totalDebit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Credited (Paid)</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{(ledgerData.summary?.totalCredit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Current Outstanding</span>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                ₹{(ledgerData.summary?.outstandingBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>
            {ledgerData.summary?.outstandingBalance > 0 && (
              <button
                onClick={handleSendReminder}
                title="Send WhatsApp Balance Reminder"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
              >
                <FiMessageCircle /> WhatsApp Reminder
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Particulars / Description</th>
                <th className="py-3 px-4 text-right">Debit (+)</th>
                <th className="py-3 px-4 text-right">Credit (-)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Loading ledger entries...
                  </td>
                </tr>
              ) : !ledgerData || ledgerData.entries?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No transactions recorded for this customer yet.
                  </td>
                </tr>
              ) : (
                ledgerData.entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(entry.date).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          entry.type === 'INVOICE'
                            ? 'bg-blue-500/20 text-blue-300'
                            : entry.type === 'PAYMENT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-white">
                      <div>{entry.description}</div>
                      {entry.referenceNumber && (
                        <div className="text-[11px] font-mono text-slate-400">Ref: {entry.referenceNumber}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {entry.debit > 0 ? (
                        <span className="text-amber-400">₹{entry.debit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {entry.credit > 0 ? (
                        <span className="text-emerald-400">₹{entry.credit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{entry.runningBalance?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
