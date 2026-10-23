// Official text-model API catalog. Verified 2026-10-23; see MODEL_CATALOG.md.
(function () {
    "use strict";
    window.STMusicModelCatalog = {
    "verifiedAt": "2026-10-23",
    "scope": "官方托管、已确认支持标准文本生成接口的现役模型 ID；包含有效别名、快照、预览及受限型号。",
    "providers": {
        "openai": {
            "defaultModel": "gpt-6-luna",
            "models": [
                {
                    "value": "gpt-6-astra",
                    "label": "GPT-6 Astra",
                    "api": "responses",
                    "note": "不支持 none/minimal reasoning.effort；省略 temperature/top_p/logprobs"
                },
                {
                    "value": "gpt-6.1-sol",
                    "label": "GPT-6.1 Sol",
                    "api": "responses",
                    "note": "不支持 none/minimal reasoning.effort；省略 temperature/top_p/logprobs"
                },
                {
                    "value": "gpt-6-sol",
                    "label": "GPT-6 Sol",
                    "api": "responses"
                },
                {
                    "value": "gpt-6-luna",
                    "label": "GPT-6 Luna",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.6-sol",
                    "label": "GPT-5.6 Sol",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.6",
                    "label": "GPT-5.6 Sol（别名）",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.6-terra",
                    "label": "GPT-5.6 Terra",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.6-luna",
                    "label": "GPT-5.6 Luna",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.5",
                    "label": "GPT-5.5",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.5-2026-04-23",
                    "label": "GPT-5.5（2026-04-23）",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.5-pro",
                    "label": "GPT-5.5 Pro",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.5-pro-2026-04-23",
                    "label": "GPT-5.5 Pro（2026-04-23）",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.4",
                    "label": "GPT-5.4",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.4-2026-03-05",
                    "label": "GPT-5.4（2026-03-05）",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.4-mini",
                    "label": "GPT-5.4 Mini",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.4-mini-2026-03-17",
                    "label": "GPT-5.4 Mini（2026-03-17）",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.4-nano",
                    "label": "GPT-5.4 nano",
                    "api": "responses",
                    "shutdownDate": "2027-04-01"
                },
                {
                    "value": "gpt-5.4-nano-2026-03-17",
                    "label": "GPT-5.4 nano（2026-03-17）",
                    "api": "responses",
                    "shutdownDate": "2027-04-01"
                },
                {
                    "value": "gpt-5.4-pro",
                    "label": "GPT-5.4 Pro",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.4-pro-2026-03-05",
                    "label": "GPT-5.4 Pro（2026-03-05）",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.3-codex",
                    "label": "GPT-5.3-Codex",
                    "api": "responses",
                    "shutdownDate": "2027-04-01",
                    "note": "仅支持 Responses API；编程优化，但可直接使用文本 input 生成；不强制要求工具"
                },
                {
                    "value": "gpt-5.2",
                    "label": "GPT-5.2",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.2-2025-12-11",
                    "label": "GPT-5.2（2025-12-11）",
                    "api": "responses"
                },
                {
                    "value": "gpt-5.2-pro",
                    "label": "GPT-5.2 Pro",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.2-pro-2025-12-11",
                    "label": "GPT-5.2 Pro（2025-12-11）",
                    "api": "responses",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "gpt-5.1",
                    "label": "GPT-5.1",
                    "api": "responses",
                    "shutdownDate": "2027-04-01"
                },
                {
                    "value": "gpt-5.1-2025-11-13",
                    "label": "GPT-5.1（2025-11-13）",
                    "api": "responses",
                    "shutdownDate": "2027-04-01"
                },
                {
                    "value": "gpt-5",
                    "label": "GPT-5",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-2025-08-07",
                    "label": "GPT-5（2025-08-07）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-mini",
                    "label": "GPT-5 Mini",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-mini-2025-08-07",
                    "label": "GPT-5 Mini（2025-08-07）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-nano",
                    "label": "GPT-5 nano",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-nano-2025-08-07",
                    "label": "GPT-5 nano（2025-08-07）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "gpt-5-pro",
                    "label": "GPT-5 Pro",
                    "api": "responses",
                    "shutdownDate": "2026-12-11",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort；reasoning.effort 仅支持 high，省略时默认 high"
                },
                {
                    "value": "gpt-5-pro-2025-10-06",
                    "label": "GPT-5 Pro（2025-10-06）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort；reasoning.effort 仅支持 high，省略时默认 high"
                },
                {
                    "value": "gpt-4.1",
                    "label": "GPT-4.1",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4.1-2025-04-14",
                    "label": "GPT-4.1（2025-04-14）",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4.1-mini",
                    "label": "GPT-4.1 Mini",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4.1-mini-2025-04-14",
                    "label": "GPT-4.1 Mini（2025-04-14）",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4o",
                    "label": "GPT-4o",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4o-2024-11-20",
                    "label": "GPT-4o（2024-11-20）",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4o-2024-08-06",
                    "label": "GPT-4o（2024-08-06）",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4o-mini",
                    "label": "GPT-4o Mini",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "gpt-4o-mini-2024-07-18",
                    "label": "GPT-4o Mini（2024-07-18）",
                    "api": "responses",
                    "shutdownDate": "2027-01-14"
                },
                {
                    "value": "o3",
                    "label": "o3",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "o3-2025-04-16",
                    "label": "o3（2025-04-16）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11"
                },
                {
                    "value": "o3-pro",
                    "label": "o3-pro",
                    "api": "responses",
                    "shutdownDate": "2026-12-11",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "o3-pro-2025-06-10",
                    "label": "o3-pro（2025-06-10）",
                    "api": "responses",
                    "shutdownDate": "2026-12-11",
                    "note": "仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort"
                },
                {
                    "value": "chat-latest",
                    "label": "Chat Latest",
                    "api": "responses"
                },
                {
                    "value": "gpt-5-search-api",
                    "label": "GPT-5 Search API（联网搜索）",
                    "api": "chat-completions",
                    "note": "搜索专用，会联网检索；输出 URL 引用需在界面可见且可点击",
                    "requestOptions": {
                        "web_search_options": {}
                    }
                },
                {
                    "value": "gpt-5.6-cyber",
                    "label": "GPT-5.6 Cyber（需 Daybreak Red 权限）",
                    "api": "responses",
                    "note": "需获批的组织与项目权限；仅 Responses；省略 access_programs.cyber 时 API 自动选择 daybreak_red，无需额外必填参数"
                },
                {
                    "value": "gpt-daybreak-blue-latest",
                    "label": "Daybreak Blue Latest（需授权）",
                    "api": "responses",
                    "note": "受限访问别名，已弃用但官方未公布下线日；官方仍在模型页与 Responses enum 列出；建议改用有权限的当前模型"
                },
                {
                    "value": "gpt-daybreak-red-latest",
                    "label": "Daybreak Red Latest（需授权）",
                    "api": "responses",
                    "note": "受限访问别名，已弃用但官方未公布下线日；官方仍在模型页与 Responses enum 列出；建议改用有权限的当前模型"
                },
                {
                    "value": "gpt-rosalind-research",
                    "label": "GPT-Rosalind Research（需研究权限）",
                    "api": "responses",
                    "note": "需 Trusted Access 批准用于内部生命科学研究；Responses API 明确枚举的模型 ID；公开文档未列额外必填参数"
                }
            ]
        },
        "gemini": {
            "defaultModel": "gemini-3.8-flash",
            "models": [
                {
                    "value": "gemini-4-argon",
                    "label": "Gemini 4 Argon",
                    "note": "GA；不支持免费层；建议maxOutputTokens至少32768，或省略让服务器使用默认值。"
                },
                {
                    "value": "gemini-3.8-flash",
                    "label": "Gemini 3.8 Flash"
                },
                {
                    "value": "gemini-3.6-flash",
                    "label": "Gemini 3.6 Flash"
                },
                {
                    "value": "gemini-3.5-flash-lite",
                    "label": "Gemini 3.5 Flash-Lite"
                },
                {
                    "value": "gemini-3.1-flash-lite",
                    "label": "Gemini 3.1 Flash-Lite",
                    "note": "官方列出的最早可能关闭日期。",
                    "earliestShutdownDate": "2027-05-07"
                },
                {
                    "value": "gemini-3.1-pro-preview",
                    "label": "Gemini 3.1 Pro Preview"
                },
                {
                    "value": "gemini-3.1-pro-preview-customtools",
                    "label": "Gemini 3.1 Pro Preview Custom Tools",
                    "note": "针对自定义工具工作流优化；普通文本场景质量可能波动。"
                },
                {
                    "value": "gemini-3-flash-preview",
                    "label": "Gemini 3 Flash Preview"
                },
                {
                    "value": "gemini-2.5-pro",
                    "label": "Gemini 2.5 Pro（仅已有访问用户）",
                    "note": "官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。"
                },
                {
                    "value": "gemini-2.5-flash",
                    "label": "Gemini 2.5 Flash（仅已有访问用户）",
                    "note": "官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。"
                },
                {
                    "value": "gemini-2.5-flash-lite",
                    "label": "Gemini 2.5 Flash-Lite（仅已有访问用户）",
                    "note": "官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。"
                },
                {
                    "value": "gemma-4-31b-it",
                    "label": "Gemma 4 31B IT",
                    "note": "Google在Gemini API正式托管的Gemma模型，支持generateContent和systemInstruction。"
                },
                {
                    "value": "gemma-4-26b-a4b-it",
                    "label": "Gemma 4 26B A4B IT",
                    "note": "Google在Gemini API正式托管的Gemma模型，支持generateContent和systemInstruction。"
                },
                {
                    "value": "gemini-robotics-er-2-preview",
                    "label": "Gemini Robotics ER 2 Preview",
                    "note": "具身推理VLM，文本输出；标准generateContent端点可用，非视频生成模型。"
                },
                {
                    "value": "gemini-pro-latest",
                    "label": "Gemini Pro Latest（滚动别名）",
                    "note": "官方有效latest别名，实际后端版本随官方更新。"
                },
                {
                    "value": "gemini-flash-latest",
                    "label": "Gemini Flash Latest（滚动别名）",
                    "note": "官方有效latest别名，实际后端版本随官方更新。"
                },
                {
                    "value": "gemini-flash-lite-latest",
                    "label": "Gemini Flash-Lite Latest（滚动别名）",
                    "note": "官方有效latest别名，实际后端版本随官方更新。"
                },
                {
                    "value": "gemini-3.7-flash",
                    "label": "Gemini 3.7 Flash（已路由至3.8）",
                    "note": "已弃用，但官方明确端点不会关闭；自2026-10-08自动路由至gemini-3.8-flash。"
                },
                {
                    "value": "gemini-3.5-flash",
                    "label": "Gemini 3.5 Flash（已路由至3.6）",
                    "note": "已弃用，但官方明确端点不会关闭；自2026-10-08自动路由至gemini-3.6-flash。"
                }
            ]
        },
        "claude": {
            "defaultModel": "claude-sonnet-5-5",
            "models": [
                {
                    "value": "claude-fable-5-1",
                    "label": "Claude Fable 5.1"
                },
                {
                    "value": "claude-opus-5-5",
                    "label": "Claude Opus 5.5"
                },
                {
                    "value": "claude-sonnet-5-5",
                    "label": "Claude Sonnet 5.5"
                },
                {
                    "value": "claude-haiku-5-5",
                    "label": "Claude Haiku 5.5"
                },
                {
                    "value": "claude-fable-5",
                    "label": "Claude Fable 5"
                },
                {
                    "value": "claude-opus-5",
                    "label": "Claude Opus 5"
                },
                {
                    "value": "claude-sonnet-5",
                    "label": "Claude Sonnet 5"
                },
                {
                    "value": "claude-opus-4-8",
                    "label": "Claude Opus 4.8"
                },
                {
                    "value": "claude-opus-4-7",
                    "label": "Claude Opus 4.7"
                },
                {
                    "value": "claude-opus-4-6",
                    "label": "Claude Opus 4.6"
                },
                {
                    "value": "claude-sonnet-4-6",
                    "label": "Claude Sonnet 4.6"
                },
                {
                    "value": "claude-opus-4-5",
                    "label": "Claude Opus 4.5（别名）",
                    "note": "有效别名，指向claude-opus-4-5-20251101。"
                },
                {
                    "value": "claude-opus-4-5-20251101",
                    "label": "Claude Opus 4.5 · 20251101"
                },
                {
                    "value": "claude-haiku-4-5",
                    "label": "Claude Haiku 4.5（别名）",
                    "note": "有效别名，指向claude-haiku-4-5-20251001。"
                },
                {
                    "value": "claude-haiku-4-5-20251001",
                    "label": "Claude Haiku 4.5 · 20251001",
                    "note": "Active legacy；'Not sooner than 2026-10-15'并不代表已于该日期退役。"
                },
                {
                    "value": "claude-sonnet-4-5",
                    "label": "Claude Sonnet 4.5（别名，11月30日退役）",
                    "shutdownDate": "2026-11-30",
                    "note": "Deprecated，但截至2026-10-23仍可用；建议迁移Sonnet5.5。"
                },
                {
                    "value": "claude-sonnet-4-5-20250929",
                    "label": "Claude Sonnet 4.5 · 20250929（11月30日退役）",
                    "shutdownDate": "2026-11-30",
                    "note": "Deprecated，但截至2026-10-23仍可用；建议迁移Sonnet5.5。"
                },
                {
                    "value": "claude-mythos-5-1",
                    "label": "Claude Mythos 5.1（需获批）",
                    "note": "Active，须组织通过Anthropic官方验证计划，普通API账户不保证可用。应为满足全部现役要求保留，明确权限提示，不能默认选择。"
                },
                {
                    "value": "claude-mythos-5",
                    "label": "Claude Mythos 5（需获批）",
                    "note": "Active，须组织通过Anthropic官方验证计划，普通API账户不保证可用。"
                },
                {
                    "value": "claude-mythos-preview",
                    "label": "Claude Mythos Preview（受限，已弃用）",
                    "note": "Deprecated但退役日期仍待公布；原Project Glasswing受限预览，普通API账户不可访问。"
                }
            ]
        },
        "deepseek": {
            "defaultModel": "deepseek-flash",
            "models": [
                {
                    "value": "deepseek-flash",
                    "label": "DeepSeek V4.1 Flash",
                    "note": "当前底层版本为 DeepSeek-V4.1-Flash-1017，可生成文本。"
                },
                {
                    "value": "deepseek-v4-pro",
                    "label": "DeepSeek V4 Pro",
                    "note": "当前底层版本为 DeepSeek-V4-Pro-0813，官方继续提供服务。"
                },
                {
                    "value": "deepseek-v4-flash",
                    "label": "DeepSeek V4 Flash（兼容别名 → V4.1 Flash）",
                    "note": "兼容别名，当前自动路由至 DeepSeek V4.1 Flash。"
                },
                {
                    "value": "deepseek-v4-flash-vision-exp",
                    "label": "DeepSeek V4 Flash Vision Exp（兼容别名 → V4.1 Flash）",
                    "note": "兼容别名，当前自动路由至 DeepSeek V4.1 Flash；可输出文本。"
                }
            ]
        },
        "minimax": {
            "defaultModel": "MiniMax-M3.1-Flash",
            "models": [
                {
                    "value": "MiniMax-M3.1-Flash",
                    "label": "MiniMax M3.1 Flash",
                    "note": "始终启用思考；插件会分离思考与正文，不发送关闭思考参数。"
                },
                {
                    "value": "MiniMax-M3",
                    "label": "MiniMax M3",
                    "note": "支持文本输出，插件使用非思考模式生成创作笔记。"
                },
                {
                    "value": "MiniMax-M2.7",
                    "label": "MiniMax M2.7（仅存量用户，11月18日退役）",
                    "shutdownDate": "2026-11-18",
                    "note": "按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。"
                },
                {
                    "value": "MiniMax-M2.7-highspeed",
                    "label": "MiniMax M2.7 Highspeed（仅存量用户，11月18日退役）",
                    "shutdownDate": "2026-11-18",
                    "note": "按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。"
                },
                {
                    "value": "MiniMax-M2.5",
                    "label": "MiniMax M2.5（仅存量用户，11月18日退役）",
                    "shutdownDate": "2026-11-18",
                    "note": "按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。"
                },
                {
                    "value": "MiniMax-M2.5-highspeed",
                    "label": "MiniMax M2.5 Highspeed（仅存量用户，11月18日退役）",
                    "shutdownDate": "2026-11-18",
                    "note": "按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。"
                }
            ]
        }
    },
    "sources": {
        "openai": [
            {
                "url": "https://developers.openai.com/api/docs/models",
                "title": "OpenAI model catalog"
            },
            {
                "url": "https://developers.openai.com/api/docs/deprecations",
                "title": "OpenAI model deprecations"
            },
            {
                "url": "https://developers.openai.com/api/docs/guides/latest-model",
                "title": "OpenAI latest model API compatibility"
            },
            {
                "url": "https://developers.openai.com/api/docs/pricing",
                "title": "OpenAI API pricing"
            },
            {
                "url": "https://developers.openai.com/api/docs/guides/tools-web-search",
                "title": "OpenAI web search models and parameters"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-6-astra",
                "title": "GPT-6 Astra API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-6.1-sol",
                "title": "GPT-6.1 Sol API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-6-sol",
                "title": "GPT-6 Sol API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-6-luna",
                "title": "GPT-6 Luna API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.6-sol",
                "title": "GPT-5.6 Sol API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.6-terra",
                "title": "GPT-5.6 Terra API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.6-luna",
                "title": "GPT-5.6 Luna API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.5",
                "title": "GPT-5.5 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.5-pro",
                "title": "GPT-5.5 Pro API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.4",
                "title": "GPT-5.4 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.4-mini",
                "title": "GPT-5.4 Mini API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.4-nano",
                "title": "GPT-5.4 nano API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.4-pro",
                "title": "GPT-5.4 Pro API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.3-codex",
                "title": "GPT-5.3-Codex API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.2",
                "title": "GPT-5.2 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.2-pro",
                "title": "GPT-5.2 Pro API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.1",
                "title": "GPT-5.1 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5",
                "title": "GPT-5 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5-mini",
                "title": "GPT-5 Mini API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5-nano",
                "title": "GPT-5 nano API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5-pro",
                "title": "GPT-5 Pro API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-4.1",
                "title": "GPT-4.1 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-4.1-mini",
                "title": "GPT-4.1 Mini API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-4o",
                "title": "GPT-4o API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-4o-mini",
                "title": "GPT-4o Mini API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/o3",
                "title": "o3 API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/o3-pro",
                "title": "o3-pro API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/chat-latest",
                "title": "Chat Latest API model details and snapshots"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-5.6-cyber",
                "title": "GPT-5.6 Cyber model access and endpoints"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-daybreak-blue-latest",
                "title": "Daybreak Blue alias"
            },
            {
                "url": "https://developers.openai.com/api/docs/models/gpt-daybreak-red-latest",
                "title": "Daybreak Red alias"
            },
            {
                "url": "https://developers.openai.com/api/docs/guides/daybreak",
                "title": "Daybreak in the Responses API"
            },
            {
                "url": "https://developers.openai.com/api/reference/resources/responses/methods/create",
                "title": "Responses model IDs including GPT-Rosalind Research"
            },
            {
                "url": "https://developers.openai.com/api/docs/changelog",
                "title": "OpenAI API release changelog"
            }
        ],
        "gemini": [
            {
                "url": "https://ai.google.dev/gemini-api/docs/models",
                "title": "Gemini API Models（2026-10-22更新）"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/deprecations",
                "title": "Gemini API deprecations（2026-10-22更新）"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/models/gemini-4-argon",
                "title": "Gemini 4 Argon model details"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/latest-model",
                "title": "What's new in Gemini 4 Argon"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview",
                "title": "Gemini 3.1 Pro Preview及Customtools精确模型ID"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/changelog",
                "title": "Gemini API Release notes（3.5/3.7转路由与旧模型关闭）"
            },
            {
                "url": "https://ai.google.dev/api/interactions-api",
                "title": "Interactions API ModelOption（验证latest别名与模型ID，不用于请求实现）"
            },
            {
                "url": "https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api",
                "title": "Run Gemma with the Gemini API（支持的托管模型）"
            },
            {
                "url": "https://ai.google.dev/gemini-api/docs/generate-content/robotics-overview",
                "title": "Gemini Robotics ER generateContent与Live两种端点"
            },
            {
                "url": "https://ai.google.dev/api/generate-content",
                "title": "Gemini generateContent API Reference"
            }
        ],
        "claude": [
            {
                "url": "https://platform.claude.com/docs/en/models/overview",
                "title": "Claude Models overview"
            },
            {
                "url": "https://platform.claude.com/docs/en/about-claude/model-deprecations",
                "title": "Claude Model deprecations（完整现役及退役表）"
            },
            {
                "url": "https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions",
                "title": "Claude Model IDs and versioning"
            },
            {
                "url": "https://platform.claude.com/docs/en/models/opus-4-5/overview",
                "title": "Claude Opus 4.5（确认别名）"
            },
            {
                "url": "https://platform.claude.com/docs/en/models/sonnet-4-5/overview",
                "title": "Claude Sonnet 4.5（确认别名及退役日期）"
            },
            {
                "url": "https://platform.claude.com/docs/en/models/haiku-4-5/overview",
                "title": "Claude Haiku 4.5（确认别名）"
            },
            {
                "url": "https://platform.claude.com/docs/en/models/mythos-5-1/overview",
                "title": "Claude Mythos 5.1（Verification required）"
            },
            {
                "url": "https://platform.claude.com/docs/en/models/mythos-5/overview",
                "title": "Claude Mythos 5（Verification required）"
            },
            {
                "url": "https://platform.claude.com/docs/en/api/messages/create",
                "title": "Claude Messages API"
            },
            {
                "url": "https://platform.claude.com/docs/en/api/migration-2026-10-21",
                "title": "Claude API version 2026-10-21 migration"
            },
            {
                "url": "https://platform.claude.com/docs/en/build-with-claude/thinking",
                "title": "Claude thinking defaults与文本响应解析"
            }
        ],
        "deepseek": [
            {
                "url": "https://api-docs.deepseek.com/quick_start/pricing/",
                "title": "Models & Pricing: active models and accepted legacy aliases"
            },
            {
                "url": "https://api-docs.deepseek.com/updates/",
                "title": "Change Log: October 17 update, September 10 routing and V4 Pro continuation, July 24 legacy ID shutdown"
            },
            {
                "url": "https://api-docs.deepseek.com/api/list-models/",
                "title": "Lists Models: canonical callable model IDs"
            },
            {
                "url": "https://api-docs.deepseek.com/api/create-chat-completion/",
                "title": "Chat Completions API: request schema and reasoning defaults"
            },
            {
                "url": "https://api-docs.deepseek.com/guides/thinking_mode/",
                "title": "Thinking Mode: supported controls and reasoning response fields"
            }
        ],
        "minimax": [
            {
                "url": "https://platform.minimax.io/docs/faq/models",
                "title": "Model List: active and retired models, exact phased M2.5/M2.7 retirement schedule"
            },
            {
                "url": "https://platform.minimax.cn/docs/faq/models",
                "title": "模型列表：中国区现役列表及M2.5/M2.7下线通知"
            },
            {
                "url": "https://platform.minimax.io/docs/api-reference/text-openai-api",
                "title": "OpenAI SDK: IDs, endpoint, reasoning behavior and short-token risks"
            },
            {
                "url": "https://platform.minimax.io/docs/api-reference/text-chat-openai",
                "title": "Create Chat Completion: required fields and model-specific parameters"
            },
            {
                "url": "https://platform.minimax.cn/docs/api-reference/text-chat-openai",
                "title": "对话补全：中国区api.minimax.cn端点及参数"
            },
            {
                "url": "https://platform.minimax.cn/docs/api-reference/text-anthropic-api",
                "title": "Anthropic SDK: China endpoint and protocol-specific thinking defaults"
            },
            {
                "url": "https://platform.minimax.io/docs/release-notes/models",
                "title": "Models release notes: M3.1 Flash and older highspeed family IDs"
            }
        ]
    },
    "exclusions": [
        {
            "values": [
                "gpt-3.5-turbo",
                "gpt-3.5-turbo-0125",
                "gpt-4",
                "gpt-4-0613",
                "gpt-4-1106-preview",
                "gpt-4-turbo",
                "gpt-4-turbo-2024-04-09",
                "gpt-4.1-nano",
                "gpt-4.1-nano-2025-04-14",
                "gpt-4o-2024-05-13",
                "o1",
                "o1-2024-12-17",
                "o1-pro",
                "o1-pro-2025-03-19",
                "o3-mini",
                "o3-mini-2025-01-31",
                "o4-mini",
                "o4-mini-2025-04-16"
            ],
            "reason": "于核验当日 2026-10-23 下线"
        },
        {
            "values": [
                "o3-deep-research",
                "o3-deep-research-2025-06-26",
                "o4-mini-deep-research",
                "o4-mini-deep-research-2025-06-26",
                "computer-use-preview",
                "gpt-4o-search-preview",
                "gpt-4o-mini-search-preview",
                "gpt-5-chat-latest",
                "gpt-5-codex",
                "gpt-5.1-chat-latest",
                "gpt-5.1-codex",
                "gpt-5.1-codex-max",
                "gpt-5.1-codex-mini",
                "gpt-5.2-codex"
            ],
            "reason": "2026-07-23 已下线"
        },
        {
            "values": [
                "gpt-5.2-chat-latest",
                "gpt-5.3-chat-latest"
            ],
            "reason": "2026-08-10 已下线"
        },
        {
            "values": [
                "gpt-oss-120b",
                "gpt-oss-20b"
            ],
            "reason": "开放权重自托管/第三方托管；不是 OpenAI 官方托管 API 模型。可用自定义供应商接入兼容服务器"
        },
        {
            "values": [
                "gpt-5.5-cyber",
                "gpt-rosalind-discovery"
            ],
            "reason": "官方定价表确认 ID，但无可读取单模型页，现行 Responses enum 与指南未确认标准文本请求支持；不是判定已下线，作为待核验专用条目；有专属访问文档的用户可使用自定义配置"
        },
        {
            "values": [
                "gpt-5.1-mini"
            ],
            "reason": "仅旧 API enum 出现；现行模型目录/定价/单模型页未确认，故不把类型定义视作现役可用证明"
        },
        {
            "values": [
                "audio/realtime/live/transcription/TTS models",
                "image/video models",
                "embedding/moderation models",
                "account-specific fine-tuned models"
            ],
            "reason": "不属于本次通用文本大语言模型目录或需要用户专属模型 ID"
        },
        {
            "provider": "gemini",
            "value": "gemini-robotics-er-2-streaming-preview",
            "reason": "仍现役且文本输出，但仅Live API，不能送到generateContent；属于实时音视频机器人专用推理端点。如用户严格要求连实时专用LLM也可选，须另做Live协议实现。"
        },
        {
            "provider": "gemini",
            "value": "deep-research-preview-04-2026, deep-research-max-preview-04-2026, antigravity-preview-09-2026",
            "reason": "托管Agent服务，非普通LLM；不支持generateContent。"
        },
        {
            "provider": "gemini",
            "value": "deep-research-pro-preview-12-2025",
            "reason": "官方关停日期即2026-10-23，排除。"
        },
        {
            "provider": "gemini",
            "value": "gemini-3-pro-preview",
            "reason": "官方模型目录及弃用表明确标记2026-03-09 shut down；旧发布记录提过重定向3.1，但现役目录不保留。"
        },
        {
            "provider": "gemini",
            "value": "Gemini 1.x/2.0；Gemini 2.5旧dated preview；Gemini 2.5 Computer Use；Gemini Robotics ER 1.5/1.6；Gemini 3.1 Flash-Lite Preview",
            "reason": "已关停。"
        },
        {
            "provider": "gemini",
            "value": "Nano Banana/Imagen/Veo/Omni/Lyria/Embedding/TTS/Live/Transcribe系列",
            "reason": "图片、视频、音频、嵌入或实时音视频专用模型，不在普通文本LLM范围。"
        },
        {
            "provider": "gemini",
            "value": "Gemma 1/2/3/3n及其他Gemma4尺寸、DiffusionGemma、FunctionGemma",
            "reason": "开源权重仍可自托管，但当前官方Gemini API托管文档仅列两款Gemma4；不能把本地权重名称当官方托管端点。"
        },
        {
            "provider": "claude",
            "value": "claude-opus-4-1-20250805, claude-opus-4-20250514, claude-sonnet-4-20250514及Claude 3.x/2.x/1.x",
            "reason": "已在官方Claude API退役，不包含其他云厂商单独延长的生命周期。"
        },
        {
            "provider": "deepseek",
            "models": [
                "deepseek-chat",
                "deepseek-reasoner"
            ],
            "reason": "Legacy IDs discontinued 2026-07-24 according to official change log."
        },
        {
            "provider": "deepseek",
            "models": [
                "deepseek-v3.2-speciale"
            ],
            "reason": "Temporary V3.2 Speciale service ended 2025-12-15; model version labels are not callable active snapshots."
        },
        {
            "provider": "deepseek",
            "models": [
                "DeepSeek-V4.1-Flash-1017",
                "DeepSeek-V4-Pro-0813"
            ],
            "reason": "Underlying version labels only; official callable IDs are deepseek-flash and deepseek-v4-pro."
        },
        {
            "provider": "minimax",
            "models": [
                "MiniMax-M2.1",
                "MiniMax-M2.1-highspeed",
                "MiniMax-M2",
                "M2-her"
            ],
            "reason": "Explicitly retired in current official model list; no future availability window stated."
        },
        {
            "provider": "minimax",
            "models": [
                "MiniMax-Text-01",
                "MiniMax-VL-01",
                "MiniMax-M1",
                "abab6.5s-chat",
                "abab6.5-chat"
            ],
            "reason": "Historical models not in the official active model directory; no current provider-hosted callable status documented. Do not invent active entries."
        },
        {
            "provider": "minimax",
            "models": [
                "MiniMax-M3-highspeed"
            ],
            "reason": "No official active model ID found; M3's priority service tier is a parameter rather than another model."
        },
        {
            "provider": "all",
            "models": [
                "image generators",
                "video generators",
                "speech/audio/music generators",
                "embedding models"
            ],
            "reason": "Outside requested text LLM scope."
        }
    ]
};
})();
