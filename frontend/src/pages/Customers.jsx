import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { PlusIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, UsersIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [size] = useState(10);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCustomers(); }, [page]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/customers?page=${page}&size=${size}`);
            const responseData = res.data.data ? res.data.data : res.data;
            setCustomers(responseData.content || []);
            setTotalPages(responseData.totalPages || 1);
            setTotalElements(responseData.totalElements || 0);
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            toast.success('Customer added!');
            fetchCustomers();
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', email: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add customer');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this customer?")) {
            try {
                await api.delete(`/customers/${id}`);
                toast.success('Customer deleted');
                fetchCustomers();
            } catch (error) {
                toast.error('Failed to delete customer');
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const avatarColors = [
        'from-brand-500 to-brand-700',
        'from-emerald-500 to-emerald-700',
        'from-blue-500 to-blue-700',
        'from-amber-500 to-amber-700',
        'from-pink-500 to-pink-700',
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-40 shimmer" />
                    <div className="h-10 w-36 shimmer" />
                </div>
                <div className="glass-card-solid overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-surface-800/50">
                            <div className="h-9 w-9 rounded-full shimmer" />
                            <div className="h-4 w-32 shimmer" />
                            <div className="h-4 w-40 shimmer" />
                            <div className="h-4 w-28 shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customers</h1>
                    <p className="text-sm text-surface-400 mt-1">{totalElements} total customers</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Customer</span>
                </button>
            </div>

            <div className="flex items-center bg-surface-800/50 border border-surface-700/30 rounded-xl px-4 py-3 space-x-3 focus-within:ring-2 focus-within:ring-brand-500/30 transition-all">
                <MagnifyingGlassIcon className="w-5 h-5 text-surface-500 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none w-full"
                />
            </div>

            <div className="glass-card-solid overflow-hidden">
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                                        <UsersIcon className="w-12 h-12 mb-3 opacity-30" />
                                        <p className="text-sm">No customers found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer, index) => (
                                <tr key={customer.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                {getInitials(customer.name)}
                                            </div>
                                            <span className="font-medium text-surface-200">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2 text-surface-400">
                                            <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{customer.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center space-x-2 text-surface-400">
                                            <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <button onClick={() => handleDelete(customer.id)} className="btn-danger">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex space-x-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary disabled:opacity-30">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary disabled:opacity-30">Next</button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-surface-700/30">
                            <h2 className="text-lg font-bold text-white">Add New Customer</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-surface-400 hover:text-surface-200 p-1 hover:bg-surface-700/50 rounded-lg transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
                                <input required placeholder="John Doe" className="input-dark" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                                <input type="email" required placeholder="john@example.com" className="input-dark" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone</label>
                                <input required placeholder="+1 (555) 123-4567" className="input-dark" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-surface-700/30">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Add Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
