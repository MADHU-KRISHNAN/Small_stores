import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { PlusIcon, XMarkIcon, ShoppingCartIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [size] = useState(10);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        orderItems: [{ productId: '', quantity: 1 }]
    });

    useEffect(() => { fetchData(); }, [page]);

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

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED': return 'badge badge-success';
            case 'PENDING': return 'badge badge-warning';
            case 'CANCELLED': return 'badge badge-danger';
            default: return 'badge badge-info';
        }
    };

    if (loading) {
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
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-sm text-surface-400 mt-1">{totalElements} total orders</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>New Order</span>
                </button>
            </div>

            <div className="glass-card-solid overflow-hidden">
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                                        <ShoppingCartIcon className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm">No orders yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order, index) => (
                                <>
                                    <tr key={order.id} className="animate-fade-in cursor-pointer" style={{ animationDelay: `${index * 30}ms` }} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                        <td>
                                            <span className="font-semibold text-brand-400">#{String(order.id).padStart(4, '0')}</span>
                                        </td>
                                        <td className="text-surface-400">
                                            {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="text-surface-300">{order.customerName || 'Walk-in'}</td>
                                        <td className="text-white font-semibold">${order.totalAmount.toFixed(2)}</td>
                                        <td>
                                            <span className={getStatusBadge(order.status)}>
                                                {order.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5" />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'COMPLETED'); }}
                                                        className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                                <button onClick={(e) => e.stopPropagation()} className="text-surface-500 hover:text-surface-300 p-1">
                                                    {expandedOrder === order.id ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Expanded order items */}
                                    {expandedOrder === order.id && order.orderItems && (
                                        <tr key={`items-${order.id}`}>
                                            <td colSpan={6} className="!p-0">
                                                <div className="bg-surface-900/50 px-8 py-4 space-y-2 animate-fade-in">
                                                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Order Items</p>
                                                    {order.orderItems.map(item => (
                                                        <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-6 h-6 rounded bg-surface-700/50 flex items-center justify-center text-xs text-surface-400">{item.quantity}x</div>
                                                                <span className="text-surface-300">{item.productName}</span>
                                                            </div>
                                                            <span className="text-surface-400">${(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center justify-between pt-2 border-t border-surface-700/30 text-sm font-semibold">
                                                        <span className="text-surface-300">Total</span>
                                                        <span className="text-white">${order.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary disabled:opacity-30">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary disabled:opacity-30">Next</button>
                    </div>
                </div>
            )}

            {/* Create Order Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-700/30 sticky top-0 bg-surface-800 z-10 rounded-t-2xl">
                            <h2 className="text-lg font-bold text-white">Create New Order</h2>
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

                            {/* Live Total */}
                            <div className="bg-surface-900/50 rounded-xl p-4 flex items-center justify-between border border-surface-700/30">
                                <span className="text-surface-300 font-medium">Estimated Total</span>
                                <span className="text-2xl font-bold text-white">${calculateTotal().toFixed(2)}</span>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-700/30">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
