import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ShoppingCartIcon, TrashIcon, CubeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => { fetchCart(); }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('/customer/cart');
            setCart(res.data.data || res.data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    const updateQty = async (productId, quantity) => {
        try {
            const res = await api.put(`/customer/cart/items/${productId}?quantity=${quantity}`);
            setCart(res.data.data || res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    const removeItem = async (productId) => {
        try {
            const res = await api.delete(`/customer/cart/items/${productId}`);
            setCart(res.data.data || res.data);
            toast.success('Item removed');
        } catch { toast.error('Failed to remove'); }
    };

    const placeOrder = async () => {
        setPlacing(true);
        try {
            await api.post('/customer/orders', {});
            toast.success('Order placed successfully!');
            fetchCart();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally { setPlacing(false); }
    };

    if (loading) {
        return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-surface-700 rounded w-1/3 mb-4" /><div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-700 rounded-lg" />)}</div></div>;
    }

    const items = cart?.items || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <ShoppingCartIcon className="w-7 h-7 text-brand-400" />
                    <span>Shopping Cart</span>
                    {items.length > 0 && <span className="text-surface-400 text-lg font-normal">({cart.totalItems} items)</span>}
                </h1>
            </div>

            {items.length === 0 ? (
                <div className="glass-card text-center py-16">
                    <ShoppingCartIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl text-surface-300 font-medium">Your cart is empty</h3>
                    <p className="text-surface-500 mt-1 mb-4">Start shopping to fill it up!</p>
                    <Link to="/shop" className="btn-primary inline-flex items-center space-x-2 px-6 py-2.5">
                        <span>Browse Products</span>
                        <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart items */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map(item => (
                            <div key={item.productId} className="glass-card p-4 flex items-center space-x-4 group">
                                <div className="w-16 h-16 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
                                    <CubeIcon className="w-8 h-8 text-surface-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/product/${item.productId}`} className="text-white font-medium text-sm hover:text-brand-400 transition-colors">
                                        {item.productName}
                                    </Link>
                                    <p className="text-surface-400 text-xs">{item.storeName}</p>
                                    <p className="text-brand-400 font-semibold text-sm mt-0.5">${item.price?.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center border border-surface-600 rounded-lg">
                                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                                        className="px-2.5 py-1 text-surface-300 hover:text-white hover:bg-surface-700 rounded-l-lg text-sm">−</button>
                                    <span className="px-3 py-1 text-white text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                                        className="px-2.5 py-1 text-surface-300 hover:text-white hover:bg-surface-700 rounded-r-lg text-sm">+</button>
                                </div>
                                <p className="text-white font-semibold text-sm w-20 text-right">${item.subtotal?.toFixed(2)}</p>
                                <button onClick={() => removeItem(item.productId)}
                                    className="p-1.5 text-surface-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="glass-card p-6 h-fit sticky top-24 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-surface-300">
                                <span>Subtotal ({cart.totalItems} items)</span>
                                <span>${cart.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-surface-300">
                                <span>Shipping</span>
                                <span className="text-emerald-400">Free</span>
                            </div>
                            <div className="border-t border-surface-700 pt-2 flex justify-between text-white font-bold text-lg">
                                <span>Total</span>
                                <span className="text-brand-400">${cart.totalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={placeOrder}
                            disabled={placing}
                            className="btn-primary w-full py-3 text-sm font-semibold"
                        >
                            {placing ? 'Placing order...' : 'Place Order'}
                        </button>
                        <Link to="/shop" className="block text-center text-surface-400 hover:text-brand-400 text-sm transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
