import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { app } from 'electron';
import { Project, VideoAsset } from './types';
import { logger } from './utils/logger';

export class ProjectManager {
    private projectsDir: string;
    private projectsCache: Map<string, Project> = new Map();
    private writeQueues: Map<string, Promise<void>> = new Map();

    constructor() {
        this.projectsDir = path.join(app.getPath('userData'), 'projects');
        this.ensureDir(this.projectsDir);
    }

    private ensureDir(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * Update the base directory for projects.
     * Existing projects won't be moved, but new ones will use this path.
     */
    setProjectsDir(newDir: string) {
        if (!newDir) return;
        this.projectsDir = newDir;
        this.ensureDir(this.projectsDir);
        logger.info(`[ProjectManager] Projects directory updated to: ${this.projectsDir}`);
    }

    async createProject(title: string): Promise<Project> {
        const id = Date.now().toString();
        const projectPath = path.join(this.projectsDir, id);
        this.ensureDir(projectPath);
        this.ensureDir(path.join(projectPath, 'videos'));

        const project: Project = {
            id,
            title,
            topic: '',
            path: projectPath,
            status: 'idle',
            videos: [],
            script: {
                title: '',
                hook: '',
                segments: [],
                ending: '',
                hashtags: []
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.projectsCache.set(id, project);
        await this.saveProject(project);
        return project;
    }

    async saveProject(project: Project): Promise<void> {
        // Use a queue per project to prevent race conditions during write
        const currentQueue = this.writeQueues.get(project.id) || Promise.resolve();
        const newQueue = currentQueue.then(async () => {
            const data = JSON.stringify(project, null, 2);
            const projectFilePath = path.join(project.path, 'project.json');
            const tempPath = projectFilePath + '.tmp';

            try {
                // Atomic write: write to tmp then rename
                await fs.promises.writeFile(tempPath, data, 'utf8');
                await fs.promises.rename(tempPath, projectFilePath);
                this.projectsCache.set(project.id, project);
            } catch (err) {
                logger.error(`Failed to save project ${project.id}:`, err);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                throw err;
            }
        });

        this.writeQueues.set(project.id, newQueue);
        return newQueue;
    }

    async loadProject(id: string): Promise<Project> {
        // Return from cache if available
        if (this.projectsCache.has(id)) {
            return this.projectsCache.get(id)!;
        }

        const projectPath = path.join(this.projectsDir, id);
        const data = await fs.promises.readFile(path.join(projectPath, 'project.json'), 'utf-8');
        const project = JSON.parse(data) as Project;
        this.projectsCache.set(id, project);
        return project;
    }

    async listProjects(): Promise<Project[]> {
        const dirs = await fs.promises.readdir(this.projectsDir);
        const projects: Project[] = [];
        for (const id of dirs) {
            try {
                projects.push(await this.loadProject(id));
            } catch (err) {
                logger.error(`Failed to load project ${id}:`, err);
            }
        }
        return projects;
    }

    async updateVideoResult(projectId: string, videoId: string, result: any): Promise<Project> {
        const project = await this.loadProject(projectId);
        const video = project.videos.find(v => v.id === videoId);
        if (video && result.metadata) {
            video.status = 'done';
            video.progress = 100;
            video.duration = result.metadata.duration;
            video.frames = result.metadata.frames.map((f: any) => {
                const absolutePath = path.join(result.metadata.outputDir, f.file);
                // Use pathToFileURL to handle special characters and Windows drive letters correctly
                const url = pathToFileURL(absolutePath).toString().replace('file://', 'atom://');
                return {
                    file: f.file,
                    url,
                    timestamp: f.time,
                    score: f.score || 0,
                    vision: f.vision
                };
            });

            // Persist Script
            if (result.script) {
                if (!project.script) {
                    project.script = {
                        title: '',
                        hook: '',
                        segments: [],
                        ending: '',
                        hashtags: []
                    };
                }

                if (!project.script.title) project.script.title = result.script.title;
                if (!project.script.hook) project.script.hook = result.script.hook;
                if (!project.script.ending) project.script.ending = result.script.ending;
                if (!project.script.hashtags || project.script.hashtags.length === 0) {
                    project.script.hashtags = result.script.hashtags;
                }

                // Map segments to the sourceId and replace old ones for this video
                const newSegments = (result.script.segments || []).map((seg: any) => ({
                    ...seg,
                    sourceId: videoId
                }));

                project.script.segments = [
                    ...project.script.segments.filter(s => s.sourceId !== videoId),
                    ...newSegments
                ];
            }

            project.updatedAt = Date.now();
            await this.saveProject(project);
        }
        return project;
    }

    async updateVideoProgress(projectId: string, videoId: string, updates: Partial<VideoAsset>): Promise<Project> {
        const project = await this.loadProject(projectId);
        const video = project.videos.find(v => v.id === videoId);
        if (video) {
            Object.assign(video, updates);
            project.updatedAt = Date.now();
            await this.saveProject(project);
        }
        return project;
    }

    async addVideo(projectId: string, filePath: string): Promise<VideoAsset> {
        const project = await this.loadProject(projectId);
        const videoId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const stats = fs.statSync(filePath);

        const video: VideoAsset = {
            id: videoId,
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            status: 'pending',
            progress: 0,
            frames: []
        };

        project.videos.push(video);
        await this.saveProject(project);
        return video;
    }
}

export const projectManager = new ProjectManager();
