(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9015088766', password: 'admin123' }),
    });
    const { token } = await loginRes.json();

    const createRes = await fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        category: 'Fuel',
        title: 'Diesel for Mahindra Bolero Pickup (Route 1)',
        vendor: 'Indian Oil Auto Care - 27 Feet Road, Dabua Colony',
        vehicleNumber: 'HR 51 BB 1234',
        liters: '39.05 Ltr',
        billNumber: 'IOCL-2026-9812',
        amount: 3500,
        paymentMethod: 'upi',
        billImage: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0PklPQ0wgRlVFTCBCSUxMPC90ZXh0Pjwvc3ZnPg==',
      }),
    });
    const data = await createRes.json();
    console.log('Create Expense Success:', data.success);
    console.log('Vendor:', data.expense?.vendor);
    console.log('Vehicle:', data.expense?.vehicleNumber);
    console.log('Has Bill Image:', Boolean(data.expense?.billImage));

    const listRes = await fetch('http://localhost:5000/api/expenses?category=Fuel', {
      headers: { Authorization: 'Bearer ' + token },
    });
    const listData = await listRes.json();
    console.log('Fuel Expenses Count:', listData.count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
