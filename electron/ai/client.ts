// electron/ai/client.ts

import { AIClient } from './types';

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