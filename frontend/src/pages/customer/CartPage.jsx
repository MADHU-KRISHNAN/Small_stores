import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ShoppingCartIcon, TrashIcon, CubeIcon, ArrowRightIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => { fetchCart(); }, []);

    const fetchCart = async () => {
        try { const res = await api.get('/customer/cart'); setCart(res.data.data || res.data); }
        catch { /* ignore */ } finally { setLoading(false); }
    };

    const updateQty = async (productId, quantity) => {
        try { const res = await api.put(`/customer/cart/items/${productId}?quantity=${quantity}`); setCart(res.data.data || res.data); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    };

    const removeItem = async (productId) => {
        try { const res = await api.delete(`/customer/cart/items/${productId}`); setCart(res.data.data || res.data); toast.success('Item removed'); }
        catch { toast.error('Failed to remove'); }
    };

    const placeOrder = async () => {
        setPlacing(true);
        try { await api.post('/customer/orders', {}); toast.success('Order placed successfully! 🎉'); fetchCart(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
        finally { setPlacing(false); }
    };

    if (loading) {
        return <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse"><div className="h-6 bg-gray-100 rounded w-1/3 mb-4" /><div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-lg" />)}</div></div>;
    }

    const items = cart?.items || [];

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

            {items.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
                    <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 font-medium">Your cart is empty</h3>
                    <p className="text-gray-400 mt-1 mb-5">Discover products you'll love</p>
                    <Link to="/shop" className="inline-flex items-center space-x-2 px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 shadow-md transition-all">
                        <span>Shop Now</span><ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Cart items */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                            {items.map(item => (
                                <div key={item.productId} className="p-4 flex items-center space-x-4 group hover:bg-orange-50/30 transition-colors">
                                    <Link to={`/product/${item.productId}`} className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 hover:border-orange-200 transition-colors">
                                        <CubeIcon className="w-10 h-10 text-gray-300" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">
                                            {item.productName}
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.storeName}</p>
                                        <p className="text-orange-600 font-bold mt-1">${item.price?.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 text-sm">−</button>
                                        <span className="px-3 py-1.5 text-gray-900 text-sm font-semibold border-x border-gray-200 bg-gray-50 min-w-[36px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 text-sm">+</button>
                                    </div>
                                    <p className="text-gray-900 font-bold text-sm w-20 text-right">${item.subtotal?.toFixed(2)}</p>
                                    <button onClick={() => removeItem(item.productId)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24 space-y-4">
                            <h3 className="text-base font-bold text-gray-900">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal ({cart.totalItems} items)</span>
                                    <span>${cart.totalAmount?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-2 flex justify-between text-gray-900 font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-orange-600">${cart.totalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                            <button onClick={placeOrder} disabled={placing}
                                className="w-full py-3 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60">
                                {placing ? 'Placing order...' : 'Place Order'}
                            </button>
                            <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400">
                                <ShieldCheckIcon className="w-3.5 h-3.5" />
                                <span>Secure checkout • SSL encrypted</span>
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <div className="flex items-center space-x-2 mb-1.5">
                                <TruckIcon className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-semibold text-orange-700">Free Delivery</span>
                            </div>
                            <p className="text-xs text-orange-600/70">On all orders. No minimum purchase required.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
