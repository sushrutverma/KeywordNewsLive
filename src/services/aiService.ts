import axios, { AxiosError } from 'axios';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

// Candidate models in fallback order.
const CANDIDATE_MODELS = [
  import.meta.env.VITE_MISTRAL_MODEL || 'open-mistral-nemo',
  'open-mistral-7b',
  'mistral-tiny'
];

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const cleanText = (raw: string): string => {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const prepareTextForPrompt = (raw: string, maxLen = 4000): string => {
  const cleaned = cleanText(raw);
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen) + '...';
};

const formatError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: { message?: string } }>;
    const status = axiosError.response?.status;
    const msg = axiosError.response?.data?.message || axiosError.response?.data?.error?.message;
    
    if (status === 401) {
      return new Error('Unauthorized AI service request. Please verify credentials.');
    }
    if (status === 429) {
      return new Error('Mistral AI rate limit reached. Please try again in a few moments.');
    }
    if (msg) {
      return new Error(`AI service error: ${msg}`);
    }
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error('Failed to communicate with AI service.');
};

async function callMistralWithFallback(messages: MistralMessage[]): Promise<{ content: string; model: string }> {
  // 1. First priority: Use secure server-side Supabase Edge Function proxy
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const response = await axios.post<{ content: string; model: string }>(
        `${SUPABASE_URL}/functions/v1/ai-proxy`,
        {
          messages,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data?.content) {
        return response.data;
      }
    } catch (proxyErr) {
      console.warn('Supabase ai-proxy function unavailable, checking fallback:', proxyErr);
      if (!MISTRAL_API_KEY) {
        throw formatError(proxyErr);
      }
    }
  }

  // 2. Local development fallback if client-side VITE_MISTRAL_API_KEY is explicitly supplied
  if (!MISTRAL_API_KEY) {
    throw new Error('AI service is not configured. Please ensure Supabase backend functions or API keys are set up.');
  }

  const modelsToTry = Array.from(new Set(CANDIDATE_MODELS));
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await axios.post<MistralResponse>(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim();
      if (content) {
        return { content, model };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Mistral model ${model} failed, trying next fallback:`, err);
    }
  }

  throw lastError || new Error('All Mistral models failed to respond.');
}

const isAiConfigured = Boolean(MISTRAL_API_KEY || (SUPABASE_URL && SUPABASE_ANON_KEY));

export const aiService = {
  async analyze(text: string) {
    if (!isAiConfigured) {
      return {
        analysis: 'AI service is not configured. Please set up backend services or environment variables.'
      };
    }

    const prepared = prepareTextForPrompt(text, 4000);
    if (!prepared) {
      throw new Error('Invalid input: text must be a non-empty string');
    }

    try {
      const { content } = await callMistralWithFallback([
        {
          role: 'system',
          content: 'You are an expert at analyzing text. Analyze the following text and provide key insights.'
        },
        {
          role: 'user',
          content: prepared
        }
      ]);

      return {
        analysis: content
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      throw formatError(error);
    }
  },

  async summarize(text: string) {
    if (!isAiConfigured) {
      return {
        summary: 'AI service is not configured. Please set up backend services or environment variables.'
      };
    }

    const prepared = prepareTextForPrompt(text, 4000);
    if (!prepared) {
      throw new Error('Invalid input: text must be a non-empty string');
    }

    try {
      const { content } = await callMistralWithFallback([
        {
          role: 'system',
          content: 'You are an expert at summarizing news and articles. Provide a concise, clear summary in 2-3 sentences.'
        },
        {
          role: 'user',
          content: prepared
        }
      ]);

      return {
        summary: content
      };
    } catch (error) {
      console.error('AI summarization error:', error);
      throw formatError(error);
    }
  },

  async explainConcept(concept: string, context?: string) {
    if (!isAiConfigured) {
      return {
        explanation: 'AI service is not configured. Please set up backend services or environment variables.'
      };
    }

    if (!concept || typeof concept !== 'string' || !concept.trim()) {
      throw new Error('Invalid input: concept must be a non-empty string');
    }

    const preparedContext = context ? prepareTextForPrompt(context, 1500) : undefined;

    try {
      const { content } = await callMistralWithFallback([
        {
          role: 'system',
          content: 'You are an expert educational assistant. Explain the requested concept, term, or entity clearly, objectively, and extremely concisely. Your explanation MUST be at most 2-3 sentences long.'
        },
        {
          role: 'user',
          content: `Please explain the concept: "${concept.trim()}"${preparedContext ? ` in the context of this article: "${preparedContext}"` : ''}.`
        }
      ]);

      return {
        explanation: content
      };
    } catch (error) {
      console.error('AI concept explanation error:', error);
      throw formatError(error);
    }
  }
};