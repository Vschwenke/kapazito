// LLM-Provider-Abstraktion.
// Primaer: Anthropic Claude Sonnet (DACH-EU-Datenhaltung).
// Fallback: OpenAI GPT-4o (falls ANTHROPIC_API_KEY fehlt).
// Genutzt via Vercel AI SDK (ai + @ai-sdk/anthropic / @ai-sdk/openai).
//
// Hintergrund: Wir wollen NIEMALS direkt an einen Vendor koppeln. Die
// Abstraktion erlaubt Provider-Wechsel via ENV-Variable ohne Code-Aenderung.

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModel } from 'ai';

export function getLanguageModel(): LanguageModel {
  const provider = process.env.LLM_PROVIDER ?? 'anthropic';

  if (provider === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY fehlt in .env (oder LLM_PROVIDER=openai setzen)');
    }
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const modelId = process.env.LLM_MODEL ?? 'claude-3-5-sonnet-20241022';
    return anthropic(modelId);
  }

  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY fehlt in .env');
    }
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const modelId = process.env.LLM_MODEL ?? 'gpt-4o';
    return openai(modelId);
  }

  throw new Error(`Unbekannter LLM_PROVIDER: ${provider}`);
}
