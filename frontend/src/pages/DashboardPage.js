import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, createTrip } from '../services/api';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: '', destination: '', startDate: '', endDate: '' });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data } = await getTrips();
        setTrips(data);
      } catch (err) {
        setError('Falha ao carregar viagens.');
      }
    };
    fetchTrips();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (new Date(newTrip.endDate) < new Date(newTrip.startDate)) {
        setError("A data de fim não pode ser anterior à data de início.");
        return;
    }
    setError('');
    try {
        const { data: createdTrip } = await createTrip(newTrip);
        setTrips([...trips, createdTrip]);
        setShowForm(false);
        setNewTrip({ title: '', destination: '', startDate: '', endDate: '' });
    } catch (err) {
        setError('Falha ao criar viagem. Verifique os dados.');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Minhas Viagens</h1>
        <div className="button-group">
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                {showForm ? 'Cancelar' : '＋ Criar Nova Viagem'}
            </button>
            <button onClick={handleLogout} className="btn-secondary">Sair</button>
        </div>
      </div>
      
      {}
      {showForm && (
        <div className="form-container">
            <form onSubmit={handleCreateTrip}>
                <h3>Planeje sua próxima aventura</h3>
                {error && <p className="error-message">{error}</p>}
                <input type="text" placeholder="Título (ex: Férias em Paris)" value={newTrip.title} onChange={e => setNewTrip({...newTrip, title: e.target.value})} required />
                <input type="text" placeholder="Destino (ex: Paris, França)" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} required />
                <label>Data de Início:</label>
                <input type="date" value={newTrip.startDate} onChange={e => setNewTrip({...newTrip, startDate: e.target.value})} required />
                <label>Data de Fim:</label>
                <input type="date" value={newTrip.endDate} onChange={e => setNewTrip({...newTrip, endDate: e.target.value})} required />
                <button type="submit">Salvar Viagem</button>
            </form>
        </div>
      )}

      {/* Grade de cartões de viagem */}
      <div className="trip-grid">
        {trips.length > 0 ? (
          trips.map(trip => (
            <Link to={`/trips/${trip.id}`} key={trip.id} className="trip-card">
              <div className="trip-card-image">
                {}
                <span className="trip-card-destination">{trip.destination}</span>
              </div>
              <div className="trip-card-content">
                <h3>{trip.title}</h3>
                <p>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
              </div>
            </Link>
          ))
        ) : (
          !showForm && <p>Você ainda não tem nenhuma viagem. Que tal criar uma?</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;