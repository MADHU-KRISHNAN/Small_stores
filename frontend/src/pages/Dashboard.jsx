import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    TagIcon,
    TruckIcon,
    ChartBarIcon,
    FireIcon,
    BoltIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const QuickStat = ({ icon: Icon, label, value, color, delay = 0 }) => (
    <div
        className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-surface-800/60 border border-surface-700/30 animate-fade-in"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5" />
        </div>
        <div>
            <p className="text-[10px] text-surface-500 uppercase tracking-wider leading-none">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
        </div>
    </div>
);

const STATUS_DOTS = {
    PENDING: 'bg-amber-400',
    CONFIRMED: 'bg-blue-400',
    SHIPPED: 'bg-purple-400',
    DELIVERED: 'bg-emerald-400',
    COMPLETED: 'bg-emerald-400',
    CANCELLED: 'bg-red-400',
};

const STATUS_BG = {
    PENDING: 'bg-amber-500/10 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 text-blue-400',
    SHIPPED: 'bg-purple-500/10 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400',
    CANCELLED: 'bg-red-500/10 text-red-400',
};

const PIE_COLORS = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#0f766e'];

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalRevenue: 0, newOrders: 0, totalCustomers: 0, totalProducts: 0, lowStockCount: 0, pendingOrders: 0 });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, salesRes, topRes, lowStockRes, ordersRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/sales/monthly'),
                    api.get('/dashboard/products/top?limit=5'),
                    api.get('/products/low-stock?threshold=10'),
                    api.get('/orders?page=0&size=5'),
                ]);

                const statsData = statsRes.data.data ? statsRes.data.data : statsRes.data;
                const salesChartData = salesRes.data.data ? salesRes.data.data : salesRes.data;
                const topData = topRes.data.data ? topRes.data.data : topRes.data;
                const lowData = lowStockRes.data.data ? lowStockRes.data.data : lowStockRes.data;
                const ordersData = ordersRes.data.data ? ordersRes.data.data : ordersRes.data;

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
                setRecentOrders((ordersData.content || []).slice(0, 5));
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

    const avgOrderValue = stats.newOrders > 0 ? (stats.totalRevenue / stats.newOrders) : 0;

    const pieData = topProducts.slice(0, 5).map(p => ({
        name: p.productName,
        value: parseFloat(p.totalRevenue) || 0
    }));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-72 shimmer" />
                        <div className="h-4 w-48 shimmer" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card-solid p-6 space-y-3">
                            <div className="h-4 w-24 shimmer" />
                            <div className="h-8 w-32 shimmer" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card-solid p-6 h-80 shimmer" />
                    <div className="glass-card-solid p-6 h-80 shimmer" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ===== HERO WELCOME BANNER ===== */}
            <div className="relative overflow-hidden glass-card-solid p-6 lg:p-8">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-accent-500/8 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-brand-400 uppercase tracking-wider">Store Active</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white">
                            {getGreeting()}, <span className="gradient-text">{user?.username}</span> 👋
                        </h1>
                        <p className="text-surface-400 mt-1.5 text-sm max-w-lg">
                            Here's your store performance at a glance. Track sales, manage orders, and grow your business.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {stats.pendingOrders > 0 && (
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
                            >
                                <ClockIcon className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-400">{stats.pendingOrders} Pending Orders</span>
                            </button>
                        )}
                        {stats.lowStockCount > 0 && (
                            <button
                                onClick={() => navigate('/inventory')}
                                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
                            >
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                                <span className="text-xs font-semibold text-red-400">{stats.lowStockCount} Low Stock</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== KEY METRICS ROW ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card-solid p-6 hover:border-brand-500/20 transition-all duration-300 group animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-brand-500/20">
                            <CurrencyDollarIcon className="w-6 h-6 text-brand-400" />
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3" />
                            <span>12.5%</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">${Number(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-surface-400 mt-1">Total Revenue</p>
                </div>

                <div className="glass-card-solid p-6 hover:border-blue-500/20 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-blue-500/20">
                            <ShoppingBagIcon className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3" />
                            <span>8.2%</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.newOrders}</p>
                    <p className="text-xs text-surface-400 mt-1">Total Orders</p>
                </div>

                <div className="glass-card-solid p-6 hover:border-accent-500/20 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-accent-500/20">
                            <UsersIcon className="w-6 h-6 text-accent-400" />
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-accent-400 bg-accent-500/10 px-2 py-1 rounded-lg">
                            <ArrowUpIcon className="w-3 h-3" />
                            <span>3.1%</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
                    <p className="text-xs text-surface-400 mt-1">Customers</p>
                </div>

                <div className="glass-card-solid p-6 hover:border-brand-500/20 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ring-1 ring-brand-500/20">
                            <TagIcon className="w-6 h-6 text-brand-400" />
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-surface-500 bg-surface-700/50 px-2 py-1 rounded-lg">
                            <span>AOV</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">${avgOrderValue.toFixed(2)}</p>
                    <p className="text-xs text-surface-400 mt-1">Avg. Order Value</p>
                </div>
            </div>

            {/* ===== QUICK STATS BAR ===== */}
            <div className="flex flex-wrap gap-3">
                <QuickStat icon={ArchiveBoxIcon} label="Catalog" value={`${stats.totalProducts} SKUs`} color="bg-brand-500/15 text-brand-400" delay={0} />
                <QuickStat icon={TruckIcon} label="Fulfillment" value={`${stats.pendingOrders} to ship`} color="bg-amber-500/15 text-amber-400" delay={50} />
                <QuickStat icon={ExclamationTriangleIcon} label="Restock" value={`${stats.lowStockCount} items`} color="bg-red-500/15 text-red-400" delay={100} />
                <QuickStat icon={BoltIcon} label="Conversion" value={stats.totalCustomers > 0 ? `${((stats.newOrders / stats.totalCustomers) * 100).toFixed(0)}%` : '0%'} color="bg-emerald-500/15 text-emerald-400" delay={150} />
            </div>

            {/* ===== CHARTS ROW ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card-solid overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between p-6 pb-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 flex items-center justify-center ring-1 ring-brand-500/20">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Sales Performance</h2>
                                <p className="text-xs text-surface-500">Monthly revenue trend</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-surface-500">
                            <ChartBarIcon className="w-4 h-4" />
                            <span>{salesData.length} months</span>
                        </div>
                    </div>

                    <div className="h-72 w-full p-6 pt-4">
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenueTeal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                                            <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(71, 85, 105, 0.2)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(20, 184, 166, 0.2)', strokeWidth: 1 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenueTeal)" dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#1e293b', strokeWidth: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-surface-500">
                                <ShoppingBagIcon className="w-16 h-16 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No sales data yet</p>
                                <p className="text-xs text-surface-600 mt-1">Create orders to see your revenue chart</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Best Sellers */}
                <div className="glass-card-solid overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="p-6 pb-0">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center ring-1 ring-accent-500/20">
                                <FireIcon className="w-5 h-5 text-accent-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Best Sellers</h2>
                                <p className="text-xs text-surface-500">Top performing products</p>
                            </div>
                        </div>
                    </div>

                    {topProducts.length > 0 ? (
                        <div className="px-6 pb-6">
                            {pieData.length > 0 && (
                                <div className="flex justify-center mb-4">
                                    <div className="w-32 h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value" stroke="none">
                                                    {pieData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-3">
                                {topProducts.map((product, idx) => {
                                    const maxRevenue = topProducts[0]?.totalRevenue || 1;
                                    const percentage = (product.totalRevenue / maxRevenue) * 100;
                                    return (
                                        <div key={idx} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center space-x-2.5">
                                                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${PIE_COLORS[idx % PIE_COLORS.length]}20`, color: PIE_COLORS[idx % PIE_COLORS.length] }}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm text-surface-300 truncate max-w-[130px]">{product.productName}</span>
                                                </div>
                                                <span className="text-xs font-bold text-surface-200">${Number(product.totalRevenue).toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden ml-8">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${percentage}%`, backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-500 px-6">
                            <StarIcon className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs">No sales data yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== RECENT ORDERS + LOW STOCK ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="glass-card-solid overflow-hidden animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-surface-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center ring-1 ring-blue-500/20">
                                <ShoppingBagIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Recent Orders</h2>
                                <p className="text-xs text-surface-500">Latest customer orders</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/orders')} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1 transition-colors">
                            <span>View All</span>
                            <ArrowUpIcon className="w-3 h-3 rotate-90" />
                        </button>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="divide-y divide-surface-700/20">
                            {recentOrders.map((order, idx) => (
                                <div
                                    key={order.id}
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-800/30 cursor-pointer transition-colors group animate-fade-in"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center">
                                            <span className="text-xs font-bold text-brand-400">#{String(order.id).padStart(3, '0')}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">
                                                {order.customerName || 'Walk-in Customer'}
                                            </p>
                                            <p className="text-xs text-surface-500">
                                                {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                {order.orderItems && ` · ${order.orderItems.length} item${order.orderItems.length !== 1 ? 's' : ''}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${STATUS_BG[order.status] || 'bg-surface-700/50 text-surface-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[order.status] || 'bg-surface-500'}`} />
                                            <span>{order.status}</span>
                                        </span>
                                        <span className="text-sm font-bold text-white">${order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                            <ShoppingBagIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">No orders yet</p>
                            <p className="text-xs text-surface-600 mt-1">Orders will appear here once created</p>
                        </div>
                    )}
                </div>

                {/* Restock Alerts */}
                <div className="glass-card-solid overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                    <div className="flex items-center justify-between p-6 pb-4 border-b border-surface-700/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center ring-1 ring-red-500/20">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Restock Alerts</h2>
                                <p className="text-xs text-surface-500">{lowStockItems.length} products need attention</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/inventory')} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1 transition-colors">
                            <span>Manage</span>
                            <ArrowUpIcon className="w-3 h-3 rotate-90" />
                        </button>
                    </div>

                    {lowStockItems.length > 0 ? (
                        <div className="divide-y divide-surface-700/20">
                            {lowStockItems.map((product, idx) => {
                                const isOut = product.stock === 0;
                                return (
                                    <div key={product.id} className="flex items-center justify-between px-6 py-4 animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOut ? 'bg-red-500/10 ring-1 ring-red-500/20' : 'bg-amber-500/10 ring-1 ring-amber-500/20'}`}>
                                                <ArchiveBoxIcon className={`w-5 h-5 ${isOut ? 'text-red-400' : 'text-amber-400'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-surface-200">{product.name}</p>
                                                <p className="text-xs text-surface-500">{product.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isOut ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                            {isOut ? 'OUT OF STOCK' : `${product.stock} left`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                            <ArchiveBoxIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">All products stocked</p>
                            <p className="text-xs text-surface-600 mt-1">No restock alerts at this time</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
