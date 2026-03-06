import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { HeartIcon, ShoppingCartIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchWishlist(); }, []);

    const fetchWishlist = async () => {
        try { const res = await api.get('/customer/wishlist'); setItems(res.data.data || []); }
        catch { /* ignore */ } finally { setLoading(false); }
    };

    const removeFromWishlist = async (productId) => {
        try { await api.delete(`/customer/wishlist/${productId}`); setItems(prev => prev.filter(i => i.productId !== productId)); toast.success('Removed'); }
        catch { toast.error('Failed to remove'); }
    };

    const addToCart = async (productId) => {
        try { await api.post('/customer/cart/items', { productId, quantity: 1 }); toast.success('Added to cart!'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    if (loading) {
        return <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse"><div className="h-6 bg-gray-100 rounded w-1/3 mb-4" /><div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-50 rounded-lg" />)}</div></div>;
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center space-x-2">
                <HeartIcon className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                {items.length > 0 && <span className="text-gray-400 text-lg">({items.length})</span>}
            </div>

            {items.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
                    <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 font-medium">Your wishlist is empty</h3>
                    <p className="text-gray-400 mt-1 mb-5">Save products you love for later</p>
                    <Link to="/shop" className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 shadow-md transition-all">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
                            <Link to={`/product/${item.productId}`} className="block relative aspect-[4/3] bg-gray-50 flex items-center justify-center">
                                <CubeIcon className="w-12 h-12 text-gray-300 group-hover:text-orange-300 transition-colors" />
                                {!item.available && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </Link>
                            <div className="p-3 space-y-1.5">
                                <Link to={`/product/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">{item.productName}</Link>
                                <p className="text-[11px] text-gray-400">{item.storeName}</p>
                                <p className="text-orange-600 font-bold">${item.price?.toFixed(2)}</p>
                                <div className="flex space-x-2 pt-1">
                                    {item.available && (
                                        <button onClick={() => addToCart(item.productId)}
                                            className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-sm transition-all">
                                            <ShoppingCartIcon className="w-3.5 h-3.5" /><span>Add to Cart</span>
                                        </button>
                                    )}
                                    <button onClick={() => removeFromWishlist(item.productId)}
                                        className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
