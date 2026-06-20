'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout, estConnecte } from '../../../lib/auth';
import { User } from '../../../types';
import Sidebar from '../../../components/Sidebar';

export default function WeatherPage() {
  const router = useRouter();

  // État de l'utilisateur connecté
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Vérification de connexion
    if (!estConnecte()) {
      router.push('/login');
      return;
    }
    setUser(getUser());
  }, []);

  return (
    <div className="bg-surface text-on-surface">
      {/* Sidebar (NavigationDrawer) */}
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen pb-24 md:pb-8">
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 w-full px-6 py-4 flex justify-between items-center bg-white border-b border-stone-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="md:hidden text-green-900 cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </Link>
            <h1 className="font-h2 text-green-900 text-xl font-bold">Météo & Prévisions</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border">
              <img
                alt="Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmRYDsaXRmUTprRtIrBWUUNcWPUJe3jXWwGecIcFc02USMNu-w2DQ1RWedZ-rmZXr3I0o2CbRyjT_TZ9z5Zm0z4VipJPT8ejLY2D2DzvdaOTO3EYHSXfsoK8vj-U9tf7lIP07SPdtvCbAC6XahRs8f_3I4jFHiswIo4UqH92K42XV73V-2rlTm-P3OG4U-i3DXf-sCQ-dNpPSFLD4dM9J0gftfAPXdluiDuUJpYQ2x3-8lGoGJj8RM3G369hWG_WKJsZFKcn5WuYg"
              />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Weather Card */}
            <section className="lg:col-span-8 bg-[#F1F3F0] rounded-[12px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden group border border-stone-200/50">
              <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <span className="material-symbols-outlined text-[200px]">wb_sunny</span>
              </div>
              <div className="relative z-10 w-full md:w-auto">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined">location_on</span>
                  <span className="font-h3 text-green-900 font-bold">
                    {user?.region || 'Bafoussam'}, Ouest
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-[80px] font-bold leading-none text-on-surface">24°</span>
                  <span className="text-2xl font-semibold mb-3 text-on-surface-variant">C</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="material-symbols-outlined text-4xl text-amber-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    partly_cloudy_day
                  </span>
                  <span className="text-xl font-semibold text-gray-800">
                    Partiellement nuageux
                  </span>
                </div>
              </div>
              <div className="mt-8 md:mt-0 grid grid-cols-2 gap-x-8 gap-y-4 relative z-10 border-t md:border-t-0 md:border-l border-stone-300 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
                <div className="flex flex-col">
                  <span className="text-label-caps text-stone-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">humidity_percentage</span>{' '}
                    HUMIDITÉ
                  </span>
                  <span className="font-bold text-lg text-gray-900">68%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-caps text-stone-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">air</span> VENT
                  </span>
                  <span className="font-bold text-lg text-gray-900">12 km/h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-caps text-stone-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">wb_sunny</span> UV INDEX
                  </span>
                  <span className="font-bold text-lg text-gray-900">Faible (3)</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-caps text-stone-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">rainy</span> PRÉCIP.
                  </span>
                  <span className="font-bold text-lg text-gray-900">2.4 mm</span>
                </div>
              </div>
            </section>

            {/* AI Advice Card */}
            <section className="lg:col-span-4 bg-primary-container text-white rounded-[12px] p-6 shadow-md flex flex-col justify-between border border-transparent">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h2 className="font-h3 text-white text-base font-bold">Conseils IA</h2>
                </div>
                <p className="text-white/90 mb-6 font-medium leading-relaxed text-sm">
                  Des précipitations modérées sont attendues demain soir. Reportez l'application
                  d'engrais sur vos parcelles de Maïs pour éviter le lessivage. Excellentes
                  conditions pour le repiquage des tomates ce matin.
                </p>
              </div>
              <button className="w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-stone-100 active:scale-95 transition-all cursor-pointer text-sm">
                Voir le plan d'action
              </button>
            </section>

            {/* 7-day Forecast */}
            <section className="lg:col-span-12 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0">
              <h2 className="font-h3 mb-4 text-green-900 font-bold text-base">
                Prévisions sur 7 jours
              </h2>
              <div className="flex gap-4 min-w-max">
                {/* Day 1 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Lun. 15</span>
                  <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">
                    wb_sunny
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">26°</span>
                    <span className="text-stone-500">18°</span>
                  </div>
                </div>
                {/* Day 2 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border-2 border-green-800 shadow-sm cursor-pointer relative">
                  <span className="font-bold text-primary mb-2 text-xs">Mar. 16</span>
                  <span className="material-symbols-outlined text-3xl text-blue-400 mb-2">
                    rainy
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">22°</span>
                    <span className="text-stone-500">16°</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-primary mt-2">
                    Demain
                  </span>
                </div>
                {/* Day 3 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Mer. 17</span>
                  <span className="material-symbols-outlined text-3xl text-amber-600 mb-2">
                    partly_cloudy_day
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">25°</span>
                    <span className="text-stone-500">17°</span>
                  </div>
                </div>
                {/* Day 4 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Jeu. 18</span>
                  <span className="material-symbols-outlined text-3xl text-stone-500 mb-2">
                    cloud
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">23°</span>
                    <span className="text-stone-500">15°</span>
                  </div>
                </div>
                {/* Day 5 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Ven. 19</span>
                  <span className="material-symbols-outlined text-3xl text-blue-500 mb-2">
                    thunderstorm
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">20°</span>
                    <span className="text-stone-500">14°</span>
                  </div>
                </div>
                {/* Day 6 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Sam. 20</span>
                  <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">
                    wb_sunny
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">27°</span>
                    <span className="text-stone-500">19°</span>
                  </div>
                </div>
                {/* Day 7 */}
                <div className="w-36 bg-[#F1F3F0] p-4 rounded-[12px] flex flex-col items-center border border-transparent hover:border-green-500 transition-all cursor-pointer">
                  <span className="font-bold text-stone-600 mb-2 text-xs">Dim. 21</span>
                  <span className="material-symbols-outlined text-3xl text-amber-500 mb-2">
                    sunny
                  </span>
                  <div className="flex gap-2 text-sm">
                    <span className="font-bold text-on-surface">28°</span>
                    <span className="text-stone-500">20°</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Impact Table Section */}
            <section className="lg:col-span-12">
              <div className="bg-white rounded-[12px] border border-stone-200 overflow-hidden shadow-xs">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                  <h2 className="font-h3 text-green-900 text-base font-bold">
                    Impact sur vos cultures
                  </h2>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>{' '}
                      Favorable
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>{' '}
                      Vigilance
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-6 py-4 font-bold text-stone-600 text-xs uppercase tracking-wider">
                          Culture
                        </th>
                        <th className="px-6 py-4 font-bold text-stone-600 text-xs uppercase tracking-wider">
                          Phase Actuelle
                        </th>
                        <th className="px-6 py-4 font-bold text-stone-600 text-xs uppercase tracking-wider">
                          État Météo
                        </th>
                        <th className="px-6 py-4 font-bold text-stone-600 text-xs uppercase tracking-wider">
                          Recommandation
                        </th>
                        <th className="px-6 py-4 font-bold text-stone-600 text-xs uppercase tracking-wider">
                          Favorabilité
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                      {/* Row 1 */}
                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href="/dashboard/cultures/mais" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                              <span className="material-symbols-outlined text-sm">grass</span>
                            </div>
                            <span className="font-bold text-gray-900">Maïs</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-stone-500">Floraison</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">rainy</span>{' '}
                            Pluies
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          Attendre après l'averse pour l'urée
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="material-symbols-outlined text-green-600 font-bold"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </td>
                      </tr>

                      {/* Row 2 */}
                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href="/dashboard/cultures/tomate" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-850">
                              <span className="material-symbols-outlined text-sm">nutrition</span>
                            </div>
                            <span className="font-bold text-gray-900">Tomate</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-stone-500">Fructification</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">
                              humidity_low
                            </span>{' '}
                            Humidité
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          Surveiller le mildiou (risques élevés)
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="material-symbols-outlined text-amber-500 font-bold"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            warning
                          </span>
                        </td>
                      </tr>

                      {/* Row 3 */}
                      <tr className="hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link href="/dashboard/cultures/cafe" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                              <span className="material-symbols-outlined text-sm">eco</span>
                            </div>
                            <span className="font-bold text-gray-900">Café</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-stone-500">Entretien</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">sunny</span>{' '}
                            Soleil
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          Taille recommandée ce matin
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="material-symbols-outlined text-green-600 font-bold"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-nunito text-[10px] font-medium uppercase tracking-wider mt-1">
            Accueil
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/cultures"
        >
          <span className="material-symbols-outlined">leaf_spark</span>
          <span className="font-nunito text-[10px] font-medium uppercase tracking-wider mt-1">
            Cultures
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1"
          href="/dashboard/meteo"
        >
          <span className="material-symbols-outlined">wb_sunny</span>
          <span className="font-nunito text-[10px] font-medium uppercase tracking-wider mt-1">
            Météo
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-nunito text-[10px] font-medium uppercase tracking-wider mt-1">
            Marché
          </span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard/rapports"
        >
          <span className="material-symbols-outlined">assessment</span>
          <span className="font-nunito text-[10px] font-medium uppercase tracking-wider mt-1">
            Rapports
          </span>
        </Link>
      </nav>
    </div>
  );
}
