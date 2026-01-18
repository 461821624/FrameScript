<template>
  <aside class="sidebar glass-effect">
    
    <el-menu
      default-active="/"
      class="sidebar-menu"
      :collapse="isCollapse"
      background-color="transparent"
      router
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>主页</span>
      </el-menu-item>
      <el-menu-item index="/video-gen">
        <el-icon><VideoCamera /></el-icon>
        <span>视频生成</span>
      </el-menu-item>
      <el-menu-item index="/library">
        <el-icon><Collection /></el-icon>
        <span>素材库</span>
      </el-menu-item>
      <el-menu-item index="/ai-tools">
        <el-icon><MagicStick /></el-icon>
        <span>AI 工具</span>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <el-tooltip content="切换主题" placement="right">
        <el-button circle @click="toggleDark">
          <el-icon><Sunny v-if="isDark" /><Moon v-else /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDark } from '@vueuse/core';
import { HomeFilled, VideoCamera, Collection, MagicStick, Setting, Sunny, Moon } from '@element-plus/icons-vue';

const isCollapse = ref(false);
const isDark = useDark();
const toggleDark = () => {
  isDark.value = !isDark.value;
};
</script>

<style scoped lang="scss">
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--glass-border);
  transition: width 0.3s;

  .sidebar-header {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--glass-border);

    .user-info {
      .username {
        font-weight: 600;
        font-size: 14px;
      }
      .status {
        font-size: 12px;
        color: var(--el-color-success);
      }
    }
  }

  .sidebar-menu {
    border-right: none;
    flex: 1;
    padding: 12px 0;

    :deep(.el-menu-item) {
      margin: 4px 12px;
      border-radius: 8px;
      height: 44px;
      line-height: 44px;

      &:hover {
        background-color: rgba(var(--el-color-primary-rgb), 0.1);
      }

      &.is-active {
        background-color: var(--el-color-primary);
        color: white;
      }
    }
  }

  .sidebar-footer {
    padding: 16px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--glass-border);
  }
}
</style>
