import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { PlusIcon, XMarkIcon, ShoppingCartIcon, EyeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const STATUS_CONFIG = {
    PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
    CONFIRMED: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Confirmed' },
    SHIPPED: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400', label: 'Shipped' },
    DELIVERED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Delivered' },
    COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Completed' },
    CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', label: 'Cancelled' },
};

export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        orderItems: [{ productId: '', quantity: 1 }]
    });

    useEffect(() => { fetchData(); }, [page, size]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, productsRes, customersRes] = await Promise.all([
                api.get(`/orders?page=${page}&size=${size}`),
                api.get(`/products?page=0&size=1000`),
                api.get(`/customers?page=0&size=1000`)
            ]);

            const ordersData = ordersRes.data.data ? ordersRes.data.data : ordersRes.data;
            const productsData = productsRes.data.data ? productsRes.data.data : productsRes.data;
            const customersData = customersRes.data.data ? customersRes.data.data : customersRes.data;

            setOrders(ordersData.content || []);
            setTotalPages(ordersData.totalPages || 1);
            setTotalElements(ordersData.totalElements || 0);
            setProducts(productsData.content || []);
            setCustomers(customersData.content || []);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setNewOrder({
            ...newOrder,
            orderItems: [...newOrder.orderItems, { productId: '', quantity: 1 }]
        });
    };

    const handleRemoveItem = (index) => {
        if (newOrder.orderItems.length > 1) {
            setNewOrder({
                ...newOrder,
                orderItems: newOrder.orderItems.filter((_, i) => i !== index)
            });
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newOrder.orderItems];
        updatedItems[index][field] = value;
        setNewOrder({ ...newOrder, orderItems: updatedItems });
    };

    const calculateTotal = () => {
        return newOrder.orderItems.reduce((total, item) => {
            const product = products.find(p => p.id === parseInt(item.productId));
            if (product) {
                return total + (product.price * parseInt(item.quantity || 0));
            }
            return total;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                customerId: newOrder.customerId ? parseInt(newOrder.customerId) : null,
                orderItems: newOrder.orderItems.map(item => ({
                    productId: parseInt(item.productId),
                    quantity: parseInt(item.quantity)
                }))
            };
            await api.post('/orders', payload);
            toast.success('Order created!');
            fetchData();
            setIsModalOpen(false);
            setNewOrder({ customerId: '', orderItems: [{ productId: '', quantity: 1 }] });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create order');
        }
    };

    const updateStatus = async (id, status, e) => {
        e?.stopPropagation();
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const getNextAction = (order) => {
        switch (order.status) {
            case 'PENDING':
                return (
                    <div className="flex items-center space-x-2">
                        <button onClick={(e) => updateStatus(order.id, 'CONFIRMED', e)}
                            className="text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all">
                            Confirm
                        </button>
                        <button onClick={(e) => updateStatus(order.id, 'CANCELLED', e)}
                            className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1.5 rounded-lg transition-all">
                            Cancel
                        </button>
                    </div>
                );
            case 'CONFIRMED':
                return (
                    <button onClick={(e) => updateStatus(order.id, 'SHIPPED', e)}
                        className="text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-all">
                        Ship
                    </button>
                );
            case 'SHIPPED':
                return (
                    <button onClick={(e) => updateStatus(order.id, 'DELIVERED', e)}
                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all">
                        Deliver
                    </button>
                );
            default:
                return null;
        }
    };

    const filteredOrders = statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter);
    const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

    if (loading && orders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-32 shimmer" />
                    <div className="h-10 w-36 shimmer" />
                </div>
                <div className="glass-card-solid overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-surface-800/50">
                            <div className="h-4 w-16 shimmer" />
                            <div className="h-4 w-24 shimmer" />
                            <div className="h-4 w-32 shimmer" />
                            <div className="h-4 w-20 shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order Management</h1>
                    <p className="text-sm text-surface-400 mt-1">{totalElements} total orders</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>New Order</span>
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => {
                    const count = status === 'ALL' ? orders.length : (statusCounts[status] || 0);
                    const isActive = statusFilter === status;
                    const cfg = STATUS_CONFIG[status];
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${isActive
                                ? status === 'ALL'
                                    ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/25'
                                    : `${cfg?.bg} ${cfg?.text} border-current/20`
                                : 'bg-surface-800/50 text-surface-400 border-surface-700/30 hover:text-surface-200'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : cfg?.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Orders List */}
            <div className="glass-card-solid overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-surface-500">
                        <ShoppingBagIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-surface-600 mt-1">
                            {statusFilter !== 'ALL' ? 'Try a different filter' : 'Create your first order to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-surface-700/20">
                        {filteredOrders.map((order, index) => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            return (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-800/30 cursor-pointer transition-colors group animate-fade-in"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-surface-700/50 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-brand-400">#{String(order.id).padStart(4, '0')}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors truncate">
                                                {order.customerName || 'Walk-in Customer'}
                                            </p>
                                            <p className="text-xs text-surface-500">
                                                {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${order.status === 'PENDING' ? 'animate-pulse' : ''}`} />
                                            <span>{cfg.label}</span>
                                        </span>
                                        <span className="text-sm font-bold text-white w-20 text-right">${order.totalAmount?.toFixed(2)}</span>
                                        <div className="hidden sm:flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                            {getNextAction(order)}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order.id}`); }}
                                            className="text-surface-400 hover:text-brand-400 p-1.5 hover:bg-brand-500/10 rounded-lg transition-all"
                                            title="View details"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    size={size}
                    onPageChange={setPage}
                    onSizeChange={(s) => { setSize(s); setPage(0); }}
                />
            )}

            {/* Create Order Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-700/30 sticky top-0 bg-surface-800 z-10 rounded-t-2xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                                    <ShoppingCartIcon className="w-5 h-5 text-brand-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Create New Order</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-200 p-1 hover:bg-surface-700/50 rounded-lg transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Customer</label>
                                <select className="input-dark" value={newOrder.customerId} onChange={e => setNewOrder({ ...newOrder, customerId: e.target.value })}>
                                    <option value="">Walk-in Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-3">Order Items</label>
                                <div className="space-y-3">
                                    {newOrder.orderItems.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <select
                                                required
                                                className="input-dark flex-1"
                                                value={item.productId}
                                                onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                            >
                                                <option value="">Select product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} — ${p.price} (Stock: {p.stock})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                placeholder="Qty"
                                                className="input-dark w-24"
                                                value={item.quantity}
                                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                            />
                                            {newOrder.orderItems.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="btn-danger flex-shrink-0">
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddItem} className="mt-3 text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors">
                                    + Add another item
                                </button>
                            </div>

                            <div className="bg-surface-900/50 rounded-xl p-4 flex items-center justify-between border border-surface-700/30">
                                <span className="text-surface-300 font-medium">Estimated Total</span>
                                <span className="text-2xl font-bold text-white">${calculateTotal().toFixed(2)}</span>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-700/30">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Place Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
