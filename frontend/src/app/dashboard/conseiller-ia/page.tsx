'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../lib/auth';
import { User } from '../../../types';
import Sidebar from '../../../components/Sidebar';

interface Recommendation {
  id: string;
  priority: 'URGENT' | 'NORMAL' | 'INFO';
  time: string;
  title: string;
  description: string;
  crop: string;
  parcel: string;
  actionText: string;
}

export default function ConseillerIaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // States
  const [priorityFilter, setPriorityFilter] = useState('Toutes les priorités');
  const [cropFilter, setCropFilter] = useState('Toutes les cultures');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOuvert, setMobileMenuOuvert] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Initial list of recommendations
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec1',
      priority: 'URGENT',
      time: 'Il y a 2h',
      title: 'Alerte Mildiou détectée ⚠️',
      description: 'Les conditions météo actuelles (humidité 85%) favorisent la propagation du mildiou sur votre parcelle Nord. Une application de fongicide est recommandée sous 24h.',
      crop: 'MAÏS',
      parcel: 'Parcelle B3',
      actionText: 'Appliquer'
    },
    {
      id: 'rec2',
      priority: 'NORMAL',
      time: 'Il y a 5h',
      title: "Optimisation de l'irrigation",
      description: "L'évapotranspiration est élevée aujourd'hui. Augmentez l'apport en eau de 15% sur la culture de café pour éviter le stress hydrique.",
      crop: 'CAFÉ',
      parcel: 'Secteur Est',
      actionText: 'Programmer'
    },
    {
      id: 'rec3',
      priority: 'INFO',
      time: 'Hier',
      title: 'Fenêtre de récolte idéale',
      description: "L'analyse satellite indique que le manioc de la parcelle A1 a atteint sa maturité optimale. Prévoyez la récolte entre le 12 et le 15 du mois.",
      crop: 'MANIOC',
      parcel: 'Parcelle A1',
      actionText: 'Ajouter au calendrier'
    },
    {
      id: 'rec4',
      priority: 'NORMAL',
      time: 'Hier',
      title: 'Apport azoté recommandé',
      description: 'Le cycle de croissance actuel du maïs nécessite un renforcement en nutriments. Appliquez l\'engrais type NPK 15-15-15 avant la prochaine pluie prévue.',
      crop: 'MAÏS',
      parcel: 'Parcelle B2',
      actionText: 'Appliquer'
    },
    {
      id: 'rec5',
      priority: 'URGENT',
      time: 'Il y a 1 jour',
      title: 'Alerte de gel imminent',
      description: 'Une baisse soudaine de température à 4°C est prévue cette nuit. Protégez vos jeunes plants de tomate sous serre.',
      crop: 'TOMATE',
      parcel: 'Zone Ouest B',
      actionText: 'Appliquer'
    },
    {
      id: 'rec6',
      priority: 'NORMAL',
      time: 'Il y a 2 jours',
      title: 'Planification du désherbage',
      description: 'La densité des adventices augmente dans la parcelle Sud-Est. Un désherbage mécanique ciblé préservera les nutriments du sol.',
      crop: 'CACAO',
      parcel: 'Zone Sud-Est',
      actionText: 'Programmer'
    },
    {
      id: 'rec7',
      priority: 'INFO',
      time: 'Il y a 3 jours',
      title: "Analyse d'humidité du sol",
      description: "Les capteurs de la zone Nord A indiquent un taux d'humidité parfait de 65%. L'irrigation peut être suspendue aujourd'hui.",
      crop: 'MAÏS',
      parcel: 'Zone Nord A',
      actionText: 'Ajouter au calendrier'
    },
    {
      id: 'rec8',
      priority: 'NORMAL',
      time: 'Il y a 4 jours',
      title: 'Taille des caféiers recommandée',
      description: 'La saison de croissance est propice à la taille de rajeunissement des caféiers âgés pour stimuler les nouvelles pousses.',
      crop: 'CAFÉ',
      parcel: 'Secteur Est',
      actionText: 'Programmer'
    }
  ]);

  useEffect(() => {
    if (!estConnecte()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
  }, []);

  // Trigger Toast Helper
  const showToast = (message: string, type: 'success' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Actualiser Refresh Handler
  const handleActualiser = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Recommandations IA synchronisées avec succès.', 'success');
      // Reset layout and filter states
      setCurrentPage(1);
    }, 1000);
  };

  // Perform action on card
  const handleAction = (id: string, actionName: string, title: string) => {
    showToast(`Action "${actionName}" exécutée pour: ${title}`, 'success');
    // Remove the card from list
    setAllRecommendations(prev => prev.filter(item => item.id !== id));
  };

  // Ignore/dismiss card
  const handleIgnorer = (id: string, title: string) => {
    showToast(`Recommandation ignorée: ${title}`, 'info');
    // Remove card
    setAllRecommendations(prev => prev.filter(item => item.id !== id));
  };

  // Filter Logic
  const filteredRecs = allRecommendations.filter((item) => {
    // Priority filter
    if (priorityFilter !== 'Toutes les priorités') {
      const targetPriority = priorityFilter.toUpperCase();
      if (item.priority !== targetPriority) return false;
    }

    // Crop filter
    if (cropFilter !== 'Toutes les cultures') {
      if (item.crop.toLowerCase() !== cropFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Pagination Logic
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredRecs.length / itemsPerPage);
  
  // Guard page limits on list filter updates
  const validCurrentPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
  
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const displayedRecs = filteredRecs.slice(startIndex, startIndex + itemsPerPage);

  const getPriorityClasses = (priority: 'URGENT' | 'NORMAL' | 'INFO') => {
    switch (priority) {
      case 'URGENT':
        return 'bg-error-container text-on-error-container';
      case 'NORMAL':
        return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'INFO':
        return 'bg-secondary-container text-on-secondary-container';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold ${
            toast.type === 'success' ? 'bg-green-800 text-white' : 'bg-stone-800 text-white'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            {toast.message}
          </div>
        </div>
      )}

      {/* Navigation Drawer Mobile */}
      {mobileMenuOuvert && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
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
                className="flex items-center gap-3 p-3 rounded-lg bg-green-100 text-green-900 border-l-4 border-green-800 font-semibold text-sm transition-all"
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


      {/* Main Canvas Area */}
      <main className="flex-1 md:ml-72 flex flex-col min-h-screen pb-24 md:pb-8">
        
        {/* TopAppBar */}
        <header className="sticky top-0 z-45 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 shadow-xs">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOuvert(true)} className="md:hidden text-green-900 p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-plus-jakarta text-base font-bold text-green-900 uppercase tracking-wide">Conseiller IA</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
              notifications
            </button>
            <img
              alt="Photo de profil de l'agriculteur"
              className="w-10 h-10 rounded-full border-2 border-green-800 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7qMwp3vCbIZfdQE4ztlkI04-oTSeGA5kgGF7TFvTXSMyvvc8rvK-vRB02rBMzvqVdxCoxn4_FN0Egz2kfY_Sq0bnbQkA0QoIwSPYihXhgi_uJ8oaNXReHNFzmVd18B9SxbawLaNaZiG6BTDEeYXS5-kVqz_jNaMY2aSLdjbFi7N8fJkLJXUm0yWuLxsljTti76NOyW8M8j3dVTuzDLYndAj8sviqgyjhTrkOcRZvoxIO8gS15QqoMy0Pb8N1LS8k5v7tq-dGvpDQ"
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-green-900 font-h1">Recommandations IA</h2>
                <p className="text-xs text-stone-500 mt-1">Optimisez votre rendement grâce à nos analyses en temps réel.</p>
              </div>
              <button
                onClick={handleActualiser}
                disabled={refreshing}
                className="self-start sm:self-auto bg-green-900 text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-800 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <span className={`material-symbols-outlined text-[16px] ${refreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>

            {/* Filters Section */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-xs border border-stone-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Priorité</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-outline-variant bg-surface rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                >
                  <option value="Toutes les priorités">Toutes les priorités</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Normal">Normal</option>
                  <option value="Info">Info</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Culture</label>
                <select
                  value={cropFilter}
                  onChange={(e) => {
                    setCropFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full border border-outline-variant bg-surface rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                >
                  <option value="Toutes les cultures">Toutes les cultures</option>
                  <option value="Maïs">Maïs</option>
                  <option value="Manioc">Manioc</option>
                  <option value="Cacao">Cacao</option>
                  <option value="Café">Café</option>
                  <option value="Tomate">Tomate</option>
                </select>
              </div>
              <div className="flex items-end justify-start sm:justify-end pb-1.5">
                <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  {filteredRecs.length} recommandation{filteredRecs.length > 1 ? 's' : ''} active{filteredRecs.length > 1 ? 's' : ''}
                </span>
              </div>
            </section>

            {/* Recommendations Grid */}
            {displayedRecs.length > 0 ? (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white p-5 rounded-xl border border-stone-200 flex flex-col justify-between shadow-xs transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom duration-300"
                  >
                    <div>
                      {/* Priority Tag & Time */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getPriorityClasses(rec.priority)}`}>
                          {rec.priority}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          {rec.time}
                        </span>
                      </div>

                      {/* Header Title */}
                      <h3 className="font-plus-jakarta text-sm font-bold text-stone-900 mb-2">
                        {rec.title}
                      </h3>

                      {/* Description Body */}
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">
                        {rec.description}
                      </p>
                    </div>

                    <div>
                      {/* Crop & Parcel Tags */}
                      <div className="flex items-center gap-2 mb-5">
                        <span className="bg-green-100 text-green-950 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide">
                          {rec.crop}
                        </span>
                        <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg text-[9px] font-semibold">
                          {rec.parcel}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAction(rec.id, rec.actionText, rec.title)}
                          className="flex-1 bg-green-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-green-800 transition-all cursor-pointer shadow-xs text-center"
                        >
                          {rec.actionText}
                        </button>
                        <button
                          onClick={() => handleIgnorer(rec.id, rec.title)}
                          className="flex-1 border border-stone-300 text-stone-700 font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer text-center"
                        >
                          Ignorer
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </section>
            ) : (
              <section className="bg-white rounded-xl border border-stone-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined text-green-800 text-5xl">check_circle</span>
                <h3 className="font-plus-jakarta text-sm font-bold text-stone-900">Aucune recommandation active</h3>
                <p className="text-xs text-stone-500 max-w-sm">Tout semble en ordre ! Ajustez vos filtres ou cliquez sur Actualiser pour vérifier de nouvelles analyses.</p>
              </section>
            )}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="mt-8 border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                Affichage de {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRecs.length)} sur {filteredRecs.length} recommandations
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validCurrentPage === 1}
                  className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                      validCurrentPage === idx + 1
                        ? 'bg-green-900 text-white shadow-xs'
                        : 'border border-stone-300 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}

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
        <Link className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1.5" href="/dashboard/conseiller-ia">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">IA</span>
        </Link>
      </nav>

    </div>
  );
}
