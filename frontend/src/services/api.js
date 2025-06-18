import axios from 'axios';

// O backend está rodando na porta 3000.
const api = axios.create({
  baseURL: 'https://project4-2025a-antonio-lorenzo.onrender.com',
});

// requisição que o frontend fizer para o backend.
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* == Funções de Autenticação == */
// Corresponde à rota POST /auth/register
export const registerUser = (userData) => api.post('/auth/register', userData);

// Corresponde à rota POST /auth/login
export const loginUser = (credentials) => api.post('/auth/login', credentials);

// Corresponde à rota GET /auth/profile
export const getProfile = () => api.get('/auth/profile');


/* == Funções de Viagens (Trips) == */
// O restante das funções para gerenciar as viagens será adicionado aqui depois.

export default api;