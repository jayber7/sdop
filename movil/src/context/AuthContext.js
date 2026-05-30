import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem('@sdop_user');
      const token = await AsyncStorage.getItem('@sdop_token');
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, usuario } = res.data.data;
    await AsyncStorage.setItem('@sdop_token', token);
    await AsyncStorage.setItem('@sdop_user', JSON.stringify(usuario));
    setUser(usuario);
    return usuario;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['@sdop_token', '@sdop_user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
