export interface FrameMetadata {
    time: number;
    file: string;
    source: 'scene' | 'interval' | 'fallback';
    score?: number;
    scoreDetail?: {
        position: number;
        change: number;
        stability: number;
        composition: number;
        narrative: number;
    };
    vision?: {
        scene: string;
        subject: string;
        action: string;
        emotion: string;
        message: string;
        value: number;
    };
}

export interface VideoMetadata {
    video: string;
    outputDir?: string;
    duration: number;
    frames: FrameMetadata[];
}

export interface ProcessorConfig {
    videoPath: string;
    outputDir: string;
    sceneThreshold: number;
    interval: number;
    ffmpegPath: string;
}
