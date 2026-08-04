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

  // 1. Google Gemini Provider with Multi-Model Auto-Failover
  if (type === 'gemini') {
    const modelsToTry = Array.from(new Set([
      model,
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-3.5-flash',
      'gemini-3.6-flash',
      'gemini-1.5-flash'
    ]));

    let geminiErr = '';

    for (const m of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              text,
              providerName: provider.name,
              providerType: type,
              modelUsed: m,
              latencyMs: Date.now() - startTime
            };
          }
        } else {
          const msg = data.error?.message || res.statusText || 'Gemini API Error';
          geminiErr = msg;
        }
      } catch (e: any) {
        geminiErr = e.message || 'Koneksi Gemini API terputus';
      }
    }

    throw new Error(`[Gemini All Models Exceeded] ${geminiErr}`);
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
  let targetModelToTest = provider.model?.trim() || 'gemini-3.6-flash';
  let availableModels: string[] = [];

  // Auto-detect available models list for this API key
  try {
    const detection = await detectAndSelectBestModel(provider.providerType, provider.apiKey, targetModelToTest);
    if (detection.availableModels && detection.availableModels.length > 0) {
      availableModels = detection.availableModels;
    }
  } catch (e) {}

  if (availableModels.length === 0) {
    availableModels = getFallbackModelsForProvider(provider.providerType);
  }

  // Ensure current user-selected model is included in availableModels list
  if (targetModelToTest && !availableModels.includes(targetModelToTest)) {
    availableModels.unshift(targetModelToTest);
  }

  const tempProvider = { ...provider, model: targetModelToTest };

  try {
    const res = await executeSingleAiProvider(tempProvider, 'Ping test ok');
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.providerType,
      model: targetModelToTest,
      detectedModel: targetModelToTest,
      availableModels: availableModels,
      status: 'ok',
      message: `🟢 Aktif (${res.latencyMs}ms) | Target Model: ${targetModelToTest}`,
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
      model: targetModelToTest,
      detectedModel: targetModelToTest,
      availableModels: availableModels,
      status: isQuota ? 'quota' : isInvalid ? 'invalid' : 'error',
      message: msg,
      latencyMs: Date.now() - startTime
    };
  }
}

export function getFallbackModelsForProvider(type: string): string[] {
  switch (type) {
    case 'gemini': return ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
    case 'deepseek': return ['deepseek-chat', 'deepseek-coder', 'deepseek-v3', 'deepseek-r1'];
    case 'openai': return ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'o3-mini'];
    case 'groq': return ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    case 'claude': return ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-5-haiku-20241022'];
    case 'openrouter': return ['deepseek/deepseek-r1:free', 'google/gemini-2.0-flash-lite-preview-02-05:free', 'meta-llama/llama-3.3-70b-instruct:free'];
    default: return ['gpt-4o-mini', 'gpt-4o'];
  }
}

/**
 * Auto-detect and set best supported model based on provider type & API Key status
 */
export async function detectAndSelectBestModel(
  providerType: string,
  apiKey: string,
  currentModel?: string
): Promise<{ recommendedModel: string; message: string; availableModels?: string[] }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return {
      recommendedModel: getDefaultModelForProvider(providerType),
      message: '⚠️ Masukkan API Key untuk mendeteksi model otomatis.'
    };
  }

  // 1. Google Gemini Auto-Detection via ModelService ListModels
  if (providerType === 'gemini') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
      if (res.ok) {
        const data = await res.json();
        const models: any[] = data.models || [];
        const supportedNames = models
          .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));

        if (supportedNames.length > 0) {
          // If user has explicitly selected a model (e.g. gemini-3.6-flash), honor it!
          if (currentModel && (supportedNames.includes(currentModel) || currentModel.includes('3.6') || currentModel.includes('3.5'))) {
            return {
              recommendedModel: currentModel,
              message: `✅ Model pilihan Anda aktif & didukung: ${currentModel}`,
              availableModels: supportedNames
            };
          }

          const preferredOrder = [
            'gemini-3.6-flash',
            'gemini-3.5-flash',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite'
          ];

          for (const pref of preferredOrder) {
            if (supportedNames.includes(pref)) {
              return {
                recommendedModel: pref,
                message: `✅ Model otomatis terdeteksi aktif untuk API Key ini: ${pref}`,
                availableModels: supportedNames
              };
            }
          }
          return {
            recommendedModel: currentModel || supportedNames[0],
            message: `✅ Model otomatis terdeteksi: ${currentModel || supportedNames[0]}`,
            availableModels: supportedNames
          };
        }
      }
    } catch (e) {}
    return {
      recommendedModel: currentModel || 'gemini-3.6-flash',
      message: `✓ Model pilihan Anda diatur: ${currentModel || 'gemini-3.6-flash'}`
    };
  }

  // 2. DeepSeek Auto-Detection
  if (providerType === 'deepseek') {
    return {
      recommendedModel: 'deepseek-chat',
      message: '✓ Model resmi DeepSeek V3 otomatis diatur: deepseek-chat'
    };
  }

  // 3. OpenAI Auto-Detection
  if (providerType === 'openai') {
    return {
      recommendedModel: 'gpt-4o-mini',
      message: '✓ Model efisien OpenAI otomatis diatur: gpt-4o-mini'
    };
  }

  // 4. Groq Auto-Detection
  if (providerType === 'groq') {
    return {
      recommendedModel: 'llama-3.3-70b-versatile',
      message: '✓ Model super cepat Groq otomatis diatur: llama-3.3-70b-versatile'
    };
  }

  // 5. Claude Auto-Detection
  if (providerType === 'claude') {
    return {
      recommendedModel: 'claude-3-5-sonnet-20241022',
      message: '✓ Model Anthropic Claude otomatis diatur: claude-3-5-sonnet-20241022'
    };
  }

  // 6. OpenRouter Auto-Detection
  if (providerType === 'openrouter') {
    return {
      recommendedModel: 'deepseek/deepseek-r1:free',
      message: '✓ Model OpenRouter Gateway otomatis diatur: deepseek/deepseek-r1:free'
    };
  }

  return {
    recommendedModel: currentModel || 'gpt-4o-mini',
    message: '✓ Model kustom telah disesuaikan.'
  };
}

export function getDefaultModelForProvider(type: string): string {
  switch (type) {
    case 'gemini': return 'gemini-2.0-flash';
    case 'deepseek': return 'deepseek-chat';
    case 'openai': return 'gpt-4o-mini';
    case 'groq': return 'llama-3.3-70b-versatile';
    case 'claude': return 'claude-3-5-sonnet-20241022';
    case 'openrouter': return 'deepseek/deepseek-r1:free';
    default: return 'gpt-4o-mini';
  }
}
