-- Ben Daoud Réparation - Schéma Supabase PostgreSQL

create extension if not exists pgcrypto;

create schema if not exists app;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'role_app' and n.nspname = 'app'
  ) then
    create type app.role_app as enum ('admin', 'employe');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'type_produit' and n.nspname = 'app'
  ) then
    create type app.type_produit as enum (
      'chaîne',
      'collier',
      'bague',
      'bracelet',
      'montre',
      'gourmette',
      'pendentif',
      'mdaja',
      'ensemble',
      'parure',
      'sautoir',
      'broche',
      'autre'
    );
  end if;
end $$;

alter type app.type_produit add value if not exists 'mdaja';
alter type app.type_produit add value if not exists 'ensemble';
alter type app.type_produit add value if not exists 'parure';
alter type app.type_produit add value if not exists 'sautoir';
alter type app.type_produit add value if not exists 'broche';

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'atelier_type' and n.nspname = 'app'
  ) then
    create type app.atelier_type as enum (
      'Brahim',
      'Miyara',
      'Oro',
      'mecanica',
      'Youssef',
      'Issam',
      'Adil',
      'Bouchaib',
      'Rachid montre',
      'Hassan montre (kissariya)',
      'Rahali'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'statut_reparation' and n.nspname = 'app'
  ) then
    create type app.statut_reparation as enum ('en cours', 'prêt', 'livré');
  end if;
end $$;

create table if not exists app.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_complet text,
  username text,
  email text,
  role app.role_app not null default 'employe',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists app.profiles
  add column if not exists username text;

alter table if exists app.profiles
  add column if not exists email text;

create unique index if not exists idx_profiles_username_unique
on app.profiles (lower(username));

create table if not exists app.clients (
  id uuid primary key default gen_random_uuid(),
  nom_complet text not null,
  telephone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.reparations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references app.clients(id) on delete restrict,
  atelier app.atelier_type not null,
  date_reception_client date not null,
  date_retour_atelier date,
  date_livraison_client date,
  prix_reparation numeric(10,2) not null default 0 check (prix_reparation >= 0),
  urgent boolean not null default false,
  statut app.statut_reparation not null default 'en cours',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists app.reparations
  add column if not exists urgent boolean not null default false;

create table if not exists app.bijoux (
  id uuid primary key default gen_random_uuid(),
  reparation_id uuid not null references app.reparations(id) on delete cascade,
  type_produit app.type_produit not null,
  description text,
  prix_reparation numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists app.bijoux
  add column if not exists prix_reparation numeric(10,2) not null default 0;

create table if not exists app.bijou_photos (
  id uuid primary key default gen_random_uuid(),
  bijou_id uuid not null references app.bijoux(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_reparations_statut on app.reparations(statut);
create index if not exists idx_reparations_reception on app.reparations(date_reception_client);
create index if not exists idx_reparations_client on app.reparations(client_id);
create index if not exists idx_bijoux_reparation on app.bijoux(reparation_id);
create index if not exists idx_bijou_photos_bijou on app.bijou_photos(bijou_id);

create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on app.profiles;
drop trigger if exists trg_clients_updated_at on app.clients;
drop trigger if exists trg_reparations_updated_at on app.reparations;
drop trigger if exists trg_bijoux_updated_at on app.bijoux;

create trigger trg_profiles_updated_at
before update on app.profiles
for each row execute function app.set_updated_at();

create trigger trg_clients_updated_at
before update on app.clients
for each row execute function app.set_updated_at();

create trigger trg_reparations_updated_at
before update on app.reparations
for each row execute function app.set_updated_at();

create trigger trg_bijoux_updated_at
before update on app.bijoux
for each row execute function app.set_updated_at();

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = app
as $$
begin
  insert into app.profiles (id, nom_complet, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom_complet', split_part(new.email, '@', 1)),
    coalesce((new.raw_app_meta_data ->> 'role')::app.role_app, 'employe')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure app.handle_new_user();

create or replace function app.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from app.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

alter table app.profiles enable row level security;
alter table app.clients enable row level security;
alter table app.reparations enable row level security;
alter table app.bijoux enable row level security;
alter table app.bijou_photos enable row level security;

drop policy if exists "profiles_select_self_or_admin" on app.profiles;
drop policy if exists "profiles_update_self_or_admin" on app.profiles;
drop policy if exists "profiles_insert_admin_only" on app.profiles;
drop policy if exists "clients_all_authenticated" on app.clients;
drop policy if exists "reparations_all_authenticated" on app.reparations;
drop policy if exists "bijoux_all_authenticated" on app.bijoux;
drop policy if exists "bijou_photos_all_authenticated" on app.bijou_photos;

create policy "profiles_select_self_or_admin"
on app.profiles for select
to authenticated
using (id = auth.uid() or app.is_admin(auth.uid()));

create policy "profiles_update_self_or_admin"
on app.profiles for update
to authenticated
using (id = auth.uid() or app.is_admin(auth.uid()))
with check (id = auth.uid() or app.is_admin(auth.uid()));

create policy "profiles_insert_admin_only"
on app.profiles for insert
to authenticated
with check (app.is_admin(auth.uid()));

create policy "clients_all_authenticated"
on app.clients for all
to authenticated
using (true)
with check (true);

create policy "reparations_all_authenticated"
on app.reparations for all
to authenticated
using (true)
with check (true);

create policy "bijoux_all_authenticated"
on app.bijoux for all
to authenticated
using (true)
with check (true);

create policy "bijou_photos_all_authenticated"
on app.bijou_photos for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bijoux-photos',
  'bijoux-photos',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "photos_select_authenticated" on storage.objects;
drop policy if exists "photos_insert_authenticated" on storage.objects;
drop policy if exists "photos_update_authenticated" on storage.objects;
drop policy if exists "photos_delete_authenticated" on storage.objects;

create policy "photos_select_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'bijoux-photos');

create policy "photos_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'bijoux-photos');

create policy "photos_update_authenticated"
on storage.objects for update
to authenticated
using (bucket_id = 'bijoux-photos')
with check (bucket_id = 'bijoux-photos');

create policy "photos_delete_authenticated"
on storage.objects for delete
to authenticated
using (bucket_id = 'bijoux-photos');
