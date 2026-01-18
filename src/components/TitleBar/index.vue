<template>
  <div class="title-bar">
    <div class="drag-region">
      <div class="app-logo">
        <el-icon><Monitor /></el-icon>
        <span>FrameScript</span>
      </div>
    </div>
    <div class="window-controls">
      <div class="control-btn" @click="handleMinimize"><el-icon><Minus /></el-icon></div>
      <div class="control-btn" @click="handleMaximize">
        <el-icon v-if="isMaximized"><CopyDocument /></el-icon>
        <el-icon v-else><FullScreen /></el-icon>
      </div>
      <div class="control-btn close" @click="handleClose"><el-icon><Close /></el-icon></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isMaximized = ref(false);

const handleMinimize = () => {
  window.ipcRenderer.send('app:minimize');
};

const handleMaximize = () => {
  window.ipcRenderer.send('app:maximize');
};

const handleClose = () => {
  window.ipcRenderer.send('app:close');
};

const updateMaximizeState = (_event: any, state: boolean) => {
  isMaximized.value = state;
};

onMounted(() => {
  window.ipcRenderer.on('window-maximized', updateMaximizeState);
});

onUnmounted(() => {
  window.ipcRenderer.off('window-maximized', updateMaximizeState);
});
</script>

<style scoped lang="scss">
.title-bar {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--sidebar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 1000;
  user-select: none;

  .drag-region {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 16px;
    -webkit-app-region: drag;

    .app-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      -webkit-app-region: no-drag;
    }
  }

  .window-controls {
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag;

    .control-btn {
      width: 48px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--el-text-color-regular);
      transition: background 0.2s, color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: var(--el-text-color-primary);
      }

      &.close:hover {
        background: #f56c6c;
        color: white;
      }
    }
  }
}

.dark .control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
