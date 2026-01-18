export const IPC_CHANNELS = {
    APP: {
        GET_INFO: 'app:get-info',
        MINIMIZE: 'app:minimize',
        MAXIMIZE: 'app:maximize',
        CLOSE: 'app:close',
        SELECT_DIRECTORY: 'app:select-directory',
    },
    VIDEO: {
        PROCESS: 'video:process',
        EXTRACTION_START: 'video:extraction-start',
        EXTRACTION_PROGRESS: 'video:extraction-progress',
        EXTRACTION_COMPLETE: 'video:extraction-complete',
        EXTRACTION_ERROR: 'video:extraction-error',
    },
} as const;
