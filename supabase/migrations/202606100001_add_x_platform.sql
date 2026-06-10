-- Allow X (Twitter) accounts in social_accounts.
alter table public.social_accounts
  drop constraint if exists social_accounts_platform_check;

alter table public.social_accounts
  add constraint social_accounts_platform_check
  check (platform in ('instagram', 'facebook', 'tiktok', 'linkedin', 'youtube', 'x'));
