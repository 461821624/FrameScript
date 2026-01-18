// electron/ai/types.ts

export interface VisionResult {
    scene: string;
    subject: string;
    action: string;
    emotion: string;
    message: string;
    value: number; // 0 ~ 1
}

export interface ScriptSegment {
    id: string;
    sourceId: string;
    text: string;
    timeRange?: string;
    locked: boolean;
}

export interface ScriptResult {
    title: string;
    hook: string;
    segments: ScriptSegment[];
    ending: string;
    hashtags: string[];
}

export interface AIClient {
    analyzeImage(input: {
        imageBase64: string;
        prompt: string;
    }): Promise<VisionResult>;

    generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string>;
}
