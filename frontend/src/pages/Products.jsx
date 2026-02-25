import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { PlusIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [size] = useState(10);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', category: '' });
    const [search, setSearch] = useState('');

    useEffect(() => { fetchProducts(); }, [page]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?page=${page}&size=${size}`);
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
            toast.success('Product created!');
            fetchProducts();
            setIsModalOpen(false);
            setFormData({ name: '', price: '', stock: '', category: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this product?")) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const getStockBadge = (stock) => {
        if (stock === 0) return 'badge badge-danger';
        if (stock <= 10) return 'badge badge-warning';
        return 'badge badge-success';
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 shimmer" />
                    <div className="h-10 w-36 shimmer" />
                </div>
                <div className="glass-card-solid overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-surface-800/50">
                            <div className="h-4 w-40 shimmer" />
                            <div className="h-4 w-24 shimmer" />
                            <div className="h-4 w-16 shimmer" />
                            <div className="h-4 w-16 shimmer" />
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
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-sm text-surface-400 mt-1">{totalElements} products in inventory</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-surface-800/50 border border-surface-700/30 rounded-xl px-4 py-3 space-x-3 focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
                <MagnifyingGlassIcon className="w-5 h-5 text-surface-500 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none w-full"
                />
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
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                                        <ArchiveBoxIcon className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm">No products found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product, index) => (
                                <tr key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                                <ArchiveBoxIcon className="w-4 h-4 text-brand-400" />
                                            </div>
                                            <span className="font-medium text-surface-200">{product.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{product.category || 'Uncategorized'}</span>
                                    </td>
                                    <td className="text-surface-200 font-medium">${product.price.toFixed(2)}</td>
                                    <td>
                                        <span className={getStockBadge(product.stock)}>{product.stock} units</span>
                                    </td>
                                    <td className="text-right">
                                        <button onClick={() => handleDelete(product.id)} className="btn-danger">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary disabled:opacity-30">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary disabled:opacity-30">Next</button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-700/30">
                            <h2 className="text-lg font-bold text-white">Add New Product</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-200 p-1 hover:bg-surface-700/50 rounded-lg transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Product Name</label>
                                <input required placeholder="e.g. Wireless Mouse" className="input-dark" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
                                <input required placeholder="e.g. Electronics" className="input-dark" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Price ($)</label>
                                    <input type="number" step="0.01" required placeholder="29.99" className="input-dark" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Stock</label>
                                    <input type="number" required placeholder="100" className="input-dark" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-700/30">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Create Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
