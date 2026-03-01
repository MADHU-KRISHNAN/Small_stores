import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import {
    BuildingStorefrontIcon,
    PencilSquareIcon,
    LockClosedIcon,
    CheckIcon,
    XMarkIcon,
    CubeIcon,
    UsersIcon,
    ShoppingCartIcon,
    CalendarDaysIcon,
    ClipboardDocumentIcon,
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import { getStoreProfile, updateStoreProfile, changePassword } from '../api/storeApi';
import { updateStoreProfileSchema, changePasswordSchema } from '../utils/validationSchemas';

// ─── Sub-component: StatCard ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
        </div>
    </div>
);

// ─── Sub-component: FieldDisplay ─────────────────────────────────────────────
const FieldDisplay = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white font-medium">{value || <span className="text-slate-500 italic">Not set</span>}</p>
    </div>
);

// ─── Sub-component: FormInput ────────────────────────────────────────────────
const FormInput = ({ label, name, register, error, type = 'text', placeholder, rightElement }) => (
    <div>
        <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
        <div className="relative">
            <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className={`input-dark w-full ${error ? 'border-red-500 focus:border-red-400' : ''} ${rightElement ? 'pr-12' : ''}`}
            />
            {rightElement && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {rightElement}
                </div>
            )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
    </div>
);

// ─── Sub-component: SectionHeader ────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
        </div>
        {action}
    </div>
);

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="glass-card p-6">
            <div className="h-5 w-32 bg-slate-700 rounded mb-6" />
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                        <div className="h-3 w-20 bg-slate-700 rounded mb-2" />
                        <div className="h-5 w-full bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
        <div className="glass-card p-6">
            <div className="h-5 w-40 bg-slate-700 rounded mb-6" />
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-slate-700 rounded" />
                ))}
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const StoreProfile = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStoreEditMode, setIsStoreEditMode] = useState(false);
    const [isStoreSaving, setIsStoreSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    // Store info form — pre-populated when profile loads
    const storeForm = useForm({
        resolver: yupResolver(updateStoreProfileSchema),
        mode: 'onChange',
    });

    // Password form — always starts empty
    const passwordForm = useForm({
        resolver: yupResolver(changePasswordSchema),
        mode: 'onChange',
    });

    // ── Load profile on mount ──────────────────────────────────────────────────
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const res = await getStoreProfile();
                const data = res.data.data;
                setProfile(data);

                // Pre-populate the store info form with current values
                storeForm.reset({
                    storeName: data.storeName || '',
                    ownerName: data.ownerName || '',
                    phone: data.phone || '',
                    address: data.address || '',
                });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load store profile');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    // ── Handle store info save ─────────────────────────────────────────────────
    const handleStoreSave = storeForm.handleSubmit(async (formData) => {
        try {
            setIsStoreSaving(true);
            const res = await updateStoreProfile(formData);
            const updated = res.data.data;
            setProfile(updated);

            // Sync form with fresh server values
            storeForm.reset({
                storeName: updated.storeName || '',
                ownerName: updated.ownerName || '',
                phone: updated.phone || '',
                address: updated.address || '',
            });

            setIsStoreEditMode(false);
            toast.success('Store profile updated successfully');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setIsStoreSaving(false);
        }
    });

    // ── Handle store edit cancel ───────────────────────────────────────────────
    const handleStoreCancel = () => {
        // Reset form back to last known good server values
        storeForm.reset({
            storeName: profile?.storeName || '',
            ownerName: profile?.ownerName || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
        });
        setIsStoreEditMode(false);
    };

    // ── Handle password change ─────────────────────────────────────────────────
    const handlePasswordChange = passwordForm.handleSubmit(async (formData) => {
        try {
            setIsPasswordSaving(true);
            await changePassword(formData);
            passwordForm.reset();
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            toast.success('Password changed successfully');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password';
            toast.error(msg);
        } finally {
            setIsPasswordSaving(false);
        }
    });

    // ── Handle store ID copy ───────────────────────────────────────────────────
    const handleCopyStoreId = () => {
        if (!profile?.storeId) return;
        navigator.clipboard.writeText(String(profile.storeId)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // ── Format date for display ────────────────────────────────────────────────
    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6">
                <div className="mb-8">
                    <div className="h-7 w-40 bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-slate-700 rounded animate-pulse" />
                </div>
                <ProfileSkeleton />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6 flex flex-col items-center justify-center min-h-64">
                <BuildingStorefrontIcon className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg font-medium">Could not load store profile</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary mt-4"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 lg:px-6">

            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Store Profile</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Manage your store details and account security
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN (2/3 width on xl) ──────────────────────────────── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* ── Store Information Panel ────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <SectionHeader
                            icon={BuildingStorefrontIcon}
                            title="Store Information"
                            subtitle="Your store's public and contact details"
                            action={
                                !isStoreEditMode ? (
                                    <button
                                        onClick={() => setIsStoreEditMode(true)}
                                        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 
                               transition-colors font-medium"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : null
                            }
                        />

                        {/* VIEW MODE */}
                        {!isStoreEditMode && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FieldDisplay label="Store Name" value={profile.storeName} />
                                <FieldDisplay label="Owner Name" value={profile.ownerName} />
                                <FieldDisplay label="Registered Email" value={profile.email} />
                                <FieldDisplay label="Phone Number" value={profile.phone} />
                                <div className="sm:col-span-2">
                                    <FieldDisplay label="Address" value={profile.address} />
                                </div>
                            </div>
                        )}

                        {/* EDIT MODE */}
                        {isStoreEditMode && (
                            <form onSubmit={handleStoreSave} noValidate>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Store Name *"
                                        name="storeName"
                                        register={storeForm.register}
                                        error={storeForm.formState.errors.storeName}
                                        placeholder="Your store name"
                                    />
                                    <FormInput
                                        label="Owner Name *"
                                        name="ownerName"
                                        register={storeForm.register}
                                        error={storeForm.formState.errors.ownerName}
                                        placeholder="Full name"
                                    />

                                    {/* Immutable email — shown as disabled, not editable */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">
                                            Registered Email
                                            <span className="ml-2 text-xs text-slate-600">(cannot be changed)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="input-dark w-full opacity-50 cursor-not-allowed"
                                        />
                                    </div>

                                    <FormInput
                                        label="Phone Number"
                                        name="phone"
                                        register={storeForm.register}
                                        error={storeForm.formState.errors.phone}
                                        placeholder="10-digit mobile number"
                                    />

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1.5">Address</label>
                                        <textarea
                                            {...storeForm.register('address')}
                                            rows={3}
                                            placeholder="Store address"
                                            className={`input-dark w-full resize-none ${storeForm.formState.errors.address ? 'border-red-500' : ''
                                                }`}
                                        />
                                        {storeForm.formState.errors.address && (
                                            <p className="text-red-400 text-xs mt-1">
                                                {storeForm.formState.errors.address.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Mode Actions */}
                                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
                                    <button
                                        type="submit"
                                        disabled={isStoreSaving || !storeForm.formState.isDirty}
                                        className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isStoreSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStoreCancel}
                                        disabled={isStoreSaving}
                                        className="btn-ghost flex items-center gap-2"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── Security Panel ─────────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <SectionHeader
                            icon={LockClosedIcon}
                            title="Change Password"
                            subtitle="Update your account password. You'll stay logged in."
                        />

                        <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
                            <FormInput
                                label="Current Password *"
                                name="currentPassword"
                                register={passwordForm.register}
                                error={passwordForm.formState.errors.currentPassword}
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Enter current password"
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(p => !p)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showCurrentPassword
                                            ? <EyeSlashIcon className="w-4 h-4" />
                                            : <EyeIcon className="w-4 h-4" />
                                        }
                                    </button>
                                }
                            />

                            <FormInput
                                label="New Password *"
                                name="newPassword"
                                register={passwordForm.register}
                                error={passwordForm.formState.errors.newPassword}
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(p => !p)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showNewPassword
                                            ? <EyeSlashIcon className="w-4 h-4" />
                                            : <EyeIcon className="w-4 h-4" />
                                        }
                                    </button>
                                }
                            />

                            <FormInput
                                label="Confirm New Password *"
                                name="confirmPassword"
                                register={passwordForm.register}
                                error={passwordForm.formState.errors.confirmPassword}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Re-enter new password"
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(p => !p)}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showConfirmPassword
                                            ? <EyeSlashIcon className="w-4 h-4" />
                                            : <EyeIcon className="w-4 h-4" />
                                        }
                                    </button>
                                }
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPasswordSaving || !passwordForm.formState.isDirty}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isPasswordSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheckIcon className="w-4 h-4" />
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (1/3 width on xl) ─────────────────────────────── */}
                <div className="space-y-6">

                    {/* ── Store Statistics ───────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <SectionHeader
                            icon={CubeIcon}
                            title="Store Overview"
                            subtitle="Live summary of your store data"
                        />
                        <div className="space-y-4">
                            <StatCard
                                icon={CubeIcon}
                                label="Total Products"
                                value={profile.totalProducts?.toLocaleString()}
                                color="bg-violet-500/30"
                            />
                            <StatCard
                                icon={UsersIcon}
                                label="Total Customers"
                                value={profile.totalCustomers?.toLocaleString()}
                                color="bg-emerald-500/30"
                            />
                            <StatCard
                                icon={ShoppingCartIcon}
                                label="Total Orders"
                                value={profile.totalOrders?.toLocaleString()}
                                color="bg-blue-500/30"
                            />
                        </div>
                    </div>

                    {/* ── Account Details ────────────────────────────────────────────── */}
                    <div className="glass-card p-6">
                        <SectionHeader
                            icon={CalendarDaysIcon}
                            title="Account Details"
                            subtitle="Read-only account information"
                        />
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Username</p>
                                <p className="text-white font-medium font-mono">@{profile.username}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-white font-medium">{formatDate(profile.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Updated</p>
                                <p className="text-white font-medium">{formatDate(profile.updatedAt)}</p>
                            </div>

                            {/* Store ID copy pill */}
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Store ID</p>
                                <button
                                    onClick={handleCopyStoreId}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 
                             hover:bg-slate-700 border border-slate-700 hover:border-slate-600 
                             transition-all group w-full"
                                >
                                    <span className="text-slate-300 font-mono text-sm flex-1 text-left">
                                        #{profile.storeId}
                                    </span>
                                    {copied ? (
                                        <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                        <ClipboardDocumentIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 
                                                       flex-shrink-0 transition-colors" />
                                    )}
                                </button>
                                <p className="text-xs text-slate-600 mt-1">
                                    {copied ? 'Copied to clipboard!' : 'Click to copy for support'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreProfile;
