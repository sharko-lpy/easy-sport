import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coaching Sportif",
  description: "Programmes d'entraînement et suivi de séances",
};

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
