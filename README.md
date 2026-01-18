# FrameScript

FrameScript 是一款基于 AI 的视频内容生成与分析桌面应用程序，采用 Vue 3 + Electron 架构开发。

## 🚀 项目概览

FrameScript 旨在简化视频处理流程，通过集成的 AI 模型（如 Google Gemini）实现视频帧分析、脚本生成以及自动化的内容创作流。

## 🏗️ 项目架构

项目采用前后端分离的现代化桌面应用架构：

### 1. 前端层 (Renderer Process)
- **框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router](https://router.vuejs.org/)
- **样式**: SCSS & CSS Variables (支持深色/浅色主题)

### 2. 后端层 (Main Process)
- **框架**: [Electron](https://www.electronjs.org/)
- **通信**: 安全的 IPC (Inter-Process Communication) 通道
- **存储**: 本地文件系统 & 配置管理

### 3. AI 引擎层
- **核心模型**: Google Gemini 1.5 Flash (通过 `@google/genai` SDK 集成)
- **功能**: 
  - 视觉帧分析 (Vision Analysis)
  - 智能脚本生成 (Script Generation)
  - 多模态处理支持

### 4. 视频处理系统
- **底层驱动**: [FFmpeg](https://ffmpeg.org/)
- **执行环境**: 独立的 Worker 线程，确保 UI 流畅性
- **工作流**: 场景检测 -> 关键帧提取 -> AI 语义分析

## 📂 项目结构

```text
FrameScript/
├── electron/               # Electron 主进程代码
│   ├── ai/                # AI 客户端及 Prompt 管理
│   ├── ipc/               # IPC 通信处理
│   ├── workers/           # 视频处理辅助线程
│   └── main.ts            # 主进程入口
├── src/                    # Vue 前端代码
│   ├── components/        # 公共组件
│   ├── views/             # 页面视图
│   ├── store/             # 状态管理
│   ├── styles/            # 全局样式与主题
│   └── main.ts            # 渲染进程入口
├── public/                 # 静态资源
└── vite.config.ts          # 构建配置
```

## 🛠️ 使用方法

### 环境准备
- Node.js (建议 v18+)
- FFmpeg (程序会自动管理，或确保系统已安装)

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
在项目根目录或主进程配置中设置您的 AI API Key：
- 支持 Google Gemini API Key

### 3. 运行开发服务器
```bash
npm run dev
```

### 4. 构建应用
```bash
# 构建对应的桌面端安装包
npm run build
```

## ✨ 主要功能
- 🎞️ **智能抽帧**: 自动识别视频场景，提取最具代表性的画面。
- 👁️ **画面理解**: 利用 Gemini / Qwen Vision 模型深度解析帧内容。
- 📝 **脚本生成**: 根据视觉分析结果，自动生成视频文案，支持“创作主题”限定。
- 🎨 **现代化 UI**: 极致的响应式设计，支持系统级主题切换。

## 📅 路线图 / 待办事项 (TODO)
- [ ] **视觉依据选项卡**: 增加“移除此帧”功能，允许手动精简分析素材。
- [ ] **文案编排选项卡**: 增加“智能优化”功能，实现剧本的整体润色与连贯性增强。
- [ ] **多端适配**: 适配更多分辨率与深色模式细节优化。

## 📝 许可证
MIT License
