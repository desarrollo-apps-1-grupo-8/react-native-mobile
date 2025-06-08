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

        try {
            const token = await SecureStore.getItemAsync('session');
            if (!token) {
                return config;
            }

            // Asegurarse de que el token tenga el formato correcto
            const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            
            if (config.headers) {
                config.headers.Authorization = formattedToken;
            }
            
            return config;
        } catch (error) {
            console.error('Error al obtener el token:', error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

export default api;


