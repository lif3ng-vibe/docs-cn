# ai-memory 中文文档术语表（翻译统一口径）

## 不译名单（保留英文原词）

| 英文 | 处理 |
|---|---|
| ai-memory | 产品名不译 |
| Claude Code、Codex、Cursor、Gemini CLI、OpenCode、Devin CLI、Kiro CLI、OMP/Oh My Pi、Pi、Crush、Kimi Code、Command Code、Antigravity CLI、Grok Build CLI、OpenClaw、Swival、Zero、Hermes Agent、Zed、VS Code Copilot、Claude Desktop | 智能体 CLI 产品名不译 |
| MCP（Model Context Protocol） | 不译 |
| SQLite、FTS5、Docker、git、Obsidian、rsync、Ollama、OpenRouter、systemd、AUR | 产品名不译 |
| Rust、cargo、tokio、refinery | 技术名不译 |
| `write_note`、`memory_search`、`memory_query`、`memory_consolidate`、`memory_handoff_accept`、`memory_feedback`、`memory_write_proposal` 等 MCP 工具名 | 不译 |
| `install-mcp`、`install-hooks`、`finalize-session`、`serve`、`run`、`completions`、`hook`、`hook-drain` 等 CLI 子命令 | 不译 |
| `AI_MEMORY_*` 等环境变量、`.ai-memory.toml`、`ai-memory.toml` | 不译 |
| SessionStart、SessionEnd、UserPromptSubmit、PostToolUse、PreInvocation、PostCompaction、Stop 等钩子事件名 | 不译（PascalCase 事件名） |
| `concepts/`、`decisions/`、`gotchas/`、`procedures/`、`_rules/`、`sessions/`、`log.md` 等 wiki 目录/文件名 | 不译 |
| token、embedding（可注「嵌入向量」一次） | 不译 |
| RRF、TLS、OAuth、OIDC、SSE、stdio、HTTP、JSON、TOML | 不译 |
| Karpathy-style LLM wiki | 译作「Karpathy 式 LLM wiki」；wiki 一词不译（见下） |

## 译名（英文 → 中文）

| 英文 | 中文 |
|---|---|
| wiki | **不译**（wiki 即产品核心概念，全站保留英文小写 wiki；「wiki 页面」=wiki page） |
| handoff | 交接（handoff）；`Handoff` 行/数据结构语境可保留 |
| ledger | 台账（ledger） |
| observation | 观察（observation）；`ObservationKind` 不译 |
| capture | 捕获 |
| sanitized / sanitizer | 净化后的 / 净化器（sanitizer） |
| consolidation / consolidate | 整编（consolidation）／整编（consolidate）；`memory_consolidate` 不译 |
| workstream | 工作流（workstream）；managed workstream = 托管工作流（managed workstream） |
| harness | 智能体外壳（harness）；指 agent harness 时统一此译名 |
| lifecycle hook | 生命周期钩子（lifecycle hook） |
| admission webhook | 准入 webhook（admission webhook） |
| marker file | 标记文件（marker file） |
| compaction | 压缩（compaction）；指上下文压缩 |
| supersession | 新版本取代（supersession）；「就地版本化：新页取代旧页」 |
| episodic | 情节性的（episodic）；episodic pages = 情节性页面 |
| semantic | 语义的 |
| retrieval | 检索 |
| salience | 显著度（salience） |
| pending-writes audit trail | 待写入审计轨迹（pending-writes audit trail） |
| auto-improvement | 自动改进（auto-improvement） |
| auto-scope / `[auto_scope]` | auto-scope 不译（配置节名），行文可称「自动作用域隔离」 |
| finalize | 收尾；`finalize-session` 不译，行文称「会话收尾」 |
| homelab | 家庭实验室（homelab） |
| bearer token | bearer token 不译（或「Bearer 令牌」） |
| idempotency key | 幂等键（idempotency key） |
| spool / spooling | 暂存（spool） |
| drain | 排放；`hook-drain` 不译 |
| watermark | 水位线（watermark） |
| handoff injection | 交接注入 |
| quick start | 快速开始 |
| support matrix | 支持矩阵 |
| prior art | 先前技术（prior art）/先行项目 |
| pain-point | 痛点 |
| gotcha | gotcha 不译（wiki 目录名）；行文可称「坑点」 |
| entity | 实体 |
| wikilink | wikilink 不译 |
| frontmatter | frontmatter 不译 |
| sandbox / unsandboxed | 沙箱 / 非沙箱 |
| AUR（Arch User Repository） | 不译 |
| native（binary/commands） | 原生（二进制/命令） |
| cross-harness | 跨外壳（cross-harness） |
| opt-in / opt-out | 选择启用／选择退出 |
| double opt-in | 双重选择启用 |
| review-gated | 评审门控的 |
| at-least-once | 至少一次（at-least-once） |
| boundary（token/context） | 边界；turn boundary = 回合边界 |
| visible-event ledger | 可见事件台账（visible-event ledger） |
| capture exclusion | 捕获排除（capture exclusion） |
| trust boundary | 信任边界 |
| proposal | 提案 |
| staging / staged | 暂存（staging） |
| routing snippet | 路由片段（routing snippet） |
| Agent Skills | 智能体技能（Agent Skills） |
| provider（LLM/embedding） | 提供方（provider） |
| tier | 层级 |
| kv / KV store | KV 存储 |
| catch-up | 补跑（catch-up） |
| parking lot | 停车场（暂存待办清单，parking lot） |

## 排版与风格

- 中文全角标点（，。：；？！、（）""——）；中英文/数字之间一个半角空格。
- 引号统一用 ""（不用「」）；破折号——不带空格。
- 代码块、命令、配置键、路径、报错原文不译；cli 命令清单的 `#` 注释要译。
- 表格中 Method/命令/取值列保留原文，表头与说明列翻译。
- frontmatter title/description 翻译（description 一句话保持一句话）。
- 标题译成中文后，页内 `#锚点` 链接重算（github-slugger：CJK 保留、空格转连字符、去除标点）。
