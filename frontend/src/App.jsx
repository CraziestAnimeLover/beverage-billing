import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts (Static for immediate shell rendering)
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// Auth
import Login from './pages/auth/Login';

// Lazy Loaded Admin Pages (Code-split to avoid loading for mobile customer app)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminPurchases = lazy(() => import('./pages/admin/Purchases'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminInvoices = lazy(() => import('./pages/admin/Invoices'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminLedger = lazy(() => import('./pages/admin/Ledger'));
const AdminEwayBills = lazy(() => import('./pages/admin/EwayBills'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminExpenses = lazy(() => import('./pages/admin/Expenses'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Lazy Loaded User / Customer Pages
const UserDashboard = lazy(() => import('./pages/user/Dashboard'));
const UserProducts = lazy(() => import('./pages/user/Products'));
const UserCart = lazy(() => import('./pages/user/Cart'));
const UserOrders = lazy(() => import('./pages/user/Orders'));
const UserInvoices = lazy(() => import('./pages/user/Invoices'));
const UserPayments = lazy(() => import('./pages/user/Payments'));
const UserLedger = lazy(() => import('./pages/user/Ledger'));
const UserProfile = lazy(() => import('./pages/user/Profile'));

// Loading Suspense Component
const PageLoading = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Route Guards
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

const UserRoute = ({ children }) => {
  const { user, loading, isUser } = useAuth();
  if (loading) return null;
  if (!user || !isUser) return <Navigate to="/login" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="purchases" element={<AdminPurchases />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="invoices" element={<AdminInvoices />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="ledger" element={<AdminLedger />} />
                  <Route path="eway-bills" element={<AdminEwayBills />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="expenses" element={<AdminExpenses />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Protected User / Customer Routes */}
                <Route
                  path="/user"
                  element={
                    <UserRoute>
                      <UserLayout />
                    </UserRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="products" element={<UserProducts />} />
                  <Route path="cart" element={<UserCart />} />
                  <Route path="orders" element={<UserOrders />} />
                  <Route path="invoices" element={<UserInvoices />} />
                  <Route path="payments" element={<UserPayments />} />
                  <Route path="ledger" element={<UserLedger />} />
                  <Route path="profile" element={<UserProfile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
