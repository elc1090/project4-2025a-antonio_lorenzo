// src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Use a variável de ambiente ou sua URL do Render
  baseURL: process.env.REACT_APP_API_URL || 'https://project4-2025a-antonio-lorenzo.onrender.com',
});

// Adiciona o token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Funções de Autenticação (já devem existir)
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');

// --- NOVAS FUNÇÕES ---

// Funções de Viagens (Trips)
export const getTrips = () => api.get('/trips');
export const getTripById = (id) => api.get(`/trips/${id}`);
export const createTrip = (tripData) => api.post('/trips', tripData);
export const updateTrip = (id, tripData) => api.put(`/trips/${id}`, tripData);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// Funções de Lugares (Places/IA)
// Adicionamos o parâmetro 'tips' na busca de lugares
export const searchPlaces = (query, near) => api.get(`/places/search?query=${query}&near=${near}&getTips=true`);
export const getRecommendations = (interests, near) => api.get(`/places/recommendations?interests=${interests}&near=${near}`);
export const getItinerary = (places, timeAvailable) => api.get(`/places/itinerary?places=${places}&timeAvailable=${timeAvailable}`);

export default api;