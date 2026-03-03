import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/products': 'Product Catalog',
    '/customers': 'Customers',
    '/orders': 'Order Management',
    '/inventory': 'Inventory',
    '/store': 'Store Profile',
};

export default function Navbar({ onMenuToggle }) {
    const { user } = useAuth();
    const location = useLocation();
    const currentPage = pageTitles[location.pathname] || 'Dashboard';

    return (
        <header className="h-16 bg-surface-900/50 backdrop-blur-xl border-b border-surface-700/30 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden text-surface-400 hover:text-surface-200 p-2 hover:bg-surface-800/50 rounded-lg transition-colors"
                >
                    <Bars3Icon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-surface-100">{currentPage}</h1>
                    <p className="text-xs text-surface-500 hidden sm:block">
                        Store ID: {user?.storeId || 'N/A'}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="hidden md:flex items-center bg-surface-800/50 border border-surface-700/30 rounded-xl px-3 py-2 space-x-2 w-64 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500/30 transition-all">
                    <MagnifyingGlassIcon className="w-4 h-4 text-surface-500 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search products, orders..."
                        className="bg-transparent text-sm text-surface-300 placeholder-surface-500 outline-none w-full"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 rounded-xl transition-colors">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full animate-pulse-glow" />
                </button>
            </div>
        </header>
    );
}
