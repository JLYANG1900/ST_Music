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

*   **📻 音频播放器**
    *   **Braun SK4 风格 UI**：复古极简的悬浮播放器，让你边玩酒馆边听歌。
    *   **两种导入方式**：
        1.  **本地上传**：支持上传本地 MP3 文件试听（浏览器刷新后会清除）。
        2.  **网络链接**：支持输入第三方（如 catbox.moe）的 MP3 直链，链接会保存至本地，刷新后依然有效。

## 📸 界面预览 (Screenshots)

### 📻 播放器界面 Player UI
*边玩酒馆边听，沉浸感拉满。*
![Player UI](https://i.ibb.co/JRScvp5K/image.png)

### 🎹 创作界面 Creation UI
*定义你的音乐风格，邀请角色共同创作。*
![Creation UI 1](https://i.ibb.co/RpPDN25T/1.png)
![Creation UI 2](https://i.ibb.co/Kc3cq5xH/2.png)

### 🎼 成果界面 Results
![Results UI](https://i.ibb.co/dwqgNLtW/image.png)

## 📦 安装与使用 (Installation)

### Method 1: Automatic Installation (Recommended / 推荐)
1.  In SillyTavern, open the **Extensions** menu.
    *   在 SillyTavern 中打开 **扩展 (Extensions)** 菜单。
2.  Click **Install Extension** button.
    *   点击 **安装扩展 (Install Extension)** 按钮。
3.  Paste the following Git URL into the input box and click **Save**:
    *   将以下 Git URL 粘贴到输入框中并点击 **保存**:
    ```
    https://github.com/JLYANG1900/ST_Music
    ```
4.  Find the extension in the list and enable it.
    *   在列表中找到该插件并启用。

### Method 2: Manual Installation (Git Clone)
1.  进入 SillyTavern 插件目录：
    ```bash
    cd /path/to/SillyTavern/public/scripts/extensions/
    ```
2.  克隆本仓库：
    ```bash
    git clone https://github.com/JLYANG1900/ST_Music.git
    ```
3.  **重启 SillyTavern**。

## 💡 使用流程

1.  点击顶部 **🎵** 图标打开面板。
2.  切换到 **"创作"** 标签页，填选参数，点击 **"发送给..."**。
3.  等待 LLM 回复，插件会自动捕捉创作内容到 **"成果"** 标签页。
4.  复制 Prompt 到 Suno 生成音乐。
5.  下载 MP3，点击播放器上的 **Upload** 图标上传，即可在酒馆内循环播放！

## 📝 更新日志 (Changelog)

### 2026-01-23
- **新增「韵脚方案」模块** (05 / Lyrics Concept)
  - 5 个选项：不押韵、ABCB (二四押韵)、AABB (双行押韵)、ABAB (交叉押韵)、AAAA (全行押韵)
  - 点击按钮后显示听感描述与歌曲例子

- **新增「声部音色」模块** (02 / Vocal Range)
  - 8 个选项：Auto (自动)、Husky (烟嗓)、Clean (清澈)、Warm (温暖)、Gritty (粗砺)、Bright (明亮)、Dark (暗淡)、Soulful (深情)
  - 选择 Auto 时，根据角色自动推断合理音色

- **新增「歌词语言」模块** (05 / Lyrics Concept)
  - 支持中文、英文两个快捷选项
  - 支持自定义其他语言

- **优化「05 / Lyrics Concept」面板布局**
  - 所有模块整合到统一白色面板内
  - 创作模式改为 BRAUN 风格按钮

- **增强乐器提示词**
  - 新增指令要求 AI 描述乐器"在做什么"
  - 句式：The instrumentation features [Instrument] playing [Action]...

---
*Created by JLYANG1900*
