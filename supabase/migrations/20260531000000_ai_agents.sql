create extension if not exists pgcrypto;

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  agent_name text not null check (agent_name in ('marketing_director', 'content_repurposer', 'brand_guardian')),
  provider text not null default 'fallback',
  status text not null check (status in ('completed', 'fallback', 'skipped', 'error')),
  tier text not null check (tier in ('starter', 'pro', 'elite')),
  input_summary text,
  output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_user_created_idx on public.agent_runs (user_id, created_at desc);
create index if not exists agent_runs_workspace_created_idx on public.agent_runs (workspace_id, created_at desc);

create table if not exists public.agent_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  title text not null,
  description text not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  connected_feature text not null,
  platform text,
  action_label text,
  evidence jsonb not null default '[]'::jsonb,
  dismissed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agent_recommendations_user_created_idx on public.agent_recommendations (user_id, created_at desc);
create index if not exists agent_recommendations_workspace_created_idx on public.agent_recommendations (workspace_id, created_at desc);

create table if not exists public.brand_guardian_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  content_id uuid,
  brand_score jsonb not null default '{}'::jsonb,
  cta_score jsonb not null default '{}'::jsonb,
  clarity_score jsonb not null default '{}'::jsonb,
  overall_score jsonb not null default '{}'::jsonb,
  suggested_improvements jsonb not null default '[]'::jsonb,
  result text not null check (result in ('approve', 'warn')),
  flags jsonb not null default '[]'::jsonb,
  summary text,
  provider text not null default 'fallback',
  tier text not null check (tier in ('starter', 'pro', 'elite')),
  created_at timestamptz not null default now()
);

create index if not exists brand_guardian_reviews_content_created_idx on public.brand_guardian_reviews (content_id, created_at desc);
create index if not exists brand_guardian_reviews_user_created_idx on public.brand_guardian_reviews (user_id, created_at desc);

alter table public.agent_runs enable row level security;
alter table public.agent_recommendations enable row level security;
alter table public.brand_guardian_reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_select_own'
  ) then
    create policy "agent_runs_select_own"
      on public.agent_runs for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'agent_runs' and policyname = 'agent_runs_insert_own'
  ) then
    create policy "agent_runs_insert_own"
      on public.agent_runs for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'agent_recommendations' and policyname = 'agent_recommendations_select_own'
  ) then
    create policy "agent_recommendations_select_own"
      on public.agent_recommendations for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'agent_recommendations' and policyname = 'agent_recommendations_insert_own'
  ) then
    create policy "agent_recommendations_insert_own"
      on public.agent_recommendations for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'brand_guardian_reviews' and policyname = 'brand_guardian_reviews_select_own'
  ) then
    create policy "brand_guardian_reviews_select_own"
      on public.brand_guardian_reviews for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'brand_guardian_reviews' and policyname = 'brand_guardian_reviews_insert_own'
  ) then
    create policy "brand_guardian_reviews_insert_own"
      on public.brand_guardian_reviews for insert
      with check (auth.uid() = user_id);
  end if;
end $$;
