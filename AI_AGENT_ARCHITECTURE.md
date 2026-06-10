# AI Agent Architecture

This document defines the lightweight AI agent system for the AI Content Creator OS. The goal is to make the product feel like a full AI marketing team while keeping the existing backend, Supabase, Stripe, billing, social account, media generation, campaign generation, and content generation logic safe behind a small shared service layer.

## Design Principles

- **Lightweight orchestration:** agents are TypeScript functions, not a separate workflow engine.
- **Provider-routed:** agents use the shared `EnvRoutedAgentProvider`, which tries OpenAI first, Gemini second, and can accept future providers through the same request/response contract.
- **Graceful fallback:** every agent returns deterministic local output when AI keys are missing or a provider fails.
- **Tier-aware:** Starter receives basic recommendations, Pro unlocks the Marketing Director and Repurposing Agent, and Elite unlocks Brand Guardian plus advanced strategy insights.
- **Persistence is optional:** callers can pass a Supabase client and `persist: true` to store useful runs, recommendations, reviews, and scores.
- **Non-invasive integration:** existing product flows can call the agent layer without replacing current generation, billing, scheduling, or media pipelines.

## File Map

- `lib/agents/types.ts` — shared inputs, outputs, agent run records, tier names, platform names, content, media, campaign, analytics, brand, and Supabase client contracts.
- `lib/agents/ai-provider.ts` — OpenAI/Gemini/fallback routing for JSON agent responses.
- `lib/agents/tier-gating.ts` — feature access rules for Starter, Pro, and Elite.
- `lib/agents/persistence.ts` — optional Supabase write helpers for agent runs, recommendations, and Brand Guardian reviews.
- `lib/agents/marketing-director.ts` — AI Marketing Director implementation.
- `lib/agents/content-repurposer.ts` — AI Content Repurposing Agent implementation.
- `lib/agents/brand-guardian.ts` — AI Brand Guardian implementation.
- `components/agents/agent-command-center.ts` — framework-agnostic dashboard/media-library widget view models and premium command-center CSS.
- `supabase/migrations/20260531000000_ai_agents.sql` — optional persistence tables.

## Agent 1: AI Marketing Director

### Purpose

Acts as the main strategy brain of the platform and turns business signals into daily marketing direction.

### Inputs

- Business profile
- Brand kit
- Content calendar
- Campaign history
- Analytics
- Media library
- Scheduled posts

### Outputs

- Daily growth recommendations
- Best content to post today
- Best campaign to run
- Best platform to focus on
- Next best action
- Missed opportunities

### Connected Features

- Dashboard: show the primary recommendation card.
- Growth Coach: explain the rationale and give tactical next steps.
- Opportunity Feed: surface missed posts, weak follow-ups, and platform gaps.
- Weekly Planner: transform recommendations into scheduled actions.

### Tier Gating

- Starter: basic deterministic or AI-assisted recommendation.
- Pro: full Marketing Director recommendations.
- Elite: advanced strategy insights and premium recommendations.

## Agent 2: AI Content Repurposing Agent

### Purpose

Turns one source content asset into many platform-ready assets while preserving brand voice and campaign intent.

### Inputs

- Existing generated content
- Campaign assets
- Media library
- Brand kit
- Optional target platforms

### Outputs

- Instagram version
- TikTok/Reel script
- Facebook version
- LinkedIn version
- Email version
- SMS version
- Ad copy version
- Carousel outline
- Recommended publishing order

### Connected Features

- Content Remix Engine: generate platform variants.
- Media Library: mark assets as ready to remix or repurposed.
- Campaign Vault: create campaign-specific derivative assets.

### Tier Gating

- Starter: locked fallback message encouraging upgrade.
- Pro: full repurposing agent.
- Elite: full repurposing agent, ready to be combined with Brand Guardian review.

## Agent 3: AI Brand Guardian

### Purpose

Reviews content before approval or scheduling so the app feels like it has a brand reviewer and compliance-minded editor built in.

### Checks

- Brand voice match
- CTA strength
- Clarity
- Banned words
- Platform fit
- Offer quality
- Compliance-safe wording
- Spelling/grammar
- Tone consistency

### Outputs

- Brand score
- CTA score
- Clarity score
- Overall score
- Suggested improvements
- Approve/warn result
- Flags and summary

### Connected Features

- Content Generator: review generated drafts before approval.
- Campaign Generator: review campaign copy and offers.
- Scheduled Posts: warn before scheduling weak or off-brand posts.
- Media Library: show reviewed status and next action.
- Brand Kit: use voice, tone, banned words, compliance notes, and default CTA.

### Tier Gating

- Starter: locked fallback review result.
- Pro: locked fallback review result.
- Elite: full Brand Guardian review and advanced scoring.

## Persistence Model

The optional Supabase migration creates:

1. `agent_runs` — stores every useful agent execution, provider, status, tier, input summary, and JSON output.
2. `agent_recommendations` — stores actionable Marketing Director recommendations for dashboards, Growth Coach, Opportunity Feed, and Weekly Planner.
3. `brand_guardian_reviews` — stores review scores, flags, suggestions, result, provider, and tier.

The tables use nullable `user_id` and `workspace_id` so they can be attached to whatever account/workspace model already exists. Row-level security is enabled; projects should attach policies that match their existing auth and workspace membership rules.

## UI Integration

`buildAgentDashboardWidgets` returns three premium dashboard cards:

- AI Marketing Director
- Brand Guardian Score
- Suggested Next Actions

The exported CSS keeps the dark luxury fintech style with glassmorphism, glowing status cards, animated thinking states, premium score visuals, and responsive single-column mobile layout.

`buildMediaLibraryAgentBadges` gives each asset badges for:

- Brand Guardian reviewed / needs review
- Repurposed available / ready to remix
- Recommended next action

## Example Usage

```ts
import {
  runBrandGuardianAgent,
  runContentRepurposerAgent,
  runMarketingDirectorAgent,
} from './lib/agents';

const context = {
  userId: user.id,
  workspaceId: workspace.id,
  tier: subscriptionTier,
  timezone: 'America/New_York',
  persist: true,
  supabase,
} as const;

const director = await runMarketingDirectorAgent({
  businessProfile,
  brandKit,
  contentCalendar,
  campaignHistory,
  analytics,
  mediaLibrary,
  scheduledPosts,
}, context);

const repurposed = await runContentRepurposerAgent({
  sourceContent: generatedContent,
  campaignAssets,
  mediaLibrary,
  brandKit,
}, context);

const review = await runBrandGuardianAgent({
  content: generatedContent,
  brandKit,
  platform: generatedContent.platform,
}, context);
```

## Future Agent Expansion

The current layer can add future agents without changing existing feature code:

- **AI Ad Buyer Agent:** budget suggestions, audience tests, and creative diagnostics.
- **AI SEO Strategist Agent:** keyword clusters, blog plans, and local SEO opportunities.
- **AI Customer Voice Agent:** mines reviews, comments, and FAQs for messaging angles.
- **AI Retention Agent:** email/SMS lifecycle recommendations and churn-prevention prompts.
- **AI Competitive Intelligence Agent:** tracks competitor content patterns and positioning gaps.

To add an agent, define its input/output types, add tier rules, implement provider prompts plus deterministic fallback, and optionally persist its high-value outputs in `agent_runs` or a feature-specific table.
