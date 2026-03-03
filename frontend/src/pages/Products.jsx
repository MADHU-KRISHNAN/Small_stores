import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { PlusIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, ArchiveBoxIcon, TagIcon, CubeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import useDebounce from '../hooks/useDebounce';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [size, setSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: '' });
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { fetchProducts(); }, [page, size, debouncedSearch]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, size };
            if (debouncedSearch) params.search = debouncedSearch;
            const res = await api.get('/products', { params });
            const responseData = res.data.data ? res.data.data : res.data;
            setProducts(responseData.content || []);
            setTotalPages(responseData.totalPages || 1);
            setTotalElements(responseData.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10)
            });
            toast.success('Product added to catalog!');
            fetchProducts();
            setIsModalOpen(false);
            setFormData({ name: '', price: '', stock: '', category: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product');
        }
    };

    const handleDeleteClick = (product) => {
        setDeleteTarget(product);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/products/${deleteTarget.id}`);
            toast.success('Product removed from catalog');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
        setDeleteTarget(null);
    };

    const getStockBadge = (stock) => {
        if (stock === 0) return 'badge badge-danger';
        if (stock <= 10) return 'badge badge-warning';
        return 'badge badge-success';
    };

    const getStockLabel = (stock) => {
        if (stock === 0) return 'Out of stock';
        if (stock <= 10) return `${stock} left · Low`;
        return `${stock} in stock`;
    };

    // Color palette for product cards
    const cardColors = [
        'from-brand-500/10 to-brand-600/5 ring-brand-500/20',
        'from-blue-500/10 to-blue-600/5 ring-blue-500/20',
        'from-accent-500/10 to-accent-600/5 ring-accent-500/20',
        'from-emerald-500/10 to-emerald-600/5 ring-emerald-500/20',
        'from-pink-500/10 to-pink-600/5 ring-pink-500/20',
    ];

    const iconColors = ['text-brand-400', 'text-blue-400', 'text-accent-400', 'text-emerald-400', 'text-pink-400'];

    if (loading && products.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 shimmer" />
                    <div className="h-10 w-36 shimmer" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card-solid p-6 space-y-3">
                            <div className="h-12 w-12 shimmer rounded-xl" />
                            <div className="h-4 w-32 shimmer" />
                            <div className="h-4 w-20 shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
                    <p className="text-sm text-surface-400 mt-1">{totalElements} products in your store</p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* View toggle */}
                    <div className="flex bg-surface-800/50 p-1 rounded-xl border border-surface-700/30">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'text-surface-400 hover:text-surface-200'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'table' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'text-surface-400 hover:text-surface-200'}`}
                        >
                            List
                        </button>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center bg-surface-800/50 border border-surface-700/30 rounded-xl px-4 py-3 space-x-3 focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
                <MagnifyingGlassIcon className="w-5 h-5 text-surface-500 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none w-full"
                />
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-surface-500">
                            <CubeIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm font-medium">No products found</p>
                            <p className="text-xs text-surface-600 mt-1">
                                {search ? 'Try a different search term' : 'Add your first product to get started'}
                            </p>
                        </div>
                    ) : (
                        products.map((product, index) => (
                            <div
                                key={product.id}
                                className="glass-card-solid p-5 hover:border-brand-500/20 transition-all duration-300 group animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cardColors[index % cardColors.length]} ring-1 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <CubeIcon className={`w-6 h-6 ${iconColors[index % iconColors.length]}`} />
                                    </div>
                                    <button onClick={() => handleDeleteClick(product)} className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-sm font-semibold text-white mb-1 truncate">{product.name}</h3>
                                <span className="badge badge-info text-[10px] mb-3">{product.category || 'Uncategorized'}</span>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-700/30">
                                    <p className="text-lg font-bold text-white">${product.price?.toFixed(2)}</p>
                                    <span className={getStockBadge(product.stock)}>{getStockLabel(product.stock)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Table View */
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
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                                            <ArchiveBoxIcon className="w-12 h-12 mb-3 opacity-30" />
                                            <p className="text-sm">No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                                    <CubeIcon className="w-4 h-4 text-brand-400" />
                                                </div>
                                                <span className="font-medium text-surface-200">{product.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-info">{product.category || 'Uncategorized'}</span>
                                        </td>
                                        <td className="text-surface-200 font-medium">${product.price?.toFixed(2)}</td>
                                        <td>
                                            <span className={getStockBadge(product.stock)}>{getStockLabel(product.stock)}</span>
                                        </td>
                                        <td className="text-right">
                                            <button onClick={() => handleDeleteClick(product)} className="btn-danger">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    size={size}
                    onPageChange={setPage}
                    onSizeChange={(s) => { setSize(s); setPage(0); }}
                />
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-700/30">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                                    <CubeIcon className="w-5 h-5 text-brand-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Add to Catalog</h2>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-200 p-1 hover:bg-surface-700/50 rounded-lg transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Product Name</label>
                                <input required placeholder="e.g. Organic Coffee Beans" className="input-dark" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
                                <input required placeholder="e.g. Beverages" className="input-dark" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Price ($)</label>
                                    <input type="number" step="0.01" required placeholder="12.99" className="input-dark" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Initial Stock</label>
                                    <input type="number" required placeholder="100" className="input-dark" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-700/30">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Add to Catalog</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Remove from Catalog"
                message={`Are you sure you want to remove "${deleteTarget?.name}" from your catalog? This action cannot be undone.`}
                confirmText="Remove"
                danger
            />
        </div>
    );
}
