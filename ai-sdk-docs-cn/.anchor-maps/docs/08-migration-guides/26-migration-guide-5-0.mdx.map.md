Migrate AI SDK 4.x to 5.0 | 从 AI SDK 4.x 迁移到 5.0 | migrate-ai-sdk-4x-to-50
Recommended Migration Process | 推荐的迁移流程 | 推荐的迁移流程
AI SDK 5 Migration MCP Server | AI SDK 5 迁移 MCP 服务器 | ai-sdk-5-迁移-mcp-服务器
AI SDK 5.0 Package Versions | AI SDK 5.0 包版本 | ai-sdk-50-包版本
Codemods | Codemods | codemods
AI SDK Core Changes | AI SDK Core 变更 | ai-sdk-core-变更
generateText and streamText Changes | generateText 与 streamText 变更 | generatetext-与-streamtext-变更
Maximum Output Tokens | 最大输出 token 数 | 最大输出-token-数
Message and Type System Changes | 消息与类型系统变更 | 消息与类型系统变更
Core Type Renames | 核心类型重命名 | 核心类型重命名
`CoreMessage` → `ModelMessage` | `CoreMessage` → `ModelMessage` | coremessage--modelmessage
`Message` → `UIMessage` | `Message` → `UIMessage` | message--uimessage
`convertToCoreMessages` → `convertToModelMessages` | `convertToCoreMessages` → `convertToModelMessages` | converttocoremessages--converttomodelmessages
UIMessage Changes | UIMessage 变更 | uimessage-变更
Content → Parts Array | content → parts 数组 | content--parts-数组
Data Role Removed | data 角色已移除 | data-角色已移除
UIMessage Reasoning Structure | UIMessage 推理结构 | uimessage-推理结构
Reasoning Part Property Rename | 推理部分属性重命名 | 推理部分属性重命名
File Part Changes | 文件部分（file part）变更 | 文件部分file-part变更
Stream Data Removal | Stream Data 移除 | stream-data-移除
Custom Data Streaming: writeMessageAnnotation/writeData Removed | 自定义数据流式传输：writeMessageAnnotation/writeData 已移除 | 自定义数据流式传输writemessageannotationwritedata-已移除
Provider Metadata → Provider Options | providerMetadata → providerOptions | providermetadata--provideroptions
Tool Definition Changes (parameters → inputSchema) | 工具定义变更（parameters → inputSchema） | 工具定义变更parameters--inputschema
Tool Result Content: experimental_toToolResultContent → toModelOutput | 工具结果内容：experimental_toToolResultContent → toModelOutput | 工具结果内容experimental_totoolresultcontent--tomodeloutput
Tool Property Changes (args/result → input/output) | 工具属性变更（args/result → input/output） | 工具属性变更argsresult--inputoutput
Tool Execution Error Handling | 工具执行错误处理 | 工具执行错误处理
Tool Call Streaming Now Default (toolCallStreaming Removed) | 工具调用流式传输默认开启（toolCallStreaming 已移除） | 工具调用流式传输默认开启toolcallstreaming-已移除
Tool Part Type Changes (UIMessage) | 工具部分类型变更（UIMessage） | 工具部分类型变更uimessage
Dynamic Tools Support | 动态工具支持 | 动态工具支持
New dynamicTool Helper | 新增 dynamicTool 辅助函数 | 新增-dynamictool-辅助函数
MCP Tools Without Schemas | 无 schema 的 MCP 工具 | 无-schema-的-mcp-工具
Type-Safe Handling with Mixed Tools | 混合使用工具时的类型安全处理 | 混合使用工具时的类型安全处理
New dynamic-tool UI Part | 新增 dynamic-tool UI 部分 | 新增-dynamic-tool-ui-部分
Breaking Change: Type Narrowing Required for Tool Calls and Results | 破坏性变更：工具调用与结果需要进行类型收窄 | 破坏性变更工具调用与结果需要进行类型收窄
Tool UI Part State Changes | 工具 UI 部分状态变更 | 工具-ui-部分状态变更
Rendering Tool Invocations (Catch-All Pattern) | 渲染工具调用（兜底模式） | 渲染工具调用兜底模式
Media Type Standardization | 媒体类型标准化 | 媒体类型标准化
Reasoning Support | 推理支持 | 推理支持
Reasoning Text Property Rename | 推理文本属性重命名 | 推理文本属性重命名
Generate Text Reasoning Property Changes | generateText 推理属性变更 | generatetext-推理属性变更
Continuation Steps Removal | 续写步骤移除 | 续写步骤移除
Image Generation Changes | 图像生成变更 | 图像生成变更
Step Result Changes | 步骤结果变更 | 步骤结果变更
Step Type Removal | 步骤类型移除 | 步骤类型移除
Step Control: maxSteps → stopWhen | 步骤控制：maxSteps → stopWhen | 步骤控制maxsteps--stopwhen
Usage vs Total Usage | 用量与总用量 | 用量与总用量
AI SDK UI Changes | AI SDK UI 变更 | ai-sdk-ui-变更
Package Structure Changes | 包结构变更 | 包结构变更
`@ai-sdk/rsc` Package Extraction | 拆分出 `@ai-sdk/rsc` 包 | 拆分出-ai-sdkrsc-包
React UI Hooks Moved to `@ai-sdk/react` | React UI Hook 移至 `@ai-sdk/react` | react-ui-hook-移至-ai-sdkreact
useChat Changes | useChat 变更 | usechat-变更
maxSteps Removal | maxSteps 移除 | maxsteps-移除
Initial Messages Renamed | 初始消息重命名 | 初始消息重命名
Sharing Chat Instances | 共享聊天实例 | 共享聊天实例
Chat Transport Architecture | 聊天传输架构 | 聊天传输架构
Removed Managed Input State | 移除受管输入状态 | 移除受管输入状态
Message Sending: `append` → `sendMessage` | 消息发送：`append` → `sendMessage` | 消息发送append--sendmessage
Message Regeneration: `reload` → `regenerate` | 消息重新生成：`reload` → `regenerate` | 消息重新生成reload--regenerate
onResponse Removal | onResponse 移除 | onresponse-移除
Send Extra Message Fields Default | sendExtraMessageFields 成为默认行为 | sendextramessagefields-成为默认行为
Keep Last Message on Error Removal | keepLastMessageOnError 移除 | keeplastmessageonerror-移除
Chat Request Options Changes | 聊天请求选项变更 | 聊天请求选项变更
Request Options Type Rename | RequestOptions 类型重命名 | requestoptions-类型重命名
addToolResult Renamed to addToolOutput | addToolResult 重命名为 addToolOutput | addtoolresult-重命名为-addtooloutput
Tool Result Submission Changes | 工具结果提交变更 | 工具结果提交变更
Loading State Changes | 加载状态变更 | 加载状态变更
Resume Stream Support | 恢复流支持 | 恢复流支持
Dynamic Body Values | 动态 body 值 | 动态-body-值
Usage Information | 用量信息 | 用量信息
Request Body Preparation: experimental_prepareRequestBody → prepareSendMessagesRequest | 请求体构造：experimental_prepareRequestBody → prepareSendMessagesRequest | 请求体构造experimental_preparerequestbody--preparesendmessagesrequest
`@ai-sdk/vue` Changes | `@ai-sdk/vue` 变更 | ai-sdkvue-变更
useChat Replaced with Chat Class | useChat 由 Chat 类取代 | usechat-由-chat-类取代
Message Structure Changes | 消息结构变更 | 消息结构变更
`@ai-sdk/svelte` Changes | `@ai-sdk/svelte` 变更 | ai-sdksvelte-变更
Constructor API Changes | 构造函数 API 变更 | 构造函数-api-变更
Properties Made Readonly | 属性变为只读 | 属性变为只读
Removed Managed Input | 移除受管输入 | 移除受管输入
`@ai-sdk/ui-utils` Package Removal | `@ai-sdk/ui-utils` 包移除 | ai-sdkui-utils-包移除
useCompletion Changes | useCompletion 变更 | usecompletion-变更
useAssistant Removal | useAssistant 移除 | useassistant-移除
Attachments → File Parts | 附件 → 文件部分 | 附件--文件部分
Embedding Changes | 嵌入变更 | 嵌入变更
Provider Options for Embeddings | 嵌入的提供商选项 | 嵌入的提供商选项
Raw Response → Response | rawResponse → response | rawresponse--response
Parallel Requests in embedMany | embedMany 中的并行请求 | embedmany-中的并行请求
LangChain Adapter Moved to `@ai-sdk/langchain` | LangChain Adapter 移至 `@ai-sdk/langchain` | langchain-adapter-移至-ai-sdklangchain
LlamaIndex Adapter Moved to `@ai-sdk/llamaindex` | LlamaIndex Adapter 移至 `@ai-sdk/llamaindex` | llamaindex-adapter-移至-ai-sdkllamaindex
Streaming Architecture | 流式架构 | 流式架构
Stream Protocol Changes | 流式协议变更 | 流式协议变更
Stream Protocol: Single Chunks → Start/Delta/End Pattern | 流式协议：单块 → start/delta/end 模式 | 流式协议单块--startdeltaend-模式
Reasoning Streaming Pattern | 推理流式模式 | 推理流式模式
Tool Input Streaming | 工具输入流式传输 | 工具输入流式传输
onChunk Callback Changes | onChunk 回调变更 | onchunk-回调变更
File Stream Parts Restructure | 文件流部分重构 | 文件流部分重构
Source Stream Parts Restructure | 来源流部分重构 | 来源流部分重构
Finish Event Changes | 完成事件变更 | 完成事件变更
Stream Protocol Changes（第二次出现） | 流式协议变更 | 流式协议变更-1
Proprietary Protocol -> Server-Sent Events | 专有协议 → 服务器推送事件（SSE） | 专有协议--服务器推送事件sse
Data Stream Response Helper Functions Renamed | 数据流响应辅助函数重命名 | 数据流响应辅助函数重命名
Stream Transform Function Renaming | 流转换函数重命名 | 流转换函数重命名
Error Handling: getErrorMessage → onError | 错误处理：getErrorMessage → onError | 错误处理geterrormessage--onerror
Utility Changes | 工具函数变更 | 工具函数变更
ID Generation Changes | ID 生成变更 | id-生成变更
IDGenerator → IdGenerator | IDGenerator → IdGenerator | idgenerator--idgenerator
Provider Interface Changes | 提供商接口变更 | 提供商接口变更
Language Model V2 Import | Language Model V2 导入 | language-model-v2-导入
Middleware Rename | 中间件重命名 | 中间件重命名
Usage Token Properties | 用量 token 属性 | 用量-token-属性
Stream Part Type Changes | 流部分类型变更 | 流部分类型变更
Raw Response → Response（第二次出现） | rawResponse → response | rawresponse--response-1
`wrapLanguageModel` now stable | `wrapLanguageModel` 现已稳定 | wraplanguagemodel-现已稳定
`activeTools` No Longer Experimental | `activeTools` 不再是实验性功能 | activetools-不再是实验性功能
`prepareStep` No Longer Experimental | `prepareStep` 不再是实验性功能 | preparestep-不再是实验性功能
Temperature Default Removal | 移除 temperature 默认值 | 移除-temperature-默认值
Message Persistence Changes | 消息持久化变更 | 消息持久化变更
Message ID Generation | 消息 ID 生成 | 消息-id-生成
Using createUIMessageStream | 使用 createUIMessageStream | 使用-createuimessagestream
Provider & Model Changes | 提供商与模型变更 | 提供商与模型变更
OpenAI | OpenAI | openai
Default Provider Instance Uses Responses API | 默认提供商实例使用 Responses API | 默认提供商实例使用-responses-api
Strict Schemas (`strictSchemas`) with Responses API | Responses API 的严格 schema（strictSchemas） | responses-api-的严格-schemastrictschemas
Structured Outputs | 结构化输出 | 结构化输出
Compatibility Option Removal | compatibility 选项移除 | compatibility-选项移除
Legacy Function Calls Removal | 旧式函数调用移除 | 旧式函数调用移除
Simulate Streaming | 模拟流式 | 模拟流式
Google | Google | google
Search Grounding is now a provider defined tool | 搜索溯源现为提供商定义的工具 | 搜索溯源现为提供商定义的工具
Amazon Bedrock | Amazon Bedrock | amazon-bedrock
Snake Case → Camel Case | 蛇形命名 → 驼峰命名 | 蛇形命名--驼峰命名
Provider-Utils Changes | Provider-Utils 变更 | provider-utils-变更
Troubleshooting | 故障排查 | 故障排查
TypeScript Performance Issues with Zod | Zod 引发的 TypeScript 性能问题 | zod-引发的-typescript-性能问题
Codemod Table | Codemod 对照表 | codemod-对照表
Changes Between v5 Beta Versions | v5 Beta 版本之间的变更 | v5-beta-版本之间的变更
fullStream Type Rename: text/reasoning → text-delta/reasoning-delta | fullStream 类型重命名：text/reasoning → text-delta/reasoning-delta | fullstream-类型重命名textreasoning--text-deltareasoning-delta
