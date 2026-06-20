'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm font-plus-jakarta text-base font-bold">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">
            potted_plant
          </span>
          <span className="text-xl font-black text-green-900">AgriNova</span>
        </div>
        
        <nav className="hidden md:flex gap-8 items-center text-stone-600">
          <a className="text-green-700 font-bold hover:bg-stone-100 transition-colors px-3 py-2 rounded-lg" href="#">
            Accueil
          </a>
          <a className="hover:bg-stone-100 transition-colors px-3 py-2 rounded-lg" href="#features">
            Fonctionnalités
          </a>
          <a className="hover:bg-stone-100 transition-colors px-3 py-2 rounded-lg" href="#about">
            À propos
          </a>
          <a className="hover:bg-stone-100 transition-colors px-3 py-2 rounded-lg" href="#contact">
            Contact
          </a>
        </nav>
        
        <div className="flex gap-4 items-center">
          <Link
            href="/login"
            className="hidden md:block border-2 border-primary-container text-primary-container px-5 py-2 rounded-xl font-bold active:scale-95 duration-150 transition-all text-center"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="bg-primary-container text-on-primary px-5 py-2 rounded-xl font-bold active:scale-95 duration-150 transition-all shadow-md text-center"
          >
            S'inscrire
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Responsive Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col gap-6 font-bold text-lg border-b border-stone-200 shadow-lg animate-fade-in">
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="text-green-700 hover:bg-stone-50 p-3 rounded-lg"
            href="#"
          >
            Accueil
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="hover:bg-stone-50 p-3 rounded-lg text-stone-600"
            href="#features"
          >
            Fonctionnalités
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="hover:bg-stone-50 p-3 rounded-lg text-stone-600"
            href="#about"
          >
            À propos
          </a>
          <a
            onClick={() => setMobileMenuOpen(false)}
            className="hover:bg-stone-50 p-3 rounded-lg text-stone-600"
            href="#contact"
          >
            Contact
          </a>
          <div className="flex flex-col gap-4 mt-8 border-t border-stone-100 pt-6">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full border-2 border-primary-container text-primary-container py-3 rounded-xl font-bold text-center"
            >
              Se connecter
            </Link>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-secondary-container px-4 py-1.5 rounded-full mb-6">
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="text-label-caps text-on-secondary-fixed-variant uppercase">
                  Disponible en français
                </span>
              </div>
              <h1 className="font-h1 text-h1 md:text-[56px] md:leading-[1.1] text-primary mb-6">
                Cultivez mieux grâce à l'intelligence artificielle
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mb-8 text-lg">
                Optimisez vos rendements agricoles avec des conseils personnalisés, des prévisions météo précises et un suivi rigoureux de vos cultures, conçu spécifiquement pour les agriculteurs camerounais.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 shadow-lg active:scale-95 duration-150 transition-all text-center"
                >
                  Commencer gratuitement
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-secondary-fixed/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-primary-fixed/20 rounded-full blur-3xl"></div>
              <div className="relative bg-white/40 backdrop-blur-sm p-4 rounded-[32px] shadow-xl border border-white/50">
                <img
                  alt="Agriculteur"
                  className="rounded-[24px] w-full h-[450px] object-cover shadow-inner"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyGh6gs_GKk_ZfGnAioTDgOHMUm6OwXmxPC2qcZfBF_Nhb-I68xcD9k5Opu3UQRIM6SL1aIDJ42W6_T_5uy0QTmI6jAboqQMyPcdqL59dZLAjOCQoLvH4ptDnWamnfK5ny4Umy1ztlItmqXh8wQYhYeW6wSwVXFaWXkBoRynUZ0cGlZlNxSK4Kh8lcwfyIPUDMl4djOwVDx57fe5vJLgDmdn0R10HVCcWLdK7T9c6_nqpVTpJhH8CR4y0h9_ggR_0HpDI3fVh0wMA"
                />
                {/* Floating Card Over Image */}
                <div className="absolute -bottom-6 -right-6 md:right-10 bg-white p-4 rounded-2xl shadow-xl border border-surface-container flex items-center gap-4 animate-bounce">
                  <div className="bg-green-100 p-3 rounded-full">
                    <span className="material-symbols-outlined text-green-700">trending_up</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase">Rendement Prévu</p>
                    <p className="text-lg font-black text-primary">+24% cette saison</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-primary-container py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8 md:gap-4 text-center">
            <div className="flex flex-col items-center min-w-[150px]">
              <span className="text-h1 text-secondary-fixed font-black">500+</span>
              <span className="text-label-caps text-on-primary-container opacity-80 uppercase tracking-widest">
                agriculteurs
              </span>
            </div>
            <div className="flex flex-col items-center min-w-[150px]">
              <span className="text-h1 text-secondary-fixed font-black">12</span>
              <span className="text-label-caps text-on-primary-container opacity-80 uppercase tracking-widest">
                cultures
              </span>
            </div>
            <div className="flex flex-col items-center min-w-[150px]">
              <span className="text-h1 text-secondary-fixed font-black">98%</span>
              <span className="text-label-caps text-on-primary-container opacity-80 uppercase tracking-widest">
                satisfaction
              </span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-h2 text-h2 text-primary mb-4">Des outils puissants pour votre terre</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour passer d'une agriculture traditionnelle à une exploitation connectée et rentable.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-surface-container-lowest p-8 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-high transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-700 text-3xl">psychology</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-4">🌱 Conseils personnalisés</h3>
                <p className="font-body-md text-on-surface-variant">
                  L'IA analyse vos sols et vos cultures pour vous donner des recommandations spécifiques sur l'arrosage et les engrais.
                </p>
              </div>
              {/* Feature Card 2 */}
              <div className="bg-surface-container-lowest p-8 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-high transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-blue-700 text-3xl">partly_cloudy_day</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-4">🌦️ Prévisions climatiques</h3>
                <p className="font-body-md text-on-surface-variant">
                  Anticipez les pluies et les périodes de sécheresse grâce à des prévisions locales ultra-précises en temps réel.
                </p>
              </div>
              {/* Feature Card 3 */}
              <div className="bg-surface-container-lowest p-8 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-surface-container-high transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-orange-700 text-3xl">monitoring</span>
                </div>
                <h3 className="font-h3 text-h3 text-primary mb-4">📊 Suivi de cultures</h3>
                <p className="font-body-md text-on-surface-variant">
                  Gardez un historique complet de vos parcelles et surveillez la croissance de vos plantations étape par étape.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-primary-container rounded-[40px] p-12 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px',
                }}
              ></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Prêt à transformer votre récolte ?</h2>
              <p className="text-on-primary-container text-lg opacity-90">Rejoignez des centaines d'agriculteurs qui font déjà confiance à AgriNova.</p>
            </div>
            <div className="relative z-10">
              <Link
                href="/register"
                className="bg-secondary-fixed text-primary px-10 py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl inline-block text-center cursor-pointer"
              >
                S'inscrire Maintenant
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-300 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary-fixed text-3xl">potted_plant</span>
              <span className="text-2xl font-black text-white">AgriNova</span>
            </div>
            <p className="text-sm text-stone-400">
              La technologie au service de la terre africaine. Innovons ensemble pour un avenir durable.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Liens Rapides</h4>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Accueil</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#features">Fonctionnalités</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Témoignages</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Tarifs</a></li>
            </ul>
          </div>
          <div id="about">
            <h4 className="text-white font-bold mb-6">Ressources</h4>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Guide de l'Agriculteur</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Centre d'aide</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">API</a></li>
              <li><a className="hover:text-secondary-fixed transition-colors" href="#">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-stone-500">mail</span>
                contact@agrinova.cm
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-stone-500">call</span>
                +237 600 000 000
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-stone-500">location_on</span>
                Yaoundé, Cameroun
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-stone-800 mt-16 pt-8 text-center text-xs text-stone-500">
          © 2024 AgriNova Pro. Tous droits réservés. L'excellence agricole par l'IA.
        </div>
      </footer>

      {/* Bottom Navigation (Mobile Only Filter Rule Applied) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-green-900 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] rounded-t-lg">
        <Link
          className="flex flex-col items-center justify-center text-green-400 bg-green-800/50 rounded-xl px-3 py-1"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">Accueil</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">leaf_spark</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">Cultures</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">wb_sunny</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">Météo</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">Marché</span>
        </Link>
        <Link
          className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-all"
          href="/dashboard"
        >
          <span className="material-symbols-outlined">assessment</span>
          <span className="font-plus-jakarta text-[10px] font-medium uppercase tracking-wider">Rapports</span>
        </Link>
      </nav>
    </div>
  );
}