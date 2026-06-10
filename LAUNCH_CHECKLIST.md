# Korvex OS — Launch Checklist

Everything code-side is done and verified (typecheck ✓, build ✓, browser smoke test ✓).
What remains is **configuration, external approvals, and operational setup** — things only you (with your accounts and keys) can do.

---

## 1. Required environment variables

Set these in Vercel (or your host) → Project → Settings → Environment Variables.

### Core (app won't fully work without these)
| Variable | What it does | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Database + auth | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public auth key | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side social account storage | Supabase → Project Settings → API (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | OAuth redirect base, e.g. `https://app.korvex.com` | Your production domain |
| `NEXT_PUBLIC_SITE_URL` | Email confirmation redirects | Same domain |
| `SOCIAL_TOKEN_ENCRYPTION_KEY` | Encrypts stored social tokens | Generate: `openssl rand -hex 32` |

### AI (pick at least one — otherwise Generator/Media Studio run in sample mode)
| Variable | Enables |
|---|---|
| `OPENAI_API_KEY` | Live post writing **and** real image generation |
| `GEMINI_API_KEY` | Live post writing (text only) |
| `OPENAI_IMAGE_MODEL` | Optional override (default `gpt-image-1`) |

### Social platforms (per platform you want connectable)
| Platform | Variables | Notes |
|---|---|---|
| Instagram + Facebook | `META_APP_ID`, `META_APP_SECRET` | One Meta app covers both |
| TikTok | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | |
| YouTube | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | |
| X / Twitter | `X_CLIENT_ID`, `X_CLIENT_SECRET` | New — added this pass |
| Auto-posting switch | `ENABLE_SOCIAL_AUTO_POSTING=true` | Only after platform approvals below |

*(Check `lib/social/providers/*.ts` for the exact env names your Meta/TikTok/Google apps use if you rename anything.)*

## 2. Supabase setup

- [ ] Run all migrations in `supabase/migrations/` against production — **including the new `202606100001_add_x_platform.sql`** (allows X accounts).
- [ ] Confirm Row Level Security policies are enabled on every table (the migrations create them; verify in dashboard → Authentication → Policies).
- [ ] Enable email confirmations + configure SMTP (Supabase → Auth → Email) so signup/reset emails actually send from your domain.
- [ ] Add your production URL to Supabase Auth → URL Configuration (redirect allowlist).

## 3. Platform app reviews (longest lead time — start now)

Each platform requires registering an app and, for publishing, passing review:

- [ ] **Meta (IG/FB):** create app at developers.facebook.com, add OAuth redirect `https://<domain>/api/social/oauth/instagram/callback` (+ facebook), request `instagram_basic`, `pages_show_list`; **App Review takes 1–4 weeks** for publishing permissions.
- [ ] **TikTok:** developers.tiktok.com → apply for **Content Posting API** (separate approval).
- [ ] **LinkedIn:** developer app + "Share on LinkedIn" product access (`w_member_social`).
- [ ] **Google/YouTube:** OAuth consent screen verification (needed to leave "unverified app" warning behind).
- [ ] **X:** developer portal → project with OAuth 2.0, redirect `https://<domain>/api/social/oauth/x/callback`; free tier allows ~500 posts/month — pick a paid tier if you need more.
- [ ] Until approvals land, keep `ENABLE_SOCIAL_AUTO_POSTING` unset — the Manual Posting Assistant already covers the gap honestly.

## 4. Product gaps to decide on (not blockers, but know they're there)

- [ ] **Persistence for new pages:** Business Profile, Brand Kit, Calendar posts, and Scheduled Posts queue currently keep state in the browser (the DB tables and generic CRUD API `/api/[resource]` already exist — wiring saves to them is the next dev task).
- [ ] **Trend Radar data:** curated editorial content right now. Fine for launch; long-term, feed it from a trends API or a weekly content-ops update.
- [ ] **Credits chip (2,450)** is cosmetic — either wire it to real usage metering or remove before launch.
- [ ] **Upgrade to Pro / Billing buttons** have no payment backend — connect Stripe or hide them for v1.
- [ ] **Video generation** is sample-only (no provider integrated).

## 5. Pre-launch hygiene

- [ ] Favicon + social share image (OG/Twitter meta tags in `app/layout.tsx`).
- [ ] Custom 404 / error pages styled to match (Next: `app/not-found.tsx`, `app/error.tsx`).
- [ ] Privacy Policy + Terms pages — **required by every social platform's app review**, link them in the auth pages footer.
- [ ] Error monitoring (Sentry or similar) + Vercel Analytics.
- [ ] Lighthouse pass on `/dashboard` and `/auth/login` after deploy (fonts load from Google Fonts CDN; consider `next/font` later for self-hosting).
- [ ] Delete leftover working files if you want a clean repo: old report `.md` files in the root, `.stitch-refs/` (keep if you want the design references), `tsconfig.tsbuildinfo`.
- [ ] Put the project in a git repo with CI running `npm run typecheck && npm run build` (it currently isn't one).

## 6. Launch-day smoke test (15 minutes)

1. Sign up with a real email → confirm → land on dashboard with your name in the sidebar.
2. Fill Business Profile to 100% → save.
3. Generate a post (should show **no** "Sample draft" notice if an AI key is set).
4. Generate an image in Media Studio (real image if OpenAI key set).
5. Connect one real social account → badge turns green → disconnect works.
6. Walk Calendar → Scheduled Posts → Analytics → Trend Radar → Brand Kit on a phone.
