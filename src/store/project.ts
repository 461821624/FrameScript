import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { settings } from './settings';

export interface KeyFrame {
    file: string;
    url: string;
    timestamp: number;
    score: number;
    vision?: {
        scene: string;
        subject: string;
        action: string;
        emotion: string;
        message: string;
        value: number;
    };
}

export interface VideoSource {
    id: string;
    name: string;
    path: string;
    size: number;
    duration?: number;
    resolution?: string;
    status: 'pending' | 'processing' | 'done' | 'error';
    progress: number;
    message?: string;
    error?: string;
    frames: KeyFrame[];
}

export interface ScriptSegment {
    id: string;
    sourceId: string; // References VideoSource.id
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

export const useProjectStore = defineStore('project', () => {
    const currentProjectId = ref<string | null>(null);
    const settingsSynced = ref(false);
    const projectStatus = ref<'idle' | 'processing' | 'done'>('idle');
    const sources = ref<VideoSource[]>([]);
    const topic = ref('');
    const script = reactive<Script>({
        title: '',
        hook: '',
        segments: [],
        ending: '',
        hashtags: []
    });

    const isGlobalProcessing = computed(() =>
        projectStatus.value === 'processing' || sources.value.some(s => s.status === 'processing')
    );

    const totalProgress = computed(() => {
        if (sources.value.length === 0) return 0;
        const total = sources.value.reduce((acc, s) => acc + s.progress, 0);
        return Math.round(total / sources.value.length);
    });

    const initProject = async (title: string = '新项目') => {
        // Ensure settings are synced before creating a project to respect outputPath
        if (!settingsSynced.value) {
            console.warn('[Store] Waiting for settings sync before project creation...');
        }
        const project = await (window as any).ipcRenderer.invoke('project:create', { title });
        currentProjectId.value = project.id;
        return project;
    };

    const loadExistingProject = async (projectId: string) => {
        const project = await (window as any).ipcRenderer.invoke('project:load', { id: projectId });
        currentProjectId.value = project.id;
        projectStatus.value = project.status === 'processing' ? 'processing' :
            project.status === 'completed' ? 'done' : 'idle';
        topic.value = project.topic || '';

        // Map videos to sources
        sources.value = project.videos.map((v: any) => ({
            id: v.id,
            name: v.name,
            path: v.path,
            size: v.size,
            duration: v.duration,
            status: v.status,
            progress: v.progress || 100,
            frames: v.frames || [],
            error: v.error
        }));

        // Restore script
        if (project.script) {
            script.title = project.script.title || '';
            script.hook = project.script.hook || '';
            script.segments = project.script.segments || [];
            script.ending = project.script.ending || '';
            script.hashtags = project.script.hashtags || [];
        }

        return project;
    };

    const addSource = async (file: File) => {
        if (!currentProjectId.value) await initProject();

        const video = await (window as any).ipcRenderer.invoke('video:add', {
            projectId: currentProjectId.value,
            filePath: (file as any).path
        });

        const source: VideoSource = {
            ...video,
            frames: []
        };
        sources.value.push(source);
    };

    const startProcessing = async (settings: any) => {
        if (!currentProjectId.value) return;
        projectStatus.value = 'processing';
        await (window as any).ipcRenderer.invoke('processing:start', {
            projectId: currentProjectId.value,
            settings: {
                ...settings,
                topic: topic.value
            }
        });
    };

    const removeSource = (id: string) => {
        const index = sources.value.findIndex(s => s.id === id);
        if (index !== -1) {
            sources.value.splice(index, 1);
            script.segments = script.segments.filter(seg => seg.sourceId !== id);
        }
    };

    const clearProject = () => {
        sources.value = [];
        currentProjectId.value = null;
        projectStatus.value = 'idle';
        script.title = '';
        script.hook = '';
        script.segments = [];
        script.ending = '';
        script.hashtags = [];
    };

    // Setup Listeners
    const setupListeners = () => {
        const ipc = (window as any).ipcRenderer;
        ipc.removeAllListeners('project:progress');
        ipc.on('project:progress', (_event: any, data: any) => {
            const source = sources.value.find(s => s.id === data.videoId);
            if (source) {
                source.status = data.status;
                source.progress = data.progress ?? source.progress;
                source.message = data.message;
                if (data.error) source.error = data.error;

                // Update full asset if provided (contains frames/metadata)
                if (data.asset) {
                    source.frames = data.asset.frames || [];
                    source.duration = data.asset.duration;
                }

                // Update project script if provided
                if (data.script) {
                    script.title = data.script.title || script.title;
                    script.hook = data.script.hook || script.hook;
                    script.ending = data.script.ending || script.ending;
                    script.hashtags = data.script.hashtags || script.hashtags;
                    script.segments = data.script.segments || script.segments;
                }
            }

            // Sync project status
            if (sources.value.length > 0 && sources.value.every(s => s.status === 'done' || s.status === 'error')) {
                projectStatus.value = 'done';
            }
        });
    };

    const syncSettings = async (settings: any) => {
        if (settings.outputPath) {
            await (window as any).ipcRenderer.invoke('project:set-output-path', { path: settings.outputPath });
        }
        settingsSynced.value = true;
    };

    // Initial sync
    syncSettings(settings);

    return {
        currentProjectId,
        projectStatus,
        sources,
        script,
        isGlobalProcessing,
        totalProgress,
        topic,
        initProject,
        loadExistingProject,
        addSource,
        startProcessing,
        removeSource,
        clearProject,
        setupListeners,
        syncSettings
    };
});
