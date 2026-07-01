/**
 * ST Music Creator API runtime.
 * Provides fixed adapters for OpenAI, Gemini, Claude, DeepSeek, and MiniMax.
 */

(function () {
    "use strict";

    const VIEW_MUSIC = "music";
    const STORE_KEY = "st_music_independent_api_config";
    const DEFAULT_PROVIDER = "openai";

    const modelOption = (value, label = value) => Object.freeze({ value, label });

    const PROVIDERS = Object.freeze({
        openai: Object.freeze({
            id: "openai",
            label: "OpenAI",
            defaultModel: "gpt-5.5",
            models: Object.freeze([
                modelOption("gpt-5.5"),
            ]),
            endpoint: "https://api.openai.com/v1/responses",
            keyPlaceholder: "sk-...",
        }),
        gemini: Object.freeze({
            id: "gemini",
            label: "Gemini",
            defaultModel: "gemini-3.5-flash",
            models: Object.freeze([
                modelOption("gemini-3.5-flash"),
                modelOption("gemini-2.5-pro", "Gemini 2.5 Pro"),
                modelOption("gemini-2.5-flash", "Gemini 2.5 Flash"),
            ]),
            endpoint: "https://generativelanguage.googleapis.com/v1beta/interactions",
            keyPlaceholder: "AIza...",
        }),
        claude: Object.freeze({
            id: "claude",
            label: "Claude",
            defaultModel: "claude-sonnet-4-6",
            models: Object.freeze([
                modelOption("claude-fable-5", "Claude Fable 5"),
                modelOption("claude-mythos-5", "Claude Mythos 5"),
                modelOption("claude-opus-4-8", "Claude Opus 4.8"),
                modelOption("claude-sonnet-5", "Claude Sonnet 5"),
                modelOption("claude-sonnet-4-6", "Claude Sonnet 4.6"),
                modelOption("claude-haiku-4-5", "Claude Haiku 4.5"),
            ]),
            endpoint: "https://api.anthropic.com/v1/messages",
            keyPlaceholder: "sk-ant-...",
            maxTokens: 3000,
        }),
        deepseek: Object.freeze({
            id: "deepseek",
            label: "DeepSeek",
            defaultModel: "deepseek-v4-pro",
            models: Object.freeze([
                modelOption("deepseek-v4-flash"),
                modelOption("deepseek-v4-pro"),
            ]),
            endpoint: "https://api.deepseek.com/chat/completions",
            keyPlaceholder: "sk-...",
        }),
        minimax: Object.freeze({
            id: "minimax",
            label: "MiniMax",
            defaultModel: "MiniMax-M3",
            models: Object.freeze([
                modelOption("MiniMax-M3"),
                modelOption("MiniMax-M2.7"),
            ]),
            endpoint: "https://api.minimaxi.com/anthropic/v1/messages",
            keyPlaceholder: "eyJ...",
            maxTokens: 3000,
        }),
    });

    const BLANK_PROFILE = Object.freeze({
        provider: DEFAULT_PROVIDER,
        model: PROVIDERS[DEFAULT_PROVIDER].defaultModel,
        key: "",
    });

    const DEFAULT_CONFIG = Object.freeze({
        version: 4,
        enableSecondApi: false,
        primary: { ...BLANK_PROFILE },
        secondary: { ...BLANK_PROFILE },
        viewApiMap: { [VIEW_MUSIC]: "primary" },
    });

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

    let activeController = null;

    const getProviderDefinitions = () =>
        Object.fromEntries(
            Object.entries(PROVIDERS).map(([id, provider]) => [
                id,
                {
                    id,
                    label: provider.label,
                    model: provider.defaultModel,
                    defaultModel: provider.defaultModel,
                    models: provider.models.map((model) => ({ ...model })),
                    keyPlaceholder: provider.keyPlaceholder,
                },
            ]),
        );

    const normalizeProviderId = (provider) => {
        const value = `${provider || ""}`.trim().toLowerCase();
        if (PROVIDERS[value]) return value;
        return DEFAULT_PROVIDER;
    };

    const normalizeModelId = (providerId, model) => {
        const provider = PROVIDERS[normalizeProviderId(providerId)] || PROVIDERS[DEFAULT_PROVIDER];
        const value = `${model || ""}`.trim();
        return provider.models.some((option) => option.value === value) ? value : provider.defaultModel;
    };

    const normalizeApiProfile = (profile) => {
        const input = profile && typeof profile === "object" ? profile : {};
        const provider = normalizeProviderId(input.provider);
        return {
            provider,
            model: normalizeModelId(provider, input.model),
            key: `${input.key || ""}`.trim(),
        };
    };

    const normalizeApiProfileConfig = (config) => {
        const source = config && typeof config === "object" ? config : DEFAULT_CONFIG;
        return {
            version: 4,
            enableSecondApi: source.enableSecondApi === true,
            primary: normalizeApiProfile(source.primary),
            secondary: normalizeApiProfile(source.secondary),
            viewApiMap: {
                ...DEFAULT_CONFIG.viewApiMap,
                ...(source.viewApiMap && typeof source.viewApiMap === "object" ? source.viewApiMap : {}),
            },
        };
    };

    const getApiProfileConfig = () => {
        try {
            const stored = localStorage.getItem(STORE_KEY);
            return normalizeApiProfileConfig(stored ? JSON.parse(stored) : DEFAULT_CONFIG);
        } catch (error) {
            console.warn("[Music API] 读取独立 API 配置失败:", error);
            return normalizeApiProfileConfig(DEFAULT_CONFIG);
        }
    };

    const saveApiProfileConfig = (config) => {
        try {
            const normalized = normalizeApiProfileConfig(config);
            localStorage.setItem(STORE_KEY, JSON.stringify(normalized));
            console.info("[Music API] 独立 API 配置已保存");
            return true;
        } catch (error) {
            console.error("[Music API] 保存独立 API 配置失败:", error);
            return false;
        }
    };

    const hasUsableProfile = (profile) => Boolean(profile?.provider && PROVIDERS[profile.provider] && profile.key);

    const resolveProviderForProfile = (profile) => {
        const provider = PROVIDERS[normalizeProviderId(profile?.provider)] || PROVIDERS[DEFAULT_PROVIDER];
        return {
            ...provider,
            model: normalizeModelId(provider.id, profile?.model),
        };
    };

    const loadApiConfigForView = (viewType) => {
        const config = getApiProfileConfig();
        const wantsSecondary =
            config.enableSecondApi && config.viewApiMap?.[viewType || VIEW_MUSIC] === "secondary";
        const profile = wantsSecondary ? config.secondary : config.primary;
        if (wantsSecondary && !hasUsableProfile(profile)) return config.primary;
        return profile;
    };

    const extractSystemText = (messages) =>
        messages
            .filter((message) => message.role === "system")
            .map((message) => `${message.content || ""}`.trim())
            .filter(Boolean)
            .join("\n\n");

    const nonSystemMessages = (messages) =>
        messages
            .filter((message) => message.role !== "system")
            .map((message) => ({
                role: message.role === "assistant" ? "assistant" : "user",
                content: `${message.content || ""}`.trim(),
            }))
            .filter((message) => message.content);

    const composeSinglePrompt = (messages) => {
        const systemText = extractSystemText(messages);
        const conversationText = nonSystemMessages(messages)
            .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}:\n${message.content}`)
            .join("\n\n");
        return [systemText ? `System:\n${systemText}` : "", conversationText].filter(Boolean).join("\n\n");
    };

    const createOpenAiRequest = (provider, profile, messages) => {
        const systemText = extractSystemText(messages);
        const input = nonSystemMessages(messages);
        const body = {
            model: provider.model,
            input: input.length ? input : composeSinglePrompt(messages),
        };
        if (systemText) body.instructions = systemText;

        return {
            url: provider.endpoint,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${profile.key}`,
                },
                body: JSON.stringify(body),
            },
        };
    };

    const createGeminiRequest = (provider, profile, messages) => ({
        url: provider.endpoint,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": profile.key,
            },
            body: JSON.stringify({
                model: provider.model,
                input: composeSinglePrompt(messages),
            }),
        },
    });

    const createAnthropicMessagesRequest = (provider, profile, messages, options = {}) => {
        const systemText = extractSystemText(messages);
        const conversation = nonSystemMessages(messages);
        const body = {
            model: provider.model,
            max_tokens: provider.maxTokens,
            messages: conversation.length ? conversation : [{ role: "user", content: composeSinglePrompt(messages) }],
            stream: false,
        };

        if (systemText) body.system = systemText;
        if (options.thinking) body.thinking = options.thinking;

        return {
            url: provider.endpoint,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
                body: JSON.stringify(body),
            },
        };
    };

    const createDeepSeekRequest = (provider, profile, messages) => ({
        url: provider.endpoint,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${profile.key}`,
            },
            body: JSON.stringify({
                model: provider.model,
                messages,
                stream: false,
                reasoning_effort: "high",
                thinking: { type: "enabled" },
            }),
        },
    });

    const createRequest = (profile, messages) => {
        const provider = resolveProviderForProfile(profile);

        if (profile.provider === "openai") return createOpenAiRequest(provider, profile, messages);
        if (profile.provider === "gemini") return createGeminiRequest(provider, profile, messages);
        if (profile.provider === "deepseek") return createDeepSeekRequest(provider, profile, messages);
        if (profile.provider === "minimax") {
            return createAnthropicMessagesRequest(provider, profile, messages, {
                thinking: { type: "disabled" },
                headers: {
                    Authorization: `Bearer ${profile.key}`,
                },
            });
        }

        return createAnthropicMessagesRequest(provider, profile, messages, {
            headers: {
                "X-Api-Key": profile.key,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
            },
        });
    };

    const readTextBlocks = (blocks) =>
        (Array.isArray(blocks) ? blocks : [])
            .filter((block) => block?.type === "text" || block?.type === "output_text")
            .map((block) => block.text || "")
            .join("");

    const readOpenAiContent = (payload) => {
        if (payload?.output_text) return payload.output_text;
        return (payload?.output || [])
            .map((item) => {
                if (item?.type === "message") return readTextBlocks(item.content);
                return item?.text || "";
            })
            .join("");
    };

    const readResponseContent = (payload, providerId) => {
        if (providerId === "openai") {
            return readOpenAiContent(payload) || payload?.choices?.[0]?.message?.content || "";
        }

        if (providerId === "gemini") {
            return payload?.output_text
                || payload?.outputText
                || payload?.response?.output_text
                || (payload?.candidates?.[0]?.content?.parts || []).map((part) => part?.text || "").join("");
        }

        if (providerId === "deepseek") {
            return payload?.choices?.[0]?.message?.content || payload?.message?.content || "";
        }

        return readTextBlocks(payload?.content);
    };

    const callIndependentApi = async (messages, overrides, viewType) => {
        const viewName = viewType || VIEW_MUSIC;
        const profile = normalizeApiProfile({
            ...loadApiConfigForView(viewName),
            ...(overrides || {}),
        });
        const provider = resolveProviderForProfile(profile);

        if (!provider || !profile.key) {
            return {
                success: false,
                content: "",
                error: "请先在设置页选择大模型并填写对应 API Key",
            };
        }

        activeController = new AbortController();

        try {
            console.groupCollapsed(`[Music API] ${viewName} via ${provider.label}/${provider.model}`);
            console.info("[Music API] request profile", {
                viewType: viewName,
                provider: profile.provider,
                model: provider.model,
            });
            console.info("[Music API] request messages", messages.map((message) => ({
                role: message.role,
                content: `${message.content || ""}`.slice(0, 500),
            })));

            const request = createRequest(profile, messages);
            const response = await fetch(request.url, {
                ...request.init,
                signal: activeController.signal,
            });

            if (!response.ok) {
                return {
                    success: false,
                    content: "",
                    error: `API 请求失败: ${response.status} - ${await response.text()}`,
                };
            }

            const payload = await response.json();
            const content = `${readResponseContent(payload, profile.provider) || ""}`.trim();
            return content
                ? { success: true, content, provider: profile.provider, model: provider.model }
                : { success: false, content: "", error: "无法解析 API 响应" };
        } catch (error) {
            if (error?.name === "AbortError") {
                return { success: false, content: "", error: "请求已被终止" };
            }

            console.error("[Music API] 独立 API 调用失败:", error);
            return {
                success: false,
                content: "",
                error: error instanceof Error ? error.message : "未知错误",
            };
        } finally {
            activeController = null;
            console.groupEnd?.();
        }
    };

    const callMusicNoteApi = (promptText) => {
        const prompt = `${promptText || ""}`.trim();
        if (!prompt) {
            return Promise.resolve({
                success: false,
                content: "",
                error: "缺少音乐创作提示词",
            });
        }

        return callIndependentApi(
            [
                { role: "system", content: MUSIC_SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            undefined,
            VIEW_MUSIC,
        );
    };

    const abortCurrentRequest = () => {
        if (!activeController) return;
        activeController.abort();
        activeController = null;
        console.info("[Music API] 请求已终止");
    };

    const apiRuntime = {
        getApiProfileConfig,
        saveApiProfileConfig,
        normalizeApiProfile,
        loadApiConfigForView,
        getProviderDefinitions,
        getApiConfig: () => loadApiConfigForView(VIEW_MUSIC),
        saveApiConfig: (profile) => {
            const current = getApiProfileConfig();
            return saveApiProfileConfig({ ...current, primary: normalizeApiProfile(profile) });
        },
        callIndependentApi,
        callMusicNoteApi,
        abortCurrentRequest,
        getSystemPrompt: () => MUSIC_SYSTEM_PROMPT,
    };

    window.STMusicApi = apiRuntime;
    window.MusicApiService = apiRuntime;

    console.info("[ST Music API Runtime] 五供应商多模型独立 API 服务已加载");
})();

/**
 * ST Music Creator API settings view.
 */

(function () {
    "use strict";

    const VIEW_MUSIC = "music";
    const PROFILE_NAMES = ["primary", "secondary"];

    const $id = (id) => document.getElementById(id);
    const api = () => window.STMusicApi || window.MusicApiService;

    const el = (tag, options = {}, children = []) => {
        const node = document.createElement(tag);

        Object.entries(options).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (key === "className") node.className = value;
            else if (key === "text") node.textContent = value;
            else if (key === "html") node.innerHTML = value;
            else if (key === "value") node.value = value;
            else node.setAttribute(key, value);
        });

        children.filter(Boolean).forEach((child) => {
            node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        });

        return node;
    };

    const option = (value, text, selected) => {
        const node = el("option", { value, text });
        node.selected = Boolean(selected);
        return node;
    };

    const group = (title, children) =>
        el("div", { className: "stm-form-group" }, [
            el("label", { className: "stm-label", text: title }),
            ...children,
        ]);

    const card = (...children) => el("div", { className: "stm-settings-card" }, children);

    const field = (label, control, hint) =>
        el("div", { className: "stm-settings-field" }, [
            el("span", { className: "stm-settings-field-label", text: label }),
            control,
            hint ? el("span", { className: "stm-hint stm-settings-hint", text: hint }) : null,
        ]);

    const selectControl = (id, choices, current) =>
        el(
            "select",
            { id, className: "stm-input stm-select" },
            choices.map(([value, label]) => option(value, label, value === current)),
        );

    const inputControl = (id, type, value, extra = {}) =>
        el("input", {
            id,
            type,
            className: "stm-input",
            value: value ?? "",
            ...extra,
        });

    const providerDefinitions = () => api().getProviderDefinitions();

    const providerChoices = () =>
        Object.values(providerDefinitions()).map((provider) => [
            provider.id,
            provider.label,
        ]);

    const providerFor = (providerId) =>
        providerDefinitions()[providerId] || providerDefinitions().openai || Object.values(providerDefinitions())[0];

    const modelChoices = (providerId) => {
        const provider = providerFor(providerId);
        const models = provider?.models?.length
            ? provider.models
            : [{ value: provider?.model, label: provider?.model }];
        return models.filter((model) => model.value).map((model) => [model.value, model.label || model.value]);
    };

    const modelFor = (providerId, modelId) => {
        const provider = providerFor(providerId);
        const models = provider?.models?.length
            ? provider.models
            : [{ value: provider?.model, label: provider?.model }];
        return (
            models.find((model) => model.value === modelId)
            || models.find((model) => model.value === provider?.defaultModel)
            || models[0]
        );
    };

    const providerMetaText = (providerId, modelId) => {
        const model = modelFor(providerId, modelId);
        return model ? `当前模型：${model.label || model.value}` : "当前模型：未选择";
    };

    const refreshModelChoices = (profileName, providerId, currentModel) => {
        const modelSelect = $id(`stm-${profileName}-model`);
        if (!modelSelect) return null;

        const provider = providerFor(providerId);
        const nextModel = modelFor(provider.id, currentModel);
        modelSelect.replaceChildren(
            ...modelChoices(provider.id).map(([value, label]) => option(value, label, value === nextModel?.value)),
        );
        return nextModel;
    };

    const updateProviderMeta = (profileName) => {
        const providerSelect = $id(`stm-${profileName}-provider`);
        const modelSelect = $id(`stm-${profileName}-model`);
        const keyInput = $id(`stm-${profileName}-key`);
        const modelMeta = $id(`stm-${profileName}-model-meta`);
        const provider = providerFor(providerSelect?.value);
        const model = refreshModelChoices(profileName, provider.id, modelSelect?.value);

        if (keyInput && provider) keyInput.placeholder = provider.keyPlaceholder;
        if (modelMeta) modelMeta.textContent = providerMetaText(provider?.id, model?.value);
    };

    const profileCard = (profileName, profile) => {
        const normalized = api().normalizeApiProfile(profile);
        const provider = providerFor(normalized.provider);

        return card(
            field(
                "大模型供应商",
                selectControl(`stm-${profileName}-provider`, providerChoices(), provider.id),
                "只能选择 OpenAI、Gemini、Claude、DeepSeek、MiniMax。",
            ),
            field(
                "模型",
                selectControl(`stm-${profileName}-model`, modelChoices(provider.id), normalized.model),
                "同一供应商内可切换插件内置模型。",
            ),
            field(
                "API Key",
                inputControl(`stm-${profileName}-key`, "password", normalized.key, {
                    placeholder: provider.keyPlaceholder,
                    autocomplete: "off",
                }),
                "此密钥只用于当前所选大模型供应商。",
            ),
            el("div", {
                id: `stm-${profileName}-model-meta`,
                className: "stm-settings-model-meta",
                text: providerMetaText(provider.id, normalized.model),
            }),
            el("div", { className: "stm-settings-btn-row" }, [
                el("button", {
                    id: `stm-clear-${profileName}`,
                    className: "stm-toggle-btn",
                    html: `<i class="fa-solid fa-eraser"></i> 清除 ${profileName === "primary" ? "Primary" : "Secondary"}`,
                }),
            ]),
        );
    };

    const saveRow = () =>
        el("div", { className: "stm-settings-btn-row" }, [
            el("button", {
                id: "stm-save-api-profiles",
                className: "stm-toggle-btn stm-settings-save-btn",
                html: '<i class="fa-solid fa-check"></i> 保存独立 API 设置',
            }),
        ]);

    const infoCard = () =>
        card(
            el("div", { className: "stm-settings-info" }, [
                el("p", { text: "羽毛按钮会使用这里配置的独立 API，不占用 SillyTavern 主 API。" }),
                el("p", { text: "Primary / Secondary 可分别选择供应商与模型，music 视图会按 Routing 使用。" }),
                el("p", { text: "URL、Temperature 与 Max Tokens 已锁定在插件内，不再支持自定义 OpenAI 兼容端点。" }),
                el("p", { text: "生成输入仍然只包含固定 System Prompt、补充信息和 User Prompt。" }),
            ]),
        );

    const createSettingsPage = () => {
        const config = api().getApiProfileConfig();
        const selectedRoute = config.viewApiMap?.[VIEW_MUSIC] === "secondary" ? "secondary" : "primary";
        const wrapper = el("div", { className: "stm-form-scroll" });

        wrapper.append(
            group("01 / Primary API", [profileCard("primary", config.primary)]),
            group("02 / Secondary API", [
                card(
                    field(
                        "启用第二 API",
                        selectControl("stm-enable-second-api", [
                            ["false", "关闭"],
                            ["true", "开启"],
                        ], config.enableSecondApi ? "true" : "false"),
                    ),
                ),
                profileCard("secondary", config.secondary),
            ]),
            group("03 / Routing", [
                card(
                    field(
                        "音乐创作使用",
                        selectControl("stm-music-api-profile", [
                            ["primary", "Primary API"],
                            ["secondary", "Secondary API"],
                        ], selectedRoute),
                        "若选择 Secondary 但密钥未填写，会自动回退到 Primary。",
                    ),
                    saveRow(),
                ),
            ]),
            group("04 / Info", [infoCard()]),
        );

        return wrapper;
    };

    const readProfile = (profileName) =>
        api().normalizeApiProfile({
            provider: $id(`stm-${profileName}-provider`)?.value,
            model: $id(`stm-${profileName}-model`)?.value,
            key: $id(`stm-${profileName}-key`)?.value,
        });

    const clearProfile = (profileName) => {
        const keyInput = $id(`stm-${profileName}-key`);
        if (keyInput) keyInput.value = "";
        updateProviderMeta(profileName);
    };

    const toast = (message, type) => {
        if (typeof toastr === "undefined") {
            alert(message);
            return;
        }

        if (type === "error") toastr.error(message);
        else toastr.success(message);
    };

    const saveAllSettings = () => {
        const targetProfile = $id("stm-music-api-profile")?.value === "secondary" ? "secondary" : "primary";
        const payload = {
            version: 4,
            enableSecondApi: $id("stm-enable-second-api")?.value === "true",
            primary: readProfile("primary"),
            secondary: readProfile("secondary"),
            viewApiMap: { [VIEW_MUSIC]: targetProfile },
        };

        const saved = api().saveApiProfileConfig(payload);
        toast(saved ? "独立 API 设置已保存" : "保存失败，请重试", saved ? undefined : "error");
    };

    const bindSettingsEvents = () => {
        $id("stm-save-api-profiles")?.addEventListener("click", saveAllSettings);
        PROFILE_NAMES.forEach((profileName) => {
            $id(`stm-${profileName}-provider`)?.addEventListener("change", () => updateProviderMeta(profileName));
            $id(`stm-${profileName}-model`)?.addEventListener("change", () => updateProviderMeta(profileName));
            $id(`stm-clear-${profileName}`)?.addEventListener("click", () => {
                clearProfile(profileName);
                toast(`${profileName === "primary" ? "Primary" : "Secondary"} 密钥已清除，记得保存`);
            });
            updateProviderMeta(profileName);
        });
    };

    const settingsView = {
        createSettingsPage,
        bindSettingsEvents,
    };

    window.STMusicApiSettings = settingsView;
    window.MusicSettings = settingsView;

    console.info("[ST Music API Settings] 五供应商多模型独立 API 设置已加载");
})();
