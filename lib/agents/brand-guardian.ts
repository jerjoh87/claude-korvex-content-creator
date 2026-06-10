import { EnvRoutedAgentProvider } from './ai-provider';
import { recordAgentRun, storeBrandGuardianReview } from './persistence';
import { agentTierMessage } from './tier-gating';
import type { AgentExecutionContext, AgentScore, BrandGuardianInput, BrandGuardianOutput } from './types';

const AGENT_NAME = 'brand_guardian' as const;

export async function runBrandGuardianAgent(
  input: BrandGuardianInput,
  context: AgentExecutionContext,
  provider = new EnvRoutedAgentProvider(),
): Promise<BrandGuardianOutput> {
  const gated = agentTierMessage(context.tier, AGENT_NAME);
  const fallback = () => buildBrandGuardianFallback(input, context, gated);

  if (gated) return fallback();

  const response = await provider.completeJson<BrandGuardianOutput>(
    {
      agentName: AGENT_NAME,
      responseSchemaName: 'BrandGuardianOutput',
      systemPrompt: [
        'You are the AI Brand Guardian Agent for an AI Content Creator OS.',
        'Review content before approval or scheduling. Check brand voice, CTA strength, clarity, banned words, platform fit, offer quality, compliance-safe wording, spelling/grammar, and tone consistency.',
        'Return only valid JSON with scores, flags, improvements, and approve/warn result.',
      ].join('\n'),
      userPrompt: JSON.stringify({ input, context: safeContext(context) }),
    },
    fallback,
    context.providerPreference,
  );

  const output = normalizeBrandGuardianOutput(response.parsed ?? fallback(), response.provider, context.tier);
  await recordAgentRun({
    supabase: context.supabase,
    persist: context.persist,
    userId: context.userId,
    workspaceId: context.workspaceId,
    agentName: AGENT_NAME,
    provider: output.provider,
    status: response.usedFallback ? 'fallback' : 'completed',
    tier: context.tier,
    inputSummary: `content=${input.content.id ?? input.content.title ?? 'unsaved'}; platform=${input.platform ?? input.content.platform ?? 'unknown'}`,
    output,
  });

  await storeBrandGuardianReview({
    supabase: context.supabase,
    persist: context.persist,
    userId: context.userId,
    workspaceId: context.workspaceId,
    contentId: input.content.id,
    review: output as unknown as Record<string, unknown>,
  });

  return output;
}

function buildBrandGuardianFallback(input: BrandGuardianInput, context: AgentExecutionContext, gated?: string): BrandGuardianOutput {
  const body = input.content.body ?? '';
  const bannedWords = input.brandKit?.bannedWords ?? [];
  const bannedHits = bannedWords.filter((word) => body.toLowerCase().includes(word.toLowerCase()));
  const hasCTA = hasCallToAction(body, input.brandKit?.defaultCTA);
  const clarity = scoreClarity(body);
  const ctaScore = hasCTA ? 82 : 48;
  const brandScore = bannedHits.length ? 58 : 78;
  const overall = Math.round((brandScore + ctaScore + clarity) / 3);
  const flags = [...bannedHits.map((word) => `Banned word detected: ${word}`)];
  if (!hasCTA) flags.push('CTA could be stronger or more explicit.');
  if (body.length < 40) flags.push('Content may be too short to communicate the offer clearly.');

  return normalizeBrandGuardianOutput(
    {
      brandScore: buildScore('Brand voice match', brandScore, bannedHits.length ? 'Banned language reduced the brand score.' : 'Content follows available brand constraints.'),
      ctaScore: buildScore('CTA strength', ctaScore, hasCTA ? 'CTA is present.' : 'CTA is missing or weak.'),
      clarityScore: buildScore('Clarity', clarity, 'Scored with deterministic readability and length checks.'),
      overallScore: buildScore('Overall approval confidence', overall),
      suggestedImprovements: buildImprovements(hasCTA, bannedHits, body, gated),
      result: overall >= 70 && bannedHits.length === 0 ? 'approve' : 'warn',
      flags,
      summary: gated ?? 'Brand Guardian completed a lightweight deterministic review because no AI provider key was available.',
      generatedAt: context.now ?? new Date().toISOString(),
      provider: 'fallback',
      tier: context.tier,
    },
    'fallback',
    context.tier,
  );
}

function buildScore(label: string, score: number, rationale?: string): AgentScore {
  return { label, score: Math.max(0, Math.min(100, score)), maxScore: 100, rationale };
}

function hasCallToAction(body: string, defaultCTA?: string): boolean {
  const normalized = body.toLowerCase();
  const cues = ['book', 'buy', 'call', 'click', 'comment', 'dm', 'learn more', 'message', 'schedule', 'sign up', 'try'];
  return cues.some((cue) => normalized.includes(cue)) || Boolean(defaultCTA && normalized.includes(defaultCTA.toLowerCase()));
}

function scoreClarity(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 20;
  const averageWordLength = words.join('').length / words.length;
  const sentenceCount = Math.max(1, body.split(/[.!?]+/).filter(Boolean).length);
  const wordsPerSentence = words.length / sentenceCount;
  let score = 86;
  if (averageWordLength > 7) score -= 10;
  if (wordsPerSentence > 28) score -= 14;
  if (words.length < 12) score -= 16;
  return Math.max(35, score);
}

function buildImprovements(hasCTA: boolean, bannedHits: string[], body: string, gated?: string): string[] {
  const improvements: string[] = [];
  if (gated) improvements.push(gated);
  if (!hasCTA) improvements.push('Add a direct CTA that tells the audience exactly what to do next.');
  if (bannedHits.length) improvements.push(`Replace banned words before scheduling: ${bannedHits.join(', ')}.`);
  if (body.length < 80) improvements.push('Add one proof point, benefit, or offer detail to improve clarity.');
  if (!improvements.length) improvements.push('Content is ready; consider testing a stronger hook for better engagement.');
  return improvements;
}

function normalizeBrandGuardianOutput(
  output: BrandGuardianOutput,
  providerName: BrandGuardianOutput['provider'],
  tier: BrandGuardianOutput['tier'],
): BrandGuardianOutput {
  const overall = output.overallScore ?? buildScore('Overall approval confidence', Math.round(((output.brandScore?.score ?? 70) + (output.ctaScore?.score ?? 70) + (output.clarityScore?.score ?? 70)) / 3));
  return {
    ...output,
    brandScore: output.brandScore ?? buildScore('Brand voice match', 70),
    ctaScore: output.ctaScore ?? buildScore('CTA strength', 70),
    clarityScore: output.clarityScore ?? buildScore('Clarity', 70),
    overallScore: overall,
    suggestedImprovements: output.suggestedImprovements?.length ? output.suggestedImprovements : ['Review content before scheduling.'],
    result: output.result ?? (overall.score >= 70 ? 'approve' : 'warn'),
    flags: output.flags ?? [],
    summary: output.summary ?? 'Brand Guardian review is ready.',
    generatedAt: output.generatedAt ?? new Date().toISOString(),
    provider: providerName,
    tier,
  };
}

function safeContext(context: AgentExecutionContext): Omit<AgentExecutionContext, 'supabase'> {
  const { supabase: _supabase, ...safe } = context;
  return safe;
}
