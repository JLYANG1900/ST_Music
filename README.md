# ST Music Creator

> **让角色成为你的音乐制作人。**  
> *An immersive AI music creation assistant for SillyTavern.*

ST_Music 是一款为 SillyTavern 设计的沉浸式音乐创作与播放插件。它允许你引导角色参与音乐创作，捕捉灵感，并直接在酒馆内播放生成的歌曲，打通 Roleplay 与 AI 音乐生成的壁垒。

## 🎵 核心功能 (Core Features)

*   **🎻 交互式创作引导**
    *   在可视化的交互界面中，选择想要参与创作的 **角色**。
    *   自定义 **人声音域 (Vocal)**、**音乐流派 (Genre)**、**主乐器 (Instrument)** 和 **歌词关键词 (Theme)**。
    *   插件会自动生成针对性的 Prompt，引导 LLM 根据人设生成独一无二的创作笔记。

*   **📝 智能笔记捕捉**
    *   自动监听对话，识别并捕捉 LLM 返回的“创作笔记”。
    *   将散落在对话中的 **Lyrics (歌词)** 和 **Style (风格)** 提取并显示在界面上。
    *   **一键复制**：生成的 Tag 专为 Suno/Udio 等平台优化，一键复制即可开始生成。

*   **☁️ 跨端云播放器**
    *   **Braun SK4 风格 UI**：复古极简的悬浮播放器，让你边玩酒馆边听歌。
    *   **云端同步**：点击上传的音乐会自动保存至服务器 (`uploads/`)，支持在手机端和电脑端同步收听（需服务器环境）。
    *   **数据安全**：上传目录独立管理，不受插件更新影响。

## 📸 界面预览 (Screenshots)

### 📻 播放器界面 Player UI
*边玩酒馆边听，沉浸感拉满。*
![Player UI](https://i.ibb.co/bgP2JLQ4/image.png)

### 🎹 创作界面 Creation UI
*定义你的音乐风格，邀请角色共同创作。*
![Creation UI 1](https://i.ibb.co/RpPDN25T/1.png)
![Creation UI 2](https://i.ibb.co/Kc3cq5xH/2.png)

### 🎼 成果界面 Results
*(成果界面截图即将上线)*

## 📦 安装与使用 (Installation)

1.  进入 SillyTavern 插件目录：
    ```bash
    cd /path/to/SillyTavern/public/scripts/extensions/
    ```
2.  克隆本仓库：
    ```bash
    git clone https://github.com/YourUsername/ST_Music.git
    ```
3.  **重启 SillyTavern** (Server Restart Required)
    *   *注意：必须重启后台控制台，以加载负责文件上传的后端脚本。*

## 💡 使用流程

1.  点击顶部 **🎵** 图标打开面板。
2.  切换到 **"创作"** 标签页，填选参数，点击 **"发送给..."**。
3.  等待 LLM 回复，插件会自动捕捉创作内容到 **"成果"** 标签页。
4.  复制 Prompt 到 Suno 生成音乐。
5.  下载 MP3，点击播放器上的 **Upload** 图标上传，即可在酒馆内循环播放！

---
*Created by JLYANG1900*
