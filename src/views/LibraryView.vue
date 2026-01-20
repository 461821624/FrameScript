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
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="projects.length === 0" class="empty-state">
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
            <h4 
              v-if="editingId !== project.id" 
              class="project-title" 
              @dblclick="startEditing(project)"
              :title="'双击编辑标题'"
            >{{ project.title }}</h4>
            <el-input 
              v-else 
              v-model="editingTitle" 
              size="small"
              class="title-input"
              @blur="saveTitle(project)"
              @keyup.enter="saveTitle(project)"
              ref="titleInputRef"
            />
            <div class="project-meta">
              <span class="time"><el-icon><Calendar /></el-icon> {{ project.createdAt }}</span>
            </div>
          </div>

          <div class="card-footer">
            <el-button size="small" :icon="Edit" @click="startEditing(project)">重命名</el-button>
            <el-button size="small" :icon="View" @click="openProject(project)">详情</el-button>
            <el-button size="small" type="danger" link :icon="Delete" @click="deleteProject(project)">删除</el-button>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Calendar, View, Delete, Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface Project {
  id: string;
  title: string;
  path: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  videos: { id: string; name: string; duration?: number; frames: { file: string }[] }[];
  createdAt: number;
  updatedAt: number;
}

interface DisplayProject {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  status: 'completed' | 'pending';
  createdAt: string;
}

const router = useRouter();
const searchQuery = ref('');
const projects = ref<DisplayProject[]>([]);
const loading = ref(true);
const editingId = ref<string | null>(null);
const editingTitle = ref('');
const titleInputRef = ref<HTMLInputElement | null>(null);

// Format duration from seconds to MM:SS
function formatDuration(seconds?: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format timestamp to date string
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

// Load projects from backend
async function loadProjects() {
  loading.value = true;
  try {
    const rawProjects: Project[] = await (window as any).ipcRenderer.invoke('project:list');
    
    projects.value = rawProjects.map(p => {
      // Get first frame as thumbnail, or use placeholder
      const firstVideo = p.videos[0];
      const firstFrame = firstVideo?.frames[0];
      const thumbnail = firstFrame 
        ? `atom://${p.path}/videos/${firstVideo.id}/${firstFrame.file}`.replace(/\\/g, '/')
        : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600';

      // Calculate total duration
      const totalDuration = p.videos.reduce((acc, v) => acc + (v.duration || 0), 0);

      return {
        id: p.id,
        title: p.title || '未命名项目',
        thumbnail,
        duration: formatDuration(totalDuration),
        status: p.status === 'completed' ? 'completed' : 'pending',
        createdAt: formatDate(p.createdAt)
      };
    });
  } catch (error) {
    console.error('Failed to load projects:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProjects();
});

const filteredProjects = computed(() => {
  return projects.value.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const openProject = (project: DisplayProject) => {
  sessionStorage.setItem('loadProjectId', project.id);
  router.push('/video-gen');
};

const deleteProject = async (project: DisplayProject) => {
  const confirmed = window.confirm(`确定要删除项目「${project.title}」吗？此操作不可恢复。`);
  if (!confirmed) return;

  try {
    await (window as any).ipcRenderer.invoke('project:delete', { id: project.id });
    
    // Clear project from storage if it was the one staged for loading
    if (sessionStorage.getItem('loadProjectId') === project.id) {
      sessionStorage.removeItem('loadProjectId');
    }

    await loadProjects();
  } catch (error) {
    console.error('Failed to delete project:', error);
    alert('删除失败，请重试');
  }
};

const startEditing = (project: DisplayProject) => {
  editingId.value = project.id;
  editingTitle.value = project.title;
  nextTick(() => {
    titleInputRef.value?.focus();
  });
};

const saveTitle = async (project: DisplayProject) => {
  if (!editingTitle.value.trim()) {
    editingTitle.value = project.title;
    editingId.value = null;
    return;
  }

  if (editingTitle.value === project.title) {
    editingId.value = null;
    return;
  }

  try {
    await (window as any).ipcRenderer.invoke('project:rename', {
      id: project.id,
      title: editingTitle.value.trim()
    });
    project.title = editingTitle.value.trim();
    ElMessage.success('项目已重命名');
  } catch (error) {
    console.error('Failed to rename project:', error);
    ElMessage.error('重命名失败');
  } finally {
    editingId.value = null;
  }
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
