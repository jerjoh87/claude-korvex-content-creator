# Connected Social Accounts Architecture

## Phase 1 scope

The Phase 1 demo launch implementation connects client social identities, stores encrypted server-side tokens, displays account health, and prepares manual posting. Auto-posting is intentionally disabled unless `ENABLE_SOCIAL_AUTO_POSTING=true` and provider approvals are complete.

## Data model

`public.social_accounts` stores one row per user, workspace, platform, and platform account id:

- `id`
- `user_id`
- `workspace_id`
- `platform`
- `account_name`
- `account_handle`
- `platform_account_id`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `scopes`
- `expires_at`
- `status`
- `created_at`
- `updated_at`

Tokens are never returned from API reads. UI queries only metadata such as account name, scopes, expiration, and status.

## Token storage

- Tokens are encrypted with AES-256-GCM in `lib/social/crypto.ts`.
- The encryption key comes from `SOCIAL_TOKEN_ENCRYPTION_KEY` and is hashed to a 256-bit key.
- Access tokens and refresh tokens are stored only in Supabase server-side columns.
- API responses and React components receive only decorated metadata.

## Service boundaries

- `lib/social/providers/meta.ts` handles Instagram and Facebook OAuth through Meta.
- `lib/social/providers/tiktok.ts` handles TikTok OAuth.
- `lib/social/providers/linkedin.ts` handles LinkedIn OAuth.
- `lib/social/providers/youtube.ts` handles Google OAuth for YouTube Shorts readiness.
- `lib/social/publisher.ts` centralizes future publish-or-manual routing.
- `lib/social/repository.ts` centralizes Supabase persistence and metadata decoration.

## UI surfaces

- `/social/accounts` is the premium connected accounts command center.
- `/settings` includes a Connected Social Accounts section with reconnect and disconnect actions.
- `/schedule` demonstrates choosing a connected account and generating a manual posting checklist.

## Manual posting fallback

Manual mode works immediately:

1. Generate or paste the caption.
2. Select a connected platform.
3. Copy caption and hashtags.
4. Download media from the content workflow.
5. Open the native platform posting page.
6. Mark the scheduled item as posted.

## Future publishing path

When provider approvals are complete, enable `ENABLE_SOCIAL_AUTO_POSTING=true`, add provider-specific publish methods, and route scheduled posts through `lib/social/publisher.ts` instead of the manual checklist branch.
