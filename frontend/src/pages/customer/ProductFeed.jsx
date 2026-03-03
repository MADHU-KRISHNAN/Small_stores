import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { MagnifyingGlassIcon, FunnelIcon, CubeIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
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

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [search, category, sortBy, sortDir, page]);

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

    const addToCart = async (productId) => {
        try {
            await api.post('/customer/cart/items', { productId, quantity: 1 });
            toast.success('Added to cart!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const addToWishlist = async (productId) => {
        try {
            await api.post(`/customer/wishlist/${productId}`);
            toast.success('Added to wishlist!');
        } catch (err) {
            if (err.response?.status === 500 || err.response?.data?.message?.includes('already')) {
                toast.error('Already in wishlist');
            } else {
                toast.error('Failed to add to wishlist');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-accent-500/10 border border-brand-500/20 p-8">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Discover Products
                    </h1>
                    <p className="text-surface-300 text-lg">
                        Browse <span className="text-brand-400 font-semibold">{totalElements}</span> products from local stores
                    </p>
                </div>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="input-field w-full pl-10"
                            placeholder="Search products..."
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                        className="input-field min-w-[160px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={`${sortBy}-${sortDir}`}
                        onChange={(e) => {
                            const [s, d] = e.target.value.split('-');
                            setSortBy(s); setSortDir(d); setPage(0);
                        }}
                        className="input-field min-w-[150px]"
                    >
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="price-asc">Price Low-High</option>
                        <option value="price-desc">Price High-Low</option>
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="glass-card p-4 animate-pulse">
                            <div className="w-full h-40 bg-surface-700 rounded-lg mb-3" />
                            <div className="h-4 bg-surface-700 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-surface-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <CubeIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                    <h3 className="text-xl text-surface-300 font-medium">No products found</h3>
                    <p className="text-surface-500 mt-1">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="glass-card group hover:border-brand-500/30 transition-all duration-300 overflow-hidden">
                            {/* Product visual */}
                            <div className="relative h-44 bg-gradient-to-br from-surface-800 to-surface-700 flex items-center justify-center">
                                <CubeIcon className="w-16 h-16 text-surface-500 group-hover:text-brand-400 transition-colors" />
                                {/* Stock badge */}
                                <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${product.available
                                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                                    }`}>
                                    {product.available ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {/* Quick actions */}
                                <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => addToWishlist(product.id)}
                                        className="w-8 h-8 rounded-lg bg-surface-800/80 backdrop-blur flex items-center justify-center text-surface-300 hover:text-red-400 hover:bg-surface-700 transition-all"
                                        title="Add to Wishlist"
                                    >
                                        <HeartIcon className="w-4 h-4" />
                                    </button>
                                    {product.available && (
                                        <button
                                            onClick={() => addToCart(product.id)}
                                            className="w-8 h-8 rounded-lg bg-brand-500/80 backdrop-blur flex items-center justify-center text-white hover:bg-brand-500 transition-all"
                                            title="Add to Cart"
                                        >
                                            <ShoppingCartIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Product info */}
                            <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${product.id}`} className="text-white font-medium text-sm hover:text-brand-400 transition-colors line-clamp-1">
                                            {product.name}
                                        </Link>
                                        <p className="text-surface-400 text-xs mt-0.5">{product.storeName}</p>
                                    </div>
                                    <span className="text-brand-400 font-bold text-lg ml-2 flex-shrink-0">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                </div>
                                {product.category && (
                                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-surface-700 text-surface-300">
                                        {product.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-surface-400 text-sm">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
