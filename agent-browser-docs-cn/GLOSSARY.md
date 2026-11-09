# agent-browser 中文文档术语表

翻译前通读。首现附英文原词（如「快照（snapshot）」）；本表已列的术语如上下文清晰可不再重复附注。

## 核心术语

| 英文 | 中文 |
|---|---|
| snapshot | 快照 |
| ref / refs | 引用（ref，形如 `@e1`） |
| interactive elements | 交互元素 |
| session | 会话 |
| daemon | 守护进程 |
| headless / headed | 无头 / 有头 |
| accessibility tree | 无障碍树 |
| provider | 提供商 |
| engine | 引擎 |
| skill | 技能 |
| plugin | 插件 |
| sandbox | 沙盒 |
| profile | 配置文件（profile） |
| auth vault | 认证保险库（auth vault） |
| confirmation(s) | 确认（confirmation） |
| action policy | 操作策略（action policy） |
| streaming | 流式输出 |
| init script(s) | 初始化脚本 |
| video recording | 视频录制 |
| contact sheet | 拼接图（contact sheet） |
| profiler | 性能分析器 |
| trace | 追踪记录（trace） |
| diff / diffing | Diff 对比 |
| network interception | 网络拦截 |
| idle timeout | 空闲超时 |
| dashboard | 仪表盘 |
| restore | 恢复（restore） |
| state | 状态 |
| deterministic | 确定性 |
| selector | 选择器 |
| CDP mode | CDP 模式 |
| native mode | 原生模式 |
| iframe | iframe（不译） |
| AI agent / agent | AI 智能体 / 智能体 |
| CLI | CLI（不译） |
| tab | 标签页 |
| frame | 框架（frame，浏览器语境） |
| mock | 模拟（mock） |
| geolocation | 地理位置 |
| clipboard | 剪贴板 |
| keystroke / key press | 按键 |
| batch | 批量 |
| WebMCP server | WebMCP 服务器 |
| scratch session | 临时会话 |
| transient browser state | 临时浏览器状态 |

## 不译清单（产品/工具/专有名）

agent-browser、Chrome、Chromium、Safari、Firefox、CDP、MCP、WebMCP、npm、npx、pnpm、brew、Homebrew、cargo、Rust、Node.js、Next.js、Vercel、eve、GitHub、Lightpanda、Obscura、Browserbase、Browserless、Browser Use、Kernel、AgentCore、Appium、WebGPU、Web Vitals、React、SSE、WebSocket、HAR、PDF、URL、JSON、DOM、LLM、SKILL.md、AGENTS.md、CLAUDE.md、Claude Code、Cursor、GitHub Copilot、OpenAI Codex、Google Gemini、opencode、Windsurf、Goose、FastAPI、AWS Lambda、Docker、Xvfb、axe、WCAG、macOS、Linux、Windows、iOS

## 翻译规范

1. **不译**：代码块内命令/输出/报错原文（但 `#` 注释要译）、CLI 子命令、flag（`--headed`）、环境变量、配置键、API/方法名、路径、版本号、PR 编号、表格中 Method/命令/取值列、import 行、frontmatter 的 className 等 JSX 属性。
2. **要译**：frontmatter title/navTitle（与下方对照表一致）、正文、表格表头与说明列、`:::tip`/callout、bash 块 `#` 注释、JSX 文本子节点（如 `<p className="…">November 3, 2026</p>` 中日期格式保留、周边正文译）。
3. **排版**：全角标点；中英文/数字间一个半角空格；代码内半角。引号用 ""；破折号——不带空格。
4. **粗体闭合（必守）**：`**……。**后文` ✗ → `**……**。后文` ✓；`**词（gloss）**后文` ✗ → `**词**（gloss）后文` ✓。粗体末尾必须是文字或行尾，不能紧跟全角标点后又接文字。
5. **内链**：`[文字](/path)` 只译文字，路径不译；锚点链接 `](/xxx#anchor)` 的 anchor 需指向译后标题的新中文锚点（见任务内说明）。
6. **frontmatter title 对照**（sidebar/meta/PAGE_TITLES 已按此翻译）：
   index=简介(navTitle)、installation=安装、quick-start=快速开始、skills=技能、commands=命令、configuration=配置、plugins=插件、selectors=选择器、snapshots=快照、sessions=会话、dashboard=仪表盘、diffing=Diff 对比、network=网络拦截、cdp-mode=CDP 模式、webmcp=WebMCP、streaming=流式输出、recording=视频录制、webgpu=WebGPU、debugging=调试、profiler=性能分析器、react=React 与 Web Vitals、files=文件与剪贴板、init-scripts=初始化脚本、proxy=代理、ios=iOS 模拟器、security=安全、next=Next.js 与 Vercel、eve=eve 扩展、native-mode=原生模式、providers/agentcore=AgentCore、providers/browser-use=Browser Use、providers/browserbase=Browserbase、providers/browserless=Browserless、providers/kernel=Kernel、providers/remote-agent-browser=远程 Agent Browser、engines/chrome=Chrome、engines/lightpanda=Lightpanda、engines/obscura=Obscura、changelog=更新日志
   （navTitle 同 title；index 的 navTitle 译「简介」，title 保持 "agent-browser"）
7. 一次回复只译一个文件（大文件）；小于 100 行的小文件至多 2 个一批。极简汇报：文件名 + 完成即可，不要复述译文。
