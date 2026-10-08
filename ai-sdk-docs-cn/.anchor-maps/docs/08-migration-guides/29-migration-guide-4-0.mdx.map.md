Recommended Migration Process | 推荐迁移流程 | 推荐迁移流程
AI SDK 4.0 package versions | AI SDK 4.0 包版本 | ai-sdk-40-包版本
Codemods | Codemods | codemods
Provider Changes | 提供商变更 | 提供商变更
Removed `baseUrl` option | 移除 `baseUrl` 选项 | 移除-baseurl-选项
Anthropic Provider | Anthropic 提供商 | anthropic-提供商
Removed `Anthropic` facade | 移除 `Anthropic` 门面 | 移除-anthropic-门面
Removed `topK` setting | 移除 `topK` 设置 | 移除-topk-设置
Google Generative AI Provider | Google Generative AI 提供商 | google-generative-ai-提供商
Removed `Google` facade | 移除 `Google` 门面 | 移除-google-门面
Google Vertex Provider | Google Vertex 提供商 | google-vertex-提供商
Mistral Provider | Mistral 提供商 | mistral-提供商
Removed `Mistral` facade | 移除 `Mistral` 门面 | 移除-mistral-门面
OpenAI Provider | OpenAI 提供商 | openai-提供商
Removed `OpenAI` facade | 移除 `OpenAI` 门面 | 移除-openai-门面
LangChain Adapter | LangChain 适配器 | langchain-适配器
Removed `toAIStream` | 移除 `toAIStream` | 移除-toaistream
AI SDK Core Changes | AI SDK Core 变更 | ai-sdk-core-变更
`streamText` returns immediately | `streamText` 立即返回 | streamtext-立即返回
`streamObject` returns immediately | `streamObject` 立即返回 | streamobject-立即返回
Remove roundtrips | 移除 roundtrips | 移除-roundtrips
Removed `nanoid` export | 移除 `nanoid` 导出 | 移除-nanoid-导出
Increased default size of generated IDs | 生成的 ID 默认长度增大 | 生成的-id-默认长度增大
Removed `ExperimentalMessage` types | 移除 `ExperimentalMessage` 类型 | 移除-experimentalmessage-类型
Removed `ExperimentalTool` type | 移除 `ExperimentalTool` 类型 | 移除-experimentaltool-类型
Removed experimental AI function exports | 移除实验性 AI 函数导出 | 移除实验性-ai-函数导出
Removed AI-stream related methods from `streamText` | 从 `streamText` 移除 AI 流相关方法 | 从-streamtext-移除-ai-流相关方法
Renamed "formatStreamPart" to "formatDataStreamPart" | `formatStreamPart` 更名为 `formatDataStreamPart` | formatstreampart-更名为-formatdatastreampart
Renamed "parseStreamPart" to "parseDataStreamPart" | `parseStreamPart` 更名为 `parseDataStreamPart` | parsestreampart-更名为-parsedatastreampart
Renamed `TokenUsage`, `CompletionTokenUsage` and `EmbeddingTokenUsage` types | `TokenUsage`、`CompletionTokenUsage` 与 `EmbeddingTokenUsage` 类型更名 | tokenusagecompletiontokenusage-与-embeddingtokenusage-类型更名
Removed deprecated telemetry data | 移除已弃用的遥测数据 | 移除已弃用的遥测数据
Provider Registry | 提供商注册表 | 提供商注册表
Removed experimental_Provider, experimental_ProviderRegistry, and experimental_ModelRegistry | 移除 experimental_Provider、experimental_ProviderRegistry 和 experimental_ModelRegistry | 移除-experimental_providerexperimental_providerregistry-和-experimental_modelregistry
Removed `experimental_createModelRegistry` function | 移除 `experimental_createModelRegistry` 函数 | 移除-experimental_createmodelregistry-函数
Removed `rawResponse` from results | 从结果中移除 `rawResponse` | 从结果中移除-rawresponse
Removed `init` option from `pipeDataStreamToResponse` and `toDataStreamResponse` | 从 `pipeDataStreamToResponse` 和 `toDataStreamResponse` 移除 `init` 选项 | 从-pipedatastreamtoresponse-和-todatastreamresponse-移除-init-选项
Removed `responseMessages` from `generateText` and `streamText` | 从 `generateText` 和 `streamText` 移除 `responseMessages` | 从-generatetext-和-streamtext-移除-responsemessages
Removed `experimental_continuationSteps` option | 移除 `experimental_continuationSteps` 选项 | 移除-experimental_continuationsteps-选项
Removed `LanguageModelResponseMetadataWithHeaders` type | 移除 `LanguageModelResponseMetadataWithHeaders` 类型 | 移除-languagemodelresponsemetadatawithheaders-类型
Changed `streamText` warnings result to Promise | `streamText` 的 warnings 结果改为 Promise | streamtext-的-warnings-结果改为-promise
Changed `streamObject` warnings result to Promise | `streamObject` 的 warnings 结果改为 Promise | streamobject-的-warnings-结果改为-promise
Renamed `simulateReadableStream` `values` to `chunks` | `simulateReadableStream` 的 `values` 更名为 `chunks` | simulatereadablestream-的-values-更名为-chunks
AI SDK RSC Changes | AI SDK RSC 变更 | ai-sdk-rsc-变更
Removed `render` function | 移除 `render` 函数 | 移除-render-函数
AI SDK UI Changes | AI SDK UI 变更 | ai-sdk-ui-变更
Removed Svelte, Vue, and SolidJS exports | 移除 Svelte、Vue 和 SolidJS 导出 | 移除-sveltevue-和-solidjs-导出
Removed `experimental_StreamData` | 移除 `experimental_StreamData` | 移除-experimental_streamdata
`useChat` hook | `useChat` Hook | usechat-hook
Removed `streamMode` setting | 移除 `streamMode` 设置 | 移除-streammode-设置
Replaced roundtrip setting with `maxSteps` | 用 `maxSteps` 取代 roundtrip 设置 | 用-maxsteps-取代-roundtrip-设置
Removed `options` setting | 移除 `options` 设置 | 移除-options-设置
Removed `experimental_addToolResult` method | 移除 `experimental_addToolResult` 方法 | 移除-experimental_addtoolresult-方法
Changed default value of `keepLastMessageOnError` to true and deprecated the option | `keepLastMessageOnError` 默认值改为 true 并弃用该选项 | keeplastmessageonerror-默认值改为-true-并弃用该选项
`useCompletion` hook | `useCompletion` Hook | usecompletion-hook
`useAssistant` hook | `useAssistant` Hook | useassistant-hook
Removed `experimental_useAssistant` export | 移除 `experimental_useAssistant` 导出 | 移除-experimental_useassistant-导出
Removed `threadId` and `messageId` from `AssistantResponse` | 从 `AssistantResponse` 移除 `threadId` 和 `messageId` | 从-assistantresponse-移除-threadid-和-messageid
Removed `experimental_AssistantResponse` export | 移除 `experimental_AssistantResponse` 导出 | 移除-experimental_assistantresponse-导出
`experimental_useObject` hook | `experimental_useObject` Hook | experimental_useobject-hook
AI SDK Errors | AI SDK 错误 | ai-sdk-错误
Removed `isXXXError` static methods | 移除 `isXXXError` 静态方法 | 移除-isxxxerror-静态方法
Removed `toJSON` method | 移除 `toJSON` 方法 | 移除-tojson-方法
AI SDK 2.x Legacy Changes | AI SDK 2.x 旧版变更 | ai-sdk-2x-旧版变更
Removed 2.x legacy providers | 移除 2.x 旧版提供商 | 移除-2x-旧版提供商
Removed 2.x legacy function and tool calling | 移除 2.x 旧版函数与工具调用 | 移除-2x-旧版函数与工具调用
Removed 2.x prompt helpers | 移除 2.x 提示词辅助函数 | 移除-2x-提示词辅助函数
Removed 2.x `AIStream` | 移除 2.x 的 `AIStream` | 移除-2x-的-aistream
Removed 2.x `StreamingTextResponse` | 移除 2.x 的 `StreamingTextResponse` | 移除-2x-的-streamingtextresponse
Removed 2.x `streamToResponse` | 移除 2.x 的 `streamToResponse` | 移除-2x-的-streamtoresponse
Removed 2.x RSC `Tokens` streaming | 移除 2.x 的 RSC `Tokens` 流式传输 | 移除-2x-的-rsc-tokens-流式传输
Codemod Table | Codemod 对照表 | codemod-对照表
