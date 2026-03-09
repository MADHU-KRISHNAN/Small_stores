import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    ArrowLeftIcon,
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    CubeIcon,
    XCircleIcon,
    InboxIcon,
    BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

/* ──── Status timeline steps ──── */
const TIMELINE_STEPS = [
    { key: 'PENDING', label: 'Order Placed', icon: ClockIcon, description: 'Your order has been received' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircleIcon, description: 'Store confirmed your order' },
    { key: 'SHIPPED', label: 'Shipped', icon: TruckIcon, description: 'Your order is on its way' },
    { key: 'DELIVERED', label: 'Delivered', icon: InboxIcon, description: 'Order has been delivered' },
];

const STATUS_INDEX = { PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, COMPLETED: 3 };

const STATUS_COLORS = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    SHIPPED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
};

export default function OrderTrackingDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.get(`/customer/orders/${id}`);
                setOrder(res.data.data || res.data);
            } catch {
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    /* ──── Loading skeleton ──── */
    if (loading) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="flex justify-between">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col items-center space-y-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100" />
                                <div className="h-3 bg-gray-100 rounded w-16" />
                            </div>
                        ))}
                    </div>
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto text-center py-20">
                <XCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
                <p className="text-gray-400 mb-6">{error || 'We couldn\'t find this order.'}</p>
                <Link to="/my-orders" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 shadow-md transition-all">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to Orders</span>
                </Link>
            </div>
        );
    }

    const isCancelled = order.status === 'CANCELLED';
    const currentIndex = STATUS_INDEX[order.status] ?? 0;
    const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* ── Back link ─────────────────────── */}
            <Link to="/my-orders" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-orange-500 transition-colors group">
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to My Orders</span>
            </Link>

            {/* ── Header card ───────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Placed {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${sc.dot}`} />
                        {order.status}
                    </span>
                </div>

                {/* ── Store info ─────────────────── */}
                {order.storeName && (
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center space-x-2 text-sm text-gray-600">
                        <BuildingStorefrontIcon className="w-4 h-4 text-orange-400" />
                        <span>Sold by <strong className="text-gray-800">{order.storeName}</strong></span>
                    </div>
                )}

                {/* ── Visual timeline ────────────── */}
                {!isCancelled ? (
                    <div className="px-6 py-8">
                        {/* Desktop horizontal timeline */}
                        <div className="hidden sm:block">
                            <div className="flex items-start justify-between relative">
                                {/* Connector line */}
                                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
                                <div className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                                    style={{ width: `${currentIndex === 0 ? 0 : (currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 40px)' }} />

                                {TIMELINE_STEPS.map((step, idx) => {
                                    const StepIcon = step.icon;
                                    const isComplete = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;
                                    return (
                                        <div key={step.key} className="relative z-10 flex flex-col items-center text-center" style={{ width: `${100 / TIMELINE_STEPS.length}%` }}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isComplete
                                                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                : 'bg-white border-gray-300 text-gray-400'
                                                } ${isCurrent ? 'ring-4 ring-orange-100 scale-110' : ''}`}>
                                                {isComplete && idx < currentIndex ? (
                                                    <CheckCircleSolid className="w-5 h-5" />
                                                ) : (
                                                    <StepIcon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <p className={`text-xs font-semibold mt-3 ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                            <p className={`text-[10px] mt-0.5 max-w-[120px] ${isComplete ? 'text-gray-500' : 'text-gray-300'}`}>{step.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile vertical timeline */}
                        <div className="sm:hidden space-y-0">
                            {TIMELINE_STEPS.map((step, idx) => {
                                const StepIcon = step.icon;
                                const isComplete = idx <= currentIndex;
                                const isCurrent = idx === currentIndex;
                                const isLast = idx === TIMELINE_STEPS.length - 1;
                                return (
                                    <div key={step.key} className="flex items-start">
                                        <div className="flex flex-col items-center mr-4">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isComplete
                                                ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20'
                                                : 'bg-white border-gray-300 text-gray-400'
                                                } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}>
                                                {isComplete && idx < currentIndex ? (
                                                    <CheckCircleSolid className="w-4 h-4" />
                                                ) : (
                                                    <StepIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            {!isLast && (
                                                <div className={`w-0.5 h-10 ${idx < currentIndex ? 'bg-orange-400' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                        <div className={`pt-1.5 pb-6 ${!isLast ? '' : ''}`}>
                                            <p className={`text-sm font-semibold ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                            <p className={`text-xs ${isComplete ? 'text-gray-500' : 'text-gray-300'}`}>{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Cancelled state */
                    <div className="px-6 py-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
                            <XCircleIcon className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-600">Order Cancelled</h3>
                        <p className="text-sm text-gray-400 mt-1">This order has been cancelled and items have been restocked.</p>
                    </div>
                )}
            </div>

            {/* ── Order summary ──────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {(order.orderItems || []).map((item, i) => (
                        <div key={i} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                            <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <CubeIcon className="w-7 h-7 text-orange-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-900">${item.totalPrice?.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total</span>
                    <span className="text-lg font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                </div>
            </div>

            {/* ── Notes ──────────────────────────── */}
            {order.notes && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Order Notes</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{order.notes}</p>
                </div>
            )}

            {/* ── Actions footer ─────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-8">
                <Link to="/my-orders" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Back to All Orders</span>
                </Link>
                <Link to="/shop" className="inline-flex items-center space-x-2 px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all">
                    <span>Continue Shopping</span>
                </Link>
            </div>
        </div>
    );
}
