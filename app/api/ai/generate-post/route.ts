import { NextResponse } from 'next/server';
import { z } from 'zod';
import { EnvRoutedAgentProvider } from '@/lib/agents/ai-provider';

const requestSchema = z.object({
  goal: z.string().min(1).max(60),
  platform: z.string().min(1).max(40),
  contentType: z.string().min(1).max(40),
  topic: z.string().min(3).max(600)
});

const draftSchema = z.object({
  hook: z.string().min(1),
  body: z.array(z.string().min(1)).min(1).max(6),
  hashtags: z.string(),
  score: z.number().min(0).max(100)
});

export type GeneratedDraft = z.infer<typeof draftSchema> & { source: 'ai' | 'demo' };

export async function POST(request: Request) {
  let input;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const provider = new EnvRoutedAgentProvider();
  const response = await provider.completeJson<z.infer<typeof draftSchema>>(
    {
      agentName: 'marketing_director',
      responseSchemaName: 'social_post_draft',
      systemPrompt:
        'You are a senior social media copywriter for small businesses. ' +
        'Write scroll-stopping, beginner-friendly social content. ' +
        'Respond ONLY with JSON matching: {"hook": string (attention-grabbing first line), ' +
        '"body": string[] (2-4 short paragraphs, plain language, emojis where natural), ' +
        '"hashtags": string (3-6 space-separated hashtags), ' +
        '"score": number (your 0-100 estimate of engagement potential)}.',
      userPrompt:
        `Goal: ${input.goal}\nPlatform: ${input.platform}\nContent type: ${input.contentType}\nTopic: ${input.topic}\n` +
        'Match the platform culture (e.g. punchy for X, visual-first captions for Instagram, professional for LinkedIn). ' +
        'End with one clear call to action.'
    },
    // No local fallback content here — the client owns the demo template so
    // drafts stay consistent with the rest of its UI state.
    () => null as unknown as z.infer<typeof draftSchema>
  );

  if (response.usedFallback || !response.parsed) {
    return NextResponse.json({ source: 'demo' as const }, { status: 200 });
  }

  const validated = draftSchema.safeParse(response.parsed);
  if (!validated.success) {
    return NextResponse.json({ source: 'demo' as const }, { status: 200 });
  }

  return NextResponse.json({ ...validated.data, source: 'ai' as const });
}
