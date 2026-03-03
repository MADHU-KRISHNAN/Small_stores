import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin, isCustomer } from '../utils/authUtils';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
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
    }

    if (!user) {
        // Redirect to appropriate login page
        if (requiredRole === 'CUSTOMER') {
            return <Navigate to="/login" />;
        }
        return <Navigate to="/admin/login" />;
    }

    // Role-based access control
    if (requiredRole === 'ADMIN' && !isAdmin(user)) {
        return <Navigate to="/shop" />;
    }
    if (requiredRole === 'CUSTOMER' && !isCustomer(user)) {
        return <Navigate to="/admin/dashboard" />;
    }

    return children;
}
