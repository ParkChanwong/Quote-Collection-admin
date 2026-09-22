import { queryClient } from './queryClient';
import axios from "axios";

const TOKEN_KEY = 'quote-admin-token';

export const getAuthToken = () => sessionStorage.getItem(TOKEN_KEY);

export const api = axios.create({
    baseURL: 'https://quote-collection-odpj.onrender.com',
    timeout: 10000
});

export const setAuthToken = (token: string) => {
    queryClient.clear();
    sessionStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    queryClient.clear();
    sessionStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
};

const savedToken = getAuthToken();
if (savedToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}
