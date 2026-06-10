import { EnvRoutedAgentProvider } from './ai-provider';
import { recordAgentRun } from './persistence';
import { agentTierMessage } from './tier-gating';
import type { AgentExecutionContext, ContentRepurposerInput, ContentRepurposerOutput, Platform, RepurposedAsset } from './types';

const AGENT_NAME = 'content_repurposer' as const;
const DEFAULT_PLATFORMS: Platform[] = ['instagram', 'tiktok', 'facebook', 'linkedin', 'email', 'sms', 'ads'];

export async function runContentRepurposerAgent(
  input: ContentRepurposerInput,
  context: AgentExecutionContext,
  provider = new EnvRoutedAgentProvider(),
): Promise<ContentRepurposerOutput> {
  const gated = agentTierMessage(context.tier, AGENT_NAME);
  const fallback = () => buildRepurposerFallback(input, context, gated);

  if (gated) return fallback();

  const response = await provider.completeJson<ContentRepurposerOutput>(
    {
      agentName: AGENT_NAME,
      responseSchemaName: 'ContentRepurposerOutput',
      systemPrompt: [
        'You are the AI Content Repurposing Agent for an AI Content Creator OS.',
        'Transform one source asset into platform-ready versions while preserving brand voice and offer intent.',
        'Return only valid JSON. Include Instagram, TikTok/Reel script, Facebook, LinkedIn, email, SMS, ad copy, and carousel outline when relevant.',
      ].join('\n'),
      userPrompt: JSON.stringify({ input, context: safeContext(context) }),
    },
    fallback,
    context.providerPreference,
  );

  const output = normalizeRepurposerOutput(response.parsed ?? fallback(), response.provider, context.tier, input.targetPlatforms);
  await recordAgentRun({
    supabase: context.supabase,
    persist: context.persist,
    userId: context.userId,
    workspaceId: context.workspaceId,
    agentName: AGENT_NAME,
    provider: output.provider,
    status: response.usedFallback ? 'fallback' : 'completed',
    tier: context.tier,
    inputSummary: `source=${input.sourceContent.id ?? input.sourceContent.title ?? 'unsaved'}; targets=${output.assets.length}`,
    output,
  });

  return output;
}

function buildRepurposerFallback(input: ContentRepurposerInput, context: AgentExecutionContext, gated?: string): ContentRepurposerOutput {
  const targets = input.targetPlatforms?.length ? input.targetPlatforms : DEFAULT_PLATFORMS;
  const source = input.sourceContent.body.trim();
  const cta = input.brandKit?.defaultCTA ?? 'Message us to get started.';
  const assets = targets.map((platform) => buildPlatformAsset(platform, source, cta));

  return normalizeRepurposerOutput(
    {
      assets,
      carouselOutline: [
        'Slide 1: Bold promise or pain-point hook',
        'Slide 2: Explain the problem in customer language',
        'Slide 3: Show the transformation or benefit',
        'Slide 4: Add proof, example, or process',
        `Slide 5: Close with CTA — ${cta}`,
      ],
      recommendedPublishingOrder: targets,
      summary: gated ?? 'Repurposed content generated with deterministic templates because no AI provider key was available.',
      generatedAt: context.now ?? new Date().toISOString(),
      provider: 'fallback',
      tier: context.tier,
    },
    'fallback',
    context.tier,
    targets,
  );
}

function buildPlatformAsset(platform: Platform, source: string, cta: string): RepurposedAsset {
  const shortSource = source.length > 420 ? `${source.slice(0, 417)}...` : source;
  const map: Record<Platform, RepurposedAsset> = {
    instagram: {
      platform,
      format: 'caption',
      title: 'Instagram Version',
      body: `Hook: Here is what your audience needs to know today.\n\n${shortSource}\n\nCTA: ${cta}`,
      cta,
      notes: ['Pair with a strong visual from the media library.', 'Use 3-5 niche hashtags.'],
    },
    tiktok: {
      platform,
      format: 'short_video_script',
      title: 'TikTok/Reel Script',
      body: `0-2s hook: Stop scrolling if this matters to you.\n3-15s value: ${shortSource}\n16-22s CTA: ${cta}`,
      cta,
      notes: ['Use fast cuts and on-screen captions.'],
    },
    facebook: {
      platform,
      format: 'post',
      title: 'Facebook Version',
      body: `${shortSource}\n\nWhat questions do you have? ${cta}`,
      cta,
    },
    linkedin: {
      platform,
      format: 'professional_post',
      title: 'LinkedIn Version',
      body: `A practical insight for teams and business owners:\n\n${shortSource}\n\n${cta}`,
      cta,
    },
    email: {
      platform,
      format: 'email',
      title: 'Email Version',
      body: `Subject: A quick idea for your next win\n\nHi there,\n\n${shortSource}\n\n${cta}`,
      cta,
    },
    sms: {
      platform,
      format: 'sms',
      title: 'SMS Version',
      body: `${shortSource.slice(0, 120)} ${cta}`,
      cta,
    },
    ads: {
      platform,
      format: 'ad_copy',
      title: 'Ad Copy Version',
      body: `Primary text: ${shortSource}\nHeadline: Get the result faster\nCTA: ${cta}`,
      cta,
    },
    blog: {
      platform,
      format: 'outline',
      title: 'Blog Outline',
      body: `Intro\n- ${shortSource}\n\nBody\n- Problem\n- Solution\n- Proof\n\nCTA\n- ${cta}`,
      cta,
    },
    youtube: {
      platform,
      format: 'short_script',
      title: 'YouTube Short Script',
      body: `Opening hook\n${shortSource}\nClosing CTA: ${cta}`,
      cta,
    },
    x: {
      platform,
      format: 'short_post',
      title: 'X Post',
      body: `${shortSource.slice(0, 220)}\n\n${cta}`,
      cta,
    },
  };
  return map[platform];
}

function normalizeRepurposerOutput(
  output: ContentRepurposerOutput,
  providerName: ContentRepurposerOutput['provider'],
  tier: ContentRepurposerOutput['tier'],
  targets = DEFAULT_PLATFORMS,
): ContentRepurposerOutput {
  return {
    ...output,
    assets: output.assets?.length ? output.assets : targets.map((platform) => buildPlatformAsset(platform, '', 'Learn more.')),
    carouselOutline: output.carouselOutline ?? [],
    recommendedPublishingOrder: output.recommendedPublishingOrder?.length ? output.recommendedPublishingOrder : targets,
    summary: output.summary ?? 'Repurposed assets are ready for Campaign Vault and Media Library.',
    generatedAt: output.generatedAt ?? new Date().toISOString(),
    provider: providerName,
    tier,
  };
}

function safeContext(context: AgentExecutionContext): Omit<AgentExecutionContext, 'supabase'> {
  const { supabase: _supabase, ...safe } = context;
  return safe;
}
