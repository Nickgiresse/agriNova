'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../lib/auth';
import { User, Culture } from '../../../types';
import api from '../../../lib/axios';
import Sidebar from '../../../components/Sidebar';

export default function CulturesPage() {
  const router = useRouter();

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);

  // État des cultures
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // État du filtre actif
  const [filtreActif, setFiltreActif] = useState<'toutes' | 'croissance' | 'recolte' | 'termine'>('toutes');

  // État d'ouverture du modal d'ajout
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false);

  // Formulaire d'ajout
  const [nouveauNom, setNouveauNom] = useState('');
  const [nouveauStatut, setNouveauStatut] = useState('en croissance');
  const [nouvelleDatePlantation, setNouvelleDatePlantation] = useState('');
  const [nouvelleSurface, setNouvelleSurface] = useState('');
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);
  const [erreurModal, setErreurModal] = useState('');

  // Menu mobile ouvert/fermé
  const [mobileMenuOuvert, setMobileMenuOuvert] = useState(false);

  // Données de démonstration si la base de données est vide
  const culturesSimulees: Culture[] = [
    {
      id: 'mais',
      nom: 'Maïs Blanc (Parcelle A)',
      statut: 'en croissance',
      datePlantation: '2024-03-12T00:00:00.000Z',
      surface: 2.5,
      userId: 'demo-user',
      createdAt: '2024-03-12T08:00:00.000Z',
    },
    {
      id: 'tomate',
      nom: 'Tomate Rio Grande',
      statut: 'en récolte',
      datePlantation: '2024-02-05T00:00:00.000Z',
      surface: 0.8,
      userId: 'demo-user',
      createdAt: '2024-02-05T08:00:00.000Z',
    },
    {
      id: 'manioc',
      nom: 'Manioc Amélioré',
      statut: 'en croissance',
      datePlantation: '2024-05-10T00:00:00.000Z',
      surface: 4.2,
      userId: 'demo-user',
      createdAt: '2024-05-10T08:00:00.000Z',
    },
    {
      id: 'oignon',
      nom: 'Oignon Jaune',
      statut: 'terminée',
      datePlantation: '2023-11-15T00:00:00.000Z',
      surface: 1.2,
      userId: 'demo-user',
      createdAt: '2023-11-15T08:00:00.000Z',
    },
  ];

  useEffect(() => {
    // Vérification de la connexion
    if (!estConnecte()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
    chargerCultures();
  }, []);

  const chargerCultures = async () => {
    try {
      setChargement(true);
      const response = await api.get<Culture[]>('/cultures');
      
      // Si l'utilisateur n'a aucune culture en base de données, on utilise les données simulées
      if (response.data && response.data.length > 0) {
        setCultures(response.data);
      } else {
        console.log('Aucune culture en BD, chargement des données de démonstration.');
        setCultures(culturesSimulees);
      }
    } catch (err: any) {
      console.error('Erreur de chargement des cultures depuis le backend:', err);
      // Fallback sur les données simulées en cas d'erreur de connexion avec l'API
      setCultures(culturesSimulees);
    } finally {
      setChargement(false);
    }
  };

  // Soumission du formulaire d'ajout
  const gererSoumission = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurModal('');

    if (!nouveauNom.trim()) {
      setErreurModal('Le nom de la culture est requis.');
      return;
    }
    if (!nouvelleDatePlantation) {
      setErreurModal('La date de plantation est requise.');
      return;
    }
    const surfaceFloat = parseFloat(nouvelleSurface);
    if (isNaN(surfaceFloat) || surfaceFloat <= 0) {
      setErreurModal('Veuillez entrer une surface valide en hectares.');
      return;
    }

    try {
      setSoumissionEnCours(true);
      const payload = {
        nom: nouveauNom,
        statut: nouveauStatut,
        datePlantation: new Date(nouvelleDatePlantation).toISOString(),
        surface: surfaceFloat,
      };

      const res = await api.post<Culture>('/cultures', payload);
      
      // Si on utilisait les données simulées, on bascule uniquement sur les données de la BD
      // mais pour l'affichage hybride, on insère la nouvelle au début de notre liste locale
      setCultures(prev => [res.data, ...prev]);

      // Réinitialiser les champs et fermer le modal
      setNouveauNom('');
      setNouveauStatut('en croissance');
      setNouvelleDatePlantation('');
      setNouvelleSurface('');
      setModalAjoutOuvert(false);
    } catch (err: any) {
      console.error('Erreur lors de la création de la culture:', err);
      setErreurModal(err.response?.data?.message || 'Erreur lors de la création de la culture. Veuillez réessayer.');
    } finally {
      setSoumissionEnCours(false);
    }
  };

  // Calcul du pourcentage de progression
  const calculerProgression = (culture: Culture) => {
    const s = culture.statut.toLowerCase();
    if (s.includes('termine')) return 100;

    const start = new Date(culture.datePlantation).getTime();
    const now = Date.now();
    const joursPasses = Math.floor((now - start) / (1000 * 60 * 60 * 24));

    // Détermination de la longueur moyenne du cycle selon le type
    let cycleTotalJours = 120; // Par défaut (Maïs)
    const nomLower = culture.nom.toLowerCase();
    if (nomLower.includes('tomate')) {
      cycleTotalJours = 90;
    } else if (nomLower.includes('manioc')) {
      cycleTotalJours = 300;
    } else if (nomLower.includes('oignon')) {
      cycleTotalJours = 110;
    } else if (nomLower.includes('café') || nomLower.includes('cafe')) {
      cycleTotalJours = 365;
    }

    const pourcentage = Math.min(99, Math.max(5, Math.round((joursPasses / cycleTotalJours) * 100)));
    return pourcentage;
  };

  // Formater la date en français
  const formaterDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return d.toLocaleDateString('fr-FR', options);
    } catch {
      return dateString;
    }
  };

  // Sélectionner la couleur de la barre de progression
  const obtenirCouleurBarre = (culture: Culture) => {
    const s = culture.statut.toLowerCase();
    if (s.includes('termine')) return 'bg-stone-450';
    if (s.includes('récolte') || s.includes('recolte')) return 'bg-tertiary';
    return 'bg-secondary';
  };

  // Sélectionner l'image de la culture
  const obtenirImageCulture = (nom: string) => {
    const n = nom.toLowerCase();
    if (n.includes('maïs') || n.includes('mais') || n.includes('corn')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_KNEtCU2s1s9CwF9r0qfTFuCNXz8LxGoEsz8VA4bAD2G9fuZGT9zZ8zRkHzMoAcJzqEUNuqtvvEIixa4pkjaklzIbN2fnlD9_AxWnfsVJbU1yQw3bm-u5xXpjbrkFIPDoOMgL1zX0N89VgVBLADEqSZv9OPabIRdKDY_vlIq2S2v21pNItw_5rFXT8-TX0WaoV7kSJqL3UxOa-Mi31MkjHqI3UBlpESxuFiJnp-ZBuWzFO-sIGWPHAIhuFu8ePGNMR3U402afdm0';
    }
    if (n.includes('tomate')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWwzH6qzC2SclxiUng5Ef9hcMCs9egZnrunYwiclnKvVmoVk32Zhz6cNELvB8fvlWoSbphpvlehJOWBiLilVF72c1TH0a6Z2AB5BQixAVeJNFN-a3M6h5S2zRGBmAveRuZUvNbszbtGomvJleuD2_4GXqIr8_eKSvLxp-T0PkKDyOSCCG3hU4xh7QuWnUUfQnV3YTuuivhQCVyUqMeGR3e3VDr997Ijzbih4UuJEz42Eo-ZRuuab4xmQ4f4P3jUFeHXwY4IBvzHLw';
    }
    if (n.includes('manioc')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuD65tJH-xeCT0PjiLAQ0L7NSTX2c9LHxvNh4PLIGCfLd6O3m8diDBQ02K6u4sjblEI32kOeeT0Nsvu-L-vUQA-WsoxmVTppr7I7gUCkZfIzTtZiyK0ZWLuoVzmz_ej77HYtrv-94UcDQ9P_AhKFYJeGL8uKVAxrwZrWXUdzg0aU7biv_TfcPNcgzXsgzPiPCq6ja16b6lpxppkwYQZKzI-2iEvKUp_tkC6QiSWmsaHWpE5Y24oZxBoJUQZGvHGnKwzvxFGsku7PkDQ';
    }
    if (n.includes('oignon')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXfGFrT3ENuOg-JhJJB_VvqkExoRx6AjxfirtqPEh7PlhnXxK3lN-hvxFo3zs0Xyo2dguW0EjPG_B7KFf9SiBJF2iD2aX3HOzKwe39gWtTngfDBdC8FrSvSyb65b4l2-A7RzygEL6CSX57W9TQ7MZxk6-kSH8cwHHjkZnBhcAHdi8R3V6rPRtd5JI_CaRMLRUZTvjRgZYzJITnT9NJq1DQmSCRTFKJMEbLhP3epFhM--MQX5qIOYBlCxNs5bVarK8ITOgtIzSergk';
    }
    // Par défaut
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuChXdbm-ZYg0o9_4ThzFK2rhRBhOL4UpexESjbX-m9-3gk7LHlQNlKK2vEphMFeXCN8x4QHdtOhM2_94t9lv2zl3W55mVZPmq9fdu7r-8ekAKYmyvdPHtSah5jgivnrfePu_kDWJ-LzDF-nTY-481IZKOeRIeBdOnjP1Iymx4lIgrI6DFv_bJyH5lv5h3zCm1t3D4-GhtNiStaMuQGcZW9hPQCp5zulGhS7KwB5xgWP1jwiwitWPh6xnh64zHD4f5G-RbhOhDkFwLQ';
  };

  // Filtrer les cultures localement
  const culturesFiltrees = cultures.filter((c) => {
    const status = c.statut.toLowerCase();
    if (filtreActif === 'toutes') return true;
    if (filtreActif === 'croissance') return status.includes('croissance');
    if (filtreActif === 'recolte') return status.includes('récolte') || status.includes('recolte');
    if (filtreActif === 'termine') return status.includes('termine');
    return true;
  });

  const renderBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('croissance')) {
      return (
        <span className="absolute top-3 right-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          En croissance
        </span>
      );
    }
    if (s.includes('récolte') || s.includes('recolte')) {
      return (
        <span className="absolute top-3 right-3 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          Prêt pour récolte
        </span>
      );
    }
    return (
      <span className="absolute top-3 right-3 bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
        Terminée
      </span>
    );
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
                className="flex items-center gap-3 p-3 rounded-lg bg-green-100 text-green-900 border-l-4 border-green-800 font-semibold text-sm transition-all"
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
                  className="w-10 h-10 rounded-full bg-stone-200 object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDQ6cUmvIEZ4iJyDPjJij0UvCjpQWOYBf-yIvaORBzY2f_h6NvY6WZ8tlywzYa06vbmo1GpcK5pwiCd0b8pUe1qaG-ByKdfC-z1bzqxcFV4oTa799yN3stw8qVe6tTwKozsL_gAlddzZ1rZWGTLLBO-Jz8XadqAHjySgRWvQ6Xvylw6W7IpTW6Kncwk_BcNrf8udi6ATwBQQyGThZIHPhv8S_hNVQSODNNRl0bEaz1d_mXus1WR6-b0JD_J9zufspN5mVJ8HIqXyg"
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


      {/* Header TopAppBar */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 md:pl-[312px] shadow-xs">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOuvert(true)} className="md:hidden text-green-900 active:scale-95 duration-150 p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-h2 text-base font-bold text-green-900">AgriNova</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
            notifications
          </button>
          <img
            alt="Profile de l'agriculteur"
            className="w-8 h-8 rounded-full border border-stone-200 object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_t46E5Gxa2G4_r44fVI74StFBn2CWXTTDdOa4msVgIkXzBqBZWFlBSeVIkxZjTSVX-Z1D1FWlx8Ncq8Px7QOYc0uh5TPRptKnBEjEyoW8QvWDblYdVbP-RVKZc_qkAsupIqfm2fIqGicxMI2htvAWlDGV3Wx52bE6-SHqfN2uSTL6PBeTMsBo3JLNLs6vHNcG4v-Ul7DTM6tVJKjASUXzmmBNVqznpLay8VSKvlE8HdYiVab2_XA91rJ-Wr6j-oAoGiiKyAqb5LY"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="md:ml-72 p-6 pb-24 md:pb-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-h1 text-h1 text-on-surface">Mes Cultures</h2>
            <p className="font-body-md text-on-surface-variant">Gérez et suivez le cycle de vos plantations en temps réel.</p>
          </div>
          <button
            onClick={() => setModalAjoutOuvert(true)}
            className="flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Ajouter une culture</span>
          </button>
        </div>

        {/* Filters pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar mb-6">
          <button
            onClick={() => setFiltreActif('toutes')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filtreActif === 'toutes'
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFiltreActif('croissance')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filtreActif === 'croissance'
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            En croissance
          </button>
          <button
            onClick={() => setFiltreActif('recolte')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filtreActif === 'recolte'
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            En récolte
          </button>
          <button
            onClick={() => setFiltreActif('termine')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filtreActif === 'termine'
                ? 'bg-primary-container text-white shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            Terminées
          </button>
        </div>

        {/* Loading / Error States */}
        {chargement ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-stone-500">Chargement des parcelles...</p>
          </div>
        ) : culturesFiltrees.length === 0 ? (
          <div className="bg-surface-container-low p-10 rounded-xl text-center border border-stone-200/50">
            <span className="material-symbols-outlined text-stone-400 text-5xl mb-3">potted_plant</span>
            <p className="font-h3 text-stone-600 text-base font-bold">Aucune culture trouvée</p>
            <p className="text-sm text-stone-500 mt-1">Essayez d'ajouter une nouvelle culture pour commencer votre suivi.</p>
          </div>
        ) : (
          /* Culture Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturesFiltrees.map((c) => {
              const progression = calculerProgression(c);
              const estTermine = c.statut.toLowerCase().includes('termine');
              const progressColor = obtenirCouleurBarre(c);

              return (
                <div
                  key={c.id}
                  className={`bg-surface-container-low p-5 rounded-xl shadow-sm border border-transparent hover:shadow-md transition-all group ${
                    estTermine ? 'opacity-80' : ''
                  }`}
                >
                  {/* Photo container */}
                  <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-stone-200">
                    <img
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        estTermine ? 'grayscale' : ''
                      }`}
                      alt={c.nom}
                      src={obtenirImageCulture(c.nom)}
                    />
                    {renderBadge(c.statut)}
                  </div>

                  {/* Title & Actions */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-h3 text-h3 text-stone-900 group-hover:text-primary transition-colors">{c.nom}</h3>
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer">
                      more_vert
                    </button>
                  </div>

                  {/* Progress info */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                      <span>Cycle de croissance</span>
                      <span className="font-bold text-on-surface">{progression}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${progression}%` }}
                      ></div>
                    </div>

                    {/* Meta info grid */}
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-outline-variant/30 text-xs">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Plantation</p>
                        <p className="text-sm font-bold text-stone-800 mt-0.5">{formaterDate(c.datePlantation)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Surface</p>
                        <p className="text-sm font-bold text-stone-800 mt-0.5">{c.surface} ha</p>
                      </div>
                    </div>

                    {/* Details/Action button */}
                    {estTermine ? (
                      <button
                        onClick={() => router.push(`/dashboard/cultures/${c.id}`)}
                        className="w-full flex items-center justify-center gap-2 text-stone-500 font-bold py-2 group-hover:gap-4 transition-all text-xs cursor-pointer hover:text-stone-700"
                      >
                        Archives <span className="material-symbols-outlined text-sm">history</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/cultures/${c.id}`)}
                        className="w-full flex items-center justify-center gap-2 text-primary font-bold py-2 group-hover:gap-4 transition-all text-xs cursor-pointer"
                      >
                        Voir détails <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard">
          <span className="material-symbols-outlined text-xl">home</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Accueil</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1.5" href="/dashboard/cultures">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>leaf_spark</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Cultures</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard/meteo">
          <span className="material-symbols-outlined text-xl">wb_sunny</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Météo</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="#">
          <span className="material-symbols-outlined text-xl">storefront</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Marché</span>
        </a>
        <Link className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all" href="/dashboard/rapports">
          <span className="material-symbols-outlined text-xl">assessment</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Rapports</span>
        </Link>
      </nav>

      {/* Overlay Modal: Ajouter une culture */}
      {modalAjoutOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={() => setModalAjoutOuvert(false)}></div>

          {/* Modal content */}
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden transform transition-all border border-stone-250 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal header */}
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
              <h3 className="font-h2 text-green-900 flex items-center gap-2 text-base font-bold">
                <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
                Ajouter une culture
              </h3>
              <button
                onClick={() => setModalAjoutOuvert(false)}
                className="text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal body & Form */}
            <form onSubmit={gererSoumission} className="p-6 space-y-4">
              
              {erreurModal && (
                <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{erreurModal}</span>
                </div>
              )}

              {/* Crop Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Nom de la culture</label>
                <input
                  type="text"
                  placeholder="Ex: Maïs Blanc (Parcelle A), Tomate Rio Grande..."
                  value={nouveauNom}
                  onChange={(e) => setNouveauNom(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-sm font-medium"
                  required
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Statut initial</label>
                <select
                  value={nouveauStatut}
                  onChange={(e) => setNouveauStatut(e.target.value)}
                  className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-sm font-semibold"
                >
                  <option value="en croissance">En croissance</option>
                  <option value="en récolte">Prêt pour récolte</option>
                  <option value="terminée">Terminée</option>
                </select>
              </div>

              {/* Dates & Surface Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Planting Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Date de plantation</label>
                  <input
                    type="date"
                    value={nouvelleDatePlantation}
                    onChange={(e) => setNouvelleDatePlantation(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-sm font-medium"
                    required
                  />
                </div>

                {/* Surface area */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">Surface (Hectares)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ex: 2.5, 0.8..."
                    value={nouvelleSurface}
                    onChange={(e) => setNouvelleSurface(e.target.value)}
                    className="w-full p-3 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Modal footer / buttons */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setModalAjoutOuvert(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={soumissionEnCours}
                  className="px-5 py-2.5 bg-primary-container hover:opacity-90 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {soumissionEnCours ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
