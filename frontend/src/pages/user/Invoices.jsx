import React, { useState, useEffect } from 'react';
import { invoiceApi } from '../../services/api';
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiTruck,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi';

const UserInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchMyInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getInvoices();
        if (res.data.success) {
          setInvoices(res.data.invoices);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyInvoices();
  }, []);

  const handleDownloadInvoice = async (inv) => {
    try {
      setDownloadingId(inv._id);
      await invoiceApi.downloadPdf(inv._id, inv.invoiceNumber);
    } catch (err) {
      console.error('Download error:', err);
      window.open(invoiceApi.getPdfUrl(inv._id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Outfit']">My Invoices</h1>
        <p className="text-xs text-slate-400">View official GST tax invoices, download PDF copies, and check E-Way bills.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-400">No invoices issued yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-400 text-sm">{inv.invoiceNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : inv.status === 'partially_paid'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    {inv.status?.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Billed: {new Date(inv.invoiceDate).toLocaleDateString('en-IN')} • Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '-'}
                </p>

                {inv.ewayBillNumber && (
                  <div className="text-[11px] text-teal-400 flex items-center gap-1 mt-1 font-mono">
                    <FiTruck /> E-Way Bill: {inv.ewayBillNumber}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <p className="text-base font-black text-white font-mono">
                    ₹{inv.totalAmount?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-semibold text-amber-400 font-mono">
                    Bal Due: ₹{inv.balanceAmount?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                  >
                    <FiEye /> View
                  </button>

                  <button
                    onClick={() => handleDownloadInvoice(inv)}
                    disabled={downloadingId === inv._id}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1"
                  >
                    <FiDownload className={downloadingId === inv._id ? 'animate-bounce' : ''} />
                    {downloadingId === inv._id ? 'Downloading...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Invoice #{selectedInvoice.invoiceNumber}</h3>
                <p className="text-xs text-slate-400">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden text-xs">
              {selectedInvoice.items?.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-800/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">HSN: {item.hsn} • {item.packSize}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{item.quantity} Cases</p>
                    <p className="font-mono text-indigo-400">₹{item.amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-800/50 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-mono">₹{selectedInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total GST:</span>
                <span className="font-mono">
                  ₹{((selectedInvoice.cgst || 0) + (selectedInvoice.sgst || 0) + (selectedInvoice.igst || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-700">
                <span>Invoice Total:</span>
                <span className="text-emerald-400 font-mono">₹{selectedInvoice.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                disabled={downloadingId === selectedInvoice._id}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <FiDownload className={downloadingId === selectedInvoice._id ? 'animate-bounce' : ''} />
                {downloadingId === selectedInvoice._id ? 'Downloading...' : 'Download Official PDF Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInvoices;
