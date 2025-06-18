// src/pages/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importe o hook useAuth

function HomePage() {
  const { user } = useAuth(); // 2. Pegue o usuário do contexto

  // 3. Verifique se o usuário existe (está logado)
  if (user) {
    // Se estiver logado, mostre uma mensagem de boas-vindas personalizada
    return (
      <div>
        <h2>Bem-vindo de volta, {user.name}!</h2>
        <p>Pronto para planejar sua próxima aventura?</p>
        <p>
          <Link to="/dashboard">Ver minhas viagens</Link>
        </p>
      </div>
    );
  }

  // Se não estiver logado, mostre a mensagem original para novos visitantes
  return (
    <div>
      <h2>Bem-vindo ao Trip Planner</h2>
      <p>Organize suas viagens de forma simples e eficiente.</p>
      <p>
        Faça seu <Link to="/login">login</Link> ou{' '}
        <Link to="/register">crie uma conta</Link>.
      </p>
    </div>
  );
}

export default HomePage;