import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout(); // Limpa o estado e o localStorage
    navigate('/');
  };

  return (
    <div>
      <h1>Minhas Viagens</h1>
      {/* Exibe o nome do usuário que veio do contexto */}
      {user && <p>Olá, {user.name}!</p>}
      <p>Em breve, a lista de suas viagens aparecerá aqui!</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default DashboardPage;