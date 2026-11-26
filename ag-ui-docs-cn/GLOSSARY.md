# GLOSSARY — AG-UI 文档汉化术语表

> 本表是所有并行翻译子代理的注入材料，也是终检的 grep 清单。
> 规则：**意译为主；术语首次出现附英文原词**，如「智能体（agent）」；全站同一术语只用一种译法。

## 核心术语（必统一）

| 英文 | 中文 |
|---|---|
| AG-UI / Agent–User Interaction Protocol | AG-UI（不译）；全称「智能体–用户交互协议（AG-UI）」，首次出现附英文 |
| Agent User Interaction Protocol | 同上，「智能体–用户交互协议」 |
| agent | 智能体（agent），二次出现可只写「智能体」 |
| agentic backend | 智能体后端 |
| agentic system / agentic application | 智能体系统 / 智能体应用 |
| subagent | 子智能体 |
| client / server | 客户端 / 服务端 |
| frontend / backend | 前端 / 后端 |
| event / event stream | 事件 / 事件流 |
| lifecycle | 生命周期 |
| run | 运行（run）；RunLifecycle=运行生命周期 |
| tool / tool call / tool call result | 工具 / 工具调用 / 工具调用结果 |
| tool call arguments | 工具调用参数 |
| state / agent state | 状态 / 智能体状态 |
| state delta / snapshot | 状态增量 / 快照 |
| streaming / stream | 流式 / 流 |
| transport | 传输层（transport）；HTTP SSE 传输层、HTTP protobuf 传输层 |
| Server-Sent Events (SSE) | SSE（不译，首次可注「服务器推送事件（SSE）」） |
| protobuf | protobuf（不译） |
| message | 消息 |
| user message / assistant message | 用户消息 / 助手消息 |
| role | 角色 |
| content | 内容 |
| multimodal / multimodal inputs | 多模态 / 多模态输入 |
| reasoning | 推理（reasoning） |
| thinking | 思考（thinking）；thinking 事件→思考事件 |
| interrupt / interruption | 中断 |
| resume / resumable | 恢复 / 可恢复 |
| human-in-the-loop | 人在回路（human-in-the-loop） |
| middleware | 中间件 |
| encoder / decoding | 编码器 / 解码 |
| marshalling / schema | 序列化 / schema（不译） |
| generative UI | 生成式 UI |
| specification / spec | 规范 |
| draft | 草案 |
| version / versioning | 版本 / 版本管理 |
| capability / capabilities | 能力 |
| metadata | 元数据 |
| pattern / event pattern | 模式 / 事件模式 |
| protocol | 协议 |
| orchestration / orchestrate | 编排 |
| framework | 框架 |
| integration / integrations | 集成 |
| SDK | SDK（不译） |
| endpoint | 端点 |
| payload | 负载（payload） |
| bi-directional | 双向 |
| real-time | 实时 |
| UI intent | UI 意图 |
| user interaction | 用户交互 |
| rendering / render | 渲染 |
| hydration | 水合（hydration） |
| shared state | 共享状态 |
| step / steps | 步骤 |
| token | token（不译） |
| prompt | 提示词 |
| context | 上下文 |
| LLM | LLM（不译） |
| copilot | copilot（不译，产品/角色名） |
| chat / chatbot | 对话 / 聊天机器人 |
| example / tutorial | 示例 / 教程 |
| quickstart | 快速上手 |
| prerequisite | 前置要求 |
| package | 包 |
| client-side / server-side | 客户端侧 / 服务端侧 |
| type-safe / type safety | 类型安全 |
| subscriber / subscription | 订阅者 / 订阅 |
| abstract agent / AGUIAgent | 抽象智能体类 / AGUIAgent（类名不译） |
| debug / debugging | 调试 |
| observability / tracing | 可观测性 / 追踪 |
| serialization | 序列化 |

## 不译名单（专有名词与产品名）

AG-UI、CopilotKit、LangGraph、LangChain、CrewAI、Mastra、AG2、Pydantic AI、LlamaIndex、Google ADK、A2A、MCP、A2UI、MCP-UI、Open-JSON-UI、OpenBot、Omnara、Dojo、Cursor、Vercel AI SDK、SSE、protobuf、Node.js、TypeScript、Python、Java、Kotlin、Go、Rust、Ruby、.NET、Dart、Spring、Spring AI、FastAPI、Express、Next.js、React、Vue、Svelte、npm、pnpm、Postman

## 事件与类型名（代码身份，一律不译）

`RunStarted`、`RunFinished`、`RunError`、`StepStarted`、`StepFinished`、`TextMessageStart/Content/End`、`ThinkingStart/ThinkingTextMessageContent/ThinkingEnd`、`ToolCallStart/Args/End`、`ToolCallResult`、`StateSnapshot`、`StateDelta`、`MessagesSnapshot`、`RawEvent`、`CustomEvent`、`ActivitySnapshot`、`ActivityDelta` 等事件类名与 `MessageType`、`Tool` 等类型名出现在正文时保持英文原样（可后附中文释义）。

## 排版规范

- 中文全角标点（，。：；？！、（）「」不用，统一用""）；中英文/数字之间一个半角空格；代码内半角。
- 引号统一用""（不用「」）；破折号——不带空格。
- **CJK 粗体闭合规则（必守）**：粗体闭合 `**` 前不能是标点且紧跟文字。句读移出粗体：`**……。**后文` ✗ → `**……**。后文` ✓；`**标题：**正文` → `**标题**：正文`；括注移出粗体：`**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓。
- 表格表头与说明列要译；Method/命令/取值/类型列不译。
- 代码块、命令、CLI、环境变量、配置键、API 方法名、路径、报错原文一律不译。
- **MDX 陷阱（本站高频）**：正文大量内联 JSX（`<div style={{…}}>`、`onMouseEnter={(e) => …}`、`<Note>`、`<Card>` 等）。只译 JSX 标签之间的可见文本与 `title=`、`alt=`、`aria-label=` 等**字符串字面量**属性；JSX 属性名、事件处理器表达式、style 值、className 一律不动。`<img src="/images/…">` 的 src 路径不动。

## 批次补充术语（随批并入，全站以此为准）

| 英文 | 中文 |
|---|---|
| content part / media part | 内容部分 / 媒体部分 |
| shim | 垫片（shim） |
| producer / consumer / forwarder | 生产者 / 消费者 / 转发方 |
| wire key / wire format | 线上 key / 线上格式 |
| peer dependency | peer 依赖 |
| reasoning span | 推理区段（span） |
| type narrowing | 收窄 |
| handle | 句柄 |
| fixture corpus | 测试样例库（fixture corpus） |
| control plane | 控制平面 |
| stub server / stub agent | 占位服务端 / 占位智能体 |
| agent steering | 智能体引导 |
| attribution | 归因 |
| resume payload | resume 负载 |
| enforcement stage | 强制执行阶段 |
| 1st party / Supported / In Progress / Community / Partnership | 一方官方 / 已支持 / 进行中 / 社区 / 合作伙伴（introduction 集成大表取值列按此译） |
| additional（保留英文） | harness、resolver、discriminator、dojo、AOT、profile（Omnara） |
