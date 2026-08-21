---
title: "Karpathy 的「LLM wiki」调研报告"
description: "权威一手来源是 Karpathy 2026 年 4 月的 gist llm-wiki.md——他称之为「点子文件」：明确不是库也不是应用，而是一个设计成拷贝进智能体里的模式。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/research-karpathy-llm-wiki.md"
---

# Karpathy 的「LLM wiki」调研报告

> 本项目试图忠实实现的模式。一手来源如下；相关/竞争想法列出以供诚实对比。

## 1. Karpathy 实际说了什么

权威一手来源是 Karpathy 2026 年 4 月的 gist [`llm-wiki.md`](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)，他称之为**「点子文件（idea file）」**——明确*不是*库也不是应用，而是一个设计成拷贝进智能体（Claude Code、Codex、OpenCode）里的模式，让智能体为用户的领域把它实例化。

最初的表述来自 2026 年 4 月 2 日的一条 X 线程，转述为：*「用 LLM 为各种研究兴趣主题构建个人知识库」*。两天后他跟进了这份 gist。之后他[推荐了「Farzapedia」](https://x.com/karpathy/status/2040572272944324650)作为该模式在野外的好例子。

### 核心论点（gist 原文）

> 「大多数人与 LLM 和文档打交道的体验像 RAG：你上传一组文件，LLM 在查询时检索相关片段并生成答案。这可行，但 LLM 在每个问题上都从零重新发现知识。没有累积。」

> 「LLM 不只是查询时从原始文档里检索，而是**增量地构建并维护一个持久 wiki**——一组结构化、相互链接的 markdown 文件，坐在你和原始来源之间。你加入新来源时，LLM 不只是为日后检索做索引。它阅读、提取关键信息、并整合进既有 wiki——更新实体页、修订主题摘要、标注新数据与旧论断矛盾之处、强化或挑战演进中的综合。知识编译一次然后*保持最新*，而不是每个查询重新推导。」

> 「wiki 是一个持久的、复利的产物。交叉引用已经就位。矛盾已经被标出。」

> 「维护知识库的乏味部分不是阅读或思考——是簿记……LLM 不会无聊、不会忘了更新交叉引用、能一次触碰 15 个文件。」

他明确把这个想法连到 Vannevar Bush 1945 年的 Memex——「一个带文档间联想路径的、个人化的、策展的知识存储」——并论证 Bush 没解决的*谁来维护*那一环由 LLM 补上。

## 2. 核心原则

来自 gist 本身（Karpathy 的原文，非转述）：

1. **编译，不是检索。** 知识在摄取时编译，不在查询时重新合成。wiki 是产物；原始来源是事实源。
2. **三层架构。**
  - **原始来源**——不可变；LLM 只读。
  - **wiki**——markdown 文件；LLM 完全拥有并维护。
  - **schema**（CLAUDE.md / AGENTS.md）——把「一个泛用聊天机器人」变成「一个有纪律的 wiki 维护者」的约定。
3. **三个操作：摄取 / 查询 / Lint。**
  - *摄取*：一个来源典型地触碰 **10–15 个 wiki 页面**。
  - *查询*：「好答案可以归档回 wiki 成为新页面……探索像摄取的来源一样在知识库里复利。」
  - *Lint*：周期性健康检查——矛盾、过期论断、孤儿页、缺失交叉引用、数据空洞。
4. **交叉链接即综合。** wiki 像 Wikipedia 或粉丝 wiki 那样互联（他引用 [Tolkien Gateway](https://tolkiengateway.net/wiki/Main_Page)）；图*就是*浓缩后的知识。
5. **两个导航文件：`index.md`（内容目录）与 `log.md`（按时间只追加的台账）。** 日志用固定前缀让 unix 工具（`grep "^## \["`）能解析。
6. **分工。** 人类策展来源、提出好问题；LLM 做「摘要、交叉引用、归档与簿记」。或者用他的比喻：*「Obsidian 是 IDE；LLM 是程序员；wiki 是代码库。」*

### Karpathy 没有明确说的（诚实告示）

社区经常把几个额外想法归于他，那些是**转述/扩展**，不在他的 gist 里：

- **情节 vs 语义记忆层级**——神经科学框架。不在 gist 里。来自 [LLM Wiki v2](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2) 这类扩展与更广的记忆研究文献。
- **「类睡眠」整编**——同样是扩展框架，不是 Karpathy 的。他最接近的类比是 *Lint* 操作（周期性健康检查），基于规则而非梦境。
- **置信度打分、艾宾浩斯衰减、取代语义**——这些是 LLM Wiki v2 的添加，不是原作。
- **编号的「1. Explicit. 2. ……」Farzapedia 要点**——社区总结说 Karpathy 列了显式记忆产物优于「 allegedly 越用越好的 AI」现状的若干优势。标记为**社区转述**。

## 3. gist 里的实现提示

- **触发**：摄取时人在环上（「我偏好一次摄取一个来源并保持参与」），但批量摄取也允许。
- **格式**：git 仓库里的纯 markdown。可选 YAML frontmatter 供 Dataview 查询。
- **小规模检索**：`index.md`「好得出奇……约 100 个来源、数百个页面时」——不需要嵌入。
- **更大规模检索**：shell 出去调本地混合检索工具（他点名 [`qmd`](https://github.com/tobi/qmd)，BM25 + 向量 + LLM 重排，有 CLI 与 MCP 形态）。
- **工具**：Obsidian 作查看器（图视图找孤儿/枢纽页）、Web Clipper 抓来源、git 做版本控制。

## 4. 相关 / 竞争想法

- **MemGPT / Letta**（[letta.com](https://www.letta.com/blog/benchmarking-ai-agent-memory)）：把上下文窗口当虚拟内存；*智能体自己*决定什么在 core、recall、archival 层间换入换出。长时程情节连贯性更强；锁定更深（拥有智能体循环）。
- **Mem0**（[tokenmix.ai 对比](https://tokenmix.ai/blog/ai-agent-memory-mem0-vs-letta-vs-memgpt-2026)）：带 `extract / store / retrieve` 的轻量记忆层。从对话*被动*提取记忆而不是让智能体自编辑。锁定低。
- **A-MEM**（[arXiv 2502.12110](https://arxiv.org/abs/2502.12110)，NeurIPS 2025）：明确受卡片盒（Zettelkasten）启发。每条记忆是一个带结构化属性、关键词、标签的原子笔记；新记忆触发既有笔记表示的*演化*。这是已发表研究里最接近 Karpathy wiki 的类比——原子笔记 + 自动链接 + 修订传播。
- **ReadAgent**（Google DeepMind，2024）：「要点记忆」——把长上下文压缩成一棵摘要树、带指回细节的指针。角度不同（长文档阅读），但共享「编译、不重复检索」的直觉。
- **LLM Wiki v2**（Rohit Ghumare）：带置信度分数、取代、艾宾浩斯衰减、四层整编（工作 → 情节 → 语义 → 程序）、事件驱动钩子、审计轨迹的显式扩展。基本就是 agentmemory 的模型。
- **Rowboat / 知识图谱扩展**（[dailydoseofds.com](https://blog.dailydoseofds.com/p/the-next-step-after-karpathys-wiki)）：论证摘要式 wiki 在演化的工作语境（期限、承诺）下失效，并提出*类型化实体知识图谱*（决策、人、项目作节点）。

## 5. 对面向编码智能体的 Rust MCP 服务器的设计启示

忠实翻译 Karpathy——一个「Karpathy 式」后端与朴素向量 RAG 长得非常不一样：

**它具体是什么：**

- **存储 = git 仓库里的 markdown 文件**，不是不透明的向量 blob。wiki 必须人类可检视、可 grep。嵌入可以索引它但绝不取代它。
- **MCP 服务器强制三个目录**：`raw/`（只追加、不可变）、`wiki/`（LLM 可写、结构化）、以及服务器注入每个会话的 schema 文档（`AGENTS.md` 式）。
- **MCP 工具镜像三个操作**：`memory_ingest`、`memory_query`、`memory_lint`——加底层原语（`wiki_read`、`wiki_write`、`wiki_link`、`wiki_supersede`）。招牌工具不是 `vector_search`。
- **摄取必须是写扇出、一次插入。** 一条新观察应该*触碰约 10–15 个既有页面*——更新一个实体页、一个概念页、决策日志、坑点页。这是与向量 RAG 最大的单一偏差——后者只会追加。
- **`index.md` 与 `log.md` 是一等公民文件。** 日志是审计轨迹与整编触发源。用前缀约定（`## [YYYY-MM-DD] action | title`）让它可 grep。
- **检索是层级式的、最近邻的。** 读 `index.md` → 收窄到候选页 → 读它们 → 对新颖查询可选回退到混合检索（BM25 + 向量，RRF 融合）。索引*就是*综合；嵌入是兜底。
- **整编是显式的、计划性的 MCP 操作**，不是副作用。`memory_consolidate` 在客户端暴露真会话结束钩子的地方被真会话结束钩子触发，在 Codex、Antigravity CLI 这类客户端用手工 `ai-memory finalize-session` 流程，在压缩事件上，或按定时器。它由 LLM 驱动（需要提供方 key）；没有就照 agentmemory 那样空转。
- **跨智能体共享状态。** 因为 wiki 是纯文本，Claude Code、Codex、OpenCode 读写*同一个*产物。MCP 服务器是守门人；markdown 是契约。无厂商锁定。
- **编码专属页面类型**：库的坑点、架构决策（ADR 式）、失败的尝试、仓库约定、环境怪癖。Karpathy 的示例领域是个人/研究；对编码智能体，高价值页面是*失败模式*与*决策*，因为那正是上下文压缩时被丢掉的东西。

**它刻意*不是*什么：**

- 不是套了聊天外壳的向量数据库。向量是 markdown 之上的检索*辅助*，不是事实源。
- 不是按时间的转录。日志存在，但它是元数据。语义内容住在合成页面里。
- 不 opaque。智能体拥有的每条记忆都必须能在 Obsidian 里打开、在 git 里 diff、用散文解释。

**值得在设计里解决的诚实张力**：Karpathy 的 gist 为*人工策展的研究 wiki* 优化——一次摄取一个来源、用户盯着。编码智能体则从工具调用*持续、无监督*地摄取。本项目继承 Karpathy 的结构，但需要 LLM Wiki v2 提议的生命周期层（衰减、取代、置信度）——否则 wiki 会被自主运行的过期、低信号观察填满。

## 来源

- [Karpathy - `llm-wiki.md` gist（一手来源）](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Karpathy - Farzapedia 推文](https://x.com/karpathy/status/2040572272944324650)
- [Yuchen Jin 引用 Karpathy 的总结推文](https://x.com/Yuchenj_UW/status/2040482771576197377)
- [AkitaOnRails - AI Agent Memory: Karpathy LLM Wiki and agentmemory in Practice](https://akitaonrails.com/en/2026/05/18/ai-agent-memory-karpathy-llm-wiki-agentmemory/)
- [Rohit Ghumare - LLM Wiki v2（gist）](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2)
- [A-MEM: Agentic Memory for LLM Agents（NeurIPS 2025）](https://arxiv.org/abs/2502.12110)
- [Mem0 vs Letta vs MemGPT 对比（TokenMix, 2026）](https://tokenmix.ai/blog/ai-agent-memory-mem0-vs-letta-vs-memgpt-2026)
- [Benchmarking AI Agent Memory: Is a Filesystem All You Need?（Letta）](https://www.letta.com/blog/benchmarking-ai-agent-memory)
- [The Next Step After Karpathy's Wiki Idea - Avi Chawla](https://blog.dailydoseofds.com/p/the-next-step-after-karpathys-wiki)
- [Gamgee: Why the Future of AI Memory Isn't RAG](https://gamgee.ai/blogs/karpathy-llm-wiki-memory-pattern/)
- [Beyond RAG: How Karpathy's LLM Wiki Pattern Builds Knowledge That Compounds（Plaban Nayak, Level Up Coding）](https://levelup.gitconnected.com/beyond-rag-how-andrej-karpathys-llm-wiki-pattern-builds-knowledge-that-actually-compounds-31a08528665e)
- [Analytics Vidhya - LLM Wiki Revolution](https://www.analyticsvidhya.com/blog/2026/04/llm-wiki-by-andrej-karpathy/)
- [Agentpedia - Karpathy's LLM Wiki: Complete Guide to His Idea File](https://agentpedia.codes/blog/karpathy-llm-wiki-idea-file)
- [Tolkien Gateway（Karpathy 引用的粉丝 wiki）](https://tolkiengateway.net/wiki/Main_Page)
- [qmd - 本地混合 markdown 检索（gist 里引用）](https://github.com/tobi/qmd)
