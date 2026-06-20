import axios from 'axios';

// On crée une instance axios configurée
// pour toujours pointer vers notre backend NestJS
// Toutes les requêtes utiliseront cette instance
const api = axios.create({
  // L'URL de base du backend — définie dans .env.local
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête
// Avant chaque requête, on vérifie si un token JWT existe
// et on l'ajoute automatiquement dans le header Authorization
api.interceptors.request.use((config) => {
  // localStorage stocke le token après le login
  const token = localStorage.getItem('token');

  if (token) {
    // Ajoute le token dans le header de chaque requête
    // Le backend NestJS lit ce header pour authentifier l'utilisateur
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Intercepteur de réponse
// Si le backend retourne 401 (token expiré ou invalide)
// on déconnecte l'utilisateur automatiquement
api.interceptors.response.use(
  // Si la réponse est OK, on la retourne telle quelle
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // Supprime le token invalide du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirige vers la page de login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;