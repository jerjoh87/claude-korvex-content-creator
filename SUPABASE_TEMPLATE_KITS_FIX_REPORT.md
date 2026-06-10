# Supabase Template Kits Fix Report

## Local project confirmation

Repository checked from:

```text
/workspace/korvex-content-creator
```

Current branch:

```text
work
```

Expected repository:

```text
jerjoh87/korvex-content-creator
```

No Git remote URL is configured in this local checkout, so the repository name could not be confirmed from `git remote -v`. The local path and project contents match the requested Korvex content creator project.

## Existing migration search result

No existing migration or seed file was found for the missing Business Kits tables.

Searched for:

- `business_kits`
- `template_library`
- `business_kit_templates`
- `user_selected_kits`
- `production_template_kits_setup`
- `seed`
- `migration`

Existing Supabase SQL files found were unrelated to this missing table issue:

- `supabase/migrations/0001_auth_ownership.sql`
- `supabase/migrations/20260531000000_ai_agents.sql`
- `supabase/migrations/202605310001_social_accounts.sql`

## Files created

- `supabase/production_template_kits_setup.sql`
- `SUPABASE_TEMPLATE_KITS_INSTALL.md`
- `SUPABASE_TEMPLATE_KITS_FIX_REPORT.md`

## Tables included

The setup SQL creates or repairs these `public` schema tables:

- `public.template_library`
- `public.business_kits`
- `public.business_kit_templates`
- `public.user_selected_kits`

## Production safety

The setup SQL is designed to be production-safe and idempotent:

- Uses `create extension if not exists`.
- Uses `create table if not exists`.
- Uses `alter table ... add column if not exists` for partial-table recovery.
- Uses `create index if not exists`.
- Grants the authenticated role the table privileges required for RLS-backed reads/writes.
- Grants service role explicit full table privileges for server/admin workflows.
- Adds constraints only when missing.
- Adds RLS policies only when missing.
- Seeds with `insert ... on conflict (slug) do update`.
- Links kits/templates with `on conflict (business_kit_id, template_id) do update`.
- Sends `notify pgrst, 'reload schema';` after setup to request a Supabase/PostgREST schema-cache refresh.
- Does not delete existing data.
- Does not alter UI, routing, auth, Stripe, Vercel, AI, media, or social account code.

## Seed data included

Business kits seeded: **27**

Templates seeded: **54**

Each business kit receives at least:

- 1 campaign template.
- 1 social post / hook template.

## Exact next manual steps

1. Open the Supabase dashboard.
2. Select the same project used by Vercel environment variables.
3. Go to **SQL Editor**.
4. Paste the full contents of `supabase/production_template_kits_setup.sql`.
5. Click **Run**.
6. Open **Table Editor** and confirm:
   - `business_kits`
   - `template_library`
   - `business_kit_templates`
   - `user_selected_kits`
7. Confirm the final result grid reports at least 27 active business kits, 54 active templates, and 54 kit-template links.
8. Wait **30–60 seconds** for Supabase schema cache refresh.
9. Refresh the deployed Vercel app.
10. Confirm Business Kits and Template Database load.

## Risks remaining

- If Vercel points to a different Supabase project than the one where the SQL is run, the deployed app will still show missing tables.
- If the deployed app reads these global tables before a user is authenticated, the authenticated-only read policies may block anonymous reads. The requested rule was authenticated reads only, so this setup follows that requirement.
- If production already has partially created tables with incompatible constraints or null data in required columns, the repair section may need a one-off cleanup before adding stricter constraints.
- Supabase/PostgREST schema cache can take a short time to refresh after table creation even though the SQL sends a cache reload notification.
