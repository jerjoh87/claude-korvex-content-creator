/**
 * AI model registry. Availability is computed server-side from env keys and
 * passed to client components, so the picker always reflects what will
 * actually run. "auto" lets EnvRoutedAgentProvider pick the first configured
 * provider (OpenAI, then Gemini), falling back to sample mode.
 */

export type TextModelOption = {
  id: string;
  label: string;
  provider: 'auto' | 'openai' | 'gemini';
  /** Provider-specific model name; undefined for "auto". */
  model?: string;
  note: string;
  available: boolean;
};

export type MediaModelOption = {
  id: string;
  label: string;
  provider: 'openai' | 'demo';
  note: string;
  available: boolean;
};

export function getTextModelOptions(): TextModelOption[] {
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  return [
    {
      id: 'auto',
      label: 'Auto (best available)',
      provider: 'auto',
      note: hasOpenAi || hasGemini ? 'Picks the best configured model' : 'Sample mode — add an AI key to go live',
      available: true
    },
    {
      id: 'openai/gpt-4.1-mini',
      label: 'OpenAI GPT-4.1 mini',
      provider: 'openai',
      model: 'gpt-4.1-mini',
      note: hasOpenAi ? 'Fast + affordable' : 'Add OPENAI_API_KEY',
      available: hasOpenAi
    },
    {
      id: 'openai/gpt-4.1',
      label: 'OpenAI GPT-4.1',
      provider: 'openai',
      model: 'gpt-4.1',
      note: hasOpenAi ? 'Highest quality writing' : 'Add OPENAI_API_KEY',
      available: hasOpenAi
    },
    {
      id: 'gemini/gemini-2.5-flash',
      label: 'Google Gemini 2.5 Flash',
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      note: hasGemini ? 'Fast + affordable' : 'Add GEMINI_API_KEY',
      available: hasGemini
    },
    {
      id: 'gemini/gemini-2.5-pro',
      label: 'Google Gemini 2.5 Pro',
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      note: hasGemini ? 'Strong long-form quality' : 'Add GEMINI_API_KEY',
      available: hasGemini
    }
  ];
}

export function getMediaModelOptions(): MediaModelOption[] {
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  return [
    {
      id: 'openai/gpt-image-1',
      label: 'OpenAI Image (gpt-image-1)',
      provider: 'openai',
      note: hasOpenAi ? 'Photorealistic + stylized images' : 'Add OPENAI_API_KEY',
      available: hasOpenAi
    },
    {
      id: 'demo',
      label: 'Sample mode',
      provider: 'demo',
      note: 'Placeholder art — no key needed',
      available: true
    }
  ];
}

export function resolveTextModel(id: string | undefined): TextModelOption {
  const options = getTextModelOptions();
  const found = options.find((option) => option.id === id && option.available);
  return found ?? options[0];
}

/** Canva is an editing destination, not a model — generated assets hand off to it. */
export const canvaCreateLinks: Record<string, string> = {
  '1:1': 'https://www.canva.com/create/instagram-posts/',
  '16:9': 'https://www.canva.com/create/youtube-thumbnails/',
  '9:16': 'https://www.canva.com/create/instagram-stories/',
  '4:5': 'https://www.canva.com/create/instagram-posts/'
};
