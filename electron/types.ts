import { VisionResult } from './ai/types';

export interface KeyFrame {
    file: string;
    timestamp: number;
    score: number;
    vision?: VisionResult;
}

export interface VideoAsset {
    id: string;
    name: string;
    path: string;
    size: number;
    status: 'pending' | 'processing' | 'done' | 'error';
    progress: number;
    duration?: number;
    frames: KeyFrame[];
    error?: string;
}

export interface ScriptSegment {
    id: string;
    sourceId: string;
    text: string;
    locked: boolean;
}

export interface Project {
    id: string;
    title: string;
    topic: string; // User defined constraint
    path: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    videos: VideoAsset[];
    script: {
        title: string;
        hook: string;
        segments: ScriptSegment[];
        ending: string;
        hashtags: string[];
    };
    createdAt: number;
    updatedAt: number;
}
