import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShoppingCartIcon,
    HeartIcon,
    ClipboardDocumentListIcon,
    BuildingStorefrontIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartSolid } from '@heroicons/react/24/solid';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

export default function CustomerNavbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        if (user) {
            api.get('/customer/cart')
                .then(res => {
                    const cart = res.data.data || res.data;
                    setCartCount(cart.totalItems || 0);
                })
                .catch(() => setCartCount(0));
        }
    }, [user, location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/shop', label: 'Shop', icon: BuildingStorefrontIcon },
        { path: '/cart', label: 'Cart', icon: ShoppingCartIcon },
        { path: '/wishlist', label: 'Wishlist', icon: HeartIcon },
        { path: '/my-orders', label: 'Orders', icon: ClipboardDocumentListIcon },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/shop" className="flex items-center space-x-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                            <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white tracking-tight">
                            Small<span className="text-brand-400">Stores</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'text-brand-400 bg-brand-500/10'
                                            : 'text-surface-300 hover:text-white hover:bg-surface-800'
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                    {link.path === '/cart' && cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center space-x-3">
                        <Link to="/cart" className="md:hidden relative p-2 text-surface-300 hover:text-white">
                            <ShoppingCartIcon className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-surface-300 hover:text-white hover:bg-surface-800 transition-all"
                            >
                                <UserCircleIcon className="w-6 h-6" />
                                <span className="hidden sm:inline text-sm">{user?.username}</span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface-800 border border-surface-700 rounded-xl shadow-xl py-2 z-50">
                                    <div className="px-4 py-2 border-b border-surface-700">
                                        <p className="text-sm font-medium text-white">{user?.username}</p>
                                        <p className="text-xs text-surface-400">Customer Account</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-700/50 transition-colors"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden border-t border-surface-700/50 px-2 py-1 flex justify-around">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex flex-col items-center py-1 px-3 text-xs transition-colors ${isActive ? 'text-brand-400' : 'text-surface-400'
                                }`}
                        >
                            <link.icon className="w-5 h-5 mb-0.5" />
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
