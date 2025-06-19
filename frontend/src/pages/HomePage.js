import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();

  // URL de imagem PERMANENTE para o visitante (colagem de viagens)
  const loggedOutImage = `${process.env.PUBLIC_URL}/images/hero-background.png`;
  
  // URL de imagem PERMANENTE para o usuário logado (planejamento)
  const loggedInImage = `${process.env.PUBLIC_URL}/images/user-background.png`;

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${user ? loggedInImage : loggedOutImage})`,
  };

  return (
    <div className="homepage">
      {}
      <header className="hero-section" style={heroStyle}>
        <div className="hero-content">
          {user ? (
            // Conteúdo para usuário LOGADO
            <>
              <h1 className="hero-title">Bem-vindo de volta, {user.name}!</h1>
              <p className="hero-subtitle">Sua próxima aventura te espera. O que vamos planejar hoje?</p>
              <Link to="/dashboard" className="hero-button">Ver Minhas Viagens</Link>
            </>
          ) : (
            // Conteúdo para usuário DESLOGADO
            <>
              <h1 className="hero-title">Sua Jornada Começa Aqui</h1>
              <p className="hero-subtitle">Planeje viagens inesquecíveis com a ajuda de inteligência artificial. Crie roteiros, descubra lugares e organize cada detalhe com facilidade.</p>
              <Link to="/register" className="hero-button">Comece a Planejar Gratuitamente</Link>
            </>
          )}
        </div>
      </header>

      {/* Seção de Funcionalidades */}
      <section className="features-section">
        <h2 className="section-title">Tudo que você precisa para a viagem perfeita</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✈️</span>
            <h3>Organize Suas Viagens</h3>
            <p>Mantenha todas as suas viagens, futuras e passadas, em um só lugar. Nunca perca um detalhe importante.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💡</span>
            <h3>Recomendações com IA</h3>
            <p>Não sabe para onde ir? Diga seus interesses e nossa IA recomendará os melhores destinos e atividades para você.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🗺️</span>
            <h3>Roteiros Inteligentes</h3>
            <p>Selecione os lugares que quer visitar e deixe que nossa IA crie o melhor roteiro, otimizando seu tempo e explorando ao máximo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;