<template>
  <div class="ai-tools-view">
    <header class="tools-header">
      <div class="header-content">
        <h2 class="title-gradient">AI 创作中心</h2>
        <p>利用尖端人工智能技术，提升您的视频创作效率与质量</p>
      </div>
      
      <div class="category-tabs">
        <div 
          v-for="cat in categories" 
          :key="cat.id"
          class="category-tab"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.name }}
        </div>
      </div>
    </header>

    <main class="tools-grid">
      <div 
        v-for="tool in filteredTools" 
        :key="tool.id" 
        class="tool-card glass-panel"
      >
        <div class="tool-icon-wrapper" :style="{ background: tool.color + '20', color: tool.color }">
          <el-icon><component :is="tool.icon" /></el-icon>
        </div>
        
        <div class="tool-content">
          <div class="tool-header">
            <h3>{{ tool.name }}</h3>
            <el-tag size="small" effect="plain" class="tool-category">{{ getCategoryName(tool.category) }}</el-tag>
          </div>
          <p>{{ tool.description }}</p>
        </div>

        <div class="tool-footer">
          <div class="tool-tags">
            <span v-for="tag in tool.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
          <el-button type="primary" size="small" class="action-btn">立即体验</el-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  VideoCamera, 
  Microphone, 
  MagicStick, 
  Picture, 
  Cpu, 
  Sunny, 
  ChatLineRound,
  Connection
} from '@element-plus/icons-vue';

const activeCategory = ref('all');

const categories = [
  { id: 'all', name: '全部工具' },
  { id: 'video', name: '视频增强' },
  { id: 'audio', name: '智能音频' },
  { id: 'content', name: '内容创作' }
];

const tools = [
  {
    id: 1,
    name: '超分辨率增强',
    description: '利用 AI 算法将低分辨率视频提升至 4K 极清画质，修复细节色彩。',
    icon: VideoCamera,
    category: 'video',
    color: '#7C3AED',
    tags: ['4K', '修复'],
  },
  {
    id: 2,
    name: '智能人声分离',
    description: '精准分离视频中的背景音乐与人声，消除杂音，提升音频纯净度。',
    icon: Microphone,
    category: 'audio',
    color: '#06B6D4',
    tags: ['消噪', '提取'],
  },
  {
    id: 3,
    name: 'AI 脚本扩写',
    description: '输入核心创意，AI 自动为您扩展为完整的视频脚本与拍摄分镜。',
    icon: MagicStick,
    category: 'content',
    color: '#EC4899',
    tags: ['创意', '剧本'],
  },
  {
    id: 4,
    name: '风格迁移涂鸦',
    description: '将视频画面转换为油画、动漫或赛博朋克等多种艺术风格。',
    icon: Picture,
    category: 'video',
    color: '#F59E0B',
    tags: ['滤镜', '艺术'],
  },
  {
    id: 5,
    name: '自动字幕生成',
    description: '高精度语音识别，自动生成并对齐多语言字幕，支持导出 SRT。',
    icon: ChatLineRound,
    category: 'audio',
    color: '#10B981',
    tags: ['ASR', '多语言'],
  },
  {
    id: 6,
    name: '智能镜头分割',
    description: '自动检测视频转场与场景切换，快速拆分长视频为素材段落。',
    icon: Connection,
    category: 'video',
    color: '#3B82F6',
    tags: ['剪辑', '提效'],
  },
  {
    id: 7,
    name: '背景一键移除',
    description: '无需绿幕，AI 自动识别人物主体，实时移除或替换复杂背景。',
    icon: Cpu,
    category: 'video',
    color: '#EF4444',
    tags: ['扣像', '合成'],
  },
  {
    id: 8,
    name: '自然光影重塑',
    description: '调整视频的光线布局，模拟黄金时刻或电影感布光效果。',
    icon: Sunny,
    category: 'video',
    color: '#8B5CF6',
    tags: ['调色', '光影'],
  }
];

const filteredTools = computed(() => {
  if (activeCategory.value === 'all') return tools;
  return tools.filter(t => t.category === activeCategory.value);
});

const getCategoryName = (id: string) => {
  return categories.find(c => c.id === id)?.name || '';
};
</script>

<style scoped lang="scss">
@use "../styles/mixins" as mix;

.ai-tools-view {
  padding: 8px;
  height: 100%;
  overflow-y: auto;

  .tools-header {
    margin-bottom: 32px;
    
    .header-content {
      margin-bottom: 24px;
      h2 { 
        margin: 0; 
        font-size: 32px; 
        font-weight: 800;
        @include mix.text-gradient;
      }
      p { 
        margin: 8px 0 0; 
        color: var(--el-text-color-secondary); 
        font-size: 16px;
      }
    }

    .category-tabs {
      display: flex;
      gap: 12px;
      
      .category-tab {
        padding: 8px 20px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--el-text-color-regular);

        &:hover {
          border-color: var(--primary-accent);
          color: var(--primary-accent);
        }

        &.active {
          background: var(--accent-gradient);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }
      }
    }
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    padding-bottom: 40px;
  }

  .tool-card {
    @include mix.glass-panel;
    @include mix.hover-lift;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100%;

    .tool-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      @include mix.flex-center;
      font-size: 24px;
      margin-bottom: 16px;
    }

    .tool-content {
      flex: 1;
      .tool-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        h3 { margin: 0; font-size: 18px; font-weight: 700; }
        .tool-category { 
          border-radius: 4px; 
          font-weight: 600; 
          opacity: 0.8;
          font-size: 11px;
        }
      }
      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-secondary);
        height: 68px;
        overflow: hidden;
      }
    }

    .tool-footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .tool-tags {
        display: flex;
        gap: 8px;
        .tag {
          font-size: 12px;
          color: var(--primary-accent);
          opacity: 0.7;
        }
      }

      .action-btn {
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 600;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
      }
    }
  }
}
</style>
