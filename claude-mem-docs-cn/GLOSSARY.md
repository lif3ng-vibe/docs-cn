# claude-mem 文档中文翻译术语表

> 翻译子代理必读。术语首次出现附英文原词（如「渐进式披露（progressive disclosure）」）；同一页面只附一次。

## 不译名单（原样保留）

Claude-Mem、claude-mem、Claude Code、Claude Desktop、Claude Agent SDK、MCP、SQLite、FTS5、Node、npm、npx、git、GitHub、Cursor、OpenRouter、Gemini、OpenAI、Grok、Antigravity CLI、LiteLLM、Kimi、T3Code、OpenClaw、PM2、Bun、Docker、Vercel、worker（指 claude-mem 的 worker 服务时首现可加注「worker 服务」）、hook/Hook（事件钩子技术名）、smart-unfold、smart-explore、mem-search、knowledge-agent（命令名）、observation 等数据库表名（sdk_sessions、observations、session_summaries、user_prompts、tool_uses）、所有命令/子命令、环境变量（`CLAUDE_MEM_*`、`ANTHROPIC_*` 等）、配置键、API 参数名、MCP 工具名（get_observations 等）、路径、报错原文。

## 术语对照

| 英文 | 中文 |
|---|---|
| persistent memory | 持久记忆 |
| memory compression system | 记忆压缩系统 |
| observation | 观察记录 |
| session summary | 会话摘要 |
| semantic summary | 语义摘要 |
| context injection | 上下文注入 |
| context engineering | 上下文工程 |
| progressive disclosure | 渐进式披露 |
| session | 会话 |
| session lifecycle | 会话生命周期 |
| memory pipeline | 记忆管线 |
| search pipeline | 检索管线 |
| hybrid search | 混合检索 |
| full-text search | 全文检索 |
| knowledge agent | 知识智能体 |
| corpus | 语料库 |
| folder context files | 目录上下文文件 |
| folder context | 目录上下文 |
| auto-redaction | 自动脱敏 |
| `<private>` tags | `<private>` 标签（私密标签） |
| provider（AI 提供商） | 提供商 |
| multi-key rotation | 多密钥轮换 |
| quota fallback | 配额回退 |
| memory ingest | 记忆摄取 |
| memory export/import | 记忆导出/导入 |
| manual recovery | 手动恢复 |
| hosted server | 托管服务 |
| cloud sync | 云同步 |
| headless | 无头模式 |
| token-efficient | 省 token |
| token | token（不译） |
| rate limiting | 速率限制 |
| redaction | 脱敏 |
| hook lifecycle | Hook 生命周期 |
| worker service | worker 服务 |
| viewer UI | 查看器 UI |
| memory stream | 记忆流 |
| timeline | 时间线 |
| mode system | 模式系统 |
| telemetry | 遥测 |
| troubleshooting | 故障排查 |
| best practices | 最佳实践 |
| onboarding | 引导 |
| dry run | 试运行 |
| worktree | worktree（不译） |
| graceful cleanup | 优雅清理 |
| aggressive cleanup | 激进清理 |
| context pollution | 上下文污染 |
| privacy | 隐私 |
| secret detection | 秘密检测 |
| regex | 正则 |
| bridge / gateway | 网关 |
| self-hosted | 自托管 |
| air-gapped | 隔离网络 |

## 排版与组件规范（Mintlify MDX 特有）

- 中文全角标点（，。：；？！、（）""——）；中英文/数字之间一个半角空格；引号统一 ""；破折号——不带空格。
- **粗体与 CJK 闭合**：粗体闭合 `**` 前不能是全角标点且紧跟文字——句读/括注移出粗体：`**要点**：正文` ✓、`**词**（gloss）后文` ✓。
- Mintlify 组件（`<Card>`、`<CardGrid>`、`<CodeGroup>`、`<Tabs>`、`<Tab>`、`<Steps>`、`<Step>`、`<Accordion`、`<AccordionGroup>`、`<Icon`、`<Check>`、`<Snippet>`、`<ParamField>`、`<ResponseField>`、`<Note>`、`<Warning>`、`<Tip>` 等）：**标签名/属性名/组件属性值（icon 名、href）一律不动**，只译标签之间的可见文本、`title=` / `name=` / `label=` 等人类可读字符串属性。
- frontmatter：`title`、`description` 必译；其余键不动。
- 表格：表头与说明列译；Method/命令/取值列不译。
- 代码块内容不译；但 `#` 开头的 cli 命令注释要译。
- 页内 `#锚点` 链接：中文标题锚点按 github-slugger 规则重算（保留 CJK、去标点、空格转连字符、全小写拉丁），并在锚点映射里登记 `原英文标题 | 中文标题 | 新锚点`。