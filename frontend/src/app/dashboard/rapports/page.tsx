'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../lib/auth';
import { User } from '../../../types';
import Sidebar from '../../../components/Sidebar';

interface HarvestItem {
  id: string;
  date: string;
  culture: string;
  parcelle: string;
  rendement: number; // en tonnes
  statut: 'Finalisé' | 'En cours';
  valeur: number; // en FCFA
}

export default function ReportsPage() {
  const router = useRouter();

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);

  // États des filtres
  const [periode, setPeriode] = useState('Ce mois');
  const [cultureFiltre, setCultureFiltre] = useState('Toutes les cultures');
  const [parcelleFiltre, setParcelleFiltre] = useState('Toutes les zones');

  // Menu mobile ouvert/fermé
  const [mobileMenuOuvert, setMobileMenuOuvert] = useState(false);

  // Données initiales des récoltes
  const [recoltes, setRecoltes] = useState<HarvestItem[]>([
    {
      id: 'h1',
      date: '12 Oct 2024',
      culture: 'Maïs Doux',
      parcelle: 'Zone Nord A',
      rendement: 4.2,
      statut: 'Finalisé',
      valeur: 840000,
    },
    {
      id: 'h2',
      date: '08 Oct 2024',
      culture: 'Manioc',
      parcelle: 'Vallée Sud',
      rendement: 12.8,
      statut: 'Finalisé',
      valeur: 1250000,
    },
    {
      id: 'h3',
      date: '05 Oct 2024',
      culture: 'Cacao',
      parcelle: 'Zone Sud-Est',
      rendement: 0.8,
      statut: 'En cours',
      valeur: 1100000,
    },
    {
      id: 'h4',
      date: '28 Sep 2024',
      culture: 'Maïs Doux',
      parcelle: 'Zone Nord B',
      rendement: 3.9,
      statut: 'Finalisé',
      valeur: 780000,
    },
  ]);

  // Données filtrées affichées
  const [recoltesFiltrees, setRecoltesFiltrees] = useState<HarvestItem[]>([]);

  useEffect(() => {
    // Vérification de la connexion
    if (!estConnecte()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
    setRecoltesFiltrees(recoltes);
  }, []);

  // Fonction de filtrage sur clic du bouton "Appliquer"
  const appliquerFiltres = () => {
    let result = [...recoltes];

    // Filtre par culture
    if (cultureFiltre !== 'Toutes les cultures') {
      result = result.filter((item) =>
        item.culture.toLowerCase().includes(cultureFiltre.toLowerCase())
      );
    }

    // Filtre par parcelle/zone
    if (parcelleFiltre !== 'Toutes les zones') {
      result = result.filter((item) =>
        item.parcelle.toLowerCase().includes(parcelleFiltre.toLowerCase())
      );
    }

    setRecoltesFiltrees(result);
  };

  // Exporter la liste des récoltes filtrées en format CSV
  const exporterCSV = () => {
    const entetes = ['Date', 'Culture', 'Parcelle', 'Rendement (t)', 'Statut', 'Valeur (FCFA)'];
    const lignes = recoltesFiltrees.map((r) => [
      r.date,
      r.culture,
      r.parcelle,
      r.rendement.toString(),
      r.statut,
      r.valeur.toString(),
    ]);

    // Génération de la chaîne CSV
    const csvContent =
      '\ufeff' + // Ajout du BOM UTF-8 pour supporter les accents dans Excel
      [entetes.join(';'), ...lignes.map((l) => l.join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.setAttribute('href', url);
    lien.setAttribute(
      'download',
      `agrinova_rapport_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
  };

  // Exporter en PDF via impression du navigateur configurée
  const exporterPDF = () => {
    window.print();
  };

  // Formater les montants en FCFA
  const formaterDevise = (montant: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    })
      .format(montant)
      .replace('FCFA', 'FCFA')
      .replace('XAF', 'FCFA');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row print:bg-white print:text-black">
      
      {/* Menu mobile (Drawer) */}
      {mobileMenuOuvert && (
        <div className="md:hidden fixed inset-0 z-50 flex print:hidden animate-in fade-in duration-200">
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
                className="flex items-center gap-3 p-3 rounded-lg bg-green-100 text-green-900 border-l-4 border-green-800 font-semibold text-sm transition-all"
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
        <header className="sticky top-0 z-40 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 print:hidden shadow-xs">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOuvert(true)} className="md:hidden text-green-900 p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-plus-jakarta text-base font-bold text-green-900 uppercase tracking-wide">Rapports & Statistiques</h1>
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
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Filters Section (No print) */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-stone-250 print:hidden">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Période</label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full border border-outline-variant bg-surface rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="Cette semaine">Cette semaine</option>
                <option value="Ce mois">Ce mois</option>
                <option value="Cette année">Cette année</option>
                <option value="Archive 2023">Archive 2023</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Culture</label>
              <select
                value={cultureFiltre}
                onChange={(e) => setCultureFiltre(e.target.value)}
                className="w-full border border-outline-variant bg-surface rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="Toutes les cultures">Toutes les cultures</option>
                <option value="Maïs">Maïs</option>
                <option value="Manioc">Manioc</option>
                <option value="Cacao">Cacao</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Parcelle</label>
              <select
                value={parcelleFiltre}
                onChange={(e) => setParcelleFiltre(e.target.value)}
                className="w-full border border-outline-variant bg-surface rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="Toutes les zones">Toutes les zones</option>
                <option value="Zone Nord">Zone Nord</option>
                <option value="Zone Sud-Est">Zone Sud-Est</option>
                <option value="Vallée Sud">Vallée Sud</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={appliquerFiltres}
                className="w-full bg-primary-container text-white py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                Appliquer
              </button>
            </div>
          </section>

          {/* Bento Chart Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Line Chart: Rendement Evolution (Wide) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-stone-200/60 flex flex-col shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">Évolution des Rendements</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Progression mensuelle en tonnes / hectare</p>
                </div>
                <span className="text-secondary text-xs font-bold bg-secondary-container/20 px-2 py-1 rounded-md">+12% vs 2023</span>
              </div>
              
              {/* Visual chart bars and lines */}
              <div className="flex-1 flex items-end justify-between relative px-2 min-h-[220px]">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,10"
                      fill="none"
                      stroke="#1b5e20"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="flex items-end justify-around h-48 border-b border-stone-200/50 pb-2">
                    <div className="w-10 bg-secondary-container h-[50%] rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">2.1t</span>
                    </div>
                    <div className="w-10 bg-secondary-container h-[60%] rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">2.5t</span>
                    </div>
                    <div className="w-10 bg-primary-container h-[75%] rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">3.2t</span>
                    </div>
                    <div className="w-10 bg-secondary-container h-[55%] rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">2.3t</span>
                    </div>
                    <div className="w-10 bg-secondary-container h-[85%] rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">3.8t</span>
                    </div>
                    <div className="w-10 bg-primary h-full rounded-t-lg relative group transition-all duration-300 hover:opacity-85 cursor-pointer animate-in slide-in-from-bottom duration-500">
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded shadow-md hidden group-hover:block font-bold">4.5t</span>
                    </div>
                  </div>
                  <div className="flex justify-around text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-wider">
                    <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donut: Distribution (Side) */}
            <div className="lg:col-span-4 bg-primary-container text-white p-6 rounded-xl flex flex-col shadow-md overflow-hidden relative">
              <div className="relative z-10 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wide">Répartition Cultures</h3>
                <p className="text-xs text-white/80 mt-0.5">Part de surface occupée</p>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="w-40 h-40 rounded-full border-[14px] border-secondary-container flex items-center justify-center relative shadow-inner">
                  <div className="absolute inset-0 border-[14px] border-white/20 rounded-full clip-path-donut" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
                  <div className="text-center">
                    <p className="text-3xl font-black">240</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/85">Hectares</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 relative z-10 text-[10px] font-bold uppercase tracking-wider border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                  <span>Maïs (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                  <span>Cacao (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30"></span>
                  <span>Manioc (15%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim"></span>
                  <span>Autre (10%)</span>
                </div>
              </div>
            </div>

            {/* Bar Chart: Performance per Sector (Bottom Small) */}
            <div className="lg:col-span-12 bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">Performance par Parcelle</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Prévu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-container inline-block"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Réel</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Sector 1 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-stone-600">Zone Nord A</div>
                  <div className="col-span-9 sm:col-span-10 flex items-center h-4 rounded-full bg-stone-100 overflow-hidden relative shadow-inner">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: '75%' }}></div>
                    <div className="h-full bg-secondary-container transition-all duration-500" style={{ width: '15%' }}></div>
                  </div>
                </div>

                {/* Sector 2 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-stone-600">Zone Nord B</div>
                  <div className="col-span-9 sm:col-span-10 flex items-center h-4 rounded-full bg-stone-100 overflow-hidden relative shadow-inner">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: '60%' }}></div>
                    <div className="h-full bg-secondary-container transition-all duration-500" style={{ width: '30%' }}></div>
                  </div>
                </div>

                {/* Sector 3 */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3 sm:col-span-2 text-[10px] font-bold uppercase tracking-wider text-stone-600">Vallée Sud</div>
                  <div className="col-span-9 sm:col-span-10 flex items-center h-4 rounded-full bg-stone-100 overflow-hidden relative shadow-inner">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: '85%' }}></div>
                    <div className="h-full bg-secondary-container transition-all duration-500" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* Summary Table Section */}
          <section className="bg-white rounded-xl shadow-sm border border-stone-200/80 overflow-hidden">
            <div className="p-6 border-b border-stone-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">Détail des Récoltes</h3>
              <div className="flex gap-2">
                <button
                  onClick={exporterPDF}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-outline-variant rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  Exporter PDF
                </button>
                <button
                  onClick={exporterCSV}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-secondary-fixed text-on-secondary-fixed rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">csv</span>
                  Exporter CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Culture</th>
                    <th className="px-6 py-4">Parcelle</th>
                    <th className="px-6 py-4">Rendement (t)</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Valeur Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recoltesFiltrees.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/50 transition-colors font-medium text-stone-800">
                      <td className="px-6 py-4">{r.date}</td>
                      <td className="px-6 py-4 font-bold text-stone-900">{r.culture}</td>
                      <td className="px-6 py-4">{r.parcelle}</td>
                      <td className="px-6 py-4 font-semibold">{r.rendement}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          r.statut === 'Finalisé'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-tertiary-container text-on-tertiary-container'
                        }`}>
                          {r.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-stone-900">{formaterDevise(r.valeur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-stone-50 text-center border-t border-stone-100 print:hidden">
              <button className="text-primary font-bold text-xs uppercase tracking-wider hover:underline cursor-pointer">
                Voir les 24 autres entrées
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Bottom Navigation Bar for Mobile (No print) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg print:hidden">
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
        <Link className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1.5" href="/dashboard/rapports">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>assessment</span>
          <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Rapports</span>
        </Link>
      </nav>

    </div>
  );
}
