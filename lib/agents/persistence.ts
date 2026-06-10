import type { AgentName, AgentProviderName, AgentRunRecord, SubscriptionTier, SupabaseAgentClient } from './types';

export async function recordAgentRun(params: {
  supabase?: SupabaseAgentClient;
  persist?: boolean;
  userId?: string;
  workspaceId?: string;
  agentName: AgentName;
  provider: AgentProviderName;
  status: AgentRunRecord['status'];
  tier: SubscriptionTier;
  inputSummary?: string;
  output?: unknown;
}): Promise<void> {
  if (!params.persist || !params.supabase) return;

  const insertable: AgentRunRecord = {
    user_id: params.userId,
    workspace_id: params.workspaceId,
    agent_name: params.agentName,
    provider: params.provider,
    status: params.status,
    tier: params.tier,
    input_summary: params.inputSummary,
    output: params.output,
  };

  await params.supabase.from('agent_runs').insert(insertable as unknown as Record<string, unknown>);
}

export async function storeAgentRecommendation(params: {
  supabase?: SupabaseAgentClient;
  persist?: boolean;
  userId?: string;
  workspaceId?: string;
  recommendation: Record<string, unknown>;
}): Promise<void> {
  if (!params.persist || !params.supabase) return;
  const payload = {
    user_id: params.userId,
    workspace_id: params.workspaceId,
    title: params.recommendation.title,
    description: params.recommendation.description,
    priority: params.recommendation.priority,
    connected_feature: params.recommendation.connectedFeature,
    platform: params.recommendation.platform,
    action_label: params.recommendation.actionLabel,
    evidence: params.recommendation.evidence ?? [],
  };
  await params.supabase.from('agent_recommendations').insert(payload);
}

export async function storeBrandGuardianReview(params: {
  supabase?: SupabaseAgentClient;
  persist?: boolean;
  userId?: string;
  workspaceId?: string;
  contentId?: string;
  review: Record<string, unknown>;
}): Promise<void> {
  if (!params.persist || !params.supabase) return;
  const payload = {
    user_id: params.userId,
    workspace_id: params.workspaceId,
    content_id: params.contentId,
    brand_score: params.review.brandScore ?? {},
    cta_score: params.review.ctaScore ?? {},
    clarity_score: params.review.clarityScore ?? {},
    overall_score: params.review.overallScore ?? {},
    suggested_improvements: params.review.suggestedImprovements ?? [],
    result: params.review.result,
    flags: params.review.flags ?? [],
    summary: params.review.summary,
    provider: params.review.provider,
    tier: params.review.tier,
  };
  await params.supabase.from('brand_guardian_reviews').insert(payload);
}
