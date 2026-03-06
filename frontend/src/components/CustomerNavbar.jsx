import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShoppingCartIcon,
    HeartIcon,
    ClipboardDocumentListIcon,
    BuildingStorefrontIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    Squares2X2Icon,
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
        { path: '/shop', label: 'Shop', icon: Squares2X2Icon },
        { path: '/cart', label: 'Cart', icon: ShoppingCartIcon },
        { path: '/wishlist', label: 'Wishlist', icon: HeartIcon },
        { path: '/my-orders', label: 'Orders', icon: ClipboardDocumentListIcon },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/shop" className="flex items-center space-x-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
                            <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                            Small<span className="text-orange-500">Stores</span>
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
                                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'text-orange-600 bg-orange-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <link.icon className="w-[18px] h-[18px]" />
                                    <span>{link.label}</span>
                                    {link.path === '/cart' && cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center space-x-3">
                        <Link to="/cart" className="md:hidden relative p-2 text-gray-500 hover:text-gray-900">
                            <ShoppingCartIcon className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                            >
                                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:inline text-sm font-medium">{user?.username}</span>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                                    <div className="px-4 py-2.5 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                                        <p className="text-xs text-gray-400">Customer Account</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl"
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
            <div className="md:hidden border-t border-gray-100 px-2 py-1 flex justify-around bg-white">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`relative flex flex-col items-center py-1.5 px-3 text-[10px] font-medium transition-colors ${isActive ? 'text-orange-600' : 'text-gray-400'
                                }`}
                        >
                            <link.icon className="w-5 h-5 mb-0.5" />
                            {link.label}
                            {link.path === '/cart' && cartCount > 0 && (
                                <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-orange-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
