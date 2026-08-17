# Guide de déploiement — GitHub → Supabase → Vercel

## 1. Pousser le code sur GitHub

1. Crée un nouveau dépôt vide sur [github.com/new](https://github.com/new)
   (ne coche ni README, ni .gitignore, ni licence — le projet les a déjà).
2. Dans le dossier du projet, en local :

   ```bash
   git remote add origin https://github.com/<ton-utilisateur>/<ton-repo>.git
   git push -u origin main
   ```

## 2. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → "New project".
2. Une fois le projet créé, ouvre **SQL Editor** et colle le contenu du
   fichier `supabase/schema.sql` du projet, puis exécute-le. Ça crée les
   tables (`profiles`, `programs`, `program_assignments`,
   `program_exercises`, `workout_logs`) avec la sécurité (RLS) déjà
   configurée.
3. Va dans **Authentication > Providers** et vérifie que "Email" est activé
   (c'est le cas par défaut).
4. Va dans **Authentication > URL Configuration** et ajoute l'URL de ton
   site (celle que Vercel te donnera à l'étape suivante, ou
   `http://localhost:3000` pour tester en local) dans "Site URL" et
   "Redirect URLs".
5. Récupère tes clés dans **Project Settings > API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Déployer sur Vercel

1. Va sur [vercel.com/new](https://vercel.com/new) et importe le dépôt
   GitHub que tu viens de créer.
2. Vercel détecte automatiquement Next.js, pas besoin de changer les
   réglages de build.
3. Dans "Environment Variables", ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (les mêmes valeurs que récupérées à l'étape 2.5)
4. Clique sur "Deploy". Après quelques minutes, ton app est en ligne.
5. Retourne dans Supabase (Authentication > URL Configuration) et
   remplace/ajoute l'URL Vercel définitive (ex :
   `https://ton-app.vercel.app`) pour que les emails de confirmation
   redirigent correctement.

## 4. Vérifier que tout fonctionne

1. Crée un compte "coach" depuis `/signup`.
2. Confirme ton email (lien envoyé par Supabase).
3. Crée un programme, ajoute des exercices.
4. Crée un second compte "athlète" (autre email), et assigne-lui le
   programme depuis l'espace coach.
5. Connecte-toi avec le compte athlète, ouvre le programme, et
   enregistre une séance.

## Ensuite

- Chaque `git push` sur `main` redéploie automatiquement l'app sur Vercel.
- Pour travailler en local avec la même base : copie `.env.example` en
  `.env.local` et lance `npm run dev`.
