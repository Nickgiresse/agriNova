'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../lib/auth';
import { User } from '../../../types';
import Sidebar from '../../../components/Sidebar';

type Tab = 'profil' | 'notifications' | 'securite' | 'abonnement';

export default function SettingsPage() {
  const router = useRouter();

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);

  // État de l'onglet actif
  const [ongletActif, setOngletActif] = useState<Tab>('profil');

  // États du formulaire Profil
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+237 677 889 900');
  const [region, setRegion] = useState('Ouest');

  // États du formulaire Ferme
  const [surfaceTotale, setSurfaceTotale] = useState('12.5');
  const [typeSol, setTypeSol] = useState('Volcanique fertile');
  const [culturesPrincipales, setCulturesPrincipales] = useState<string[]>(['Maïs', 'Café Arabica', 'Tomates']);
  const [nouvelleCultureInput, setNouvelleCultureInput] = useState('');
  const [inputAjoutCultureOuvert, setInputAjoutCultureOuvert] = useState(false);

  // États du formulaire Sécurité
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');

  // États des préférences d'alertes (Notifications)
  const [alerteMeteo, setAlerteMeteo] = useState(true);
  const [alerteIA, setAlerteIA] = useState(true);
  const [alerteRecolte, setAlerteRecolte] = useState(false);

  // Messages de retour utilisateur
  const [messageSucces, setMessageSucces] = useState('');
  const [messageErreur, setMessageErreur] = useState('');

  // Menu mobile ouvert/fermé
  const [mobileMenuOuvert, setMobileMenuOuvert] = useState(false);

  useEffect(() => {
    // Vérification de la connexion
    if (!estConnecte()) {
      router.push('/login');
      return;
    }

    const sessionUser = getUser();
    setUser(sessionUser);

    if (sessionUser) {
      setNomComplet(`${sessionUser.prenom || ''} ${sessionUser.nom || ''}`.trim() || 'Jean-Paul Kamga');
      setEmail(sessionUser.email || 'jp.kamga@agrinova.cm');
      if (sessionUser.region) {
        setRegion(sessionUser.region);
      }
    }

    // Charger les informations spécifiques à la ferme depuis localStorage s'il y en a
    const farmSurface = localStorage.getItem('farm_surface');
    const farmSoil = localStorage.getItem('farm_soil_type');
    const farmCrops = localStorage.getItem('farm_crops');
    const alertPrefs = localStorage.getItem('alert_preferences');

    if (farmSurface) setSurfaceTotale(farmSurface);
    if (farmSoil) setTypeSol(farmSoil);
    if (farmCrops) {
      try {
        setCulturesPrincipales(JSON.parse(farmCrops));
      } catch (e) {
        console.error(e);
      }
    }
    if (alertPrefs) {
      try {
        const parsed = JSON.parse(alertPrefs);
        setAlerteMeteo(parsed.meteo);
        setAlerteIA(parsed.ia);
        setAlerteRecolte(parsed.recolte);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Gérer l'enregistrement des modifications globales
  const gererEnregistrement = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSucces('');
    setMessageErreur('');

    if (ongletActif === 'profil') {
      if (!nomComplet.trim()) {
        setMessageErreur('Le nom complet est requis.');
        return;
      }
      if (!email.trim()) {
        setMessageErreur("L'adresse email est requise.");
        return;
      }

      // Séparer le nom complet en prénom et nom
      const parts = nomComplet.trim().split(' ');
      const prenom = parts[0] || '';
      const nom = parts.slice(1).join(' ') || '';

      const updatedUser = {
        ...user,
        prenom,
        nom,
        email,
        region,
      };

      // Mettre à jour la session utilisateur localement
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser as User);

      // Sauvegarder les données de la ferme
      localStorage.setItem('farm_surface', surfaceTotale);
      localStorage.setItem('farm_soil_type', typeSol);
      localStorage.setItem('farm_crops', JSON.stringify(culturesPrincipales));

      setMessageSucces('Modifications du profil et de la ferme enregistrées avec succès !');
    } else if (ongletActif === 'notifications') {
      const preferences = {
        meteo: alerteMeteo,
        ia: alerteIA,
        recolte: alerteRecolte,
      };
      localStorage.setItem('alert_preferences', JSON.stringify(preferences));
      setMessageSucces("Préférences d'alertes mises à jour avec succès !");
    } else if (ongletActif === 'securite') {
      if (!motDePasseActuel) {
        setMessageErreur('Veuillez entrer votre mot de passe actuel.');
        return;
      }
      if (nouveauMotDePasse !== confirmationMotDePasse) {
        setMessageErreur('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
        return;
      }
      if (nouveauMotDePasse.length < 6) {
        setMessageErreur('Le nouveau mot de passe doit comporter au moins 6 caractères.');
        return;
      }

      // Simulation de mise à jour de mot de passe
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');
      setMessageSucces('Votre mot de passe a été modifié avec succès.');
    }

    // Faire disparaître le message après 4 secondes
    setTimeout(() => {
      setMessageSucces('');
    }, 4000);
  };

  // Ajouter une culture principale
  const ajouterCulture = () => {
    if (nouvelleCultureInput.trim()) {
      const cultureNormalisee = nouvelleCultureInput.trim();
      if (!culturesPrincipales.includes(cultureNormalisee)) {
        setCulturesPrincipales([...culturesPrincipales, cultureNormalisee]);
      }
      setNouvelleCultureInput('');
      setInputAjoutCultureOuvert(false);
    }
  };

  // Supprimer une culture principale
  const supprimerCulture = (cropName: string) => {
    setCulturesPrincipales(culturesPrincipales.filter((c) => c !== cropName));
  };

  const getCropDotColor = (cropName: string) => {
    const name = cropName.toLowerCase();
    if (name.includes('maïs') || name.includes('mais')) return 'bg-amber-600';
    if (name.includes('café') || name.includes('cafe')) return 'bg-[#6F4E37]';
    if (name.includes('tomate')) return 'bg-red-500';
    if (name.includes('oignon')) return 'bg-yellow-500';
    if (name.includes('manioc')) return 'bg-emerald-600';
    return 'bg-secondary';
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      
      {/* Menu mobile (Drawer) */}
      {mobileMenuOuvert && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setMobileMenuOuvert(false)}></div>
          <aside className="relative flex flex-col w-72 max-w-xs bg-stone-50 p-6 shadow-xl h-full border-r border-stone-200">
            <div className="flex justify-between items-center mb-8">
              <div className="text-2xl font-black text-green-900 font-h1">AgriNova</div>
              <button onClick={() => setMobileMenuOuvert(false)} className="text-stone-500 hover:text-stone-900 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="/dashboard"
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Tableau de bord</span>
              </Link>
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="/dashboard/cultures"
              >
                <span className="material-symbols-outlined">potted_plant</span>
                <span>Mes Parcelles</span>
              </Link>
              <a
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="#"
              >
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Calendrier</span>
              </a>
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="/dashboard/meteo"
              >
                <span className="material-symbols-outlined">wb_sunny</span>
                <span>Météo</span>
              </Link>
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="/dashboard/conseiller-ia"
              >
                <span className="material-symbols-outlined">smart_toy</span>
                <span>Conseiller IA</span>
              </Link>
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg text-stone-500 hover:bg-stone-200 font-semibold text-sm transition-all"
                href="/dashboard/rapports"
              >
                <span className="material-symbols-outlined">assessment</span>
                <span>Rapports</span>
              </Link>
              <Link
                onClick={() => setMobileMenuOuvert(false)}
                className="flex items-center gap-3 p-3 rounded-lg bg-green-100 text-green-900 border-l-4 border-green-800 font-semibold text-sm transition-all"
                href="/dashboard/settings"
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Paramètres</span>
              </Link>
            </nav>
            
            <div className="mt-auto border-t border-stone-200 pt-6">
              <div className="flex items-center gap-3 mb-6">
                <img
                  alt="Avatar"
                  className="w-10 h-10 rounded-full bg-stone-200 object-cover border"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3D8Gdf8MqdhRFcv4kbUwmW4YmSJqFDfQOXXNuexPr3S-4PdvXYgvUOQr1r-y-keN7ji-sxjEu1UibQsl42Ma9cKYs07P0lxKF8Yw7QJmqQSJBH4cTdKRTP1a4P4gfVu4DxHDjAEpxdAtUYi8BPeodLNrNO7k0pDxQiqhGC8OMkzJKHH2naZXyNE5yGIVeVv9MdwotOgS5Wnz6pfCZ3McO2BkH1rqKoNsphZ1uCRJCnSmvMuYgOY87JNFDUOlWavewF5MoFGN_Zg"
                />
                <div>
                  <p className="text-sm font-bold text-green-900 leading-tight">
                    {user ? `${user.prenom} ${user.nom}` : 'AgriNova Pro'}
                  </p>
                  <p className="text-xs text-stone-500">Exploitation {user?.region || 'Bafoussam'}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOuvert(false);
                }}
                className="flex items-center gap-3 p-3 text-error hover:bg-red-50 rounded-lg w-full text-left font-semibold text-sm cursor-pointer"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar Desktop (NavigationDrawer) */}
      <Sidebar />


      {/* Top App Bar (Mobile Only) */}
      <header className="md:hidden sticky top-0 z-40 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 shadow-xs">
        <button onClick={() => setMobileMenuOuvert(true)} className="text-green-900 p-1 rounded hover:bg-stone-100 cursor-pointer">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="font-plus-jakarta text-base font-bold text-green-900">AgriNova</h1>
        <img
          alt="Avatar"
          className="w-8 h-8 rounded-full border border-primary-container object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3D8Gdf8MqdhRFcv4kbUwmW4YmSJqFDfQOXXNuexPr3S-4PdvXYgvUOQr1r-y-keN7ji-sxjEu1UibQsl42Ma9cKYs07P0lxKF8Yw7QJmqQSJBH4cTdKRTP1a4P4gfVu4DxHDjAEpxdAtUYi8BPeodLNrNO7k0pDxQiqhGC8OMkzJKHH2naZXyNE5yGIVeVv9MdwotOgS5Wnz6pfCZ3McO2BkH1rqKoNsphZ1uCRJCnSmvMuYgOY87JNFDUOlWavewF5MoFGN_Zg"
        />
      </header>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen p-4 md:p-8 lg:p-12 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Header */}
          <header className="mb-10">
            <h1 className="font-h1 text-h1 text-on-surface mb-2">Paramètres du compte</h1>
            <p className="font-body-md text-on-surface-variant text-sm">Gérez les informations de votre exploitation et vos préférences de notification.</p>
          </header>

          {/* Messages Alerts */}
          {messageSucces && (
            <div className="mb-6 bg-secondary-container text-on-secondary-container p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-green-300 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-green-800">check_circle</span>
              <span>{messageSucces}</span>
            </div>
          )}
          {messageErreur && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-300 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-red-800">error</span>
              <span>{messageErreur}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
            <button
              onClick={() => setOngletActif('profil')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-caps text-xs whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                ongletActif === 'profil'
                  ? 'bg-primary-container text-white font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: ongletActif === 'profil' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
              Profil
            </button>
            <button
              onClick={() => setOngletActif('notifications')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-caps text-xs whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                ongletActif === 'notifications'
                  ? 'bg-primary-container text-white font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: ongletActif === 'notifications' ? "'FILL' 1" : "'FILL' 0" }}>notifications</span>
              Notifications
            </button>
            <button
              onClick={() => setOngletActif('securite')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-caps text-xs whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                ongletActif === 'securite'
                  ? 'bg-primary-container text-white font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: ongletActif === 'securite' ? "'FILL' 1" : "'FILL' 0" }}>security</span>
              Sécurité
            </button>
            <button
              onClick={() => setOngletActif('abonnement')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-label-caps text-xs whitespace-nowrap shadow-xs transition-all cursor-pointer ${
                ongletActif === 'abonnement'
                  ? 'bg-primary-container text-white font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: ongletActif === 'abonnement' ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
              Mon abonnement
            </button>
          </div>

          {/* Form / Content Container */}
          <form onSubmit={gererEnregistrement}>
            
            {/* Tab: Profil */}
            {ongletActif === 'profil' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Avatar & Farm Status */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Avatar card */}
                  <div className="bg-surface-container-low rounded-xl p-8 text-center flex flex-col items-center shadow-sm border border-outline-variant/30">
                    <div className="relative group cursor-pointer mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl w-32 h-32 bg-stone-200">
                      <img
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDN3D8Gdf8MqdhRFcv4kbUwmW4YmSJqFDfQOXXNuexPr3S-4PdvXYgvUOQr1r-y-keN7ji-sxjEu1UibQsl42Ma9cKYs07P0lxKF8Yw7QJmqQSJBH4cTdKRTP1a4P4gfVu4DxHDjAEpxdAtUYi8BPeodLNrNO7k0pDxQiqhGC8OMkzJKHH2naZXyNE5yGIVeVv9MdwotOgS5Wnz6pfCZ3McO2BkH1rqKoNsphZ1uCRJCnSmvMuYgOY87JNFDUOlWavewF5MoFGN_Zg"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                      </div>
                    </div>
                    
                    <h2 className="font-h3 text-base text-on-surface mb-1 font-bold">
                      {nomComplet || 'Jean-Paul Kamga'}
                    </h2>
                    <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Agriculteur Vérifié
                    </span>
                    
                    <div className="mt-8 w-full space-y-4 text-left border-t border-outline-variant/20 pt-4 text-xs font-semibold">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                        <span>{region}, Cameroun</span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                        <span>Membre depuis Jan 2023</span>
                      </div>
                    </div>
                  </div>

                  {/* Farm status card */}
                  <div className="bg-primary-container text-white rounded-xl p-6 shadow-md">
                    <h4 className="text-[10px] font-bold text-green-300 uppercase tracking-widest mb-2">Statut de la ferme</h4>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-h3 text-lg font-bold">Optimisé</p>
                        <p className="text-xs text-white/80 mt-0.5">92% de santé globale</p>
                      </div>
                      <span className="material-symbols-outlined text-4xl text-white/55">show_chart</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Informations personnelles */}
                  <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/60 shadow-xs">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="material-symbols-outlined text-primary p-2 bg-secondary-container rounded-lg">badge</span>
                      <h2 className="font-h3 text-base font-bold text-stone-800">Informations personnelles</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Nom complet</label>
                        <input
                          className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium transition-all"
                          type="text"
                          value={nomComplet}
                          onChange={(e) => setNomComplet(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Email</label>
                        <input
                          className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium transition-all"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Téléphone</label>
                        <input
                          className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-medium transition-all"
                          type="tel"
                          value={telephone}
                          onChange={(e) => setTelephone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Région</label>
                        <select
                          className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-semibold transition-all"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                        >
                          <option value="Ouest">Ouest</option>
                          <option value="Littoral">Littoral</option>
                          <option value="Centre">Centre</option>
                          <option value="Nord">Nord</option>
                          <option value="Sud">Sud</option>
                          <option value="Est">Est</option>
                          <option value="Adamaoua">Adamaoua</option>
                          <option value="Extrême-Nord">Extrême-Nord</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Ma ferme */}
                  <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/60 shadow-xs">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="material-symbols-outlined text-primary p-2 bg-secondary-container rounded-lg">agriculture</span>
                      <h2 className="font-h3 text-base font-bold text-stone-800">Ma ferme</h2>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Surface totale (Ha)</label>
                          <div className="relative">
                            <input
                              className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary pl-10 font-medium"
                              type="number"
                              step="0.1"
                              value={surfaceTotale}
                              onChange={(e) => setSurfaceTotale(e.target.value)}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">square_foot</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Type de sol dominant</label>
                          <select
                            className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary font-semibold"
                            value={typeSol}
                            onChange={(e) => setTypeSol(e.target.value)}
                          >
                            <option value="Volcanique fertile">Volcanique fertile</option>
                            <option value="Argileux-limoneux">Argileux-limoneux</option>
                            <option value="Sableux">Sableux</option>
                            <option value="Ferralitique">Ferralitique</option>
                          </select>
                        </div>
                      </div>

                      {/* Main crops tag block */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Cultures principales</label>
                        <div className="flex flex-wrap gap-3">
                          {culturesPrincipales.map((crop) => (
                            <div
                              key={crop}
                              className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/50 shadow-2xs text-xs font-semibold animate-in fade-in scale-in-95 duration-150"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${getCropDotColor(crop)}`}></span>
                              <span className="text-on-surface">{crop}</span>
                              <button
                                type="button"
                                onClick={() => supprimerCulture(crop)}
                                className="material-symbols-outlined text-sm text-stone-400 hover:text-error transition-colors cursor-pointer"
                              >
                                close
                              </button>
                            </div>
                          ))}
                          
                          {/* Crop inline creator */}
                          {inputAjoutCultureOuvert ? (
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-primary p-1 animate-in slide-in-from-left-2 duration-150">
                              <input
                                type="text"
                                placeholder="Nouvelle culture..."
                                value={nouvelleCultureInput}
                                onChange={(e) => setNouvelleCultureInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    ajouterCulture();
                                  }
                                }}
                                className="px-2 py-1 outline-none text-xs w-28 font-medium"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={ajouterCulture}
                                className="material-symbols-outlined text-base text-primary hover:bg-stone-100 p-0.5 rounded cursor-pointer"
                              >
                                check
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setNouvelleCultureInput('');
                                  setInputAjoutCultureOuvert(false);
                                }}
                                className="material-symbols-outlined text-base text-stone-400 hover:bg-stone-100 p-0.5 rounded cursor-pointer"
                              >
                                close
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInputAjoutCultureOuvert(true)}
                              className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-outline-variant hover:border-primary rounded-lg text-xs font-bold text-on-surface-variant hover:text-primary transition-all cursor-pointer active:scale-95"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">add</span>
                              <span className="uppercase tracking-wider">Ajouter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* Tab: Notifications */}
            {ongletActif === 'notifications' && (
              <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary p-2 bg-secondary-container rounded-lg">notifications_active</span>
                  <h2 className="font-h3 text-base font-bold text-stone-800">Préférences d'alertes</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Alert 1 */}
                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                    <div className="pr-4">
                      <p className="font-plus-jakarta font-bold text-on-surface text-sm">Alertes Météo Critiques</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Notifications en cas d'orage, inondation ou gel.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alerteMeteo}
                        onChange={(e) => setAlerteMeteo(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>

                  {/* Alert 2 */}
                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                    <div className="pr-4">
                      <p className="font-plus-jakarta font-bold text-on-surface text-sm">Conseils de l'IA AgriNova</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Recommandations quotidiennes pour vos parcelles.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alerteIA}
                        onChange={(e) => setAlerteIA(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>

                  {/* Alert 3 */}
                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                    <div className="pr-4">
                      <p className="font-plus-jakarta font-bold text-on-surface text-sm">Fenêtre de Récolte</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">Alertes lorsque vos cultures atteignent la maturité optimale.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alerteRecolte}
                        onChange={(e) => setAlerteRecolte(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </div>
              </section>
            )}

            {/* Tab: Sécurité */}
            {ongletActif === 'securite' && (
              <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary p-2 bg-secondary-container rounded-lg">security</span>
                  <h2 className="font-h3 text-base font-bold text-stone-800">Sécurité du compte</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Mot de passe actuel</label>
                    <input
                      className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary font-medium"
                      type="password"
                      placeholder="Mot de passe actuel"
                      value={motDePasseActuel}
                      onChange={(e) => setMotDePasseActuel(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Nouveau mot de passe</label>
                    <input
                      className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary font-medium"
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={nouveauMotDePasse}
                      onChange={(e) => setNouveauMotDePasse(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Confirmer le nouveau mot de passe</label>
                    <input
                      className="w-full bg-white border border-outline rounded-xl p-3 text-on-surface focus:outline-none focus:border-secondary font-medium"
                      type="password"
                      placeholder="Confirmation"
                      value={confirmationMotDePasse}
                      onChange={(e) => setConfirmationMotDePasse(e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Tab: Mon abonnement */}
            {ongletActif === 'abonnement' && (
              <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary p-2 bg-secondary-container rounded-lg">workspace_premium</span>
                  <h2 className="font-h3 text-base font-bold text-stone-800">Détails de l'abonnement</h2>
                </div>

                <div className="bg-stone-50 border border-outline-variant/60 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-wider">Plan Actif</span>
                    <h3 className="font-h3 text-lg font-bold text-green-900 mt-2">AgriNova Pro</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Facturation annuelle - Prochain renouvellement le 12 Janv. 2027</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-green-950">25 000 FCFA</span>
                    <span className="text-xs text-stone-500 block">/ an</span>
                  </div>
                </div>

                <div className="border-t border-stone-150 pt-6">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">Fonctionnalités incluses</h4>
                  <ul className="space-y-2 text-xs font-semibold text-stone-600">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-700 text-sm">check_circle</span>
                      Analyses de santé de culture illimitées
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-700 text-sm">check_circle</span>
                      Accès complet au conseiller IA 24h/24
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-700 text-sm">check_circle</span>
                      Alertes météo prioritaires par SMS
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-700 text-sm">check_circle</span>
                      Export des rapports de récolte (PDF/CSV)
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 max-w-2xl lg:max-w-none mx-auto">
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 active:scale-95 duration-150 shadow-md text-sm cursor-pointer"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-surface-container-high text-primary-container rounded-xl font-bold hover:bg-surface-container-highest transition-colors text-sm cursor-pointer"
              >
                Annuler
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard">
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Accueil</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard/cultures">
          <span className="material-symbols-outlined text-xl">leaf_spark</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Cultures</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard/meteo">
          <span className="material-symbols-outlined text-xl">wb_sunny</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Météo</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="#">
          <span className="material-symbols-outlined text-xl">storefront</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Marché</span>
        </a>
        <Link className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1.5" href="/dashboard/settings">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Profil</span>
        </Link>
      </nav>

    </div>
  );
}
