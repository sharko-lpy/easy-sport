# Coaching Sportif

App de coaching sportif : un coach crée des programmes d'entraînement,
les assigne à ses athlètes, et chaque athlète suit ses séances et
enregistre sa progression.

Stack : [Next.js](https://nextjs.org) (App Router) + [Supabase](https://supabase.com)
(base de données, authentification), déployée sur [Vercel](https://vercel.com).

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigne tes clés Supabase
npm run dev
```

L'app tourne sur http://localhost:3000.

## Base de données

Le schéma complet (tables + sécurité au niveau des lignes) se trouve dans
[`supabase/schema.sql`](./supabase/schema.sql). À exécuter une fois dans
Supabase > SQL Editor sur un projet neuf.

## Déploiement

Voir [`DEPLOIEMENT.md`](./DEPLOIEMENT.md) pour le guide pas à pas
(GitHub → Supabase → Vercel).
