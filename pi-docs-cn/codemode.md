---
title: "Codemode"
---

`codemode` 工具让模型编写一段 JavaScript 脚本，用于调用 pi 的其他工具并运行非 LLM 模型，例如分类模型和图像模型。只有脚本的输出会到达模型，因此脚本可以并行执行调用，并在模型看到结果之前过滤大量数据。开启方法参见[启用 codemode](cli#%E5%90%AF%E7%94%A8-codemode)。

## 脚本

工具输入是原始 JavaScript 源码，不是 JSON，也不是 markdown 代码围栏。它作为 async 函数的函数体在 QuickJS 沙箱中运行，因此顶层 `await` 和 `return` 都可用。沙箱没有 Node API、文件系统、网络或计时器；脚本只能通过工具和 `models` 与外部世界交互。

脚本可以以一行选项开头：

```js
// @options: {"max_output_tokens": 2000, "timeout_ms": 60000}
```

- `max_output_tokens`（默认 10000）限制输出长度。超长输出会保留开头和结尾，完整文本写入一个临时文件，其路径包含在结果中。当输出的文本与 base64 图片数据合计超过 16777216 字符，或 `text()`、`image()`、`console` 调用合计超过 100000 次时，脚本会失败；大数据请改用工具写入文件。
- `timeout_ms` 是整个脚本的硬性截止时间。默认不设置。图像生成可能耗时数分钟，因此不要为生成图片的脚本设置过短的截止时间。

结果以 `Script completed` 或 `Script failed` 开头，后跟实际耗时和输出。文本与图片条目按顺序出现，各占一行。当输出包含多个文本条目（来自 `text()` 或 `return`）时，每个条目以一行 `==> text N/M <==` 开头。`console` 调用随后集中在一个 `<console_output>` 块中，每次调用一行。失败的脚本会保留已有输出，其后是 `Script error:` 和错误信息。工具调用是真实生效的：失败前已发起的调用不会被撤销。脚本结束时仍在运行的调用会被取消，未被 await 的 promise 会被丢弃。

## 全局对象

| 全局对象 | 用途 |
|---|---|
| `tools.<name>(args)` | 调用一个工具。参见[调用工具](#%E8%B0%83%E7%94%A8%E5%B7%A5%E5%85%B7)。 |
| `text(value)` | 向输出添加一个文本条目。字符串原样添加，其他值以 JSON 添加。 |
| `image(value)` | 向输出添加一张图片：base64 `data:` URL、`{ image_url }` 对象，或图片块 `{ type: "image", data, mimeType }`（例如 MCP 工具和 `models.generateImages()` 返回的那种）。不支持远程 URL。接受 PNG、JPEG、GIF 和 WebP。每张图片还会保存到临时文件，结果中会在图片之前标出该路径。 |
| `console.log(...)` | 在其他输出之后向 `<console_output>` 块添加一行。参数以空格连接；`info`、`warn`、`error` 和 `debug` 行为相同。 |
| `return value` | 顶层 `return` 会像 `text()` 一样添加该值。 |
| `exit()` | 成功结束脚本。 |
| `store(key, value)` / `load(key)` | 在多次 `codemode` 调用之间保存小型 JSON 值。参见[存储值](#%E5%AD%98%E5%82%A8%E5%80%BC)。 |
| `ALL_TOOLS` | 所有可调用的工具，形式为 `{ name, description }`，包括描述中未列出的工具。 |
| `searchTools(query, { limit?, namespace? })` | 按相关性对可调用工具排序（BM25，默认 limit 8）。解析为 `{ name, description }[]`。 |
| `describeTool(name)` | 解析为某工具的描述与 TypeScript 声明，或 `undefined`。 |
| `describeNamespace(name)` | 解析为某个命名空间（例如 MCP 服务器）的 `{ name, description?, instructions?, tools }`，或 `undefined`。 |
| `models` | 列出并运行非 LLM 模型。参见[模型](#%E6%A8%A1%E5%9E%8B)。 |

## 调用工具

会话可调用的每个工具都是 `tools` 的一个方法，以工具标识符命名：JavaScript 标识符中不合法的字符会变成 `_`，因此 MCP 工具 `mcp__dev-radius__search` 对应 `tools.mcp__dev_radius__search`。每个方法接受一个对象，包含该工具的参数。

调用解析出的结果取决于工具：

- 带输出 schema 的工具解析为结构化的值。`bash` 解析为 `{ output, truncated, full_output_path?, exit_code, wall_time_seconds }`，非零退出码时也是如此。它的 `output` 不受模型可见的 2000 行或 50KB 限制：最多容纳 1 MiB；更长的输出会保留开头和结尾各 512 KiB，中间以省略标记衔接，并置位 `truncated`，完整输出存于 `full_output_path`。
- MCP 工具解析为其 `CallToolResult`，包括 `isError` 和 `structuredContent`。
- `read` 解析为文件的文本；对图片则解析为图片块 `{ type: "image", data, mimeType, note }`，可交给 `image()` 显示。`data` 是模型会看到的 base64 图片，`note` 是随附的文字，例如缩放提示。
- 其他工具（例如 `edit` 和 `write`）解析为其文本输出。

失败、被阻止或参数非法的调用会 reject 一个携带该工具错误文本的 `Error`。用 `Promise.allSettled()` 可以保留成功调用的结果。

`codemode` 的描述会按命名空间（例如单个 MCP 服务器）分组，列出工具及其 TypeScript 声明。`deferred` 暴露方式的工具不在列，其中包括采用默认 `codemode` 暴露方式的 MCP 工具，因此 MCP 服务器连接时描述保持不变。已列出的声明共享 3000 估算 token 的预算（[设置](settings#%E5%B7%A5%E5%85%B7)中的 `codemode.inlineBudget`）。脚本用 `searchTools()`、`describeTool()`、`describeNamespace()` 或过滤 `ALL_TOOLS` 来找到其余工具。

`codemode` 激活时，[设置](settings#%E5%B7%A5%E5%85%B7)中的 `codemode.mode` 决定其他工具如何呈现。设为 `on`（默认）时，已声明的工具保持声明状态，其描述会说明如何从脚本调用它们。设为 `only` 时，这些工具对模型隐藏，改为列在 `codemode` 描述中，模型只能通过脚本调用它们。`codemode` 描述、`describeTool()` 和 `ALL_TOOLS` 中的工具声明会附带工具的提示词指引，因为系统提示词规则只覆盖已声明的工具。

## 存储值

`store(key, value)` 以字符串键保存一个 JSON 值，供后续 `codemode` 调用使用；存入 `undefined` 即删除该键。`load(key)` 返回该值，或 `undefined`。只有脚本成功时写入才会保留：每个存了值的成功脚本都会向会话追加一条 `codemode-store` 自定义条目，因此恢复的会话能保留这些值，且每个分支只看到自己路径上写入的值。

该存储用于小型状态，例如 ID、游标或摘要。单个值最多 262144 字符的 JSON，所有值合计最多 1048576 字符。不要存图片数据；用 `image()` 显示图片，它还会把图片保存到临时文件。

## 模型

`models` 访问模型目录，并使用会话的凭据运行非 LLM 模型：分类模型（对 JSON 状态回答有类型的问题，部分模型还支持图片）和图像模型（生成图片）。chat 模型会列出但不能从脚本运行。可用的分类模型与图像模型见[使用分类模型](models#%E4%BD%BF%E7%94%A8%E5%88%86%E7%B1%BB%E6%A8%A1%E5%9E%8B)和[使用图像模型](models#%E4%BD%BF%E7%94%A8%E5%9B%BE%E5%83%8F%E6%A8%A1%E5%9E%8B)。

```ts
type ModelType = "chat" | "image" | "classifier";

/** A catalog entry. `provider` and `id` identify it; other fields depend on the type. */
interface ModelInfo {
  type?: ModelType;
  provider: string;
  id: string;
  name: string;
  api: string;
  input: ("text" | "image")[];
  contextWindow?: number;
  [key: string]: unknown;
}

declare const models: {
  /** Every known model of a type, optionally for one provider. */
  getModelsOfType(type: ModelType, provider?: string): Promise<ModelInfo[]>;
  /** Models of a type whose provider has working credentials. */
  getAvailableOfType(type: ModelType, provider?: string): Promise<ModelInfo[]>;
  /** One catalog entry, or undefined. */
  getModelOfType(type: ModelType, provider: string, id: string): Promise<ModelInfo | undefined>;
  /** Answer `context.questions` about `context.state`; answers are in `result.answers` by question ID. */
  classify(model: ModelInfo, context: ClassifierContext): Promise<ClassifierResult>;
  /** Generate images from `context.input` text and image blocks; show `result.output` blocks with image(). Can take minutes. */
  generateImages(model: ModelInfo, context: ImagesContext): Promise<ImagesResult>;
};
```

`classify()` 和 `generateImages()` 只使用 `model` 的 `provider` 和 `id`，因此传 `{ provider, id }` 也可以。提供商出错时它们不会抛异常：请检查 `stopReason` 和 `errorMessage`。每个脚本同时最多运行四个此类调用；更多调用会等待空闲槽位，因此对大量条目用 `Promise.all()` 没问题。它们的用量会计入 `codemode` 工具结果，并计入会话成本。

模型 ID 因提供商而异，例如 `typesafe/jev-latest` 和 `openrouter/typesafe/jev-1.13`。用 `models.getAvailableOfType(type)` 找出当前凭据可用的 ID。

### 分类

```ts
interface ClassifierContext {
  /** The data to classify. */
  state: Record<string, unknown>;
  /** Images judged together with `state`. Only models whose `input` includes "image" accept them. */
  images?: { type: "image"; data: string; mimeType: string }[];
  /** Questions by ID. One call answers all of them. */
  questions: Record<string, ClassifierQuestion>;
}

type ClassifierQuestion =
  /** Pick one label. `criteria` maps each label to what it means. */
  | { type: "choice"; instructions: string; criteria: Record<string, string> }
  /** Score on an ordered scale. `criteria` describes each level, lowest first. */
  | { type: "score"; instructions: string; criteria: string[] }
  /** Yes or no. */
  | { type: "bool"; instructions: string; criteria: { true: string; false: string } };

interface ClassifierResult {
  provider: string;
  model: string;
  /** Answers by question ID. */
  answers: Record<string, ClassifierAnswer>;
  usage?: ModelUsage;
  stopReason: "stop" | "error" | "aborted";
  errorMessage?: string;
}

type ClassifierAnswer =
  | { type: "choice"; choice: string; probabilities: Record<string, number>; confidence: number }
  /** `score` is the expected level index, from 0 to `criteria.length - 1`. */
  | { type: "score"; score: number; confidence: number }
  /** Probability of `true`. */
  | { type: "bool"; probability: number };

/** Token counts and cost in USD, when the service reports them. */
type ModelUsage = { input: number; output: number; totalTokens: number; cost: { total: number } };
```

逐项调用 `classify()` 即可分类多个条目。下面这个脚本对反馈消息分类，例如对脚本中前面某工具返回的消息：

```js
const jev = await models.getModelOfType("classifier", "typesafe", "jev-latest");
const results = await Promise.all(
  messages.map((message) =>
    models.classify(jev, {
      state: { message },
      questions: {
        sentiment: {
          type: "choice",
          instructions: "How does the user feel about the product?",
          criteria: { positive: "Satisfied or happy", negative: "Unhappy or frustrated", neutral: "Neither" },
        },
        urgency: {
          type: "score",
          instructions: "How urgently does this need a reply?",
          criteria: ["no reply needed", "reply this week", "reply today"],
        },
      },
    }),
  ),
);
return results.map((result, i) =>
  result.stopReason === "stop"
    ? { message: messages[i], sentiment: result.answers.sentiment.choice, urgency: result.answers.urgency.score }
    : { message: messages[i], error: result.errorMessage },
);
```

`input` 包含 `"image"` 的分类模型还能判断图片。`tools.read()` 会把图片文件作为图片块返回，`images` 可以接受。`images` 非空时，其他分类模型会返回错误结果。

```js
const luna = await models.getModelOfType("classifier", "openai", "gpt-6-luna");
const photo = await tools.read({ path: "screenshot.png" });
const result = await models.classify(luna, {
  state: { task: "Settings page redesign" },
  images: [photo],
  questions: {
    broken: {
      type: "bool",
      instructions: "Does the screenshot show a broken layout?",
      criteria: { true: "Overlapping, cut-off, or misaligned elements", false: "Clean layout" },
    },
  },
});
```

### 生成图片

```ts
interface ImagesContext {
  /** The prompt as text blocks, plus image blocks to edit or use as references. */
  input: (TextBlock | ImageBlock)[];
}

interface ImagesResult {
  provider: string;
  model: string;
  /** Generated images, and text blocks for models that also return text. */
  output: (TextBlock | ImageBlock)[];
  usage?: ModelUsage;
  stopReason: "stop" | "error" | "aborted";
  errorMessage?: string;
}

type TextBlock = { type: "text"; text: string };
/** `data` is base64. */
type ImageBlock = { type: "image"; data: string; mimeType: string };
```

用 `image(block)` 显示生成的图片。不要用 `text()`、`console` 或 `return` 打印 `data`：它体积很大，模型也无法当文本阅读。`image()` 还会把每张图片保存到临时文件并在结果中给出路径，后续轮次即可复制或移动该文件。

```js
// @options: {"timeout_ms": 300000}
const painter = await models.getModelOfType("image", "openrouter", "google/gemini-2.5-flash-image");
const result = await models.generateImages(painter, {
  input: [{ type: "text", text: "A red fox in the snow, watercolor" }],
});
if (result.stopReason !== "stop") return result.errorMessage;
for (const block of result.output) {
  if (block.type === "image") image(block);
  else text(block.text);
}
```

## 限制

- 脚本的 VM 有 256 MB 内存。耗尽时会抛出 `InternalError: out of memory`；对大数据请过滤或聚合，而不要一味累积。
- 等待一个永远不会落定的 promise（且没有工具调用在进行中）的脚本会立即失败，因为沙箱没有计时器。
- 脚本不能启动其他 `codemode` 脚本。
