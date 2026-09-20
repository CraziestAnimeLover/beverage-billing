import React, { useState, useEffect } from 'react';
import { ewayBillApi, invoiceApi } from '../../services/api';
import {
  FiMapPin,
  FiPlus,
  FiTruck,
  FiFileText,
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi';

const EwayBills = () => {
  const [bills, setBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const [formData, setFormData] = useState({
    invoiceId: '',
    vehicleNumber: 'HR51BB1234',
    transporter: 'Dealer Direct Logistics Fleet',
    transportMode: 'Road',
    distanceKm: 25,
    fromPlace: 'Sector 24, Faridabad',
    toPlace: 'Faridabad',
    validDays: 2,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billRes, invRes] = await Promise.all([
        ewayBillApi.getEwayBills(),
        invoiceApi.getInvoices(),
      ]);
      if (billRes.data.success) setBills(billRes.data.bills);
      if (invRes.data.success) setInvoices(invRes.data.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPdf = async (bill) => {
    try {
      setDownloadingId(bill._id);
      await ewayBillApi.downloadPdf(bill._id, bill.ewayBillNumber);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: direct window open with query token
      window.open(ewayBillApi.getPdfUrl(bill._id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCreateEwayBill = async (e) => {
    e.preventDefault();
    if (!formData.invoiceId || !formData.vehicleNumber) return;
    setSubmitting(true);
    try {
      await ewayBillApi.createEwayBill(formData);
      setShowModal(false);
      fetchData();
      alert('E-Way Bill recorded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating E-Way Bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Outfit']">E-Way Bills Management</h1>
          <p className="text-sm text-slate-400">
            Record and manage statutory transit consignments, vehicle numbers, and transport modes for GST compliance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <FiPlus className="text-lg" /> Generate E-Way Bill
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">E-Way Bill #</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle & Mode</th>
                <th className="py-3 px-4">Transit Route</th>
                <th className="py-3 px-4 text-center">Valid Until</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    Loading E-Way bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No E-Way bills generated yet. Click "Generate E-Way Bill" to create one.
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {b.ewayBillNumber}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-white">
                      {b.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">GST: {b.customerGstin}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-mono font-bold text-white">{b.vehicleNumber}</div>
                      <div className="text-slate-400">{b.transportMode} • {b.transporter}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>{b.fromPlace} ➔ {b.toPlace}</div>
                      <div className="text-slate-500 font-mono">Distance: ~{b.distanceKm} km</div>
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                      {new Date(b.validUntil).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadPdf(b)}
                          disabled={downloadingId === b._id}
                          title="Download Official GST E-Way Bill PDF"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition flex items-center gap-1 text-xs"
                        >
                          <FiDownload className={downloadingId === b._id ? 'animate-bounce' : ''} />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                          onClick={() => setSelectedBill(b)}
                          title="Quick View Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <FiEye />
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

      {/* Generate E-Way Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">Generate / Record E-Way Bill</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateEwayBill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Tax Invoice *</label>
                <select
                  required
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.userId?.businessName} (₹{inv.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    placeholder="DL01AB1234"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transport Mode</label>
                  <select
                    value={formData.transportMode}
                    onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                    <option value="Air">Air</option>
                    <option value="Ship">Ship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transporter / Carrier</label>
                  <input
                    type="text"
                    value={formData.transporter}
                    onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Distance (Approx Km)</label>
                  <input
                    type="number"
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">From Place</label>
                  <input
                    type="text"
                    value={formData.fromPlace}
                    onChange={(e) => setFormData({ ...formData, fromPlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">To Place (Destination)</label>
                  <input
                    type="text"
                    value={formData.toPlace}
                    onChange={(e) => setFormData({ ...formData, toPlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  {submitting ? 'Generating...' : 'Save & Issue E-Way Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-['Outfit']">E-Way Bill Details</h3>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-white">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">E-Way Bill No:</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{selectedBill.ewayBillNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono text-white">{selectedBill.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Consignee (Customer):</span>
                <span className="text-white font-semibold">{selectedBill.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Vehicle Number:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedBill.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Transporter:</span>
                <span className="text-slate-300">{selectedBill.transporter}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Route:</span>
                <span className="text-slate-300">{selectedBill.fromPlace} ➔ {selectedBill.toPlace} (~{selectedBill.distanceKm} km)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Validity:</span>
                <span className="text-white font-semibold">
                  {new Date(selectedBill.validUntil).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedBill)}
                disabled={downloadingId === selectedBill._id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <FiDownload className={downloadingId === selectedBill._id ? 'animate-bounce' : ''} />
                {downloadingId === selectedBill._id ? 'Generating...' : 'Download E-Way Bill PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EwayBills;
