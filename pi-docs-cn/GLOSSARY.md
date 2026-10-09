# Pi 文档中文翻译术语表

> 翻译子代理必读。术语首次出现附英文原词（如「智能体循环（agent loop）」）；同一页面只附一次。

## 不译名单（原样保留）

Pi、pi（命令名）、pi-coding-agent、MCP、RPC、SDK、CLI、TUI、JSON、JSONL、TypeScript、Node、npm、npx、git、GitHub、tmux、Termux、Android、Windows、macOS、Linux、Docker、Podman、Anthropic、OpenAI、Claude、Gemini、xAI、Grok、OpenRouter、Groq、Amazon Bedrock、Google Vertex、Google AI Studio、llama.cpp、Ollama、LM Studio、vLLM、Models.dev、Hugging Face、Codemode、AGENTS.md、PI_* 环境变量、所有命令/子命令/斜杠命令名、配置键（JSON 字段名）、API 方法名、RPC 方法名、报错原文、路径、代码块内一切内容。

## 术语对照

| 英文 | 中文 |
|---|---|
| agent | 智能体 |
| agent loop | 智能体循环 |
| session | 会话 |
| session file | 会话文件 |
| branch（会话分支） | 分支 |
| fork | 分叉 |
| extension | 扩展 |
| skill | 技能 |
| prompt template | 提示词模板 |
| theme | 主题 |
| provider | 提供商 |
| model | 模型 |
| local model | 本地模型 |
| virtual model | 虚拟模型 |
| subscription | 订阅 |
| API key | API 密钥 |
| context | 上下文 |
| context window | 上下文窗口 |
| context file | 上下文文件 |
| instruction | 指令 |
| compaction | 压缩 |
| compact | 压缩（动词）/手动压缩 |
| branch summary | 分支摘要 |
| summary | 摘要 |
| tool call | 工具调用 |
| tool | 工具 |
| thinking | 思考 |
| thinking level | 思考级别 |
| steering mode | 引导模式 |
| steer | 引导 |
| follow-up mode | 追问模式 |
| sandbox | 沙箱 |
| container | 容器 |
| containerization | 容器化 |
| workspace | 工作区 |
| working folder | 工作目录 |
| checkpoint | 检查点 |
| keybinding | 按键绑定 |
| shortcut | 快捷键 |
| slash command | 斜杠命令 |
| package | 包 |
| interactive mode | 交互模式 |
| print mode | 打印模式 |
| RPC mode | RPC 模式 |
| event stream | 事件流 |
| editor（TUI 组件） | 编辑器 |
| widget | 部件 |
| overlay | 浮层 |
| toast | toast 提示 |
| renderer | 渲染器 |
| terminal | 终端 |
| shell | shell |
| autocompact / auto-compaction | 自动压缩 |
| retry | 重试 |
| uninstall | 卸载 |
| troubleshooting | 故障排查 |
| permissions | 权限 |
| read-only | 只读 |
| approval | 批准 |
| changelog | 更新日志 |

## 排版规范（全站统一）

- 中文全角标点（，。：；？！、（）""——）；代码/命令内保持半角。
- 中英文、中文与数字之间留一个半角空格。
- 引号统一用 ""（不用「」）；破折号用——，两侧不加空格。
- 粗体闭合规则（CommonMark CJK 坑）：句读/括注移出粗体——`**……。**后文` ✗ → `**……**。后文` ✓；`**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓。
- 内链路径一律不动（`quickstart.md`、`cli.md#invocation-and-output` 等），只译链接文字。

## 标题锚点规则（Mintlify 实证）

- 小写 ASCII；空格 → `-`；`.` `,` `(` `)` `` ` `` `:` `?` `!` `&` 等标点 → `-` 后合并连续 `-`。
- 保留原样：`_` `+` `/` `-` `’`、数字、CJK 字符。
- 中文标题：保留 CJK、空格转 `-`。
- 例：`How Pi Works` → `how-pi-works`；`Framing and Process I/O` → `framing-and-process-i/o`；`Forward Alt+Enter on macOS` → `forward-alt+enter-on-macos`。
- 每页产出锚点映射文件 `.anchor-maps/<页名>.map.md`，行格式：`原英文标题 | 中文标题 | 新锚点`（含 H1；H2/H3 全列）。
