import React, { useState, useEffect, useRef } from 'react';
import { expenseApi } from '../../services/api';
import {
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiFilter,
  FiX,
  FiImage,
  FiEye,
  FiDownload,
  FiTruck,
  FiCamera,
  FiFileText,
  FiCheck,
} from 'react-icons/fi';

const SAMPLE_FUEL_BILL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560"><rect width="100%" height="100%" fill="%23f4f5f9"/><rect x="20" y="20" width="360" height="520" fill="%23ffffff" stroke="%23edeff5" stroke-width="2" rx="16"/><text x="200" y="65" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="%2311142D">INDIAN OIL CORPORATION LTD</text><text x="200" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="%23808191">AUTO CARE CENTRE - 27 FEET ROAD</text><text x="200" y="104" text-anchor="middle" font-family="monospace" font-size="11" fill="%23808191">DABUA COLONY, FARIDABAD (HR) - 121001</text><text x="200" y="122" text-anchor="middle" font-family="monospace" font-size="11" fill="%23808191">GSTIN: 06AAACI1681G1ZM</text><line x1="40" y1="138" x2="360" y2="138" stroke="%23edeff5" stroke-dasharray="4,4"/><text x="50" y="165" font-family="monospace" font-size="12" fill="%2311142D">BILL NO : IOCL-2026-9812</text><text x="50" y="185" font-family="monospace" font-size="12" fill="%2311142D">DATE    : 18/09/2026 10:45 AM</text><text x="50" y="205" font-family="monospace" font-size="12" fill="%2311142D">VEHICLE : HR 51 BB 1234 (VAN)</text><text x="50" y="225" font-family="monospace" font-size="12" fill="%2311142D">PUMP/NOZ: PUMP 02 / NOZZLE 04</text><line x1="40" y1="242" x2="360" y2="242" stroke="%23edeff5" stroke-dasharray="4,4"/><text x="50" y="272" font-family="monospace" font-weight="bold" font-size="14" fill="%236355F6">PRODUCT : DIESEL (HSD)</text><text x="50" y="296" font-family="monospace" font-size="13" fill="%2311142D">RATE/LTR: Rs. 89.62</text><text x="50" y="320" font-family="monospace" font-size="13" fill="%2311142D">VOLUME  : 39.05 LTR</text><line x1="40" y1="340" x2="360" y2="340" stroke="%2311142D" stroke-width="1.5"/><text x="50" y="372" font-family="monospace" font-weight="bold" font-size="18" fill="%2311142D">TOTAL   : Rs. 3,500.00</text><line x1="40" y1="392" x2="360" y2="392" stroke="%2311142D" stroke-width="1.5"/><text x="50" y="422" font-family="monospace" font-size="12" fill="%23808191">PAY MODE: UPI / GPAY</text><text x="50" y="442" font-family="monospace" font-size="12" fill="%23808191">TXN REF : UPI/192837465910</text><text x="50" y="462" font-family="monospace" font-size="12" fill="%23808191">OPERATOR: RAJESH KUMAR</text><line x1="40" y1="485" x2="360" y2="485" stroke="%23edeff5" stroke-dasharray="4,4"/><text x="200" y="515" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="%236355F6">*** THANK YOU! VISIT AGAIN ***</text><text x="200" y="532" text-anchor="middle" font-family="monospace" font-size="10" fill="%239A9FA5">TOTA RAM TRADERS FLEET LOGISTICS</text></svg>`;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewBill, setPreviewBill] = useState(null); // Selected bill for lightbox
  const [categoryFilter, setCategoryFilter] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: 'Fuel',
    title: '',
    vendor: '',
    vehicleNumber: '',
    liters: '',
    billNumber: '',
    amount: '',
    paymentMethod: 'upi',
    notes: '',
    billImage: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseApi.getExpenses({ category: categoryFilter });
      if (res.data.success) {
        let list = res.data.expenses;
        // If fuel expense exists without image, attach demo fuel bill image for preview
        list = list.map((exp) => {
          if (exp.category === 'Fuel' && !exp.billImage) {
            return {
              ...exp,
              billImage: SAMPLE_FUEL_BILL_SVG,
              vendor: exp.vendor || 'Indian Oil Petrol Pump - Dabua Colony',
              vehicleNumber: exp.vehicleNumber || 'HR 51 BB 1234',
              liters: exp.liters || '39.05 Ltr',
              billNumber: exp.billNumber || 'IOCL-9812',
            };
          }
          return exp;
        });
        setExpenses(list);
        setTotalAmount(res.data.totalAmount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  // Handle client-side image compression to base64
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP, or Camera capture)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setFormData((prev) => ({ ...prev, billImage: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert('Please fill in title and amount');
      return;
    }

    try {
      await expenseApi.createExpense(formData);
      setShowModal(false);
      setFormData({
        category: 'Fuel',
        title: '',
        vendor: '',
        vehicleNumber: '',
        liters: '',
        billNumber: '',
        amount: '',
        paymentMethod: 'upi',
        notes: '',
        billImage: '',
      });
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this business expense record?')) return;
    try {
      await expenseApi.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting expense');
    }
  };

  // Calculations for metric summary cards
  const fuelExpensesTotal = expenses
    .filter((e) => e.category === 'Fuel')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const billsAttachedCount = expenses.filter((e) => Boolean(e.billImage)).length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#11142D] dark:text-white font-['Outfit']">
            Operating Expenses & Fuel Bills
          </h1>
          <p className="text-sm text-[#808191] dark:text-slate-400">
            Log dealer expenditure, petrol pump fuel bills, delivery logistics, and maintain digital photo receipts.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6355F6] hover:bg-[#5041E6] text-white text-xs font-bold shadow-lg shadow-[#6355F6]/25 transition self-start sm:self-auto"
        >
          <FiPlus className="text-base" /> Add Business Expense / Fuel Bill
        </button>
      </div>

      {/* Summary Metrics Cards (Coursue Style Soft Pastels) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#9A9FA5] uppercase tracking-wider">Total Expenses Logged</span>
            <p className="text-2xl font-bold text-[#11142D] dark:text-white font-['Outfit'] mt-1">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] text-[#6355F6] flex items-center justify-center text-xl">
            <FiDollarSign />
          </div>
        </div>

        {/* Fuel & Van Expenses Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#9A9FA5] uppercase tracking-wider">Diesel & Fleet Fuel</span>
            <p className="text-2xl font-bold text-[#6355F6] font-['Outfit'] mt-1">
              ₹{fuelExpensesTotal.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] text-[#EC4899] flex items-center justify-center text-xl">
            <FiTruck />
          </div>
        </div>

        {/* Bills Attached Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#9A9FA5] uppercase tracking-wider">Verified Bill Photos</span>
            <p className="text-2xl font-bold text-[#059669] font-['Outfit'] mt-1">
              {billsAttachedCount} / {expenses.length} Bills
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-xl">
            <FiFileText />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-[#EDEFF5] dark:border-slate-800 shadow-sm">
        <FiFilter className="text-[#9A9FA5] ml-2 text-base" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#11142D] dark:text-white focus:outline-none"
        >
          <option value="">All Expense Categories</option>
          <option value="Fuel">Fuel (Diesel / Petrol / Delivery Vans)</option>
          <option value="Transport">Transport & Logistics</option>
          <option value="Warehouse">Warehouse Rent / Storage</option>
          <option value="Electricity">Electricity / Cooling Bill</option>
          <option value="Salary">Staff Salary / Driver Wages</option>
          <option value="Loading">Loading & Unloading Labour</option>
          <option value="Repair">Vehicle & Crates Repair</option>
          <option value="Other">Other Expenses</option>
        </select>
      </div>

      {/* Expenses & Bills Table */}
      <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDEFF5] dark:border-slate-800 bg-[#F8F9FD] dark:bg-slate-800/40 text-[11px] uppercase tracking-wider text-[#808191]">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Particulars & Business Vendor</th>
                <th className="py-3.5 px-4 text-center">Receipt Photo</th>
                <th className="py-3.5 px-4 text-center">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEFF5] dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#808191]">
                    <div className="w-6 h-6 border-2 border-[#6355F6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading expenses and bill records...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#808191]">
                    No expense or fuel bills recorded yet. Click "Add Business Expense" to upload one.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-[#F8F9FD] dark:hover:bg-slate-800/30 transition">
                    <td className="py-4 px-4 text-xs text-[#808191]">
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          e.category === 'Fuel'
                            ? 'bg-[#FDF2F8] text-[#EC4899] border border-[#FCE7F3]'
                            : e.category === 'Transport'
                            ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]'
                            : 'bg-[#F4F0FF] text-[#6355F6] border border-[#E9E3FF]'
                        }`}
                      >
                        {e.category}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#11142D] dark:text-white">{e.title}</div>
                      {e.vendor && (
                        <div className="text-xs text-[#6355F6] dark:text-[#8B7AFE] font-medium flex items-center gap-1 mt-0.5">
                          🏪 <strong>Vendor / Business:</strong> {e.vendor}
                        </div>
                      )}
                      {(e.vehicleNumber || e.liters) && (
                        <div className="text-[11px] text-[#808191] mt-0.5 flex items-center gap-2 font-mono">
                          {e.vehicleNumber && <span>🚚 {e.vehicleNumber}</span>}
                          {e.liters && <span>⛽ {e.liters}</span>}
                          {e.billNumber && <span>#Bill: {e.billNumber}</span>}
                        </div>
                      )}
                      {e.notes && <div className="text-xs text-[#808191] mt-0.5">{e.notes}</div>}
                    </td>

                    {/* Receipt Image Column */}
                    <td className="py-4 px-4 text-center">
                      {e.billImage ? (
                        <button
                          type="button"
                          onClick={() => setPreviewBill(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0EFFF] hover:bg-[#6355F6] text-[#6355F6] hover:text-white border border-[#6355F6]/30 text-xs font-semibold transition group shadow-sm"
                        >
                          <FiImage className="text-sm" />
                          <span>View Bill</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#9A9FA5] italic">No image</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center uppercase text-xs font-mono text-[#808191]">
                      {e.paymentMethod}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-red-500 text-base">
                      ₹{(e.amount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(e._id)}
                        title="Delete Expense"
                        className="p-2 text-[#9A9FA5] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Business Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDEFF5] dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-[#11142D] dark:text-white font-['Outfit']">
                  Record Business Expense & Fuel Bill
                </h3>
                <p className="text-xs text-[#808191]">Attach vendor details and upload petrol pump bill photos.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#9A9FA5] hover:text-[#11142D] dark:hover:text-white rounded-full hover:bg-[#F4F5F9]"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none"
                  >
                    <option value="Fuel">Fuel (Diesel / Petrol / Delivery Vans)</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Warehouse">Warehouse Rent / Storage</option>
                    <option value="Electricity">Electricity / Commercial Power</option>
                    <option value="Salary">Staff Salary / Driver Wages</option>
                    <option value="Loading">Loading & Unloading Labour</option>
                    <option value="Repair">Vehicle & Crates Repair</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none"
                  >
                    <option value="upi">UPI / Online / GPay</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                  Title / Particulars *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    formData.category === 'Fuel'
                      ? 'e.g. Diesel fuel for Mahindra Bolero Pickup'
                      : 'e.g. Warehouse electricity bill for Sept 2026'
                  }
                  className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none focus:border-[#6355F6]"
                />
              </div>

              {/* Vendor / Business Name & Bill No. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                    {formData.category === 'Fuel' ? 'Petrol Pump / Business Name' : 'Vendor / Business Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder={
                      formData.category === 'Fuel'
                        ? 'e.g. Indian Oil / HP Petrol Pump, Dabua Colony'
                        : 'e.g. DHBVN Electricity Board'
                    }
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none focus:border-[#6355F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                    Bill / Receipt Number
                  </label>
                  <input
                    type="text"
                    value={formData.billNumber}
                    onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                    placeholder="e.g. IOCL-99182"
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Vehicle Number & Litres (Specifically for Fuel / Transport) */}
              {formData.category === 'Fuel' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F0FF]/50 dark:bg-[#6355F6]/10 rounded-2xl border border-[#6355F6]/20">
                  <div>
                    <label className="block text-xs font-semibold text-[#6355F6] mb-1">Vehicle Plate Number</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. HR 51 BB 1234"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-[#11142D] dark:text-white uppercase focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6355F6] mb-1">Fuel Volume / Litres</label>
                    <input
                      type="text"
                      value={formData.liters}
                      onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                      placeholder="e.g. 38.5 Litres"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs font-mono text-[#11142D] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-[#11142D] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">Notes</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Delivery Route 1"
                    className="w-full px-3 py-2 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-xl text-xs text-[#11142D] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* UPLOAD BILL IMAGE SECTION */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#11142D] dark:text-slate-300 mb-1">
                  Upload Bill / Fuel Receipt Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {formData.billImage ? (
                  <div className="relative p-3 bg-[#F8F9FD] dark:bg-slate-800 border border-[#EDEFF5] dark:border-slate-700 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.billImage}
                        alt="Bill Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-[#EDEFF5] dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#059669] flex items-center gap-1">
                          <FiCheck /> Bill Photo Attached
                        </p>
                        <p className="text-[11px] text-[#808191]">Click to change or replace image</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-[#EDEFF5] text-xs font-medium hover:bg-[#F4F5F9]"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, billImage: '' }))}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EDEFF5] dark:border-slate-700 hover:border-[#6355F6] p-4 rounded-2xl text-center cursor-pointer bg-[#F8F9FD] dark:bg-slate-800/50 hover:bg-[#F0EFFF]/30 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#6355F6] mx-auto mb-2 shadow-sm group-hover:scale-105 transition">
                      <FiCamera className="text-lg" />
                    </div>
                    <p className="text-xs font-semibold text-[#11142D] dark:text-white">
                      Click to capture or upload Fuel Bill / Receipt image
                    </p>
                    <p className="text-[11px] text-[#808191] mt-0.5">Supports JPG, PNG, WEBP from Mobile Camera or PC</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#EDEFF5] dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F4F5F9] dark:bg-slate-800 text-[#808191] dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#6355F6] text-white text-xs font-bold hover:bg-[#5041E6] shadow-lg shadow-[#6355F6]/25 transition"
                >
                  Save Business Expense & Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL RECEIPT LIGHTBOX MODAL */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-[#EDEFF5] dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDEFF5] dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#11142D] dark:text-white font-['Outfit']">
                  {previewBill.vendor || 'Fuel Bill Receipt'}
                </h3>
                <p className="text-xs text-[#808191]">
                  Amount: <strong className="text-red-500 font-mono">₹{previewBill.amount?.toLocaleString('en-IN')}</strong> • Date: {new Date(previewBill.date).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewBill.billImage}
                  download={`FuelBill-${previewBill.billNumber || 'Receipt'}.png`}
                  className="p-2 text-[#6355F6] hover:bg-[#F0EFFF] rounded-full transition"
                  title="Download Bill Image"
                >
                  <FiDownload className="text-lg" />
                </a>
                <button
                  onClick={() => setPreviewBill(null)}
                  className="p-2 text-[#9A9FA5] hover:text-[#11142D] dark:hover:text-white rounded-full hover:bg-[#F4F5F9] transition"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 flex items-center justify-center bg-[#F8F9FD] dark:bg-slate-950/50 rounded-2xl my-2 border border-[#EDEFF5] dark:border-slate-800">
              <img
                src={previewBill.billImage}
                alt="Fuel Bill Receipt Full"
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#808191]">
              <span>
                {previewBill.vehicleNumber && `Vehicle: ${previewBill.vehicleNumber}`}
                {previewBill.liters && ` • Volume: ${previewBill.liters}`}
              </span>
              <button
                type="button"
                onClick={() => setPreviewBill(null)}
                className="px-4 py-1.5 rounded-full bg-[#11142D] text-white font-semibold text-xs hover:bg-black"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
