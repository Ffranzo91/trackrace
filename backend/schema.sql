-- TrackRace — schema database Supabase (Postgres + PostGIS)
-- Ricostruito a partire dal riepilogo di progetto: questo file documenta
-- lo schema già eseguito manualmente nello SQL Editor di Supabase.
-- È idempotente dove possibile, ma pensato per essere eseguito una volta sola
-- su un progetto Supabase nuovo.

-- ============================================================
-- Estensioni
-- ============================================================
create extension if not exists postgis;

-- ============================================================
-- Tipi enum
-- ============================================================
create type user_role as enum ('ospite', 'gestore', 'admin');
create type track_status as enum ('pending', 'active', 'inactive');
create type request_status as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- profiles — un profilo per ogni utente auth, creato via trigger
-- ============================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'ospite',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Crea automaticamente un profilo alla registrazione di un nuovo utente
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- tracks — le piste kart
-- ============================================================
create table tracks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  description text,
  location geography(point, 4326) not null,
  indoor boolean not null default false,
  kids_friendly boolean not null default false,
  allows_minimoto boolean not null default false,
  price_info text,
  images text[] not null default '{}',
  status track_status not null default 'pending',
  owner_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index tracks_location_idx on tracks using gist (location);

-- ============================================================
-- gestore_requests — richieste "aggiungi la tua pista"
-- ============================================================
create table gestore_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles (id) on delete set null,
  track_name text not null,
  contact_email text not null,
  contact_phone text,
  message text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ============================================================
-- posts — post dei gestori sulla propria pista
-- ============================================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references tracks (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- follows — utente segue pista (tabella ponte)
-- ============================================================
create table follows (
  user_id uuid not null references profiles (id) on delete cascade,
  track_id uuid not null references tracks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

-- ============================================================
-- Funzione: piste vicine entro un raggio, ordinate per distanza
-- ============================================================
create function nearby_tracks(user_lat double precision, user_lng double precision, radius_km double precision)
returns table (
  id uuid,
  name text,
  address text,
  description text,
  indoor boolean,
  kids_friendly boolean,
  allows_minimoto boolean,
  price_info text,
  images text[],
  owner_id uuid,
  distance_km double precision
)
language sql
stable
as $$
  select
    t.id,
    t.name,
    t.address,
    t.description,
    t.indoor,
    t.kids_friendly,
    t.allows_minimoto,
    t.price_info,
    t.images,
    t.owner_id,
    st_distance(t.location, st_point(user_lng, user_lat)::geography) / 1000 as distance_km
  from tracks t
  where t.status = 'active'
    and st_dwithin(t.location, st_point(user_lng, user_lat)::geography, radius_km * 1000)
  order by distance_km asc;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table tracks enable row level security;
alter table gestore_requests enable row level security;
alter table posts enable row level security;
alter table follows enable row level security;

-- profiles: ognuno vede tutti i profili (per mostrare autore post ecc.),
-- ma modifica solo il proprio
create policy "profiles sono leggibili da chiunque sia autenticato"
  on profiles for select
  using (true);

create policy "un utente modifica solo il proprio profilo"
  on profiles for update
  using (auth.uid() = id);

-- tracks: le piste attive sono visibili a tutti; un gestore vede/modifica
-- anche le proprie piste non ancora attive
create policy "le piste attive sono pubbliche"
  on tracks for select
  using (status = 'active' or owner_id = auth.uid());

create policy "un gestore modifica solo la propria pista"
  on tracks for update
  using (owner_id = auth.uid());

-- gestore_requests: ognuno crea la propria richiesta e vede solo le proprie
create policy "un utente crea la propria richiesta"
  on gestore_requests for insert
  with check (requester_id = auth.uid() or requester_id is null);

create policy "un utente vede solo le proprie richieste"
  on gestore_requests for select
  using (requester_id = auth.uid());

-- posts: visibili a tutti, ma un gestore scrive solo post sulla propria pista
create policy "i post sono pubblici"
  on posts for select
  using (true);

create policy "un gestore pubblica solo sulla propria pista"
  on posts for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from tracks t
      where t.id = track_id and t.owner_id = auth.uid()
    )
  );

create policy "un gestore modifica solo i propri post"
  on posts for update
  using (author_id = auth.uid());

create policy "un gestore elimina solo i propri post"
  on posts for delete
  using (author_id = auth.uid());

-- follows: ognuno vede/crea/elimina solo i propri follow
create policy "un utente vede i propri follow"
  on follows for select
  using (user_id = auth.uid());

create policy "un utente crea i propri follow"
  on follows for insert
  with check (user_id = auth.uid());

create policy "un utente elimina i propri follow"
  on follows for delete
  using (user_id = auth.uid());
