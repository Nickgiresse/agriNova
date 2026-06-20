'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../../lib/auth';
import { User, Culture } from '../../../../types';
import api from '../../../../lib/axios';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CultureDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  // États de session et de données
  const [user, setUser] = useState<User | null>(null);
  const [culture, setCulture] = useState<Culture | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  
  // Onglet actif
  const [activeTab, setActiveTab] = useState<'apercu' | 'recommandations' | 'historique' | 'alertes'>('apercu');

  // États du modal de modification
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nom: '', statut: '', surface: 0, datePlantation: '' });
  const [modification, setModification] = useState(false);
  const [erreurModif, setErreurModif] = useState('');

  // État de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suppression, setSuppression] = useState(false);

  useEffect(() => {
    // Vérification de connexion
    if (!estConnecte()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
    chargerCulture();
  }, [id]);

  const chargerCulture = async () => {
    try {
      if (id === 'mock-id' || id === 'mais' || id === 'cafe') {
        throw new Error('Demo fallback');
      }
      const response = await api.get<Culture>(`/cultures/${id}`);
      setCulture(response.data);
      // Pré-remplit le formulaire d'édition avec les données actuelles
      setEditForm({
        nom: response.data.nom,
        statut: response.data.statut,
        surface: response.data.surface,
        // L'input type="date" attend le format YYYY-MM-DD
        datePlantation: response.data.datePlantation.slice(0, 10),
      });
    } catch (err: any) {
      console.warn('Utilisation des données simulées de démonstration pour la culture:', id);
      const mockNom = id === 'cafe' ? 'Café' : 'Maïs';
      const mockStatut = id === 'cafe' ? 'en récolte' : 'en croissance';
      const mockSurface = id === 'cafe' ? 1.8 : 2.5;
      const mockDate = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString();

      setCulture({
        id: id,
        nom: mockNom,
        statut: mockStatut,
        datePlantation: mockDate, // Planté il y a 95 jours
        surface: mockSurface,
        userId: 'demo-user',
        createdAt: new Date().toISOString(),
      });
      setEditForm({
        nom: mockNom,
        statut: mockStatut,
        surface: mockSurface,
        datePlantation: mockDate.slice(0, 10),
      });
    } finally {
      setChargement(false);
    }
  };

  // Gère les changements dans le formulaire de modification
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      // surface doit rester un nombre, le reste reste du texte
      [name]: name === 'surface' ? parseFloat(value) || 0 : value,
    }));
  };

  // Envoie la modification au backend via PATCH /cultures/:id
  const handleModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModification(true);
    setErreurModif('');

    try {
      const response = await api.patch<Culture>(`/cultures/${id}`, editForm);
      // Met à jour l'affichage avec les nouvelles données retournées par l'API
      setCulture(response.data);
      setShowEditModal(false);
    } catch (err: any) {
      setErreurModif(
        err.response?.data?.message || 'Erreur lors de la modification de la culture'
      );
    } finally {
      setModification(false);
    }
  };

  // Supprime la culture via DELETE /cultures/:id puis revient à la liste
  const handleSupprimer = async () => {
    setSuppression(true);
    try {
      await api.delete(`/cultures/${id}`);
      router.push('/dashboard/cultures');
    } catch (err: any) {
      setErreur(
        err.response?.data?.message || 'Erreur lors de la suppression de la culture'
      );
      setSuppression(false);
      setShowDeleteConfirm(false);
    }
  };

  // Formatage des dates
  const formatSemisDate = (dateString?: string) => {
    if (!dateString) return '12 Mars 2024';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  const getEstimatedHarvestDate = (dateString?: string) => {
    if (!dateString) return '25 Juil. 2024';
    const date = new Date(dateString);
    // On ajoute généralement environ 120-130 jours pour le cycle de récolte du maïs/céréales
    date.setDate(date.getDate() + 130);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Calcul du cycle de croissance actuel
  const stages = ['Semis', 'Germination', 'Croissance', 'Floraison', 'Récolte'];
  
  const getStageIndex = (status?: string) => {
    if (!status) return 2; // Croissance par défaut
    const s = status.toLowerCase();
    if (s.includes('semis')) return 0;
    if (s.includes('germination')) return 1;
    if (s.includes('croissance') || s.includes('en croissance')) return 2;
    if (s.includes('floraison')) return 3;
    if (s.includes('récolte') || s.includes('en récolte') || s.includes('terminé')) return 4;
    return 2;
  };

  const activeIndex = getStageIndex(culture?.statut);
  const progressWidth = ['0%', '25%', '50%', '75%', '100%'][activeIndex];

  if (chargement) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-semibold text-sm">Chargement des données de la culture...</p>
        </div>
      </div>
    );
  }

  if (erreur || !culture) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface p-6">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl shadow-md border border-outline-variant/30">
          <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
          <h2 className="text-xl font-bold text-gray-900">Une erreur est survenue</h2>
          <p className="text-gray-500 text-sm">{erreur || 'Culture introuvable'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface">
      {/* Navigation Drawer */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full p-6 bg-stone-50 border-r border-stone-200 w-72 z-40">
        <div className="text-2xl font-black text-green-900 mb-8">AgriNova</div>
        <div className="flex items-center space-x-3 mb-8 p-3 rounded-xl bg-surface-container">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white overflow-hidden">
            <img
              alt="Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAOtZ17W1zfSowx1uFGOOy1yuzeWtuN0WZWlAk2W5g7kHmcBRImFgsOTQwMAYZ6Mm2ykTB_5bT9pRHnPutUjjWh8eH0y5EvxiQRAh0pbxqlWWXV5iaE1AsH47aAEBZnq0gXbfxwg1vDRyggJrfGfLyvavG5N1RxL2jZ-QeBdUVWx5qFayF691PAsBpCl2BhO6siy2JxGQi0km51Q95wwrqO0e_Rr0lkMsrfS9XcsUj7LCwnI0el9RMCZs6e-m8-qkcPj9q86sSX6s"
            />
          </div>
          <div>
            <p className="font-h3 text-body-sm text-green-900 leading-tight">
              {user ? `${user.prenom} ${user.nom}` : 'Mamadou Koné'}
            </p>
            <p className="text-[12px] text-stone-500 uppercase tracking-tight">
              Exploitation {user?.region || 'Bafoussam'}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="/dashboard"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Tableau de bord</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-green-100 text-green-900 border-l-4 border-green-800 font-plus-jakarta text-sm font-semibold"
            href="/dashboard/cultures"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              potted_plant
            </span>
            <span>Mes Parcelles</span>
          </Link>
          <a
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="#"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Calendrier</span>
          </a>
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="/dashboard/meteo"
          >
            <span className="material-symbols-outlined">wb_sunny</span>
            <span>Météo</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="/dashboard/conseiller-ia"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span>Conseiller IA</span>
          </Link>
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="/dashboard/rapports"
          >
            <span className="material-symbols-outlined">assessment</span>
            <span>Rapports</span>
          </Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-stone-200 space-y-2">
          <Link
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-stone-200 transition-all font-plus-jakarta text-sm font-semibold"
            href="/dashboard/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Paramètres</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-error hover:bg-red-50 transition-all font-plus-jakarta text-sm font-semibold w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:ml-72 min-h-screen pb-24 md:pb-8">
        {/* TopAppBar */}
        <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="md:hidden text-green-900 cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </Link>
            <div className="font-plus-jakarta text-base font-bold text-green-900">AgriNova</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img
                alt="Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSH7FDMu2lCUNck766SqCXdn2dA3_0TTmaeUXwaTzUM_73SYGLJOmKhdFR0lHsqCS6WP_fD8NBsOLzUEJiB5XtfoRavGAy_jxtSNP8EFeoJx6GlnuignoUAiU_4upHc8y4drgaXbn_RZIIkl6v4FdhasDbO6C3zJVfGdv5TY9COp0Ri5rOziZLoBQga2k64qmu6-q7s6wNzdgYhl_I5RvFXwaZKrguZ_vv1GIR82hgpq3P_JLbQqBVbxYtQpOOZ6D1gt3W22eVtJE"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-6 mt-6">
          {/* Breadcrumb + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <nav className="flex items-center space-x-2 text-on-surface-variant font-label-caps">
              <Link className="hover:text-primary transition-colors text-xs font-bold" href="/dashboard">
                Mes cultures
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-primary font-bold text-xs">{culture.nom}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs px-4 py-2 rounded-lg transition-all border border-outline-variant/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-error font-bold text-xs px-4 py-2 rounded-lg transition-all border border-red-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Supprimer
              </button>
            </div>
          </div>

          {/* Hero Crop Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-8 relative rounded-xl overflow-hidden h-[300px] md:h-[400px] shadow-sm">
              <img
                alt="Champ de Maïs"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChXdbm-ZYg0o9_4ThzFK2rhRBhOL4UpexESjbX-m9-3gk7LHlQNlKK2vEphMFeXCN8x4QHdtOhM2_94t9lv2zl3W55mVZPmq9fdu7r-8ekAKYmyvdPHtSah5jgivnrfePu_kDWJ-LzDF-nTY-481IZKOeRIeBdOnjP1Iymx4lIgrI6DFv_bJyH5lv5h3zCm1t3D4-GhtNiStaMuQGcZW9hPQCp5zulGhS7KwB5xgWP1jwiwitWPh6xnh64zHD4f5G-RbhOhDkFwLQ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="bg-primary-container text-white px-3 py-1 rounded-full text-label-caps flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {culture.statut === 'en croissance' ? 'Croissance Optimale' : culture.statut}
                  </span>
                </div>
                <h1 className="font-h1 text-white text-2xl md:text-3xl font-extrabold">
                  Culture de {culture.nom} - Parcelle B3
                </h1>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/30">
                <h3 className="font-h3 text-on-surface mb-4">Fiche Technique</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant font-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        calendar_today
                      </span>
                      Date de semis
                    </span>
                    <span className="font-bold text-on-surface">
                      {formatSemisDate(culture.datePlantation)}
                    </span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant font-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        event_available
                      </span>
                      Récolte estimée
                    </span>
                    <span className="font-bold text-on-surface">
                      {getEstimatedHarvestDate(culture.datePlantation)}
                    </span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="text-on-surface-variant font-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        square_foot
                      </span>
                      Surface
                    </span>
                    <span className="font-bold text-on-surface">{culture.surface} ha</span>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-on-surface-variant font-body-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        location_on
                      </span>
                      Localisation
                    </span>
                    <span className="font-bold text-on-surface">
                      {user?.region || 'Bafoussam'}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary text-white rounded-xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[32px]">psychiatry</span>
                  <span className="font-h3">Santé Générale</span>
                </div>
                <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden mb-2">
                  <div className="bg-secondary-fixed h-full w-[88%]"></div>
                </div>
                <p className="text-label-caps text-white/80">88% - Aucune menace détectée</p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-b border-outline-variant mb-6 overflow-x-auto">
            <div className="flex space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('apercu')}
                className={`px-2 py-3 font-bold text-sm transition-all cursor-pointer ${
                  activeTab === 'apercu'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setActiveTab('recommandations')}
                className={`px-2 py-3 font-semibold text-sm transition-all cursor-pointer ${
                  activeTab === 'recommandations'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Recommandations
              </button>
              <button
                onClick={() => setActiveTab('historique')}
                className={`px-2 py-3 font-semibold text-sm transition-all cursor-pointer ${
                  activeTab === 'historique'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Historique
              </button>
              <button
                onClick={() => setActiveTab('alertes')}
                className={`px-2 py-3 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'alertes'
                    ? 'text-primary border-b-4 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                Alertes
                <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Aperçu (Bento Grid) */}
          {activeTab === 'apercu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Growth Cycle Timeline */}
              <div className="md:col-span-2 bg-surface-container rounded-xl p-6 border border-outline-variant/30">
                <h3 className="font-h2 text-primary mb-12 text-lg font-bold">Cycle de Croissance</h3>
                <div className="relative pt-8 pb-4">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-outline-variant -translate-y-1/2"></div>
                  <div
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500"
                    style={{ width: progressWidth }}
                  ></div>
                  <div className="relative flex justify-between">
                    {stages.map((stage, idx) => {
                      const isCompleted = idx < activeIndex;
                      const isActive = idx === activeIndex;

                      return (
                        <div key={stage} className="flex flex-col items-center relative">
                          {isActive ? (
                            <>
                              <div className="w-8 h-8 rounded-full bg-white border-4 border-primary shadow-lg z-25 flex items-center justify-center -mt-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                              </div>
                              <div className="absolute -top-12 bg-primary text-white px-3 py-1 rounded-lg text-[10px] whitespace-nowrap z-30 font-bold">
                                Étape actuelle
                              </div>
                            </>
                          ) : (
                            <div
                              className={`w-6 h-6 rounded-full border-4 border-white shadow-sm z-10 -mt-1 ${
                                isCompleted ? 'bg-primary' : 'bg-outline-variant'
                              }`}
                            ></div>
                          )}
                          <span
                            className={`font-label-caps mt-2 text-[10px] uppercase font-bold tracking-wider ${
                              isCompleted || isActive ? 'text-primary' : 'text-on-surface-variant opacity-50'
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Last Inspection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-h3 text-on-surface leading-tight">Dernière Inspection</h3>
                  <span className="material-symbols-outlined text-primary">fact_check</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-secondary-container">
                        visibility
                      </span>
                    </div>
                    <div>
                      <p className="font-label-caps text-on-surface-variant text-xs">Date</p>
                      <p className="font-bold text-sm">Hier, 16:45</p>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-lg italic text-xs text-on-surface-variant border-l-4 border-primary leading-relaxed">
                    "Vigoureuse croissance observée. Pas de signe de parasite. Humidité du sol
                    optimale suite aux pluies récentes."
                  </div>
                  <button className="w-full py-2.5 bg-primary-container text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-primary transition-all">
                    Voir le rapport complet
                  </button>
                </div>
              </div>

              {/* Conditions Graph */}
              <div className="lg:col-span-2 bg-surface-container rounded-xl p-6 border border-outline-variant/30 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-h2 text-on-surface text-base font-bold">
                    Conditions Environnementales
                  </h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                      Température
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
                      Humidité
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-h-[200px] flex items-end gap-4 pt-8 relative">
                  {/* Simulated Chart Y-axis */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant font-bold pr-2 border-r border-outline-variant">
                    <span>40°</span>
                    <span>30°</span>
                    <span>20°</span>
                    <span>10°</span>
                    <span>0°</span>
                  </div>
                  {/* Simulated Bars */}
                  <div className="flex-1 flex items-end justify-around h-full ml-8">
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[45%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[80%] rounded-t-sm"></div>
                    </div>
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[55%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[70%] rounded-t-sm"></div>
                    </div>
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[65%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[85%] rounded-t-sm"></div>
                    </div>
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[50%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[75%] rounded-t-sm"></div>
                    </div>
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[60%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[90%] rounded-t-sm"></div>
                    </div>
                    <div className="relative w-8 bg-primary/20 rounded-t-sm h-[70%] hover:bg-primary/40 transition-all cursor-pointer">
                      <div className="absolute bottom-0 w-full bg-primary h-[80%] rounded-t-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-around ml-8 mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mer</span>
                  <span>Jeu</span>
                  <span>Ven</span>
                  <span>Sam</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Pluviométrie
                    </p>
                    <p className="font-h2 text-primary text-xl font-bold">12 mm</p>
                    <p className="text-[11px] text-green-600 font-semibold">+2mm vs moy.</p>
                  </div>
                  <span className="material-symbols-outlined text-[40px] text-secondary-fixed">
                    water_drop
                  </span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Ensoleillement
                    </p>
                    <p className="font-h2 text-on-tertiary-fixed-variant text-xl font-bold">
                      8.5 h/j
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-semibold">
                      Conditions optimales
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[40px] text-tertiary">
                    wb_sunny
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Simple Tab Contents (Recommandations, Historique, Alertes) */}
          {activeTab === 'recommandations' && (
            <div className="bg-white p-8 rounded-xl border border-outline-variant/30 shadow-xs">
              <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">smart_toy</span>
                Recommandations d'irrigation et fertilisation
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Selon l'humidité du sol ({culture.surface > 2 ? 'critique' : 'optimale'}) et le type de culture ({culture.nom}), l'intelligence AgriNova vous propose les actions suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Arrosage préventif conseillé de la parcelle ce soir.</li>
                <li>Ajouter 50kg d'engrais organique avant la floraison.</li>
                <li>Prévoir la récolte à la maturité des épis de maïs estimée en Juillet.</li>
              </ul>
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="bg-white p-8 rounded-xl border border-outline-variant/30 shadow-xs space-y-4">
              <h3 className="font-bold text-lg text-primary">Historique des interventions</h3>
              <div className="border-l-2 border-primary-container pl-4 space-y-4 text-sm">
                <div>
                  <p className="font-bold text-gray-900">12 Mars 2024</p>
                  <p className="text-gray-500 text-xs">Semis et ameublissement de la parcelle.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">18 Mars 2024</p>
                  <p className="text-gray-500 text-xs">Premiers signes de germination visibles.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Hier, 16:45</p>
                  <p className="text-gray-500 text-xs">Inspection générale et relevés d'humidité.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alertes' && (
            <div className="bg-white p-8 rounded-xl border border-outline-variant/30 shadow-xs space-y-4">
              <h3 className="font-bold text-lg text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Alertes de Santé sur la Parcelle B3
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600">water_drop</span>
                  <div className="text-sm">
                    <p className="font-bold text-red-900">Baisse critique de l'humidité</p>
                    <p className="text-xs text-red-700">L'humidité du sol est descendue à 42% (seuil critique : 50%).</p>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600">bug_report</span>
                  <div className="text-sm">
                    <p className="font-bold text-amber-900">Humidité propice au mildiou</p>
                    <p className="text-xs text-amber-700">Risque modéré de mildiou dans la région cette semaine.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">
            Accueil
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1"
          href="/dashboard/cultures"
        >
          <span className="material-symbols-outlined">leaf_spark</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">
            Cultures
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/meteo"
        >
          <span className="material-symbols-outlined">wb_sunny</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">
            Météo
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">
            Marché
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/rapports"
        >
          <span className="material-symbols-outlined">assessment</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">
            Rapports
          </span>
        </Link>
      </nav>

      {/* Modal de modification de la culture */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-h3 text-lg font-bold text-on-surface">Modifier la culture</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {erreurModif && (
              <div className="bg-red-50 border border-red-200 text-error rounded-lg p-3 text-sm mb-4">
                {erreurModif}
              </div>
            )}

            <form onSubmit={handleModifier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Nom de la culture
                </label>
                <input
                  type="text"
                  name="nom"
                  value={editForm.nom}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Statut
                </label>
                <select
                  name="statut"
                  value={editForm.statut}
                  onChange={handleEditChange}
                  className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en croissance">En croissance</option>
                  <option value="en récolte">En récolte</option>
                  <option value="terminé">Terminé</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Surface (ha)
                  </label>
                  <input
                    type="number"
                    name="surface"
                    step="0.1"
                    value={editForm.surface}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Date de plantation
                  </label>
                  <input
                    type="date"
                    name="datePlantation"
                    value={editForm.datePlantation}
                    onChange={handleEditChange}
                    required
                    className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-surface-container text-on-surface font-bold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modification}
                  className="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 cursor-pointer"
                >
                  {modification ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <span className="material-symbols-outlined text-error text-5xl mb-3">warning</span>
            <h3 className="font-h3 text-lg font-bold text-on-surface mb-2">
              Supprimer cette culture ?
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Cette action est définitive. Toutes les données liées à{' '}
              <span className="font-bold">{culture.nom}</span> seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={suppression}
                className="flex-1 bg-surface-container text-on-surface font-bold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimer}
                disabled={suppression}
                className="flex-1 bg-error text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {suppression ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
