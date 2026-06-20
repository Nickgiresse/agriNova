// Ce fichier centralise tous les types utilisés dans le frontend
// TypeScript utilise ces types pour vérifier le code à la compilation

// Type d'un utilisateur retourné par l'API
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  region?: string; // optionnel
}

// Type de la réponse du login et register
export interface AuthResponse {
  token: string; // le token JWT
  user: User;    // les infos de l'utilisateur
}

// Type d'une culture agricole
export interface Culture {
  id: string;
  nom: string;
  statut: string;
  datePlantation: string;
  surface: number;
  userId: string;
  createdAt: string;
}

// Type du formulaire de login
export interface LoginForm {
  email: string;
  password: string;
}

// Type du formulaire d'inscription
export interface RegisterForm {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  region?: string;
}