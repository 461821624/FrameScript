// electron/ai/providers/index.ts

import { OpenAIClient } from './openai';
import { GeminiClient } from './gemini';
import { MockAIClient } from './mock';
import { QwenClient } from './qwen';
import { BaseAIClient } from '../client';

export interface AIConfig {
    provider?: string;
    apiKey?: string;
}

export function createAIClient(config: AIConfig = {}): BaseAIClient {
    const provider = config.provider || process.env.AI_PROVIDER;
    const apiKey = config.apiKey;

    // Default to mock if no provider/key found, or if explicitly requested
    if (provider === 'mock' || (!provider && !apiKey)) {
        return new MockAIClient();
    }

    if (!apiKey) {
        throw new Error(`${provider?.toUpperCase() || 'AI'} API key not set`);
    }

    if (provider === 'gemini') {
        return new GeminiClient(apiKey);
    }

    if (provider === 'qwen') {
        return new QwenClient(apiKey);
    }

    return new OpenAIClient(apiKey);
}