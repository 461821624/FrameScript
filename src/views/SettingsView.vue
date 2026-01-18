<template>
  <div class="settings-view">
    <header class="settings-header">
      <h2>系统设置</h2>
      <p>配置 AI 模型与本地环境参数</p>
    </header>

    <main class="settings-content">
      <el-form :model="config" label-position="top" class="settings-form">
        <!-- AI Provider Section -->
        <div class="settings-section glass-effect">
          <h3 class="section-title"><el-icon><Cpu /></el-icon> AI 引擎配置</h3>
          
          <el-form-item label="AI 服务商">
            <el-select v-model="config.aiProvider" style="width: 100%">
              <el-option label="OpenAI (Gpt-4o / Vision)" value="openai" />
              <el-option label="阿里千问 (Qwen-VL-Plus)" value="qwen" />
              <el-option label="gemini-3-flash-preview" value="gemini" />
              <el-option label="Mock (离线测试模式)" value="mock" />
            </el-select>
            <div class="form-tip">离线模式将使用预设的模拟数据，不消耗 API 额度</div>
          </el-form-item>

          <el-form-item label="API Key">
            <el-input 
              v-model="config.apiKey" 
              type="password" 
              show-password 
              placeholder="sk-..."
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="并发处理数">
                <el-slider v-model="config.concurrency" :min="1" :max="5" show-input />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Output Settings -->
        <div class="settings-section glass-effect">
          <h3 class="section-title"><el-icon><FolderOpened /></el-icon> 本地导出设置</h3>
          
          <el-form-item label="默认输出目录">
            <el-input v-model="config.outputPath">
              <template #append>
                <el-button :icon="Folder" @click="selectDirectory">选择</el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="config.autoSave">自动保存处理历史到素材库</el-checkbox>
          </el-form-item>
        </div>

        <!-- Preferences -->
        <div class="settings-section glass-effect">
          <h3 class="section-title"><el-icon><MagicStick /></el-icon> 文案风格偏好</h3>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="默认语气">
                <el-radio-group v-model="config.style">
                  <el-radio-button value="professional">纪录 / 专业</el-radio-button>
                  <el-radio-button value="emotional">情绪 / 感染</el-radio-button>
                  <el-radio-button value="funny">幽默 / 干货</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="form-actions">
          <el-button type="primary" size="large" @click="saveSettings">保存配置</el-button>
          <el-button size="large">重置</el-button>
        </div>
      </el-form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { settings } from '@/store/settings';
import { Cpu, FolderOpened, Folder, MagicStick } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const config = settings;

const selectDirectory = async () => {
  const result = await (window as any).ipcRenderer.invoke('app:select-directory');
  if (result) {
    config.outputPath = result;
  }
};

const saveSettings = () => {
  ElMessage.success('配置已自动保存');
};
</script>

<style scoped lang="scss">
.settings-view {
  padding: 8px;
  max-width: 900px;
  margin: 0 auto;

  .settings-header {
    margin-bottom: 32px;
    h2 { margin: 0; font-size: 24px; font-weight: 700; }
    p { margin: 8px 0 0; color: var(--el-text-color-secondary); }
  }

  .settings-section {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      margin: 0 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--el-color-primary);
      
      .el-icon { font-size: 20px; }
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
  }

  .form-actions {
    margin-top: 40px;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding-bottom: 40px;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    padding-bottom: 8px;
  }
}
</style>
