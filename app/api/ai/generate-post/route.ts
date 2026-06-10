import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EnvRoutedAgentProvider } from '@/lib/agents/ai-provider';
import { resolveTextModel } from '@/lib/ai/models';
import { getActiveWorkspace } from '@/lib/auth/workspace';
import { createClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  goal: z.string().min(1).max(60),
  platform: z.string().min(1).max(40),
  contentType: z.string().min(1).max(40),
  topic: z.string().min(3).max(600),
  model: z.string().max(60).optional(),
  trendContext: z.string().max(800).optional()
});

const variantSchema = z.object({
  angle: z.string().min(1).max(60),
  hook: z.string().min(1),
  body: z.array(z.string().min(1)).min(1).max(6),
  hashtags: z.string(),
  score: z.number().min(0).max(100)
});

const draftSchema = z.object({
  variants: z.array(variantSchema).min(1).max(3)
});

export type GeneratedVariant = z.infer<typeof variantSchema>;

/** Per-platform formatting rules so output feels native, not generic. */
const platformRules: Record<string, string> = {
  instagram:
    'Instagram: visual-first caption. Hook under 125 characters (shows before "more"). Short line breaks, 1-3 emojis, 3-5 niche hashtags at the end, CTA like "Save this" or "Link in bio".',
  tiktok:
    'TikTok: this is a spoken script or caption. Hook in the first 3 words. Casual, fast, trend-aware language. 3-4 hashtags including one broad and two niche.',
  facebook:
    'Facebook: conversational and community-minded. Slightly longer is fine. Ask a question to drive comments. 1-3 hashtags max.',
  linkedin:
    'LinkedIn: professional but human. One-line hook, then short paragraphs with line breaks. No more than 3 hashtags. End with a question or clear takeaway. Minimal emojis.',
  x: 'X/Twitter: punchy. Hook must work as a standalone tweet under 280 characters. Body paragraphs are follow-up tweets in a thread, each under 280 characters. 1-2 hashtags max.',
  youtube:
    'YouTube Shorts: this is a spoken video script. Hook in the first sentence, then quick beats. End with "subscribe" or a comment prompt. Hashtags: #shorts plus 2 niche.'
};

type BrandContext = {
  description?: string;
  industry?: string | null;
  name?: string;
  location?: string;
  services?: string[];
  goals?: string[];
  cta?: string;
  audience?: string;
  tone?: string;
  vocab?: string;
};

/**
 * Pull the signed-in user's Business Profile + Brand Kit so the model writes
 * for THEIR business. Guests get generic (but still platform-tuned) output.
 */
async function loadBrandContext(): Promise<BrandContext | null> {
  const workspace = await getActiveWorkspace();
  if (!workspace) return null;
  try {
    const supabase = await createClient();
    const [profileResult, kitResult] = await Promise.all([
      supabase
        .from('business_profiles')
        .select('name, industry, audience, voice')
        .eq('workspace_id', workspace.workspaceId)
        .limit(1)
        .maybeSingle(),
      supabase.from('brand_kits').select('guidelines').eq('workspace_id', workspace.workspaceId).limit(1).maybeSingle()
    ]);

    const context: BrandContext = {};
    const profile = profileResult.data;
    if (profile) {
      const voice = (profile.voice ?? {}) as Record<string, unknown>;
      const audience = (profile.audience ?? {}) as Record<string, unknown>;
      context.name = profile.name;
      context.industry = profile.industry;
      if (typeof voice.description === 'string') context.description = voice.description;
      if (typeof voice.location === 'string') context.location = voice.location;
      if (Array.isArray(voice.services)) context.services = voice.services as string[];
      if (Array.isArray(voice.goals)) context.goals = voice.goals as string[];
      if (typeof voice.cta === 'string') context.cta = voice.cta;
      if (typeof audience.description === 'string') context.audience = audience.description;
    }
    const kit = kitResult.data;
    if (kit?.guidelines) {
      try {
        const parsed = JSON.parse(kit.guidelines) as Record<string, unknown>;
        if (typeof parsed.tone === 'string') context.tone = parsed.tone;
        if (typeof parsed.vocab === 'string') context.vocab = parsed.vocab;
        if (!context.audience && typeof parsed.audience === 'string') context.audience = parsed.audience;
      } catch {
        // Older kits stored plain text guidelines; use as-is.
        context.vocab = kit.guidelines;
      }
    }
    return Object.keys(context).length > 0 ? context : null;
  } catch {
    return null;
  }
}

function brandPromptBlock(brand: BrandContext): string {
  const lines: string[] = ['BUSINESS CONTEXT (write specifically for this business):'];
  if (brand.name) lines.push(`- Business: ${brand.name}${brand.industry ? ` (${brand.industry})` : ''}${brand.location ? `, ${brand.location}` : ''}`);
  if (brand.description) lines.push(`- About: ${brand.description}`);
  if (brand.services?.length) lines.push(`- Services/products: ${brand.services.join(', ')}`);
  if (brand.audience) lines.push(`- Target audience: ${brand.audience}`);
  if (brand.tone) lines.push(`- Brand voice: ${brand.tone}`);
  if (brand.vocab) lines.push(`- Vocabulary rules: ${brand.vocab}`);
  if (brand.goals?.length) lines.push(`- Marketing goals: ${brand.goals.join(', ')}`);
  if (brand.cta) lines.push(`- Preferred call to action: "${brand.cta}" — use it or a close variant.`);
  return lines.join('\n');
}

export async function POST(request: Request) {
  let input;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const model = resolveTextModel(input.model);
  const brand = await loadBrandContext();

  const provider = new EnvRoutedAgentProvider(
    model.provider === 'openai'
      ? { openAiModel: model.model }
      : model.provider === 'gemini'
        ? { geminiModel: model.model }
        : {}
  );
  const preference =
    model.provider === 'openai'
      ? ['openai' as const]
      : model.provider === 'gemini'
        ? ['gemini' as const]
        : ['openai' as const, 'gemini' as const];

  const systemPrompt =
    'You are a senior social media copywriter for small businesses. ' +
    'Write scroll-stopping, beginner-friendly social content in plain language. ' +
    'Generate exactly 3 DIFFERENT takes on the same brief, each with a distinct angle ' +
    '(e.g. bold/direct, story-driven, question/engagement). ' +
    'Score each honestly 0-100 for engagement potential on the target platform. ' +
    'Respond ONLY with JSON matching: {"variants": [{"angle": string (2-4 word label), ' +
    '"hook": string (attention-grabbing first line), ' +
    '"body": string[] (2-4 short paragraphs), ' +
    '"hashtags": string (space-separated), ' +
    '"score": number}]}';

  const userPromptParts = [
    `Goal: ${input.goal}`,
    `Platform: ${input.platform}`,
    `Content type: ${input.contentType}`,
    `Topic: ${input.topic}`,
    platformRules[input.platform] ?? 'Match the platform culture and keep it concise.'
  ];
  if (input.trendContext) {
    userPromptParts.push(`TREND CONTEXT (ride this trend, reference what makes it hot): ${input.trendContext}`);
  }
  if (brand) {
    userPromptParts.push(brandPromptBlock(brand));
  }
  userPromptParts.push('Every variant must end with one clear call to action.');

  const response = await provider.completeJson<z.infer<typeof draftSchema>>(
    {
      agentName: 'marketing_director',
      responseSchemaName: 'social_post_variants',
      systemPrompt,
      userPrompt: userPromptParts.join('\n')
    },
    // No local fallback content here — the client owns the demo template so
    // drafts stay consistent with the rest of its UI state.
    () => null as unknown as z.infer<typeof draftSchema>,
    preference
  );

  if (response.usedFallback || !response.parsed) {
    return NextResponse.json({ source: 'demo' as const }, { status: 200 });
  }

  const validated = draftSchema.safeParse(response.parsed);
  if (!validated.success) {
    return NextResponse.json({ source: 'demo' as const }, { status: 200 });
  }

  const variants = [...validated.data.variants].sort((a, b) => b.score - a.score);
  return NextResponse.json({
    variants,
    source: 'ai' as const,
    personalized: Boolean(brand),
    model: model.id
  });
}
