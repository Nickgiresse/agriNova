import type { Metadata } from 'next';
import './globals.css';

// Métadonnées affichées dans l'onglet du navigateur
export const metadata: Metadata = {
  title: 'AgriNova',
  description: 'Plateforme intelligente d\'assistance agricole',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang="fr" car toute l'application est en français
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>{children}</body>
    </html>
  );
}