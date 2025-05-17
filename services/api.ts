//Configura Axios: baseURL, headers, etc.
import axios from 'axios';

// Base URL para backend local desde un emulador Android
const BASE_URL = 'http://10.0.2.2:3001/api/auth'; // ajustar si cambia

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ejemplo: agregar un interceptor si para JWT en el futuro
/*
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
*/

export default api;
