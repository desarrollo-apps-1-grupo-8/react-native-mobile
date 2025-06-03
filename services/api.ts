//Configura Axios: baseURL, headers, etc.
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_BASE_URL_IOS : process.env.EXPO_PUBLIC_BASE_URL_ANDROID;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }, 
});

// Interceptor to add token except for login or register
api.interceptors.request.use(
    async (config) => {
        if (config.url?.includes('/login') || config.url?.includes('/register')) {
            return config;
        }

        const token = await SecureStore.getItemAsync('session');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized responses (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await SecureStore.deleteItemAsync('session');
        }
        return Promise.reject(error);
    }
);

export default api;


