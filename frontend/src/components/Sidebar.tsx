'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface UserData {
  prenom?: string;
  nom?: string;
  region?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      router.push('/login');
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) => {
    const base = 'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all';
    const active = 'bg-green-100 text-green-900 border-l-4 border-green-800';
    const inactive = 'text-stone-500 hover:bg-stone-200';
    return `${base} ${isActive(href) ? active : inactive}`;
  };

  const displayName = user
    ? `${user.prenom || ''} ${user.nom || ''}`.trim() || 'AgriNova Pro'
    : 'AgriNova Pro';

  const displayRegion = `Exploitation ${user?.region || 'Bafoussam'}`;

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 bg-stone-50 border-r border-stone-200 p-6 z-40">
      {/* Logo */}
      <div className="text-2xl font-black text-green-900 mb-8 font-h1">AgriNova</div>

      {/* Profil */}
      <div className="flex items-center space-x-3 mb-8 p-3 rounded-xl bg-surface-container">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-base">person</span>
        </div>
        <div>
          <p className="text-body-sm text-green-900 font-semibold leading-tight">{displayName}</p>
          <p className="text-[12px] text-stone-500 uppercase tracking-tight">{displayRegion}</p>
        </div>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className={linkClass('/dashboard')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span>Tableau de bord</span>
        </Link>
        <Link href="/dashboard/cultures" className={linkClass('/dashboard/cultures')}>
          <span
            className="material-symbols-outlined"
            style={isActive('/dashboard/cultures') ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            potted_plant
          </span>
          <span>Mes Parcelles</span>
        </Link>
        <Link href="/dashboard/meteo" className={linkClass('/dashboard/meteo')}>
          <span className="material-symbols-outlined">wb_sunny</span>
          <span>Météo & Prévisions</span>
        </Link>
        <Link href="/dashboard/conseiller-ia" className={linkClass('/dashboard/conseiller-ia')}>
          <span className="material-symbols-outlined">smart_toy</span>
          <span>Conseiller IA</span>
        </Link>
        <Link href="/dashboard/rapports" className={linkClass('/dashboard/rapports')}>
          <span className="material-symbols-outlined">assessment</span>
          <span>Rapports</span>
        </Link>
      </nav>

      {/* Séparateur + Nav bas */}
      <div className="mt-auto pt-6 border-t border-stone-200 space-y-1">
        <Link href="/dashboard/settings" className={linkClass('/dashboard/settings')}>
          <span className="material-symbols-outlined">settings</span>
          <span>Paramètres</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all text-error hover:bg-red-50 text-left cursor-pointer"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
