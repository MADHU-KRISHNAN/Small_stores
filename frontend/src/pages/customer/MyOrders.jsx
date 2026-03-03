import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ClipboardDocumentListIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
    PENDING: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
    SHIPPED: 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
    COMPLETED: 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => { fetchOrders(); }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/customer/orders', { params: { page, size: 10 } });
            const data = res.data.data || res.data;
            setOrders(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    if (loading) {
        return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-5 bg-surface-700 rounded w-1/3 mb-3" /><div className="h-4 bg-surface-700 rounded w-1/2" /></div>)}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <ClipboardDocumentListIcon className="w-7 h-7 text-brand-400" />
                <span>My Orders</span>
            </h1>

            {orders.length === 0 ? (
                <div className="glass-card text-center py-16">
                    <ClipboardDocumentListIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl text-surface-300 font-medium">No orders yet</h3>
                    <p className="text-surface-500 mt-1 mb-4">Your order history will appear here</p>
                    <Link to="/shop" className="btn-primary inline-block px-6 py-2.5">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="glass-card p-5 hover:border-brand-500/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-white font-semibold">Order #{order.id}</h3>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.PENDING}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-brand-400 font-bold text-lg">${order.totalAmount?.toFixed(2)}</p>
                            </div>

                            <p className="text-surface-400 text-xs mb-3">
                                Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            </p>

                            {/* Order items */}
                            <div className="space-y-2">
                                {(order.orderItems || []).map((item, i) => (
                                    <div key={i} className="flex items-center space-x-3 py-2 border-t border-surface-700/50 first:border-0 first:pt-0">
                                        <div className="w-8 h-8 rounded bg-surface-700 flex items-center justify-center flex-shrink-0">
                                            <CubeIcon className="w-4 h-4 text-surface-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm truncate">{item.productName}</p>
                                            <p className="text-surface-400 text-xs">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                                        </div>
                                        <p className="text-surface-300 text-sm font-medium">${item.totalPrice?.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                        className="px-4 py-2 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 text-sm">Previous</button>
                    <span className="text-surface-400 text-sm">Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                        className="px-4 py-2 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 text-sm">Next</button>
                </div>
            )}
        </div>
    );
}
