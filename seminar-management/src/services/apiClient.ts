import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        // Inject Auth Tokens securely here if using bearer token strategy
        // const token = getCookie('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            const isLoginEndpoint = error.config?.url?.includes('/auth/login');
            if (isLoginEndpoint) {
                toast.error('Invalid username or password.');
            } else if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                toast.error('Session expired. Please log in again.');
                window.location.href = '/login';
            }
        } else if (status >= 500) {
            toast.error('A server error occurred. Please try again later.');
        } else if (status === 400 || status === 404 || status === 422) {
            toast.error(error.response?.data?.message || 'An error occurred.');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
