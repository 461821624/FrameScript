import { reactive, watch } from 'vue';

const STORAGE_KEY = 'framescript-settings';

const defaultSettings = {
    aiProvider: 'openai',
    apiKey: '',
    concurrency: 3,
    outputPath: '',
    autoSave: true,
    style: 'professional'
};

const saved = localStorage.getItem(STORAGE_KEY);
export const settings = reactive(saved ? JSON.parse(saved) : defaultSettings);

watch(settings, (newSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
}, { deep: true });
