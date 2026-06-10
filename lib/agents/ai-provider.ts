import type { AgentAIRequest, AgentAIResponse, AgentProviderName } from './types';

declare const process: { env: Record<string, string | undefined> };

export interface AgentProviderOptions {
  openAiApiKey?: string;
  openAiModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  fetchImpl?: typeof fetch;
}

export class EnvRoutedAgentProvider {
  private readonly options: AgentProviderOptions;

  constructor(options: AgentProviderOptions = {}) {
    this.options = {
      openAiApiKey: options.openAiApiKey ?? process.env.OPENAI_API_KEY,
      openAiModel: options.openAiModel ?? process.env.OPENAI_AGENT_MODEL ?? 'gpt-4.1-mini',
      geminiApiKey: options.geminiApiKey ?? process.env.GEMINI_API_KEY,
      geminiModel: options.geminiModel ?? process.env.GEMINI_AGENT_MODEL ?? 'gemini-1.5-flash',
      fetchImpl: options.fetchImpl ?? globalThis.fetch,
    };
  }

  async completeJson<T>(request: AgentAIRequest, fallback: () => T, preference: AgentProviderName[] = ['openai', 'gemini']): Promise<AgentAIResponse<T>> {
    for (const provider of preference) {
      if (provider === 'openai' && this.options.openAiApiKey) {
        const response = await safeProviderCall(() => this.callOpenAI<T>(request));
        if (response.parsed) return response;
      }
      if (provider === 'gemini' && this.options.geminiApiKey) {
        const response = await safeProviderCall(() => this.callGemini<T>(request));
        if (response.parsed) return response;
      }
    }

    return {
      provider: 'fallback',
      parsed: fallback(),
      usedFallback: true,
    };
  }

  private async callOpenAI<T>(request: AgentAIRequest): Promise<AgentAIResponse<T>> {
    const fetchImpl = this.options.fetchImpl;
    if (!fetchImpl) return { provider: 'fallback', usedFallback: true };

    const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.options.openAiModel,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) return { provider: 'fallback', usedFallback: true };
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content;
    return { provider: 'openai', text, parsed: parseJson<T>(text), usedFallback: false };
  }

  private async callGemini<T>(request: AgentAIRequest): Promise<AgentAIResponse<T>> {
    const fetchImpl = this.options.fetchImpl;
    if (!fetchImpl) return { provider: 'fallback', usedFallback: true };

    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.options.geminiModel}:generateContent?key=${this.options.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
          contents: [
            {
              role: 'user',
              parts: [{ text: `${request.systemPrompt}\n\n${request.userPrompt}` }],
            },
          ],
        }),
      },
    );

    if (!response.ok) return { provider: 'fallback', usedFallback: true };
    const json = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return { provider: 'gemini', text, parsed: parseJson<T>(text), usedFallback: false };
  }
}

async function safeProviderCall<T>(call: () => Promise<AgentAIResponse<T>>): Promise<AgentAIResponse<T>> {
  try {
    return await call();
  } catch {
    return { provider: 'fallback', usedFallback: true };
  }
}

function parseJson<T>(text?: string): T | undefined {
  if (!text) return undefined;
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return undefined;
  }
}
