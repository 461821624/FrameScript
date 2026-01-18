import './worker-shim';
import { VideoProcessor } from './video-processor';
import { updateAIConfig } from '../ai';

const port = (process as any).parentPort;

if (!port) {
    console.error('This script must be run as a utility process');
    process.exit(1);
}

port.on('message', async (event: any) => {
    const { type, data } = event.data;
    console.log('[Worker] Received message:', type);

    if (type === 'start') {
        const { videoPath, outputDir, sourceId, topic, aiConfig, concurrency, style } = data;

        if (aiConfig) {
            console.log('[Worker] Updating AI config:', aiConfig.provider);
            updateAIConfig(aiConfig);
        }

        console.log('[Worker] Starting video processing for:', videoPath);
        try {
            const processor = new VideoProcessor({
                videoPath,
                outputDir,
                sourceId,
                topic,
                concurrency,
                style,
                onProgress: (progress) => {
                    console.log('[Worker] Progress update:', progress.stage, progress.message);
                    port.postMessage({ type: 'progress', data: progress });
                }
            });

            await processor.process();
            console.log('[Worker] Processing complete');
            port.postMessage({ type: 'complete', data: { status: 'success' } });
        } catch (error: any) {
            console.error('[Worker] Error during processing:', error);
            port.postMessage({ type: 'error', data: error.message });
        }
    }
});
