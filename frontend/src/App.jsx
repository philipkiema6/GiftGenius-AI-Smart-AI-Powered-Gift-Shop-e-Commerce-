import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import VendorLayout from './layouts/VendorLayout'

import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import VendorRoute from './routes/VendorRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import VendorRegister from './pages/VendorRegister'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import GiftFinder from './pages/GiftFinder'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import DashboardProfile from './pages/DashboardProfile'
import DashboardOrders from './pages/DashboardOrders'
import DashboardReminders from './pages/DashboardReminders'
import NotFound from './pages/NotFound'

import AdminOverview from './pages/admin/AdminOverview'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVendors from './pages/admin/AdminVendors'
import AdminPayouts from './pages/admin/AdminPayouts'

import VendorProfile from './pages/vendor/VendorProfile'
import VendorProducts from './pages/vendor/VendorProducts'
import VendorSales from './pages/vendor/VendorSales'
import VendorEarnings from './pages/vendor/VendorEarnings'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px' } }} />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/vendor/register" element={<VendorRegister />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/gift-finder" element={<GiftFinder />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<Checkout />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardProfile />} />
                  <Route path="/dashboard/orders" element={<DashboardOrders />} />
                  <Route path="/dashboard/wishlist" element={<Wishlist />} />
                  <Route path="/dashboard/reminders" element={<DashboardReminders />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/vendors" element={<AdminVendors />} />
                  <Route path="/admin/payouts" element={<AdminPayouts />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                </Route>
              </Route>

              <Route element={<VendorRoute />}>
                <Route element={<VendorLayout />}>
                  <Route path="/vendor" element={<VendorProfile />} />
                  <Route path="/vendor/products" element={<VendorProducts />} />
                  <Route path="/vendor/sales" element={<VendorSales />} />
                  <Route path="/vendor/earnings" element={<VendorEarnings />} />
                </Route>
              </Route>

              <Route path="*" element={<MainLayout />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
