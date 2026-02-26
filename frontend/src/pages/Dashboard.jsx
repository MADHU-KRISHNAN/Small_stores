import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    ArchiveBoxIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card px-4 py-3 text-sm">
                <p className="text-surface-400 text-xs mb-1">{label}</p>
                <p className="text-white font-semibold">${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card px-4 py-3 text-sm">
                <p className="text-surface-300 text-xs mb-1">{label}</p>
                <p className="text-white font-semibold">${payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalRevenue: 0, newOrders: 0, totalCustomers: 0, totalProducts: 0, lowStockCount: 0, pendingOrders: 0 });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, salesRes, topRes, lowStockRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/sales/monthly'),
                    api.get('/dashboard/products/top?limit=5'),
                    api.get('/products/low-stock?threshold=10'),
                ]);

                const statsData = statsRes.data.data ? statsRes.data.data : statsRes.data;
                const salesChartData = salesRes.data.data ? salesRes.data.data : salesRes.data;
                const topData = topRes.data.data ? topRes.data.data : topRes.data;
                const lowData = lowStockRes.data.data ? lowStockRes.data.data : lowStockRes.data;

                setStats({
                    totalRevenue: statsData.totalRevenue || 0,
                    newOrders: statsData.newOrders || 0,
                    totalCustomers: statsData.totalCustomers || 0,
                    totalProducts: statsData.totalProducts || 0,
                    lowStockCount: statsData.lowStockCount || 0,
                    pendingOrders: statsData.pendingOrders || 0,
                });

                const rawSales = Array.isArray(salesChartData) ? salesChartData : (salesChartData.data || []);
                setSalesData(rawSales.map(item => ({
                    ...item,
                    revenue: parseFloat(item.revenue)
                })));

                setTopProducts(Array.isArray(topData) ? topData : []);
                setLowStockItems(Array.isArray(lowData) ? lowData.slice(0, 5) : []);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const statCards = [
        {
            name: 'Total Revenue',
            value: `$${Number(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: CurrencyDollarIcon,
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-400',
            trend: '+12.5%',
            trendUp: true,
        },
        {
            name: 'Total Orders',
            value: stats.newOrders,
            icon: ShoppingBagIcon,
            iconBg: 'bg-blue-500/15',
            iconColor: 'text-blue-400',
            trend: '+8.2%',
            trendUp: true,
        },
        {
            name: 'Customers',
            value: stats.totalCustomers,
            icon: UsersIcon,
            iconBg: 'bg-brand-500/15',
            iconColor: 'text-brand-400',
            trend: '+3.1%',
            trendUp: true,
        },
        {
            name: 'Products',
            value: stats.totalProducts,
            icon: ArchiveBoxIcon,
            iconBg: 'bg-amber-500/15',
            iconColor: 'text-amber-400',
            trend: '0%',
            trendUp: false,
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 shimmer" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card-solid p-6 space-y-3">
                            <div className="h-4 w-24 shimmer" />
                            <div className="h-8 w-32 shimmer" />
                        </div>
                    ))}
                </div>
                <div className="glass-card-solid p-6 h-80 shimmer" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {getGreeting()}, <span className="gradient-text">{user?.username}</span> 👋
                    </h1>
                    <p className="text-surface-400 mt-1 text-sm">Here's what's happening with your store today.</p>
                </div>
                {(stats.pendingOrders > 0 || stats.lowStockCount > 0) && (
                    <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                        {stats.pendingOrders > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <ClockIcon className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-medium text-amber-400">{stats.pendingOrders} pending</span>
                            </div>
                        )}
                        {stats.lowStockCount > 0 && (
                            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                                <span className="text-xs font-medium text-red-400">{stats.lowStockCount} low stock</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.name}
                            className="glass-card-solid p-6 hover:border-surface-600/50 transition-all duration-300 group animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                                <div className={`flex items-center space-x-1 text-xs font-semibold ${stat.trendUp ? 'text-emerald-400' : 'text-surface-500'}`}>
                                    {stat.trendUp ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                    <span>{stat.trend}</span>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-surface-400 mt-1">{stat.name}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 glass-card-solid p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
                                <p className="text-xs text-surface-400">Monthly revenue performance</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(71, 85, 105, 0.3)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenuePremium)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6, fill: '#a78bfa', stroke: '#1e293b', strokeWidth: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-surface-500">
                                <ArchiveBoxIcon className="w-16 h-16 mb-3 opacity-30" />
                                <p className="text-sm">No sales data available yet</p>
                                <p className="text-xs text-surface-600 mt-1">Start creating orders to see your revenue chart</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="glass-card-solid p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <ArchiveBoxIcon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Top Products</h2>
                            <p className="text-xs text-surface-400">By revenue</p>
                        </div>
                    </div>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((product, idx) => {
                                const maxRevenue = topProducts[0]?.totalRevenue || 1;
                                const percentage = (product.totalRevenue / maxRevenue) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm text-surface-300 truncate pr-2">{product.productName}</span>
                                            <span className="text-xs font-semibold text-surface-400">${Number(product.totalRevenue).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-surface-500">
                            <ArchiveBoxIcon className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-xs">No sales data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="glass-card-solid p-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
                                <p className="text-xs text-surface-400">Products running low</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {lowStockItems.map(product => (
                            <div key={product.id} className="bg-surface-800/50 border border-surface-700/30 rounded-xl p-4 flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${product.stock === 0 ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
                                    <span className={`text-xs font-bold ${product.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>{product.stock}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-surface-200 font-medium truncate">{product.name}</p>
                                    <p className="text-xs text-surface-500">{product.stock === 0 ? 'Out of stock' : 'Low stock'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
