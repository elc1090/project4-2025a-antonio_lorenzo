// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../services/api'; // Supondo que você tenha uma função para buscar o perfil

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Busca os dados do usuário usando o token
          const { data } = await getProfile();
          setUser(data);
        } catch (error) {
          console.error("Sessão inválida, limpando token.", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};