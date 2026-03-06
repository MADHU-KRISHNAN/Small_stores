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

    const inputClass = "w-full h-[42px] px-3.5 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex justify-center pt-8 pb-3">
                <Link to="/" className="flex items-center space-x-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
                        <BuildingStorefrontIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">Small<span className="text-orange-500">Stores</span></span>
                </Link>
            </div>

            <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
                <div className="w-full max-w-[460px]">
                    <div className="rounded-2xl p-7 bg-white border border-gray-200 shadow-sm">
                        <h1 className="text-[22px] font-semibold text-gray-900 mb-1">Create account</h1>
                        <p className="text-sm text-gray-400 mb-5">Start shopping from local stores</p>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className={inputClass} placeholder="John Doe" required />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email *</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className={inputClass} placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Username *</label>
                                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                                        className={inputClass} placeholder="johndoe" required minLength={3} />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className={`${inputClass} pr-14`} placeholder="Min 6 chars" required minLength={6} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-orange-500 hover:text-orange-600 font-medium">
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phone</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className={inputClass} placeholder="+1234567890" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Address</label>
                                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className={inputClass} placeholder="123 Main St" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full h-[42px] mt-1 rounded-lg text-sm font-semibold bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60">
                                {loading ? 'Creating account...' : 'Create your SmallStores account'}
                            </button>
                        </form>

                        <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                            By creating an account, you agree to SmallStores'
                            <span className="text-orange-500 cursor-pointer hover:underline"> Conditions of Use</span> and
                            <span className="text-orange-500 cursor-pointer hover:underline"> Privacy Notice</span>.
                        </p>

                        <div className="border-t border-gray-100 mt-5 pt-4">
                            <p className="text-[13px] text-gray-500">Already have an account? <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">Sign in →</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
