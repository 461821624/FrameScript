<template>
  <div class="source-asset-card" :class="source.status">
    <div class="card-main">
      <div class="video-preview">
        <el-icon v-if="source.status === 'pending'"><VideoCamera /></el-icon>
        <el-icon v-else-if="source.status === 'processing'" class="is-loading"><Loading /></el-icon>
        <el-icon v-else-if="source.status === 'done'"><Check /></el-icon>
        <el-icon v-else><Warning /></el-icon>
      </div>
      
      <div class="video-info">
        <div class="name-row">
          <span class="file-name" :title="source.name">{{ source.name }}</span>
          <el-icon class="remove-btn" @click.stop="$emit('remove')"><Close /></el-icon>
        </div>
        
        <div class="meta-row">
          <span>{{ formatSize(source.size) }}</span>
          <span v-if="source.duration">• {{ formatDuration(source.duration) }}</span>
        </div>
      </div>
    </div>

    <div v-if="source.status === 'processing'" class="card-progress">
      <el-progress 
        :percentage="source.progress" 
        :stroke-width="2" 
        :show-text="false"
        class="mini-progress"
      />
      <span class="progress-text">{{ source.progress }}% {{ source.message || '分析中...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoCamera, Loading, Check, Warning, Close } from '@element-plus/icons-vue';
import type { VideoSource } from '@/store/project';

defineProps<{
  source: VideoSource;
}>();

defineEmits(['remove']);

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => v.toString().padStart(2, '0')).filter((v, i) => v !== '00' || i > 0).join(':');
};
</script>

<style scoped lang="scss">
.source-asset-card {
  background: var(--panel-bg);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card-main {
    display: flex;
    gap: 12px;
    align-items: center;
    max-width: 200px;
    text-overflow: ellipsis;
  }

  .video-preview {
    width: 44px;
    height: 44px;
    background: var(--bg-main);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }

  .video-info {
    flex: 1;
    min-width: 0;

    .name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;

      .file-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .remove-btn {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
        
        &:hover {
          color: var(--el-color-danger);
        }
      }
    }
    
    &:hover .remove-btn {
      opacity: 1;
    }

    .meta-row {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      display: flex;
      gap: 8px;
    }
  }

  .card-progress {
    margin-top: 10px;
    
    .mini-progress {
      margin-bottom: 4px;
    }
    
    .progress-text {
      font-size: 10px;
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }

  &.done {
    .video-preview {
      color: var(--el-color-success);
      background: rgba(var(--el-color-success-rgb), 0.1);
    }
  }
}
</style>
