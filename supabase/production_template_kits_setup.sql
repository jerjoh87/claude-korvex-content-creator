-- Production-safe Supabase setup for Business Kits and Template Library.
-- Paste this entire file into the Supabase SQL Editor for the production project.
-- It is intentionally idempotent: it can be rerun to repair missing objects or refresh seed data.

create extension if not exists "pgcrypto";

create table if not exists public.template_library (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category text,
  industry text,
  business_type text,
  platform text,
  objective text,
  template_type text not null,
  prompt_body text not null,
  sample_output text,
  recommended_tier text default 'starter',
  tags jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.business_kits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  industry text not null,
  description text,
  target_audience jsonb default '[]'::jsonb,
  services jsonb default '[]'::jsonb,
  offers jsonb default '[]'::jsonb,
  ctas jsonb default '[]'::jsonb,
  brand_voice_options jsonb default '[]'::jsonb,
  content_pillars jsonb default '[]'::jsonb,
  hashtag_bank jsonb default '[]'::jsonb,
  banned_words jsonb default '[]'::jsonb,
  visual_style jsonb default '{}'::jsonb,
  recommended_platforms jsonb default '[]'::jsonb,
  starter_weekly_plan jsonb default '[]'::jsonb,
  starter_campaigns jsonb default '[]'::jsonb,
  tier_required text default 'starter',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.business_kit_templates (
  id uuid primary key default gen_random_uuid(),
  business_kit_id uuid references public.business_kits(id) on delete cascade,
  template_id uuid references public.template_library(id) on delete cascade,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique(business_kit_id, template_id)
);

create table if not exists public.user_selected_kits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  workspace_id text,
  business_kit_id uuid references public.business_kits(id),
  selected_at timestamptz default now(),
  applied_to_profile boolean default false,
  applied_to_brand_kit boolean default false,
  metadata jsonb default '{}'::jsonb,
  unique(user_id, workspace_id, business_kit_id)
);

-- Repair columns if a partial table was created before this setup was run.
alter table public.template_library add column if not exists id uuid default gen_random_uuid();
alter table public.template_library add column if not exists title text;
alter table public.template_library add column if not exists slug text;
alter table public.template_library add column if not exists description text;
alter table public.template_library add column if not exists category text;
alter table public.template_library add column if not exists industry text;
alter table public.template_library add column if not exists business_type text;
alter table public.template_library add column if not exists platform text;
alter table public.template_library add column if not exists objective text;
alter table public.template_library add column if not exists template_type text;
alter table public.template_library add column if not exists prompt_body text;
alter table public.template_library add column if not exists sample_output text;
alter table public.template_library add column if not exists recommended_tier text default 'starter';
alter table public.template_library add column if not exists tags jsonb default '[]'::jsonb;
alter table public.template_library add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.template_library add column if not exists is_featured boolean default false;
alter table public.template_library add column if not exists is_active boolean default true;
alter table public.template_library add column if not exists created_at timestamptz default now();
alter table public.template_library add column if not exists updated_at timestamptz default now();

alter table public.business_kits add column if not exists id uuid default gen_random_uuid();
alter table public.business_kits add column if not exists title text;
alter table public.business_kits add column if not exists slug text;
alter table public.business_kits add column if not exists industry text;
alter table public.business_kits add column if not exists description text;
alter table public.business_kits add column if not exists target_audience jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists services jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists offers jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists ctas jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists brand_voice_options jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists content_pillars jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists hashtag_bank jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists banned_words jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists visual_style jsonb default '{}'::jsonb;
alter table public.business_kits add column if not exists recommended_platforms jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists starter_weekly_plan jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists starter_campaigns jsonb default '[]'::jsonb;
alter table public.business_kits add column if not exists tier_required text default 'starter';
alter table public.business_kits add column if not exists is_active boolean default true;
alter table public.business_kits add column if not exists created_at timestamptz default now();
alter table public.business_kits add column if not exists updated_at timestamptz default now();

alter table public.business_kit_templates add column if not exists id uuid default gen_random_uuid();
alter table public.business_kit_templates add column if not exists business_kit_id uuid references public.business_kits(id) on delete cascade;
alter table public.business_kit_templates add column if not exists template_id uuid references public.template_library(id) on delete cascade;
alter table public.business_kit_templates add column if not exists sort_order integer default 0;
alter table public.business_kit_templates add column if not exists created_at timestamptz default now();

alter table public.user_selected_kits add column if not exists id uuid default gen_random_uuid();
alter table public.user_selected_kits add column if not exists user_id text;
alter table public.user_selected_kits add column if not exists workspace_id text;
alter table public.user_selected_kits add column if not exists business_kit_id uuid references public.business_kits(id);
alter table public.user_selected_kits add column if not exists selected_at timestamptz default now();
alter table public.user_selected_kits add column if not exists applied_to_profile boolean default false;
alter table public.user_selected_kits add column if not exists applied_to_brand_kit boolean default false;
alter table public.user_selected_kits add column if not exists metadata jsonb default '{}'::jsonb;

-- Constraints and indexes are safe to rerun.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'template_library_slug_key' and conrelid = 'public.template_library'::regclass) then
    execute 'alter table public.template_library add constraint template_library_slug_key unique (slug)';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_kits_slug_key' and conrelid = 'public.business_kits'::regclass) then
    execute 'alter table public.business_kits add constraint business_kits_slug_key unique (slug)';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'business_kit_templates_business_kit_id_template_id_key' and conrelid = 'public.business_kit_templates'::regclass) then
    execute 'alter table public.business_kit_templates add constraint business_kit_templates_business_kit_id_template_id_key unique (business_kit_id, template_id)';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'user_selected_kits_user_id_workspace_id_business_kit_id_key' and conrelid = 'public.user_selected_kits'::regclass) then
    execute 'alter table public.user_selected_kits add constraint user_selected_kits_user_id_workspace_id_business_kit_id_key unique (user_id, workspace_id, business_kit_id)';
  end if;
end $$;

create index if not exists idx_template_library_industry on public.template_library (industry);
create index if not exists idx_template_library_template_type on public.template_library (template_type);
create index if not exists idx_template_library_recommended_tier on public.template_library (recommended_tier);
create index if not exists idx_template_library_is_active on public.template_library (is_active);
create index if not exists idx_business_kits_industry on public.business_kits (industry);
create index if not exists idx_business_kits_tier_required on public.business_kits (tier_required);
create index if not exists idx_user_selected_kits_user_id on public.user_selected_kits (user_id);
create index if not exists idx_user_selected_kits_workspace_id on public.user_selected_kits (workspace_id);

alter table public.template_library enable row level security;
alter table public.business_kits enable row level security;
alter table public.business_kit_templates enable row level security;
alter table public.user_selected_kits enable row level security;

-- RLS policies still require table privileges for the authenticated API role.
-- These grants are intentionally narrow for global content and user-owned selections.
grant usage on schema public to authenticated;
grant select on public.template_library to authenticated;
grant select on public.business_kits to authenticated;
grant select on public.business_kit_templates to authenticated;
grant select, insert, update, delete on public.user_selected_kits to authenticated;

-- Keep service-role and server-side maintenance workflows explicit.
grant all on public.template_library to service_role;
grant all on public.business_kits to service_role;
grant all on public.business_kit_templates to service_role;
grant all on public.user_selected_kits to service_role;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'template_library' and policyname = 'Authenticated users can read active templates') then
    execute 'create policy "Authenticated users can read active templates" on public.template_library for select to authenticated using (is_active = true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'business_kits' and policyname = 'Authenticated users can read active business kits') then
    execute 'create policy "Authenticated users can read active business kits" on public.business_kits for select to authenticated using (is_active = true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'business_kit_templates' and policyname = 'Authenticated users can read business kit template links') then
    execute 'create policy "Authenticated users can read business kit template links" on public.business_kit_templates for select to authenticated using (true)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_selected_kits' and policyname = 'Users can read their own selected kits') then
    execute 'create policy "Users can read their own selected kits" on public.user_selected_kits for select to authenticated using (user_id = auth.uid()::text)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_selected_kits' and policyname = 'Users can insert their own selected kits') then
    execute 'create policy "Users can insert their own selected kits" on public.user_selected_kits for insert to authenticated with check (user_id = auth.uid()::text)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_selected_kits' and policyname = 'Users can update their own selected kits') then
    execute 'create policy "Users can update their own selected kits" on public.user_selected_kits for update to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_selected_kits' and policyname = 'Users can delete their own selected kits') then
    execute 'create policy "Users can delete their own selected kits" on public.user_selected_kits for delete to authenticated using (user_id = auth.uid()::text)';
  end if;
end $$;

with starter_kits(title, slug, industry, description) as (
  values
    ('Barber Shop', 'barber-shop', 'Beauty & Personal Care', 'Content kit for barbershops promoting cuts, grooming services, appointments, and repeat visits.'),
    ('Hair Stylist / Salon', 'hair-stylist-salon', 'Beauty & Personal Care', 'Content kit for stylists and salons promoting transformations, bookings, maintenance, and products.'),
    ('Realtor', 'realtor', 'Real Estate', 'Content kit for real estate agents generating seller leads, buyer trust, listings, and neighborhood authority.'),
    ('Credit Repair', 'credit-repair', 'Financial Services', 'Content kit for credit repair brands educating prospects, building trust, and booking consultations.'),
    ('Business Funding Consultant', 'business-funding-consultant', 'Financial Services', 'Content kit for funding consultants explaining capital options and driving qualification calls.'),
    ('Restaurant', 'restaurant', 'Food & Beverage', 'Content kit for restaurants promoting menu items, specials, reservations, and local loyalty.'),
    ('Food Truck', 'food-truck', 'Food & Beverage', 'Content kit for food trucks promoting locations, menu drops, events, and urgency.'),
    ('Pest Control', 'pest-control', 'Home Services', 'Content kit for pest control companies educating homeowners and booking inspections.'),
    ('HVAC', 'hvac', 'Home Services', 'Content kit for HVAC companies promoting maintenance, repairs, replacements, and seasonal offers.'),
    ('Roofing', 'roofing', 'Home Services', 'Content kit for roofers promoting inspections, storm response, repairs, and replacements.'),
    ('Cleaning Company', 'cleaning-company', 'Home Services', 'Content kit for residential and commercial cleaners promoting trust, results, and recurring plans.'),
    ('Auto Detailer', 'auto-detailer', 'Automotive', 'Content kit for auto detailers promoting packages, transformations, and premium care.'),
    ('Gym / Personal Trainer', 'gym-personal-trainer', 'Health & Fitness', 'Content kit for gyms and trainers promoting programs, transformations, and trial sessions.'),
    ('Med Spa', 'med-spa', 'Health & Beauty', 'Content kit for med spas promoting treatments, education, consultations, and trust.'),
    ('Local Service Business', 'local-service-business', 'Local Services', 'General-purpose kit for local service businesses that need leads, reviews, referrals, and bookings.'),
    ('Dental Office / Cosmetic Dentist', 'dental-office-cosmetic-dentist', 'Healthcare', 'Content kit for dental offices promoting preventive care, cosmetic services, and patient trust.'),
    ('Daycare / Childcare Center', 'daycare-childcare-center', 'Education & Childcare', 'Content kit for childcare centers building parent confidence and enrollment demand.'),
    ('Moving Company', 'moving-company', 'Home Services', 'Content kit for movers promoting stress-free moves, estimates, and local reliability.'),
    ('Landscaping / Lawn Care', 'landscaping-lawn-care', 'Home Services', 'Content kit for lawn and landscaping companies promoting curb appeal and recurring service.'),
    ('Car / Truck Detailing', 'car-truck-detailing', 'Automotive', 'Content kit for vehicle detailers promoting car and truck packages, protection, and before/after proof.'),
    ('Plumbing Company', 'plumbing-company', 'Home Services', 'Content kit for plumbers promoting emergency service, maintenance, and trust.'),
    ('Electrician', 'electrician', 'Home Services', 'Content kit for electricians promoting safety, repairs, upgrades, and inspections.'),
    ('Insurance Agent', 'insurance-agent', 'Insurance', 'Content kit for insurance agents explaining coverage, life events, and quote requests.'),
    ('Photographer / Videographer', 'photographer-videographer', 'Creative Services', 'Content kit for photographers and videographers promoting portfolios, packages, and bookings.'),
    ('Event Planner / Party Rental', 'event-planner-party-rental', 'Events', 'Content kit for event planners and party rental businesses promoting packages and memorable experiences.'),
    ('Tattoo Shop / Piercing Studio', 'tattoo-shop-piercing-studio', 'Beauty & Personal Care', 'Content kit for tattoo and piercing studios promoting artistry, safety, bookings, and flash events.'),
    ('Tutoring / Learning Center', 'tutoring-learning-center', 'Education', 'Content kit for tutoring centers promoting academic improvement, confidence, and assessments.')
)
insert into public.business_kits (
  title,
  slug,
  industry,
  description,
  target_audience,
  services,
  offers,
  ctas,
  brand_voice_options,
  content_pillars,
  hashtag_bank,
  banned_words,
  visual_style,
  recommended_platforms,
  starter_weekly_plan,
  starter_campaigns,
  tier_required,
  is_active,
  updated_at
)
select
  title,
  slug,
  industry,
  description,
  jsonb_build_array('local prospects', 'repeat customers', 'referral partners'),
  jsonb_build_array('consultations', 'appointments', 'service packages', 'maintenance plans'),
  jsonb_build_array('new customer offer', 'limited-time booking incentive', 'seasonal promotion'),
  jsonb_build_array('Book now', 'Request a quote', 'Send us a message', 'Claim this offer'),
  jsonb_build_array('expert', 'friendly', 'premium', 'community-focused'),
  jsonb_build_array('education', 'proof/results', 'offers', 'behind the scenes', 'reviews'),
  jsonb_build_array('#localbusiness', '#smallbusiness', '#booknow', '#supportlocal'),
  jsonb_build_array('guaranteed results', 'cheap', 'miracle', 'risk-free'),
  jsonb_build_object('tone', 'clean, modern, trustworthy', 'shot_list', jsonb_build_array('before and after', 'team at work', 'happy customer', 'service close-up')),
  jsonb_build_array('Instagram', 'Facebook', 'Google Business Profile', 'TikTok'),
  jsonb_build_array('Monday: educational tip', 'Wednesday: proof or before/after', 'Friday: offer or booking reminder', 'Sunday: review or community post'),
  jsonb_build_array('7-day booking push', 'review spotlight week', 'seasonal service reminder'),
  'starter',
  true,
  now()
from starter_kits
on conflict (slug) do update set
  title = excluded.title,
  industry = excluded.industry,
  description = excluded.description,
  target_audience = excluded.target_audience,
  services = excluded.services,
  offers = excluded.offers,
  ctas = excluded.ctas,
  brand_voice_options = excluded.brand_voice_options,
  content_pillars = excluded.content_pillars,
  hashtag_bank = excluded.hashtag_bank,
  banned_words = excluded.banned_words,
  visual_style = excluded.visual_style,
  recommended_platforms = excluded.recommended_platforms,
  starter_weekly_plan = excluded.starter_weekly_plan,
  starter_campaigns = excluded.starter_campaigns,
  tier_required = excluded.tier_required,
  is_active = excluded.is_active,
  updated_at = now();

with kits as (
  select title, slug, industry from public.business_kits
  where slug in (
    'barber-shop', 'hair-stylist-salon', 'realtor', 'credit-repair', 'business-funding-consultant',
    'restaurant', 'food-truck', 'pest-control', 'hvac', 'roofing', 'cleaning-company', 'auto-detailer',
    'gym-personal-trainer', 'med-spa', 'local-service-business', 'dental-office-cosmetic-dentist',
    'daycare-childcare-center', 'moving-company', 'landscaping-lawn-care', 'car-truck-detailing',
    'plumbing-company', 'electrician', 'insurance-agent', 'photographer-videographer',
    'event-planner-party-rental', 'tattoo-shop-piercing-studio', 'tutoring-learning-center'
  )
), template_rows as (
  select
    title || ' 30-Day Campaign' as title,
    slug || '-30-day-campaign' as slug,
    'Starter campaign template for ' || lower(title) || ' lead generation, education, social proof, and booking reminders.' as description,
    'Business Kit Campaigns' as category,
    industry,
    title as business_type,
    'Multi-platform' as platform,
    'Generate leads and appointments' as objective,
    'campaign' as template_type,
    'Create a 30-day marketing campaign for a ' || title || '. Include weekly themes, 12 social post ideas, 4 short video ideas, 4 offer angles, trust-building proof points, and clear calls to action. Keep the voice helpful, local, and conversion-focused.' as prompt_body,
    'Week 1: educate prospects. Week 2: show proof. Week 3: promote an offer. Week 4: drive bookings and referrals.' as sample_output,
    'starter' as recommended_tier,
    jsonb_build_array('campaign', 'starter', slug, industry) as tags,
    jsonb_build_object('business_kit_slug', slug, 'seed_version', '2026-06-01') as metadata,
    true as is_featured,
    true as is_active
  from kits
  union all
  select
    title || ' Social Hook Set' as title,
    slug || '-social-hook-set' as slug,
    'Starter social post and hook template for ' || lower(title) || ' awareness, engagement, and booking content.' as description,
    'Business Kit Social Posts' as category,
    industry,
    title as business_type,
    'Instagram, Facebook, TikTok' as platform,
    'Create scroll-stopping social posts' as objective,
    'social_post' as template_type,
    'Write 20 social media hooks for a ' || title || '. Include problem-aware hooks, myth-busting hooks, before-and-after hooks, local trust hooks, urgency hooks, and booking CTA hooks. Keep each hook concise and easy to turn into a caption or short video.' as prompt_body,
    'Example: "Most people wait too long before booking this service — here are 3 signs it is time."' as sample_output,
    'starter' as recommended_tier,
    jsonb_build_array('social_post', 'hooks', 'starter', slug, industry) as tags,
    jsonb_build_object('business_kit_slug', slug, 'seed_version', '2026-06-01') as metadata,
    false as is_featured,
    true as is_active
  from kits
)
insert into public.template_library (
  title,
  slug,
  description,
  category,
  industry,
  business_type,
  platform,
  objective,
  template_type,
  prompt_body,
  sample_output,
  recommended_tier,
  tags,
  metadata,
  is_featured,
  is_active,
  updated_at
)
select
  title,
  slug,
  description,
  category,
  industry,
  business_type,
  platform,
  objective,
  template_type,
  prompt_body,
  sample_output,
  recommended_tier,
  tags,
  metadata,
  is_featured,
  is_active,
  now()
from template_rows
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  industry = excluded.industry,
  business_type = excluded.business_type,
  platform = excluded.platform,
  objective = excluded.objective,
  template_type = excluded.template_type,
  prompt_body = excluded.prompt_body,
  sample_output = excluded.sample_output,
  recommended_tier = excluded.recommended_tier,
  tags = excluded.tags,
  metadata = excluded.metadata,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active,
  updated_at = now();

with kits as (
  select id, slug from public.business_kits
), templates as (
  select id, slug, metadata from public.template_library
  where metadata ? 'business_kit_slug'
)
insert into public.business_kit_templates (business_kit_id, template_id, sort_order)
select
  kits.id,
  templates.id,
  case when templates.slug like '%-30-day-campaign' then 10 else 20 end as sort_order
from kits
join templates on templates.metadata->>'business_kit_slug' = kits.slug
on conflict (business_kit_id, template_id) do update set
  sort_order = excluded.sort_order;

-- Ask Supabase/PostgREST to refresh its schema cache immediately after table creation.
-- The dashboard/app may still take a short moment to reflect the refreshed cache.
notify pgrst, 'reload schema';

-- Quick post-run verification counts.
select
  (select count(*) from public.business_kits where is_active = true) as active_business_kits,
  (select count(*) from public.template_library where is_active = true) as active_templates,
  (select count(*) from public.business_kit_templates) as kit_template_links;
