import React, { useState, useEffect } from 'react';
import { reportApi } from '../../services/api';
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiMessageCircle,
  FiAlertTriangle,
  FiPieChart,
} from 'react-icons/fi';

const Reports = () => {
  const [salesData, setSalesData] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outstanding'); // 'outstanding', 'sales', 'profit'

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const [salesRes, outRes, profRes] = await Promise.all([
          reportApi.getSales(),
          reportApi.getOutstanding(),
          reportApi.getProfit(),
        ]);
        if (salesRes.data.success) setSalesData(salesRes.data);
        if (outRes.data.success) setOutstandingData(outRes.data);
        if (profRes.data.success) setProfitData(profRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Reports & Business Intelligence</h1>
          <p className="text-sm text-slate-400">
            Customer outstanding balances, sales breakdown by beverage SKU, and net profit estimations.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('outstanding')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'outstanding' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Outstanding Matrix
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'sales' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sales Breakdown
          </button>
          <button
            onClick={() => setActiveTab('profit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'profit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profit Estimation
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'outstanding' ? (
        /* OUTSTANDING REPORT (Matches Section 33 & 41) */
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-900/30 to-slate-900 p-5 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Total Market Receivables</span>
              <h2 className="text-3xl font-black text-white font-['Outfit'] mt-1">
                ₹{(outstandingData?.totalOutstanding || 0).toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-slate-400">
                Pending collection across {outstandingData?.count || 0} active retail customer shops
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Customer Shop</th>
                    <th className="py-3 px-4">Contact & WhatsApp</th>
                    <th className="py-3 px-4 text-right">Credit Limit</th>
                    <th className="py-3 px-4 text-right">Outstanding Balance</th>
                    <th className="py-3 px-4 text-center">Credit Utilized</th>
                    <th className="py-3 px-4 text-right">Quick WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {outstandingData?.customers?.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {c.businessName}
                        <div className="text-xs text-slate-400 font-normal">Prop: {c.name}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        📞 {c.whatsapp || c.mobile}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">
                        ₹{(c.creditLimit || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                        ₹{(c.outstandingBalance || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            c.isOverLimit
                              ? 'bg-red-500/20 text-red-400'
                              : c.creditUtilization > 80
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {c.creditUtilization}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={c.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
                        >
                          <FiMessageCircle /> WhatsApp Reminder
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'sales' ? (
        /* SALES BREAKDOWN REPORT */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">Top Beverage Products (Volume)</h3>
            <p className="text-xs text-slate-400 mb-4">Total Cases Sold and Revenue Generated</p>

            <div className="space-y-3">
              {salesData?.productSales?.map((ps, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <div>
                    <p className="text-sm font-semibold text-white">{ps._id}</p>
                    <p className="text-xs text-indigo-400">{ps.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white font-mono">{ps.totalQuantity} Cases</p>
                    <p className="text-xs text-emerald-400 font-mono">₹{ps.totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers by Sales */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">Customer-Wise Sales</h3>
            <p className="text-xs text-slate-400 mb-4">Highest revenue retail business accounts</p>

            <div className="space-y-3">
              {salesData?.userSales?.map((us, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <div>
                    <p className="text-sm font-semibold text-white">{us.businessName}</p>
                    <p className="text-xs text-slate-400">{us.invoiceCount} Tax Invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400 font-mono">₹{us.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400">Balance: ₹{us.balanceAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ESTIMATED PROFIT REPORT (Section 43) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Sales Revenue</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                ₹{(profitData?.profitData?.totalSales || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold uppercase">Cost of Goods (COGS)</span>
              <p className="text-2xl font-bold text-slate-300 font-mono mt-1">
                - ₹{(profitData?.profitData?.totalCogs || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold uppercase">Operating Expenses</span>
              <p className="text-2xl font-bold text-red-400 font-mono mt-1">
                - ₹{(profitData?.profitData?.totalExpenses || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Approximate Net Profit Estimate
              </span>
              <h2 className="text-4xl font-black text-emerald-400 font-mono mt-1">
                ₹{(profitData?.profitData?.netProfit || 0).toLocaleString('en-IN')}
              </h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                {profitData?.profitData?.disclaimer}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center min-w-[140px]">
              <span className="text-xs text-slate-400 block">Est. Net Margin</span>
              <span className="text-2xl font-bold text-white font-mono">
                {profitData?.profitData?.profitMargin || 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
