import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editStock, setEditStock] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => { fetchData(); }, [page, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, lowStockRes] = await Promise.all([
                api.get(`/products?page=${page}&size=20`),
                api.get('/products/low-stock?threshold=10'),
            ]);

            const prodData = productsRes.data.data ? productsRes.data.data : productsRes.data;
            const lowData = lowStockRes.data.data ? lowStockRes.data.data : lowStockRes.data;

            setProducts(prodData.content || []);
            setTotalPages(prodData.totalPages || 1);
            setTotalElements(prodData.totalElements || 0);
            setLowStock(Array.isArray(lowData) ? lowData : []);
        } catch (err) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleStockUpdate = async (productId) => {
        try {
            const product = products.find(p => p.id === productId) || lowStock.find(p => p.id === productId);
            if (!product) return;
            await api.put(`/products/${productId}`, {
                ...product,
                stock: parseInt(editStock),
            });
            toast.success('Stock updated');
            setEditingId(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to update stock');
        }
    };

    const getDisplayProducts = () => {
        let items;
        switch (activeTab) {
            case 'low': items = lowStock.filter(p => p.stock > 0); break;
            case 'out': items = (activeTab === 'out' ? products.concat(lowStock) : products).filter(p => p.stock === 0); break;
            default: items = products;
        }
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        }
        return items;
    };

    const displayProducts = getDisplayProducts();

    // Summary stats
    const lowStockCount = lowStock.filter(p => p.stock > 0).length;
    const outOfStockCount = lowStock.filter(p => p.stock === 0).length;

    const getStockStyle = (stock) => {
        if (stock === 0) return 'text-red-400 bg-red-500/10';
        if (stock <= 10) return 'text-amber-400 bg-amber-500/10';
        return 'text-emerald-400 bg-emerald-500/10';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 shimmer" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="glass-card-solid p-6 h-24 shimmer" />)}
                </div>
                <div className="glass-card-solid overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-surface-800/50">
                            <div className="h-4 w-40 shimmer" /><div className="h-4 w-24 shimmer" /><div className="h-4 w-16 shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Inventory</h1>
                <p className="text-sm text-surface-400 mt-1">Monitor stock levels and manage inventory</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card-solid p-5 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-surface-400 uppercase tracking-wider">Total SKUs</p>
                            <p className="text-2xl font-bold text-white mt-1">{totalElements}</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center">
                            <ArchiveBoxIcon className="w-5 h-5 text-brand-400" />
                        </div>
                    </div>
                </div>
                <div className="glass-card-solid p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-surface-400 uppercase tracking-wider">Low Stock</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">{lowStockCount}</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                </div>
                <div className="glass-card-solid p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-surface-400 uppercase tracking-wider">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{outOfStockCount}</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center">
                            <XCircleIcon className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter tabs + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex bg-surface-800/50 p-1 rounded-xl border border-surface-700/30">
                    {[
                        { key: 'all', label: 'All Products' },
                        { key: 'low', label: `Low Stock (${lowStockCount})` },
                        { key: 'out', label: `Out of Stock (${outOfStockCount})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                                : 'text-surface-400 hover:text-surface-200'
                                }`}
                            onClick={() => { setActiveTab(tab.key); setPage(0); }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 flex items-center bg-surface-800/50 border border-surface-700/30 rounded-xl px-4 py-2.5 space-x-3 focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
                    <MagnifyingGlassIcon className="w-5 h-5 text-surface-500 flex-shrink-0" />
                    <input
                        placeholder="Search inventory..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card-solid overflow-hidden">
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                                        <ArchiveBoxIcon className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm">No products found</p>
                                        <p className="text-xs text-surface-600 mt-1">
                                            {activeTab !== 'all' ? 'Switch tab to see all products' : 'Add products to get started'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayProducts.map((product, index) => (
                                <tr key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                                <ArchiveBoxIcon className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <div>
                                                <span className="font-medium text-surface-200">{product.name}</span>
                                                {product.sku && <p className="text-xs text-surface-500">SKU: {product.sku}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-info">{product.category || 'Uncategorized'}</span></td>
                                    <td className="text-surface-200 font-medium">${product.price?.toFixed(2)}</td>
                                    <td>
                                        {editingId === product.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={editStock}
                                                    onChange={(e) => setEditStock(e.target.value)}
                                                    className="input-dark w-20 !py-1.5 text-sm"
                                                    autoFocus
                                                />
                                                <button onClick={() => handleStockUpdate(product.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-surface-500 hover:text-surface-300 p-1">
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStockStyle(product.stock)}`}>
                                                {product.stock} units
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right">
                                        <button
                                            onClick={() => { setEditingId(product.id); setEditStock(product.stock?.toString()); }}
                                            className="text-surface-400 hover:text-brand-400 p-1.5 hover:bg-brand-500/10 rounded-lg transition-all"
                                            title="Edit stock"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && activeTab === 'all' && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary disabled:opacity-30">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary disabled:opacity-30">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
