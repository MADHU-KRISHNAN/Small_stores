import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy-load all pages for code splitting
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
                        {/* Public routes */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetail /></Layout></ProtectedRoute>} />
                        <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
                        <Route path="/store" element={<ProtectedRoute><Layout><StoreProfile /></Layout></ProtectedRoute>} />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;
