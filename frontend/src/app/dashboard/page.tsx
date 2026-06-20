'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../lib/auth';
import { User, Culture } from '../../types';
import api from '../../lib/axios';
import Sidebar from '../../components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);

  // État des cultures de l'utilisateur
  const [cultures, setCultures] = useState<Culture[]>([]);

  // État de chargement des cultures
  const [chargement, setChargement] = useState(true);

  // États pour éviter le décalage d'hydratation (rendu client-side de la date et heure)
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    if (!estConnecte()) {
      router.push('/login');
      return;
    }

    // Récupère l'utilisateur depuis localStorage
    setUser(getUser());

    // Charge les cultures depuis l'API
    chargerCultures();

    // Génère la date et l'heure côté client
    const date = new Date();
    const formatOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('fr-FR', formatOptions);
    setDateStr(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));

    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setTimeStr(formattedTime);
  }, []);

  const chargerCultures = async () => {
    try {
      const response = await api.get<Culture[]>('/cultures');
      setCultures(response.data);
    } catch (err) {
      console.error('Erreur chargement cultures:', err);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      {/* NavigationDrawer Shell */}
      <Sidebar />

      {/* Main Canvas */}
      <main className="md:ml-72 min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-stone-100 cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="font-h2 text-h2 text-green-900">
                Bonjour, {user?.prenom || 'Mamadou'} 👋
              </h1>
              <p className="text-body-sm text-stone-500">
                {dateStr || 'Mardi, 24 Octobre 2023'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-green-800 p-0.5 cursor-pointer active:scale-95 duration-150">
              <img
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxNyxMXTjyXztYONzSXUYyW-RSU704WXzivTxZfpkJ8ntP0JGBC6ERPKnRloYDOccEMUp-0cdH8WMGQcfdOPGf5Q1S4hCWlrwTLxdjgZTyCv9Bm1zy8xzAFXan4iYuJ04oWJbXb9xYWkDxri0UL_qWhI38CIeUr90POgDkLPjEaMN9FGXe3VTEYOkf_8EdGa3IMs_SVHXy91bPO_1Jkva2pSLS6nPJAf-GKX4LR6qjdokkr8U2_hFosA7FZt7AOBC0VftAZ089OCc"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active crops KPI card */}
            <div className="bento-card p-5 border border-stone-200/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-green-100 text-green-800 rounded-lg material-symbols-outlined">
                  grass
                </span>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  +1 ce mois
                </span>
              </div>
              <p className="text-body-sm text-stone-500 mt-2">Cultures actives</p>
              <p className="text-h1 font-h1 text-green-900">
                {chargement ? '...' : cultures.length}
              </p>
            </div>

            {/* Critical alerts card */}
            <div className="bento-card p-5 border border-stone-200/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-red-100 text-red-800 rounded-lg material-symbols-outlined">
                  warning
                </span>
              </div>
              <p className="text-body-sm text-stone-500 mt-2">Alertes critiques</p>
              <p className="text-h1 font-h1 text-red-700">2</p>
            </div>

            {/* Next harvest card */}
            <div className="bento-card p-5 border border-stone-200/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-secondary-container text-on-secondary-container rounded-lg material-symbols-outlined">
                  event_upcoming
                </span>
              </div>
              <p className="text-body-sm text-stone-500 mt-2">Prochaine récolte</p>
              <p className="text-h1 font-h1 text-green-900">12j</p>
            </div>

            {/* Weather score card */}
            <div className="bento-card p-5 border border-stone-200/50 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-blue-100 text-blue-800 rounded-lg material-symbols-outlined">
                  show_chart
                </span>
              </div>
              <p className="text-body-sm text-stone-500 mt-2">Score météo</p>
              <div className="flex items-end gap-2">
                <p className="text-h1 font-h1 text-green-900">78</p>
                <p className="text-stone-400 pb-2">/100</p>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (65%) */}
            <div className="lg:col-span-8 space-y-6">
              {/* IA Recommendation Card */}
              <div className="relative overflow-hidden bento-card p-6 bg-primary-container text-white border-none">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                      <span className="material-symbols-outlined text-white">smart_toy</span>
                    </div>
                    <h3 className="font-h3 text-h3">Recommandation IA du jour</h3>
                  </div>
                  <p className="text-body-md opacity-90 mb-6 max-w-xl">
                    Les prévisions indiquent une baisse d'humidité demain. Nous vous conseillons
                    d'avancer l'irrigation de la parcelle B de 4 heures pour optimiser
                    l'absorption des nutriments du maïs.
                  </p>
                  <button className="bg-white text-green-900 px-6 py-3 rounded-xl font-bold hover:bg-stone-100 transition-colors flex items-center gap-2 active:scale-95 duration-150 cursor-pointer">
                    Appliquer le planning
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-400/10 rounded-full -mr-10 -mb-10 blur-2xl"></div>
              </div>

              {/* Growth Chart */}
              <div className="bento-card p-6 border border-stone-200/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-h3 text-h3 text-green-900">Santé de vos cultures ce mois</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-stone-200 rounded-md text-xs font-semibold text-stone-600 cursor-pointer">
                      Hebdo
                    </button>
                    <button className="px-3 py-1 bg-green-800 text-white rounded-md text-xs font-semibold cursor-pointer">
                      Mensuel
                    </button>
                  </div>
                </div>
                <div className="h-64 flex items-end justify-between gap-1 px-2 relative">
                  {/* Visual Chart Mockup */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-full h-full opacity-20"
                      preserveAspectRatio="none"
                      viewBox="0 0 400 100"
                    >
                      <path
                        d="M0,80 Q50,70 100,50 T200,60 T300,20 T400,30"
                        fill="none"
                        stroke="#1B5E20"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[30%] hover:bg-green-200 transition-all cursor-pointer"></div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[45%] hover:bg-green-200 transition-all cursor-pointer"></div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[40%] hover:bg-green-200 transition-all cursor-pointer"></div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[60%] hover:bg-green-200 transition-all cursor-pointer"></div>
                  <div className="flex-1 bg-green-800 rounded-t-sm h-[75%] shadow-lg shadow-green-900/20"></div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[70%] hover:bg-green-200 transition-all cursor-pointer"></div>
                  <div className="flex-1 bg-stone-200/50 rounded-t-sm h-[85%] hover:bg-green-200 transition-all cursor-pointer"></div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  <span>S1</span>
                  <span>S2</span>
                  <span>S3</span>
                  <span>S4</span>
                  <span>S5</span>
                  <span>S6</span>
                  <span>S7</span>
                </div>
              </div>
            </div>

            {/* Right Column (35%) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Weather Card */}
              <div className="bento-card bg-white border border-stone-200 p-6 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-h3 text-h3 text-green-900">
                      {user?.region || 'Bafoussam'}
                    </h3>
                    <p className="text-body-sm text-stone-500">Cameroun, {timeStr || '14:30'}</p>
                  </div>
                  <span
                    className="material-symbols-outlined text-4xl text-amber-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    wb_sunny
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl font-extrabold text-green-900">28°</span>
                  <div className="text-stone-400 text-sm">
                    <p>↑ 30°</p>
                    <p>↓ 22°</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 p-3 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">
                      humidity_percentage
                    </span>
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase font-bold">Humidité</p>
                      <p className="font-bold text-green-900">65%</p>
                    </div>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-stone-500">air</span>
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase font-bold">Vent</p>
                      <p className="font-bold text-green-900">12km/h</p>
                    </div>
                  </div>
                </div>
                {/* Decorative background image */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 rotate-12">
                  <span className="material-symbols-outlined text-[120px]">cloud</span>
                </div>
              </div>

              {/* Alerts List */}
              <div className="bento-card p-6 border border-stone-200/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-h3 text-h3 text-green-900">Alertes récentes</h3>
                  <button className="text-xs font-bold text-green-800 hover:underline cursor-pointer">
                    Voir tout
                  </button>
                </div>
                <div className="space-y-3">
                  {/* Alert 1 */}
                  <Link
                    href="/dashboard/cultures/mais"
                    className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-100 cursor-pointer hover:bg-red-100 transition-all block"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          water_drop
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-red-900">Irrigation critique</p>
                        <p className="text-xs text-red-700">Parcelle A - Maïs</p>
                      </div>
                      <span className="text-[10px] text-red-400 font-bold">Maintenant</span>
                    </div>
                  </Link>

                  {/* Alert 2 */}
                  <Link
                    href="/dashboard/cultures/cafe"
                    className="flex items-center gap-4 p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100 transition-all block"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          bug_report
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-amber-900">Risque de parasites</p>
                        <p className="text-xs text-amber-700">Parcelle C - Café</p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold">Il y a 2h</span>
                    </div>
                  </Link>

                  {/* Alert 3 */}
                  <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-10 h-10 bg-stone-200 rounded-lg flex items-center justify-center text-stone-500">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        inventory_2
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-stone-900">Engrais épuisé</p>
                      <p className="text-xs text-stone-500">Stock entrepôt</p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold">Hier</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link
          className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1"
          href="/dashboard"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            home
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Accueil</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/cultures"
        >
          <span className="material-symbols-outlined">leaf_spark</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Cultures</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/meteo"
        >
          <span className="material-symbols-outlined">wb_sunny</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Météo</span>
        </Link>
        <a
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="#"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Marché</span>
        </a>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/rapports"
        >
          <span className="material-symbols-outlined">assessment</span>
          <span className="text-[10px] font-medium uppercase tracking-wider mt-1">Rapports</span>
        </Link>
      </nav>

      {/* FAB for Desktop/Mobile */}
      <button
        onClick={() => router.push('/dashboard/cultures')}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 cursor-pointer"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}