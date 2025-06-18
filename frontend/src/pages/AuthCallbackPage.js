// src/pages/AuthCallbackPage.js

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        localStorage.setItem('token', token);
        try {
            // Atualiza o contexto com os dados do usuário
            const profileRes = await getProfile();
            login(profileRes.data);
            navigate('/dashboard');
        } catch {
            navigate('/login?error=profile_failed');
        }
      } else {
        navigate('/login?error=auth_failed');
      }
    };

    handleAuth();
  }, [location, navigate, login]);

  return <div>Autenticando...</div>;
}

export default AuthCallbackPage;