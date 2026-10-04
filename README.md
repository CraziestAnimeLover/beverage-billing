# Beverage Billing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)

## 📖 Overview

**Beverage Billing** is a full‑stack application for managing beverage distribution, invoicing, inventory, and e‑way bills. It provides a modern admin dashboard, a customer portal, and integrates with WhatsApp for notifications.

---

## ✨ Features

- **Admin Dashboard** – analytics, daily/monthly sales, inventory alerts.
- **Invoicing & Billing** – GST calculation, itemised PDFs, auto‑numbering.
- **E‑Way Bills** – generate compliant e‑way bills automatically.
- **Inventory Management** – stock tracking, purchase orders, low‑stock alerts.
- **Payments & Ledger** – track outstanding payments, multiple payment modes.
- **WhatsApp Integration** – send invoice notifications directly.
- **Customer Portal** – view past invoices, place orders, see statements.

---

## 🛠️ Tech Stack

- **Frontend** – React (Vite) with Tailwind CSS.
- **Backend** – Node.js, Express, MongoDB (Mongoose).
- **Dev Utilities** – concurrently for monorepo scripts, dotenv for env management.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ (recommended v20)
- MongoDB instance (local or Atlas)

### Setup

```bash
# Install root scripts & sub‑project deps
npm install && npm install --prefix backend && npm install --prefix frontend
```

Create a `.env` file in `backend/` (copy from `.env.example`) and configure your MongoDB connection string and secret keys.

### Run Development Servers

```bash
npm run dev
```

- Backend runs on **http://localhost:3000**.
- Frontend runs on **http://localhost:5173**.

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `install-all` | Installs root and both sub‑projects. |
| `dev` | Starts backend & frontend concurrently (hot‑reload). |
| `start` | Starts both services in production mode. |

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo, create a feature branch, and submit a pull request.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

For questions or support, open an issue or reach out to the maintainer.
