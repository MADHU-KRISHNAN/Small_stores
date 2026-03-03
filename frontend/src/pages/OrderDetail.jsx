import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
    ArrowLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    HomeIcon,
    XCircleIcon,
    UserIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    CubeIcon,
    ReceiptRefundIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    PENDING: { color: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', icon: ClockIcon, label: 'Pending' },
    CONFIRMED: { color: 'text-blue-400', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20', icon: CheckCircleIcon, label: 'Confirmed' },
    SHIPPED: { color: 'text-purple-400', bg: 'bg-purple-500/10', ring: 'ring-purple-500/20', icon: TruckIcon, label: 'Shipped' },
    DELIVERED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', icon: HomeIcon, label: 'Delivered' },
    COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', icon: CheckCircleIcon, label: 'Completed' },
    CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/20', icon: XCircleIcon, label: 'Cancelled' },
};

const TRANSITIONS = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    COMPLETED: [],
    CANCELLED: [],
};

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => { fetchOrder(); }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            const data = res.data.data ? res.data.data : res.data;
            setOrder(data);
        } catch (err) {
            toast.error('Order not found');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            await api.patch(`/orders/${id}/status`, { status: newStatus });
            toast.success(`Order marked as ${newStatus.toLowerCase()}`);
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    const getTimelineIndex = (status) => {
        if (status === 'CANCELLED') return -1;
        if (status === 'COMPLETED') return TIMELINE_STEPS.length;
        return TIMELINE_STEPS.indexOf(status);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-32 shimmer" />
                <div className="glass-card-solid p-8 space-y-4">
                    <div className="h-6 w-48 shimmer" />
                    <div className="h-4 w-64 shimmer" />
                    <div className="h-40 shimmer rounded-xl" />
                </div>
            </div>
        );
    }

    if (!order) return null;

    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = config.icon;
    const currentIdx = getTimelineIndex(order.status);
    const nextStatuses = TRANSITIONS[order.status] || [];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Back + Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/orders')} className="btn-secondary !p-2.5">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Order <span className="text-brand-400">#{String(order.id).padStart(4, '0')}</span>
                        </h1>
                        <p className="text-sm text-surface-400 mt-0.5">
                            {new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${config.bg} ring-1 ${config.ring}`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
                </div>
            </div>

            {/* Timeline */}
            {order.status !== 'CANCELLED' && (
                <div className="glass-card-solid p-6">
                    <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-6">Order Timeline</h3>
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-6 right-6 h-0.5 bg-surface-700">
                            <div
                                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                                style={{ width: `${Math.max(0, (currentIdx / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
                            />
                        </div>
                        {TIMELINE_STEPS.map((step, idx) => {
                            const stepConfig = STATUS_CONFIG[step];
                            const StepIcon = stepConfig.icon;
                            const isComplete = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                                <div key={step} className="flex flex-col items-center relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent
                                        ? 'bg-brand-500 shadow-glow ring-4 ring-brand-500/20'
                                        : isComplete
                                            ? 'bg-brand-500/20 border-2 border-brand-400'
                                            : 'bg-surface-800 border-2 border-surface-700'
                                        }`}>
                                        <StepIcon className={`w-4 h-4 ${isComplete ? 'text-brand-400' : 'text-surface-500'}`} />
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${isComplete ? 'text-brand-400' : 'text-surface-500'}`}>
                                        {stepConfig.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Status Actions */}
            {nextStatuses.length > 0 && (
                <div className="glass-card-solid p-6">
                    <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Update Status</h3>
                    <div className="flex flex-wrap gap-3">
                        {nextStatuses.map(status => {
                            const sc = STATUS_CONFIG[status];
                            const BtnIcon = sc.icon;
                            const isCancel = status === 'CANCELLED';
                            return (
                                <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    disabled={updating}
                                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ring-1 ${isCancel
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-red-500/20'
                                        : 'bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 ring-brand-500/20'
                                        } disabled:opacity-50`}
                                >
                                    <BtnIcon className="w-4 h-4" />
                                    <span>Mark as {sc.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items — Receipt Style */}
                <div className="lg:col-span-2 glass-card-solid overflow-hidden">
                    <div className="p-6 border-b border-surface-700/30 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
                            <ReceiptRefundIcon className="w-4 h-4 text-brand-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Order Items</h3>
                    </div>
                    <div className="divide-y divide-surface-700/20">
                        {order.orderItems?.map((item, idx) => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center">
                                        <CubeIcon className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-surface-200">{item.productName}</p>
                                        <p className="text-xs text-surface-500">${item.price?.toFixed(2)} × {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    {/* Total */}
                    <div className="px-6 py-4 bg-surface-900/30 border-t border-surface-700/30 flex items-center justify-between">
                        <span className="text-sm font-semibold text-surface-300">Order Total</span>
                        <span className="text-xl font-bold text-white">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    <div className="glass-card-solid p-6">
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Customer</h3>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center ring-1 ring-brand-500/20">
                                <UserIcon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <p className="text-surface-200 font-medium">{order.customerName || 'Walk-in Customer'}</p>
                                <p className="text-xs text-surface-500">ID: {order.customerId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card-solid p-6">
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-4 h-4 text-surface-500" />
                                <div>
                                    <p className="text-xs text-surface-500">Order Date</p>
                                    <p className="text-sm text-surface-200">
                                        {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CurrencyDollarIcon className="w-4 h-4 text-surface-500" />
                                <div>
                                    <p className="text-xs text-surface-500">Total Amount</p>
                                    <p className="text-sm text-surface-200 font-bold">${order.totalAmount?.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CubeIcon className="w-4 h-4 text-surface-500" />
                                <div>
                                    <p className="text-xs text-surface-500">Items Count</p>
                                    <p className="text-sm text-surface-200">{order.orderItems?.length || 0} items</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
