import axios from "axios";

const TOKEN_KEY = 'quote-admin-token';

export const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000
});

export const setAuthToken = (token: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
};

const savedToken = sessionStorage.getItem(TOKEN_KEY);
if (savedToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}
