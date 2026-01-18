<template>
  <div 
    class="dropzone-container"
    :class="{ 'is-dragover': isDragOver }"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input 
      type="file" 
      ref="fileInput" 
      style="display: none" 
      accept="video/*"
      multiple
      @change="handleFileChange"
    />
    
    <div class="dropzone-content">
      <el-icon class="upload-icon"><VideoCamera /></el-icon>
      <div class="primary-text">点击或拖拽视频素材</div>
      <div class="secondary-text">支持多选，智能提取画面语义</div>
    </div>

    <div class="glass-reflection"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VideoCamera } from '@element-plus/icons-vue';

const emit = defineEmits(['upload']);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const videoFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      emit('upload', videoFiles);
    }
  }
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files) {
    const videoFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      emit('upload', videoFiles);
    }
  }
};
</script>

<style scoped lang="scss">
.dropzone-container {
  height: 200px;
  width: 100%;
  border: 2px dashed var(--glass-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: var(--glass-bg);

  &:hover, &.is-dragover {
    border-color: var(--el-color-primary);
    background: rgba(var(--el-color-primary-rgb), 0.05);
    
    .upload-icon {
      transform: translateY(-5px);
      color: var(--el-color-primary);
    }
  }

  .dropzone-content {
    text-align: center;
    z-index: 2;
    padding: 20px;

    .upload-icon {
      font-size: 40px;
      color: var(--el-text-color-secondary);
      transition: all 0.4s ease;
      margin-bottom: 12px;
    }

    .primary-text {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .secondary-text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .glass-reflection {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
    pointer-events: none;
    transition: transform 0.6s ease;
  }

  &:hover .glass-reflection {
    transform: translate(10%, 10%);
  }
}
</style>
