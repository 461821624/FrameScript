<template>
  <aside class="sidebar glass-effect">
    
    <el-menu
      :default-active="currentRoute"
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useDark } from '@vueuse/core';
import { HomeFilled, VideoCamera, Collection, Setting, Sunny, Moon } from '@element-plus/icons-vue';

const route = useRoute();
const currentRoute = computed(() => route.path);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;

  .sidebar-header {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    /* Logo text style if present */
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .sidebar-menu {
    border-right: none;
    flex: 1;
    padding: 12px 16px;

    :deep(.el-menu-item) {
      margin: 4px 0;
      border-radius: 12px;
      height: 48px;
      line-height: 48px;
      font-family: var(--font-heading);
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background-color: var(--el-menu-hover-bg-color);
        transform: translateX(4px);
      }

      &.is-active {
        background: var(--accent-gradient);
        color: white;
        box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
        border: none;
        
        .el-icon {
          color: white;
        }
      }
      
      .el-icon {
        transition: color 0.2s;
        font-size: 18px;
      }
    }
  }

  .sidebar-footer {
    padding: 24px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--glass-border);
    background: linear-gradient(to top, rgba(0,0,0,0.02), transparent);
  }
}
</style>
