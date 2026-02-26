import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    BuildingStorefrontIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    UserIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function StoreProfile() {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchStore();
    }, []);

    const fetchStore = async () => {
        try {
            const res = await api.get('/store');
            const data = res.data.data ? res.data.data : res.data;
            setStore(data);
            setFormData(data);
        } catch (err) {
            toast.error('Failed to load store details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/store', formData);
            const data = res.data.data ? res.data.data : res.data;
            setStore(data);
            setEditing(false);
            toast.success('Store updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update store');
        }
    };

    const handleCancel = () => {
        setFormData(store);
        setEditing(false);
    };

    const fields = [
        { key: 'storeName', label: 'Store Name', icon: BuildingStorefrontIcon, required: true },
        { key: 'ownerName', label: 'Owner Name', icon: UserIcon, required: true },
        { key: 'email', label: 'Email Address', icon: EnvelopeIcon, required: true },
        { key: 'phone', label: 'Phone Number', icon: PhoneIcon },
        { key: 'address', label: 'Store Address', icon: MapPinIcon },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 shimmer" />
                <div className="glass-card-solid p-8 space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-10 w-10 shimmer rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-24 shimmer" />
                                <div className="h-5 w-64 shimmer" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Store Profile</h1>
                    <p className="text-sm text-surface-400 mt-1">Manage your store information</p>
                </div>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-primary flex items-center space-x-2">
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button onClick={handleCancel} className="btn-secondary flex items-center space-x-2">
                            <XMarkIcon className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                        <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                            <CheckIcon className="w-4 h-4" />
                            <span>Save</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Store Card */}
            <div className="glass-card-solid overflow-hidden">
                {/* Display banner */}
                <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 relative">
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }} />
                    <div className="absolute -bottom-8 left-8">
                        <div className="w-16 h-16 rounded-2xl bg-surface-800 border-4 border-surface-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {store?.storeName?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                    </div>
                </div>

                <div className="pt-12 p-8 space-y-6">
                    {fields.map(({ key, label, icon: Icon, required }) => (
                        <div key={key} className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-800/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Icon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-1">{label}</p>
                                {editing ? (
                                    <input
                                        className="input-dark"
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        required={required}
                                    />
                                ) : (
                                    <p className="text-surface-200 font-medium truncate">
                                        {store?.[key] || <span className="text-surface-600 italic">Not set</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Info */}
            <div className="glass-card-solid p-6">
                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Account</h3>
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                        {user?.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-surface-200 font-medium">{user?.username}</p>
                        <p className="text-xs text-surface-500">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
