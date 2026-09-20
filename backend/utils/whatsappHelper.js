/**
 * Utility helper to format and generate direct WhatsApp messages
 * Generates official WhatsApp wa.me links with tailored text templates.
 */

const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
};

export const createWhatsAppUrl = (phone, text) => {
  const formattedPhone = formatPhone(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
};

export const getInvoiceWhatsAppMessage = ({ invoice, customer, settings }) => {
  const dealerName = settings?.businessName || 'Beverage Distributor';
  const phone = customer.whatsapp || customer.mobile;
  const dueDateStr = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'Immediate';

  const text = `*TAX INVOICE - ${dealerName}*
-----------------------------------------
Hello *${customer.businessName || customer.name}*,

Your Tax Invoice *${invoice.invoiceNumber}* has been generated.

📅 *Invoice Date:* ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
💵 *Total Amount:* ₹${invoice.totalAmount.toLocaleString('en-IN')}
💰 *Paid Amount:* ₹${invoice.paidAmount.toLocaleString('en-IN')}
⚠️ *Balance Due:* ₹${invoice.balanceAmount.toLocaleString('en-IN')}
⏳ *Due Date:* ${dueDateStr}

${invoice.ewayBillNumber ? `🚚 *E-Way Bill:* ${invoice.ewayBillNumber}\n` : ''}
*Bank Details for Payment:*
Bank: ${settings?.bankName || 'HDFC Bank'}
A/c: ${settings?.accountNumber || '50200012345678'}
IFSC: ${settings?.ifscCode || 'HDFC0001234'}
UPI ID: ${settings?.upiId || 'royalbeverage@hdfcbank'}

Please find your invoice copy in your customer portal.
Thank you for your business!`;

  return {
    phone,
    text,
    url: createWhatsAppUrl(phone, text),
  };
};

export const getPaymentWhatsAppMessage = ({ payment, customer, settings }) => {
  const dealerName = settings?.businessName || 'Beverage Distributor';
  const phone = customer.whatsapp || customer.mobile;

  const text = `*PAYMENT RECEIPT - ${dealerName}*
-----------------------------------------
Dear *${customer.businessName || customer.name}*,

We have successfully received your payment.

🧾 *Receipt No:* ${payment.paymentNumber}
📅 *Date:* ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}
💵 *Amount Received:* ₹${payment.amount.toLocaleString('en-IN')}
💳 *Payment Mode:* ${payment.method.toUpperCase()}
${payment.transactionId ? `🔖 *Txn Ref:* ${payment.transactionId}\n` : ''}
📉 *Updated Outstanding Balance:* ₹${(customer.outstandingBalance || 0).toLocaleString('en-IN')}

Thank you for the prompt settlement!`;

  return {
    phone,
    text,
    url: createWhatsAppUrl(phone, text),
  };
};

export const getOutstandingReminderMessage = ({ customer, settings }) => {
  const dealerName = settings?.businessName || 'Beverage Distributor';
  const phone = customer.whatsapp || customer.mobile;

  const text = `*PAYMENT REMINDER - ${dealerName}*
-----------------------------------------
Hello *${customer.businessName || customer.name}*,

This is a gentle reminder regarding your outstanding balance with *${dealerName}*.

💰 *Current Outstanding Balance:* ₹${(customer.outstandingBalance || 0).toLocaleString('en-IN')}
📊 *Credit Limit:* ₹${(customer.creditLimit || 0).toLocaleString('en-IN')}
⏱️ *Payment Terms:* ${customer.paymentTerms || 15} Days

Kindly arrange the payment at your earliest convenience to ensure uninterrupted supply and order processing.

*Quick UPI Transfer:*
UPI ID: *${settings?.upiId || 'royalbeverage@hdfcbank'}*
Bank: ${settings?.bankName} (A/c: ${settings?.accountNumber}, IFSC: ${settings?.ifscCode})

Thank you for your cooperation!`;

  return {
    phone,
    text,
    url: createWhatsAppUrl(phone, text),
  };
};

export const getOrderStatusWhatsAppMessage = ({ order, customer, status }) => {
  const phone = customer.whatsapp || customer.mobile;

  const text = `*ORDER UPDATE - ORD #${order.orderNumber}*
-----------------------------------------
Hello *${customer.businessName || customer.name}*,

Your order *#${order.orderNumber}* is now *${status.toUpperCase()}*.

📦 *Items:* ${order.items?.length || 0} Products
💵 *Total:* ₹${order.totalAmount.toLocaleString('en-IN')}

You can view complete order tracking in your Customer Portal.
Thank you!`;

  return {
    phone,
    text,
    url: createWhatsAppUrl(phone, text),
  };
};
