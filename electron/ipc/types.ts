export interface WorkerMessage<T = any> {
    type: 'progress' | 'complete' | 'error' | 'start' | 'status';
    data?: T;
}

export interface ExtractionRequest {
    videoPath: string;
    outputDir: string;
    sceneThreshold?: number;
    maxInterval?: number;
    ffmpegPath?: string;
}

export interface ExtractionProgress {
    index: number;
    timestamp: number;
}

export interface ExtractionFrame {
    index: number;
    timestamp: number;
    path: string;
}

export interface ExtractionComplete {
    frames: ExtractionFrame[];
    metadataPath: string;
}
