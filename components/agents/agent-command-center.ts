import type { BrandGuardianOutput, MarketingDirectorOutput, MediaAsset, SubscriptionTier } from '../../lib/agents';

export interface AgentCommandCenterViewModel {
  tier: SubscriptionTier;
  marketingDirector?: MarketingDirectorOutput;
  brandGuardian?: BrandGuardianOutput;
  mediaAssets?: MediaAsset[];
}

export interface AgentWidgetCard {
  id: string;
  title: string;
  eyebrow: string;
  status: 'thinking' | 'ready' | 'locked' | 'warning';
  score?: number;
  body: string;
  actionLabel?: string;
  accent: 'violet' | 'cyan' | 'gold' | 'rose';
}

export function buildAgentDashboardWidgets(viewModel: AgentCommandCenterViewModel): AgentWidgetCard[] {
  const director = viewModel.marketingDirector;
  const guardian = viewModel.brandGuardian;
  const nextAction = director?.nextBestAction;

  return [
    {
      id: 'ai-marketing-director',
      eyebrow: 'AI Marketing Director',
      title: nextAction?.title ?? 'Strategy brain warming up',
      status: director ? 'ready' : viewModel.tier === 'starter' ? 'ready' : 'thinking',
      body: nextAction?.description ?? 'Connect business signals to unlock daily growth recommendations and campaign direction.',
      actionLabel: nextAction?.actionLabel ?? 'Open Growth Coach',
      accent: 'violet',
    },
    {
      id: 'brand-guardian-score',
      eyebrow: 'Brand Guardian Score',
      title: guardian ? `${guardian.overallScore.score}/${guardian.overallScore.maxScore}` : 'Elite review locked',
      status: guardian ? (guardian.result === 'approve' ? 'ready' : 'warning') : viewModel.tier === 'elite' ? 'thinking' : 'locked',
      score: guardian?.overallScore.score,
      body: guardian?.summary ?? 'Elite teams can review brand voice, CTA strength, clarity, compliance-safe wording, and tone before scheduling.',
      actionLabel: guardian?.result === 'warn' ? 'Fix content' : 'Review brand kit',
      accent: guardian?.result === 'warn' ? 'rose' : 'gold',
    },
    {
      id: 'suggested-next-actions',
      eyebrow: 'Suggested Next Actions',
      title: director?.bestCampaignToRun?.title ?? 'No missed opportunities yet',
      status: director ? 'ready' : 'thinking',
      body: director?.missedOpportunities?.[0]?.description ?? 'The command center will surface missed posts, weak CTAs, repurposing opportunities, and platform focus areas.',
      actionLabel: 'View Opportunity Feed',
      accent: 'cyan',
    },
  ];
}

export function buildMediaLibraryAgentBadges(asset: MediaAsset): string[] {
  const badges: string[] = [];
  badges.push(asset.brandGuardianReviewed ? 'Brand Guardian reviewed' : 'Needs Brand Guardian review');
  badges.push(asset.repurposedAvailable ? 'Repurposed available' : 'Ready to remix');
  if (asset.recommendedNextAction) badges.push(asset.recommendedNextAction);
  return badges;
}

export const agentCommandCenterCss = `
.agent-command-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.agent-command-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.82), rgba(8, 13, 30, 0.68));
  box-shadow: 0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
  backdrop-filter: blur(22px);
  padding: 1.25rem;
}
.agent-command-card::before {
  content: '';
  position: absolute;
  inset: -35% -15% auto auto;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--agent-glow), transparent 66%);
  opacity: 0.42;
  animation: agentPulse 2.8s ease-in-out infinite;
}
.agent-command-card[data-accent='violet'] { --agent-glow: rgba(139, 92, 246, 0.9); }
.agent-command-card[data-accent='cyan'] { --agent-glow: rgba(34, 211, 238, 0.9); }
.agent-command-card[data-accent='gold'] { --agent-glow: rgba(251, 191, 36, 0.9); }
.agent-command-card[data-accent='rose'] { --agent-glow: rgba(244, 63, 94, 0.9); }
.agent-command-eyebrow {
  color: rgba(226,232,240,0.72);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.agent-command-title {
  color: #fff;
  font-size: 1.18rem;
  font-weight: 800;
  margin: 0.55rem 0;
}
.agent-command-body {
  color: rgba(226,232,240,0.78);
  line-height: 1.55;
}
.agent-command-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1rem;
  color: #e0f2fe;
  font-weight: 700;
}
.agent-command-status::before {
  content: '';
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--agent-glow);
  box-shadow: 0 0 24px var(--agent-glow);
}
@keyframes agentPulse {
  0%, 100% { transform: scale(0.92); opacity: 0.28; }
  50% { transform: scale(1.08); opacity: 0.52; }
}
@media (max-width: 900px) {
  .agent-command-grid { grid-template-columns: 1fr; }
}
`;
