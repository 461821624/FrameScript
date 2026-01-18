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
        <el-empty v-if="recentProjects.length === 0" description="暂无最近活动" />
        <div v-else class="project-strip-container">
          <!-- Short list of items -->
          <div v-for="p in recentProjects" :key="p.id" class="project-strip glass-effect">
            <el-image :src="p.thumb" fit="cover" class="strip-thumb" />
            <div class="strip-info">
              <div class="strip-title">{{ p.title }}</div>
              <div class="strip-time">{{ p.time }}</div>
            </div>
            <el-tag size="small" type="success" effect="dark">已生成</el-tag>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { VideoCamera, Collection, Cpu, Timer, Files, ArrowRight } from '@element-plus/icons-vue';

const stats = [
  { title: '累计处理视频', value: '24', unit: '个', icon: Files, color: '#3b82f6' },
  { title: 'AI 分析时长', value: '1,420', unit: '分钟', icon: Timer, color: '#10b981' },
  { title: '节省创作时间', value: '86', unit: '小时', icon: Cpu, color: '#f59e0b' }
];

const recentProjects = [
  { id: 1, title: '别再瞎剪了！AI 3分钟带你还原博主级 Vlog', time: '2小时前', thumb: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=200' },
  { id: 2, title: '我的 2025 年度总结 - 手机随拍系列', time: '昨天 18:30', thumb: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200' }
];
</script>

<style scoped lang="scss">
.welcome-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 0 60px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  .hero-section {
    position: relative;
    padding: 60px 40px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.03) 100%);
    border: 1px solid var(--glass-border);
    overflow: hidden;
    display: flex;
    align-items: center;

    .dark & {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      flex: 1;

      .gradient-text {
        font-size: 56px;
        font-weight: 800;
        margin: 0 0 16px;
        background: linear-gradient(to right, #1e293b, #64748b);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -1px;

        .dark & {
          background: linear-gradient(to right, #ffffff, #94a3b8);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .subtitle {
        font-size: 18px;
        color: var(--el-text-color-secondary);
        margin-bottom: 40px;
      }

      .hero-actions {
        display: flex;
        gap: 16px;

        .action-btn {
          border-radius: 12px;
          height: 48px;
          padding: 0 28px;
          font-weight: 600;
        }
        
        .primary-btn {
          box-shadow: 0 4px 15px rgba(var(--el-color-primary-rgb), 0.3);
        }
      }
    }

    .hero-viz {
      position: absolute;
      right: -100px;
      top: -100px;
      width: 400px;
      height: 400px;
      z-index: 1;

      .viz-blob {
        position: absolute;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
        filter: blur(40px);
        animation: rotate 20s linear infinite;

        .dark & {
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
        }
      }

      .secondary {
        right: 0;
        bottom: 0;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
        animation: rotate 15s linear infinite reverse;

        .dark & {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
        }
      }
    }
  }

  .stat-card {
    padding: 24px;
    border-radius: 20px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    gap: 20px;
    transition: transform 0.3s, background-color 0.3s;

    &:hover { transform: translateY(-5px); }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-main {
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        line-height: 1.2;
        
        .unit { font-size: 14px; font-weight: 400; margin-left: 4px; color: var(--el-text-color-secondary); }
      }
      .stat-title {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }
  }

  .recent-projects {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h3 { margin: 0; font-size: 18px; font-weight: 600; }
    }

    .project-strip {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--el-bg-color-overlay);
      border: 1px solid var(--glass-border);
      margin-bottom: 12px;
      gap: 16px;
      transition: background 0.3s;

      &:hover { background: rgba(255, 255, 255, 0.06); }

      .strip-thumb {
        width: 80px;
        height: 45px;
        border-radius: 6px;
      }

      .strip-info {
        flex: 1;
        .strip-title { font-size: 14px; font-weight: 500; color: var(--el-text-color-primary); }
        .strip-time { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 2px; }
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
