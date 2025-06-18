import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage'; 
import './App.css'; 

// Componente simples para a página inicial
function HomePage() {
  return (
      <div>
          <h2>Bem-vindo ao Trip Planner</h2>
          <p>Organize suas viagens de forma simples e eficiente.</p>
          <p>Faça seu <Link to="/login">login</Link> ou <Link to="/register">crie uma conta</Link>.</p>
      </div>
  );
}

// Página "Dashboard" para onde o usuário irá após o login
function DashboardPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove o token
        navigate('/'); // Volta para a home
    };

    return (
        <div>
            <h1>Minhas Viagens</h1>
            <p>Em breve, a lista de suas viagens aparecerá aqui!</p>
            <button onClick={handleLogout}>Sair</button>
        </div>
    );
}

// Componente principal da aplicação com as rotas
function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/register">Registrar</Link>
      </nav>
      <hr />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Nova rota para o callback da autenticação */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;