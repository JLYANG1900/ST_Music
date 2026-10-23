/**
 * ST Music Creator API runtime.
 * Official model catalogs plus configurable text-generation API adapters.
 */

(function () {
    "use strict";

    const VIEW_MUSIC = "music";
    const STORE_KEY = "st_music_independent_api_config";
    const DEFAULT_PROVIDER = "openai";

    const catalog = window.STMusicModelCatalog;
    if (!catalog?.providers) throw new Error('ST Music 模型目录未加载，请刷新页面');
    const providerCatalog = id => catalog.providers[id];
    const CUSTOM_PROTOCOLS = Object.freeze({
        'openai-chat': 'OpenAI 兼容 · Chat Completions',
        'openai-responses': 'OpenAI · Responses',
        anthropic: 'Anthropic 兼容 · Messages',
        gemini: 'Gemini · Generate Content',
    });

    const PROVIDERS = Object.freeze({
        openai: Object.freeze({
            id: "openai",
            label: "OpenAI",
            ...providerCatalog('openai'),
            endpoint: "https://api.openai.com/v1/responses",
            keyPlaceholder: "sk-...",
        }),
        gemini: Object.freeze({
            id: "gemini",
            label: "Gemini",
            ...providerCatalog('gemini'),
            endpoint: "https://generativelanguage.googleapis.com/v1beta",
            keyPlaceholder: "AIza...",
        }),
        claude: Object.freeze({
            id: "claude",
            label: "Claude",
            ...providerCatalog('claude'),
            endpoint: "https://api.anthropic.com/v1/messages",
            keyPlaceholder: "sk-ant-...",
            maxTokens: 16384,
        }),
        deepseek: Object.freeze({
            id: "deepseek",
            label: "DeepSeek",
            ...providerCatalog('deepseek'),
            endpoint: "https://api.deepseek.com/chat/completions",
            keyPlaceholder: "sk-...",
        }),
        minimax: Object.freeze({
            id: "minimax",
            label: "MiniMax",
            ...providerCatalog('minimax'),
            endpoint: "https://api.minimax.cn/v1/chat/completions",
            keyPlaceholder: "eyJ...",
            maxTokens: 3000,
        }),
        custom: Object.freeze({
            id: 'custom', label: '自定义', defaultModel: '', models: [],
            keyPlaceholder: '服务商 API Key；本地无鉴权服务可留空',
        }),
    });

    const BLANK_PROFILE = Object.freeze({
        provider: DEFAULT_PROVIDER,
        model: PROVIDERS[DEFAULT_PROVIDER].defaultModel,
        key: "",
        endpoint: '',
        protocol: 'openai-chat',
        temperature: '',
        maxTokens: '',
        region: 'cn',
    });

    const DEFAULT_CONFIG = Object.freeze({
        version: 5,
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
                    verifiedAt: catalog.verifiedAt,
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
        // Never silently replace a user's saved model, even when a catalog changes.
        return value || provider.defaultModel;
    };

    const normalizeApiProfile = (profile) => {
        const input = profile && typeof profile === "object" ? profile : {};
        const provider = normalizeProviderId(input.provider);
        return {
            provider,
            model: normalizeModelId(provider, input.model),
            key: `${input.key || ""}`.trim(),
            endpoint: `${input.endpoint ?? input.baseUrl ?? input.url ?? ''}`.trim(),
            protocol: CUSTOM_PROTOCOLS[input.protocol] ? input.protocol : 'openai-chat',
            temperature: input.temperature === undefined || input.temperature === null ? '' : `${input.temperature}`.trim(),
            maxTokens: input.maxTokens === undefined || input.maxTokens === null ? '' : `${input.maxTokens}`.trim(),
            region: input.region === 'global' ? 'global' : 'cn',
        };
    };

    const normalizeApiProfileConfig = (config) => {
        const source = config && typeof config === "object" ? config : DEFAULT_CONFIG;
        return {
            version: 5,
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

    const resolveCustomEndpoint = (profile) => {
        if (!profile.endpoint) throw new Error('请填写自定义 API 地址');
        let url;
        try { url = new URL(profile.endpoint); } catch { throw new Error('API 地址必须是完整的 http:// 或 https:// URL'); }
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash) {
            throw new Error('API 地址仅支持 HTTP/HTTPS，不能包含用户名、密码或片段');
        }
        const suffixes = { 'openai-chat': '/chat/completions', 'openai-responses': '/responses', anthropic: '/messages' };
        const pathname = url.pathname.replace(/\/+$/, '');
        if (profile.protocol === 'gemini') {
            if (Object.values(suffixes).some(suffix => pathname.endsWith(suffix))) throw new Error('API 地址与所选请求格式不一致');
            if (!pathname.endsWith(':generateContent')) {
                url.pathname = `${pathname || '/v1beta'}/models/${encodeURIComponent(profile.model.replace(/^models\//, ''))}:generateContent`;
            } else {
                const embeddedModel = pathname.match(/\/models\/([^/]+):generateContent$/)?.[1];
                if (!embeddedModel || decodeURIComponent(embeddedModel) !== profile.model.replace(/^models\//, '')) {
                    throw new Error('完整 Gemini 地址中的模型 ID 与模型字段不一致');
                }
            }
        } else {
            if (pathname.endsWith(':generateContent')) throw new Error('API 地址与所选请求格式不一致');
            const suffix = suffixes[profile.protocol];
            const known = Object.values(suffixes).find(value => pathname.endsWith(value));
            if (known && known !== suffix) throw new Error('API 地址与所选请求格式不一致');
            if (!known) url.pathname = `${pathname || '/v1'}${suffix}`;
        }
        return url.href;
    };

    const validateApiProfile = (input) => {
        const profile = normalizeApiProfile(input);
        if (!profile.model) return '请填写模型 ID';
        if (profile.provider !== 'custom') return profile.key ? '' : '请填写对应供应商的 API Key';
        try { resolveCustomEndpoint(profile); } catch (error) { return error.message; }
        if (profile.temperature !== '' && (!Number.isFinite(Number(profile.temperature)) || Number(profile.temperature) < 0 || Number(profile.temperature) > 2)) {
            return 'Temperature 必须是 0–2 之间的数值，或留空使用服务商默认值';
        }
        if (profile.maxTokens !== '' && (!Number.isSafeInteger(Number(profile.maxTokens)) || Number(profile.maxTokens) < 1)) {
            return '最大输出 Tokens 必须为正整数，或留空使用默认值';
        }
        return '';
    };

    const hasUsableProfile = (profile) => !validateApiProfile(profile);

    const resolveProviderForProfile = (profile) => {
        const provider = PROVIDERS[normalizeProviderId(profile?.provider)] || PROVIDERS[DEFAULT_PROVIDER];
        return {
            ...provider,
            model: normalizeModelId(provider.id, profile?.model),
            modelDefinition: provider.models.find(option => option.value === profile?.model),
            ...(provider.id === 'custom' ? { endpoint: resolveCustomEndpoint(profile) } : {}),
            ...(provider.id === 'minimax' && profile.region === 'global' ? { endpoint: 'https://api.minimax.io/v1/chat/completions' } : {}),
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
        if (profile.provider === 'custom') {
            if (profile.maxTokens !== '') body.max_output_tokens = Number(profile.maxTokens);
            if (profile.temperature !== '') body.temperature = Number(profile.temperature);
        }

        return {
            url: provider.endpoint,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(profile.key ? { Authorization: `Bearer ${profile.key}` } : {}),
                },
                body: JSON.stringify(body),
            },
        };
    };

    const createGeminiRequest = (provider, profile, messages) => {
        const systemText = extractSystemText(messages);
        const body = {
            contents: nonSystemMessages(messages).map(message => ({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: message.content }],
            })),
        };
        if (!body.contents.length) body.contents = [{ role: 'user', parts: [{ text: composeSinglePrompt(messages) }] }];
        if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };
        if (profile.provider === 'custom' && (profile.maxTokens !== '' || profile.temperature !== '')) {
            body.generationConfig = {
                ...(profile.maxTokens !== '' ? { maxOutputTokens: Number(profile.maxTokens) } : {}),
                ...(profile.temperature !== '' ? { temperature: Number(profile.temperature) } : {}),
            };
        }
        return {
            url: profile.provider === 'custom' ? provider.endpoint : `${provider.endpoint}/models/${encodeURIComponent(provider.model)}:generateContent`,
            init: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(profile.key ? { "x-goog-api-key": profile.key } : {}),
                },
                body: JSON.stringify(body),
            },
        };
    };

    const createAnthropicMessagesRequest = (provider, profile, messages, options = {}) => {
        const systemText = extractSystemText(messages);
        const conversation = nonSystemMessages(messages);
        const body = {
            model: provider.model,
            max_tokens: profile.provider === 'custom' && profile.maxTokens !== '' ? Number(profile.maxTokens) : (provider.maxTokens || 4096),
            messages: conversation.length ? conversation : [{ role: "user", content: composeSinglePrompt(messages) }],
            stream: false,
        };

        if (systemText) body.system = systemText;
        if (options.thinking) body.thinking = options.thinking;
        if (profile.provider === 'custom' && profile.temperature !== '') body.temperature = Number(profile.temperature);

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

    const createChatRequest = (provider, profile, messages, extra = {}) => ({
        url: provider.endpoint,
        init: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(profile.key ? { Authorization: `Bearer ${profile.key}` } : {}),
            },
            body: JSON.stringify({
                model: provider.model,
                messages,
                stream: false,
                ...(profile.provider === 'custom' && profile.temperature !== '' ? { temperature: Number(profile.temperature) } : {}),
                ...(profile.provider === 'custom' && profile.maxTokens !== '' ? { max_tokens: Number(profile.maxTokens) } : {}),
                ...extra,
            }),
        },
    });

    const createRequest = (profile, messages) => {
        const provider = resolveProviderForProfile(profile);

        if (profile.provider === 'custom') {
            if (profile.protocol === 'openai-chat') return createChatRequest(provider, profile, messages);
            if (profile.protocol === 'openai-responses') return createOpenAiRequest(provider, profile, messages);
            if (profile.protocol === 'gemini') return createGeminiRequest(provider, profile, messages);
            return createAnthropicMessagesRequest(provider, profile, messages, {
                headers: {
                    ...(profile.key ? { 'X-Api-Key': profile.key } : {}),
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
            });
        }
        if (profile.provider === "openai") {
            if (provider.modelDefinition?.api === 'chat-completions') {
                return createChatRequest({ ...provider, endpoint: 'https://api.openai.com/v1/chat/completions' }, profile, messages, provider.modelDefinition.requestOptions);
            }
            return createOpenAiRequest(provider, profile, messages);
        }
        if (profile.provider === "gemini") return createGeminiRequest(provider, profile, messages);
        if (profile.provider === "deepseek") return createChatRequest(provider, profile, messages, { thinking: { type: 'disabled' } });
        if (profile.provider === "minimax") {
            return createChatRequest(provider, profile, messages, {
                reasoning_split: true,
                max_completion_tokens: 8192,
                ...(provider.model === 'MiniMax-M3' ? { thinking: { type: 'disabled' } }
                    : provider.model === 'MiniMax-M3.1-Flash' ? { reasoning_effort: 'low' } : {}),
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

    const readResponseContent = (payload, profile) => {
        const providerId = profile.provider === 'custom'
            ? ({ 'openai-chat': 'openai', 'openai-responses': 'openai', gemini: 'gemini', anthropic: 'claude' }[profile.protocol])
            : profile.provider;
        const chatContent = payload?.choices?.[0]?.message?.content;
        const chatText = typeof chatContent === 'string' ? chatContent : readTextBlocks(chatContent);
        if (providerId === "openai") {
            return readOpenAiContent(payload) || chatText;
        }

        if (providerId === "gemini") {
            return payload?.output_text
                || payload?.outputText
                || payload?.response?.output_text
                || (payload?.candidates?.[0]?.content?.parts || []).filter(part => !part?.thought).map((part) => part?.text || "").join("");
        }

        if (providerId === "deepseek" || providerId === 'minimax') {
            return chatText || payload?.message?.content || "";
        }

        return readTextBlocks(payload?.content);
    };

    const readCitations = payload => {
        const annotations = [
            ...(payload?.choices?.[0]?.message?.annotations || []),
            ...(payload?.output || []).flatMap(item => (item.content || []).flatMap(part => part.annotations || [])),
        ];
        const seen = new Set();
        return annotations.flatMap(annotation => {
            const citation = annotation.url_citation || annotation;
            try {
                const url = new URL(citation.url);
                if (!['http:', 'https:'].includes(url.protocol) || seen.has(url.href)) return [];
                seen.add(url.href);
                return [{ url: url.href, title: citation.title || url.hostname }];
            } catch { return []; }
        });
    };

    const callIndependentApi = async (messages, overrides, viewType) => {
        const viewName = viewType || VIEW_MUSIC;
        const savedProfile = loadApiConfigForView(viewName);
        const supplied = overrides && typeof overrides === 'object' ? { ...overrides } : {};
        const hasOverride = name => Object.prototype.hasOwnProperty.call(supplied, name);
        if (['endpoint', 'baseUrl', 'url'].some(hasOverride)) {
            supplied.endpoint = supplied.endpoint ?? supplied.baseUrl ?? supplied.url ?? '';
        }
        const providerChanged = hasOverride('provider')
            && normalizeProviderId(supplied.provider) !== savedProfile.provider;
        const profile = normalizeApiProfile({
            ...(providerChanged ? {} : savedProfile),
            ...supplied,
        });
        // Credentials belong to a destination, never to a newly overridden host.
        const destinationChanged = providerChanged
            || (profile.provider === 'custom' && profile.endpoint !== savedProfile.endpoint)
            || (profile.provider === 'minimax' && profile.region !== savedProfile.region);
        if (destinationChanged && !hasOverride('key')) profile.key = '';
        const validationError = validateApiProfile(profile);
        if (validationError) {
            return {
                success: false,
                content: "",
                error: validationError,
            };
        }
        const provider = resolveProviderForProfile(profile);

        const controller = new AbortController();
        activeController = controller;
        const safeError = value => {
            const text = `${value || '未知错误'}`;
            return profile.key ? text.split(profile.key).join('[REDACTED]') : text;
        };

        try {
            console.groupCollapsed(`[Music API] ${viewName} via ${provider.label}/${provider.model}`);
            console.info("[Music API] request profile", {
                viewType: viewName,
                provider: profile.provider,
                model: provider.model,
            });

            const request = createRequest(profile, messages);
            const response = await fetch(request.url, {
                ...request.init,
                signal: controller.signal,
            });

            if (!response.ok) {
                return {
                    success: false,
                    content: "",
                    error: `API 请求失败: ${response.status} - ${safeError(await response.text())}`,
                };
            }

            const payload = await response.json();
            if (payload?.error || (payload?.base_resp?.status_code && payload.base_resp.status_code !== 0)) {
                return { success: false, content: '', error: safeError(payload.error?.message || payload.base_resp?.status_msg || 'API 返回错误') };
            }
            const content = `${readResponseContent(payload, profile) || ""}`.trim();
            return content
                ? { success: true, content, citations: readCitations(payload), provider: profile.provider, model: provider.model }
                : { success: false, content: "", error: payload?.choices?.[0]?.finish_reason === 'length' ? '输出额度耗尽，未返回正文；请提高最大输出 Tokens' : 'API 未返回可用文本，请检查模型、请求格式或内容限制' };
        } catch (error) {
            if (error?.name === "AbortError") {
                return { success: false, content: "", error: "请求已被终止" };
            }

            const message = safeError(error instanceof Error ? error.message : '未知错误');
            console.error("[Music API] 独立 API 调用失败:", message);
            return {
                success: false,
                content: "",
                error: message,
            };
        } finally {
            if (activeController === controller) activeController = null;
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
        validateApiProfile,
        resolveCustomEndpoint: profile => resolveCustomEndpoint(normalizeApiProfile(profile)),
        getCustomProtocols: () => ({ ...CUSTOM_PROTOCOLS }),
        getCatalogInfo: () => ({ verifiedAt: catalog.verifiedAt, sources: catalog.sources }),
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

    console.info("[ST Music API Runtime] 多供应商与自定义独立 API 服务已加载");
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

    const providerMetaText = (providerId, modelId) => {
        if (providerId === 'custom') return modelId ? `自定义模型：${modelId}` : '填写服务商提供的准确模型 ID';
        const provider = providerFor(providerId);
        const model = provider.models.find(item => item.value === modelId);
        if (!model) return `已保存型号：${modelId || '未选择'}（不在当前目录，请确认仍可用）`;
        return [`当前模型：${model.label || model.value}`, model.note,
            model.shutdownDate ? `官方下线时间：${model.shutdownDate}` : '',
            model.earliestShutdownDate ? `最早可能下线：${model.earliestShutdownDate}（非确定关停日）` : '',
            `目录核对：${provider.verifiedAt}`].filter(Boolean).join('\n');
    };

    const namedField = (id, label, control, hint) => {
        const node = field(label, control, hint);
        node.id = id;
        return node;
    };
    const drafts = new Map();
    const draftKey = (name, provider) => `${name}:${provider}`;

    const readProfile = (profileName, providerOverride) => {
        const provider = providerOverride || $id(`stm-${profileName}-provider`)?.value;
        return api().normalizeApiProfile({
            provider,
            model: $id(`stm-${profileName}-${provider === 'custom' ? 'custom-model' : 'model'}`)?.value,
            key: $id(`stm-${profileName}-key`)?.value,
            endpoint: $id(`stm-${profileName}-endpoint`)?.value,
            protocol: $id(`stm-${profileName}-protocol`)?.value,
            temperature: $id(`stm-${profileName}-temperature`)?.value,
            maxTokens: $id(`stm-${profileName}-max-tokens`)?.value,
            region: $id(`stm-${profileName}-region`)?.value,
        });
    };

    const updateProviderMeta = (profileName) => {
        const profile = readProfile(profileName);
        const provider = providerFor(profile.provider);
        const custom = profile.provider === 'custom';
        $id(`stm-${profileName}-builtin-model-field`).hidden = custom;
        $id(`stm-${profileName}-custom-fields`).hidden = !custom;
        $id(`stm-${profileName}-region-field`).hidden = profile.provider !== 'minimax';
        $id(`stm-${profileName}-key`).placeholder = provider.keyPlaceholder;
        $id(`stm-${profileName}-model-meta`).textContent = providerMetaText(profile.provider, profile.model);
    };

    const populateProfile = (profileName, value) => {
        const profile = api().normalizeApiProfile(value);
        const providerSelect = $id(`stm-${profileName}-provider`);
        providerSelect.value = profile.provider;
        providerSelect.dataset.previousProvider = profile.provider;
        const choices = modelChoices(profile.provider);
        if (profile.provider !== 'custom' && profile.model && !choices.some(([id]) => id === profile.model)) {
            choices.unshift([profile.model, `${profile.model}（已保存，不在当前目录）`]);
        }
        $id(`stm-${profileName}-model`).replaceChildren(...choices.map(([id, label]) => option(id, label, id === profile.model)));
        const values = { 'custom-model': profile.provider === 'custom' ? profile.model : '', key: profile.key,
            endpoint: profile.endpoint, protocol: profile.protocol, temperature: profile.temperature,
            'max-tokens': profile.maxTokens, region: profile.region };
        for (const [fieldName, fieldValue] of Object.entries(values)) $id(`stm-${profileName}-${fieldName}`).value = fieldValue;
        updateProviderMeta(profileName);
    };

    const profileCard = (profileName, profile) => {
        const normalized = api().normalizeApiProfile(profile);
        const provider = providerFor(normalized.provider);
        const prefix = `stm-${profileName}`;
        return card(
            field('大模型供应商', selectControl(`${prefix}-provider`, providerChoices(), provider.id),
                '选择官方供应商，或用“自定义”接入兼容服务和本地模型。'),
            namedField(`${prefix}-builtin-model-field`, '模型',
                selectControl(`${prefix}-model`, modelChoices(provider.id), normalized.model),
                '包含现役别名、快照及预览型号；访问限制和计划下线日期见下方说明。'),
            namedField(`${prefix}-region-field`, 'MiniMax 平台',
                selectControl(`${prefix}-region`, [['cn', '中国区 · minimax.cn'], ['global', '国际区 · minimax.io']], normalized.region),
                '选择签发当前 API Key 的平台。'),
            el('div', { id: `${prefix}-custom-fields` }, [
                field('请求格式', selectControl(`${prefix}-protocol`, Object.entries(api().getCustomProtocols()), normalized.protocol)),
                field('API 地址', inputControl(`${prefix}-endpoint`, 'url', normalized.endpoint, {
                    placeholder: 'https://your-provider.example/v1', autocapitalize: 'off', spellcheck: 'false', inputmode: 'url',
                }), '支持 Base URL 或完整接口地址。服务端需要允许浏览器跨域请求。'),
                field('模型 ID', inputControl(`${prefix}-custom-model`, 'text', normalized.provider === 'custom' ? normalized.model : '', {
                    placeholder: '例如：服务商给出的模型名称', autocapitalize: 'off', spellcheck: 'false',
                }), '按服务商文档原样填写，支持本地模型名和自定义部署名。'),
                field('Temperature（可选）', inputControl(`${prefix}-temperature`, 'number', normalized.temperature, {
                    min: '0', max: '2', step: '0.1', inputmode: 'decimal', placeholder: '留空使用服务商默认值',
                }), '部分推理模型不接受此参数，不确定时请留空。'),
                field('最大输出 Tokens（可选）', inputControl(`${prefix}-max-tokens`, 'number', normalized.maxTokens, {
                    min: '1', step: '1', inputmode: 'numeric', placeholder: '留空使用默认值',
                }), '思考模型的额度可能包含思考过程。Anthropic 格式留空时使用 4096。'),
            ]),
            field('API Key', inputControl(`${prefix}-key`, 'password', normalized.key, {
                placeholder: provider.keyPlaceholder, autocomplete: 'off',
            }), '自定义的本地无鉴权服务可留空；密钥仅发送给当前选择的接口。'),
            el('div', { id: `${prefix}-model-meta`, className: 'stm-settings-model-meta',
                text: providerMetaText(provider.id, normalized.model) }),
            el('div', { className: 'stm-settings-btn-row' }, [el('button', {
                id: `stm-clear-${profileName}`, className: 'stm-toggle-btn', type: 'button',
                html: `<i class="fa-solid fa-eraser"></i> 清除 ${profileName === 'primary' ? 'Primary' : 'Secondary'} 密钥`,
            })]),
        );
    };

    const saveRow = () => el('div', { className: 'stm-settings-btn-row' }, [el('button', {
        id: 'stm-save-api-profiles', className: 'stm-toggle-btn stm-settings-save-btn', type: 'button',
        html: '<i class="fa-solid fa-check"></i> 保存独立 API 设置',
    })]);

    const infoCard = () => card(el('div', { className: 'stm-settings-info' }, [
        el('p', { text: '羽毛按钮使用这里的独立 API。Primary / Secondary 可分别配置官方供应商或自定义服务。' }),
        el('p', { text: `官方模型目录核对日期：${api().getCatalogInfo().verifiedAt}。含仍可调用的别名和快照；特定模型可能需要额外权限。` }),
        el('p', { text: '自定义支持 OpenAI Chat Completions、Responses、Anthropic Messages 与 Gemini Generate Content。切换供应商会使用各自的草稿，不会沿用其他供应商的密钥。' }),
        el('p', { text: '配置保存在当前浏览器，不会自动同步到其他设备。生成仍使用音乐 System Prompt 与预览中确认的内容。' }),
    ]));

    const createSettingsPage = () => {
        const config = api().getApiProfileConfig();
        drafts.clear();
        const selectedRoute = config.viewApiMap?.[VIEW_MUSIC] === 'secondary' ? 'secondary' : 'primary';
        const wrapper = el('div', { className: 'stm-form-scroll' });
        wrapper.append(
            group('01 / Primary API', [profileCard('primary', config.primary)]),
            group('02 / Secondary API', [card(field('启用第二 API', selectControl('stm-enable-second-api', [
                ['false', '关闭'], ['true', '开启'],
            ], config.enableSecondApi ? 'true' : 'false'))), profileCard('secondary', config.secondary)]),
            group('03 / Routing', [card(field('音乐创作使用', selectControl('stm-music-api-profile', [
                ['primary', 'Primary API'], ['secondary', 'Secondary API'],
            ], selectedRoute), 'Secondary 未配置完整时自动回退至 Primary；自定义无鉴权服务不要求密钥。'), saveRow())]),
            group('04 / Info', [infoCard()]),
        );
        return wrapper;
    };

    const toast = (message, type) => {
        if (typeof toastr === 'undefined') { alert(message); return; }
        if (type === 'error') toastr.error(message); else toastr.success(message);
    };

    const saveAllSettings = () => {
        const primary = readProfile('primary');
        const secondary = readProfile('secondary');
        const enableSecondApi = $id('stm-enable-second-api')?.value === 'true';
        const activeProfiles = [['Primary', primary], ...(enableSecondApi ? [['Secondary', secondary]] : [])];
        for (const [name, profile] of activeProfiles) {
            if (profile.provider === 'custom' && (profile.endpoint || profile.model || profile.key || profile.temperature || profile.maxTokens)) {
                const error = api().validateApiProfile(profile);
                if (error) { toast(`${name}：${error}`, 'error'); return; }
            }
        }
        const saved = api().saveApiProfileConfig({
            version: 5, primary, secondary,
            enableSecondApi,
            viewApiMap: { [VIEW_MUSIC]: $id('stm-music-api-profile')?.value === 'secondary' ? 'secondary' : 'primary' },
        });
        toast(saved ? '独立 API 设置已保存' : '保存失败，请重试', saved ? undefined : 'error');
    };

    const bindSettingsEvents = () => {
        const config = api().getApiProfileConfig();
        $id('stm-save-api-profiles')?.addEventListener('click', saveAllSettings);
        PROFILE_NAMES.forEach(profileName => {
            populateProfile(profileName, config[profileName]);
            $id(`stm-${profileName}-provider`)?.addEventListener('change', event => {
                const previous = event.target.dataset.previousProvider;
                drafts.set(draftKey(profileName, previous), readProfile(profileName, previous));
                const provider = event.target.value;
                populateProfile(profileName, drafts.get(draftKey(profileName, provider)) || { provider });
            });
            $id(`stm-${profileName}-model`)?.addEventListener('change', () => updateProviderMeta(profileName));
            $id(`stm-${profileName}-custom-model`)?.addEventListener('input', () => updateProviderMeta(profileName));
            $id(`stm-clear-${profileName}`)?.addEventListener('click', () => {
                $id(`stm-${profileName}-key`).value = '';
                toast(`${profileName === 'primary' ? 'Primary' : 'Secondary'} 密钥已清除，记得保存`);
            });
        });
    };

    const settingsView = {
        createSettingsPage,
        bindSettingsEvents,
    };

    window.STMusicApiSettings = settingsView;
    window.MusicSettings = settingsView;

    console.info("[ST Music API Settings] 多供应商与自定义独立 API 设置已加载");
})();
