create extension if not exists pgcrypto;

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  workspace_id text not null,
  platform text not null check (platform in ('instagram', 'facebook', 'tiktok', 'linkedin', 'youtube')),
  account_name text,
  account_handle text,
  platform_account_id text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  scopes text[] not null default '{}',
  expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'expired', 'revoked', 'disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workspace_id, platform, platform_account_id)
);

create index if not exists social_accounts_user_workspace_idx
  on public.social_accounts (user_id, workspace_id, status);

create index if not exists social_accounts_platform_idx
  on public.social_accounts (platform, status);

alter table public.social_accounts enable row level security;

create policy "Users can view their social account metadata"
  on public.social_accounts
  for select
  using (auth.uid()::text = user_id);

create policy "Service role manages encrypted social tokens"
  on public.social_accounts
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.set_social_accounts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_social_accounts_updated_at on public.social_accounts;
create trigger set_social_accounts_updated_at
  before update on public.social_accounts
  for each row execute function public.set_social_accounts_updated_at();
