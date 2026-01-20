<template>
  <div class="composer-container">
    <el-scrollbar>
      <div class="composer-sections">
        <!-- Topic Constraint Section -->
        <div class="form-section header-section topic-constraint">
          <label>创作主题 (如：辣椒炒肉)</label>
          <el-input 
            v-model="projectStore.topic" 
            placeholder="限定生成内容的主题方向..." 
            class="custom-input topic-input"
          />
        </div>

        <!-- Title Section -->
        <div class="form-section header-section">
          <label>建议标题</label>
          <el-input 
            v-model="projectStore.script.title" 
            placeholder="为您的内容起一个吸引人的标题..." 
            class="custom-input title-input"
          />
        </div>

        <!-- Hook Section -->
        <div class="form-section">
          <label>黄金 3 秒 Hook</label>
          <div class="input-with-actions">
            <el-input
              v-model="projectStore.script.hook"
              type="textarea"
              :rows="2"
              placeholder="开场第一句话，抓住注意力..."
              class="custom-textarea"
            />
            <el-button :icon="MagicStick" circle size="small" title="优化 Hook" />
          </div>
        </div>

        <!-- Segments Area -->
        <div class="segments-area">
          <label class="area-label">脚本正文 (由素材生成的片段)</label>
          
          <div v-if="projectStore.script.segments.length === 0" class="empty-segments">
            <p>生成文案后，此处将按素材顺序显示脚本片段</p>
          </div>

          <div 
            v-for="segment in projectStore.script.segments" 
            :key="segment.id"
            class="segment-item"
            :class="{ 'is-locked': segment.locked }"
          >
            <div class="segment-meta">
              <el-tag size="small" round class="source-badge">
                {{ getSourceName(segment.sourceId) }}
              </el-tag>
              <div class="segment-actions">
                <el-icon 
                  class="action-icon" 
                  :class="{ active: segment.locked }"
                  @click="segment.locked = !segment.locked"
                >
                  <Lock v-if="segment.locked" /><Unlock v-else />
                </el-icon>
                <el-icon class="action-icon drag-handle"><Rank /></el-icon>
              </div>
            </div>
            
            <el-input
              v-model="segment.text"
              type="textarea"
              autosize
              placeholder="该片段的文案内容..."
              class="segment-textarea"
              :disabled="isSourceProcessing(segment.sourceId)"
            />
          </div>
        </div>

        <!-- Ending Section -->
        <div class="form-section">
          <label>结尾 (Ending)</label>
          <el-input
            v-model="projectStore.script.ending"
            type="textarea"
            :rows="2"
            placeholder="引导关注或行动呼吁..."
            class="custom-textarea"
          />
        </div>

        <!-- Hashtags -->
        <div class="form-section">
          <label>话题标签</label>
          <div class="tag-input-group">
            <el-tag
              v-for="tag in projectStore.script.hashtags"
              :key="tag"
              closable
              round
              class="script-tag"
              @close="removeTag(tag)"
            >
              #{{ tag }}
            </el-tag>
            <el-input
              v-model="newTag"
              size="small"
              placeholder="+ 标签"
              class="new-tag-input"
              @keyup.enter="addTag"
            />
          </div>
        </div>
      </div>
    </el-scrollbar>

    <div class="composer-footer glass-effect">
      <el-dropdown trigger="click" @command="handleExport">
        <el-button type="success" plain>
          <el-icon><Download /></el-icon>
          导出脚本
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="txt">导出为 TXT 文本</el-dropdown-item>
            <el-dropdown-item command="srt">导出为 SRT 字幕</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" :icon="DocumentCopy" plain @click="copyFullScript">
        复制代码
      </el-button>
      <el-button type="primary" :icon="MagicStick" @click="optimizeAll">
        智能优化
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  DocumentCopy, 
  MagicStick, 
  Lock, 
  Unlock, 
  Rank,
  Download,
  ArrowDown
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useProjectStore } from '@/store/project';

const projectStore = useProjectStore();
const newTag = ref('');

const isSourceProcessing = (sourceId: string) => {
  const source = projectStore.sources.find(s => s.id === sourceId);
  return source?.status === 'processing';
};

const getSourceName = (sourceId: string, maxLength = 20) => {
  const source = projectStore.sources.find(s => s.id === sourceId);
  if (!source) return '未知素材';
  if (source.name.length <= maxLength) return source.name;
  return source.name.substring(0, maxLength) + '...';
};

const removeTag = (tag: string) => {
  projectStore.script.hashtags = projectStore.script.hashtags.filter(t => t !== tag);
};

const addTag = () => {
  if (newTag.value && !projectStore.script.hashtags.includes(newTag.value)) {
    projectStore.script.hashtags.push(newTag.value);
    newTag.value = '';
  }
};

const copyFullScript = () => {
  const { title, hook, segments, ending, hashtags } = projectStore.script;
  const content = segments.map(s => s.text).join('\n\n');
  const text = `【${title}】\n\nHOOK: ${hook}\n\n内容:\n${content}\n\nENDING: ${ending}\n\n${hashtags.map(t => `#${t}`).join(' ')}`;
  
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制完整脚本');
};

const handleExport = async (format: string) => {
  const { title, hook, segments, ending, hashtags } = projectStore.script;
  
  let content = '';
  let filename = `${title || '脚本'}_${Date.now()}`;
  
  if (format === 'txt') {
    // Plain text format
    const body = segments.map(s => s.text).join('\n\n');
    content = `【${title}】\n\nHOOK:\n${hook}\n\n正文:\n${body}\n\nENDING:\n${ending}\n\n标签: ${hashtags.map(t => `#${t}`).join(' ')}`;
    filename += '.txt';
  } else if (format === 'srt') {
    // SRT subtitle format
    content = segments.map((seg, idx) => {
      const startTime = formatSrtTime(idx * 5); // Placeholder timing
      const endTime = formatSrtTime((idx + 1) * 5);
      return `${idx + 1}\n${startTime} --> ${endTime}\n${seg.text}\n`;
    }).join('\n');
    filename += '.srt';
  }

  try {
    const result = await (window as any).ipcRenderer.invoke('dialog:save-file', {
      filename,
      content,
      filters: format === 'txt' 
        ? [{ name: '文本文件', extensions: ['txt'] }]
        : [{ name: 'SRT 字幕', extensions: ['srt'] }]
    });
    
    if (result.success) {
      ElMessage.success(`已导出到 ${result.path}`);
    } else if (result.canceled) {
      // User canceled, do nothing
    } else {
      ElMessage.error('导出失败');
    }
  } catch (error: any) {
    ElMessage.error(`导出失败: ${error.message}`);
  }
};

const formatSrtTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s},000`;
};

const optimizeAll = () => {
  ElMessage.info('AI 正在整体优化连贯性...');
};
</script>

<style scoped lang="scss">
.composer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;

  .composer-sections {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  :deep(.el-scrollbar) {
    flex: 1;
    min-height: 0;
  }

  .form-section {
    label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .el-input, .el-textarea {
      width: 100%;
    }

    .title-input {
      :deep(.el-input__wrapper) {
        font-size: 16px;
        font-weight: 600;
      }
    }

    &.topic-constraint {
      .topic-input {
        :deep(.el-input__wrapper) {
          border-left: 3px solid var(--el-color-primary);
          background: rgba(var(--el-color-primary-rgb), 0.03);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }
    }
  }

  .input-with-actions {
    position: relative;
    width: 100%;
    
    .el-input, .el-textarea {
      width: 100%;
    }

    .el-button {
      position: absolute;
      right: 8px;
      bottom: 8px;
      opacity: 0.6;
      &:hover { opacity: 1; }
      z-index: 2; /* Ensure button is on top */
    }
  }

  .segments-area {
    .area-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .empty-segments {
      padding: 32px 16px;
      text-align: center;
      border: 1px dashed var(--glass-border);
      border-radius: 8px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    .segment-item {
      background: var(--bg-main);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      margin-bottom: 12px;
      padding: 12px;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.is-locked {
        border-color: var(--el-color-warning-light-7);
        background: rgba(var(--el-color-warning-rgb), 0.02);
      }

      .segment-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .source-badge {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .segment-actions {
          display: flex;
          gap: 8px;
          .action-icon {
            cursor: pointer;
            color: var(--el-text-color-secondary);
            font-size: 16px;
            &:hover { color: var(--el-color-primary); }
            &.active { color: var(--el-color-warning); }
          }
        }
      }

      .segment-textarea {
        :deep(.el-textarea__inner) {
          border: none;
          background: transparent;
          padding: 0;
          box-shadow: none;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
        }
      }
    }
  }

  .tag-input-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    
    .script-tag {
      background: rgba(var(--el-color-primary-rgb), 0.1);
      border-color: transparent;
      color: var(--el-color-primary);
    }

    .new-tag-input {
      width: 80px;
      :deep(.el-input__wrapper) {
        background: transparent;
        border-style: dashed;
      }
    }
  }

  .composer-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--glass-border);
    display: flex;
    justify-content: space-between;
    background: var(--glass-bg);
  }
}
</style>
