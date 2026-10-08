# GLOSSARY — AI SDK 文档汉化术语表

> 本表是所有并行翻译子代理的注入材料，也是终检的 grep 清单。
> 规则：**意译为主；术语首次出现附英文原词**，如「智能体（agent）」；全站同一术语只用一种译法。

## 核心术语（必统一）

| 英文 | 中文 |
|---|---|
| AI SDK | AI SDK（不译） |
| agent | 智能体（agent），二次出现可只写「智能体」 |
| provider | 提供商 |
| model | 模型 |
| language model | 语言模型 |
| streaming / stream | 流式 / 流（作名词或动词均译「流式」语境可调） |
| prompt | 提示词（prompt），二次出现可只写「提示词」 |
| completion | 补全 |
| embedding | 嵌入（embedding） |
| structured output | 结构化输出 |
| tool / tool calling / tool call | 工具 / 工具调用 |
| tool result | 工具结果 |
| multi-step | 多步 |
| generative UI | 生成式 UI |
| React Server Components (RSC) | React 服务器组件（RSC） |
| chatbot | 聊天机器人 |
| attachment | 附件 |
| token | token（不译） |
| inference | 推理 |
| multimodal | 多模态 |
| image generation | 图像生成 |
| transcription | 语音转写（transcription） |
| speech (generation) | 语音（生成） |
| reasoning | 推理（reasoning） |
| fallback | 回退（fallback），回退机制 |
| mock | 模拟（mock） |
| telemetry | 遥测（telemetry） |
| middleware (AI SDK Language Model Middleware) | （语言模型）中间件 |
| edge | 边缘（Edge） |
| serverless | 无服务器 |
| runtime | 运行时 |
| framework | 框架 |
| gateway | 网关 |
| data stream / Data Stream Protocol | 数据流 / 数据流协议 |
| UI message stream | UI 消息流 |
| roundtrip | 往返 |
| message | 消息 |
| conversation | 对话 |
| callback | 回调 |
| abort / abort signal | 中止 / 中止信号 |
| timeout | 超时 |
| retry | 重试 |
| error handling | 错误处理 |
| cache | 缓存 |
| experimental | 实验性 |
| deprecated | 已弃用 |
| migration (guide) | 迁移（指南） |
| getting started / quickstart | 快速上手 |
| reference | 参考 |
| troubleshooting | 故障排查 |
| recipe / cookbook | 菜谱 / Cookbook（栏目名不译） |
| showcase | 案例 |
| template | 模板 |
| hook | Hook（不译） |
| server component / client component | 服务器组件 / 客户端组件 |
| server action | Server Action（不译，React 术语） |
| route handler | Route Handler（不译，Next.js 术语） |
| metadata | 元数据 |
| annotation | 批注（annotation） |
| citation / source (grounding) | 引用 / 来源 |
| file / image / audio / video / PDF | 文件 / 图像 / 音频 / 视频 / PDF |
| rate limit | 速率限制 |
| usage | 用量 |
| max steps (maxSteps) | 最大步数 |
| onboarding | 上手 |
| schema | schema（不译；zod/JSON schema 语境） |
| type-safe / type safety | 类型安全 |
| inference (type) | （类型）推断 |
| step | 步骤 |
| active response | 活跃响应 |
| assistant | 助手 |
| user / system message | 用户消息 / 系统消息 |
| tool choice | 工具选择 |
| headers | 请求头（HTTP 语境）；表头（表格语境） |
| parameter / property | 参数 / 属性 |
| signature | 签名 |
| import | 导入（章节标题 Import→导入；代码语句不译） |
| examples | 示例 |

## 高频小节标题对照（参考用，不强求逐字）

| 英文 | 中文 |
|---|---|
| Import | 导入 |
| Parameters | 参数 |
| Returns | 返回值 |
| API Signature | API 签名 |
| Properties | 属性 |
| Checking for this Error | 排查此错误 |
| Solution | 解决方案 |
| Issue | 问题 |
| Examples | 示例 |
| Background | 背景 |
| Basic Usage | 基本用法 |
| How It Works | 工作原理 |
| Related / See Also / See also | 相关内容 / 另请参阅 |
| Error Handling | 错误处理 |
| Where to Next? | 下一步 |
| Settings | 设置 |
| Prerequisites | 前置条件 |
| Next Steps | 下一步 |
| Methods | 方法 |
| Types | 类型 |
| Installation | 安装 |
| Notes | 说明 |
| Warnings | 警告 |
| Type Parameters | 类型参数 |
| Custom Headers | 自定义请求头 |
| Abort Signals and Timeouts | 中止信号与超时 |

## 不译名单（保持原样）

- **产品/公司名**：AI SDK、Vercel、Geist、Next.js、React、Vue、Svelte、Angular、Nuxt、Solid、Node.js、npm、pnpm、TypeScript、JavaScript、Astro、Zod、GitHub、Git、Docker、Vercel AI Gateway、Vercel Sandbox、v0、Turborepo
- **模型/厂商名**：OpenAI、GPT（GPT-4o、o1 等）、Anthropic、Claude、Google、Gemini、Mistral、Meta Llama、Cohere、DeepSeek、xAI、Grok、Groq、Perplexity、Together AI、Fireworks AI、DeepInfra、Azure、AWS Bedrock、Ollama、LM Studio、Hugging Face、Falcon、Qwen、Doubao、Moonshot/Kimi、GLM
- **协议/标准**：MCP（Model Context Protocol）、JSON、JSON5、HTTP、SSE、FormData、YAML、WebAssembly、OpenAPI
- **API 名/组件名/配置键/环境变量**：streamText、generateText、generateObject、streamObject、generateImage、transcribe、generateSpeech、embed、embedMany、useChat、useCompletion、useAssistant、useObject、streamUI、createStreamableValue、createStreamableUI、createAI、getMutableAIState、getAIState、onToolCall、jsonSchema、cosineSimilarity、z.object、OpenAIStream、StreamingTextResponse、MAX_STEPS、OPENAI_API_KEY 等一切代码形态——**一律原样保留**

## 排版规则（强制）

1. 中文全角标点：，。：；？！、（）""——
2. 中英文/数字之间加一个半角空格：`使用 streamText 生成文本`、`3 个步骤`
3. 引号用 ""；破折号用——不带空格；不用「」
4. "某次变更"式表达，不用"一次变更"
5. 一级原则：代码块、命令、CLI 子命令、配置键、API 方法名、路径、报错原文、表格中的代码取值列**不译**；代码围栏内的注释一般不译，但**纯解释性注释可译**（保持简短）
6. `:::tip/note/warning` 块内容要译
7. frontmatter 的 title/description 必译（一句话摘要保持一句话）
8. **粗体与 CJK 闭合（必守）**：粗体闭合 `**` 前不能紧贴全角标点后又跟文字。句读/括注移出粗体：
   - `**……。**后文` ✗ → `**……**。后文` ✓
   - `**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓
   - `**标题：**正文` → `**标题**：正文` ✓
9. 每个文件产出锚点映射：翻译时记录「原英文标题 → 中文标题 → 新锚点」（新锚点用 github-slugger 规则：保留 CJK、空格转连字符、小写、去标点），逐行写入映射文件，行格式 `原英文标题 | 中文标题 | 新锚点`