import { utilityProcess, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from './utils/logger';
import { projectManager } from './project-manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Task {
    videoId: string;
    projectId: string;
    data: any;
}

export class TaskScheduler {
    private queue: Task[] = [];
    private activeCount = 0;
    private maxConcurrency = 1;

    constructor(concurrency = 1) {
        this.maxConcurrency = concurrency;
    }

    enqueue(projectId: string, videoId: string, data: any) {
        this.queue.push({ projectId, videoId, data });
        this.next();
    }

    private async next() {
        if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift()!;
        this.activeCount++;

        try {
            await this.runWorker(task);
        } catch (err) {
            logger.error(`Task failed: ${task.videoId}`, err);
        } finally {
            this.activeCount--;
            this.next();
        }
    }

    private async runWorker(task: Task): Promise<void> {
        return new Promise((resolve, reject) => {
            const workerPath = path.join(__dirname, 'workers', 'video-worker.js');
            const child = utilityProcess.fork(workerPath);

            child.on('spawn', () => {
                child.postMessage({
                    type: 'start',
                    data: task.data
                });
            });

            child.on('message', (msg: any) => {
                const { type, data } = msg;

                if (type === 'progress') {
                    const overallProgress = this.calculateOverallProgress(data);
                    this.updateProgress(task.projectId, task.videoId, overallProgress, data.message);

                    if (data.status === 'complete' && data.result) {
                        this.markDone(task.projectId, task.videoId, data.result);
                    }
                } else if (type === 'complete') {
                    resolve();
                } else if (type === 'error') {
                    this.markError(task.projectId, task.videoId, data);
                    reject(new Error(data));
                }
            });

            child.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
            });
        });
    }

    private calculateOverallProgress(data: any): number {
        const { stage, extractedCount, totalFrames, visionCount, totalVision } = data;

        let progress = 0;
        switch (stage) {
            case 1: // Scan
                progress = 5;
                break;
            case 2: // Extract
                if (extractedCount && totalFrames) {
                    progress = 10 + (extractedCount / totalFrames) * 20; // 10% -> 30%
                } else {
                    progress = 10;
                }
                break;
            case 3: // Score
                progress = 35;
                break;
            case 4: // Vision
                if (visionCount && totalVision) {
                    progress = 40 + (visionCount / totalVision) * 50; // 40% -> 90%
                } else {
                    progress = 40;
                }
                break;
            case 5: // Script
                progress = 95;
                break;
            default:
                progress = data.progress || 0;
        }
        return Math.floor(progress);
    }

    private async updateProgress(projectId: string, videoId: string, progress: number, message?: string) {
        try {
            await projectManager.updateVideoProgress(projectId, videoId, {
                progress,
                status: 'processing'
            });
            this.broadcast('project:progress', {
                projectId,
                videoId,
                progress,
                status: 'processing',
                message // Pass friendly message to UI
            });
        } catch (err) {
            logger.error(`Failed to update progress for ${videoId}:`, err);
        }
    }

    private async markDone(projectId: string, videoId: string, result?: any) {
        try {
            if (result) {
                const project = await projectManager.updateVideoResult(projectId, videoId, result);
                const video = project.videos.find(v => v.id === videoId);
                this.broadcast('project:progress', {
                    projectId,
                    videoId,
                    progress: 100,
                    status: 'done',
                    asset: video,
                    script: project.script // Send updated script to UI
                });
            } else {
                await projectManager.updateVideoProgress(projectId, videoId, {
                    status: 'done',
                    progress: 100
                });
                this.broadcast('project:progress', { projectId, videoId, progress: 100, status: 'done' });
            }
        } catch (err) {
            logger.error(`Failed to mark done for ${videoId}:`, err);
        }
    }

    private async markError(projectId: string, videoId: string, error: string) {
        try {
            await projectManager.updateVideoProgress(projectId, videoId, {
                status: 'error',
                error
            });
            this.broadcast('project:progress', { projectId, videoId, status: 'error', error });
        } catch (err) {
            logger.error(`Failed to mark error for ${videoId}:`, err);
        }
    }

    private broadcast(channel: string, data: any) {
        const wins = BrowserWindow.getAllWindows();
        wins.forEach(win => win.webContents.send(channel, data));
    }
}

export const taskScheduler = new TaskScheduler();
