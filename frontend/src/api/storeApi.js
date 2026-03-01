import axios from './axiosConfig';

/**
 * Fetches the complete store profile including stats.
 * Maps to: GET /api/store/profile
 */
export const getStoreProfile = () => axios.get('/store/profile');

/**
 * Updates editable store fields.
 * Maps to: PUT /api/store/profile
 * @param {Object} data - { storeName, ownerName, phone, address }
 */
export const updateStoreProfile = (data) => axios.put('/store/profile', data);

/**
 * Changes the account password.
 * Maps to: PATCH /api/store/password
 * @param {Object} data - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = (data) => axios.patch('/store/password', data);

// Legacy endpoints (kept for backward compatibility)
export const getStoreDetails = () => axios.get('/store');
export const updateStore = (data) => axios.put('/store', data);
