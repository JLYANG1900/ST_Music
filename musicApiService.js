/**
 * ST Music Creator 独立 API 服务
 * 用于调用独立配置的 AI API 生成创作笔记
 * 参考 CTE-Map-Idol-Manager 的 idolApiService.js
 */

(function () {
    "use strict";

    // ========== 配置管理 ==========

    const STORAGE_KEYS = {
        API_CONFIG: "st_music_api_config",
        CONTEXT_COUNT: "st_music_context_count",
        GEMINI_CONFIG: "st_music_gemini_config",
    };

    // 默认 System Prompt：与 index.js 中 buildMusicPrompt 的 "Only Notes" 模板一致
    // 用户提示词已包含角色名、流派、乐器、BPM、人声、韵脚等参数，由 STMusic.buildMusicPrompt() 构建
    const MUSIC_SYSTEM_PROMPT = `你是一个专业的音乐创作助手。用户会给出具体的音乐创作要求（包含角色名、流派、乐器、BPM、人声指定、歌词关键词等参数）。

请严格按照用户指定的参数和以下格式输出创作笔记，不要输出任何其他内容：

<music>
一、歌名
（根据参数和角色视角给出歌名）
二、歌词结构：
[Verse]
（2-4行歌词）
[Pre-Chorus]
（2-4行歌词）
[Chorus]
（2-4行歌词，副歌一定要重复关键词）
[Verse]
（2-4行歌词）
[Chorus]
（重复副歌）
[Bridge]
（2-4行歌词）
[Final Chorus]
（最终副歌）
三、风格
1.公式：[主流派] + [子流派] + [乐器] + [角色的情绪]
2.BPM (i*/)
3.人声指定
不仅要列出乐器，还要描述它在"做什么"。句式：The instrumentation features [Instrument] playing [Action]...
</music>

注意：
- 必须使用 <music> 和 </music> 标签包裹
- 歌名、歌词结构、风格三个模块连贯输出，中间不要断开
- 严格按照用户提示词中指定的流派、乐器、BPM、人声、语言、韵脚等参数创作
- 每段歌词2-4行，不要一整段长句
- 只输出 <music> 标签内的内容，不要有其他任何文字`;

    /**
     * 获取 API 配置
     */
    function getApiConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("[Music API] 读取API配置失败:", e);
        }

        return {
            url: "",
            key: "",
            model: "",
            temperature: 0.8,
            max_tokens: 3000,
        };
    }

    /**
     * 保存 API 配置
     */
    function saveApiConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
            console.info("[Music API] API配置已保存");
            return true;
        } catch (e) {
            console.error("[Music API] 保存API配置失败:", e);
            return false;
        }
    }

    /**
     * 获取上下文读取数量
     */
    function getContextCount() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.CONTEXT_COUNT);
            return stored ? parseInt(stored) : 3;
        } catch (e) {
            return 3;
        }
    }

    /**
     * 保存上下文读取数量
     */
    function saveContextCount(count) {
        try {
            localStorage.setItem(STORAGE_KEYS.CONTEXT_COUNT, count.toString());
            return true;
        } catch (e) {
            console.error("[Music API] 保存上下文数量失败:", e);
            return false;
        }
    }

    // ========== Gemini API 配置管理 ==========

    /**
     * 获取 Gemini API 配置
     */
    function getGeminiConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.GEMINI_CONFIG);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error("[Music API] 读取Gemini配置失败:", e);
        }
        return {
            key: "",
            model: "gemini-2.5-flash",
        };
    }

    /**
     * 保存 Gemini API 配置
     */
    function saveGeminiConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEYS.GEMINI_CONFIG, JSON.stringify(config));
            console.info("[Music API] Gemini配置已保存");
            return true;
        } catch (e) {
            console.error("[Music API] 保存Gemini配置失败:", e);
            return false;
        }
    }

    // ========== 上下文读取 ==========

    /**
     * 获取聊天上下文
     * @param {number} count - 读取的消息数量
     * @returns {Array} 消息列表
     */
    function getChatContext(count) {
        let context = window.SillyTavern ? window.SillyTavern.getContext() : null;
        if (!context || !context.chat) {
            console.warn("[Music API] 无法获取聊天上下文");
            return [];
        }

        const chat = context.chat;
        const messages = [];

        // 从最新消息开始，向前读取指定数量
        const startIndex = Math.max(0, chat.length - count);
        for (let i = startIndex; i < chat.length; i++) {
            const msg = chat[i];
            if (msg && msg.mes) {
                messages.push({
                    role: msg.is_user ? "user" : "assistant",
                    content: msg.mes,
                });
            }
        }

        console.info(`[Music API] 读取了 ${messages.length} 条上下文消息`);
        return messages;
    }

    // ========== API 调用 ==========

    let currentAbortController = null;

    /**
     * 终止当前请求
     */
    function abortCurrentRequest() {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
            console.info("[Music API] 请求已终止");
        }
    }

    /**
     * 构建完整的 API URL
     * @param {string} baseUrl - 基础 URL
     * @returns {string} 完整的 API URL
     */
    function buildApiUrl(baseUrl) {
        // 移除末尾的斜杠
        baseUrl = baseUrl.trim().replace(/\/+$/, "");

        // 如果已经包含 /chat/completions，直接返回
        if (baseUrl.endsWith("/chat/completions")) {
            return baseUrl;
        }

        // 如果以 /v1 结尾，添加 /chat/completions
        if (baseUrl.endsWith("/v1")) {
            return baseUrl + "/chat/completions";
        }

        // 如果不包含 /v1，添加 /v1/chat/completions
        if (!baseUrl.includes("/v1")) {
            return baseUrl + "/v1/chat/completions";
        }

        // 其他情况，直接添加 /chat/completions
        return baseUrl + "/chat/completions";
    }

    /**
     * 调用 Gemini API
     * @param {string} promptText - 用户提示词
     * @returns {Promise<Object>} 响应结果
     */
    async function callGeminiApi(promptText) {
        const geminiConfig = getGeminiConfig();

        if (!geminiConfig.key) {
            return {
                success: false,
                error: "请先配置 Gemini API 密钥",
            };
        }

        const model = geminiConfig.model || "gemini-2.5-flash";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiConfig.key}`;

        // 构建上下文
        const contextCount = getContextCount();
        const contextMessages = getChatContext(contextCount);

        // 组装 Gemini 格式的 contents
        const contents = [];

        // System instruction 作为第一条
        contents.push({
            role: "user",
            parts: [{ text: MUSIC_SYSTEM_PROMPT }],
        });
        contents.push({
            role: "model",
            parts: [{ text: "好的，我会严格按照 <music> 格式输出创作笔记。" }],
        });

        // 添加上下文消息
        contextMessages.forEach((msg) => {
            contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            });
        });

        // 添加用户提示词
        contents.push({
            role: "user",
            parts: [{ text: promptText }],
        });

        console.info(`[Music API] 开始调用 Gemini API (${model}), 消息数: ${contents.length}`);

        currentAbortController = new AbortController();

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: getApiConfig().temperature || 0.8,
                        maxOutputTokens: getApiConfig().max_tokens || 3000,
                    },
                }),
                signal: currentAbortController.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API 请求失败: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // 提取 Gemini 响应内容
            let content = "";
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                content = data.candidates[0].content.parts
                    .map((p) => p.text)
                    .join("");
            } else {
                throw new Error("无法解析 Gemini API 响应");
            }

            console.info(`[Music API] Gemini 生成成功, 内容长度: ${content.length}`);

            return {
                success: true,
                content: content,
            };
        } catch (error) {
            if (error.name === "AbortError") {
                return { success: false, error: "请求已终止" };
            }
            console.error("[Music API] Gemini API 调用失败:", error);
            return { success: false, error: error.message || "未知错误" };
        } finally {
            currentAbortController = null;
        }
    }

    /**
     * 调用 OpenAI 兼容 API
     * @param {string} promptText - 用户提示词
     * @returns {Promise<Object>} 响应结果
     */
    async function callOpenAiApi(promptText) {
        const config = getApiConfig();

        // 检查配置
        if (!config.url || !config.key || !config.model) {
            return {
                success: false,
                error: "请先配置 API 信息（URL、Key、Model）",
            };
        }

        // 构建完整的 API URL
        const apiUrl = buildApiUrl(config.url);
        console.info(`[Music API] 使用 API 地址: ${apiUrl}`);

        // 构建消息列表
        const messages = [];

        // 添加系统提示
        messages.push({
            role: "system",
            content: MUSIC_SYSTEM_PROMPT,
        });

        // 添加上下文
        const contextCount = getContextCount();
        const contextMessages = getChatContext(contextCount);
        messages.push(...contextMessages);

        // 添加用户提示
        messages.push({
            role: "user",
            content: promptText,
        });

        console.info(`[Music API] 开始调用 API, 消息数: ${messages.length}`);

        // 创建 AbortController
        currentAbortController = new AbortController();

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${config.key}`,
                },
                body: JSON.stringify({
                    model: config.model,
                    messages: messages,
                    temperature: config.temperature || 0.8,
                    max_tokens: config.max_tokens || 3000,
                    stream: false,
                }),
                signal: currentAbortController.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 请求失败: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // 提取内容
            let content = "";
            if (data.choices && data.choices[0] && data.choices[0].message) {
                content = data.choices[0].message.content;
            } else if (data.message && data.message.content) {
                content = data.message.content;
            } else {
                throw new Error("无法解析 API 响应");
            }

            console.info(`[Music API] 生成成功, 内容长度: ${content.length}`);

            return {
                success: true,
                content: content,
            };
        } catch (error) {
            if (error.name === "AbortError") {
                console.info("[Music API] 请求被用户终止");
                return { success: false, error: "请求已终止" };
            }

            // 检查 CORS 错误
            if (
                error.message.includes("Failed to fetch") ||
                error.message.includes("NetworkError")
            ) {
                console.error("[Music API] 网络错误或 CORS 问题:", error);
                return {
                    success: false,
                    error: `网络连接失败。可能的原因：\n1. API 地址不正确（当前: ${apiUrl}）\n2. API 服务器未响应\n3. CORS 跨域限制（需要 API 服务器支持跨域请求）\n\n请检查：\n- API 地址是否正确\n- 网络连接是否正常\n- API 服务是否支持浏览器直接访问`,
                };
            }

            console.error("[Music API] API 调用失败:", error);
            return {
                success: false,
                error: error.message || "未知错误",
            };
        } finally {
            currentAbortController = null;
        }
    }

    /**
     * 智能调用 API（优先 Gemini，否则用 OpenAI 兼容接口）
     * @param {string} promptText - 用户提示词
     * @returns {Promise<Object>} 响应结果
     */
    async function callMusicNoteApi(promptText) {
        const geminiConfig = getGeminiConfig();
        const apiConfig = getApiConfig();

        // 优先使用 Gemini
        if (geminiConfig.key) {
            console.info("[Music API] 使用 Gemini API");
            return callGeminiApi(promptText);
        }

        // 其次使用 OpenAI 兼容接口
        if (apiConfig.url && apiConfig.key && apiConfig.model) {
            console.info("[Music API] 使用 OpenAI 兼容 API");
            return callOpenAiApi(promptText);
        }

        return {
            success: false,
            error: "请先在「设置」页面配置 API 信息（Gemini 或其他模型）",
        };
    }

    // ========== 导出到全局 ==========

    window.MusicApiService = {
        // 配置管理
        getApiConfig,
        saveApiConfig,
        getContextCount,
        saveContextCount,

        // Gemini 配置
        getGeminiConfig,
        saveGeminiConfig,

        // API 调用
        callMusicNoteApi,
        abortCurrentRequest,

        // 上下文与提示词
        getChatContext,
        getSystemPrompt: () => MUSIC_SYSTEM_PROMPT,
    };

    console.info("[Music API Service] 模块已加载");
})();
