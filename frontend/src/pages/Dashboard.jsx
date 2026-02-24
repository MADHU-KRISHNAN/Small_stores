import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({ sales: 0, orders: 0, products: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, productsRes, customersRes] = await Promise.all([
                    api.get('/orders'),
                    api.get('/products'),
                    api.get('/customers')
                ]);

                const totalSales = ordersRes.data.reduce((sum, order) => sum + order.totalAmount, 0);

                setStats({
                    sales: totalSales,
                    orders: ordersRes.data.length,
                    products: productsRes.data.length,
                    customers: customersRes.data.length
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { name: 'Total Sales', value: `$${stats.sales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Total Products', value: stats.products, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { name: 'Total Customers', value: stats.customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
