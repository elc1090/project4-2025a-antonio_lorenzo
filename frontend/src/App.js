// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importação das páginas e componentes
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import TripDetailPage from './pages/TripDetailPage'; 

// Importação do CSS
import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      {/* A tag <nav> agora usa a classe 'navbar' do App.css */}
      <nav className="navbar">
        {/* O logo usa a classe 'nav-logo' para destaque */}
        <Link to="/" className="nav-logo">
          TripPlanner
        </Link>
        
        {/* Agrupamos os links para facilitar o alinhamento */}
        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Minhas Viagens</NavLink>
              {/* O link de sair pode ser estilizado como um botão se desejado */}
              <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} style={{ cursor: 'pointer' }}>
                Sair
              </a>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Registrar</NavLink>
            </>
          )}
        </div>
      </nav>

      {/* O container principal usa a classe 'container' para centralizar o conteúdo */}
      <div className="container">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Rotas Protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;