import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { CubeIcon, ShoppingCartIcon, HeartIcon, ArrowLeftIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/public/products/${id}`);
            setProduct(res.data.data || res.data);
        } catch {
            toast.error('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        try {
            await api.post('/customer/cart/items', { productId: product.id, quantity: qty });
            toast.success(`Added ${qty} item(s) to cart!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const addToWishlist = async () => {
        try {
            await api.post(`/customer/wishlist/${product.id}`);
            toast.success('Added to wishlist!');
        } catch {
            toast.error('Already in wishlist or failed');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-surface-700 rounded w-32" />
                <div className="glass-card p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="h-80 bg-surface-700 rounded-xl" />
                        <div className="space-y-4">
                            <div className="h-8 bg-surface-700 rounded w-3/4" />
                            <div className="h-4 bg-surface-700 rounded w-1/2" />
                            <div className="h-6 bg-surface-700 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <CubeIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl text-surface-300">Product not found</h3>
                <Link to="/shop" className="text-brand-400 hover:underline mt-2 inline-block">Back to shop</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/shop" className="inline-flex items-center space-x-2 text-surface-400 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="text-sm">Back to shop</span>
            </Link>

            <div className="glass-card p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product image placeholder */}
                    <div className="relative h-80 md:h-96 bg-gradient-to-br from-surface-800 to-surface-700 rounded-xl flex items-center justify-center">
                        <CubeIcon className="w-24 h-24 text-surface-500" />
                        <span className={`absolute top-4 right-4 text-sm font-medium px-3 py-1 rounded-full ${product.available
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                            }`}>
                            {product.available ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Product details */}
                    <div className="space-y-5">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                            <div className="flex items-center space-x-2 mt-2">
                                <BuildingStorefrontIcon className="w-4 h-4 text-brand-400" />
                                <span className="text-surface-400 text-sm">Sold by <span className="text-brand-400">{product.storeName}</span></span>
                            </div>
                        </div>

                        {product.category && (
                            <span className="inline-block text-xs px-3 py-1 rounded-full bg-surface-700 text-surface-300">
                                {product.category}
                            </span>
                        )}

                        <p className="text-3xl font-bold text-brand-400">
                            ${product.price?.toFixed(2)}
                        </p>

                        {product.description && (
                            <div>
                                <h3 className="text-sm font-medium text-surface-300 mb-1">Description</h3>
                                <p className="text-surface-400 text-sm leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {product.available && (
                            <div className="flex items-center space-x-3">
                                <label className="text-sm text-surface-300">Qty:</label>
                                <div className="flex items-center border border-surface-600 rounded-lg">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="px-3 py-1.5 text-surface-300 hover:text-white hover:bg-surface-700 rounded-l-lg transition-colors">−</button>
                                    <span className="px-4 py-1.5 text-white text-sm font-medium min-w-[40px] text-center">{qty}</span>
                                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                        className="px-3 py-1.5 text-surface-300 hover:text-white hover:bg-surface-700 rounded-r-lg transition-colors">+</button>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={addToCart}
                                disabled={!product.available}
                                className="btn-primary flex-1 py-3 flex items-center justify-center space-x-2 disabled:opacity-40"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                <span>{product.available ? 'Add to Cart' : 'Out of Stock'}</span>
                            </button>
                            <button
                                onClick={addToWishlist}
                                className="px-4 py-3 rounded-xl border border-surface-600 text-surface-300 hover:text-red-400 hover:border-red-500/30 transition-all"
                            >
                                <HeartIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
