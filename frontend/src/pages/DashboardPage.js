import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, createTrip } from '../services/api'; // Precisaremos adicionar createTrip em api.js
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
        const { data } = await getTrips(); // Função que chama GET /trips
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
      try {
          const { data: createdTrip } = await createTrip(newTrip);
          setTrips([...trips, createdTrip]); // Adiciona a nova viagem à lista
          setShowForm(false); // Esconde o formulário
          setNewTrip({ title: '', destination: '', startDate: '', endDate: '' }); // Limpa o formulário
      } catch (err) {
          setError('Falha ao criar viagem. Verifique os dados.');
      }
  };

  return (
    <div>
      <h1>Minhas Viagens</h1>
      {user && <p>Olá, {user.name}!</p>}
      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Sair</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancelar' : 'Criar Nova Viagem'}
      </button>

      {showForm && (
        <form onSubmit={handleCreateTrip} style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
            <h3>Nova Viagem</h3>
            <input type="text" placeholder="Título (ex: Férias em Paris)" value={newTrip.title} onChange={e => setNewTrip({...newTrip, title: e.target.value})} required />
            <input type="text" placeholder="Destino (ex: Paris, França)" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} required />
            <input type="date" placeholder="Data de Início" value={newTrip.startDate} onChange={e => setNewTrip({...newTrip, startDate: e.target.value})} required />
            <input type="date" placeholder="Data de Fim" value={newTrip.endDate} onChange={e => setNewTrip({...newTrip, endDate: e.target.value})} required />
            <button type="submit">Salvar Viagem</button>
        </form>
      )}

      <div style={{ marginTop: '30px' }}>
        <h2>Suas Viagens Salvas:</h2>
        {trips.length > 0 ? (
          <ul>
            {trips.map(trip => (
              <li key={trip.id}>
                <Link to={`/trips/${trip.id}`}>
                  <strong>{trip.title}</strong> ({trip.destination})
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Você ainda não tem nenhuma viagem. Que tal criar uma?</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;