<template>
  <div class="welcome-container">
    <!-- Hero Section -->
    <header class="hero-section glass-effect">
      <div class="hero-content">
        <h1 class="gradient-text">FrameScript</h1>
        <p class="subtitle">AI 视频编导助手 · 让每一帧叙事更有价值</p>
        
        <div class="hero-actions">
          <el-button 
            type="primary" 
            size="large" 
            :icon="VideoCamera" 
            class="action-btn primary-btn"
            @click="$router.push('/')"
          >
            开始视频分析
          </el-button>
          <el-button 
            size="large" 
            :icon="Collection" 
            class="action-btn"
            @click="$router.push('/library')"
          >
            浏览素材库
          </el-button>
        </div>
      </div>
      
      <!-- Decorative element -->
      <div class="hero-viz">
        <div class="viz-blob"></div>
        <div class="viz-blob secondary"></div>
      </div>
    </header>
    
    <!-- Stats Dashboard -->
    <section class="stats-dashboard">
      <el-row :gutter="24">
        <el-col :span="8" v-for="stat in stats" :key="stat.title">
          <div class="stat-card glass-effect">
            <div class="stat-icon" :style="{ color: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-main">
              <div class="stat-value">{{ stat.value }}<span class="unit">{{ stat.unit }}</span></div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </section>

    <!-- Recent Activity -->
    <section class="recent-projects">
      <div class="section-header">
        <h3>最近项目</h3>
        <el-button link @click="$router.push('/library')">查看全部 <el-icon><ArrowRight /></el-icon></el-button>
      </div>
      
      <div class="activity-list">
        <el-skeleton v-if="loading" :rows="3" animated />
        <div v-else-if="recentProjects.length === 0" class="empty-guide-card glass-effect">
          <div class="guide-icon">🎬</div>
          <h4>开始您的第一个视频项目</h4>
          <p>导入视频素材，AI 将自动分析画面并生成专业脚本</p>
          <el-button type="primary" @click="$router.push('/video-gen')">
            <el-icon><VideoCamera /></el-icon>
            立即创建
          </el-button>
        </div>
        <div v-else class="project-strip-container">
          <div 
            v-for="p in recentProjects" 
            :key="p.id" 
            class="project-strip glass-effect"
            @click="openProject(p.id)"
          >
            <el-image :src="p.thumb" fit="cover" class="strip-thumb">
              <template #error>
                <div class="image-placeholder"><el-icon><VideoCamera /></el-icon></div>
              </template>
            </el-image>
            <div class="strip-info">
              <div class="strip-title">{{ p.title }}</div>
              <div class="strip-time">{{ p.time }}</div>
            </div>
            <el-tag 
              size="small" 
              :type="p.status === 'completed' ? 'success' : (p.status === 'processing' ? 'primary' : 'info')" 
              effect="dark"
            >
              {{ p.status === 'completed' ? '已完成' : (p.status === 'processing' ? '处理中' : '待处理') }}
            </el-tag>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { VideoCamera, Collection, Cpu, Timer, Files, ArrowRight } from '@element-plus/icons-vue';

interface Project {
  id: string;
  title: string;
  path: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  videos: { id: string; name: string; duration?: number; frames: { file: string }[] }[];
  createdAt: number;
  updatedAt: number;
}

const router = useRouter();
const projects = ref<Project[]>([]);
const loading = ref(true);

const fetchProjects = async () => {
  try {
    const list = await (window as any).ipcRenderer.invoke('project:list');
    projects.value = list;
  } catch (err) {
    console.error('Failed to fetch projects:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProjects);

const stats = computed(() => {
  let totalVideos = 0;
  let totalDurationMinutes = 0;
  
  projects.value.forEach(p => {
    totalVideos += p.videos.length;
    p.videos.forEach(v => {
      if (v.duration) totalDurationMinutes += v.duration / 60;
    });
  });

  // Rough estimation: 1 min video takes 1 hour to edit manually
  const savedHours = Math.round(totalDurationMinutes * 1.5);

  return [
    { title: '累计处理视频', value: totalVideos.toString(), unit: '个', icon: Files, color: '#3b82f6' },
    { title: 'AI 分析时长', value: Math.round(totalDurationMinutes).toLocaleString(), unit: '分钟', icon: Timer, color: '#10b981' },
    { title: '节省创作时间', value: savedHours.toString(), unit: '小时', icon: Cpu, color: '#f59e0b' }
  ];
});

const recentProjects = computed(() => {
  return [...projects.value]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 3)
    .map(p => {
      // Find first frame for thumbnail
      let thumb = '';
      for (const v of p.videos) {
        if (v.frames && v.frames.length > 0) {
          thumb = `atom://${p.path}/videos/${v.id}/${v.frames[0].file}`;
          break;
        }
      }
      
      // Relative time formatting (simplified)
      const diff = Date.now() - p.updatedAt;
      let timeText = '刚刚';
      if (diff > 86400000) timeText = `${Math.floor(diff / 86400000)}天前`;
      else if (diff > 3600000) timeText = `${Math.floor(diff / 3600000)}小时前`;
      else if (diff > 60000) timeText = `${Math.floor(diff / 60000)}分钟前`;

      return {
        id: p.id,
        title: p.title,
        time: timeText,
        thumb: thumb || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        status: p.status
      };
    });
});
const openProject = (id: string) => {
  sessionStorage.setItem('loadProjectId', id);
  router.push('/video-gen');
};
</script>

<style scoped lang="scss">
@use "@/styles/mixins.scss" as mix;

.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 48px;

  .image-placeholder {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    @include mix.flex-center;
    color: var(--text-secondary);
    font-size: 20px;
  }

  .hero-section {
    position: relative;
    padding: 80px 60px;
    border-radius: 32px;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.6) 0%, rgba(30, 30, 30, 0.4) 100%);
    border: 1px solid var(--glass-border);
    overflow: hidden;
    display: flex;
    align-items: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

    .dark & {
      background: linear-gradient(135deg, rgba(12, 12, 12, 0.8) 0%, rgba(20, 20, 20, 0.6) 100%);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      flex: 1;
      max-width: 600px;

      .gradient-text {
        @include mix.text-gradient;
        font-size: 72px;
        font-weight: 800;
        margin: 0 0 24px;
        letter-spacing: -2px;
        line-height: 1.1;
      }
      
      // ... hero actions styles
      .subtitle {
        font-size: 20px;
        color: var(--text-secondary);
        margin-bottom: 48px;
        line-height: 1.6;
        font-weight: 400;
      }

      .hero-actions {
        display: flex;
        gap: 20px;

        .action-btn {
          border-radius: 16px;
          height: 56px;
          padding: 0 32px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s;
          border: none;
        }
        
        .primary-btn {
          background: var(--accent-gradient);
          color: white;
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
          
          &:hover {
            background: var(--accent-gradient-hover);
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(124, 58, 237, 0.5);
          }
        }
      }
    }

    // ... viz styles
    .hero-viz {
      position: absolute;
      right: -10%;
      top: -20%;
      width: 800px;
      height: 800px;
      z-index: 1;
      opacity: 0.6;
      pointer-events: none;

      .viz-blob {
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%);
        filter: blur(80px);
        animation: rotate 25s linear infinite;
      }

      .secondary {
        right: 10%;
        bottom: 10%;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
        animation: rotate 20s linear infinite reverse;
      }
    }
  }

  .stat-card {
    @include mix.glass-panel;
    @include mix.hover-lift;
    
    padding: 32px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 24px;

    .stat-icon {
      @include mix.flex-center;
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(124, 58, 237, 0.1);
      font-size: 28px;
    }

    .stat-main {
      min-width: 0;
      
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.1;
        margin-bottom: 4px;
        font-family: var(--font-heading);
        white-space: nowrap;
        
        .unit { 
          font-size: 14px; 
          font-weight: 500; 
          margin-left: 6px; 
          color: var(--text-secondary);
          vertical-align: baseline;
        }
      }
      .stat-title {
        font-size: 14px;
        color: var(--text-secondary);
        font-weight: 500;
        white-space: nowrap;
      }
    }
  }

  .recent-projects {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      
      h3 { 
        margin: 0; 
        font-size: 20px; 
        font-weight: 600; 
        color: var(--text-primary);
      }
    }

    .project-strip {
      @include mix.glass-panel;
      @include mix.hover-lift;
      
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-radius: 16px;
      margin-bottom: 16px;
      gap: 20px;
      transition: all 0.3s;
      cursor: pointer;
      
      .dark & {
         background: rgba(255, 255, 255, 0.02);
      }

      &:hover { 
        border-color: rgba(124, 58, 237, 0.2);
        .dark & {
           background: rgba(255, 255, 255, 0.05);
        }
      }

      .strip-thumb {
        width: 100px;
        height: 60px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }

      .strip-info {
        flex: 1;
        .strip-title { 
          font-size: 16px; 
          font-weight: 600; 
          color: var(--text-primary); 
          margin-bottom: 4px;
        }
        .strip-time { font-size: 13px; color: var(--text-secondary); }
      }
    }

    .empty-guide-card {
      text-align: center;
      padding: 48px 32px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed var(--glass-border);

      .guide-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      h4 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px;
        color: var(--text-primary);
      }

      p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0 0 24px;
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
