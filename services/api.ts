//Configura Axios: baseURL, headers, etc.
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL para backend local desde un emulador Android
const BASE_URL = 'http://10.0.2.2:8080/api/auth'; // ajustar si cambia

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//se manda como headear el token guardado cada vez que se haga un get de rutas.
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default api;
