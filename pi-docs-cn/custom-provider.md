# 自定义提供商

提供商（provider）扩展把 Pi 接入需要自定义身份验证、模型发现、请求处理或流式（streaming）传输的模型服务。如果该服务已经兼容受支持的 API，请在 `models.json` 中配置即可。

提供商扩展在 Pi 内部运行，能检查凭据、提示词、工具定义、模型响应和用量。请将其视为受信任的代码，并避免把密钥或提供商载荷写入日志。

## 选择最小的集成方案

| 需求 | 方案 |
|---|---|
| 在受支持的 API 之后添加模型 | [`models.json`](models.md#%E9%85%8D%E7%BD%AE%E5%85%BC%E5%AE%B9%E7%AB%AF%E7%82%B9) |
| 更改现有提供商的端点或请求头 | `models.json` 或一个小型提供商扩展 |
| 动态发现模型 | 带 `refreshModels` 的提供商 |
| 添加 `/login` 流程 | 带原生或旧式 OAuth 配置的提供商 |
| 实现不受支持的线上协议 | 带 `stream` 或 `streamSimple` 的提供商 |

提供商扩展是一种[扩展](extensions.md)，因此遵循相同的加载、信任、重新加载和错误行为。

## 注册提供商

在扩展工厂函数中调用 `pi.registerProvider()`。Pi 会等待异步工厂函数完成后再继续启动，因此在其中注册的提供商可用于启动时的模型选择和 `pi --list-models`。

注册形式有两种：

- 注册来自 `@earendil-works/pi-ai` 的完整 `Provider`，获得原生的身份验证、过滤、发现、刷新和流式行为。
- 用 `ProviderConfig` 注册提供商名称，这是现有扩展使用的旧式配置形式。

新集成若不只是静态端点和模型元数据，应优先选择完整的提供商。Pi 会在已注册的原生提供商之上叠加 `models.json` 覆盖项。

为现有提供商只注册 `baseUrl` 或 `headers` 会保留其内置模型。在旧式形式中提供 `models` 会替换该提供商在聊天、图像和分类器操作下的全部模型。省略 `type` 即视为 `"chat"`；图像和分类器模型需要显式的判别字段，以及按其 `api` 值通过 `images` 和 `classifiers` 字段键入的实现。

例如，混合操作的提供商可以一次性注册非聊天模型及其实现：

```typescript
pi.registerProvider("media-tools", {
  apiKey: "$MEDIA_TOOLS_API_KEY",
  models: [
    {
      type: "image",
      id: "image-v1",
      name: "Image V1",
      api: "media-images",
      baseUrl: "https://media.example.com/v1",
      input: ["text"],
      output: ["image"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    {
      type: "classifier",
      id: "classifier-v1",
      name: "Classifier V1",
      api: "media-classifier",
      baseUrl: "https://media.example.com/v1",
      input: ["text"],
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      contextWindow: 64000,
    },
  ],
  images: {
    "media-images": { generateImages: async (model, context, options) => result },
  },
  classifiers: {
    "media-classifier": { classify: async (model, context, options) => result },
  },
});
```

模型级 `baseUrl` 优先于提供商端点。若未提供 `models` 列表，所有操作的内置模型保持注册状态。不同操作中相同的模型 ID 彼此独立，包括其模型专属请求头。

初始扩展加载之后发出的调用立即生效。使用 `pi.unregisterProvider()` 移除动态提供商，并恢复其替换掉的内置行为。

完整的注册示例——把流式处理委托给内置 API 实现——见已提交的 [GitLab Duo 提供商](../examples/extensions/custom-provider-gitlab-duo/)。

## 提供身份验证

静态提供商可以从字面量、环境变量插值或命令中解析 API 密钥（API key）。这些值的语法与 `models.json` 相同：

- `$NAME` 和 `${NAME}` 读取环境变量。
- 前缀 `!command` 使用命令输出。
- `$$` 输出字面量 `$`。
- `$!` 输出字面量的前导 `!`。

当集成需要存储凭据、自定义解析、提供商专属环境或多种登录方式时，请使用原生提供商身份验证。

OAuth 提供商提供显示名称、登录流程、令牌刷新和访问令牌解析。注册后它会出现在 `/login` 中，Pi 会把返回的凭据存入 `~/.pi/agent/auth.json`。

OAuth 回调与 UI 无关。它们可以打开授权 URL、显示设备码、报告进度、请求输入，或请用户选择登录方式。网络请求期间要尊重取消操作和给定的中止信号。

绝不要把访问令牌、刷新令牌、授权请求头或完整的提供商响应写入普通日志。

## 提供与刷新模型

每个模型都需要 ID、显示名称、输入能力和成本元数据。聊天和分类器模型还需要上下文窗口；聊天模型需要输出上限和思考支持；图像模型要声明其输出模态。除非某个模型需要单独覆盖，否则在提供商层级选定 API 实现。

当 Pi 应当为空闲的提示词缓存保温时，把 `promptCache.short` 或 `promptCache.long` 设为该提供商尽力而为的缓存生存秒数。留空即对相应保留层级禁用缓存保温。

兼容性标志描述的是某个本已受支持的 API 中经过验证的差异。不要仅凭端点自称兼容就启用它们。

请对照实际服务器确认请求字段和响应行为。

当可用目录来自在线服务时，使用 `refreshModels`。把 `context.signal` 传给阻塞式 I/O，让调用方能取消刷新。

两种注册形式的刷新契约不同：

- 完整的 `Provider` 不返回值。它调用 `context.publish({ update })` 来安装提供商自有的模型状态，此后其同步的 `getModels()` 暴露最新列表。
- 旧式 `ProviderConfig.refreshModels` 返回混合操作的模型定义。Pi 用返回的列表替换该注册的现行模型，并按要求执行持久化。

只有当目录数据需要跨运行保留时才发布持久化数据。llama.cpp 这类在线服务可以只更新内存中的列表而不持久化；远程目录则可以保留快照用于离线启动。

## 复用受支持的流式 API

只要提供商协议与 Pi AI 的某个 API 实现匹配，就使用它。

受支持的实现涵盖 Anthropic Messages、OpenAI Chat Completions 和 Responses、Google Generative AI 和 Vertex、Azure OpenAI Responses、Mistral Conversations 以及 Bedrock Converse。

提供商仍可自定义身份验证、基础 URL、请求头、模型过滤和发现，同时把请求转换和流式处理委托给现有 API 实现。

这比照抄一个流式实现更安全，因为它保留了 Pi 的消息转换、工具处理、用量核算、取消和兼容性行为。

## 实现自定义流式处理

只有当现有 API 实现都无法表达该服务时才实现 `streamSimple`。先研究 [`packages/ai/src/api`](https://github.com/earendil-works/pi/tree/main/packages/ai/src/api) 下的实现。

流接收的是归一化的 `TranscriptContext`。系统提示词和工具声明位于转录的系统消息中，因此请用 `getCurrentSystemPrompt(context.messages)` 和 `getCurrentTools(context.messages)` 读取它们，而不要指望 `context.systemPrompt` 或 `context.tools`。支持会话中途系统消息的模型可以原位接收；否则调用 `collapseSystemMessages(context)` 把后面的系统消息折叠进开头那条。

自定义流必须：

1. 创建一条助手消息，包含提供商、模型、时间戳、待定停止原因、内容和清零的用量。
2. 请求设置成功后，在内容事件之前发出一个 `start` 事件。
3. 在发出配平的文本、思考和工具调用事件的同时更新消息。
4. 定稿用量、成本、内容和停止原因。
5. 恰好发出一个终结性的 `done` 或 `error` 事件，并关闭流。
6. 把取消转换为中止结果。

请求设置可能在 `start` 之前失败；此时流可以直接以 `error` 终止。请求缺少身份验证时，也可能在流返回之前同步抛出异常。

内容索引指向助手消息中的块。在发出 `partial` 字段暴露该状态的事件之前先更新对应块。到 `toolcall_end` 时，工具调用参数必须包含有效的已解析输入。

流还必须遵守通过 `SimpleStreamOptions` 提供的请求插桩：

- 发送提供商请求前调用 `options.onPayload`，并使用它返回的替换载荷（如有）。
- 收到响应之后、消费其主体之前调用 `options.onResponse`。
- 对每个已解析的提供商事件，在归一化之前 await `options.onProviderStreamEvent?.(providerEvent, model)`。
- 透传中止信号和提供商专属环境。

这些钩子支撑扩展的请求检查、响应头事件和提供商流观察。省略它们会让该提供商的行为偏离 Pi 的内置提供商。

## 上报失败与用量

设置一个明确的终结停止原因。错误和中止消息需要 `errorMessage`；成功消息需要准确的输入、输出、缓存、总 token 数和成本值。

对于已识别的上下文溢出错误，Pi 可以压缩并重试。如果该服务使用未知消息，请在带防护的 `message_end` 处理器中，仅把该提供商的溢出响应归一化为 `context_length_exceeded`。

不要把限流或提供商瞬时故障改写成上下文溢出。这些失败应走 Pi 的常规重试（retry）行为。

## 测试集成

至少测试：

- 普通与空文本响应
- 工具调用与工具结果
- 受支持时的图像输入和图像工具结果
- 用量与成本核算
- 中止行为
- 上下文溢出
- 畸形或不完整的流
- Unicode 边界
- 跨提供商的会话交接
- 身份验证刷新与取消

[`packages/ai/test`](https://github.com/earendil-works/pi/tree/main/packages/ai/test) 下的提供商测试定义了内置提供商应有的行为。请改编相关测试套件，不要只依赖手动提示词验证。

开发期间直接运行该扩展，之后移入可被发现的扩展目录，或通过 [Pi 包](packages.md)分发。在活动会话中修改了可发现的提供商扩展后，使用 `/reload`。
