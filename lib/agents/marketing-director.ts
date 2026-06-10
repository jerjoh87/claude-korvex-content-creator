import { EnvRoutedAgentProvider } from './ai-provider';
import { recordAgentRun, storeAgentRecommendation } from './persistence';
import { agentTierMessage, isAdvancedStrategyUnlocked } from './tier-gating';
import type { AgentExecutionContext, AgentRecommendation, MarketingDirectorInput, MarketingDirectorOutput, Platform } from './types';

const AGENT_NAME = 'marketing_director' as const;

export async function runMarketingDirectorAgent(
  input: MarketingDirectorInput,
  context: AgentExecutionContext,
  provider = new EnvRoutedAgentProvider(),
): Promise<MarketingDirectorOutput> {
  const gated = agentTierMessage(context.tier, AGENT_NAME);
  const fallback = () => buildMarketingDirectorFallback(input, context, gated);

  if (gated && context.tier !== 'starter') return fallback();

  const response = await provider.completeJson<MarketingDirectorOutput>(
    {
      agentName: AGENT_NAME,
      responseSchemaName: 'MarketingDirectorOutput',
      systemPrompt: [
        'You are the AI Marketing Director for a small-business AI Content Creator OS.',
        'Return only valid JSON matching the requested schema. Be concise, tactical, and tied to available business data.',
        context.tier === 'starter'
          ? 'Starter plan: provide basic recommendations only, with no advanced strategy insights.'
          : 'Pro/Elite plan: provide practical strategy recommendations connected to dashboard, Growth Coach, Opportunity Feed, and Weekly Planner.',
        isAdvancedStrategyUnlocked(context.tier) ? 'Elite plan: include deeper strategic insight and premium recommendations.' : '',
      ].join('\n'),
      userPrompt: JSON.stringify({ input, context: safeContext(context) }),
    },
    fallback,
    context.providerPreference,
  );

  const output = normalizeMarketingDirectorOutput(response.parsed ?? fallback(), response.provider, context.tier);
  await recordAgentRun({
    supabase: context.supabase,
    persist: context.persist,
    userId: context.userId,
    workspaceId: context.workspaceId,
    agentName: AGENT_NAME,
    provider: output.provider,
    status: response.usedFallback ? 'fallback' : 'completed',
    tier: context.tier,
    inputSummary: summarizeDirectorInput(input),
    output,
  });

  await Promise.all(
    output.dailyGrowthRecommendations.map((recommendation) =>
      storeAgentRecommendation({
        supabase: context.supabase,
        persist: context.persist,
        userId: context.userId,
        workspaceId: context.workspaceId,
        recommendation: recommendation as unknown as Record<string, unknown>,
      }),
    ),
  );

  return output;
}

function buildMarketingDirectorFallback(
  input: MarketingDirectorInput,
  context: AgentExecutionContext,
  gated?: string,
): MarketingDirectorOutput {
  const platform = choosePlatform(input);
  const hasMissedPosts = input.contentCalendar?.some((item) => item.status === 'missed') ?? false;
  const baseRecommendations: AgentRecommendation[] = [
    {
      title: 'Post one high-intent piece of content today',
      description: gated ?? `Focus on ${platform} with a clear offer, proof point, and direct call to action.`,
      priority: 'high',
      connectedFeature: 'dashboard',
      platform,
      actionLabel: 'Create today\'s post',
      evidence: input.analytics?.topPlatform ? [`Top platform signal: ${input.analytics.topPlatform}`] : ['Fallback recommendation generated without an AI key.'],
    },
    {
      title: 'Turn recent assets into a weekly mini-campaign',
      description: 'Use the strongest existing asset as the anchor and schedule three supporting posts around it.',
      priority: 'medium',
      connectedFeature: 'weekly_planner',
      platform,
      actionLabel: 'Plan campaign',
    },
  ];

  if (context.tier === 'starter') baseRecommendations.splice(1);

  const missedOpportunities: AgentRecommendation[] = hasMissedPosts
    ? [
        {
          title: 'Recover missed scheduled posts',
          description: 'Reschedule missed posts with updated hooks instead of letting the content calendar go stale.',
          priority: 'high',
          connectedFeature: 'opportunity_feed',
          actionLabel: 'Review missed posts',
        },
      ]
    : [
        {
          title: 'Add a conversion-focused follow-up',
          description: 'Pair awareness content with a direct offer or lead-capture follow-up.',
          priority: 'medium',
          connectedFeature: 'growth_coach',
          actionLabel: 'Add follow-up',
        },
      ];

  return normalizeMarketingDirectorOutput(
    {
      dailyGrowthRecommendations: baseRecommendations,
      bestContentToPostToday: baseRecommendations[0],
      bestCampaignToRun: baseRecommendations[1] ?? baseRecommendations[0],
      bestPlatformToFocusOn: platform,
      nextBestAction: baseRecommendations[0],
      missedOpportunities,
      summary: gated ?? 'Your AI Marketing Director generated lightweight recommendations using local business signals.',
      generatedAt: context.now ?? new Date().toISOString(),
      provider: 'fallback',
      tier: context.tier,
    },
    'fallback',
    context.tier,
  );
}

function normalizeMarketingDirectorOutput(
  output: MarketingDirectorOutput,
  providerName: MarketingDirectorOutput['provider'],
  tier: MarketingDirectorOutput['tier'],
): MarketingDirectorOutput {
  const generatedAt = output.generatedAt ?? new Date().toISOString();
  const dailyGrowthRecommendations = output.dailyGrowthRecommendations?.length ? output.dailyGrowthRecommendations : [];
  const nextBestAction = output.nextBestAction ?? dailyGrowthRecommendations[0] ?? {
    title: 'Review your next marketing action',
    description: 'Add more business data to unlock stronger recommendations.',
    priority: 'medium',
    connectedFeature: 'dashboard',
    actionLabel: 'Open dashboard',
  };

  return {
    ...output,
    dailyGrowthRecommendations,
    nextBestAction,
    bestContentToPostToday: output.bestContentToPostToday ?? nextBestAction,
    bestCampaignToRun: output.bestCampaignToRun ?? nextBestAction,
    bestPlatformToFocusOn: output.bestPlatformToFocusOn ?? nextBestAction.platform ?? 'instagram',
    missedOpportunities: output.missedOpportunities ?? [],
    summary: output.summary ?? 'AI Marketing Director recommendations are ready.',
    generatedAt,
    provider: providerName,
    tier,
  };
}

function choosePlatform(input: MarketingDirectorInput): Platform {
  if (input.analytics?.topPlatform) return input.analytics.topPlatform;
  const scheduled = input.scheduledPosts?.[0]?.platform ?? input.contentCalendar?.[0]?.platform;
  return scheduled ?? 'instagram';
}

function safeContext(context: AgentExecutionContext): Omit<AgentExecutionContext, 'supabase'> {
  const { supabase: _supabase, ...safe } = context;
  return safe;
}

function summarizeDirectorInput(input: MarketingDirectorInput): string {
  return `campaigns=${input.campaignHistory?.length ?? 0}; calendar=${input.contentCalendar?.length ?? 0}; media=${input.mediaLibrary?.length ?? 0}`;
}
