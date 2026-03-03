import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    ArchiveBoxIcon,
    UsersIcon,
    ShoppingCartIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    BuildingStorefrontIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        { name: 'Products', path: '/admin/products', icon: ArchiveBoxIcon },
        { name: 'Inventory', path: '/admin/inventory', icon: ClipboardDocumentListIcon },
        { name: 'Customers', path: '/admin/customers', icon: UsersIcon },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCartIcon },
    ];

    return (
        <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-surface-900 via-surface-900 to-surface-950 border-r border-surface-700/30 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-surface-700/30">
                <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold gradient-text">SmallStores</span>
                </Link>
                <button onClick={onClose} className="lg:hidden text-surface-400 hover:text-surface-200 p-1">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-surface-500 mb-3">Store Management</p>
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${isActive
                                ? 'bg-brand-500/10 text-brand-400'
                                : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-brand-400 to-brand-600 rounded-r-full" />
                            )}
                            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User section + Logout */}
            <div className="p-4 border-t border-surface-700/30 space-y-3">
                <Link to="/admin/store" onClick={onClose} className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-surface-800/50 transition-all duration-200 group cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-200 truncate">{user?.username}</p>
                        <p className="text-xs text-surface-500 truncate">{user?.role?.replace('ROLE_', '')}</p>
                    </div>
                </Link>
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-2.5 w-full text-surface-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">Sign out</span>
                </button>
            </div>
        </aside>
    );
}
