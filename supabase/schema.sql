-- ============================================================
-- Schéma de données : app de coaching sportif
-- À exécuter dans Supabase > SQL Editor (une seule fois)
-- ============================================================

-- Extension nécessaire pour gen_random_uuid()
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. profiles : un profil par utilisateur (coach ou athlète)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text,
  role text not null default 'athlete' check (role in ('coach', 'athlete', 'admin')),
  motivational_quote text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_key on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists "profiles: lecture par tous les utilisateurs connectés" on public.profiles;
create policy "profiles: lecture par tous les utilisateurs connectés"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles: un utilisateur modifie uniquement son profil" on public.profiles;
create policy "profiles: un utilisateur modifie uniquement son profil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles: un utilisateur crée uniquement son profil" on public.profiles;
create policy "profiles: un utilisateur crée uniquement son profil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- L'utilisateur courant est-il admin ? (security definer pour éviter la
-- récursion des policies RLS quand on l'utilise dans une policy sur profiles)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles: un admin gère tous les profils" on public.profiles;
create policy "profiles: un admin gère tous les profils"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Crée automatiquement un profil "athlete" à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'role', 'athlete')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2. programs : programmes créés par un coach
-- ------------------------------------------------------------
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  is_default boolean not null default false,
  category text check (category is null or category in ('bras-epaules', 'abdos-torse', 'jambes', 'cardio')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. program_assignments : quel athlète suit quel programme
-- ------------------------------------------------------------
create table if not exists public.program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (program_id, athlete_id)
);

-- Policies "programs" (définies ici : elles référencent program_assignments,
-- qui doit donc déjà exister)
alter table public.programs enable row level security;

drop policy if exists "programs: le coach gère ses propres programmes" on public.programs;
create policy "programs: le coach gère ses propres programmes"
  on public.programs for all
  to authenticated
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

-- Un athlète donné suit-il ce programme ? (security definer pour éviter la
-- récursion : programs -> program_assignments -> programs -> ...)
create or replace function public.is_program_assigned_to_athlete(p_program_id uuid, p_athlete_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.program_assignments pa
    where pa.program_id = p_program_id and pa.athlete_id = p_athlete_id
  );
$$;

drop policy if exists "programs: un athlète voit les programmes qui lui sont assignés" on public.programs;
create policy "programs: un athlète voit les programmes qui lui sont assignés"
  on public.programs for select
  to authenticated
  using (
    is_default = true
    or public.is_program_assigned_to_athlete(id, auth.uid())
  );

drop policy if exists "programs: un admin gère tous les programmes" on public.programs;
create policy "programs: un admin gère tous les programmes"
  on public.programs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.program_assignments enable row level security;

drop policy if exists "assignments: le coach gère les assignations de ses programmes" on public.program_assignments;
create policy "assignments: le coach gère les assignations de ses programmes"
  on public.program_assignments for all
  to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_assignments.program_id
        and p.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_assignments.program_id
        and p.coach_id = auth.uid()
    )
  );

drop policy if exists "assignments: un athlète voit ses propres assignations" on public.program_assignments;
create policy "assignments: un athlète voit ses propres assignations"
  on public.program_assignments for select
  to authenticated
  using (auth.uid() = athlete_id);

drop policy if exists "assignments: un admin gère toutes les assignations" on public.program_assignments;
create policy "assignments: un admin gère toutes les assignations"
  on public.program_assignments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 4. program_exercises : les exercices qui composent un programme
-- ------------------------------------------------------------
create table if not exists public.program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name text not null,
  sets integer,
  reps integer,
  notes text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.program_exercises enable row level security;

drop policy if exists "exercises: le coach gère les exercices de ses programmes" on public.program_exercises;
create policy "exercises: le coach gère les exercices de ses programmes"
  on public.program_exercises for all
  to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_exercises.program_id
        and p.coach_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.id = program_exercises.program_id
        and p.coach_id = auth.uid()
    )
  );

drop policy if exists "exercises: un athlète voit les exercices de ses programmes" on public.program_exercises;
create policy "exercises: un athlète voit les exercices de ses programmes"
  on public.program_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.programs p
      where p.id = program_exercises.program_id
        and p.is_default = true
    )
    or public.is_program_assigned_to_athlete(program_exercises.program_id, auth.uid())
  );

drop policy if exists "exercises: un admin gère tous les exercices" on public.program_exercises;
create policy "exercises: un admin gère tous les exercices"
  on public.program_exercises for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 5. workout_logs : le suivi rempli par l'athlète après chaque séance
-- ------------------------------------------------------------
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  program_exercise_id uuid not null references public.program_exercises (id) on delete cascade,
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  performed_at timestamptz not null default now(),
  sets_completed integer,
  reps_completed integer,
  weight_kg numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

drop policy if exists "logs: un athlète gère ses propres logs" on public.workout_logs;
create policy "logs: un athlète gère ses propres logs"
  on public.workout_logs for all
  to authenticated
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

drop policy if exists "logs: le coach voit les logs de ses programmes" on public.workout_logs;
create policy "logs: le coach voit les logs de ses programmes"
  on public.workout_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.program_exercises pe
      join public.programs p on p.id = pe.program_id
      where pe.id = workout_logs.program_exercise_id
        and p.coach_id = auth.uid()
    )
  );
