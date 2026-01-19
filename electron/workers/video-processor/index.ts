import { spawnUTF8 } from '../../utils/spawn-utf8';
import * as path from 'path';
import * as fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { generateVideoScript } from '../../ai/script-generator';
import { ai } from '../../ai';
import { VISION_PROMPT } from '../../ai/prompts/vision';

import {
    FrameMetadata,
    VideoMetadata
} from './types';

/* ---------------- Processor ---------------- */

export class VideoProcessor {
    private videoPath: string;
    private outputDir: string;
    private onProgress?: (data: any) => void;
    private ffmpegPath: string;
    private concurrency: number;
    private style: string;
    private sourceId: string;
    private topic: string;

    constructor(options: {
        videoPath: string;
        outputDir: string;
        sourceId: string;
        topic?: string;
        ffmpegPath?: string;
        onProgress?: (data: any) => void;
        concurrency?: number;
        style?: string;
    }) {
        this.videoPath = options.videoPath;
        this.outputDir = options.outputDir;
        this.sourceId = options.sourceId;
        this.topic = options.topic ?? '我的日常 vlog';
        this.onProgress = options.onProgress;
        this.concurrency = options.concurrency ?? 1;
        this.style = options.style ?? 'professional';
        this.ffmpegPath =
            options.ffmpegPath ??
            process.env.FFMPEG_PATH ??
            ffmpegInstaller.path ??
            'ffmpeg';
    }

    /* ---------- utils ---------- */

    private spawnFFmpeg(args: string[]) {
        return spawnUTF8(this.ffmpegPath, args);
    }

    private async getDuration(): Promise<number> {
        return new Promise((resolve) => {
            const child = this.spawnFFmpeg(['-i', this.videoPath]);
            let output = '';
            child.stderr.on('data', (data) => output += data.toString());
            child.on('close', () => {
                const match = output.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
                if (match) {
                    const h = parseFloat(match[1]);
                    const m = parseFloat(match[2]);
                    const s = parseFloat(match[3]);
                    resolve(h * 3600 + m * 60 + s);
                } else {
                    resolve(0);
                }
            });
        });
    }

    /* ---------- Stage 1: vlog fast scan ---------- */

    private async fastScan(duration: number): Promise<FrameMetadata[]> {
        console.log('[Stage 1] Vlog-oriented fast scan...');

        const SCAN_LIMIT = Math.min(duration, 90);
        const INTERVAL = Math.max(2, Math.floor(SCAN_LIMIT / 10)); // Dynamic interval
        const MIN_FRAMES = 4;
        const MAX_FRAMES = 12;
        const SCENE_THRESHOLD = 0.08;
        const TIMEOUT_MS = 15_000;

        return new Promise((resolve) => {
            const framesMap = new Map<number, FrameMetadata>();
            let finished = false;

            const finalize = () => {
                if (finished) return;
                finished = true;

                let frames = Array.from(framesMap.values());

                if (frames.length === 0) {
                    frames.push({
                        time: 0,
                        file: '',
                        source: 'fallback'
                    });
                }

                if (frames.length < MIN_FRAMES) {
                    for (let t = INTERVAL; t < SCAN_LIMIT; t += INTERVAL) {
                        if (!framesMap.has(t)) {
                            frames.push({
                                time: t,
                                file: '',
                                source: 'interval'
                            });
                        }
                        if (frames.length >= MIN_FRAMES) break;
                    }
                }

                frames = frames
                    .sort((a, b) => a.time - b.time)
                    .slice(0, MAX_FRAMES);

                console.log(
                    `[Stage 1] Selected ${frames.length} keyframes`
                );
                resolve(frames);
            };

            // 时间兜底（主）
            for (let t = 0; t <= SCAN_LIMIT; t += INTERVAL) {
                framesMap.set(t, {
                    time: t,
                    file: '',
                    source: 'interval'
                });
                if (framesMap.size >= MAX_FRAMES) break;
            }

            // scene（辅）
            const filter = `
select=gt(scene\\,${SCENE_THRESHOLD}),
showinfo
`.replace(/\s+/g, '');

            const args = [
                '-t', SCAN_LIMIT.toString(),
                '-i', this.videoPath,
                '-vf', filter,
                '-f', 'null',
                '-'
            ];

            const child = this.spawnFFmpeg(args);

            const timeout = setTimeout(() => {
                console.warn('[Stage 1] Scene scan timeout, skip.');
                child.kill('SIGKILL');
                finalize();
            }, TIMEOUT_MS);

            child.stderr.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (!line.includes('Parsed_showinfo')) continue;
                    const match = line.match(/pts_time:([\d.]+)/);
                    if (!match) continue;

                    const time = Math.floor(parseFloat(match[1]));
                    if (!framesMap.has(time)) {
                        framesMap.set(time, {
                            time,
                            file: '',
                            source: 'scene'
                        });
                    }
                }
            });

            child.on('close', () => {
                clearTimeout(timeout);
                finalize();
            });

            child.on('error', () => {
                clearTimeout(timeout);
                finalize();
            });
        });
    }

    /* ---------- Stage 2: extract frames ---------- */

    private async extractFrames(frames: FrameMetadata[]): Promise<void> {
        console.log(`[Stage 2] Extracting ${frames.length} frames (concurrency: ${this.concurrency})...`);

        const framesDir = path.join(this.outputDir, 'frames');
        fs.mkdirSync(framesDir, { recursive: true });

        const limit = this.concurrency;

        // Simple parallel execution with limit
        for (let i = 0; i < frames.length; i += limit) {
            const chunk = frames.slice(i, i + limit);
            await Promise.all(chunk.map(async (frame, index) => {
                const actualIndex = i + index;
                const fileName = `frame_${String(actualIndex + 1).padStart(4, '0')}.jpg`;
                const filePath = path.join(framesDir, fileName);

                await new Promise<void>((resolve, reject) => {
                    const args = [
                        '-ss', frame.time.toString(),
                        '-i', this.videoPath,
                        '-vframes', '1',
                        '-q:v', '2',
                        '-y',
                        filePath
                    ];

                    const child = this.spawnFFmpeg(args);
                    child.on('close', (code) =>
                        code === 0 ? resolve() : reject(new Error(`FFmpeg exit ${code}`))
                    );
                    child.on('error', reject);
                });

                frame.file = `frames/${fileName}`;
                console.log(`[Progress] ${actualIndex + 1}/${frames.length}`);

                // Emit real-time progress for UI update
                this.onProgress?.({
                    stage: 2,
                    message: `已提取 ${actualIndex + 1}/${frames.length} 帧...`,
                    extractedCount: actualIndex + 1,
                    totalFrames: frames.length
                });
            }));
        }
    }

    /* ---------- Stage 3: score frames ---------- */

    private scoreFrames(frames: FrameMetadata[]): FrameMetadata[] {
        return frames.map((f, i) => ({
            ...f,
            score:
                (i === 0 || i === frames.length - 1 ? 2 : 1) +
                (i > 0 && f.time - frames[i - 1].time >= 6 ? 2 : 1) +
                (f.source === 'scene' ? 2 : 1)
        }));
    }

    /* ---------- Stage 2.5: smart select ---------- */

    private selectTopFrames(frames: FrameMetadata[]): FrameMetadata[] {
        const sorted = [...frames].sort((a, b) => a.time - b.time);
        if (sorted.length <= 4) return sorted;

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const middle = sorted
            .slice(1, -1)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

        const selected: FrameMetadata[] = [first];

        for (const f of middle) {
            if (selected.some(s => Math.abs(s.time - f.time) < 4)) continue;
            selected.push(f);
            if (selected.length >= 5) break;
        }

        selected.push(last);
        return selected.sort((a, b) => a.time - b.time);
    }

    /* ---------- Stage 4: AI Vision ---------- */

    private async analyzeWithVision(
        frames: FrameMetadata[]
    ): Promise<FrameMetadata[]> {
        console.log('[Stage 4] AI Vision analyzing...');

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            try {
                const image = fs.readFileSync(
                    path.join(this.outputDir, frame.file)
                );
                const base64 = image.toString('base64');

                frame.vision = await ai.analyzeImage({
                    imageBase64: base64,
                    prompt: VISION_PROMPT
                });

                console.log(`[Vision] ${frame.file} OK`);
            } catch (err) {
                console.warn(`[Vision] ${frame.file} fallback`);
                frame.vision = {
                    scene: '',
                    subject: '',
                    action: '',
                    emotion: '',
                    message: '',
                    value: 0
                };
            }

            // Emit progress for each frame analyzed
            this.onProgress?.({
                stage: 4,
                message: `正在进行 AI 视觉识别... (${i + 1}/${frames.length})`,
                visionCount: i + 1,
                totalVision: frames.length
            });
        }

        return frames;
    }

    /* ---------- Entry ---------- */

    public async process(): Promise<void> {
        fs.mkdirSync(this.outputDir, { recursive: true });

        const duration = await this.getDuration();
        console.log(`[Processor] Video duration: ${duration}s`);

        this.onProgress?.({ stage: 1, message: '正在扫描视频结构...' });
        const frames = await this.fastScan(duration);

        this.onProgress?.({ stage: 2, message: '正在抽取关键画面...', framesCount: frames.length });
        await this.extractFrames(frames);

        // Final sanity check: filter out frames that failed extraction
        const validFrames = frames.filter(f => f.file && fs.existsSync(path.join(this.outputDir, f.file)));
        if (validFrames.length === 0 && frames.length > 0) {
            throw new Error('所有画面提取均失败，请检查视频文件路径及 FFmpeg 状态。');
        }

        this.onProgress?.({ stage: 3, message: '正在分析画面叙事价值...' });
        const scored = this.scoreFrames(validFrames);
        const selected = this.selectTopFrames(scored);

        this.onProgress?.({ stage: 4, message: '正在进行 AI 视觉识别...', total: selected.length });
        const visioned = await this.analyzeWithVision(selected);

        const metadata: VideoMetadata = {
            video: path.basename(this.videoPath),
            outputDir: this.outputDir,
            duration,
            frames: visioned
        };

        fs.writeFileSync(
            path.join(this.outputDir, 'frames.json'),
            JSON.stringify(metadata, null, 2)
        );

        this.onProgress?.({ stage: 5, message: '正在生成视频文案...' });
        const script = await generateVideoScript({
            topic: this.topic,
            style: this.style,
            videos: [{
                sourceId: this.sourceId,
                frames: visioned.map(f => ({
                    time: f.time,
                    vision: f.vision!
                }))
            }]
        })
        fs.writeFileSync(
            path.join(this.outputDir, 'script.json'),
            JSON.stringify(script, null, 2)
        );

        this.onProgress?.({ stage: 5, message: '视频解析全部完成', status: 'complete', result: { metadata, script } });
        console.log('\n[Success] Video processing pipeline complete.');
    }
}

