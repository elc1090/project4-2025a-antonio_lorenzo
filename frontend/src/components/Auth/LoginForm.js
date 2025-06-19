// src/components/Auth/LoginForm.js

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, getProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Redireciona para a página que o usuário tentou acessar ou para o dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.token);
      
      // Busca os dados do usuário e atualiza o contexto
      const profileRes = await getProfile();
      login(profileRes.data);

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao fazer login.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/auth/google` : 'https://project4-2025a-antonio-lorenzo.onrender.com/auth/google';
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
      
      <button type="submit">Entrar</button>

      {/* Botão de Login com Google melhorado */}
      <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" />
        Continuar com o Google
      </button>

      <p className="form-footer-text">
        Não tem uma conta? <Link to="/register">Crie uma aqui</Link>
      </p>
    </form>
  );
}

export default LoginForm;