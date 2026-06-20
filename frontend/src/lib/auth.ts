import api from './axios';
import { AuthResponse, LoginForm, RegisterForm } from '../types';

// Fonction de connexion
// Envoie email + password au backend et stocke le token
export async function login(data: LoginForm): Promise<AuthResponse> {
  // Appelle POST /auth/login sur le backend NestJS
  const response = await api.post<AuthResponse>('/auth/login', data);

  // Stocke le token JWT dans localStorage
  // pour que l'intercepteur axios l'utilise automatiquement
  localStorage.setItem('token', response.data.token);

  // Stocke les infos utilisateur pour les afficher dans l'UI
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

// Fonction d'inscription
// Crée un compte et connecte directement l'utilisateur
export async function register(data: RegisterForm): Promise<AuthResponse> {
  // Appelle POST /auth/register sur le backend NestJS
  const response = await api.post<AuthResponse>('/auth/register', data);

  // Même logique que login — on stocke token et user
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
}

// Fonction de déconnexion
// Supprime le token et redirige vers login
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Vérifie si l'utilisateur est connecté
// Retourne true si un token existe dans localStorage
export function estConnecte(): boolean {
  if (typeof window === 'undefined') return false; // SSR guard
  return !!localStorage.getItem('token');
}

// Récupère l'utilisateur connecté depuis localStorage
export function getUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}