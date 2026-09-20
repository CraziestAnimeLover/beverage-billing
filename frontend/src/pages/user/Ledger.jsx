import React, { useState, useEffect } from 'react';
import { ledgerApi } from '../../services/api';
import { FiBookOpen, FiDollarSign } from 'react-icons/fi';

const UserLedger = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyLedger = async () => {
      try {
        setLoading(true);
        const res = await ledgerApi.getLedger();
        if (res.data.success) {
          setLedgerData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLedger();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">My Business Ledger</h1>
        <p className="text-xs text-slate-400">Complete statement of account showing invoices, payments, and running balance.</p>
      </div>

      {ledgerData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Purchases (Debit)</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              ₹{(ledgerData.summary?.totalDebit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Paid (Credit)</span>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              ₹{(ledgerData.summary?.totalCredit || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 uppercase font-semibold">Outstanding Due</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">
              ₹{(ledgerData.summary?.outstandingBalance || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Ledger Table (Matches Section 27 in spec) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Debit (+)</th>
                <th className="py-3 px-4 text-right">Credit (-)</th>
                <th className="py-3 px-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    Loading ledger statement...
                  </td>
                </tr>
              ) : !ledgerData || ledgerData.entries?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No transactions recorded on this account.
                  </td>
                </tr>
              ) : (
                ledgerData.entries.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{e.description}</div>
                      {e.referenceNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">{e.referenceNumber}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {e.debit > 0 ? (
                        <span className="text-amber-400">₹{e.debit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      {e.credit > 0 ? (
                        <span className="text-emerald-400">₹{e.credit.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                      ₹{e.runningBalance?.toLocaleString('en-IN')}
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

export default UserLedger;
