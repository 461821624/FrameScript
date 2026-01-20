/**
 * Shared type definitions for FrameScript
 * Used by both Electron main process and Vue renderer process
 */

// ==================== AI Types ====================

export interface VisionResult {
    scene: string;
    subject: string;
    action: string;
    emotion: string;
    message: string;
    value: number;
}

// ==================== Video/Frame Types ====================

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

// ==================== Script Types ====================

export interface ScriptSegment {
    id: string;
    sourceId: string;
    text: string;
    timeRange?: string;
    locked: boolean;
}

export interface Script {
    title: string;
    hook: string;
    segments: ScriptSegment[];
    ending: string;
    hashtags: string[];
}

// ==================== Project Types ====================

export interface Project {
    id: string;
    title: string;
    topic: string;
    path: string;
    status: 'idle' | 'processing' | 'completed' | 'error';
    videos: VideoAsset[];
    script: Script;
    createdAt: number;
    updatedAt: number;
}

// ==================== IPC Types ====================

export interface ProjectProgressEvent {
    projectId: string;
    videoId: string;
    progress?: number;
    status: VideoAsset['status'];
    message?: string;
    error?: string;
    asset?: VideoAsset;
    script?: Script;
}
