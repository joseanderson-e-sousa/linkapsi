begin;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  professional_name text,
  crp text,
  bio text,
  photo_url text,
  areas_of_practice text[],
  audience text[],
  service_modes text[],
  city text,
  instagram_url text,
  whatsapp text,
  primary_cta_label text,
  primary_cta_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  type text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in (
    'page_view', 'primary_cta_click', 'whatsapp_click', 'instagram_click', 'link_click'
  )),
  link_id uuid references public.links(id) on delete set null,
  created_at timestamptz not null default now()
);

-- UNIQUE already indexes profiles.user_id and profiles.slug.
create index links_profile_position_idx on public.links(profile_id, position);
create index events_profile_created_at_idx on public.events(profile_id, created_at);
-- Supports FK checks and ON DELETE SET NULL without scanning all events.
create index events_link_id_idx on public.events(link_id) where link_id is not null;

create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.events enable row level security;

-- Explicit grants also remove any broader Supabase default privileges.
revoke all on public.profiles, public.links, public.events from public, anon, authenticated;
grant select on public.profiles, public.links to anon;
grant select, insert, update, delete on public.profiles, public.links to authenticated;
grant select on public.events to authenticated;

create policy profiles_public_read on public.profiles
for select to anon, authenticated using (is_published = true);

create policy profiles_owner_read on public.profiles
for select to authenticated using (user_id = (select auth.uid()));

create policy profiles_owner_insert on public.profiles
for insert to authenticated with check (user_id = (select auth.uid()));

create policy profiles_owner_update on public.profiles
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy profiles_owner_delete on public.profiles
for delete to authenticated using (user_id = (select auth.uid()));

create policy links_public_read on public.links
for select to anon, authenticated
using (is_active = true and exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.is_published = true
));

create policy links_owner_read on public.links
for select to authenticated using (exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.user_id = (select auth.uid())
));

create policy links_owner_insert on public.links
for insert to authenticated with check (exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.user_id = (select auth.uid())
));

create policy links_owner_update on public.links
for update to authenticated
using (exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.user_id = (select auth.uid())
));

create policy links_owner_delete on public.links
for delete to authenticated using (exists (
  select 1 from public.profiles p
  where p.id = links.profile_id and p.user_id = (select auth.uid())
));

create policy events_owner_read on public.events
for select to authenticated using (exists (
  select 1 from public.profiles p
  where p.id = events.profile_id and p.user_id = (select auth.uid())
));

-- No client INSERT/UPDATE/DELETE grants or policies for analytics.
-- A future server endpoint must validate publication, event_type, and that
-- link_id belongs to profile_id, and enforce rate limits before inserting.
commit;
