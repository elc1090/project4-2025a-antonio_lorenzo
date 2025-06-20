import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HashRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';


// Importação das páginas e componentes
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import TripDetailPage from './pages/TripDetailPage'; 

import './App.css';

function App() {
  const { user, logout } = useAuth();

  return (
  <Router>      
  <nav className="navbar">
        {}
        <Link to="/" className="nav-logo">
          TripPlanner ✈️ 
        </Link>
        
        {}
        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Minhas Viagens</NavLink>
              {}
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

      {}
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
          <ToastContainer
            position="top-right"
            autoClose={4000} // Fecha automaticamente após 4 segundos
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
      </div>
    </Router>
  );
}

export default App;
