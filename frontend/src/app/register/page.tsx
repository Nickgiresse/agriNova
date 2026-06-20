'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();

  // États des champs du formulaire
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

  // États techniques
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    // Validations locales
    if (password !== confirmPassword) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!terms) {
      setErreur("Veuillez accepter les Conditions Générales d'Utilisation.");
      return;
    }

    setChargement(true);

    try {
      // Appel API d'inscription sur le backend NestJS (localhost:3001)
      const response = await axios.post('http://localhost:3001/auth/register', {
        prenom,
        nom,
        email,
        region,
        password,
      });

      // Stocke le token et l'utilisateur dans localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirige vers le tableau de bord
      router.push('/dashboard');
    } catch (err: any) {
      setErreur(err.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-stretch">
      {/* Left Column: Visual Brand Anchor (Hidden on mobile) */}
      <section className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-primary-container">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-secondary-fixed text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              potted_plant
            </span>
            <span className="text-white font-h1 text-h2 tracking-tight">AgriNova</span>
          </div>
          <div className="mt-12 max-w-md">
            <h2 className="text-white font-h1 text-h1 leading-tight">
              Accompagner la croissance de chaque exploitation au Cameroun.
            </h2>
            <p className="text-on-primary-container font-body-md mt-4 opacity-90">
              Rejoignez une communauté de producteurs modernes et accédez à des outils de précision pour votre réussite agricole.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 z-0">
          <img
            alt="Champ de maïs fertile"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwaLGSaWVFQALXG9dYBWn4aCkcBuZVPgO7fPWslzXB-GVxS6PSGgBfnBYTnSzliT_UWayGktu1jNVFnfE0Jk1T3AboM4LhsFLJC7Lng2GMYi9d_FDWeEwJtUxme3f2SWfi008Amr1F5ITY_sTahxzkrkGDQztEWhY7E9UOkG1km9nHBxOxRgS_1w5zVn8xtHODBMjnQwsidS61uI040p9OwZaBBSE0I5CFg0ZbChoEUK_RsSCzH1RHx2ZEsuTC41sC8_edsf5h4Q"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent opacity-80"></div>
        </div>
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary-fixed"></div>
              <span className="text-white text-label-caps">MÉTÉO LOCALE</span>
            </div>
            <p className="text-white font-bold mt-1">Bafoussam: 24°C - Conditions idéales pour le semis</p>
          </div>
        </div>
      </section>

      {/* Right Column: Signup Form */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-surface-container-lowest">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <span
              className="material-symbols-outlined text-primary-container text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              potted_plant
            </span>
            <span className="text-primary-container font-h1 text-h2">AgriNova</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-nunito text-[32px] font-extrabold text-on-surface leading-tight">
              Créez votre compte
            </h1>
            <p className="text-on-surface-variant font-body-md mt-2">
              Commencez votre voyage vers une agriculture plus intelligente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-caps text-on-surface-variant" htmlFor="first_name">
                  Prénom
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 bg-white border border-outline rounded-lg px-4 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                    id="first_name"
                    placeholder="Ex: Jean"
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-caps text-on-surface-variant" htmlFor="last_name">
                  Nom
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 bg-white border border-outline rounded-lg px-4 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                    id="last_name"
                    placeholder="Ex: Eto'o"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-label-caps text-on-surface-variant" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 bg-white border border-outline rounded-lg px-4 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                  id="email"
                  placeholder="votre@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Region Dropdown */}
            <div className="space-y-1">
              <label className="font-label-caps text-on-surface-variant" htmlFor="region">
                Région / Localisation
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 bg-white border border-outline rounded-lg px-4 appearance-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                >
                  <option disabled value="">
                    Sélectionnez votre région
                  </option>
                  <option value="Adamaoua">Adamaoua</option>
                  <option value="Centre">Centre</option>
                  <option value="Est">Est</option>
                  <option value="Extrême-Nord">Extrême-Nord</option>
                  <option value="Littoral">Littoral</option>
                  <option value="Nord">Nord</option>
                  <option value="Nord-Ouest">Nord-Ouest</option>
                  <option value="Ouest">Ouest</option>
                  <option value="Sud">Sud</option>
                  <option value="Sud-Ouest">Sud-Ouest</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  keyboard_arrow_down
                </span>
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-caps text-on-surface-variant" htmlFor="password">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 bg-white border border-outline rounded-lg px-4 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label-caps text-on-surface-variant" htmlFor="confirm_password">
                  Confirmation
                </label>
                <div className="relative">
                  <input
                    className="w-full h-12 bg-white border border-outline rounded-lg px-4 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-on-surface"
                    id="confirm_password"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CGU Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <div className="flex h-5 items-center">
                <input
                  className="h-5 w-5 rounded border-outline text-primary-container focus:ring-secondary cursor-pointer accent-primary-container"
                  id="terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
              </div>
              <label className="text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
                J'accepte les{' '}
                <a className="text-secondary font-bold hover:underline" href="#">
                  Conditions Générales d'Utilisation
                </a>{' '}
                et la politique de confidentialité d'AgriNova.
              </label>
            </div>

            {/* Action Button */}
            <button
              className="w-full h-14 bg-primary-container hover:bg-primary text-white font-nunito font-extrabold text-body-md rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              type="submit"
              disabled={chargement}
            >
              {chargement ? 'Création...' : 'Créer mon compte'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Affichage des erreurs */}
          {erreur && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-error rounded-lg text-sm text-center font-medium animate-pulse">
              {erreur}
            </div>
          )}

          <div className="mt-8 text-center border-t border-outline-variant pt-6">
            <p className="text-on-surface-variant font-body-md">
              Vous avez déjà un compte ?
              <Link className="text-secondary font-extrabold hover:underline ml-1" href="/login">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}