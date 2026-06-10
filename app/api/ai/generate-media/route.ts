import { NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  prompt: z.string().min(5).max(2000),
  ratio: z.enum(['1:1', '16:9', '9:16', '4:5']),
  style: z.string().max(40).optional()
});

// gpt-image-1 supported sizes; portrait ratios share the closest canvas.
const ratioToSize: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x1024',
  '9:16': '1024x1536',
  '4:5': '1024x1536'
};

export async function POST(request: Request) {
  let input;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ source: 'demo' as const });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
        prompt: input.style ? `${input.prompt}. Style: ${input.style}.` : input.prompt,
        size: ratioToSize[input.ratio],
        n: 1
      })
    });

    if (!response.ok) {
      return NextResponse.json({ source: 'demo' as const });
    }

    const json = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const image = json.data?.[0];
    const imageUrl = image?.url ?? (image?.b64_json ? `data:image/png;base64,${image.b64_json}` : null);
    if (!imageUrl) {
      return NextResponse.json({ source: 'demo' as const });
    }

    return NextResponse.json({ source: 'ai' as const, imageUrl });
  } catch {
    return NextResponse.json({ source: 'demo' as const });
  }
}
