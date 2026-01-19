import { ipcMain } from 'electron';
import path from 'node:path';
import { projectManager } from '../project-manager';
import { taskScheduler } from '../task-scheduler';
import { generateVideoScript } from '../ai/script-generator';

export function registerProjectHandlers() {
    ipcMain.handle('project:create', async (_, { title }) => {
        return await projectManager.createProject(title);
    });

    ipcMain.handle('project:list', async () => {
        return await projectManager.listProjects();
    });

    ipcMain.handle('project:load', async (_, { id }) => {
        return await projectManager.loadProject(id);
    });

    ipcMain.handle('project:delete', async (_, { id }) => {
        await projectManager.deleteProject(id);
        return true;
    });

    ipcMain.handle('project:set-output-path', async (_, { path }) => {
        projectManager.setProjectsDir(path);
        return true;
    });

    ipcMain.handle('video:add', async (_, { projectId, filePath }) => {
        return await projectManager.addVideo(projectId, filePath);
    });

    ipcMain.handle('processing:start', async (_, { projectId, settings }) => {
        const project = await projectManager.loadProject(projectId);
        project.status = 'processing';
        if (settings.topic !== undefined) project.topic = settings.topic;
        await projectManager.saveProject(project);

        for (const video of project.videos) {
            if (video.status === 'pending') {
                const videoOutputDir = path.join(project.path, 'videos', video.id);
                taskScheduler.enqueue(projectId, video.id, {
                    videoPath: video.path,
                    outputDir: videoOutputDir,
                    sourceId: video.id,
                    topic: project.topic,
                    aiConfig: settings.aiConfig,
                    concurrency: settings.concurrency,
                    style: settings.style
                });
            }
        }
    });

    ipcMain.handle('script:generate', async (_, { projectId, topic, style }) => {
        const project = await projectManager.loadProject(projectId);
        if (topic !== undefined) project.topic = topic;

        // Aggregator logic: Group frames by source video
        const videosData = project.videos
            .filter(v => v.status === 'done')
            .map(v => ({
                sourceId: v.id,
                frames: v.frames.map(f => ({
                    time: f.timestamp,
                    vision: f.vision!
                }))
            }));

        const script = await generateVideoScript({
            topic,
            style,
            videos: videosData
        });

        project.script = script; // Format might need matching with frontend Script types
        project.status = 'completed';
        await projectManager.saveProject(project);
        return script;
    });
}
