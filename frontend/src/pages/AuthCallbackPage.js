import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extrai o token dos parâmetros da URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Salva o token no localStorage
      localStorage.setItem('token', token);
      // Redireciona para o dashboard
      navigate('/dashboard');
    } else {
      // Se não houver token, redireciona para a página de login com uma mensagem de erro
      navigate('/login?error=auth_failed');
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Autenticando...</p>
    </div>
  );
}

export default AuthCallbackPage;