import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // A rota de login espera 'email' e 'password'.
      const { data } = await loginUser({ email, password });
            
      // Salva o token recebido no localStorage para ser usado em futuras requisições.
      localStorage.setItem('token', data.token);

      navigate('/dashboard'); // Redireciona para o painel principal do usuário.
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao fazer login.');
    }
  };

  // Função para lidar com o login do Google
  const handleGoogleLogin = () => {
    // Redireciona o usuário para a rota de autenticação do Google no backend
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
      {/* Novo botão de login com o Google */}
      <button onClick={handleGoogleLogin}>
        Login com Google
      </button>
    </div>
  );
}

export default LoginForm;