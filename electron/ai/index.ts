// electron/ai/client.ts

import { AIClient } from './types';
import { createAIClient, AIConfig } from './providers';

export let ai = createAIClient();

export function updateAIConfig(config: AIConfig) {
    ai = createAIClient(config);
}

export * from './types';
export * from './providers';
export abstract class BaseAIClient implements AIClient {
    abstract analyzeImage(input: {
        imageBase64: string;
        prompt: string;
    }): Promise<any>;

    abstract generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string>;
}
