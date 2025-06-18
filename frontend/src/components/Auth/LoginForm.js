// src/components/Auth/LoginForm.js

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        </div>
        <div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <hr />
      <p>Ou</p>
      <button onClick={handleGoogleLogin}>
        Login com Google
      </button>
    </div>
  );
}

export default LoginForm;