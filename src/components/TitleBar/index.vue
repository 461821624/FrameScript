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
      <div class="control-btn close" @click="handleClose"><el-icon><Close /></el-icon></div>
    </div>
  </div>
</template>

<script setup lang="ts">

const handleMinimize = () => {
  window.ipcRenderer.send('app:minimize');
};

const handleClose = () => {
  window.ipcRenderer.send('app:close');
};
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
    padding-left: 20px;
    -webkit-app-region: drag;

    .app-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      color: var(--text-primary);
      -webkit-app-region: no-drag;
      font-family: var(--font-heading);
      font-size: 16px;
      
      .el-icon {
        color: var(--primary-color);
        font-size: 20px;
      }
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
      color: var(--text-secondary);
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--text-primary);
        
        .dark & {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      &.close:hover {
        background: #ef4444;
        color: white;
      }
    }
  }
}
</style>
