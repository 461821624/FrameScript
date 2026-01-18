<template>
  <div class="pipeline-container">
    <div 
      v-for="(stage, index) in stages" 
      :key="index"
      class="stage-item"
      :class="{ 
        'active': currentStage === index + 1,
        'completed': currentStage > index + 1,
        'pending': currentStage < index + 1
      }"
    >
      <div class="stage-icon">
        <el-icon v-if="currentStage > index + 1"><Check /></el-icon>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <div class="stage-info">
        <div class="stage-name">{{ stage.name }}</div>
        <div class="stage-status">{{ getStatusText(index + 1) }}</div>
      </div>
      <div v-if="index < stages.length - 1" class="stage-connector"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';

interface Stage {
  name: string;
}

const props = defineProps<{
  currentStage: number;
  stages: Stage[];
  extractedCount?: number;
  visionProgress?: { current: number; total: number };
}>();

const getStatusText = (stageNum: number) => {
  if (props.currentStage > stageNum) return '已完成';
  if (props.currentStage === stageNum) {
    if (stageNum === 2 && props.extractedCount) {
        return `提取中 (${props.extractedCount} 帧)`;
    }
    if (stageNum === 4 && props.visionProgress?.total) {
        return `分析中 (${props.visionProgress.current}/${props.visionProgress.total})`;
    }
    return '进行中...';
  }
  return '等待中';
};
</script>

<style scoped lang="scss">
.pipeline-container {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 0;
  width: 100%;
}

.stage-item {
  display: flex;
  align-items: center;
  position: relative;
  flex: 1;

  .stage-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
  }

  .stage-info {
    margin-left: 12px;
    
    .stage-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .stage-status {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .stage-connector {
    position: absolute;
    left: 32px;
    right: 0;
    top: 16px;
    height: 2px;
    background: var(--el-border-color-lighter);
    z-index: 1;
    margin: 0 12px;
  }

  &.pending {
    .stage-icon {
      background: var(--panel-bg);
      border: 1px solid var(--glass-border);
      color: var(--el-text-color-secondary);
    }
  }

  &.active {
    .stage-icon {
      background: var(--el-color-primary);
      color: white;
      box-shadow: 0 0 15px rgba(var(--el-color-primary-rgb), 0.4);
      transform: scale(1.1);
    }
    .stage-name {
      color: var(--el-color-primary);
    }
  }

  &.completed {
    .stage-icon {
      background: var(--el-color-success);
      color: white;
    }
    .stage-connector {
      background: var(--el-color-success);
    }
  }
}
</style>
