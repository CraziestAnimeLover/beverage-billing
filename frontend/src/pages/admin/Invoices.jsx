import React, { useState, useEffect } from 'react';
import { invoiceApi, whatsappApi } from '../../services/api';
import {
  FiFileText,
  FiDownload,
  FiMessageCircle,
  FiEye,
  FiSearch,
  FiCheckCircle,
  FiX,
  FiCreditCard,
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoices({ status: statusFilter });
      if (res.data.success) {
        setInvoices(res.data.invoices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleDownloadInvoice = async (inv) => {
    try {
      setDownloadingId(inv._id);
      await invoiceApi.downloadPdf(inv._id, inv.invoiceNumber);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: direct window open with query token
      window.open(invoiceApi.getPdfUrl(inv._id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendWhatsApp = async (inv) => {
    try {
      const res = await whatsappApi.sendInvoice(inv._id);
      if (res.data.url) {
        window.open(res.data.url, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating WhatsApp message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">GST Tax Invoices</h1>
          <p className="text-sm text-slate-400">
            Formal B2B tax invoices, payment settlement tracking, PDF downloads, and WhatsApp delivery.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Invoices</option>
          <option value="generated">Generated / Unpaid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid in Full</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-indigo-400">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                      </div>
                      {inv.ewayBillNumber && (
                        <div className="text-[10px] text-teal-400 flex items-center gap-1 mt-0.5 font-mono">
                          🚚 E-Way: {inv.ewayBillNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {inv.userId?.businessName || inv.userId?.name}
                      </div>
                      <div className="text-xs text-slate-400">📞 {inv.userId?.mobile}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      ₹{(inv.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {inv.balanceAmount > 0 ? (
                        <span className="text-amber-400">₹{inv.balanceAmount.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-400">₹0 (Paid)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : inv.status === 'partially_paid'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {inv.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="View Invoice Breakdown"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <FiEye />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadInvoice(inv)}
                          disabled={downloadingId === inv._id}
                          title="Download GST PDF Invoice"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition"
                        >
                          <FiDownload className={downloadingId === inv._id ? 'animate-bounce' : ''} />
                        </button>

                        {/* Send WhatsApp */}
                        <button
                          onClick={() => handleSendWhatsApp(inv)}
                          title="Send Invoice on WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                        >
                          <FiMessageCircle />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  Tax Invoice: {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Billed to {selectedInvoice.userId?.businessName || selectedInvoice.userId?.name}
                </p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">HSN</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-white font-medium">{item.name}</td>
                      <td className="p-2.5 text-slate-400 font-mono">{item.hsn}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-white">{item.quantity}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">₹{item.rate}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-white">₹{item.amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* GST Summary */}
            <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono">₹{selectedInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {selectedInvoice.cgst > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>CGST (9%):</span>
                  <span className="font-mono">₹{selectedInvoice.cgst?.toFixed(2)}</span>
                </div>
              )}
              {selectedInvoice.sgst > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>SGST (9%):</span>
                  <span className="font-mono">₹{selectedInvoice.sgst?.toFixed(2)}</span>
                </div>
              )}
              {selectedInvoice.igst > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>IGST (18%):</span>
                  <span className="font-mono">₹{selectedInvoice.igst?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-700">
                <span>Invoice Total:</span>
                <span className="text-emerald-400 font-mono">
                  ₹{selectedInvoice.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedInvoice.ewayBillNumber && (
              <div className="mt-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-bold">🚚 E-Way Bill:</span>
                  <span className="font-mono text-white font-semibold">{selectedInvoice.ewayBillNumber}</span>
                </div>
                <NavLink
                  to="/admin/eway-bills"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Manage in E-Way Bills
                </NavLink>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleSendWhatsApp(selectedInvoice)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
              >
                <FiMessageCircle /> Share on WhatsApp
              </button>
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                disabled={downloadingId === selectedInvoice._id}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition"
              >
                <FiDownload className={downloadingId === selectedInvoice._id ? 'animate-bounce' : ''} />
                {downloadingId === selectedInvoice._id ? 'Downloading...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
