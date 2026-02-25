import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { parseLoginResponse } from '../utils/authUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const response = await api.post('/auth/signin', { username, password });
        // Assuming ApiResponse structure returns the payload inside "data"
        const apiResponsePayload = response.data.data ? response.data.data : response.data;

        const strictUserData = parseLoginResponse(apiResponsePayload);

        localStorage.setItem('token', strictUserData.token);
        localStorage.setItem('user', JSON.stringify(strictUserData));
        setUser(strictUserData);
        return strictUserData;
    };

    const register = async (data) => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
