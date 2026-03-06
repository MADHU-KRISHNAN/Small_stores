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
        <div className="min-h-screen flex flex-col bg-white">
            {/* Logo */}
            <div className="flex justify-center pt-8 pb-3">
                <Link to="/" className="flex items-center space-x-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 group-hover:shadow-lg group-hover:shadow-orange-200 transition-all duration-300">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">
                        Small<span className="text-orange-500">Stores</span>
                    </span>
                </Link>
            </div>

            {/* Card */}
            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
                <div className="w-full max-w-[380px]">
                    <div className="rounded-2xl p-7 pb-8 bg-white border border-gray-200 shadow-sm">
                        <h1 className="text-[22px] font-semibold text-gray-900 mb-5">Sign in</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full h-[42px] px-3.5 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[13px] font-semibold text-gray-700">Password</label>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="text-[11px] text-orange-500 hover:text-orange-600 font-medium transition-colors">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full h-[42px] px-3.5 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[42px] rounded-lg text-sm font-semibold bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        <span>Signing in...</span>
                                    </span>
                                ) : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
                            By signing in, you agree to SmallStores'
                            <span className="text-orange-500 cursor-pointer hover:underline"> Conditions of Use</span> and
                            <span className="text-orange-500 cursor-pointer hover:underline"> Privacy Notice</span>.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center">
                            <span className="px-3 text-[11px] text-gray-400 font-medium bg-white">New to SmallStores?</span>
                        </div>
                    </div>

                    <Link to="/register"
                        className="flex items-center justify-center w-full h-[40px] rounded-lg text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200">
                        Create your SmallStores account
                    </Link>

                    <div className="text-center mt-6">
                        <Link to="/admin/login" className="text-[12px] text-gray-400 hover:text-orange-500 transition-colors duration-200">
                            Are you a store owner? <span className="font-medium text-orange-500 hover:text-orange-600">Sign in here →</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="py-5 border-t border-gray-100">
                <div className="flex justify-center space-x-6 mb-2">
                    {['Help', 'Conditions of Use', 'Privacy Notice'].map(t => (
                        <span key={t} className="text-[11px] text-gray-400 hover:text-orange-500 cursor-pointer transition-colors">{t}</span>
                    ))}
                </div>
                <p className="text-center text-[10px] text-gray-400">© 2026 SmallStores. All rights reserved.</p>
            </div>
        </div>
    );
}
