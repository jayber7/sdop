import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://sdop.onrender.com/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@sdop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('@sdop_token');
      AsyncStorage.removeItem('@sdop_user');
    }
    return Promise.reject(error);
  }
);

export default api;
