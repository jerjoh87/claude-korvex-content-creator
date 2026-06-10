import type { AgentName, SubscriptionTier } from './types';

const TIER_RANK: Record<SubscriptionTier, number> = {
  starter: 1,
  pro: 2,
  elite: 3,
};

const REQUIRED_TIER: Record<AgentName, SubscriptionTier> = {
  marketing_director: 'pro',
  content_repurposer: 'pro',
  brand_guardian: 'elite',
};

export function canUseAgent(tier: SubscriptionTier, agentName: AgentName): boolean {
  if (tier === 'starter' && agentName === 'marketing_director') return true;
  return TIER_RANK[tier] >= TIER_RANK[REQUIRED_TIER[agentName]];
}

export function agentTierMessage(tier: SubscriptionTier, agentName: AgentName): string | undefined {
  if (canUseAgent(tier, agentName)) return undefined;
  const required = REQUIRED_TIER[agentName];
  return `${agentName.replace(/_/g, ' ')} requires the ${required} plan.`;
}

export function isAdvancedStrategyUnlocked(tier: SubscriptionTier): boolean {
  return tier === 'elite';
}
