// electron/ai/providers/openai.ts

import fetch from 'node-fetch';
import { BaseAIClient } from '../client';
import { VisionResult } from '../types';

export class OpenAIClient extends BaseAIClient {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1/chat/completions';
    private visionModel = 'gpt-4o-mini';

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    async analyzeImage(input: {
        imageBase64: string;
        prompt: string;
    }): Promise<VisionResult> {
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.visionModel,
                temperature: 0,
                messages: [
                    { role: 'system', content: input.prompt },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'input_image',
                                image_base64: input.imageBase64
                            }
                        ]
                    }
                ]
            })
        });

        const json = (await res.json()) as any;
        const content = json.choices?.[0]?.message?.content;

        return JSON.parse(content);
    }

    async generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string> {
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.visionModel,
                temperature: input.temperature ?? 0.7,
                messages: [{ role: 'user', content: input.prompt }]
            })
        });

        const json = (await res.json()) as any;
        return json.choices?.[0]?.message?.content ?? '';
    }
}
