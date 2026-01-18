<template>
  <el-card class="frame-card" :body-style="{ padding: '0px' }">
    <div class="frame-preview">
      <el-image 
        :src="data.url" 
        fit="cover" 
        class="frame-image"
        :preview-src-list="[data.url]"
      />
      <div class="frame-score" :class="scoreClass">
        {{ (data.score * 10).toFixed(1) }}
      </div>
      <div class="frame-time">{{ formatTime(data.timestamp) }}</div>
    </div>
    
    <div v-if="data.vision" class="frame-content">
      <div class="semantic-tags">
        <el-tag size="small" effect="plain">{{ data.vision.scene }}</el-tag>
        <el-tag size="small" type="success" effect="plain">{{ data.vision.subject }}</el-tag>
      </div>
      
      <div class="action-description">
        <el-icon><Pointer /></el-icon>
        <span>{{ data.vision.action }}</span>
      </div>

      <div class="emotion-status">
        <el-tag size="small" type="warning" round>{{ data.vision.emotion }}</el-tag>
        <span class="value-prop">叙事价值: {{ data.vision.value }}</span>
      </div>
    </div>

    <div class="card-actions">
      <el-button type="danger" link :icon="Delete" @click="$emit('remove')">移除此帧</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Delete, Pointer } from '@element-plus/icons-vue';

interface FrameData {
  url: string;
  timestamp: number;
  score: number;
  vision?: {
    scene: string;
    subject: string;
    action: string;
    emotion: string;
    message: string;
    value: number;
  };
}

const props = defineProps<{
  data: FrameData;
}>();

defineEmits(['remove']);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const scoreClass = computed(() => {
  if (props.data.score > 0.8) return 'score-high';
  if (props.data.score > 0.5) return 'score-mid';
  return 'score-low';
});
</script>

<style scoped lang="scss">
.frame-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .frame-preview {
    position: relative;
    height: 160px;
    
    .frame-image {
      width: 100%;
      height: 100%;
    }

    .frame-score {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      backdrop-filter: blur(4px);
    }

    .score-high { background: rgba(103, 194, 58, 0.8); }
    .score-mid { background: rgba(230, 162, 60, 0.8); }
    .score-low { background: rgba(245, 108, 108, 0.8); }

    .frame-time {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 2px 6px;
      font-size: 11px;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
    }
  }

  .frame-content {
    padding: 12px;

    .semantic-tags {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .action-description {
      font-size: 13px;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      line-height: 1.4;
      
      .el-icon { font-size: 14px; color: var(--el-color-primary); }
    }

    .emotion-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .value-prop {
        font-size: 11px;
        color: var(--el-text-color-secondary);
        font-style: italic;
      }
    }
  }

  .card-actions {
    padding: 8px 12px;
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: flex-end;
  }
}
</style>
