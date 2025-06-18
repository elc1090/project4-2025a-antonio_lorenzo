import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, deleteTrip, searchPlaces, getRecommendations, getItinerary } from '../services/api';

function TripDetailPage() {
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Pega o ID da viagem da URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await getTripById(id);
        setTrip(data);
      } catch (err) {
        setError('Viagem não encontrada.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar esta viagem?')) {
      try {
        await deleteTrip(id);
        alert('Viagem deletada!');
        navigate('/dashboard');
      } catch (err) {
        setError('Falha ao deletar viagem.');
      }
    }
  };

// src/pages/TripDetailPage.js

  const handleSearchPlaces = async (e) => {
      e.preventDefault();

      // --- ADICIONE ESTA VALIDAÇÃO AQUI ---
      if (!searchQuery.trim()) {
          alert('Por favor, digite o que deseja buscar.');
          return; // Para a execução da função aqui
      }
      // --- FIM DA VALIDAÇÃO ---

      try {
          const { data } = await searchPlaces(searchQuery, trip.destination);
          setPlaces(data);
          setError(''); // Limpa erros antigos se a busca for bem-sucedida
      } catch (err) {
          setError('Erro ao buscar lugares. Verifique sua busca ou tente novamente.');
      }
  };

  const handleGetRecommendations = async () => {
      const interests = prompt("Quais são seus interesses? (ex: arte, comida, natureza)");
      if (interests) {
          try {
              const { data } = await getRecommendations(interests, trip.destination);
              setRecommendations(data.recommendations);
          } catch (err) {
              setError('Erro ao buscar recomendações.');
          }
      }
  };

  const handleGenerateItinerary = async () => {
      if (places.length === 0) {
          alert("Busque e encontre alguns lugares primeiro!");
          return;
      }
      const placeNames = places.map(p => p.nome).join(', ');
      try {
          const { data } = await getItinerary(placeNames, 8); // Exemplo: 8 horas disponíveis
          setItinerary(data.itinerary || data.fallback.itinerary);
      } catch (err) {
          setError('Erro ao gerar roteiro.');
      }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!trip) return <p>Viagem não encontrada.</p>;

  return (
    <div>
      <h1>{trip.title}</h1>
      <p><strong>Destino:</strong> {trip.destination}</p>
      <p><strong>Período:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
      <button onClick={handleDelete} style={{ background: 'red', color: 'white' }}>Deletar Viagem</button>
      <hr />

      <h2>Planejamento da Viagem</h2>
      
      {/* Ferramenta de Busca */}
      <div className="planning-section">
        <h3>Buscar Lugares</h3>
        <form onSubmit={handleSearchPlaces}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Ex: restaurantes, museus..." />
            <button type="submit">Buscar</button>
        </form>
        {places.map(place => (
            <div key={place.nome} style={{border: '1px solid lightgray', margin: '5px 0', padding: '5px'}}>
                <strong>{place.nome}</strong>: {place.endereco}
                {place.dicas && <ul>{place.dicas.map((d, i) => <li key={i}>{d}</li>)}</ul>}
            </div>
        ))}
      </div>

      {/* Ferramenta de Recomendação */}
      <div className="planning-section">
        <h3>Recomendações da IA</h3>
        <button onClick={handleGetRecommendations}>Obter Recomendações</button>
        {recommendations && recommendations.map(rec => (
             <div key={rec.type} style={{border: '1px solid lightgray', margin: '5px 0', padding: '5px'}}>
                <strong>{rec.type}</strong> ({rec.reason}): {rec.examples.join(', ')}
             </div>
        ))}
      </div>

      {/* Gerador de Roteiro */}
       <div className="planning-section">
        <h3>Gerar Roteiro</h3>
        <button onClick={handleGenerateItinerary}>Gerar Roteiro com Lugares Buscados</button>
        {itinerary && itinerary.map(item => (
            <div key={item.place} style={{border: '1px solid lightgray', margin: '5px 0', padding: '5px'}}>
                <strong>{item.order}. {item.place}</strong> ({item.duration})
                <p>Dica: {item.tips}</p>
                <p>Transporte: {item.transport}</p>
            </div>
        ))}
      </div>

    </div>
  );
}

export default TripDetailPage;