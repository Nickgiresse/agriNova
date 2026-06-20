'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();

  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');

    try {
      // Appel API NestJS sur localhost:3001
      const response = await axios.post('http://localhost:3001/auth/login', {
        email,
        password,
      });

      // Stocke le token et l'utilisateur dans localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirige vers le tableau de bord
      router.push('/dashboard');
    } catch (err: any) {
      // Affiche le message d'erreur retourné par l'API
      setErreur(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left Column (40%): Visual Side */}
      <section className="hidden lg:flex lg:w-[40%] relative flex-col justify-between p-12 bg-primary overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-fixed rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-container rounded-full blur-3xl"></div>
        </div>
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-secondary-fixed">
              energy_savings_leaf
            </span>
            <h1 className="text-white font-h1 text-h1 tracking-tighter">AgriNova</h1>
          </div>
        </div>
        <div className="relative z-10">
          <img
            alt="Agricultural Illustration"
            className="w-full h-80 object-cover rounded-xl shadow-2xl mb-8"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUW7qv-nsf22cQBCBxy2dqAB_ym5dSRCrs89O6qMfUa3g2HvOUp3lCpQ6JQaiSRihq_2HniucZOjAxYo6kf6lEAQXWQ_OJDt3QYhX0edWhNRYjO_UifQ4s4TAhgdlqsosg0e_Iv9hSR7cOp_EOTOFjxxJXvQactuhzc3MFN4nwYCFq7CxZb0p2smPjU5xIuXalOVnxIa1N2_MUrVzUSxa3_3tSiSM136ih19seVWzueEH97P3LVhn5NLMrYraruOdvw8K9oqCuy3g"
          />
          <h2 className="text-white font-h1 text-h1 mb-4">
            Cultivez l'avenir, <br />
            récoltez le succès.
          </h2>
          <p className="text-secondary-fixed text-body-md font-body-md max-w-sm">
            L'intelligence agricole au service des exploitations camerounaises pour une productivité durable et connectée.
          </p>
        </div>
        <div className="relative z-10 flex gap-2">
          <div className="w-12 h-1 bg-secondary-fixed rounded-full"></div>
          <div className="w-4 h-1 bg-white/30 rounded-full"></div>
          <div className="w-4 h-1 bg-white/30 rounded-full"></div>
        </div>
      </section>

      {/* Right Column (60%): Login Form */}
      <section className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-on-surface font-h1 text-h1 mb-2">Bon retour 👋</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">
              Heureux de vous revoir ! Connectez-vous à votre espace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label
                className="block text-on-surface font-label-caps text-label-caps uppercase tracking-wider"
                htmlFor="email"
              >
                Email Professionnel
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant transition-all outline-none"
                  id="email"
                  name="email"
                  placeholder="agriculteur@bafoussam.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="block text-on-surface font-label-caps text-label-caps uppercase tracking-wider"
                  htmlFor="password"
                >
                  Mot de passe
                </label>
                <a className="text-secondary font-body-sm text-body-sm hover:underline" href="#">
                  Mot de passe oublié?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-12 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-outline-variant transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                id="remember"
                type="checkbox"
              />
              <label
                className="ml-2 block text-on-surface-variant font-body-sm text-body-sm"
                htmlFor="remember"
              >
                Se souvenir de moi
              </label>
            </div>

            {/* Primary Action */}
            <button
              className="w-full bg-primary-container text-on-primary font-bold py-3.5 rounded-lg shadow-md hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              type="submit"
              disabled={chargement}
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-label-caps uppercase">
                <span className="bg-white px-4 text-outline font-semibold">ou</span>
              </div>
            </div>

            {/* OAuth Button */}
            <button
              className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant text-on-surface-variant font-semibold py-3 rounded-lg hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              Continuer avec Google
            </button>
          </form>

          {/* Message d'erreur */}
          {erreur && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-error rounded-lg text-sm text-center font-medium animate-pulse">
              {erreur}
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-on-surface-variant font-body-md text-body-md">
              Pas encore inscrit ?
              <Link className="text-primary font-bold hover:underline ml-1" href="/register">
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Footer Support */}
          <div className="mt-12 pt-6 border-t border-surface-container flex justify-between items-center opacity-60">
            <span className="text-label-caps font-label-caps text-outline">
              © 2024 AGRINOVA
            </span>
            <div className="flex gap-4">
              <a
                className="text-label-caps font-label-caps text-outline hover:text-primary transition-colors"
                href="#"
              >
                Aide
              </a>
              <a
                className="text-label-caps font-label-caps text-outline hover:text-primary transition-colors"
                href="#"
              >
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}