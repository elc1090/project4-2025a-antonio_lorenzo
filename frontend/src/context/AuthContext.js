import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar, verifica se tem token e busca perfil
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Define o token para requisições (depende do seu api.js)
          // Exemplo: api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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

  // Aqui você recebe token e dados do usuário
  const login = ({ token, user }) => {
    if (token) {
      localStorage.setItem('token', token);
      // Também configure seu cliente API para usar o token nas chamadas
    }
    setUser(user);
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

export const useAuth = () => useContext(AuthContext);
