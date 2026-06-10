# Authentication & Ownership Readiness

## Scope

This implementation establishes Supabase Auth, session validation, protected application routes, API ownership checks, workspace ownership, and row-level security (RLS) for the AI Content Creator OS.

## Ownership Audit

| Domain | Table | `user_id` | `workspace_id` | RLS status | API ownership enforcement |
| --- | --- | --- | --- | --- | --- |
| Business profiles | `business_profiles` | Yes | Yes | Enabled | `/api/business-profiles` requires matching session user and workspace membership |
| Generated content | `generated_content` | Yes | Yes | Enabled | `/api/generated-content` requires matching session user and workspace membership |
| Campaigns | `campaigns` | Yes | Yes | Enabled | `/api/campaigns` requires matching session user and workspace membership |
| Media assets | `media_assets` | Yes | Yes | Enabled | `/api/media-assets` requires matching session user and workspace membership |
| Scheduled posts | `scheduled_posts` | Yes | Yes | Enabled | `/api/scheduled-posts` requires matching session user and workspace membership |
| Subscriptions | `subscriptions` | Yes | Yes | Enabled | `/api/subscriptions` requires matching session user and workspace membership |
| Analytics | `analytics` | Yes | Yes | Enabled | `/api/analytics` requires matching session user and workspace membership |
| Brand kit | `brand_kits` | Yes | Yes | Enabled | `/api/brand-kit` requires matching session user and workspace membership |
| Social accounts | `social_accounts` | Yes | Yes | Enabled | `/api/social-accounts` requires matching session user and workspace membership |
| Remix history | `remix_history` | Yes | Yes | Enabled | `/api/remix-history` requires matching session user and workspace membership |

## Authentication Controls

- Supabase Auth is integrated through the SSR server client.
- Middleware refreshes Auth cookies and blocks unauthenticated access to protected pages and API routes.
- Protected dashboard routes validate the session server-side before rendering.
- Login, signup, forgot password, and logout flows use Supabase Auth server actions.
- Signup creates a profile, workspace, and owner membership through the database trigger in the migration.

## Database Controls

- Every product data table includes both `user_id` and `workspace_id`.
- Foreign keys cascade user-owned data when an Auth user is deleted.
- RLS is enabled on all application tables.
- Policies require `user_id = auth.uid()` and active workspace membership for all content-domain rows.
- Workspace owner policies restrict membership management to workspace owners.
- Indexes exist on `(user_id, workspace_id)` for each owned table to support secure filtering efficiently.
- Composite foreign keys on related content tables keep campaign, content, social account, analytics, and remix references inside the same authenticated user and workspace scope.

## API Controls

- API resources are allow-listed. Unknown resources return `404`.
- `GET /api/:resource` requires a `workspace_id` query parameter and validates membership before reading.
- `POST /api/:resource` overwrites client-supplied ownership with the authenticated user's `user_id`.
- `PATCH /api/:resource/:id` requires `workspace_id`, checks membership, and updates only rows matching both `workspace_id` and authenticated `user_id`.
- `DELETE /api/:resource/:id` first resolves a row owned by the authenticated user, validates workspace membership, then deletes by `id`, `workspace_id`, and `user_id`.

## Production Deployment Checklist

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in the hosting environment.
2. Apply `supabase/migrations/0001_auth_ownership.sql` to the Supabase project.
3. Configure Supabase Auth redirect URLs for `/dashboard` and the production domain.
4. Store social provider tokens encrypted before writing to `social_accounts.encrypted_access_token` and `social_accounts.encrypted_refresh_token`.
5. Keep service-role credentials out of client and route code unless a server-only administrative workflow explicitly needs them.
6. Add automated RLS regression tests with at least two users and two workspaces before broad production rollout.
7. Review provider webhooks, if added later, so they resolve workspace ownership from trusted provider IDs and never accept client-supplied `user_id`.

## Known Follow-ups

- Add Supabase Storage bucket policies for media files using paths scoped by workspace/user.
- Add role-specific policies if admins or viewers need cross-user workspace collaboration beyond strict per-user row ownership.
- Add audit logging for authentication events and sensitive mutations such as social account token changes.
