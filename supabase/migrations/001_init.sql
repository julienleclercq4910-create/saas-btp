create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  address text,
  subscription_status text not null default 'trial' check (subscription_status in ('trial','active','past_due','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','member')),
  created_at timestamptz not null default now(),
  unique(company_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  company_name text,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  address text,
  status text not null default 'quote' check (status in ('quote','in_progress','done','on_hold')),
  start_date date,
  end_date date,
  planned_budget numeric(12,2) not null default 0,
  actual_cost numeric(12,2) not null default 0,
  progress integer not null default 0 check (progress between 0 and 100),
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  file_name text not null,
  file_type text not null,
  file_path text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null check (category in ('escalier_demi_quart_tournant','escalier_limon_central','garde_corps_terrasse','dressing','meuble_salle_de_bain')),
  work_type text not null,
  measured_at date not null default now(),
  dimensions jsonb not null default '{}'::jsonb,
  notes text,
  sketch_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'starter',
  status text not null default 'trial' check (status in ('trial','active','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_clients_company_id on public.clients(company_id);
create index if not exists idx_projects_company_id on public.projects(company_id);
create index if not exists idx_tasks_company_id on public.tasks(company_id);
create index if not exists idx_documents_company_id on public.documents(company_id);
create index if not exists idx_measurements_company_id on public.measurements(company_id);

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.company_id = target_company_id
      and m.user_id = auth.uid()
  );
$$;

grant execute on function public.is_company_member(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.memberships enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.measurements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select using (id = auth.uid());
drop policy if exists "profiles upsert own" on public.profiles;
create policy "profiles upsert own" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "companies member access" on public.companies;
create policy "companies member access" on public.companies for select using (public.is_company_member(id));
drop policy if exists "companies create authenticated" on public.companies;
create policy "companies create authenticated" on public.companies for insert with check (auth.uid() is not null);
drop policy if exists "companies admin update" on public.companies;
create policy "companies admin update" on public.companies for update using (
  exists (
    select 1 from public.memberships m
    where m.company_id = companies.id and m.user_id = auth.uid() and m.role = 'admin'
  )
);

drop policy if exists "memberships member access" on public.memberships;
create policy "memberships member access" on public.memberships for select using (public.is_company_member(company_id));
drop policy if exists "memberships admin manage" on public.memberships;
create policy "memberships admin manage" on public.memberships for all using (
  exists (
    select 1 from public.memberships m
    where m.company_id = memberships.company_id and m.user_id = auth.uid() and m.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.company_id = memberships.company_id and m.user_id = auth.uid() and m.role = 'admin'
  )
);

create policy "clients member access" on public.clients for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "projects member access" on public.projects for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "tasks member access" on public.tasks for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "documents member access" on public.documents for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "measurements member access" on public.measurements for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));
create policy "subscriptions member access" on public.subscriptions for select using (public.is_company_member(company_id));
create policy "subscriptions admin manage" on public.subscriptions for all using (
  exists (
    select 1 from public.memberships m
    where m.company_id = subscriptions.company_id and m.user_id = auth.uid() and m.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.company_id = subscriptions.company_id and m.user_id = auth.uid() and m.role = 'admin'
  )
);
create policy "activity member access" on public.activity_logs for all using (public.is_company_member(company_id)) with check (public.is_company_member(company_id));

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents storage read" on storage.objects for select using (
  bucket_id = 'documents' and public.is_company_member((storage.foldername(name))[1]::uuid)
);
create policy "documents storage write" on storage.objects for insert with check (
  bucket_id = 'documents' and public.is_company_member((storage.foldername(name))[1]::uuid)
);
create policy "documents storage delete" on storage.objects for delete using (
  bucket_id = 'documents' and public.is_company_member((storage.foldername(name))[1]::uuid)
);

