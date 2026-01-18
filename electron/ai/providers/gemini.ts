import { GoogleGenAI } from '@google/genai';
import { BaseAIClient } from '../client';
import { VisionResult } from '../types';
import { RateLimiter } from '../utils/rate-limiter';
import { safeParseJson } from '../utils/json';

export class GeminiClient extends BaseAIClient {
    private client: any;
    private model = 'gemini-3-flash-preview';
    private limiter = new RateLimiter({
        requestsPerMinute: 10,
        maxRetries: 3,
        retryDelay: 3000
    });

    constructor(apiKey: string) {
        super();
        this.client = new GoogleGenAI({ apiKey });
    }

    async analyzeImage(input: {
        imageBase64: string;
        prompt: string;
    }): Promise<VisionResult> {
        return this.limiter.execute(async () => {
            const result = await this.client.models.generateContent({
                model: this.model,
                contents: [
                    {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: input.imageBase64
                        }
                    },
                    { text: input.prompt }
                ],
                generationConfig: {
                    temperature: 0,
                    responseMimeType: "application/json"
                }
            });

            const text = result.text || '{}';
            return safeParseJson<VisionResult>(text);
        });
    }

    async generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string> {
        return this.limiter.execute(async () => {
            const result = await this.client.models.generateContent({
                model: this.model,
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: input.prompt }]
                    }
                ],
                generationConfig: {
                    temperature: input.temperature ?? 0.7,
                    responseMimeType: "application/json"
                }
            });

            return result.text || '';
        });
    }
}
