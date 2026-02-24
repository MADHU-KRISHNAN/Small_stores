import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Plus } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        orderItems: [{ productId: '', quantity: 1 }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes, customersRes] = await Promise.all([
                api.get('/orders'),
                api.get('/products'),
                api.get('/customers')
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            setCustomers(customersRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
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

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...newOrder.orderItems];
        updatedItems[index][field] = value;
        setNewOrder({ ...newOrder, orderItems: updatedItems });
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
            fetchData();
            setIsModalOpen(false);
            setNewOrder({ customerId: '', orderItems: [{ productId: '', quantity: 1 }] });
        } catch (error) {
            alert("Failed to create order: " + (error.response?.data?.error || error.message));
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            fetchData();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Order</span>
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName || 'Walk-in'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {order.status === 'PENDING' && (
                                        <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="text-indigo-600 hover:text-indigo-900">Mark Completed</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create New Order</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Customer (Optional)</label>
                                <select
                                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                                    value={newOrder.customerId}
                                    onChange={e => setNewOrder({ ...newOrder, customerId: e.target.value })}
                                >
                                    <option value="">Walk-in Customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                                {newOrder.orderItems.map((item, index) => (
                                    <div key={index} className="flex space-x-4 mb-2">
                                        <select
                                            required
                                            className="flex-1 border rounded-md shadow-sm p-2"
                                            value={item.productId}
                                            onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}) - Stock: {p.stock}</option>)}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            placeholder="Qty"
                                            className="w-24 border rounded-md shadow-sm p-2"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddItem} className="text-sm text-indigo-600 hover:text-indigo-800 mt-2">+ Add another item</button>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
