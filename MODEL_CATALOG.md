# 官方文本模型目录

核对日期：2026-10-23。共 103 个 API 型号（含有效别名及快照，不等于独立基础模型数量）。

官方托管、已确认支持标准文本生成接口的现役模型 ID；包含有效别名、快照、预览及受限型号。

未来计划下线但当前仍可调用的型号予以保留；已下线型号不列入。受限或存量账户型号不保证任意 API Key 都能访问。已保存的旧型号保留原值，不会被静默替换。

## 模型清单

### openai · 54 个型号

新配置默认：`gpt-6-luna`。

| API ID | 名称 | 状态说明 |
| --- | --- | --- |
| `gpt-6-astra` | GPT-6 Astra | 不支持 none/minimal reasoning.effort；省略 temperature/top_p/logprobs |
| `gpt-6.1-sol` | GPT-6.1 Sol | 不支持 none/minimal reasoning.effort；省略 temperature/top_p/logprobs |
| `gpt-6-sol` | GPT-6 Sol |  |
| `gpt-6-luna` | GPT-6 Luna |  |
| `gpt-5.6-sol` | GPT-5.6 Sol |  |
| `gpt-5.6` | GPT-5.6 Sol（别名） |  |
| `gpt-5.6-terra` | GPT-5.6 Terra |  |
| `gpt-5.6-luna` | GPT-5.6 Luna |  |
| `gpt-5.5` | GPT-5.5 |  |
| `gpt-5.5-2026-04-23` | GPT-5.5（2026-04-23） |  |
| `gpt-5.5-pro` | GPT-5.5 Pro | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.5-pro-2026-04-23` | GPT-5.5 Pro（2026-04-23） | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.4` | GPT-5.4 |  |
| `gpt-5.4-2026-03-05` | GPT-5.4（2026-03-05） |  |
| `gpt-5.4-mini` | GPT-5.4 Mini |  |
| `gpt-5.4-mini-2026-03-17` | GPT-5.4 Mini（2026-03-17） |  |
| `gpt-5.4-nano` | GPT-5.4 nano |  下线：2027-04-01。 |
| `gpt-5.4-nano-2026-03-17` | GPT-5.4 nano（2026-03-17） |  下线：2027-04-01。 |
| `gpt-5.4-pro` | GPT-5.4 Pro | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.4-pro-2026-03-05` | GPT-5.4 Pro（2026-03-05） | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.3-codex` | GPT-5.3-Codex | 仅支持 Responses API；编程优化，但可直接使用文本 input 生成；不强制要求工具 下线：2027-04-01。 |
| `gpt-5.2` | GPT-5.2 |  |
| `gpt-5.2-2025-12-11` | GPT-5.2（2025-12-11） |  |
| `gpt-5.2-pro` | GPT-5.2 Pro | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.2-pro-2025-12-11` | GPT-5.2 Pro（2025-12-11） | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort |
| `gpt-5.1` | GPT-5.1 |  下线：2027-04-01。 |
| `gpt-5.1-2025-11-13` | GPT-5.1（2025-11-13） |  下线：2027-04-01。 |
| `gpt-5` | GPT-5 |  下线：2026-12-11。 |
| `gpt-5-2025-08-07` | GPT-5（2025-08-07） |  下线：2026-12-11。 |
| `gpt-5-mini` | GPT-5 Mini |  下线：2026-12-11。 |
| `gpt-5-mini-2025-08-07` | GPT-5 Mini（2025-08-07） |  下线：2026-12-11。 |
| `gpt-5-nano` | GPT-5 nano |  下线：2026-12-11。 |
| `gpt-5-nano-2025-08-07` | GPT-5 nano（2025-08-07） |  下线：2026-12-11。 |
| `gpt-5-pro` | GPT-5 Pro | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort；reasoning.effort 仅支持 high，省略时默认 high 下线：2026-12-11。 |
| `gpt-5-pro-2025-10-06` | GPT-5 Pro（2025-10-06） | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort；reasoning.effort 仅支持 high，省略时默认 high 下线：2026-12-11。 |
| `gpt-4.1` | GPT-4.1 |  下线：2027-01-14。 |
| `gpt-4.1-2025-04-14` | GPT-4.1（2025-04-14） |  下线：2027-01-14。 |
| `gpt-4.1-mini` | GPT-4.1 Mini |  下线：2027-01-14。 |
| `gpt-4.1-mini-2025-04-14` | GPT-4.1 Mini（2025-04-14） |  下线：2027-01-14。 |
| `gpt-4o` | GPT-4o |  下线：2027-01-14。 |
| `gpt-4o-2024-11-20` | GPT-4o（2024-11-20） |  下线：2027-01-14。 |
| `gpt-4o-2024-08-06` | GPT-4o（2024-08-06） |  下线：2027-01-14。 |
| `gpt-4o-mini` | GPT-4o Mini |  下线：2027-01-14。 |
| `gpt-4o-mini-2024-07-18` | GPT-4o Mini（2024-07-18） |  下线：2027-01-14。 |
| `o3` | o3 |  下线：2026-12-11。 |
| `o3-2025-04-16` | o3（2025-04-16） |  下线：2026-12-11。 |
| `o3-pro` | o3-pro | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort 下线：2026-12-11。 |
| `o3-pro-2025-06-10` | o3-pro（2025-06-10） | 仅支持 Responses API；可能耗时数分钟；不应强制设置低 reasoning.effort 下线：2026-12-11。 |
| `chat-latest` | Chat Latest |  |
| `gpt-5-search-api` | GPT-5 Search API（联网搜索） | 搜索专用，会联网检索；输出 URL 引用需在界面可见且可点击 |
| `gpt-5.6-cyber` | GPT-5.6 Cyber（需 Daybreak Red 权限） | 需获批的组织与项目权限；仅 Responses；省略 access_programs.cyber 时 API 自动选择 daybreak_red，无需额外必填参数 |
| `gpt-daybreak-blue-latest` | Daybreak Blue Latest（需授权） | 受限访问别名，已弃用但官方未公布下线日；官方仍在模型页与 Responses enum 列出；建议改用有权限的当前模型 |
| `gpt-daybreak-red-latest` | Daybreak Red Latest（需授权） | 受限访问别名，已弃用但官方未公布下线日；官方仍在模型页与 Responses enum 列出；建议改用有权限的当前模型 |
| `gpt-rosalind-research` | GPT-Rosalind Research（需研究权限） | 需 Trusted Access 批准用于内部生命科学研究；Responses API 明确枚举的模型 ID；公开文档未列额外必填参数 |

官方来源：
- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
- [OpenAI model deprecations](https://developers.openai.com/api/docs/deprecations)
- [OpenAI latest model API compatibility](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [OpenAI web search models and parameters](https://developers.openai.com/api/docs/guides/tools-web-search)
- [GPT-6 Astra API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-6-astra)
- [GPT-6.1 Sol API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
- [GPT-6 Sol API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-6-sol)
- [GPT-6 Luna API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [GPT-5.6 Sol API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [GPT-5.6 Terra API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [GPT-5.6 Luna API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [GPT-5.5 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.5)
- [GPT-5.5 Pro API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.5-pro)
- [GPT-5.4 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.4)
- [GPT-5.4 Mini API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
- [GPT-5.4 nano API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.4-nano)
- [GPT-5.4 Pro API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.4-pro)
- [GPT-5.3-Codex API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.3-codex)
- [GPT-5.2 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.2)
- [GPT-5.2 Pro API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.2-pro)
- [GPT-5.1 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5.1)
- [GPT-5 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5)
- [GPT-5 Mini API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5-mini)
- [GPT-5 nano API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5-nano)
- [GPT-5 Pro API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-5-pro)
- [GPT-4.1 API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-4.1)
- [GPT-4.1 Mini API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- [GPT-4o API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-4o)
- [GPT-4o Mini API model details and snapshots](https://developers.openai.com/api/docs/models/gpt-4o-mini)
- [o3 API model details and snapshots](https://developers.openai.com/api/docs/models/o3)
- [o3-pro API model details and snapshots](https://developers.openai.com/api/docs/models/o3-pro)
- [Chat Latest API model details and snapshots](https://developers.openai.com/api/docs/models/chat-latest)
- [GPT-5.6 Cyber model access and endpoints](https://developers.openai.com/api/docs/models/gpt-5.6-cyber)
- [Daybreak Blue alias](https://developers.openai.com/api/docs/models/gpt-daybreak-blue-latest)
- [Daybreak Red alias](https://developers.openai.com/api/docs/models/gpt-daybreak-red-latest)
- [Daybreak in the Responses API](https://developers.openai.com/api/docs/guides/daybreak)
- [Responses model IDs including GPT-Rosalind Research](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [OpenAI API release changelog](https://developers.openai.com/api/docs/changelog)

### gemini · 19 个型号

新配置默认：`gemini-3.8-flash`。

| API ID | 名称 | 状态说明 |
| --- | --- | --- |
| `gemini-4-argon` | Gemini 4 Argon | GA；不支持免费层；建议maxOutputTokens至少32768，或省略让服务器使用默认值。 |
| `gemini-3.8-flash` | Gemini 3.8 Flash |  |
| `gemini-3.6-flash` | Gemini 3.6 Flash |  |
| `gemini-3.5-flash-lite` | Gemini 3.5 Flash-Lite |  |
| `gemini-3.1-flash-lite` | Gemini 3.1 Flash-Lite | 官方列出的最早可能关闭日期。 最早可能下线：2027-05-07，非确定关停日。 |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro Preview |  |
| `gemini-3.1-pro-preview-customtools` | Gemini 3.1 Pro Preview Custom Tools | 针对自定义工具工作流优化；普通文本场景质量可能波动。 |
| `gemini-3-flash-preview` | Gemini 3 Flash Preview |  |
| `gemini-2.5-pro` | Gemini 2.5 Pro（仅已有访问用户） | 官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。 |
| `gemini-2.5-flash` | Gemini 2.5 Flash（仅已有访问用户） | 官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。 |
| `gemini-2.5-flash-lite` | Gemini 2.5 Flash-Lite（仅已有访问用户） | 官方未弃用、无关停日期；仅此前活跃使用过2.5系列的用户可访问。 |
| `gemma-4-31b-it` | Gemma 4 31B IT | Google在Gemini API正式托管的Gemma模型，支持generateContent和systemInstruction。 |
| `gemma-4-26b-a4b-it` | Gemma 4 26B A4B IT | Google在Gemini API正式托管的Gemma模型，支持generateContent和systemInstruction。 |
| `gemini-robotics-er-2-preview` | Gemini Robotics ER 2 Preview | 具身推理VLM，文本输出；标准generateContent端点可用，非视频生成模型。 |
| `gemini-pro-latest` | Gemini Pro Latest（滚动别名） | 官方有效latest别名，实际后端版本随官方更新。 |
| `gemini-flash-latest` | Gemini Flash Latest（滚动别名） | 官方有效latest别名，实际后端版本随官方更新。 |
| `gemini-flash-lite-latest` | Gemini Flash-Lite Latest（滚动别名） | 官方有效latest别名，实际后端版本随官方更新。 |
| `gemini-3.7-flash` | Gemini 3.7 Flash（已路由至3.8） | 已弃用，但官方明确端点不会关闭；自2026-10-08自动路由至gemini-3.8-flash。 |
| `gemini-3.5-flash` | Gemini 3.5 Flash（已路由至3.6） | 已弃用，但官方明确端点不会关闭；自2026-10-08自动路由至gemini-3.6-flash。 |

官方来源：
- [Gemini API Models（2026-10-22更新）](https://ai.google.dev/gemini-api/docs/models)
- [Gemini API deprecations（2026-10-22更新）](https://ai.google.dev/gemini-api/docs/deprecations)
- [Gemini 4 Argon model details](https://ai.google.dev/gemini-api/docs/models/gemini-4-argon)
- [What's new in Gemini 4 Argon](https://ai.google.dev/gemini-api/docs/latest-model)
- [Gemini 3.1 Pro Preview及Customtools精确模型ID](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-pro-preview)
- [Gemini API Release notes（3.5/3.7转路由与旧模型关闭）](https://ai.google.dev/gemini-api/docs/changelog)
- [Interactions API ModelOption（验证latest别名与模型ID，不用于请求实现）](https://ai.google.dev/api/interactions-api)
- [Run Gemma with the Gemini API（支持的托管模型）](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
- [Gemini Robotics ER generateContent与Live两种端点](https://ai.google.dev/gemini-api/docs/generate-content/robotics-overview)
- [Gemini generateContent API Reference](https://ai.google.dev/api/generate-content)

### claude · 20 个型号

新配置默认：`claude-sonnet-5-5`。

| API ID | 名称 | 状态说明 |
| --- | --- | --- |
| `claude-fable-5-1` | Claude Fable 5.1 |  |
| `claude-opus-5-5` | Claude Opus 5.5 |  |
| `claude-sonnet-5-5` | Claude Sonnet 5.5 |  |
| `claude-haiku-5-5` | Claude Haiku 5.5 |  |
| `claude-fable-5` | Claude Fable 5 |  |
| `claude-opus-5` | Claude Opus 5 |  |
| `claude-sonnet-5` | Claude Sonnet 5 |  |
| `claude-opus-4-8` | Claude Opus 4.8 |  |
| `claude-opus-4-7` | Claude Opus 4.7 |  |
| `claude-opus-4-6` | Claude Opus 4.6 |  |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 |  |
| `claude-opus-4-5` | Claude Opus 4.5（别名） | 有效别名，指向claude-opus-4-5-20251101。 |
| `claude-opus-4-5-20251101` | Claude Opus 4.5 · 20251101 |  |
| `claude-haiku-4-5` | Claude Haiku 4.5（别名） | 有效别名，指向claude-haiku-4-5-20251001。 |
| `claude-haiku-4-5-20251001` | Claude Haiku 4.5 · 20251001 | Active legacy；'Not sooner than 2026-10-15'并不代表已于该日期退役。 |
| `claude-sonnet-4-5` | Claude Sonnet 4.5（别名，11月30日退役） | Deprecated，但截至2026-10-23仍可用；建议迁移Sonnet5.5。 下线：2026-11-30。 |
| `claude-sonnet-4-5-20250929` | Claude Sonnet 4.5 · 20250929（11月30日退役） | Deprecated，但截至2026-10-23仍可用；建议迁移Sonnet5.5。 下线：2026-11-30。 |
| `claude-mythos-5-1` | Claude Mythos 5.1（需获批） | Active，须组织通过Anthropic官方验证计划，普通API账户不保证可用。应为满足全部现役要求保留，明确权限提示，不能默认选择。 |
| `claude-mythos-5` | Claude Mythos 5（需获批） | Active，须组织通过Anthropic官方验证计划，普通API账户不保证可用。 |
| `claude-mythos-preview` | Claude Mythos Preview（受限，已弃用） | Deprecated但退役日期仍待公布；原Project Glasswing受限预览，普通API账户不可访问。 |

官方来源：
- [Claude Models overview](https://platform.claude.com/docs/en/models/overview)
- [Claude Model deprecations（完整现役及退役表）](https://platform.claude.com/docs/en/about-claude/model-deprecations)
- [Claude Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)
- [Claude Opus 4.5（确认别名）](https://platform.claude.com/docs/en/models/opus-4-5/overview)
- [Claude Sonnet 4.5（确认别名及退役日期）](https://platform.claude.com/docs/en/models/sonnet-4-5/overview)
- [Claude Haiku 4.5（确认别名）](https://platform.claude.com/docs/en/models/haiku-4-5/overview)
- [Claude Mythos 5.1（Verification required）](https://platform.claude.com/docs/en/models/mythos-5-1/overview)
- [Claude Mythos 5（Verification required）](https://platform.claude.com/docs/en/models/mythos-5/overview)
- [Claude Messages API](https://platform.claude.com/docs/en/api/messages/create)
- [Claude API version 2026-10-21 migration](https://platform.claude.com/docs/en/api/migration-2026-10-21)
- [Claude thinking defaults与文本响应解析](https://platform.claude.com/docs/en/build-with-claude/thinking)

### deepseek · 4 个型号

新配置默认：`deepseek-flash`。

| API ID | 名称 | 状态说明 |
| --- | --- | --- |
| `deepseek-flash` | DeepSeek V4.1 Flash | 当前底层版本为 DeepSeek-V4.1-Flash-1017，可生成文本。 |
| `deepseek-v4-pro` | DeepSeek V4 Pro | 当前底层版本为 DeepSeek-V4-Pro-0813，官方继续提供服务。 |
| `deepseek-v4-flash` | DeepSeek V4 Flash（兼容别名 → V4.1 Flash） | 兼容别名，当前自动路由至 DeepSeek V4.1 Flash。 |
| `deepseek-v4-flash-vision-exp` | DeepSeek V4 Flash Vision Exp（兼容别名 → V4.1 Flash） | 兼容别名，当前自动路由至 DeepSeek V4.1 Flash；可输出文本。 |

官方来源：
- [Models & Pricing: active models and accepted legacy aliases](https://api-docs.deepseek.com/quick_start/pricing/)
- [Change Log: October 17 update, September 10 routing and V4 Pro continuation, July 24 legacy ID shutdown](https://api-docs.deepseek.com/updates/)
- [Lists Models: canonical callable model IDs](https://api-docs.deepseek.com/api/list-models/)
- [Chat Completions API: request schema and reasoning defaults](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Thinking Mode: supported controls and reasoning response fields](https://api-docs.deepseek.com/guides/thinking_mode/)

### minimax · 6 个型号

新配置默认：`MiniMax-M3.1-Flash`。

| API ID | 名称 | 状态说明 |
| --- | --- | --- |
| `MiniMax-M3.1-Flash` | MiniMax M3.1 Flash | 始终启用思考；插件会分离思考与正文，不发送关闭思考参数。 |
| `MiniMax-M3` | MiniMax M3 | 支持文本输出，插件使用非思考模式生成创作笔记。 |
| `MiniMax-M2.7` | MiniMax M2.7（仅存量用户，11月18日退役） | 按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。 下线：2026-11-18。 |
| `MiniMax-M2.7-highspeed` | MiniMax M2.7 Highspeed（仅存量用户，11月18日退役） | 按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。 下线：2026-11-18。 |
| `MiniMax-M2.5` | MiniMax M2.5（仅存量用户，11月18日退役） | 按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。 下线：2026-11-18。 |
| `MiniMax-M2.5-highspeed` | MiniMax M2.5 Highspeed（仅存量用户，11月18日退役） | 按量付费仅存量用户可用至 2026-11-18；M Plan / Token Plan 兼容名可能路由至 M3.1 Flash。 下线：2026-11-18。 |

官方来源：
- [Model List: active and retired models, exact phased M2.5/M2.7 retirement schedule](https://platform.minimax.io/docs/faq/models)
- [模型列表：中国区现役列表及M2.5/M2.7下线通知](https://platform.minimax.cn/docs/faq/models)
- [OpenAI SDK: IDs, endpoint, reasoning behavior and short-token risks](https://platform.minimax.io/docs/api-reference/text-openai-api)
- [Create Chat Completion: required fields and model-specific parameters](https://platform.minimax.io/docs/api-reference/text-chat-openai)
- [对话补全：中国区api.minimax.cn端点及参数](https://platform.minimax.cn/docs/api-reference/text-chat-openai)
- [Anthropic SDK: China endpoint and protocol-specific thinking defaults](https://platform.minimax.cn/docs/api-reference/text-anthropic-api)
- [Models release notes: M3.1 Flash and older highspeed family IDs](https://platform.minimax.io/docs/release-notes/models)

## 范围与待核验项

不包括图片、视频、音频、嵌入、审核模型，托管 Agent 服务，或仅开放权重但未在该供应商 API 托管的型号。Gemini Robotics ER 2 Streaming 仅支持 Live 专用协议，未放入标准文本接口列表；标准 ER 2 已收录。

`gpt-5.5-cyber` 和 `gpt-rosalind-discovery` 仅核实到官方定价条目，未确认标准文本 API 契约，故未声称内置支持。具备服务商确切接口说明和访问权限时，可通过“自定义”配置。

完整逐项核对和排除记录保存在 ModelCatalog.js 的 sources / exclusions 中；目录是本次核对快照，并不自动联网更新。
