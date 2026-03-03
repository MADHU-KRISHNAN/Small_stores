import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingStorefrontIcon, ShoppingBagIcon, TagIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CustomerLogin() {
    const { loginCustomer } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginCustomer(form.username, form.password);
            toast.success('Welcome back!');
            navigate('/shop');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
                <div className="relative z-10 flex flex-col justify-center px-16 space-y-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">SmallStores</h1>
                    </div>
                    <p className="text-xl text-white/90 font-light leading-relaxed">
                        Discover unique products from local stores. Shop smart, support small.
                    </p>
                    <div className="space-y-4 pt-4">
                        {[
                            { icon: ShoppingBagIcon, title: 'Browse All Stores', desc: 'Products from every store in one place' },
                            { icon: TagIcon, title: 'Best Deals', desc: 'Compare prices and find what you need' },
                            { icon: TruckIcon, title: 'Track Orders', desc: 'Real-time order status updates' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-sm">{item.title}</h3>
                                    <p className="text-white/60 text-xs">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">SmallStores</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                        <p className="mt-1 text-surface-400">Sign in to your customer account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="input-field w-full"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field w-full pr-12"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 text-xs"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-sm font-semibold"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center space-y-3">
                        <p className="text-surface-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                                Create one
                            </Link>
                        </p>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-700"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-surface-950 px-2 text-surface-500">or</span></div>
                        </div>
                        <Link to="/admin/login" className="text-surface-500 hover:text-surface-300 text-xs">
                            Store owner? Sign in here →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
