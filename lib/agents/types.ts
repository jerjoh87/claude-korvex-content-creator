export type AgentName = 'marketing_director' | 'content_repurposer' | 'brand_guardian';

export type SubscriptionTier = 'starter' | 'pro' | 'elite';

export type AgentProviderName = 'openai' | 'gemini' | 'fallback' | 'future';

export type Platform =
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'linkedin'
  | 'email'
  | 'sms'
  | 'ads'
  | 'blog'
  | 'youtube'
  | 'x';

export interface AgentExecutionContext {
  userId?: string;
  workspaceId?: string;
  tier: SubscriptionTier;
  locale?: string;
  timezone?: string;
  now?: string;
  providerPreference?: AgentProviderName[];
  persist?: boolean;
  supabase?: SupabaseAgentClient;
}

export interface SupabaseInsertResult extends PromiseLike<unknown> {
  select?: (columns?: string) => { single?: () => PromiseLike<{ data: unknown; error: unknown }> };
}

export interface SupabaseAgentClient {
  from(table: string): {
    insert(values: Record<string, unknown> | Record<string, unknown>[]): SupabaseInsertResult;
    upsert?: (values: Record<string, unknown> | Record<string, unknown>[], options?: Record<string, unknown>) => PromiseLike<unknown>;
  };
}

export interface AgentRunRecord {
  id?: string;
  user_id?: string;
  workspace_id?: string;
  agent_name: AgentName;
  provider: AgentProviderName;
  status: 'completed' | 'fallback' | 'skipped' | 'error';
  tier: SubscriptionTier;
  input_summary?: string;
  output?: unknown;
  created_at?: string;
}

export interface BusinessProfile {
  businessName?: string;
  industry?: string;
  audience?: string;
  location?: string;
  goals?: string[];
  offers?: string[];
  competitors?: string[];
}

export interface BrandKit {
  voice?: string;
  tone?: string[];
  colors?: string[];
  fonts?: string[];
  bannedWords?: string[];
  requiredPhrases?: string[];
  complianceNotes?: string[];
  defaultCTA?: string;
}

export interface ContentItem {
  id?: string;
  title?: string;
  body: string;
  platform?: Platform;
  format?: string;
  campaignId?: string;
  assetIds?: string[];
  performance?: AnalyticsSnapshot;
  createdAt?: string;
}

export interface CampaignSummary {
  id?: string;
  name: string;
  goal?: string;
  offer?: string;
  status?: 'draft' | 'active' | 'scheduled' | 'completed';
  platforms?: Platform[];
  assets?: ContentItem[];
  performance?: AnalyticsSnapshot;
}

export interface AnalyticsSnapshot {
  impressions?: number;
  clicks?: number;
  conversions?: number;
  engagementRate?: number;
  revenue?: number;
  topPlatform?: Platform;
  notes?: string[];
}

export interface CalendarItem {
  id?: string;
  date: string;
  platform: Platform;
  status?: 'draft' | 'scheduled' | 'published' | 'missed';
  contentId?: string;
  campaignId?: string;
  title?: string;
}

export interface MediaAsset {
  id?: string;
  title?: string;
  url?: string;
  type?: 'image' | 'video' | 'audio' | 'document' | 'text';
  tags?: string[];
  campaignId?: string;
  content?: string;
  brandGuardianReviewed?: boolean;
  repurposedAvailable?: boolean;
  recommendedNextAction?: string;
}

export interface AgentScore {
  label: string;
  score: number;
  maxScore: number;
  rationale?: string;
}

export interface AgentRecommendation {
  id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  connectedFeature: 'dashboard' | 'growth_coach' | 'opportunity_feed' | 'weekly_planner' | 'media_library' | 'campaign_vault';
  platform?: Platform;
  actionLabel?: string;
  evidence?: string[];
}

export interface MarketingDirectorInput {
  businessProfile?: BusinessProfile;
  brandKit?: BrandKit;
  contentCalendar?: CalendarItem[];
  campaignHistory?: CampaignSummary[];
  analytics?: AnalyticsSnapshot;
  mediaLibrary?: MediaAsset[];
  scheduledPosts?: CalendarItem[];
}

export interface MarketingDirectorOutput {
  dailyGrowthRecommendations: AgentRecommendation[];
  bestContentToPostToday?: AgentRecommendation;
  bestCampaignToRun?: AgentRecommendation;
  bestPlatformToFocusOn?: Platform;
  nextBestAction: AgentRecommendation;
  missedOpportunities: AgentRecommendation[];
  summary: string;
  generatedAt: string;
  provider: AgentProviderName;
  tier: SubscriptionTier;
}

export interface ContentRepurposerInput {
  sourceContent: ContentItem;
  campaignAssets?: ContentItem[];
  mediaLibrary?: MediaAsset[];
  brandKit?: BrandKit;
  targetPlatforms?: Platform[];
}

export interface RepurposedAsset {
  platform: Platform;
  format: string;
  title: string;
  body: string;
  cta?: string;
  notes?: string[];
}

export interface ContentRepurposerOutput {
  assets: RepurposedAsset[];
  carouselOutline?: string[];
  recommendedPublishingOrder: Platform[];
  summary: string;
  generatedAt: string;
  provider: AgentProviderName;
  tier: SubscriptionTier;
}

export interface BrandGuardianInput {
  content: ContentItem;
  brandKit?: BrandKit;
  platform?: Platform;
  offer?: string;
}

export interface BrandGuardianOutput {
  brandScore: AgentScore;
  ctaScore: AgentScore;
  clarityScore: AgentScore;
  overallScore: AgentScore;
  suggestedImprovements: string[];
  result: 'approve' | 'warn';
  flags: string[];
  summary: string;
  generatedAt: string;
  provider: AgentProviderName;
  tier: SubscriptionTier;
}

export interface AgentAIRequest {
  agentName: AgentName;
  systemPrompt: string;
  userPrompt: string;
  responseSchemaName: string;
}

export interface AgentAIResponse<T> {
  provider: AgentProviderName;
  text?: string;
  parsed?: T;
  usedFallback: boolean;
}
