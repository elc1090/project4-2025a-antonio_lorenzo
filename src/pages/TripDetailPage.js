import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, deleteTrip, searchPlaces, getRecommendations, getItinerary, saveItinerary } from '../services/api';
import { toast } from 'react-toastify'
import MapWithMarkers from '../components/MapWithMarkers';


const LoadingSpinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p style={{ marginTop: '1rem', fontWeight: '500' }}>Gerando com IA, aguarde...</p>
  </div>
);

function TripDetailPage() {
  const [trip, setTrip] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  const getErrorMessage = (err) => {
    let message = err.response?.data?.error || err.response?.data?.message || 'Ocorreu um erro desconhecido.';
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    return message;
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const { data } = await getTripById(id);
        setTrip(data);
        if (data.itinerary) {
          setItinerary(data.itinerary);
        }
      } catch (err) {
        setError(`Viagem não encontrada: ${getErrorMessage(err)}`);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

const handleDelete = async () => {
  // Cria um toast com botões de confirmação
  const confirmToast = toast(
    <div>
      <p>Tem certeza que deseja deletar esta viagem?</p>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={async () => {
            try {
              await deleteTrip(id);
              toast.dismiss(confirmToast); // Fecha o toast de confirmação
              toast.warn('Viagem deletada!');
              navigate('/dashboard');
            } catch (err) {
              setError(`Falha ao deletar viagem: ${getErrorMessage(err)}`);
            }
          }}
        >
          Sim
        </button>
        <button onClick={() => toast.dismiss(confirmToast)}>Cancelar</button>
      </div>
    </div>,
    { autoClose: false, closeButton: false } // Evita fechar automaticamente
  );
};

  const handlePlaceSelection = (place) => {
    setSelectedPlaces(prevSelected => {
      const isSelected = prevSelected.some(p => p.nome === place.nome);
      if (isSelected) {
        return prevSelected.filter(p => p.nome !== place.nome);
      } else {
        if (prevSelected.length < 4) {
          return [...prevSelected, place];
        } else {
          toast.warn('Você pode selecionar no máximo 4 lugares para gerar o roteiro.');
          return prevSelected;
        }
      }
    });
  };

  const handleSearchPlaces = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warn('Por favor, digite o que deseja buscar.');
      return;
    }
    setIsAiLoading(true);
    setError('');
    setPlaces([]);
    try {
      const { data } = await searchPlaces(searchQuery, trip.destination);
      setPlaces(data);
    } catch (err) {
      setError(`Erro ao buscar lugares: ${getErrorMessage(err)}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    if (!interests.trim()) {
      toast.warn("Por favor, digite seus interesses para receber sugestões.");
      return;
    }
    setIsAiLoading(true);
    setError('');
    setRecommendations(null);
    try {
      const { data } = await getRecommendations(interests, trip.destination);
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(`Erro ao buscar recomendações: ${getErrorMessage(err)}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    if (selectedPlaces.length > 4 || selectedPlaces.length === 0) {
      setError("Para gerar o roteiro, selecione de 1 a 4 lugares.");
      return;
    }

    setIsAiLoading(true);
    setError('');
    setSuccess('');
    setItinerary(null);
    const placeNames = selectedPlaces.map(p => p.nome).join(', ');

    try {
      const { data } = await getItinerary(placeNames, 8);
      console.log("Resposta da API para o roteiro:", data);

      let locaisArray = null;
      let nomeRoteiro = "Roteiro Personalizado";

      // 1. Lógica final para encontrar o array de locais, agora incluindo inglês
      if (Array.isArray(data.locais)) locaisArray = data.locais;
      else if (Array.isArray(data.locations)) locaisArray = data.locations;
      else if (Array.isArray(data.itinerary)) locaisArray = data.itinerary; // <<< ADICIONADO
      else if (Array.isArray(data.itinerario)) locaisArray = data.itinerario;
      else if (Array.isArray(data.roteiro)) locaisArray = data.roteiro;
      else if (Array.isArray(data.visit_plan)) locaisArray = data.visit_plan;
      else if (Array.isArray(data.visita)) locaisArray = data.visita;
      else if (Array.isArray(data)) locaisArray = data;

      // 2. Lógica para encontrar o nome do roteiro
      if (data && typeof data === 'object' && !Array.isArray(data)) {
          nomeRoteiro = data.title || data.nome || data.museum || data.itinerary_name || nomeRoteiro;
      }

      // 3. Verifica se o array de locais foi encontrado e não está vazio
      if (locaisArray && locaisArray.length > 0) {
        // 4. Normaliza os dados de cada local, incluindo a nova chave de transporte
        const locaisNormalizados = locaisArray
          .map(item => {
            if (!item || typeof item !== 'object') return null;
            return {
              nome: item.local || item.nome || item.name || item.lugar || item.location,
              tempo: item.tempo || item.duration || item.time || 'N/A',
              dicas: item.dicas || item.tips || [],
              travel: item.transporte_proximo || item.next_transport || item.transport || (item.next_location ? `Próximo: ${item.next_location}`: '') // <<< ADICIONADO 'transport'
            };
          })
          .filter(item => item && item.nome);

        // 5. Verifica se, após a filtragem, ainda existem locais válidos
        if (locaisNormalizados.length > 0) {
          const roteiroFinal = {
            nome: nomeRoteiro,
            locais: locaisNormalizados,
          };
          setItinerary(roteiroFinal);
        } else {
          setError("A IA retornou sugestões em um formato que não pôde ser lido. Tente novamente.");
          console.error("Itens do roteiro não puderam ser normalizados:", locaisArray);
        }
      } else {
        setError("A IA não conseguiu gerar um roteiro com os locais selecionados. Por favor, tente outras opções.");
        console.error("Formato do roteiro não reconhecido ou vazio:", data);
      }

    } catch (err) {
      console.error("Erro detalhado ao gerar roteiro:", err);
      setError(`Falha ao gerar roteiro: ${getErrorMessage(err)}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveItinerary = () => {
    // 1. Verifica se existe um roteiro para ser salvo
    if (!itinerary) {
      toast.warn('Nenhum roteiro para salvar!');
      return;
    }

    try {
      // 2. Cria um nome de arquivo dinâmico e seguro
      const fileName = `roteiro-${itinerary.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;

      const jsonString = JSON.stringify(itinerary, null, 2);

      const blob = new Blob([jsonString], { type: 'application/json' });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName; 

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      
      setSuccess('Seu roteiro está sendo baixado!');
      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      console.error("Erro ao gerar arquivo para download:", err);
      setError('Ocorreu um erro ao tentar gerar o arquivo do roteiro.');
    }
  };

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!trip) return <h2>Viagem não encontrada.</h2>;

  return (
    <div className="trip-detail-container">
      <div className="trip-detail-header">
        <h1>{trip.title}</h1>
        <p><strong>Destino:</strong> {trip.destination}</p>
        <p><strong>Período:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
        <button onClick={handleDelete} className="btn-danger">Deletar Viagem</button>
      </div>

      <h2>Planejamento da Viagem</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {/* Seção de Busca e Seleção */}
      <div className="planning-section">
        <h3>1. Busque e Selecione os Lugares</h3>
        <form onSubmit={handleSearchPlaces} className="search-form">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Ex: restaurantes, museus..." 
          />
          <button type="submit">Buscar</button>
        </form>

        {isAiLoading && places.length === 0 && <LoadingSpinner />}

        <div className="places-grid">
          {places.map(place => (
            <div 
              key={place.nome} 
              className={`place-card ${selectedPlaces.some(p => p.nome === place.nome) ? 'selected' : ''}`}
              onClick={() => handlePlaceSelection(place)}
            >
              <h4>{place.nome}</h4>
              <p>{place.endereco}</p>
              {place.dicas && (
                <div className="place-tips">
                  <strong>Dicas:</strong>
                  <ul>{place.dicas.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                </div>
              )}
              <div className="selection-badge">
                {selectedPlaces.some(p => p.nome === place.nome) ? '✓ Selecionado' : 'Clique para selecionar'}
              </div>
            </div>
          ))}
        </div>

        {places.length > 0 && places.every(p => p.lat && p.lng) && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Visualização no Mapa</h3>
          <MapWithMarkers places={places} />
        </div>
        )}

        {selectedPlaces.length > 0 && (
          <div className="selected-summary">
            <h4>Lugares selecionados ({selectedPlaces.length}/4):</h4>
            <ul>
              {selectedPlaces.map(place => (
                <li key={place.nome}>{place.nome}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Seção de Geração de Roteiro */}
      <div className="planning-section">
        <h3>2. Gere seu Roteiro com IA</h3>
        <button 
          onClick={handleGenerateItinerary} 
          disabled={selectedPlaces.length === 0}
          className="generate-btn"
        >
          Gerar Roteiro
        </button>
      </div>

      {/* Seção de Recomendações */}
      <div className="planning-section">
        <h3>3. Recomendações Extras com IA</h3>
        <form onSubmit={handleGetRecommendations} className="recommendation-form">
          <input 
            type="text" 
            value={interests}
            onChange={e => setInterests(e.target.value)}
            placeholder="Ex: arte, comida, natureza" 
          />
          <button type="submit">Obter Recomendações</button>
        </form>

        {isAiLoading && recommendations === null && <LoadingSpinner />}

        {recommendations && (
          <div className="recommendations-container">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <h4>{rec.type}</h4>
                <p><strong>Motivo:</strong> {rec.reason}</p>
                <p><strong>Sugestões:</strong> {rec.examples.join(', ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção do Roteiro Gerado */}
      {isAiLoading && itinerary === null && <LoadingSpinner />}

    {itinerary && (
      <div className="planning-section itinerary-section">
        <div className="itinerary-header">
          <h3>{itinerary.nome || "Seu Roteiro"}</h3>
          <button onClick={handleSaveItinerary} className="save-btn">
            Salvar Roteiro
          </button>
        </div>

        {Array.isArray(itinerary.locais) ? (
          <div className="timeline">
            {itinerary.locais.map((step, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>
                      <span className="step-number">{index + 1}.</span> {step.nome}
                    </h4>
                    {step.tempo && (
                      <span className="time-badge">
                        <i className="fas fa-clock"></i> {step.tempo}
                      </span>
                    )}
                  </div>
                  
                  {step.dicas && (
                    <div className="step-tips">
                      <h5>Dicas úteis:</h5>
                      {Array.isArray(step.dicas) ? (
                        <ul>
                          {step.dicas.map((tip, i) => (
                            <li key={i}>
                              <i className="fas fa-lightbulb"></i> {tip}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{step.dicas}</p>
                      )}
                    </div>
                  )}

                  {step.travel && (
                    <div className="travel-instruction">
                      <div className="travel-icon">
                        <i className="fas fa-walking"></i>
                      </div>
                      <div className="travel-text">
                        {step.travel}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="itinerary-fallback">
            <pre>{JSON.stringify(itinerary, null, 2)}</pre>
          </div>
        )}
      </div>
    )}
    </div>
  );
}

export default TripDetailPage;