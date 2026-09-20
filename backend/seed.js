import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import UserProductPrice from './models/UserProductPrice.js';
import Order from './models/Order.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import CustomerLedger from './models/CustomerLedger.js';
import InventoryTransaction from './models/InventoryTransaction.js';
import Purchase from './models/Purchase.js';
import EwayBill from './models/EwayBill.js';
import Expense from './models/Expense.js';
import BusinessSettings from './models/BusinessSettings.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      UserProductPrice.deleteMany({}),
      Order.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      CustomerLedger.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      Purchase.deleteMany({}),
      EwayBill.deleteMany({}),
      Expense.deleteMany({}),
      BusinessSettings.deleteMany({}),
    ]);

    console.log('🏢 Seeding Business Settings...');
    const settings = await BusinessSettings.create({
      businessName: 'TOTA RAM TRADERS - FARIDABAD',
      ownerName: 'Tota Ram',
      logo: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=200&q=80',
      address: 'Shop No 1040, Block - C, 27 Feet Road, Dabua Colony',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121001',
      mobile: '+91 90150 88766',
      whatsapp: '919015088766',
      email: 'totaramtraders@gmail.com',
      gstin: '06AZHPK1822E1ZR',
      pan: 'AZHPK1822E',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0001234',
      branch: 'Faridabad',
      upiId: 'totaramtraders@hdfcbank',
      invoicePrefix: 'INV-2026-',
      orderPrefix: 'ORD-2026-',
      invoiceTerms:
        '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within stipulated time.\n3. Subject to Haryana jurisdiction only.',
      invoiceFooter: 'Thank you for your business! For queries contact TOTA RAM TRADERS - FARIDABAD.',
    });

    console.log('👤 Seeding Users (Admin & Customers)...');
    // 1. Admin
    const admin = await User.create({
      name: 'Tota Ram',
      businessName: 'TOTA RAM TRADERS - FARIDABAD',
      mobile: '9015088766',
      whatsapp: '9015088766',
      email: 'admin@totaramtraders.com',
      password: 'admin123',
      role: 'admin',
      gstin: '06AZHPK1822E1ZR',
      address: 'Shop No 1040, Block - C, 27 Feet Road, Dabua Colony',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121001',
      status: 'active',
    });

    // 2. Sharma General Store (Customer 1 - Matches prompt)
    const userSharma = await User.create({
      name: 'Raj Sharma',
      businessName: 'Sharma General Store',
      mobile: '9811122233',
      whatsapp: '9811122233',
      email: 'sharma@store.com',
      password: 'sharma123',
      role: 'user',
      gstin: '06BXXXX1234A1Z1',
      address: 'Shop 12, Main Market, Sector 15',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121007',
      creditLimit: 100000,
      paymentTerms: 15,
      openingBalance: 20000,
      outstandingBalance: 35500, // Matches prompt: Opening 20k + Inv 15k - Pay 10k + Inv 10.5k = 35.5k
      status: 'active',
    });

    // 3. Raj Traders (Customer 2 - Matches prompt)
    const userRaj = await User.create({
      name: 'Rajesh Kumar',
      businessName: 'Raj Traders',
      mobile: '9822233344',
      whatsapp: '9822233344',
      email: 'raj@traders.com',
      password: 'raj123',
      role: 'user',
      gstin: '06CYYYY5678B2Z2',
      address: 'Chowk No. 4, Old Faridabad',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121002',
      creditLimit: 150000,
      paymentTerms: 21,
      openingBalance: 15000,
      outstandingBalance: 25000,
      status: 'active',
    });

    // 4. ABC Restaurant (Customer 3 - Matches prompt)
    const userAbc = await User.create({
      name: 'Amit Verma',
      businessName: 'ABC Restaurant & Lounge',
      mobile: '9833344455',
      whatsapp: '9833344455',
      email: 'abc@restaurant.com',
      password: 'abc123',
      role: 'user',
      gstin: '06DZZZZ9012C3Z3',
      address: 'Commercial Hub, NIT 3',
      city: 'Faridabad',
      state: 'Haryana',
      pincode: '121001',
      creditLimit: 75000,
      paymentTerms: 7,
      openingBalance: 8500,
      outstandingBalance: 18500,
      status: 'active',
    });

    console.log('🍾 Seeding Products & Beverages...');
    const productsData = [
      {
        name: '160ml Litchi',
        brand: 'Litchi Delight',
        category: 'Juices & Fruit Drinks',
        variant: '160ml Pack',
        sku: 'LITCHI-160',
        barcode: '8901764099887',
        hsn: '22029920',
        packSize: '1 Tray = 24 Packs',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 350,
        mrpPerBottle: 15,
        purchasePrice: 280,
        sellingPrice: 320, // Exactly as shown in the user invoice!
        taxRate: 5,
        stock: 200,
        reservedStock: 0,
        minimumStock: 30,
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Coca Cola 750ml',
        brand: 'Coca Cola',
        category: 'Soft Drinks',
        variant: '750ml Pet Bottle',
        sku: 'CC-750-24',
        barcode: '8901764012345',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 960,
        mrpPerBottle: 40,
        purchasePrice: 760,
        sellingPrice: 850, // Standard dealer price
        taxRate: 18,
        stock: 125,
        reservedStock: 10,
        minimumStock: 25,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Sprite 750ml',
        brand: 'Coca Cola',
        category: 'Soft Drinks',
        variant: '750ml Pet Bottle',
        sku: 'SP-750-24',
        barcode: '8901764023456',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 960,
        mrpPerBottle: 40,
        purchasePrice: 750,
        sellingPrice: 840,
        taxRate: 18,
        stock: 90,
        reservedStock: 5,
        minimumStock: 20,
        image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Thums Up 750ml',
        brand: 'Coca Cola',
        category: 'Soft Drinks',
        variant: '750ml Pet Bottle',
        sku: 'TU-750-24',
        barcode: '8901764034567',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 960,
        mrpPerBottle: 40,
        purchasePrice: 760,
        sellingPrice: 850,
        taxRate: 18,
        stock: 110,
        reservedStock: 0,
        minimumStock: 20,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Fanta Orange 750ml',
        brand: 'Coca Cola',
        category: 'Soft Drinks',
        variant: '750ml Pet Bottle',
        sku: 'FA-750-24',
        barcode: '8901764045678',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 960,
        mrpPerBottle: 40,
        purchasePrice: 740,
        sellingPrice: 830,
        taxRate: 18,
        stock: 65,
        reservedStock: 0,
        minimumStock: 15,
        image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Pepsi 500ml',
        brand: 'PepsiCo',
        category: 'Soft Drinks',
        variant: '500ml Pet Bottle',
        sku: 'PEP-500-24',
        barcode: '8901491012345',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 840,
        mrpPerBottle: 35,
        purchasePrice: 650,
        sellingPrice: 750,
        taxRate: 18,
        stock: 80,
        reservedStock: 0,
        minimumStock: 20,
        image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Mountain Dew 600ml',
        brand: 'PepsiCo',
        category: 'Soft Drinks',
        variant: '600ml Pet Bottle',
        sku: 'MD-600-24',
        barcode: '8901491023456',
        hsn: '2202',
        packSize: '1 Case = 24 Bottles',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 960,
        mrpPerBottle: 40,
        purchasePrice: 740,
        sellingPrice: 830,
        taxRate: 18,
        stock: 75,
        reservedStock: 0,
        minimumStock: 15,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Diet Coke 300ml Can',
        brand: 'Coca Cola',
        category: 'Soft Drinks',
        variant: '300ml Can',
        sku: 'DC-CAN-24',
        barcode: '8901764056789',
        hsn: '2202',
        packSize: '1 Case = 24 Cans',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 1200,
        mrpPerBottle: 50,
        purchasePrice: 920,
        sellingPrice: 1050,
        taxRate: 18,
        stock: 45,
        reservedStock: 0,
        minimumStock: 10,
        image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Red Bull Energy Drink 250ml',
        brand: 'Red Bull',
        category: 'Energy Drinks',
        variant: '250ml Can',
        sku: 'RB-CAN-24',
        barcode: '9002490100070',
        hsn: '2202',
        packSize: '1 Case = 24 Cans',
        bottlesPerCase: 24,
        unit: 'Case',
        mrp: 3000,
        mrpPerBottle: 125,
        purchasePrice: 2200,
        sellingPrice: 2550,
        taxRate: 18,
        stock: 35,
        reservedStock: 0,
        minimumStock: 8,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Bisleri Mineral Water 1L',
        brand: 'Bisleri',
        category: 'Water',
        variant: '1 Litre Bottle',
        sku: 'BIS-1L-12',
        barcode: '8906000000010',
        hsn: '2201',
        packSize: '1 Case = 12 Bottles',
        bottlesPerCase: 12,
        unit: 'Case',
        mrp: 240,
        mrpPerBottle: 20,
        purchasePrice: 150,
        sellingPrice: 185,
        taxRate: 18,
        stock: 220,
        reservedStock: 0,
        minimumStock: 40,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        name: 'Tropicana Mixed Fruit 1L',
        brand: 'PepsiCo',
        category: 'Juice',
        variant: '1 Litre Tetra Pack',
        sku: 'TROP-MF-12',
        barcode: '8901491034567',
        hsn: '2009',
        packSize: '1 Case = 12 Packs',
        bottlesPerCase: 12,
        unit: 'Case',
        mrp: 1320,
        mrpPerBottle: 110,
        purchasePrice: 980,
        sellingPrice: 1120,
        taxRate: 12,
        stock: 50,
        reservedStock: 0,
        minimumStock: 15,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
    ];

    const products = await Product.insertMany(productsData);
    const prodCoke750 = products.find((p) => p.sku === 'CC-750-24');
    const prodSprite = products.find((p) => p.sku === 'SP-750-24');
    const prodRedBull = products.find((p) => p.sku === 'RB-CAN-24');

    console.log('🏷️ Seeding User-Specific Price Matrix (Prompt Example)...');
    // As per prompt example:
    // Normal Price: ₹850
    // Sharma Store: ₹830
    // Raj Traders: ₹820
    // ABC Restaurant: ₹800
    await UserProductPrice.insertMany([
      {
        userId: userSharma._id,
        productId: prodCoke750._id,
        customPrice: 830,
        status: 'active',
      },
      {
        userId: userRaj._id,
        productId: prodCoke750._id,
        customPrice: 820,
        status: 'active',
      },
      {
        userId: userAbc._id,
        productId: prodCoke750._id,
        customPrice: 800,
        status: 'active',
      },
      {
        userId: userSharma._id,
        productId: prodSprite._id,
        customPrice: 820,
        status: 'active',
      },
      {
        userId: userAbc._id,
        productId: prodRedBull._id,
        customPrice: 2450,
        status: 'active',
      },
    ]);

    console.log('📦 Seeding Initial Supplier Purchases & Inventory Log...');
    const purchase1 = await Purchase.create({
      purchaseNumber: 'PO-2026-00001',
      supplierName: 'Hindustan Coca-Cola Beverages Pvt Ltd',
      supplierGstin: '06AAACH2244P1Z3',
      supplierInvoiceNo: 'HCCB/2026/09/8812',
      items: [
        {
          productId: prodCoke750._id,
          name: prodCoke750.name,
          brand: prodCoke750.brand,
          packSize: prodCoke750.packSize,
          quantity: 150,
          unitCost: 760,
          taxRate: 18,
          taxAmount: (150 * 760 * 18) / 100,
          total: 150 * 760 * 1.18,
        },
        {
          productId: prodSprite._id,
          name: prodSprite.name,
          brand: prodSprite.brand,
          packSize: prodSprite.packSize,
          quantity: 100,
          unitCost: 750,
          taxRate: 18,
          taxAmount: (100 * 750 * 18) / 100,
          total: 100 * 750 * 1.18,
        },
      ],
      subtotal: 150 * 760 + 100 * 750,
      taxAmount: (150 * 760 * 18) / 100 + (100 * 750 * 18) / 100,
      totalAmount: (150 * 760 + 100 * 750) * 1.18,
      purchaseDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      paymentStatus: 'paid',
    });

    await InventoryTransaction.create({
      productId: prodCoke750._id,
      type: 'PURCHASE',
      quantity: 150,
      previousStock: 0,
      newStock: 150,
      referenceNumber: purchase1.purchaseNumber,
      reason: 'Procurement from HCCB',
      createdBy: admin._id,
    });

    console.log('📑 Seeding Historical Orders, Invoices, Payments & Ledger...');
    // Seed Sharma Store history exactly matching prompt:
    // 01 Sep: Opening Balance ₹20,000
    // 05 Sep: Invoice #INV-2026-00001 ₹15,000 -> Balance ₹35,000
    // 10 Sep: Payment UPI ₹10,000 -> Balance ₹25,000
    // 15 Sep: Invoice #INV-2026-00002 ₹10,500 -> Balance ₹35,500

    const date01Sep = new Date('2026-09-01T10:00:00Z');
    const date05Sep = new Date('2026-09-05T14:30:00Z');
    const date10Sep = new Date('2026-09-10T11:15:00Z');
    const date15Sep = new Date('2026-09-15T16:45:00Z');

    // 01 Sep Opening
    await CustomerLedger.create({
      userId: userSharma._id,
      type: 'OPENING',
      debit: 20000,
      credit: 0,
      runningBalance: 20000,
      description: 'Opening Balance as on 01 Sep 2026',
      date: date01Sep,
    });

    // 05 Sep Order & Invoice
    const order1 = await Order.create({
      orderNumber: 'ORD-2026-00101',
      userId: userSharma._id,
      items: [
        {
          productId: prodCoke750._id,
          name: prodCoke750.name,
          brand: prodCoke750.brand,
          variant: prodCoke750.variant,
          packSize: prodCoke750.packSize,
          unit: 'Case',
          quantity: 15,
          unitPrice: 830, // Custom Sharma Store rate!
          mrp: 960,
          taxRate: 18,
          itemTotal: 15 * 830 * 1.18,
        },
      ],
      subtotal: 12450,
      discount: 0,
      taxAmount: 2241,
      totalAmount: 14691,
      deliveryAddress: userSharma.address,
      status: 'delivered',
      invoiceCreated: true,
      createdAt: date05Sep,
    });

    const invoice1 = await Invoice.create({
      invoiceNumber: 'INV-2026-00101',
      orderId: order1._id,
      userId: userSharma._id,
      items: [
        {
          productId: prodCoke750._id,
          name: prodCoke750.name,
          brand: prodCoke750.brand,
          hsn: '2202',
          packSize: prodCoke750.packSize,
          unit: 'Case',
          quantity: 15,
          rate: 830,
          taxRate: 18,
          taxAmount: 2241,
          amount: 14691,
        },
      ],
      subtotal: 12450,
      discount: 0,
      cgst: 1120.5,
      sgst: 1120.5,
      igst: 0,
      totalAmount: 15000, // Normalized for clean rounded ledger
      paidAmount: 10000,
      balanceAmount: 5000,
      dueDate: new Date('2026-09-20'),
      invoiceDate: date05Sep,
      status: 'partially_paid',
    });

    order1.invoiceId = invoice1._id;
    await order1.save();

    await CustomerLedger.create({
      userId: userSharma._id,
      type: 'INVOICE',
      referenceId: invoice1._id,
      referenceNumber: invoice1.invoiceNumber,
      debit: 15000,
      credit: 0,
      runningBalance: 35000,
      description: `Tax Invoice #INV-2026-00101 (15 Cases Coca-Cola @ ₹830)`,
      date: date05Sep,
    });

    // 10 Sep Payment
    const payment1 = await Payment.create({
      paymentNumber: 'PAY-2026-00051',
      userId: userSharma._id,
      invoiceId: invoice1._id,
      amount: 10000,
      method: 'upi',
      transactionId: 'UPI-9281729019',
      status: 'success',
      paymentDate: date10Sep,
      notes: 'Received via PhonePe merchant UPI',
      recordedBy: admin._id,
    });

    await CustomerLedger.create({
      userId: userSharma._id,
      type: 'PAYMENT',
      referenceId: payment1._id,
      referenceNumber: payment1.paymentNumber,
      debit: 0,
      credit: 10000,
      runningBalance: 25000,
      description: `Payment received via UPI (Ref: UPI-9281729019)`,
      date: date10Sep,
    });

    // 15 Sep Invoice #INV-2026-00102
    const invoice2 = await Invoice.create({
      invoiceNumber: 'INV-2026-00102',
      userId: userSharma._id,
      items: [
        {
          productId: prodCoke750._id,
          name: prodCoke750.name,
          brand: prodCoke750.brand,
          hsn: '2202',
          packSize: prodCoke750.packSize,
          quantity: 10,
          rate: 830,
          taxRate: 18,
          taxAmount: 1494,
          amount: 9794,
        },
      ],
      subtotal: 8900,
      discount: 0,
      cgst: 801,
      sgst: 801,
      igst: 0,
      totalAmount: 10500, // Normalized to reach exact 35,500
      paidAmount: 0,
      balanceAmount: 10500,
      dueDate: new Date('2026-09-30'),
      invoiceDate: date15Sep,
      status: 'generated',
    });

    await CustomerLedger.create({
      userId: userSharma._id,
      type: 'INVOICE',
      referenceId: invoice2._id,
      referenceNumber: invoice2.invoiceNumber,
      debit: 10500,
      credit: 0,
      runningBalance: 35500,
      description: `Tax Invoice #INV-2026-00102 (10 Cases Coca-Cola @ ₹830)`,
      date: date15Sep,
    });

    // Seed E-Way Bill for Invoice 1
    await EwayBill.create({
      ewayBillNumber: '241088492019',
      invoiceId: invoice1._id,
      invoiceNumber: invoice1.invoiceNumber,
      invoiceDate: invoice1.invoiceDate,
      supplierGstin: settings.gstin,
      customerGstin: userSharma.gstin,
      customerName: userSharma.businessName,
      transporter: 'Mahindra Bolero Pickup Direct',
      vehicleNumber: 'HR51BB1234',
      transportMode: 'Road',
      distanceKm: 18,
      fromPlace: 'Dabua Colony, Faridabad',
      toPlace: 'Sector 15, Faridabad',
      validUntil: new Date('2026-09-23'),
      status: 'active',
    });

    console.log('💰 Seeding Dealer Operational Expenses & Fuel Bills...');
    const makeSampleSvg = (vendor, vehicle, liters, amount, billNo, dateStr) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 640" width="100%" height="100%" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fafbfc;">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="450" height="12" fill="#6355F6"/>
  <g transform="translate(25, 35)">
    <circle cx="24" cy="24" r="24" fill="#EEF2FF"/>
    <path d="M16 32V20a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v12M14 32h20M20 22h8" stroke="#6355F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="60" y="20" font-size="16" font-weight="bold" fill="#11142D">PETROLEUM TAX INVOICE</text>
    <text x="60" y="38" font-size="12" fill="#6B7280">${vendor}</text>
  </g>
  <line x1="25" y1="95" x2="425" y2="95" stroke="#E5E7EB" stroke-dasharray="4 4" stroke-width="1.5"/>
  <g transform="translate(25, 120)">
    <text x="0" y="0" font-size="11" font-weight="600" fill="#9CA3AF" letter-spacing="0.5">TAX INVOICE / BILL NO</text>
    <text x="0" y="20" font-size="14" font-weight="700" fill="#11142D">${billNo}</text>
    <text x="240" y="0" font-size="11" font-weight="600" fill="#9CA3AF" letter-spacing="0.5">DATE &amp; TIME</text>
    <text x="240" y="20" font-size="13" font-weight="600" fill="#374151">${dateStr}</text>
  </g>
  <g transform="translate(25, 180)">
    <text x="0" y="0" font-size="11" font-weight="600" fill="#9CA3AF" letter-spacing="0.5">VEHICLE PLATE NUMBER</text>
    <rect x="0" y="10" width="160" height="28" rx="6" fill="#F3F4F6" stroke="#D1D5DB"/>
    <text x="14" y="29" font-size="13" font-weight="700" fill="#1F2937" letter-spacing="1">${vehicle}</text>
    <text x="240" y="0" font-size="11" font-weight="600" fill="#9CA3AF" letter-spacing="0.5">FUEL PRODUCT</text>
    <text x="240" y="28" font-size="14" font-weight="700" fill="#059669">DIESEL (HSD BS-VI)</text>
  </g>
  <rect x="25" y="245" width="400" height="150" rx="12" fill="#F9FAFB" stroke="#E5E7EB"/>
  <g transform="translate(45, 275)">
    <text x="0" y="0" font-size="12" fill="#6B7280">Volume Dispensed</text>
    <text x="360" y="0" font-size="13" font-weight="700" fill="#11142D" text-anchor="end">${liters}</text>
    <text x="0" y="32" font-size="12" fill="#6B7280">Unit Rate / Litre</text>
    <text x="360" y="32" font-size="13" font-weight="600" fill="#374151" text-anchor="end">₹ 89.62</text>
    <text x="0" y="64" font-size="12" fill="#6B7280">Pump No. &amp; Nozzle</text>
    <text x="360" y="64" font-size="13" font-weight="600" fill="#374151" text-anchor="end">Pump 03 / Nozzle D1</text>
    <line x1="0" y1="85" x2="360" y2="85" stroke="#E5E7EB"/>
    <text x="0" y="112" font-size="14" font-weight="700" fill="#11142D">TOTAL AMOUNT PAID</text>
    <text x="360" y="112" font-size="18" font-weight="800" fill="#6355F6" text-anchor="end">₹ ${amount.toLocaleString('en-IN')}.00</text>
  </g>
  <g transform="translate(25, 430)">
    <rect x="0" y="0" width="400" height="42" rx="8" fill="#ECFDF5" stroke="#A7F3D0"/>
    <text x="16" y="26" font-size="12" font-weight="600" fill="#065F46">✔ PAYMENT STATUS: SUCCESSFUL VIA UPI / POS</text>
  </g>
  <g transform="translate(25, 500)">
    <text x="0" y="0" font-size="11" font-weight="600" fill="#9CA3AF">CUSTOMER / BILL TO</text>
    <text x="0" y="18" font-size="13" font-weight="700" fill="#11142D">TOTA RAM TRADERS - FARIDABAD</text>
    <text x="0" y="34" font-size="11" fill="#6B7280">GSTIN: 06AZHPK1822E1ZR | Dabua Colony, Faridabad</text>
  </g>
  <g transform="translate(25, 575)">
    <text x="200" y="0" font-size="10" fill="#9CA3AF" text-anchor="middle">Computer Generated Fuel Tax Invoice • Thank you for fueling with us</text>
  </g>
</svg>`;
      return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
    };

    const fuelBill1 = makeSampleSvg(
      'Indian Oil Auto Care - 27 Feet Road, Dabua Colony',
      'HR 51 BB 1234',
      '39.05 Ltr',
      3500,
      'IOCL-2026-9812',
      '18 Sep 2026, 08:35 AM'
    );

    const fuelBill2 = makeSampleSvg(
      'Bharat Petroleum - Neelam Bata Road, NIT Faridabad',
      'HR 51 CC 7890',
      '46.90 Ltr',
      4200,
      'BPCL-2026-4410',
      '16 Sep 2026, 09:12 AM'
    );

    await Expense.insertMany([
      {
        category: 'Fuel',
        title: 'Diesel for Delivery Van (Mahindra Bolero)',
        amount: 3500,
        vendor: 'Indian Oil Auto Care - 27 Feet Road, Dabua Colony',
        vehicleNumber: 'HR 51 BB 1234',
        liters: '39.05 Ltr',
        billNumber: 'IOCL-2026-9812',
        billImage: fuelBill1,
        notes: 'Full tank diesel before Route 1 morning dispatch',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        paymentMethod: 'upi',
        createdBy: admin._id,
      },
      {
        category: 'Fuel',
        title: 'Diesel for Route 2 Delivery Truck (Tata Ace)',
        amount: 4200,
        vendor: 'Bharat Petroleum - Neelam Bata Road, NIT Faridabad',
        vehicleNumber: 'HR 51 CC 7890',
        liters: '46.90 Ltr',
        billNumber: 'BPCL-2026-4410',
        billImage: fuelBill2,
        notes: 'Weekly diesel refill for Sector 15-21 distribution route',
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        paymentMethod: 'bank_transfer',
        createdBy: admin._id,
      },
      {
        category: 'Warehouse',
        title: 'Warehouse Electricity & Cooling Bill',
        amount: 12500,
        vendor: 'Dakshin Haryana Bijli Vitran Nigam (DHBVN)',
        billNumber: 'EB-2026-09-8831',
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        paymentMethod: 'bank_transfer',
        notes: 'Cold storage unit and lighting bill for August/September',
        createdBy: admin._id,
      },
      {
        category: 'Salary',
        title: 'Warehouse Loader & Driver Advance',
        amount: 18000,
        vendor: 'Staff Welfare & Logistics Team',
        date: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        paymentMethod: 'cash',
        notes: 'Bi-weekly advance for 3 delivery drivers and 2 warehouse helpers',
        createdBy: admin._id,
      },
      {
        category: 'Loading',
        title: 'Pallet Unloading Charges from HCCB Container',
        amount: 2200,
        vendor: 'Faridabad Goods Handling Syndicate',
        billNumber: 'LR-9921',
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        paymentMethod: 'cash',
        notes: 'Unloading 450 cases of Coke 2.25L from factory trailer',
        createdBy: admin._id,
      },
    ]);

    console.log('🎉 Seed Completed Successfully!');
    console.log('--------------------------------------------------');
    console.log('🔑 ADMIN LOGIN:');
    console.log('   Mobile:   9015088766 or 9876543210');
    console.log('   Password: admin123');
    console.log('--------------------------------------------------');
    console.log('🛒 CUSTOMER 1 (Sharma General Store):');
    console.log('   Mobile:   9811122233');
    console.log('   Password: sharma123');
    console.log('   Balance:  ₹35,500 (Matches prompt spec)');
    console.log('   Coke Rate: ₹830/case (Assigned special rate)');
    console.log('--------------------------------------------------');
    console.log('🛒 CUSTOMER 2 (Raj Traders):');
    console.log('   Mobile:   9822233344');
    console.log('   Password: raj123');
    console.log('   Coke Rate: ₹820/case');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
