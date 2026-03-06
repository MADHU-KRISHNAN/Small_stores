import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
    MagnifyingGlassIcon,
    CubeIcon,
    ShoppingCartIcon,
    HeartIcon,
    StarIcon,
    TruckIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ProductFeed() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProducts(); }, [search, category, sortBy, sortDir, page]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/public/categories');
            setCategories(res.data.data || []);
        } catch { /* ignore */ }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, size: 12, sortBy, sortDir };
            if (search) params.search = search;
            if (category) params.category = category;
            const res = await api.get('/public/products', { params });
            const data = res.data.data || res.data;
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post('/customer/cart/items', { productId, quantity: 1 });
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add');
        }
    };

    const addToWishlist = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post(`/customer/wishlist/${productId}`);
            toast.success('Saved to wishlist!');
        } catch {
            toast.error('Already in wishlist');
        }
    };

    // Generate a pseudo-random rating from product id for demo
    const getRating = (id) => {
        const r = ((id * 7 + 3) % 20 + 30) / 10;
        return Math.round(r * 10) / 10;
    };
    const getReviewCount = (id) => ((id * 13 + 7) % 200) + 10;

    return (
        <div className="space-y-5">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 p-8 md:p-10">
                <div className="relative z-10">
                    <p className="text-orange-900/60 text-sm font-medium mb-1">Welcome to SmallStores</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Discover Amazing Products
                    </h1>
                    <p className="text-white/80 text-base md:text-lg max-w-lg">
                        Shop from <span className="font-bold text-white">{totalElements}</span> curated items from trusted local stores
                    </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -top-8 right-20 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />

                {/* Trust badges */}
                <div className="relative z-10 flex flex-wrap gap-4 mt-5">
                    {[
                        { icon: TruckIcon, text: 'Free Shipping' },
                        { icon: ShieldCheckIcon, text: 'Secure Checkout' },
                        { icon: ArrowPathIcon, text: 'Easy Returns' },
                    ].map((b, i) => (
                        <div key={i} className="flex items-center space-x-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <b.icon className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-xs font-medium">{b.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text" value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="w-full h-10 pl-10 pr-4 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            placeholder="Search products..."
                        />
                    </div>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                        className="h-10 px-3 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 min-w-[150px]">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={`${sortBy}-${sortDir}`}
                        onChange={(e) => { const [s, d] = e.target.value.split('-'); setSortBy(s); setSortDir(d); setPage(0); }}
                        className="h-10 px-3 rounded-lg text-sm text-gray-700 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 min-w-[140px]">
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
                            <div className="w-full aspect-square bg-gray-100 rounded-lg mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-600 font-medium">No products found</h3>
                    <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => {
                        const rating = getRating(product.id);
                        const reviews = getReviewCount(product.id);
                        return (
                            <Link to={`/product/${product.id}`} key={product.id}
                                className="group bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 overflow-hidden">
                                {/* Image area */}
                                <div className="relative aspect-square bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
                                    <CubeIcon className="w-16 h-16 text-gray-300 group-hover:text-orange-300 group-hover:scale-110 transition-all duration-500" />

                                    {/* Stock badge */}
                                    {!product.available && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
                                        </div>
                                    )}

                                    {/* Hover actions */}
                                    <div className="absolute bottom-2 left-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        {product.available && (
                                            <button onClick={(e) => addToCart(e, product.id)}
                                                className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 shadow-md transition-all">
                                                <ShoppingCartIcon className="w-3.5 h-3.5" />
                                                <span>Add to Cart</span>
                                            </button>
                                        )}
                                        <button onClick={(e) => addToWishlist(e, product.id)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all">
                                            <HeartIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-1.5">
                                    <p className="text-[11px] text-orange-500 font-medium truncate">{product.storeName}</p>
                                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center space-x-1">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                s <= Math.floor(rating)
                                                    ? <StarSolid key={s} className="w-3 h-3 text-orange-400" />
                                                    : <StarIcon key={s} className="w-3 h-3 text-gray-300" />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-400">({reviews})</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline space-x-1.5 pt-0.5">
                                        <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2)}</span>
                                        {product.available && (
                                            <span className="text-[10px] text-green-600 font-medium">In Stock</span>
                                        )}
                                    </div>

                                    {product.category && (
                                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{product.category}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm">
                        ← Previous
                    </button>
                    <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setPage(i)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === i ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                                    }`}>{i + 1}</button>
                        ))}
                    </div>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm">
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
