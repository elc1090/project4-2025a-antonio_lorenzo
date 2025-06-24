import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripById, deleteTrip, searchPlaces, getRecommendations, getItinerary } from '../services/api';
import { toast } from 'react-toastify';
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
    const confirmToast = toast(
      <div>
        <p>Tem certeza que deseja deletar esta viagem?</p>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={async () => {
              try {
                await deleteTrip(id);
                toast.dismiss(confirmToast);
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
      { autoClose: false, closeButton: false }
    );
  };

  const handlePlaceSelection = (place) => {
    setSelectedPlaces(prevSelected => {
      const isSelected = prevSelected.some(p => p.placeId === place.placeId);
      if (isSelected) {
        return prevSelected.filter(p => p.placeId !== place.placeId);
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
      const { data } = await searchPlaces(searchQuery, trip.destination, true);
      
      const placesWithPhotos = data.map(place => ({
        ...place,
        photoUrl: place.photo 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photo}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
          : null,
        imagem: place.photo 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photo}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
          : null
      }));
      
      setPlaces(placesWithPhotos);
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
    setItinerary(null);
    const placeNames = selectedPlaces.map(p => p.nome).join(', ');

    try {
      const { data } = await getItinerary(placeNames, 8, '');
      
      // Normalização da resposta
      let itineraryData = data.itinerary || data;
      
      if (!Array.isArray(itineraryData)) {
        itineraryData = Object.values(itineraryData).find(val => Array.isArray(val)) || [];
      }

      const normalizedItinerary = {
        nome: data.title || "Roteiro Personalizado",
        locais: itineraryData.map((item, index) => ({
          nome: item.place || item.nome || item.name || `Local ${index + 1}`,
          tempo: item.duration || item.tempo || item.time || '1-2 horas',
          dicas: item.tips || item.dicas || [],
          travel: item.transport || item.travel || 'Táxi ou transporte público'
        }))
      };

      setItinerary(normalizedItinerary);
    } catch (err) {
      console.error("Erro detalhado ao gerar roteiro:", err);
      setError(`Falha ao gerar roteiro: ${getErrorMessage(err)}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveItinerary = () => {
    if (!itinerary) {
      toast.warn('Nenhum roteiro para salvar!');
      return;
    }

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
    
    toast.success('Roteiro baixado com sucesso!');
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
              key={place.placeId || place.nome} 
              className={`place-card ${selectedPlaces.some(p => p.placeId === place.placeId) ? 'selected' : ''}`}
              onClick={() => handlePlaceSelection(place)}
            >
              {place.photoUrl && (
                <div className="place-image-container">
                  <img
                    src={place.photoUrl}
                    alt={place.nome}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="place-info">
                <h4>{place.nome}</h4>
                <p>{place.endereco}</p>
                {place.rating && <p><strong>Avaliação:</strong> {place.rating}/5</p>}
                {place.dicas && (
                  <div className="place-tips">
                    <strong>Dicas:</strong>
                    <ul>{place.dicas.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                  </div>
                )}
              </div>
              <div className="selection-badge">
                {selectedPlaces.some(p => p.placeId === place.placeId) ? '✓ Selecionado' : 'Clique para selecionar'}
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
                <li key={place.placeId}>{place.nome}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

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

      {isAiLoading && itinerary === null && <LoadingSpinner />}

      {itinerary && (
        <div className="planning-section itinerary-section">
          <div className="itinerary-header">
            <h3>{itinerary.nome || "Seu Roteiro"}</h3>
            <button onClick={handleSaveItinerary} className="save-btn">
              Salvar Roteiro
            </button>
          </div>

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
                  
                  {step.dicas && step.dicas.length > 0 && (
                    <div className="step-tips">
                      <h5>Dicas úteis:</h5>
                      <ul>
                        {step.dicas.map((tip, i) => (
                          <li key={i}>
                            <i className="fas fa-lightbulb"></i> {tip}
                          </li>
                        ))}
                      </ul>
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
        </div>
      )}
    </div>
  );
}

export default TripDetailPage;