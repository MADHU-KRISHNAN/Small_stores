import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ClipboardDocumentListIcon, CubeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
    CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' },
    SHIPPED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Shipped' },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Delivered' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Cancelled' },
};

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => { fetchOrders(); }, [page]);

    const fetchOrders = async () => {
        setLoading(true);
        try { const res = await api.get('/customer/orders', { params: { page, size: 10 } }); const data = res.data.data || res.data; setOrders(data.content || []); setTotalPages(data.totalPages || 0); }
        catch { /* ignore */ } finally { setLoading(false); }
    };

    if (loading) {
        return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"><div className="h-5 bg-gray-100 rounded w-1/3 mb-3" /><div className="h-4 bg-gray-50 rounded w-1/2" /></div>)}</div>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <ClipboardDocumentListIcon className="w-6 h-6 text-orange-500" />
                <span>My Orders</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
                    <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 font-medium">No orders yet</h3>
                    <p className="text-gray-400 mt-1 mb-5">Your order history will appear here</p>
                    <Link to="/shop" className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 shadow-md transition-all">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div>
                                            <span className="text-gray-400">ORDER PLACED</span>
                                            <p className="text-gray-700 font-medium">{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">TOTAL</span>
                                            <p className="text-gray-900 font-bold">${order.totalAmount?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text} border ${s.border}`}>{s.label}</span>
                                        <span className="text-xs text-gray-400">#{order.id}</span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-5 space-y-3">
                                    {(order.orderItems || []).map((item, i) => (
                                        <div key={i} className="flex items-center space-x-3">
                                            <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                                <CubeIcon className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">${item.totalPrice?.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-1 text-xs text-green-600">
                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                        <span>Shipped by SmallStores</span>
                                    </div>
                                    <Link to="/shop" className="text-xs text-orange-500 hover:text-orange-600 font-medium">Buy again →</Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-orange-300 disabled:opacity-40 text-sm font-medium transition-all shadow-sm">← Previous</button>
                    <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-orange-300 disabled:opacity-40 text-sm font-medium transition-all shadow-sm">Next →</button>
                </div>
            )}
        </div>
    );
}
