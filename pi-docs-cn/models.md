# 选择模型

对于内置提供商，先用 `/login`，再用 `/model` 选择模型。只有当 Pi 尚未包含你需要的提供商或端点时，才使用自定义模型配置。

## 选择连接方式

| 你手头的资源 | 推荐做法 |
|---|---|
| 受支持的订阅 | 通过 `/login` 登录 |
| 提供商的 API 密钥 | 通过 `/login` 保存，或设置对应的环境变量 |
| 本地 GGUF 模型 | 将 Pi 连接到 llama.cpp 路由器 |
| OpenAI、Anthropic 或 Google 兼容的端点 | 添加到 `models.json` |
| 使用自定义协议或认证流程的提供商 | 编写或安装提供商扩展 |

浏览[模型目录](https://pi.dev/models)可查看最新的提供商、模型 ID、能力、上下文上限与定价。Pi 以内置目录起步，并可用来自 pi.dev 的更新目录数据叠加覆盖。缓存的目录数据在离线时仍然可用；运行 `pi update --models` 可强制刷新。

## 身份认证

运行 `/login` 并选择一个提供商。Pi 将凭据保存在 [`auth.json`](configuration.md#agent-directory) 中。运行 `/logout` 可移除某提供商已保存的凭据。

你也可以改为通过提供商的环境变量提供 API 密钥。这在 CI 等不希望 Pi 写入凭据的环境中很有用。[提供商](providers.md)列出了这些变量及各提供商的专属设置。

当配置了多个凭据来源时，Pi 优先使用运行时的 `--api-key`，其次是已保存的 `auth.json` 凭据、`models.json` 中的 `apiKey`，最后才是提供商的环境变量或云环境的隐式凭据。提供商扩展可以定义自己的认证行为。

请妥善保管 `auth.json` 与任何凭据命令，不要外泄。在你信任某个项目后，其项目设置和扩展可以在 Pi 进程内执行。从不受信任的目录加载配置前，请先阅读[安全](security.md)。

## 选定模型

运行 `/model` 搜索可用模型。选择器只显示其提供商具备可用认证的模型。在某个模型上按 `Ctrl+S` 可将其保存为新会话的默认模型。

运行 `/thinking` 为当前模型选择思考级别。在其中按 `Ctrl+S` 可保存启动时的级别。Pi 会将选项限制为所选模型支持的级别。

`Ctrl+P` 可在可用模型间循环切换。使用 `/scoped-models` 可控制这组循环并保存所选范围，或通过[设置](settings.md#model-cycling)配置模型匹配模式。

会话会记录模型与思考级别的变更。恢复该会话时会还原这些设置，且不影响新会话的默认值。

## 连接本地模型

Pi 与 llama.cpp 路由器直接集成。该路由器会发现 GGUF 文件并按需加载模型。Pi 的 `/llama` 命令负责管理路由器，`/model` 则从其已加载的模型中选择。

服务器启动、模型存放位置、下载与连接故障排查，参见[使用 llama.cpp 的本地模型](llama-cpp.md)。

对于 Ollama、LM Studio、vLLM、SGLang 及其他兼容服务器，可在 `models.json` 中[配置兼容端点](#configure-a-compatible-endpoint)。

## 配置兼容端点

当端点使用 Pi 已支持的 API 时，使用 [`models.json`](configuration.md#agent-directory)。这涵盖了大多数 Ollama、LM Studio、vLLM、SGLang 与代理部署。

```json
{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434/v1",
      "api": "openai-completions",
      "apiKey": "ollama",
      "models": [
        { "id": "qwen2.5-coder:7b" }
      ]
    }
  }
}
```

这个占位密钥可让 Pi 识别该模型；Ollama 会忽略它。对于需要认证的端点，`apiKey` 与请求头的值可以使用 `$NAME` 或 `${NAME}` 环境变量插值、字面值，或以 `!command` 开头的命令。`models.json` 中的命令在请求时运行，Pi 不会缓存其结果。

打开 `/model` 时会重新加载该文件。`models` 条目会在该提供商下新增或替换同 ID 的模型。使用 `modelOverrides` 可修改现有内置模型或扩展提供模型的元数据，而无需替换该提供商的模型列表。未知的覆盖 ID 会被忽略。

### 描述模型输入与缓存

使用 `inputLimits.images.resize` 控制 Pi 在将新图片附件、`read` 结果和工具结果中的图片存入对话历史之前如何编码：

```json
{
  "id": "vision-model",
  "input": ["text", "image"],
  "inputLimits": {
    "images": {
      "resize": {
        "maxWidth": 1568,
        "maxHeight": 1568,
        "maxBytes": 524288,
        "jpegQuality": 75
      }
    }
  }
}
```

`maxBytes` 限制 base64 编码后的负载。省略的缩放字段采用保守默认值：2000×2000 像素、编码后 4.5 MiB、JPEG 质量 80。图片只编码一次；更换模型不会重写历史图片。目录还可通过 `inputLimits.maxRequestBytes`、`images.maxPerMessage` 与 `images.maxPerRequest` 描述硬性请求限制，但 Pi 尚不会据此重写或拒绝历史内容。

<a id="prompt-cache-lifetimes"></a>

使用 `promptCache` 以秒为单位声明提供商对 `short` 或 `long` 保留层级的尽力而为的缓存存活时间：

```json
{ "id": "claude-sonnet-5", "promptCache": { "short": 300, "long": 3600 } }
```

若官方公布了取值区间，请取其中保守的一端。当前层级没有缓存存活时间的模型不参与缓存预热。`modelOverrides` 条目可为内置或扩展模型设置 `inputLimits` 或 `promptCache`，包括通过已验证代理访问的模型。参见 [`cacheWarming`](settings.md#model-and-thinking)。

### 按思考级别配置采样参数

OpenAI 兼容 API 支持自由格式的 `samplingParams` 模型默认值，以及 `samplingParamsByThinkingLevel` 覆盖项。后者使用 Pi 的思考级别键（`off`、`minimal`、`low`、`medium`、`high`、`xhigh` 与 `max`），而非 `thinkingLevelMap` 中提供商自己的取值：

```json
{
  "id": "qwen-thinking-model",
  "reasoning": true,
  "samplingParams": {
    "temperature": 1.0,
    "top_p": 0.95
  },
  "samplingParamsByThinkingLevel": {
    "off": {
      "temperature": 0.7,
      "top_p": 0.8
    },
    "high": {
      "top_k": 20
    }
  }
}
```

Pi 会先收敛不受支持的思考级别，然后按顺序合并模型级 `samplingParams`、生效级别的覆盖项与请求级 `samplingParams`。同一键以后合并的值优先。缺失的级别继承模型默认值。`modelOverrides` 会按键将各级别条目与基础模型合并。这些字段仅适用于 `openai-completions`、`openai-responses` 与 `azure-openai-responses`；其他 API 会忽略它们。

兼容性设置应当描述经过验证的、端点在请求或响应行为上的差异。不要仅凭端点自称兼容 OpenAI 或 Anthropic 就启用它们。

## 使用分类模型

分类模型不进行对话。它们回答关于 JSON 状态的类型化问题：从多个选项中挑一个、回答是或否，或给出评分，每种答案都附带概率。Pi 内置了以下模型：来自这些提供商的 TypeSafe Jev 模型、来自 Workers AI 的 Cloudflare Clef 与 Clef Flash 模型，以及通过 [Decisions API](https://developers.openai.com/api/docs/guides/decisions) 提供的 OpenAI GPT-6 Luna：

| 提供商 | 模型 ID | 认证 |
|---|---|---|
| `typesafe` | `jev-latest` | `TYPESAFE_API_KEY` |
| `openrouter` | `typesafe/jev-1.13`, `~typesafe/jev-latest` | `OPENROUTER_API_KEY` 或 `/login` |
| `cloudflare-workers-ai` | `typesafe/jev`, `@cf/cloudflare/clef`, `@cf/cloudflare/clef-flash` | `CLOUDFLARE_API_KEY` 与 `CLOUDFLARE_ACCOUNT_ID` |
| `vercel-ai-gateway` | `typesafe-ai/jev` | `AI_GATEWAY_API_KEY` |
| `opencode` | `jev-1.13`, `jev-1.13-free` | `OPENCODE_API_KEY` |
| `openai` | `gpt-6-luna` | `OPENAI_API_KEY` |

[llama.cpp 路由器](llama-cpp.md#classification)上的对话模型也会被列为分类模型。

OpenAI 的 Decisions API 需要 API 密钥。ChatGPT 凭据登录对它无效，因此当 `openai` 已通过 `/login` 登录时，即使设置了 `OPENAI_API_KEY`，`gpt-6-luna` 也不会被列为可用；此时请退出 `openai` 登录以使用密钥。GPT-6 Luna 还能评判通过 `images` 传入的图片（参见 [Codemode](codemode.md#classify)）；其他分类模型遇到图片会返回错误。该 API 会拒绝超过 922K token 的输入，而运行超过约五秒的请求（目前约相当于 600K 输入 token 以上）会以网关超时失败。

分类模型不会出现在 `/model` 中。模型通过 [`codemode`](cli.md#enable-codemode) 工具访问它们；该工具默认关闭，除非某个 MCP 服务器开启了它。可在[设置](settings.md#tools)中用 `"defaultTools": ["+codemode"]` 启用。之后脚本即可用 `models.getAvailableOfType("classifier")` 列出分类模型，并调用 `models.classify(model, { state, questions })`：

```js
const jev = await models.getModelOfType("classifier", "typesafe", "jev-latest");
const result = await models.classify(jev, {
  state: { message: "The change works, thanks." },
  questions: {
    approved: {
      type: "bool",
      instructions: "Does the user approve of the result?",
      criteria: { true: "Approval", false: "No approval" },
    },
  },
});
return result.answers;
```

问题与答案的类型说明见 [Codemode](codemode.md#classify)。

当服务上报 token 计数时（所有 System One 服务都会），`result.usage` 会连同费用一起携带这些计数。Pi 会把脚本中分类调用的用量计入 `codemode` 工具结果，因此会累计到底部状态栏与 `/session` 显示的会话费用中。费用按模型在目录中的定价计算；没有目录定价的模型（如 TypeSafe 直连的 `jev-latest`）会上报 token 但不计费。

扩展可不经 codemode，直接通过 `ctx.modelRegistry.classify()` 调用分类器。[虚拟模型](virtual-models.md#route-requests)可以利用它们路由请求；参见 `jev-router.ts` 示例。

## 使用图像模型

图像模型根据提示词与可选的输入图片生成图像。Pi 将 OpenRouter 的图像模型（如 `google/gemini-2.5-flash-image` 与 `black-forest-labs/flux.2-pro`）列在 `openrouter` 提供商下；它们与其对话模型使用相同的 `OPENROUTER_API_KEY` 或 `/login` 凭据。

与分类模型一样，图像模型也不出现在 `/model` 中；模型通过 [`codemode`](cli.md#enable-codemode) 工具访问它们。脚本用 `models.getAvailableOfType("image")` 列出它们，并调用 `models.generateImages(model, { input })`。结果的 `output` 保存 base64 图片块，`image()` 会把它们附加到 `codemode` 结果上，使模型能看到：

```js
const painter = await models.getModelOfType("image", "openrouter", "google/gemini-2.5-flash-image");
const result = await models.generateImages(painter, {
  input: [{ type: "text", text: "A red fox in the snow, watercolor" }],
});
if (result.stopReason !== "stop") return result.errorMessage;
for (const block of result.output) if (block.type === "image") image(block);
```

`input` 也可以包含 `{ type: "image", data, mimeType }` 块，用于编辑或作为参考图。与分类调用一样，Pi 会把脚本中图像调用的用量计入 `codemode` 工具结果。生成的图片不会写入磁盘。完整 API 见 [Codemode](codemode.md#generate-images)。

扩展可不经 codemode，直接通过 `ctx.modelRegistry.generateImages()` 生成图像。

## 添加自定义提供商

当提供商需要自定义流式传输、模型发现或认证行为时，请使用扩展。扩展工作流参见[自定义提供商](custom-provider.md)。

## 故障排查

### 模型不出现在列表中

确认该提供商具备可用的认证。自定义模型可以从 `models.json` 加载，但在 Pi 能解析出凭据之前，`/model` 中仍不可选。对于 llama.cpp，只有路由器当前已加载的模型才会出现。

### 认证仅在一个 shell 中生效

检查密钥是否来自环境变量而非 `auth.json`。环境变量必须存在于启动 Pi 的进程中。

### 在远程机器上登录时打开了浏览器

在提供商支持时，改用其无头（headless）认证流程完成登录。部分提供商允许你把最终的重定向 URL 或授权码粘贴回 Pi。参见[交互式认证](providers.md#authenticate-interactively)。

### 兼容端点拒绝请求

检查 `models.json` 中它的 API 类型与兼容性设置。上游服务器必须支持相应的请求字段与行为。
