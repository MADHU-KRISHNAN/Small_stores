import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

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
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/products" element={<ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>} />
                    <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
