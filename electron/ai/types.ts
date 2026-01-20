// electron/ai/types.ts
// Re-export shared types
export type { VisionResult, ScriptSegment } from '../../shared/types';

// AI-specific type aliases
export type ScriptResult = import('../../shared/types').Script;

// AI Client interface (AI layer specific)
export interface AIClient {
    analyzeImage(input: {
        imageBase64: string;
        prompt: string;
    }): Promise<import('../../shared/types').VisionResult>;

    generateText(input: {
        prompt: string;
        temperature?: number;
    }): Promise<string>;
}

