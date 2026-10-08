Migrate AI SDK 6.x to 7.0 | Migrate AI SDK 6.x to 7.0 | migrate-ai-sdk-6x-to-70
Recommended Migration Process | 推荐迁移流程 | 推荐迁移流程
Codemods | Codemods | codemods
Codemod Table | Codemod 对照表 | codemod-对照表
All Packages | 所有包 | 所有包
Minimum Node.js Version | 最低 Node.js 版本 | 最低-nodejs-版本
ESM Only — CommonJS Support Removed | 仅支持 ESM——已移除 CommonJS 支持 | 仅支持-esm已移除-commonjs-支持
AI SDK Core | AI SDK Core | ai-sdk-core
Core API Renames and Removals | 核心 API 重命名与移除 | 核心-api-重命名与移除
Provider Management: Remove Deprecated `experimental_customProvider` | 提供商管理：移除已弃用的 `experimental_customProvider` | 提供商管理移除已弃用的-experimental_customprovider
Remove Deprecated `experimental_generateImage` Export | 移除已弃用的 `experimental_generateImage` 导出 | 移除已弃用的-experimental_generateimage-导出
`experimental_transcribe` Renamed to `transcribe` | `experimental_transcribe` 重命名为 `transcribe` | experimental_transcribe-重命名为-transcribe
`experimental_generateSpeech` Renamed to `generateSpeech` | `experimental_generateSpeech` 重命名为 `generateSpeech` | experimental_generatespeech-重命名为-generatespeech
Structured Outputs: Remove Deprecated `experimental_output` Option and Result | 结构化输出：移除已弃用的 `experimental_output` 选项与结果 | 结构化输出移除已弃用的-experimental_output-选项与结果
`CallSettings` Renamed to `LanguageModelCallOptions` and `RequestOptions` | `CallSettings` 重命名为 `LanguageModelCallOptions` 与 `RequestOptions` | callsettings-重命名为-languagemodelcalloptions-与-requestoptions
Stop Condition Helper Rename: `stepCountIs` -> `isStepCount` | 停止条件辅助函数重命名：`stepCountIs` -> `isStepCount` | 停止条件辅助函数重命名stepcountis--isstepcount
Prompts and Step Preparation | 提示词与步骤准备 | 提示词与步骤准备
`system` Renamed to `instructions` | `system` 重命名为 `instructions` | system-重命名为-instructions
`prepareStep` Instructions Carry Forward | `prepareStep` 指令会延续到后续步骤 | preparestep-指令会延续到后续步骤
Prompt Messages: System Messages in `prompt` or `messages` Are Rejected by Default | 提示词消息：默认拒绝 `prompt` 或 `messages` 中的系统消息 | 提示词消息默认拒绝-prompt-或-messages-中的系统消息
Remove Deprecated `experimental_prepareStep` Option | 移除已弃用的 `experimental_prepareStep` 选项 | 移除已弃用的-experimental_preparestep-选项
`prepareStep` Message Overrides Carry Forward | `prepareStep` 消息覆盖会延续到后续步骤 | preparestep-消息覆盖会延续到后续步骤
Lifecycle Events | 生命周期事件 | 生命周期事件
`experimental_onStart` Renamed to `onStart` | `experimental_onStart` 重命名为 `onStart` | experimental_onstart-重命名为-onstart
`experimental_onStepStart` Renamed to `onStepStart` | `experimental_onStepStart` 重命名为 `onStepStart` | experimental_onstepstart-重命名为-onstepstart
`onFinish` Renamed to `onEnd` | `onFinish` 重命名为 `onEnd` | onfinish-重命名为-onend
`onStepFinish` Renamed to `onStepEnd` | `onStepFinish` 重命名为 `onStepEnd` | onstepfinish-重命名为-onstepend
Embed Callbacks | 嵌入回调 | 嵌入回调
Rerank Callback | 重排序（rerank）回调 | 重排序rerank回调
Usage and Result Shape Changes | 用量与结果结构变更 | 用量与结果结构变更
`cachedInputTokens` and `reasoningTokens` Removed from `LanguageModelUsage` | 已从 `LanguageModelUsage` 中移除 `cachedInputTokens` 与 `reasoningTokens` | 已从-languagemodelusage-中移除-cachedinputtokens-与-reasoningtokens
Telemetry | 遥测（telemetry） | 遥测telemetry
OpenTelemetry Moved to `@ai-sdk/otel` | OpenTelemetry 迁移至 `@ai-sdk/otel` | opentelemetry-迁移至-ai-sdkotel
Enabled by Default When an Integration Is Registered | 注册集成后默认启用 | 注册集成后默认启用
`tracer` Property Removed from `experimental_telemetry` | 已从 `experimental_telemetry` 中移除 `tracer` 属性 | 已从-experimental_telemetry-中移除-tracer-属性
`experimental_telemetry` Renamed to `telemetry` | `experimental_telemetry` 重命名为 `telemetry` | experimental_telemetry-重命名为-telemetry
`onRerankFinish` Renamed to `onRerankEnd` | `onRerankFinish` 重命名为 `onRerankEnd` | onrerankfinish-重命名为-onrerankend
`onEmbedFinish` Renamed to `onEmbedEnd` | `onEmbedFinish` 重命名为 `onEmbedEnd` | onembedfinish-重命名为-onembedend
Streaming and Include Options | 流式与 include 选项 | 流式与-include-选项
`StreamTextResult.fullStream` Renamed to `stream` | `StreamTextResult.fullStream` 重命名为 `stream` | streamtextresultfullstream-重命名为-stream
`streamText` `onChunk` Receives All Stream Parts | `streamText` 的 `onChunk` 会接收所有流部分 | streamtext-的-onchunk-会接收所有流部分
Move `includeRawChunks` to `include.rawChunks` | 将 `includeRawChunks` 移至 `include.rawChunks` | 将-includerawchunks-移至-includerawchunks
Rename `experimental_include` to `include` | 将 `experimental_include` 重命名为 `include` | 将-experimental_include-重命名为-include
Request and Response Bodies Are Excluded by Default | 请求与响应体默认被排除 | 请求与响应体默认被排除
Result Message Changes | 结果消息变更 | 结果消息变更
Step Response Messages Are No Longer Accumulated | 步骤响应消息不再累积 | 步骤响应消息不再累积
Tools and Tool Execution | 工具与工具执行 | 工具与工具执行
Tool Execution Callbacks | 工具执行回调 | 工具执行回调
Context: `experimental_context` Became Tool `context`, and Shared Runtime Data Moved to `runtimeContext` | 上下文：`experimental_context` 变为工具的 `context`，共享运行时数据移至 `runtimeContext` | 上下文experimental_context-变为工具的-context共享运行时数据移至-runtimecontext
Migrate Deprecated `needsApproval` to `toolApproval` | 将已弃用的 `needsApproval` 迁移到 `toolApproval` | 将已弃用的-needsapproval-迁移到-toolapproval
Remove Deprecated `experimental_activeTools` Option | 移除已弃用的 `experimental_activeTools` 选项 | 移除已弃用的-experimental_activetools-选项
Remove Deprecated `ToolCallOptions` Type | 移除已弃用的 `ToolCallOptions` 类型 | 移除已弃用的-toolcalloptions-类型
UI Messages | UI 消息 | ui-消息
Remove Deprecated `isToolOrDynamicToolUIPart` Function | 移除已弃用的 `isToolOrDynamicToolUIPart` 函数 | 移除已弃用的-istoordynamictooluipart-函数
Tool and Message Content Parts | 工具与消息内容部分 | 工具与消息内容部分
Remove Deprecated `media` Content Part Type | 移除已弃用的 `media` 内容部分类型 | 移除已弃用的-media-内容部分类型
Tool Result Content: Migrate Away From `image-*` and `file-*` variants to `file` | 工具结果内容：从 `image-*` 与 `file-*` 变体迁移到 `file` | 工具结果内容从-image--与-file--变体迁移到-file
Message Parts: Migrate Away From Deprecated `image` Part | 消息部分：从已弃用的 `image` 部分迁移 | 消息部分从已弃用的-image-部分迁移
Message Parts: Handle New `reasoning-file` Content Type | 消息部分：处理新的 `reasoning-file` 内容类型 | 消息部分处理新的-reasoning-file-内容类型
Reasoning | 推理（reasoning） | 推理reasoning
Reasoning Configuration: Remove Overlapping Settings | 推理配置：移除重叠的设置 | 推理配置移除重叠的设置
Multi-Step Result Shape | 多步结果结构 | 多步结果结构
`generateText` and `streamText` `usage` Now Includes All Steps | `generateText` 与 `streamText` 的 `usage` 现在包含所有步骤 | generatetext-与-streamtext-的-usage-现在包含所有步骤
`generateText` and `streamText` Result Properties Now Include All Steps | `generateText` 与 `streamText` 的结果属性现在包含所有步骤 | generatetext-与-streamtext-的结果属性现在包含所有步骤
Final-Step Result Properties Moved to `finalStep` | 最终步骤结果属性移至 `finalStep` | 最终步骤结果属性移至-finalstep
`generateText` and `streamText` `onEnd` Result Properties Changed | `generateText` 与 `streamText` 的 `onEnd` 结果属性变更 | generatetext-与-streamtext-的-onend-结果属性变更
Stream Response Helpers | 流式响应辅助函数 | 流式响应辅助函数
`streamText` Response Helpers Deprecated — Use Stateless Helpers | `streamText` 响应辅助函数已弃用——请改用无状态辅助函数 | streamtext-响应辅助函数已弃用请改用无状态辅助函数
MCP Package | MCP 包 | mcp-包
MCP Transport: `redirect` Default Changed from `'follow'` to `'error'` | MCP 传输：`redirect` 默认值从 `'follow'` 改为 `'error'` | mcp-传输redirect-默认值从-follow-改为-error
Vue Package | Vue 包 | vue-包
`Chat` Class Deprecated in Favor of `useChat` Composable | `Chat` 类已弃用，请改用 `useChat` 组合式函数 | chat-类已弃用请改用-usechat-组合式函数
OpenAI Provider | OpenAI 提供商 | openai-提供商
Responses Reasoning Summary Defaults to Detailed | Responses 推理摘要默认为 detailed | responses-推理摘要默认为-detailed
Anthropic Provider | Anthropic 提供商 | anthropic-提供商
`providerMetadata.anthropic.cacheCreationInputTokens` Removed | 移除 `providerMetadata.anthropic.cacheCreationInputTokens` | 移除-providermetadataanthropiccachecreationinputtokens
Google Provider | Google 提供商 | google-提供商
Renamed Types, Classes, and Functions: `GenerativeAI` Affix Removed | 类型、类与函数重命名：移除 `GenerativeAI` 词缀 | 类型类与函数重命名移除-generativeai-词缀
xAI Provider | xAI 提供商 | xai-提供商
Default Model Now Uses the Responses API | 默认模型现在使用 Responses API | 默认模型现在使用-responses-api
Migration Skill | 迁移技能 | 迁移技能
