import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import { toast } from 'react-toastify';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores
    try {
      await registerUser({ name, email, password });
      toast.warn('Usuário registrado com sucesso!');
      navigate('/login'); // Redireciona para a página de login após o sucesso.
    } catch (err) {
      // Exibe a mensagem de erro que vem do backend, se houver.
      setError(err.response?.data?.message || 'Ocorreu um erro ao registrar.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Conta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
      </div>
      <div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
      </div>
      <div>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
      </div>
      <button type="submit">Registrar</button>
    </form>
  );
}

export default RegisterForm;