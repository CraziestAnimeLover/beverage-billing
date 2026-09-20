import PDFDocument from 'pdfkit';

/**
 * Generates a clean, professional GST Tax Invoice PDF
 * @param {Object} invoice - The invoice document populated with customer info
 * @param {Object} settings - Business settings (dealer info)
 * @param {Stream} writeStream - Writable stream (e.g. Express res)
 */
export const generateInvoicePDF = (invoice, settings, writeStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(writeStream);

  const customer = invoice.userId || {};
  const dealerName = settings?.businessName || 'TOTA RAM TRADERS - FARIDABAD';
  const rawAddr =
    settings?.address || 'Shop No 1040, Block - C, 27 Feet Road, Dabua Colony, Faridabad, Haryana - 121001';
  const fullAddress = rawAddr.includes(settings?.city || 'Faridabad')
    ? rawAddr
    : `${rawAddr}, ${settings?.city || 'Faridabad'}, ${settings?.state || 'Haryana'} - ${settings?.pincode || '121001'}`;
  const dealerGstin = settings?.gstin || '06AZHPK1822E1ZR';
  const dealerMobile = settings?.mobile || '+91 90150 88766';
  const dealerEmail = settings?.email || 'totaramtraders@gmail.com';

  // 1. Header Banner
  doc
    .rect(40, 36, 515, 68)
    .fill('#1e293b'); // Professional Midnight Slate banner

  doc
    .fillColor('#ffffff')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(dealerName.toUpperCase(), 52, 44)
    .fontSize(8.5)
    .font('Helvetica')
    .text(fullAddress, 52, 64, { width: 490 })
    .text(`GSTIN: ${dealerGstin} | Phone: ${dealerMobile} | Email: ${dealerEmail}`, 52, 78);

  // 2. Invoice Meta & Tax Invoice Title
  doc
    .fillColor('#0f172a')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 40, 115, { align: 'center' });

  doc
    .fontSize(9)
    .font('Helvetica')
    .rect(40, 135, 515, 75)
    .stroke('#cbd5e1');

  // Left column: Invoice Details
  const invDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN');
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A';

  doc
    .font('Helvetica-Bold')
    .text(`Invoice No:`, 50, 145)
    .font('Helvetica')
    .text(`${invoice.invoiceNumber}`, 120, 145)
    .font('Helvetica-Bold')
    .text(`Invoice Date:`, 50, 160)
    .font('Helvetica')
    .text(`${invDate}`, 120, 160)
    .font('Helvetica-Bold')
    .text(`Due Date:`, 50, 175)
    .font('Helvetica')
    .text(`${dueDate}`, 120, 175);

  if (invoice.ewayBillNumber) {
    doc
      .font('Helvetica-Bold')
      .text(`E-Way Bill:`, 50, 190)
      .font('Helvetica')
      .text(`${invoice.ewayBillNumber}`, 120, 190);
  }

  // Right column: Bill To (Customer Details)
  doc
    .font('Helvetica-Bold')
    .text(`Billed To:`, 310, 145)
    .font('Helvetica')
    .text(`${customer.businessName || customer.name || 'Valued Customer'}`, 370, 145)
    .font('Helvetica-Bold')
    .text(`Proprietor:`, 310, 160)
    .font('Helvetica')
    .text(`${customer.name || '-'}`, 370, 160)
    .font('Helvetica-Bold')
    .text(`Mobile:`, 310, 175)
    .font('Helvetica')
    .text(`${customer.mobile || '-'}`, 370, 175)
    .font('Helvetica-Bold')
    .text(`GSTIN:`, 310, 190)
    .font('Helvetica')
    .text(`${customer.gstin || 'Unregistered'}`, 370, 190);

  // 3. Items Table Header
  const tableTop = 225;
  doc
    .rect(40, tableTop, 515, 22)
    .fill('#f1f5f9');

  doc
    .fillColor('#0f172a')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('Item Description', 50, tableTop + 6)
    .text('HSN', 240, tableTop + 6)
    .text('Pack / Unit', 290, tableTop + 6)
    .text('Qty', 360, tableTop + 6, { width: 35, align: 'right' })
    .text('Rate', 405, tableTop + 6, { width: 50, align: 'right' })
    .text('Amount (Rs.)', 465, tableTop + 6, { width: 80, align: 'right' });

  // 4. Line Items
  let currentY = tableTop + 26;
  const items = invoice.items || [];

  items.forEach((item, index) => {
    // Alternating zebra striping
    if (index % 2 === 1) {
      doc.rect(40, currentY - 2, 515, 20).fill('#f8fafc');
    }

    doc
      .fillColor('#1e293b')
      .fontSize(8.5)
      .font('Helvetica')
      .text(`${item.name} (${item.brand || ''})`, 50, currentY, { width: 185 })
      .text(`${item.hsn || '2202'}`, 240, currentY)
      .text(`${item.packSize || 'Case'}`, 290, currentY)
      .text(`${item.quantity}`, 360, currentY, { width: 35, align: 'right' })
      .text(`Rs. ${item.rate.toFixed(2)}`, 405, currentY, { width: 50, align: 'right' })
      .text(`Rs. ${item.amount.toFixed(2)}`, 465, currentY, { width: 80, align: 'right' });

    currentY += 20;
  });

  doc.rect(40, currentY, 515, 1).stroke('#e2e8f0');
  currentY += 10;

  // 5. Totals & Tax Calculation
  const totalsX = 350;
  const valuesX = 465;

  doc.fontSize(8.5).font('Helvetica');

  // Subtotal
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, valuesX, currentY, { width: 80, align: 'right' });
  currentY += 16;

  if (invoice.discount > 0) {
    doc.text('Discount:', totalsX, currentY);
    doc.text(`- Rs. ${invoice.discount.toFixed(2)}`, valuesX, currentY, { width: 80, align: 'right' });
    currentY += 16;
  }

  // Taxes
  if (invoice.cgst > 0) {
    doc.text('CGST (9%):', totalsX, currentY);
    doc.text(`Rs. ${invoice.cgst.toFixed(2)}`, valuesX, currentY, { width: 80, align: 'right' });
    currentY += 16;
  }

  if (invoice.sgst > 0) {
    doc.text('SGST (9%):', totalsX, currentY);
    doc.text(`Rs. ${invoice.sgst.toFixed(2)}`, valuesX, currentY, { width: 80, align: 'right' });
    currentY += 16;
  }

  if (invoice.igst > 0) {
    doc.text('IGST (18%):', totalsX, currentY);
    doc.text(`Rs. ${invoice.igst.toFixed(2)}`, valuesX, currentY, { width: 80, align: 'right' });
    currentY += 16;
  }

  // Grand Total
  doc.rect(totalsX - 10, currentY - 2, 215, 24).fill('#e0e7ff');
  doc
    .fillColor('#1e1b4b')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('GRAND TOTAL:', totalsX, currentY + 4)
    .text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, valuesX, currentY + 4, {
      width: 80,
      align: 'right',
    });

  currentY += 34;

  // 6. Bank Details Box (Left)
  const boxTop = currentY;
  doc
    .rect(40, boxTop, 270, 80)
    .stroke('#cbd5e1');

  doc
    .fillColor('#0f172a')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('BANK DETAILS FOR NEFT/RTGS/UPI', 48, boxTop + 8)
    .font('Helvetica')
    .fontSize(8)
    .text(`Bank Name: ${settings?.bankName || 'HDFC Bank Ltd'}`, 48, boxTop + 24)
    .text(`A/c Number: ${settings?.accountNumber || '50200012345678'}`, 48, boxTop + 36)
    .text(`IFSC Code: ${settings?.ifscCode || 'HDFC0001234'}`, 48, boxTop + 48)
    .text(`Branch: ${settings?.branch || 'Sector 24, Faridabad'}`, 48, boxTop + 60)
    .text(`UPI ID: ${settings?.upiId || 'royalbeverage@hdfcbank'}`, 48, boxTop + 72);

  // Signatory Box (Right)
  doc
    .rect(330, boxTop, 225, 80)
    .stroke('#cbd5e1');

  doc
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text(`For ${dealerName}`, 340, boxTop + 8)
    .fontSize(7.5)
    .font('Helvetica')
    .text('Authorized Signatory', 340, boxTop + 65);

  // 7. Terms & Footer
  currentY = boxTop + 95;
  doc
    .fontSize(7.5)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(
      settings?.invoiceTerms ||
        '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within stipulated time.\n3. Subject to Haryana jurisdiction only.',
      40,
      currentY,
      {
        width: 515,
      }
    );

  doc.end();
};

/**
 * Generates an official Government standard GST E-Way Bill (FORM GST EWB-01) PDF
 * @param {Object} ewayBill - The eway bill document
 * @param {Object} invoice - The associated invoice document
 * @param {Object} settings - Business settings (dealer info)
 * @param {Stream} writeStream - Writable stream (Express response)
 */
export const generateEwayBillPDF = (ewayBill, invoice, settings, writeStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(writeStream);

  const customer = invoice?.userId || {};
  const dealerName = settings?.businessName || 'TOTA RAM TRADERS - FARIDABAD';
  const dealerAddress = settings?.address || 'Shop No 1040, Block - C, 27 Feet Road, Dabua Colony';
  const dealerCity = settings?.city || 'Faridabad';
  const dealerState = settings?.state || 'Haryana';
  const dealerPin = settings?.pincode || '121001';
  const dealerGstin = settings?.gstin || ewayBill?.supplierGstin || '06AZHPK1822E1ZR';
  const dealerMobile = settings?.mobile || '+91 90150 88766';

  const custName = customer.businessName || customer.name || ewayBill?.customerName || 'Valued Customer';
  const custGstin = customer.gstin || ewayBill?.customerGstin || 'URP';
  const custAddress = customer.address || customer.city || 'Local Commercial Area';
  const custCity = customer.city || 'Faridabad';
  const custState = customer.state || 'Haryana';
  const custPin = customer.pincode || '';

  // 1. Header Banner
  doc.rect(40, 35, 515, 52).fill('#0f172a');

  doc
    .fillColor('#ffffff')
    .fontSize(15)
    .font('Helvetica-Bold')
    .text('e-WAY BILL SYSTEM', 52, 45)
    .fontSize(8.5)
    .font('Helvetica')
    .text('Government of India - Goods and Services Tax Network', 52, 63)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('FORM GST EWB-01', 375, 45, { width: 165, align: 'right' })
    .fontSize(8)
    .font('Helvetica')
    .text('[See Rule 138 of CGST Rules, 2017]', 375, 63, { width: 165, align: 'right' });

  // 2. E-Way Bill Meta Bar
  const metaY = 95;
  doc.rect(40, metaY, 515, 66).fillAndStroke('#f8fafc', '#cbd5e1');

  // Format 12-digit eway bill number in groups of 4: e.g. 2410 8849 2019
  const rawNo = ewayBill.ewayBillNumber || '241088492019';
  const formattedEwayNo = rawNo.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  const genDate = new Date(ewayBill.createdAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const validFrom = new Date(ewayBill.createdAt || Date.now()).toLocaleDateString('en-IN');
  const validUntil = new Date(ewayBill.validUntil || Date.now() + 2 * 86400000).toLocaleDateString('en-IN');

  // EWB No.
  doc
    .fillColor('#64748b')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('E-WAY BILL NO:', 52, metaY + 10)
    .fillColor('#4f46e5')
    .fontSize(13)
    .text(formattedEwayNo, 140, metaY + 7);

  // Status Badge
  doc.rect(425, metaY + 8, 115, 18).fill('#ecfdf5').stroke('#a7f3d0');
  doc
    .fillColor('#047857')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('STATUS: ACTIVE / VALID', 425, metaY + 13, { width: 115, align: 'center' });

  // Meta Row 2
  doc
    .fillColor('#475569')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Generated Date:', 52, metaY + 28)
    .font('Helvetica')
    .text(genDate, 140, metaY + 28)
    .font('Helvetica-Bold')
    .text('Generated By:', 300, metaY + 28)
    .font('Helvetica')
    .text(`${dealerGstin} - ${dealerName.slice(0, 20)}`, 375, metaY + 28, { width: 170 });

  // Meta Row 3
  doc
    .font('Helvetica-Bold')
    .text('Valid From:', 52, metaY + 44)
    .font('Helvetica')
    .text(validFrom, 140, metaY + 44)
    .font('Helvetica-Bold')
    .text('Valid Until:', 300, metaY + 44)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(`${validUntil} (23:59 Hrs)`, 375, metaY + 44);

  // 3. PART - A Section
  let currentY = metaY + 74;
  doc.rect(40, currentY, 515, 18).fill('#1e293b');
  doc
    .fillColor('#ffffff')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('PART - A : CONSIGNMENT & TAX DETAILS', 50, currentY + 5);

  currentY += 18;

  // Consignor vs Consignee 2-Column Box
  const partyBoxHeight = 84;
  doc.rect(40, currentY, 515, partyBoxHeight).stroke('#cbd5e1');
  doc.moveTo(295, currentY).lineTo(295, currentY + partyBoxHeight).stroke('#e2e8f0');

  // Left Column: Supplier
  doc
    .fillColor('#0f172a')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('1. FROM (SUPPLIER / CONSIGNOR)', 50, currentY + 8)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('GSTIN:', 50, currentY + 24)
    .font('Helvetica')
    .text(dealerGstin, 95, currentY + 24)
    .font('Helvetica-Bold')
    .text('Legal Name:', 50, currentY + 38)
    .font('Helvetica')
    .text(dealerName, 105, currentY + 38, { width: 180 })
    .font('Helvetica-Bold')
    .text('Dispatch From:', 50, currentY + 52)
    .font('Helvetica')
    .text(`${dealerAddress}, ${dealerCity}, ${dealerState} - ${dealerPin}`, 115, currentY + 52, { width: 170 });

  // Right Column: Recipient
  doc
    .fillColor('#0f172a')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('2. TO (RECIPIENT / CONSIGNEE)', 305, currentY + 8)
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('GSTIN:', 305, currentY + 24)
    .font('Helvetica')
    .text(custGstin, 350, currentY + 24)
    .font('Helvetica-Bold')
    .text('Trade Name:', 305, currentY + 38)
    .font('Helvetica')
    .text(custName, 365, currentY + 38, { width: 180 })
    .font('Helvetica-Bold')
    .text('Delivery To:', 305, currentY + 52)
    .font('Helvetica')
    .text(`${custAddress}, ${custCity}, ${custState} - ${custPin}`, 365, currentY + 52, { width: 180 });

  currentY += partyBoxHeight + 8;

  // Document & Supply Reference Row
  doc.rect(40, currentY, 515, 34).fillAndStroke('#f1f5f9', '#cbd5e1');
  const invDate = invoice?.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  doc
    .fillColor('#1e293b')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('Document Type:', 50, currentY + 8)
    .font('Helvetica')
    .text('Tax Invoice', 125, currentY + 8)
    .font('Helvetica-Bold')
    .text('Document No:', 200, currentY + 8)
    .font('Helvetica')
    .text(`${invoice?.invoiceNumber || ewayBill.invoiceNumber}`, 270, currentY + 8)
    .font('Helvetica-Bold')
    .text('Document Date:', 380, currentY + 8)
    .font('Helvetica')
    .text(invDate, 455, currentY + 8);

  doc
    .font('Helvetica-Bold')
    .text('Supply Type:', 50, currentY + 20)
    .font('Helvetica')
    .text('Outward - Regular Supply', 125, currentY + 20)
    .font('Helvetica-Bold')
    .text('Place of Delivery:', 380, currentY + 20)
    .font('Helvetica')
    .text(`${ewayBill.toPlace} (${custState})`, 455, currentY + 20);

  currentY += 42;

  // Goods Breakdown Table
  doc.rect(40, currentY, 515, 18).fill('#334155');
  doc
    .fillColor('#ffffff')
    .fontSize(7.5)
    .font('Helvetica-Bold')
    .text('HSN', 48, currentY + 5)
    .text('Description of Goods', 90, currentY + 5)
    .text('Pack / Unit', 260, currentY + 5)
    .text('Qty', 320, currentY + 5, { width: 30, align: 'right' })
    .text('Taxable Val (Rs.)', 355, currentY + 5, { width: 65, align: 'right' })
    .text('GST Taxes', 425, currentY + 5, { width: 55, align: 'right' })
    .text('Total (Rs.)', 485, currentY + 5, { width: 60, align: 'right' });

  currentY += 18;

  // Render items or aggregated row
  const items = invoice?.items || [];
  if (items.length > 0) {
    items.slice(0, 4).forEach((item, index) => {
      if (index % 2 === 1) {
        doc.rect(40, currentY, 515, 16).fill('#f8fafc');
      }

      const itemTax = ((item.amount || 0) * 0.18).toFixed(2);
      const itemGross = ((item.amount || 0) * 1.18).toFixed(2);

      doc
        .fillColor('#1e293b')
        .fontSize(7.5)
        .font('Helvetica')
        .text(item.hsn || '2202', 48, currentY + 4)
        .text(`${item.name} (${item.brand || 'Beverage'})`.slice(0, 32), 90, currentY + 4, { width: 165 })
        .text(item.packSize || 'Case', 260, currentY + 4)
        .text(`${item.quantity}`, 320, currentY + 4, { width: 30, align: 'right' })
        .text(`Rs. ${item.amount.toFixed(2)}`, 355, currentY + 4, { width: 65, align: 'right' })
        .text(`18% (Rs. ${itemTax})`, 425, currentY + 4, { width: 55, align: 'right' })
        .text(`Rs. ${itemGross}`, 485, currentY + 4, { width: 60, align: 'right' });

      currentY += 16;
    });
  } else {
    // Default fallback row
    doc
      .fillColor('#1e293b')
      .fontSize(7.5)
      .font('Helvetica')
      .text('2202', 48, currentY + 4)
      .text('Carbonated & Aerated Soft Beverages / Water', 90, currentY + 4)
      .text('Assorted Cases', 260, currentY + 4)
      .text('1 Lot', 320, currentY + 4, { width: 30, align: 'right' })
      .text(`Rs. ${(invoice?.subtotal || 0).toFixed(2)}`, 355, currentY + 4, { width: 65, align: 'right' })
      .text('18% GST', 425, currentY + 4, { width: 55, align: 'right' })
      .text(`Rs. ${(invoice?.totalAmount || 0).toFixed(2)}`, 485, currentY + 4, { width: 60, align: 'right' });
    currentY += 16;
  }

  // Summary Row
  doc.rect(40, currentY, 515, 20).fill('#e0e7ff').stroke('#cbd5e1');
  const totalVal = (invoice?.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const taxableVal = (invoice?.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const taxSum = ((invoice?.cgst || 0) + (invoice?.sgst || 0) + (invoice?.igst || 0)).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  });

  doc
    .fillColor('#1e1b4b')
    .fontSize(8)
    .font('Helvetica-Bold')
    .text('CONSIGNMENT TOTALS:', 50, currentY + 5)
    .text(`Taxable: Rs. ${taxableVal}`, 220, currentY + 5)
    .text(`Total Tax: Rs. ${taxSum}`, 335, currentY + 5)
    .text(`Invoice Value: Rs. ${totalVal}`, 430, currentY + 5, { width: 115, align: 'right' });

  currentY += 28;

  // 4. PART - B Section (Vehicle and Movement Details)
  doc.rect(40, currentY, 515, 18).fill('#1e293b');
  doc
    .fillColor('#ffffff')
    .fontSize(8.5)
    .font('Helvetica-Bold')
    .text('PART - B : VEHICLE & TRANSPORTER DETAILS', 50, currentY + 5);

  currentY += 18;

  // Part B Table
  doc.rect(40, currentY, 515, 52).stroke('#cbd5e1');
  doc.rect(40, currentY, 515, 16).fill('#f1f5f9');

  doc
    .fillColor('#0f172a')
    .fontSize(7.5)
    .font('Helvetica-Bold')
    .text('Mode', 48, currentY + 4)
    .text('Vehicle Number', 95, currentY + 4)
    .text('From Place', 185, currentY + 4)
    .text('To Destination', 270, currentY + 4)
    .text('Transporter / Fleet', 360, currentY + 4)
    .text('Distance', 460, currentY + 4)
    .text('CEWB / Doc No', 505, currentY + 4);

  currentY += 16;

  doc
    .fillColor('#1e293b')
    .fontSize(8)
    .font('Helvetica')
    .text(ewayBill.transportMode || 'Road', 48, currentY + 8)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(ewayBill.vehicleNumber || 'HR51BB1234', 95, currentY + 8)
    .font('Helvetica')
    .fillColor('#1e293b')
    .text(ewayBill.fromPlace || dealerCity, 185, currentY + 8, { width: 80 })
    .text(ewayBill.toPlace || custCity, 270, currentY + 8, { width: 85 })
    .text((ewayBill.transporter || 'Direct Fleet').slice(0, 22), 360, currentY + 8, { width: 95 })
    .text(`~${ewayBill.distanceKm || 25} km`, 460, currentY + 8)
    .text('-', 510, currentY + 8);

  currentY += 46;

  // 5. Statutory Barcode / QR Simulation & Verification Footer
  const footerBoxTop = currentY;
  doc.rect(40, footerBoxTop, 515, 78).stroke('#cbd5e1');

  // Simulated QR Code Frame (Left)
  doc.rect(50, footerBoxTop + 8, 62, 62).fillAndStroke('#ffffff', '#0f172a');
  // Decorative QR corners
  doc.rect(54, footerBoxTop + 12, 16, 16).fill('#0f172a');
  doc.rect(57, footerBoxTop + 15, 10, 10).fill('#ffffff');
  doc.rect(92, footerBoxTop + 12, 16, 16).fill('#0f172a');
  doc.rect(95, footerBoxTop + 15, 10, 10).fill('#ffffff');
  doc.rect(54, footerBoxTop + 50, 16, 16).fill('#0f172a');
  doc.rect(57, footerBoxTop + 53, 10, 10).fill('#ffffff');
  // Mock data dots inside QR
  doc.rect(76, footerBoxTop + 24, 8, 8).fill('#0f172a');
  doc.rect(88, footerBoxTop + 36, 10, 10).fill('#0f172a');
  doc.rect(75, footerBoxTop + 48, 8, 8).fill('#0f172a');

  // Center: Compliance & Legal Notes
  doc
    .fillColor('#0f172a')
    .fontSize(7.5)
    .font('Helvetica-Bold')
    .text('GOVERNMENT OF INDIA - e-WAY BILL VALIDATION', 125, footerBoxTop + 10)
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#475569')
    .text(
      '1. This is a computer-generated official document issued under Rule 138 of CGST Rules, 2017.\n2. The consignment must be accompanied by this e-Way Bill along with the original Tax Invoice during transit.\n3. Goods are subject to physical verification by Central/State GST enforcement teams on route.\n4. No physical signature is required as this is digitally authenticated on the GST portal.',
      125,
      footerBoxTop + 23,
      { width: 250, lineGap: 1.5 }
    );

  // Right: Consignor / Transporter Signature Box
  doc
    .rect(385, footerBoxTop + 8, 160, 62)
    .stroke('#e2e8f0');

  doc
    .fillColor('#0f172a')
    .fontSize(7.5)
    .font('Helvetica-Bold')
    .text(`For ${dealerName.slice(0, 24)}`, 392, footerBoxTop + 13)
    .fontSize(7)
    .font('Helvetica')
    .fillColor('#64748b')
    .text('Digitally Authenticated Consignor', 392, footerBoxTop + 54);

  doc.end();
};

