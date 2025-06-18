import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
        <NavLink to="/" style={{ marginRight: '1rem' }}>Home</NavLink>
        {user ? (
          <>
            <NavLink to="/dashboard" style={{ marginRight: '1rem' }}>Minhas Viagens</NavLink>
            <a href="/" onClick={(e) => { e.preventDefault(); logout(); }} style={{ cursor: 'pointer' }}>
              Sair
            </a>
          </>
        ) : (
          <>
            <NavLink to="/login" style={{ marginRight: '1rem' }}>Login</NavLink>
            <NavLink to="/register">Registrar</NavLink>
          </>
        )}
      </nav>
      <hr />
      <div className="container" style={{ padding: '1rem' }}>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;