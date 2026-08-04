import { AiProviderConfig } from '@/types/cms';

export interface AiExecutionResult {
  text: string;
  providerName: string;
  providerType: string;
  modelUsed: string;
  latencyMs: number;
}

export interface AiTestResult {
  providerId: string;
  providerName: string;
  providerType: string;
  model: string;
  status: 'ok' | 'quota' | 'invalid' | 'error';
  message: string;
  latencyMs?: number;
}

/**
 * Execute AI prompt via single Provider
 */
export async function executeSingleAiProvider(
  provider: AiProviderConfig,
  promptText: string
): Promise<AiExecutionResult> {
  const startTime = Date.now();
  const apiKey = provider.apiKey.trim();
  const model = provider.model.trim() || 'gemini-2.0-flash';
  const type = provider.providerType;

  if (!apiKey) {
    throw new Error(`API Key untuk provider '${provider.name}' belum diisi.`);
  }

  // 1. Google Gemini Provider
  if (type === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error?.message || res.statusText || 'Gemini API Error';
      throw new Error(`[Gemini Error ${res.status}] ${msg}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Respon Gemini kosong.');

    return {
      text,
      providerName: provider.name,
      providerType: type,
      modelUsed: model,
      latencyMs: Date.now() - startTime
    };
  }

  // 2. Anthropic Claude Provider
  if (type === 'claude') {
    const url = provider.baseUrl?.trim() || 'https://api.anthropic.com/v1/messages';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: promptText }]
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error?.message || res.statusText || 'Claude API Error';
      throw new Error(`[Claude Error ${res.status}] ${msg}`);
    }

    const text = data.content?.[0]?.text;
    if (!text) throw new Error('Respon Claude kosong.');

    return {
      text,
      providerName: provider.name,
      providerType: type,
      modelUsed: model,
      latencyMs: Date.now() - startTime
    };
  }

  // 3. OpenAI / DeepSeek / Groq / OpenRouter / Custom (OpenAI Chat Completions standard)
  let defaultUrl = 'https://api.openai.com/v1/chat/completions';
  if (type === 'deepseek') defaultUrl = 'https://api.deepseek.com/chat/completions';
  if (type === 'groq') defaultUrl = 'https://api.groq.com/openai/v1/chat/completions';
  if (type === 'openrouter') defaultUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const endpointUrl = provider.baseUrl?.trim() || defaultUrl;

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: promptText }]
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || res.statusText || `${provider.name} API Error`;
    throw new Error(`[${provider.name} Error ${res.status}] ${msg}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`Respon ${provider.name} kosong.`);

  return {
    text,
    providerName: provider.name,
    providerType: type,
    modelUsed: model,
    latencyMs: Date.now() - startTime
  };
}

/**
 * 9router Multi-Provider Failover Router Engine
 */
export async function routeAiRequest(
  providers: AiProviderConfig[],
  promptText: string
): Promise<AiExecutionResult> {
  const activeProviders = providers
    .filter(p => p.enabled && p.apiKey.trim().length > 0)
    .sort((a, b) => (a.priority || 1) - (b.priority || 1));

  if (activeProviders.length === 0) {
    throw new Error('Tidak ada AI Provider yang aktif atau memiliki API Key terisi.');
  }

  let lastErrorMsg = '';

  for (const provider of activeProviders) {
    try {
      const result = await executeSingleAiProvider(provider, promptText);
      return result;
    } catch (err: any) {
      console.warn(`[9router Failover] Provider '${provider.name}' gagal: ${err.message}. Mencoba provider berikutnya...`);
      lastErrorMsg = err.message;
    }
  }

  throw new Error(`Seluruh AI Provider gagal merespons: ${lastErrorMsg}`);
}

/**
 * Diagnostic Health Inspector for 9router Providers
 */
export async function testAiProviderHealth(provider: AiProviderConfig): Promise<AiTestResult> {
  const startTime = Date.now();
  try {
    const res = await executeSingleAiProvider(provider, 'Ping test ok');
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.providerType,
      model: provider.model,
      status: 'ok',
      message: `🟢 Aktif (${res.latencyMs}ms)`,
      latencyMs: res.latencyMs
    };
  } catch (err: any) {
    const msg = err.message || '';
    const isQuota = msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('429') || msg.toLowerCase().includes('exceeded');
    const isInvalid = msg.toLowerCase().includes('key') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('auth') || msg.toLowerCase().includes('401');

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.providerType,
      model: provider.model,
      status: isQuota ? 'quota' : isInvalid ? 'invalid' : 'error',
      message: msg,
      latencyMs: Date.now() - startTime
    };
  }
}
