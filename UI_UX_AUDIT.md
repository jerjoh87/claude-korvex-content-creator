# Korvex OS — UI/UX Audit & Redesign Report

**Date:** June 10, 2026
**Scope:** Full design + UX pass across the app, aligned to the **"AI Content OS Dashboard"** Google Stitch project (11 reference screens, saved locally in `.stitch-refs/` for future iterations).

---

## 1. Executive summary

The app had good bones (Supabase auth, social OAuth plumbing, prompt library) but the UI was unfinished and structurally broken in ways no styling pass could fix:

1. **The project could not build.** There was no `package.json` and no `node_modules` — typecheck, build, and dev server were all impossible.
2. **7 of the 9 core pages did not exist.** The sidebar listed 12 destinations, but most pointed at the wrong page (e.g. *AI Media Studio* → Social Accounts, *Brand Kit* → Settings, *Analytics* → Growth Coach). A user clicking a nav item got a page that didn't match the label — the single biggest trust-killer in the old UX.
3. **Four different design languages** coexisted: a light SaaS look (auth), a glassy indigo look (prompt library), a neon "content-os" look (dashboard), and two separate landing-page styles. Nothing felt like one product.

All three problems are now fixed. The app builds cleanly, every nav label leads to a real, dedicated page, and a single Stitch-derived design system (`app/korvex-ui.css` + `components/ui/kx.tsx`) styles everything.

---

## 2. Global issues found → fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | No `package.json` / `node_modules`; repo couldn't build or typecheck | Created `package.json` (Next 15, React 19, Supabase, Zod), installed deps, fixed all 26 pre-existing TS errors → `tsc --noEmit` and `next build` both pass |
| 2 | Sidebar labels mapped to wrong/duplicate routes | New shell with 12 correct routes; created the 7 missing pages |
| 3 | Numbered text nav ("01, 02…") with no icons | Material Symbols icons, filled icon + glowing left bar on the active item (matches Stitch) |
| 4 | Dashboard re-implemented its own sidebar inline instead of using the shared shell | Dashboard now uses `ContentOsAppShell` like every other page |
| 5 | 4 conflicting visual languages | One design system: deep-space `#0a0e18` background with radial mesh, glass cards, cyan `#00dce6` primary, purple `#7900cd` secondary, Inter type scale, 12px radius — all tokens taken from the Stitch project's Tailwind config |
| 6 | Mobile: fixed 288px sidebar + `min-width: 820px` main column forced horizontal scrolling on phones | Sidebar collapses to a sticky horizontal icon nav under 1024px; all grids collapse to 1 column under 720px; search bar reflows |
| 7 | Jargon-heavy copy everywhere ("Secure OAuth command center for every client channel", "token status: missing") | Beginner-friendly microcopy on all pages; every page header answers *what is this page for* and the primary button answers *what do I do first* |
| 8 | No empty states, no loading states, no toasts | Reusable `EmptyState`, skeleton shimmer, spinner, and toast components used on every interactive page |
| 9 | Dead/duplicate files: `app/page 2.tsx` (accidental copy of the landing page) | Deleted |
| 10 | A pre-existing crash bug: `PromptLibraryDashboard` referenced an undefined `copyNotice` variable | Removed the dead reference (copy feedback already flows through `showNotice`) |
| 11 | `social_accounts` table missing from the Supabase `Database` type → every social query typed as `never` | Added the table definition (mirrors `supabase/migrations/202605310001_social_accounts.sql`) and `Relationships` fields newer supabase-js requires |
| 12 | `@supabase/ssr@0.6` incompatible with installed `supabase-js@2.108` (broke type inference project-wide) | Upgraded to `@supabase/ssr@0.12` |

---

## 3. Page-by-page notes

### Dashboard (`/dashboard`) — redesigned
- **Before:** own inline sidebar, hand-tuned neon CSS, fake search, no clear primary action.
- **After:** shared shell, welcome header with live-status badge and one obvious CTA (*Generate Content*), 4 stat cards, gradient bar chart, Quick Actions list with correct destinations, Engagement Quality ring, Recent Content tiles with status pills, Trend Radar teaser linking to the real Trend Radar page.

### Business Profile (`/business-profile`) — **new page**
- Was a sidebar label pointing at Settings. Now a guided profile hub:
- **Profile completion bar** (computed live from 8 checks) with "Ready for AI" state.
- Sections: Business Info, Location & Services (chip-based service list), Brand Voice (tone slider with named stops + CTA picker), Goals (multi-select chips), Target Audience (write a description → save as persona cards, with a friendly empty state).
- Save shows a confirmation toast: *"Profile saved — your AI content just got smarter."*

### Content Generator (`/content-generator`) — **new page**
- Guided 4-step flow with a progress step indicator: **Goal → Platform → Content type → Topic → Generate**. The Generate button stays disabled (with an explanatory hint) until all steps are done.
- Output panel: AI-gradient-border result card with hook, body, hashtags, engagement-score ring, and actions — **Copy / Save to Library / Schedule It / Try Again**.
- Skeleton loading state while generating; "What happens next?" helper card; empty state before first generation.
- Accepts `?topic=` so Trend Radar can pre-fill it.

### AI Media Studio (`/media-studio`) — **new page**
- Premium creative studio: prompt builder with concrete help text ("mention a subject, a setting, and a mood…"), Image/Video toggle, aspect-ratio chips (1:1, 16:9, 9:16, 4:5), style chips.
- Generate adds a tile to **Recent Generations** with a "Generating…" → "Ready" transition; download/reuse actions per tile.
- **Magic Editor** side panel (upscale, smart filters) matching the Stitch screen.

### Content Calendar (`/calendar`) — **new page**
- Real month grid built from the current date, with today highlighted.
- **Month/Week toggle** (week view = friendly day-by-day list with per-day "generate a post" hints).
- Status system matching the brief: **Draft / Ready / Scheduled / Posted** color-coded badges + legend.
- Platform filter chips, post-count badge, AI Drafts panel (one-click schedule), Active Campaigns panel, filter-aware empty state.
- Old `/schedule` route now redirects here so existing links keep working.

### Scheduled Posts (`/scheduled-posts`) — **new page**
- Clean publishing queue grouped **Today / Tomorrow / This Week**: time + relative time, preview thumbnail, platform pill, status pill, edit / reschedule / delete actions.
- Stats row (In Queue, Going Out Today, Needs Review), platform filters, Pause Queue.
- Beginner empty state: *"No scheduled posts yet… Create your first post and pick a time — we'll handle the rest."*
- The existing **Manual Posting Assistant** (a real feature) moved here from the old `/schedule` page, restyled, with green/amber readiness pills instead of raw text.

### Social Accounts (`/social/accounts`) — redesigned
- Kept all real functionality (OAuth connect URLs, disconnect API, token health) but humanized it: "Needs reconnect" instead of "token status: expired", pulse-dot Connected badges, per-card "takes about 30 seconds" reassurance.
- Stats row (Connected / Needs Attention / Available), **X (Twitter) "Coming soon" card** with a manual-posting path, and a "Why connect your accounts?" explainer (post automatically / see what works / safe & private).

### Analytics (`/analytics`) — **new page**
- Stat cards with deltas (Estimated ROI, Conversion Rate, Total Reach, Engagement Rate) and plain-English notes ("people who clicked, then acted").
- Growth bar chart with platform segments, **Best Time to Post** mini-heatmap ("AI suggests Wednesday 3 PM"), Top Platforms with progress bars and notes ("Your strongest channel").
- **"What should I do next?"** — three plain-English AI insight cards (*Post more Reels this week*, *Post Wednesday ~3 PM*, *Double down on transformation content*), each with a one-click action into the Generator, Calendar, or Trend Radar.

### AI Trend Radar (`/trend-radar`) — **new page**
- Trend command center: **industry + platform filters**, live badge, trend-count pill.
- **Mega Trend** card (AI gradient border) with velocity, hashtags, platform fit, difficulty badge, a concrete "content idea for you", and **Generate Content From This Trend** (deep-links into the Generator with the topic pre-filled).
- Trend cards with Easy/Medium/Hard difficulty pills; Viral Hooks list with scores and "Use Hook"; Sentiment bar; Keyword Cloud; Configure Alerts card. Filter-aware empty state.

### Brand Kit (`/brand-kit`) — **new page**
- Visual board: logo tiles (dark/light) + drag-to-upload tile, primary/accent color swatches with hex labels, typography cards with live samples.
- **AI Brand Voice** card (gradient border): tone, audience, words to use/avoid, "Train AI Voice".
- **Brand Consistency Score** ring (computed from a 6-item checklist with Done/To-do pills), Sample Captions with edit actions, Media Style picker, Export Assets / Save Changes.

### Settings (`/settings`) — redesigned
- Was a duplicate of Social Accounts. Now a true settings hub: connection-health stats, link cards to Business Profile / Brand Kit / Social Accounts, and Plan & Billing.

### Growth Coach & Prompt Library — preserved
- Kept fully functional under the new shell (legacy styles still apply via a scoped wrapper). Prompt Library is now reachable as **AI Campaigns** in the nav.

---

## 4. New design system & reusable components

**`app/korvex-ui.css`** — tokens + components extracted from the Stitch screens:
- Tokens: `--kx-bg #0a0e18`, primary `#00dce6`, secondary `#ddb7ff`/`#7900cd`, success `#55f888`, glass surfaces, 8/12px radii, teal glow, cyan→purple CTA gradient.
- Shell (fixed sidebar → horizontal mobile nav), topbar with search + credits chip.
- Components: glass cards (+ `is-ai` gradient-border variant), stat cards, buttons (primary/secondary/ghost/danger/sm/icon), status badges (6 tones, pulse dots), inputs/selects/textareas/sliders, selectable chips, segmented controls, empty states, progress bars, conic score rings, queue rows, calendar grid, media tiles, swatches, upload tiles, skeletons, spinners, toasts, step indicators.
- Responsive breakpoints at 1240 / 1024 / 720px.

**`components/ui/kx.tsx`** — server-component-safe React primitives: `Icon`, `PageHeader`, `SectionHeader`, `Card`, `StatCard`, `Badge`, `EmptyState`, `ProgressBar`, `Ring`.

**Feature components:** `BusinessProfileEditor`, `ContentGeneratorStudio`, `MediaStudio`, `ContentCalendar`, `ScheduledPostsQueue`, `TrendRadar`, `BrandKitBoard`; rebuilt `ContentOsAppShell`, `SocialAccountCard`, `ManualPostingAssistant`, `DisconnectButton`.

---

## 5. Verification

- `npx tsc --noEmit` — **0 errors** (was 26 pre-existing errors once deps were installed).
- `npx next build` — **passes**; 21 routes compile, all new pages present.
- Visual smoke test via local dev server: Business Profile, Content Generator, Calendar, Trend Radar, Analytics, Social Accounts, Brand Kit verified at desktop and narrow widths; **zero browser console errors**; mobile nav collapse confirmed.

## 6. Remaining items — resolved in the follow-up pass (June 10, 2026)

| Item | Resolution |
|------|------------|
| Generator used demo logic | New `/api/ai/generate-post` route uses the existing `EnvRoutedAgentProvider` (OpenAI or Gemini via `OPENAI_API_KEY` / `GEMINI_API_KEY`). Without a key it gracefully falls back to the local template and the draft card shows a "Sample draft" notice telling you which env var enables live AI. |
| Media Studio used demo tiles | New `/api/ai/generate-media` route generates real images via OpenAI Images (`gpt-image-1`, ratio-aware sizing) when `OPENAI_API_KEY` is set; otherwise styled placeholder tiles with an honest "sample mode" toast. Video stays sample-only (no provider yet). |
| X (Twitter) was UI-only | Full OAuth 2.0 + PKCE provider (`lib/social/providers/x.ts`), `x` added to platform types/config/factory, DB migration `202606100001_add_x_platform.sql` extends the platform check constraint, and the Social Accounts page now renders a real X connect card. Requires `X_CLIENT_ID` / `X_CLIENT_SECRET`. |
| Auth pages were old light theme | Login, Signup, and Forgot Password rebuilt on a shared `AuthShell` with the Korvex dark glass style, brand mark, friendly copy, and a "Try the demo workspace" path. |
| Header user was hardcoded "Marcus Vance" | New `getShellUser()` helper reads the Supabase session (full name → email prefix → demo cookie → Guest); the sidebar profile and the dashboard greeting are now live. |
| Unused vanilla demo (`index.html` + `src/`) | Deleted. |

Re-verified after the pass: `tsc --noEmit` clean, `next build` passes, generator flow exercised end-to-end in the browser (steps → generate → fallback draft + notice), login page and all 6 platform cards render, zero console errors.

## 7. Pre-launch checklist

See `LAUNCH_CHECKLIST.md` for the full list of environment variables, platform app reviews, and go-live steps.
