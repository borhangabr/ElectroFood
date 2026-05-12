// All app routes. Each feature contributes its pages here.

import { Routes, Route } from 'react-router-dom';

import HomePage from '../features/menu/pages/HomePage';
import MenuPage from '../features/menu/pages/MenuPage';
import ProductDetailPage from '../features/menu/pages/ProductDetailPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import CartPage from '../features/cart/pages/CartPage';
import CheckoutPage from '../features/orders/pages/CheckoutPage';
import MyOrdersPage from '../features/orders/pages/MyOrdersPage';
import OrderTrackingPage from '../features/orders/pages/OrderTrackingPage';
import AdminLayout from '../features/admin/pages/AdminLayout';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminOrders from '../features/admin/pages/AdminOrders';
import AdminProducts from '../features/admin/pages/AdminProducts';
import AdminCategories from '../features/admin/pages/AdminCategories';
import AdminUsers from '../features/admin/pages/AdminUsers';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import AdminRoute from '../features/auth/AdminRoute';

function NotFound() {
  return (
    <div className="container-app py-20 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-ink-muted">Page not found.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      {/* Anyone can check out — guest checkout writes the order with a guestToken. */}
      <Route path="/checkout" element={<CheckoutPage />} />
      {/* My-orders list still requires login (guests don't have an account). */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        }
      />
      {/* Tracking page accepts a ?token=... query param for guest reads, or
          the auth cookie for owner reads. ProtectedRoute would block guests. */}
      <Route path="/orders/:id" element={<OrderTrackingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
