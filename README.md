# ST Music Creator

[中文](#中文-chinese) | [English](#english)

## 中文 Chinese

> **让角色成为你的音乐制作人。**

ST_Music 是一款为 SillyTavern 设计的沉浸式音乐创作与播放插件。它允许你引导角色参与音乐创作，捕捉灵感，并直接在酒馆内播放生成的歌曲，打通 Roleplay 与 AI 音乐生成的壁垒。

### 🎵 核心功能

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

*   **🪶 插件内独立 API 功能**
    *   参考 Abstract 外置手机的配置方式，支持 Primary / Secondary API profile 与 music 视图路由。
    *   内置 OpenAI、Gemini、Claude、DeepSeek、MiniMax 的 103 个已核对文本 API 型号（含别名和快照）；另有「自定义」选项，可填写接口地址、模型 ID、API Key 和可选生成参数。
    *   点击羽毛按钮后进入「发送预览」面板，可查看固定 System Prompt、User Prompt，并支持填写「补充信息」。
    *   成果面板支持「历史记录」，自动保存最近 8 条生成结果，可随时回溯加载。

### 📸 界面预览

#### 📻 播放器界面

*边玩酒馆边听，沉浸感拉满。*
![Player UI](https://i.ibb.co/JRScvp5K/image.png)

#### 🎹 创作界面

*定义你的音乐风格，邀请角色共同创作。*
![Creation UI 1](https://i.ibb.co/RpPDN25T/1.png)
![Creation UI 2](https://i.ibb.co/Kc3cq5xH/2.png)

#### 🎼 成果界面

![Results UI](https://i.ibb.co/dwqgNLtW/image.png)

### 📦 安装与使用

#### 方式一：自动安装（推荐）

1.  在 SillyTavern 中打开 **扩展 (Extensions)** 菜单。
2.  点击 **安装扩展 (Install Extension)** 按钮。
3.  将以下 Git URL 粘贴到输入框中并点击 **保存**：

    ```
    https://github.com/JLYANG1900/ST_Music
    ```
4.  在列表中找到该插件并启用。

#### 方式二：手动安装（Git Clone）

1.  进入 SillyTavern 插件目录：
    ```bash
    cd /path/to/SillyTavern/public/scripts/extensions/
    ```
2.  克隆本仓库：
    ```bash
    git clone https://github.com/JLYANG1900/ST_Music.git
    ```
3.  **重启 SillyTavern**。

### 💡 使用流程

1.  点击顶部 **🎵** 图标打开面板。
2.  切换到 **"创作"** 标签页，填选参数，点击 **"发送给..."**。
3.  等待 LLM 回复，插件会自动捕捉创作内容到 **"成果"** 标签页。
4.  复制 Prompt 到 Suno 生成音乐。
5.  下载 MP3，点击播放器上的 **Upload** 图标上传，即可在酒馆内循环播放！

### 模型与自定义接口

官方模型目录按 **2026-10-23** 核对：OpenAI 54、Gemini 19、Claude 20、DeepSeek 4、MiniMax 6，共 **103 个型号**，包含有效别名及快照。目录和官方来源见 [MODEL_CATALOG.md](MODEL_CATALOG.md)，运行时数据位于 `ModelCatalog.js`。未来计划下线但目前仍可调用的型号保留并标注；受限或存量用户型号并不保证任意账户可用。目录不会自动联网更新。

Primary / Secondary 均可选择「自定义」：

1. 选择请求格式：OpenAI Chat Completions、OpenAI Responses、Anthropic Messages 或 Gemini Generate Content。
2. 填写服务商的 Base URL（例如 `https://example.com/v1`）或完整接口地址，以及准确模型 ID。Gemini 的完整接口地址须与模型 ID 一致。
3. 填写该服务商的 API Key；本地无鉴权服务可留空。Temperature 和最大输出 Tokens 可留空；不支持采样参数的推理模型应保持 Temperature 留空。
4. 保存独立 API 设置，再按需调整 Routing。MiniMax 官方配置可选择中国区／国际区，平台应与 API Key 对应。

切换供应商时，当前页面会分别保留各供应商草稿，避免把上一家密钥带到新接口；保存后保留每个 Profile 当前选中的配置。配置存于当前浏览器。请求由浏览器发出，自定义服务需允许跨域；HTTPS 酒馆访问 HTTP 接口也可能被浏览器的混合内容策略阻止。

使用搜索专用模型时，成果和历史记录会显示 API 返回的可点击来源。暂未确认标准文本接口的型号及实时专用协议例外，在模型目录中列明；不会把未经验证的型号伪装成内置可用模型。

### 开发验证

从项目目录运行无需额外依赖的功能回归：

```bash
node --test tests/mobile-compatibility.test.cjs tests/api-service.test.cjs
```

浏览器回归需要 Playwright 和已安装的 Chrome；若 Playwright 不在当前 Node 的模块路径中，可指定其安装位置：

```bash
ST_MUSIC_PLAYWRIGHT=/absolute/path/to/playwright node tests/mobile-browser.cjs
ST_MUSIC_PLAYWRIGHT=/absolute/path/to/playwright node tests/api-settings-browser.cjs
```

这些脚本在独立浏览器上下文中加载本地源码，覆盖鼠标/触摸拖动、位置恢复、旋转、九组视口布局、弹窗及模拟软键盘，以及模型列表、自定义配置保存、供应商切换和旧配置迁移；不调用音乐生成 API。字体和图标使用离线占位，测试不代替完整酒馆主题下的 iOS / Android 真机检查。

### 📝 更新日志

#### 2026-10-23

- 扩展五供应商现役文本模型目录，新增自定义接口与四种请求格式，保留既有配置；新增 MiniMax 中国区／国际区选择及搜索引用展示。
- 悬浮入口统一支持鼠标、触摸和触控笔拖动，无需 jQuery UI；拖动不会误开面板，位置自动保存，旋转屏幕后保持在可见范围内。
- 修复手机播放列表零宽、标题栏按钮裁切和添加歌曲弹窗裁切；手机创作、成果、设置页将空间留给当前内容，音乐继续播放，可通过播放器页签切回。
- 面板和弹窗跟随可见视口及安全区调整，适配横屏和软键盘；触屏操作按钮加大，删除入口始终显示。
- 复制支持局域网 HTTP 兼容回退；自动复制不可用时提供手动复制。
- 首次点击播放自动选中第一首，正确处理播放失败与快速切歌；支持一次导入多首本地歌曲，删除后释放对应资源。

#### 2026-07-01

- **扩展五供应商模型选择**
  - OpenAI：gpt-5.5
  - Gemini：gemini-3.5-flash、Gemini 2.5 Pro、Gemini 2.5 Flash
  - Claude：Claude Fable 5、Claude Mythos 5、Claude Opus 4.8、Claude Sonnet 5、Claude Sonnet 4.6、Claude Haiku 4.5
  - DeepSeek：deepseek-v4-flash、deepseek-v4-pro
  - MiniMax：MiniMax-M3、MiniMax-M2.7

- **重构独立 API 为五供应商多模型选择**
  - Primary / Secondary profile 的每个 profile 可选择 OpenAI、Gemini、Claude、DeepSeek、MiniMax 之一，并在供应商内选择具体模型

- **独立 API**
  - 「设置」Tab 中支持 Primary / Secondary API profile 与 music 视图路由
  - 羽毛按钮改为调用插件内独立 API，不占用 SillyTavern 主 API
  - 生成输入仅保留固定音乐 System Prompt、User Prompt 与预览里的补充信息

#### 2026-02-20

- **新增羽毛生成入口**
  - 新增 🪶 羽毛按钮：可在插件内生成创作笔记
  - 后续版本已改为使用插件内独立 API profile

- **新增「发送预览」面板**
  - 点击羽毛按钮后，先展示所有将发送给 LLM 的内容预览
  - 可展开查看 System Prompt、补充信息（可编辑）、User Prompt（含所有参数）
  - 预览面板显示 Token 估算数
  - 确认后才会发起生成请求

- **新增「06 / Other Requirements」模块**
  - 可填写对作曲的特殊要求（如指定乐器开场等）
  - 🎲 骰子按钮：随机填入预设（Piano Solo Intro、Cinematic Intro 等 13 种）
  - 填写内容会自动进入提示词模板

- **新增「历史记录」面板**
  - 成果面板新增「历史」按钮，保存最近 8 条生成记录（插件生成 / 酒馆捕捉均会保存）
  - 支持展开查看完整歌词与风格，可一键加载到成果面板

- **Output Mode 简化**
  - 移除「只生成创作笔记」「嵌入正文」「只保留在插件 (过滤)」三个单选按钮
  - 改为文字说明，羽毛按钮与播放按钮各司其职
  - 编号调整为 07 / Output Mode

#### 2026-01-23

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

## English

[中文](#中文-chinese) | **English**

> **Let your characters become your music producers.**
>
> *An immersive AI music creation assistant for SillyTavern.*

ST_Music is an immersive music creation and playback extension for SillyTavern. Invite your characters to help create music, capture their ideas, and play the resulting songs directly in SillyTavern, bringing roleplay and AI music generation together.

### 🎵 Core Features

* **🎻 Interactive creation guidance**
  * Choose the **characters** you want to involve in the creation process through a visual interface.
  * Customize the **vocal range**, **genre**, **main instrument**, and **lyrical themes or keywords**.
  * The extension builds a tailored prompt that guides the LLM to produce original creation notes based on the characters' personalities.

* **📝 Automatic note capture**
  * Monitor the conversation and automatically recognize and capture creation notes returned by the LLM.
  * Extract **lyrics** and **style descriptions** from the conversation and display them in the extension.
  * **One-click copying**: Generated tags are optimized for platforms such as Suno and Udio, so you can copy them and start generating music.

* **📻 Audio player**
  * **Braun SK4-inspired UI**: A minimalist retro floating player for listening to music while using SillyTavern.
  * **Two import methods**:
    1. **Local upload**: Upload local MP3 files for playback. These files are cleared when the browser page is refreshed.
    2. **Remote URL**: Enter a direct MP3 URL hosted by a third party, such as catbox.moe. The URL is saved locally and remains available after refreshing the page.

* **🪶 Independent API integration**
  * Uses a configuration approach inspired by Abstract's external phone, with Primary / Secondary API profiles and routing for the `music` view.
  * Includes 103 verified text API model identifiers across OpenAI, Gemini, Claude, DeepSeek, and MiniMax, including aliases and snapshots. A **Custom (自定义)** option also accepts an endpoint URL, model ID, API key, and optional generation parameters.
  * The feather button opens a **Send Preview (发送预览)** panel showing the fixed System Prompt and User Prompt, with an editable **Additional Information (补充信息)** field.
  * The results panel includes **History (历史记录)**, automatically saving the latest eight results for later review and loading.

### 📸 Screenshots

#### 📻 Player UI

*Listen while you roleplay for a more immersive experience.*

![Player UI](https://i.ibb.co/JRScvp5K/image.png)

#### 🎹 Creation UI

*Define your musical style and invite your characters to create with you.*

![Creation UI 1](https://i.ibb.co/RpPDN25T/1.png)
![Creation UI 2](https://i.ibb.co/Kc3cq5xH/2.png)

#### 🎼 Results

![Results UI](https://i.ibb.co/dwqgNLtW/image.png)

### 📦 Installation

#### Method 1: Automatic Installation (Recommended)

1. In SillyTavern, open the **Extensions** menu.
2. Click **Install Extension**.
3. Paste the following Git URL into the input box and click **Save**:

   ```text
   https://github.com/JLYANG1900/ST_Music
   ```

4. Find the extension in the list and enable it.

#### Method 2: Manual Installation (Git Clone)

1. Open the SillyTavern extensions directory:

   ```bash
   cd /path/to/SillyTavern/public/scripts/extensions/
   ```

2. Clone this repository:

   ```bash
   git clone https://github.com/JLYANG1900/ST_Music.git
   ```

3. **Restart SillyTavern**.

### 💡 Workflow

1. Click the **🎵** icon at the top to open the panel.
2. Switch to the **Creation (创作)** tab, choose your settings, and click **Send to… (发送给...)**.
3. Wait for the LLM to reply. The extension automatically captures the creation content in the **Results (成果)** tab.
4. Copy the prompt into Suno to generate music.
5. Download the MP3 and click the player's **Upload** icon to import it, then play it on repeat in SillyTavern.

### Models and Custom Endpoints

The official model catalog was checked on **2026-10-23**: 54 OpenAI, 19 Gemini, 20 Claude, 4 DeepSeek, and 6 MiniMax identifiers, for a total of **103**, including active aliases and snapshots. See [MODEL_CATALOG.md](MODEL_CATALOG.md) for the catalog and official sources; runtime data is stored in `ModelCatalog.js`. Models that remain callable but have a scheduled retirement date are retained and labeled. Restricted models and models available only to existing customers may not be accessible to every account. The catalog does not update automatically over the network.

Both Primary and Secondary profiles support **Custom (自定义)**:

1. Choose a request format: OpenAI Chat Completions, OpenAI Responses, Anthropic Messages, or Gemini Generate Content.
2. Enter the provider's Base URL, such as `https://example.com/v1`, or the complete endpoint URL, along with the exact model ID. A complete Gemini endpoint URL must match the model ID.
3. Enter the provider's API key. Leave it blank for a local service that does not require authentication. Temperature and maximum output tokens are optional; leave Temperature blank for reasoning models that do not support sampling parameters.
4. Save the independent API settings, then adjust Routing as needed. Official MiniMax profiles offer China / Global region selection; the region must match the API key's platform.

When you switch providers, the current page keeps a separate draft for each provider to avoid carrying the previous provider's key over to a new endpoint. Saving retains the currently selected configuration for each profile. Settings are stored in the current browser. Requests are sent directly from the browser, so custom services must allow cross-origin requests. If SillyTavern is served over HTTPS, requests to HTTP endpoints may also be blocked by the browser's mixed-content policy.

For search-specific models, results and history display clickable sources returned by the API. Models whose standard text endpoints have not been confirmed, along with exceptions requiring dedicated real-time protocols, are listed in the model catalog. Unverified model identifiers are not presented as supported built-in models.

### Development Validation

Run the functional regression tests from the project directory without additional dependencies:

```bash
node --test tests/mobile-compatibility.test.cjs tests/api-service.test.cjs
```

Browser regression tests require Playwright and an installed copy of Chrome. If Playwright is not on the current Node module path, specify its installation location:

```bash
ST_MUSIC_PLAYWRIGHT=/absolute/path/to/playwright node tests/mobile-browser.cjs
ST_MUSIC_PLAYWRIGHT=/absolute/path/to/playwright node tests/api-settings-browser.cjs
```

These scripts load the local source in isolated browser contexts. They cover mouse and touch dragging, position restoration, rotation, layouts across nine viewport sizes, dialogs, a simulated on-screen keyboard, model lists, saving custom configurations, provider switching, and migration of older settings. They do not call music generation APIs. Fonts and icons use offline placeholders. These tests do not replace checks on physical iOS / Android devices with a complete SillyTavern theme.

### 📝 Changelog

#### 2026-10-23

- Expanded the catalog of active text models across five providers, added custom endpoints and four request formats, and preserved existing settings. Added China / Global region selection for MiniMax and source links for search results.
- The floating launcher now supports dragging with a mouse, touch, or stylus without jQuery UI. Dragging does not accidentally open the panel. Its position is saved automatically and kept within the visible area after screen rotation.
- Fixed zero-width playlists, clipped title-bar buttons, and clipped Add Song dialogs on mobile. The mobile Creation, Results, and Settings views prioritize the current content while music keeps playing; use the Player tab to return to playback controls.
- Panels and dialogs adapt to the visible viewport and safe areas, including landscape orientation and the on-screen keyboard. Touch controls are larger, and delete controls remain visible.
- Added a clipboard fallback for HTTP connections on local networks, with manual copying available when automatic copying is unavailable.
- The first press of Play automatically selects the first track. Playback failures and rapid track changes are handled correctly. Multiple local tracks can be imported at once, and their associated resources are released when deleted.

#### 2026-07-01

- **Expanded model selection across five providers**
  - OpenAI: gpt-5.5
  - Gemini: gemini-3.5-flash, Gemini 2.5 Pro, Gemini 2.5 Flash
  - Claude: Claude Fable 5, Claude Mythos 5, Claude Opus 4.8, Claude Sonnet 5, Claude Sonnet 4.6, Claude Haiku 4.5
  - DeepSeek: deepseek-v4-flash, deepseek-v4-pro
  - MiniMax: MiniMax-M3, MiniMax-M2.7

- **Reworked the independent API settings to support multiple models from five providers**
  - Each Primary / Secondary profile can select OpenAI, Gemini, Claude, DeepSeek, or MiniMax, then choose a specific model from that provider.

- **Independent API**
  - The **Settings (设置)** tab supports Primary / Secondary API profiles and routing for the `music` view.
  - The feather button now calls the extension's independent API without using SillyTavern's main API.
  - Generation input contains only the fixed music System Prompt, the User Prompt, and additional information entered in the preview.

#### 2026-02-20

- **Added the feather generation button**
  - The new 🪶 feather button generates creation notes inside the extension.
  - Later versions switched this feature to the extension's independent API profiles.

- **Added the Send Preview (发送预览) panel**
  - Clicking the feather button first displays a preview of everything that will be sent to the LLM.
  - Expand the sections to inspect the System Prompt, editable additional information, and User Prompt, including all parameters.
  - The preview displays an estimated token count.
  - A generation request is sent only after confirmation.

- **Added the 06 / Other Requirements module**
  - Enter specific composition requirements, such as opening with a particular instrument.
  - The 🎲 dice button randomly selects from 13 presets, including Piano Solo Intro and Cinematic Intro.
  - The entered requirements are automatically included in the prompt template.

- **Added the History (历史记录) panel**
  - A new **History (历史)** button in the results panel saves the latest eight generation records, including both extension-generated results and notes captured from SillyTavern.
  - Expand records to view the complete lyrics and style, then load them into the results panel with one click.

- **Simplified Output Mode**
  - Removed the three radio buttons for “Generate creation notes only,” “Embed in the main text,” and “Keep only in the extension (filter).”
  - Replaced them with explanatory text, clarifying the separate functions of the feather and play buttons.
  - Renumbered the section to 07 / Output Mode.

#### 2026-01-23

- **Added rhyme schemes** (05 / Lyrics Concept)
  - Five options: no rhyme, ABCB (lines two and four rhyme), AABB (rhyming couplets), ABAB (alternating rhyme), and AAAA (all lines rhyme).
  - Clicking an option displays a description of its effect and example songs.

- **Added vocal timbre** (02 / Vocal Range)
  - Eight options: Auto, Husky, Clean, Warm, Gritty, Bright, Dark, and Soulful.
  - Auto infers an appropriate timbre from the character.

- **Added lyric language selection** (05 / Lyrics Concept)
  - Quick options for Chinese and English.
  - A custom field for other languages.

- **Refined the 05 / Lyrics Concept layout**
  - Combined all modules into one white panel.
  - Changed creation modes to BRAUN-style buttons.

- **Improved instrument prompts**
  - Added instructions asking the AI to describe what each instrument is doing.
  - Pattern: The instrumentation features [Instrument] playing [Action]...

---

*Created by JLYANG1900*
