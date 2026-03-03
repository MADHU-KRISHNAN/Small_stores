import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CustomerRegister() {
    const { registerCustomer } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', username: '', password: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerCustomer(form);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">SmallStores</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create your account</h2>
                    <p className="mt-1 text-surface-400">Start shopping from local stores</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Full Name *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input-field w-full" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Email *</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input-field w-full" placeholder="john@example.com" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Username *</label>
                            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="input-field w-full" placeholder="johndoe" required minLength={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Password *</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field w-full pr-12" placeholder="Min 6 characters" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 text-xs">
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Phone</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="input-field w-full" placeholder="+1234567890" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1">Address</label>
                            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="input-field w-full" placeholder="123 Main St" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold mt-2">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-surface-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
