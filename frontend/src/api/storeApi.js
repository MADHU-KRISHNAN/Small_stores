import api from './axiosConfig';

export const getStoreDetails = () =>
    api.get('/store');

export const updateStore = (data) =>
    api.put('/store', data);
