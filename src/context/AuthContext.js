import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para atualizar o token nas requisições
  const setAuthToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);

    } else {
      localStorage.removeItem('token');

    }
  }, []);

  // Carrega o usuário ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setAuthToken(token);
          const { data } = await getProfile();
          setUser(data);
        }
      } catch (error) {
        console.error("Falha ao carregar perfil", error);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [setAuthToken]);

  const login = useCallback(async ({ token, user }) => {
    setAuthToken(token);
    setUser(user);
    navigate('/dashboard', { replace: true }); // Redireciona sem precisar de F5
  }, [navigate, setAuthToken]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate, setAuthToken]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);