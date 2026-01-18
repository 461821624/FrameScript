<template>
  <div class="videogen-view">
    <!-- Workflow Status Header -->
    <header class="pipeline-header glass-effect">
      <div class="project-info">
        <el-icon class="project-icon"><VideoCamera /></el-icon>
        <span class="project-name">{{ projectStore.script.title || '未命名项目' }}</span>
        <el-tag v-if="projectStore.isGlobalProcessing" type="primary" effect="dark" round class="status-tag">
          处理中 {{ projectStore.totalProgress }}%
        </el-tag>
      </div>
      
      <div class="header-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            :loading="projectStore.isGlobalProcessing"
            @click="startGlobalProcessing"
          >
            {{ projectStore.isGlobalProcessing ? '生产中...' : '生成全部' }}
          </el-button>
          <el-button @click="projectStore.clearProject">清构</el-button>
        </el-button-group>
      </div>
    </header>

    <main class="workspace-layout">
      <!-- Left: Material Shelf -->
      <aside class="material-shelf glass-effect">
        <div class="shelf-header">
          <h4>素材库 ({{ projectStore.sources.length }})</h4>
          <el-button :icon="Plus" circle size="small" @click="triggerUpload" />
        </div>
        
        <el-scrollbar>
          <div class="shelf-content">
            <VideoDropzone 
              v-if="projectStore.sources.length === 0" 
              @upload="handleMultiUpload" 
            />
            <div v-else class="material-list">
              <SourceAssetCard 
                v-for="source in projectStore.sources" 
                :key="source.id"
                :source="source"
                @remove="projectStore.removeSource(source.id)"
              />
            </div>
          </div>
        </el-scrollbar>
      </aside>

      <!-- Middle: Visual Gallery -->
      <section class="visual-theory glass-effect">
        <div class="panel-header">
          <h3>视觉依据</h3>
          <span class="count-badge">按视频检索场景</span>
        </div>

        <el-scrollbar>
          <div class="gallery-content">
            <div v-if="projectStore.sources.length === 0" class="empty-state">
              <el-empty description="请先在左侧添加视频素材" />
            </div>
            
            <el-collapse v-else v-model="activeCollapse">
              <el-collapse-item 
                v-for="source in projectStore.sources" 
                :key="source.id"
                :name="source.id"
              >
                <template #title>
                  <div class="collapse-title">
                    <span class="name">{{ source.name }}</span>
                    <el-tag size="small" :type="source.status === 'done' ? 'success' : 'info'">
                      {{ source.frames.length }} 帧
                    </el-tag>
                  </div>
                </template>
                
                <div class="frames-grid">
                  <KeyFrameCard 
                    v-for="(frame, index) in source.frames" 
                    :key="index" 
                    :data="frame"
                  />
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-scrollbar>
      </section>

      <!-- Right: Script Composer -->
      <aside class="script-composer-panel glass-effect">
        <div class="panel-header">
          <h3>文案编排</h3>
        </div>
        <ScriptComposer />
      </aside>
    </main>

    <!-- Hidden Input for Header Plus Button -->
    <input 
      type="file" 
      ref="fileInput" 
      multiple 
      accept="video/*" 
      style="display: none" 
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VideoCamera, Plus } from '@element-plus/icons-vue';
import { useProjectStore } from '@/store/project';
import VideoDropzone from '@/components/VideoGen/VideoDropzone.vue';
import KeyFrameCard from '@/components/VideoGen/KeyFrameCard.vue';
import SourceAssetCard from '@/components/VideoGen/SourceAssetCard.vue';
import ScriptComposer from '@/components/VideoGen/ScriptComposer.vue';
import { ElMessage } from 'element-plus';
import { settings } from '@/store/settings';

const projectStore = useProjectStore();
const activeCollapse = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  projectStore.setupListeners();
  projectStore.syncSettings(settings);
});

const handleMultiUpload = async (files: File | File[]) => {
  const fileArray = Array.isArray(files) ? files : [files];
  for (const file of fileArray) {
    await projectStore.addSource(file);
    // Auto-expand last added
    const lastId = projectStore.sources[projectStore.sources.length - 1]?.id;
    if (lastId && !activeCollapse.value.includes(lastId)) {
      activeCollapse.value.push(lastId);
    }
  }
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const onFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    handleMultiUpload(Array.from(files));
  }
};

const startGlobalProcessing = async () => {
  if (projectStore.sources.length === 0) {
    ElMessage.warning('请先添加视频素材');
    return;
  }

  try {
    await projectStore.startProcessing({
      aiConfig: {
        provider: settings.aiProvider,
        apiKey: settings.apiKey
      },
      concurrency: settings.concurrency,
      style: settings.style
    });
    ElMessage.info('已启动多素材同步处理');
  } catch (error: any) {
    ElMessage.error(`启动失败: ${error.message}`);
  }
};
</script>

<style scoped lang="scss">
.videogen-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  background: var(--bg-main);

  .pipeline-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    flex-shrink: 0;

    .project-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .project-icon {
        font-size: 20px;
        color: var(--el-color-primary);
      }
      .project-name {
        font-weight: 600;
        font-size: 15px;
      }
      .status-tag {
        margin-left: 8px;
      }
    }
  }

  .workspace-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 280px 1fr 420px;
    gap: 16px;
    min-height: 0;
  }

  .material-shelf, .visual-theory, .script-composer-panel {
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
  }

  .script-composer-panel {
    :deep(.composer-container) {
      flex: 1;
      min-height: 0;
    }
  }

  .shelf-header, .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--glass-border);

    h3, h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .material-shelf {
    .shelf-content {
      padding: 12px;
    }
    .material-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .visual-theory {
    .gallery-content {
      padding: 20px;
    }
    
    .collapse-title {
      display: flex;
      align-items: center;
      gap: 12px;
      .name {
        font-weight: 500;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .frames-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 12px 0;
    }
  }

  .count-badge {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }
}
</style>
