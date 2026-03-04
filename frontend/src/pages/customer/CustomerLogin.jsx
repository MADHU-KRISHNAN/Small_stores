import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CustomerLogin() {
    const { loginCustomer } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) return;
        setLoading(true);
        try {
            await loginCustomer(form.username, form.password);
            toast.success('Welcome back!');
            navigate('/shop');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #0c1222 50%, #0a0f1a 100%)' }}>
            {/* Logo */}
            <div className="flex justify-center pt-8 pb-4">
                <Link to="/" className="flex items-center space-x-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                        <BuildingStorefrontIcon className="w-5.5 h-5.5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">
                        <span className="text-white">Small</span>
                        <span className="text-emerald-400">Stores</span>
                    </span>
                </Link>
            </div>

            {/* Login Card */}
            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
                <div className="w-full max-w-[380px]">
                    {/* Main card */}
                    <div
                        className="rounded-2xl p-7 pb-8"
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(71, 85, 105, 0.1)',
                        }}
                    >
                        <h1 className="text-[22px] font-semibold text-white mb-5">Sign in</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-[13px] font-semibold text-slate-200 mb-1.5">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full h-[42px] px-3.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all duration-200 outline-none"
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(100, 116, 139, 0.35)',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid rgba(52, 211, 153, 0.6)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.08)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid rgba(100, 116, 139, 0.35)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[13px] font-semibold text-slate-200">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full h-[42px] px-3.5 rounded-lg text-sm text-white placeholder-slate-500 transition-all duration-200 outline-none"
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(100, 116, 139, 0.35)',
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.border = '1px solid rgba(52, 211, 153, 0.6)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(52, 211, 153, 0.08)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.border = '1px solid rgba(100, 116, 139, 0.35)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {/* Sign-in button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[42px] rounded-lg text-sm font-semibold transition-all duration-200 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: loading
                                        ? 'linear-gradient(135deg, #059669, #0d9488)'
                                        : 'linear-gradient(135deg, #10b981, #14b8a6)',
                                    color: '#fff',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.35)';
                                        e.target.style.transform = 'translateY(-0.5px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Signing in...</span>
                                    </span>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>

                        {/* Terms text */}
                        <p className="text-[11px] text-slate-500 mt-5 leading-relaxed">
                            By signing in, you agree to SmallStores'
                            <span className="text-emerald-400/70 cursor-pointer hover:text-emerald-400"> Conditions of Use</span> and
                            <span className="text-emerald-400/70 cursor-pointer hover:text-emerald-400"> Privacy Notice</span>.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full" style={{ borderTop: '1px solid rgba(71, 85, 105, 0.25)' }} />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-3 text-[11px] text-slate-500 font-medium" style={{ background: '#0c1222' }}>
                                New to SmallStores?
                            </span>
                        </div>
                    </div>

                    {/* Create account button */}
                    <Link
                        to="/register"
                        className="flex items-center justify-center w-full h-[40px] rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(100, 116, 139, 0.3)',
                            color: '#94a3b8',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'rgba(100, 116, 139, 0.5)';
                            e.target.style.color = '#e2e8f0';
                            e.target.style.background = 'rgba(30, 41, 59, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                            e.target.style.color = '#94a3b8';
                            e.target.style.background = 'transparent';
                        }}
                    >
                        Create your SmallStores account
                    </Link>

                    {/* Store owner link */}
                    <div className="text-center mt-6">
                        <Link
                            to="/admin/login"
                            className="text-[12px] text-slate-500 hover:text-emerald-400 transition-colors duration-200"
                        >
                            Are you a store owner? <span className="font-medium text-emerald-400/80 hover:text-emerald-400">Sign in here →</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-5" style={{ borderTop: '1px solid rgba(71, 85, 105, 0.15)' }}>
                <div className="flex justify-center space-x-6 mb-2">
                    <span className="text-[11px] text-slate-600 hover:text-emerald-400 cursor-pointer transition-colors">Help</span>
                    <span className="text-[11px] text-slate-600 hover:text-emerald-400 cursor-pointer transition-colors">Conditions of Use</span>
                    <span className="text-[11px] text-slate-600 hover:text-emerald-400 cursor-pointer transition-colors">Privacy Notice</span>
                </div>
                <p className="text-center text-[10px] text-slate-600">
                    © 2026 SmallStores. All rights reserved.
                </p>
            </div>
        </div>
    );
}
