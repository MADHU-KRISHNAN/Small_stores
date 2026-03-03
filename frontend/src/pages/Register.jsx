import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BuildingStorefrontIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const registerSchema = yup.object().shape({
    storeName: yup.string().required('Store name is required'),
    ownerName: yup.string().required('Owner name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    username: yup.string().required('Username is required').min(3, 'Min 3 characters'),
    password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm your password'),
});

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { register: registerApi } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(registerSchema),
        mode: 'onTouched',
    });

    const onSubmit = async (data) => {
        try {
            const { confirmPassword, ...payload } = data;
            await registerApi(payload);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const InputField = ({ label, name, type = 'text', placeholder, isPassword }) => (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-300">{label}</label>
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    {...register(name)}
                    className={`input-dark ${errors[name] ? 'input-dark-error' : ''}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                    >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {errors[name] && <p className="text-xs text-red-400 pl-1">{errors[name].message}</p>}
        </div>
    );

    return (
        <div className="min-h-screen flex">
            {/* Left Panel — Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-900 via-surface-900 to-surface-950">
                <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-32 right-16 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent-400/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />

                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-glow-lg">
                            <BuildingStorefrontIcon className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">SmallStores</span>
                    </div>

                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                        Start your<br />
                        <span className="gradient-text">business today.</span>
                    </h1>

                    <p className="text-lg text-surface-400 max-w-md leading-relaxed mb-10">
                        Set up your store in under a minute. Track inventory, manage customers, and process orders — all from one powerful dashboard built for small businesses.
                    </p>

                    <div className="flex items-center space-x-8">
                        {[
                            { value: 'Free', label: 'Setup' },
                            { value: '60s', label: 'To Start' },
                            { value: '∞', label: 'Growth' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-950">
                <div className="w-full max-w-md animate-fade-in-up">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center space-x-3 mb-10">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-glow">
                            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">SmallStores</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Create your store</h2>
                        <p className="text-surface-400 mt-2 text-sm">Get started with SmallStores for free</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Store Name" name="storeName" placeholder="My Store" />
                            <InputField label="Owner Name" name="ownerName" placeholder="John Doe" />
                        </div>
                        <InputField label="Email" name="email" type="email" placeholder="you@example.com" />
                        <InputField label="Username" name="username" placeholder="Choose a username" />
                        <InputField label="Password" name="password" placeholder="••••••••" isPassword />
                        <InputField label="Confirm Password" name="confirmPassword" placeholder="••••••••" isPassword />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary w-full flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Create account</span>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-surface-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>

                    <p className="mt-4 text-center text-xs text-surface-500">
                        By continuing, you agree to SmallStores'
                        <span className="text-brand-400 cursor-pointer hover:text-brand-300 ml-1">Terms</span> and
                        <span className="text-brand-400 cursor-pointer hover:text-brand-300 ml-1">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}
