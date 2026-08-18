import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coaching Sportif",
  description: "Programmes d'entraînement et suivi de séances",
};

// Toutes les pages lisent des données Supabase propres à l'utilisateur
// connecté (session, profil, programmes...) : on désactive le cache de
// rendu de Next.js pour que chaque visite recharge des données à jour.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
