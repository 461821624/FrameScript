<template>
  <div class="library-view">
    <header class="library-header">
      <div class="header-left">
        <h2>素材库</h2>
        <p>管理您的历史视频项目与 AI 脚本</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索项目标题或标签..."
          :prefix-icon="Search"
          class="search-input"
        />
      </div>
    </header>

    <main class="library-content">
      <div v-if="projects.length === 0" class="empty-state">
        <el-empty description="暂无历史项目" />
      </div>

      <div v-else class="project-grid">
        <el-card 
          v-for="project in filteredProjects" 
          :key="project.id" 
          class="project-card glass-effect"
          :body-style="{ padding: '0px' }"
        >
          <div class="card-thumb">
            <el-image :src="project.thumbnail" fit="cover" />
            <div class="duration-tag">{{ project.duration }}</div>
            <div class="status-overlay" :class="project.status">
              {{ project.status === 'completed' ? '已生成' : '待处理' }}
            </div>
          </div>
          
          <div class="card-info">
            <h4 class="project-title">{{ project.title }}</h4>
            <div class="project-meta">
              <span class="time"><el-icon><Calendar /></el-icon> {{ project.createdAt }}</span>
            </div>
          </div>

          <div class="card-footer">
            <el-button size="small" :icon="View" @click="openProject(project)">详情</el-button>
            <el-button size="small" type="danger" link :icon="Delete">删除</el-button>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Calendar, View, Delete } from '@element-plus/icons-vue';

// Mock data
const searchQuery = ref('');
const projects = ref([
  {
    id: 1,
    title: '别再瞎剪了！AI 3分钟带你还原博主级 Vlog',
    thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600',
    duration: '03:45',
    status: 'completed',
    createdAt: '2026-01-17'
  },
  {
    id: 2,
    title: '我的 2025 年度总结 - 手机随拍系列',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600',
    duration: '12:20',
    status: 'pending',
    createdAt: '2026-01-16'
  }
]);

const filteredProjects = computed(() => {
  return projects.value.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openProject = (project: any) => {
  console.log('Opening project:', project.id);
};
</script>

<style scoped lang="scss">
.library-view {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;

    .header-left {
      h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--el-text-color-primary); }
      p { margin: 4px 0 0; color: var(--el-text-color-secondary); font-size: 14px; }
    }

    .search-input {
      width: 300px;
      :deep(.el-input__wrapper) {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        box-shadow: none;
      }
    }
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    padding-bottom: 40px;
  }

  .project-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      border-color: var(--el-color-primary);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      .dark & {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
    }

    .card-thumb {
      height: 160px;
      position: relative;
      background: #000;

      .el-image { width: 100%; height: 100%; opacity: 0.8; }

      .duration-tag {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .status-overlay {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        font-weight: 700;
        
        &.completed { background: var(--el-color-success); color: white; }
        &.pending { background: var(--el-color-warning); color: white; }
      }
    }

    .card-info {
      padding: 16px;

      .project-title {
        margin: 0 0 12px;
        font-size: 14px;
        line-height: 1.5;
        height: 42px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        color: var(--el-text-color-primary);
      }

      .project-meta {
        display: flex;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        gap: 12px;
        
        .el-icon { vertical-align: middle; margin-right: 4px; }
      }
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
