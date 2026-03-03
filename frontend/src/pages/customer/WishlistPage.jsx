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
        try {
            const res = await api.get('/customer/wishlist');
            setItems(res.data.data || []);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/customer/wishlist/${productId}`);
            setItems(prev => prev.filter(i => i.productId !== productId));
            toast.success('Removed from wishlist');
        } catch { toast.error('Failed to remove'); }
    };

    const addToCart = async (productId) => {
        try {
            await api.post('/customer/cart/items', { productId, quantity: 1 });
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    if (loading) {
        return <div className="glass-card p-8 animate-pulse"><div className="h-6 bg-surface-700 rounded w-1/3 mb-4" /><div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-surface-700 rounded-lg" />)}</div></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <HeartIcon className="w-7 h-7 text-red-400" />
                <span>My Wishlist</span>
                {items.length > 0 && <span className="text-surface-400 text-lg font-normal">({items.length})</span>}
            </h1>

            {items.length === 0 ? (
                <div className="glass-card text-center py-16">
                    <HeartIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl text-surface-300 font-medium">Your wishlist is empty</h3>
                    <p className="text-surface-500 mt-1 mb-4">Save products you love!</p>
                    <Link to="/shop" className="btn-primary inline-block px-6 py-2.5">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="glass-card group overflow-hidden">
                            <div className="relative h-36 bg-gradient-to-br from-surface-800 to-surface-700 flex items-center justify-center">
                                <CubeIcon className="w-12 h-12 text-surface-500" />
                                <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${item.available
                                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                                    }`}>
                                    {item.available ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <div className="p-4 space-y-2">
                                <Link to={`/product/${item.productId}`} className="text-white font-medium text-sm hover:text-brand-400 transition-colors line-clamp-1">
                                    {item.productName}
                                </Link>
                                <p className="text-surface-400 text-xs">{item.storeName}</p>
                                <p className="text-brand-400 font-bold">${item.price?.toFixed(2)}</p>
                                <div className="flex space-x-2 pt-1">
                                    {item.available && (
                                        <button onClick={() => addToCart(item.productId)}
                                            className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-xs font-medium transition-colors">
                                            <ShoppingCartIcon className="w-3.5 h-3.5" />
                                            <span>Add to Cart</span>
                                        </button>
                                    )}
                                    <button onClick={() => removeFromWishlist(item.productId)}
                                        className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
