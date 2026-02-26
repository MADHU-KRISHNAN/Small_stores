import api from './axiosConfig';

export const getDashboardStats = () =>
    api.get('/dashboard/stats');

export const getMonthlySales = () =>
    api.get('/dashboard/sales/monthly');

export const getTopProducts = (limit = 5) =>
    api.get('/dashboard/products/top', { params: { limit } });
