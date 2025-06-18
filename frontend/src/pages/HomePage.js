import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
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