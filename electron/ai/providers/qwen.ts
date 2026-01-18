// electron/ai/providers/qwen.ts

import fetch from 'node-fetch';
import { BaseAIClient } from '../client';
import { VisionResult } from '../types';

export class QwenClient extends BaseAIClient {
    private apiKey: string;
    private baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    private visionModel = 'qwen3-vl-plus';

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
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${input.imageBase64}`
                                }
                            },
                            {
                                type: 'text',
                                text: input.prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Qwen API error (${res.status}): ${errorText}`);
        }

        const json = (await res.json()) as any;
        let content = json.choices?.[0]?.message?.content;

        // Clean JSON if needed (inherited or utility)
        if (content.startsWith('```json')) {
            content = content.replace(/```json\n?/, '').replace(/```$/, '').trim();
        }

        return JSON.parse(content);
    }

    async generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string> {
        // Use a standard chat model for text if needed, but qwen-vl-plus also works for text.
        // For script generation, qwen-turbo or qwen-max might be better, 
        // but let's stick to the compatible vision model for now or a general text model.
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen-max', // Use qwen-max for better text generation
                temperature: input.temperature ?? 0.7,
                messages: [{ role: 'user', content: input.prompt }]
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Qwen API error (${res.status}): ${errorText}`);
        }

        const json = (await res.json()) as any;
        return json.choices?.[0]?.message?.content ?? '';
    }
}
