import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    CubeIcon, ShoppingCartIcon, HeartIcon, ArrowLeftIcon, BuildingStorefrontIcon,
    TruckIcon, ShieldCheckIcon, ArrowPathIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);

    useEffect(() => { fetchProduct(); }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/public/products/${id}`);
            setProduct(res.data.data || res.data);
        } catch { toast.error('Product not found'); }
        finally { setLoading(false); }
    };

    const addToCart = async () => {
        try {
            await api.post('/customer/cart/items', { productId: product.id, quantity: qty });
            toast.success(`Added ${qty} item(s) to cart!`);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const addToWishlist = async () => {
        try {
            await api.post(`/customer/wishlist/${product.id}`);
            toast.success('Saved to wishlist!');
        } catch { toast.error('Already in wishlist'); }
    };

    const getRating = (pid) => { const r = ((pid * 7 + 3) % 20 + 30) / 10; return Math.round(r * 10) / 10; };
    const getReviewCount = (pid) => ((pid * 13 + 7) % 200) + 10;

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24" />
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="aspect-square bg-gray-100 rounded-xl" />
                        <div className="space-y-4"><div className="h-8 bg-gray-100 rounded w-3/4" /><div className="h-4 bg-gray-100 rounded w-1/2" /><div className="h-6 bg-gray-100 rounded w-1/4" /></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-600">Product not found</h3>
                <Link to="/shop" className="text-orange-500 hover:underline mt-2 inline-block">Back to shop</Link>
            </div>
        );
    }

    const rating = getRating(product.id);
    const reviews = getReviewCount(product.id);

    return (
        <div className="space-y-5">
            <Link to="/shop" className="inline-flex items-center space-x-1.5 text-gray-500 hover:text-orange-600 transition-colors text-sm">
                <ArrowLeftIcon className="w-4 h-4" /><span>Back to shop</span>
            </Link>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <CubeIcon className="w-28 h-28 text-gray-300" />
                        {product.available && (
                            <span className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">In Stock</span>
                        )}
                        {!product.available && (
                            <span className="absolute top-4 left-4 bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                            <div className="flex items-center space-x-2 mt-1.5">
                                <BuildingStorefrontIcon className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-gray-500">Sold by <span className="text-orange-500 font-medium">{product.storeName}</span></span>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => (
                                    s <= Math.floor(rating) ? <StarSolid key={s} className="w-4 h-4 text-orange-400" /> : <StarIcon key={s} className="w-4 h-4 text-gray-300" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">{rating}</span>
                            <span className="text-sm text-gray-400">({reviews} ratings)</span>
                        </div>

                        <div className="border-t border-b border-gray-100 py-3">
                            <p className="text-3xl font-bold text-gray-900">
                                <span className="text-sm font-normal text-gray-500 align-top">$</span>{product.price?.toFixed(2)}
                            </p>
                            {product.available && <p className="text-xs text-green-600 font-medium mt-1">✓ {product.stock} available — order soon</p>}
                        </div>

                        {product.category && (
                            <span className="inline-block text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-600 font-medium">{product.category}</span>
                        )}

                        {product.description && (
                            <div><h3 className="text-sm font-semibold text-gray-700 mb-1">About this item</h3><p className="text-gray-500 text-sm leading-relaxed">{product.description}</p></div>
                        )}

                        {/* Quantity + Add to Cart */}
                        {product.available && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center space-x-3">
                                    <label className="text-sm text-gray-600 font-medium">Qty:</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-sm transition-colors">−</button>
                                        <span className="px-4 py-1.5 text-gray-900 text-sm font-semibold border-x border-gray-300 min-w-[44px] text-center bg-gray-50">{qty}</span>
                                        <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 text-sm transition-colors">+</button>
                                    </div>
                                </div>
                                <button onClick={addToCart}
                                    className="w-full py-3 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                                    <ShoppingCartIcon className="w-5 h-5" /><span>Add to Cart</span>
                                </button>
                                <button onClick={addToWishlist}
                                    className="w-full py-2.5 rounded-full border border-gray-300 text-gray-700 hover:border-orange-300 hover:text-orange-600 text-sm font-medium transition-all flex items-center justify-center space-x-2">
                                    <HeartIcon className="w-4 h-4" /><span>Add to Wishlist</span>
                                </button>
                            </div>
                        )}

                        {/* Trust signals */}
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                            {[
                                { icon: TruckIcon, text: 'Free Delivery' },
                                { icon: ShieldCheckIcon, text: 'Secure Payment' },
                                { icon: ArrowPathIcon, text: 'Easy Returns' },
                            ].map((b, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-2">
                                    <b.icon className="w-5 h-5 text-orange-500 mb-1" />
                                    <span className="text-[10px] text-gray-500 font-medium">{b.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
