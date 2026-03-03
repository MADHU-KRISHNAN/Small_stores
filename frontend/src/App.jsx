import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import CustomerLayout from './components/CustomerLayout';

// Admin pages (lazy-loaded)
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderDetail = React.lazy(() => import('./pages/OrderDetail'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const StoreProfile = React.lazy(() => import('./pages/StoreProfile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Customer pages (lazy-loaded)
const CustomerLogin = React.lazy(() => import('./pages/customer/CustomerLogin'));
const CustomerRegister = React.lazy(() => import('./pages/customer/CustomerRegister'));
const ProductFeed = React.lazy(() => import('./pages/customer/ProductFeed'));
const ProductDetail = React.lazy(() => import('./pages/customer/ProductDetail'));
const CartPage = React.lazy(() => import('./pages/customer/CartPage'));
const WishlistPage = React.lazy(() => import('./pages/customer/WishlistPage'));
const MyOrders = React.lazy(() => import('./pages/customer/MyOrders'));

// Full-page loading spinner for lazy-loaded routes
const PageLoader = () => (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-b-brand-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-sm text-surface-500 animate-pulse">Loading...</p>
        </div>
    </div>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '12px',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#1e293b' },
                        },
                        error: {
                            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
                        },
                    }}
                />
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* ── Customer public routes ─────────────────────── */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<CustomerLogin />} />
                        <Route path="/register" element={<CustomerRegister />} />

                        {/* ── Customer protected routes ──────────────────── */}
                        <Route path="/shop" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerLayout><ProductFeed /></CustomerLayout></ProtectedRoute>} />
                        <Route path="/product/:id" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerLayout><ProductDetail /></CustomerLayout></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerLayout><CartPage /></CustomerLayout></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerLayout><WishlistPage /></CustomerLayout></ProtectedRoute>} />
                        <Route path="/my-orders" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerLayout><MyOrders /></CustomerLayout></ProtectedRoute>} />

                        {/* ── Admin auth routes ──────────────────────────── */}
                        <Route path="/admin/login" element={<Login />} />
                        <Route path="/admin/register" element={<Register />} />

                        {/* ── Admin protected routes ─────────────────────── */}
                        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><Layout><Dashboard /></Layout></ProtectedRoute>} />
                        <Route path="/admin/products" element={<ProtectedRoute requiredRole="ADMIN"><Layout><Products /></Layout></ProtectedRoute>} />
                        <Route path="/admin/customers" element={<ProtectedRoute requiredRole="ADMIN"><Layout><Customers /></Layout></ProtectedRoute>} />
                        <Route path="/admin/orders" element={<ProtectedRoute requiredRole="ADMIN"><Layout><Orders /></Layout></ProtectedRoute>} />
                        <Route path="/admin/orders/:id" element={<ProtectedRoute requiredRole="ADMIN"><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                        <Route path="/admin/inventory" element={<ProtectedRoute requiredRole="ADMIN"><Layout><Inventory /></Layout></ProtectedRoute>} />
                        <Route path="/admin/store" element={<ProtectedRoute requiredRole="ADMIN"><Layout><StoreProfile /></Layout></ProtectedRoute>} />

                        {/* ── Legacy redirects ───────────────────────────── */}
                        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/products" element={<Navigate to="/admin/products" replace />} />
                        <Route path="/customers" element={<Navigate to="/admin/customers" replace />} />
                        <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
                        <Route path="/inventory" element={<Navigate to="/admin/inventory" replace />} />
                        <Route path="/store" element={<Navigate to="/admin/store" replace />} />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;
