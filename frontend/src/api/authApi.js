import api from './axiosConfig';

export const login = (username, password) =>
    api.post('/auth/login', { username, password });

export const register = (data) =>
    api.post('/auth/register', data);
