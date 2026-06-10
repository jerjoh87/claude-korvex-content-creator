-- Production authentication and ownership baseline for AI Content Creator OS.
-- Apply with Supabase CLI after configuring Auth providers and redirect URLs.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email, full_name = excluded.full_name;

  insert into public.workspaces (owner_id, name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'workspace_name', ''), 'My Workspace'))
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  industry text,
  audience jsonb not null default '{}'::jsonb,
  voice jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  business_profile_id uuid references public.business_profiles(id) on delete set null,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  goal text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  prompt text,
  content text not null,
  content_type text not null default 'post',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  generated_content_id uuid references public.generated_content(id) on delete set null,
  social_account_id uuid,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'incomplete',
  plan text,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  metric_name text not null,
  metric_value numeric not null default 0,
  dimensions jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  colors jsonb not null default '[]'::jsonb,
  fonts jsonb not null default '[]'::jsonb,
  logos jsonb not null default '[]'::jsonb,
  guidelines text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  handle text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_account_id, workspace_id)
);

alter table public.scheduled_posts
  add constraint scheduled_posts_social_account_id_fkey
  foreign key (social_account_id) references public.social_accounts(id) on delete set null;

create table if not exists public.remix_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_content_id uuid references public.generated_content(id) on delete set null,
  remixed_content_id uuid references public.generated_content(id) on delete set null,
  instructions text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces(owner_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists business_profiles_owner_idx on public.business_profiles(user_id, workspace_id);
create index if not exists generated_content_owner_idx on public.generated_content(user_id, workspace_id);
create index if not exists campaigns_owner_idx on public.campaigns(user_id, workspace_id);
create index if not exists media_assets_owner_idx on public.media_assets(user_id, workspace_id);
create index if not exists scheduled_posts_owner_idx on public.scheduled_posts(user_id, workspace_id);
create index if not exists subscriptions_owner_idx on public.subscriptions(user_id, workspace_id);
create index if not exists analytics_owner_idx on public.analytics(user_id, workspace_id);
create index if not exists brand_kits_owner_idx on public.brand_kits(user_id, workspace_id);
create index if not exists social_accounts_owner_idx on public.social_accounts(user_id, workspace_id);
create index if not exists remix_history_owner_idx on public.remix_history(user_id, workspace_id);


alter table public.business_profiles add constraint business_profiles_identity_scope_unique unique (id, workspace_id, user_id);
alter table public.campaigns add constraint campaigns_identity_scope_unique unique (id, workspace_id, user_id);
alter table public.generated_content add constraint generated_content_identity_scope_unique unique (id, workspace_id, user_id);
alter table public.social_accounts add constraint social_accounts_identity_scope_unique unique (id, workspace_id, user_id);

alter table public.campaigns add constraint campaigns_business_profile_scope_fkey
  foreign key (business_profile_id, workspace_id, user_id)
  references public.business_profiles(id, workspace_id, user_id);
alter table public.generated_content add constraint generated_content_campaign_scope_fkey
  foreign key (campaign_id, workspace_id, user_id)
  references public.campaigns(id, workspace_id, user_id);
alter table public.scheduled_posts add constraint scheduled_posts_generated_content_scope_fkey
  foreign key (generated_content_id, workspace_id, user_id)
  references public.generated_content(id, workspace_id, user_id);
alter table public.scheduled_posts add constraint scheduled_posts_social_account_scope_fkey
  foreign key (social_account_id, workspace_id, user_id)
  references public.social_accounts(id, workspace_id, user_id);
alter table public.analytics add constraint analytics_campaign_scope_fkey
  foreign key (campaign_id, workspace_id, user_id)
  references public.campaigns(id, workspace_id, user_id);
alter table public.remix_history add constraint remix_history_source_content_scope_fkey
  foreign key (source_content_id, workspace_id, user_id)
  references public.generated_content(id, workspace_id, user_id);
alter table public.remix_history add constraint remix_history_remixed_content_scope_fkey
  foreign key (remixed_content_id, workspace_id, user_id)
  references public.generated_content(id, workspace_id, user_id);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_workspaces_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger set_business_profiles_updated_at before update on public.business_profiles for each row execute function public.set_updated_at();
create trigger set_generated_content_updated_at before update on public.generated_content for each row execute function public.set_updated_at();
create trigger set_campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger set_media_assets_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
create trigger set_scheduled_posts_updated_at before update on public.scheduled_posts for each row execute function public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger set_analytics_updated_at before update on public.analytics for each row execute function public.set_updated_at();
create trigger set_brand_kits_updated_at before update on public.brand_kits for each row execute function public.set_updated_at();
create trigger set_social_accounts_updated_at before update on public.social_accounts for each row execute function public.set_updated_at();
create trigger set_remix_history_updated_at before update on public.remix_history for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.business_profiles enable row level security;
alter table public.generated_content enable row level security;
alter table public.campaigns enable row level security;
alter table public.media_assets enable row level security;
alter table public.scheduled_posts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.analytics enable row level security;
alter table public.brand_kits enable row level security;
alter table public.social_accounts enable row level security;
alter table public.remix_history enable row level security;

create policy "profiles own rows" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "workspaces member rows" on public.workspaces for select using (public.is_workspace_member(id));
create policy "workspaces owner writes" on public.workspaces for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "workspace memberships visible to members" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "workspace owners manage memberships" on public.workspace_members for all using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));

create policy "business_profiles owned workspace rows" on public.business_profiles for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "generated_content owned workspace rows" on public.generated_content for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "campaigns owned workspace rows" on public.campaigns for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "media_assets owned workspace rows" on public.media_assets for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "scheduled_posts owned workspace rows" on public.scheduled_posts for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "subscriptions owned workspace rows" on public.subscriptions for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "analytics owned workspace rows" on public.analytics for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "brand_kits owned workspace rows" on public.brand_kits for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "social_accounts owned workspace rows" on public.social_accounts for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "remix_history owned workspace rows" on public.remix_history for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id)) with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
