//Configura Axios: baseURL, headers, etc.
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:8080/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token excepto en login o register
api.interceptors.request.use(
    async (config) => {
        if (config.url?.includes('/login') || config.url?.includes('/register')) {
            return config;
        }

        const token = await AsyncStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;


