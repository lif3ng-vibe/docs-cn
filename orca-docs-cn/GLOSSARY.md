# Orca 文档术语表（翻译统一口径）

## 译名

| 英文 | 中文 |
|---|---|
| worktree | worktree（不译，首次出现可注：工作树（worktree）） |
| agent | 智能体 |
| agent terminal | 智能体终端 |
| session | 会话 |
| hibernation | 休眠 |
| orchestration | 编排 |
| diff viewer | Diff 查看器 |
| Annotate AI Diff | 标注 AI Diff |
| attribution | 归属 |
| commit & push | 提交与推送 |
| pull request / PR | PR（不译） |
| worktree checkpoint | worktree 检查点 |
| computer use | 计算机使用 |
| skills（Orca CLI 技能） | 技能 |
| automation | 自动化 |
| browser profile | 浏览器配置 |
| design mode | 设计模式 |
| usage / rate-limit | 用量 / 限流 |
| status bar | 状态栏 |
| sidebar | 侧边栏 |
| tab / pane / split | 标签页 / 窗格 / 分屏 |
| quick open | 快速打开 |
| jump palette | 跳转面板 |
| landing screen | 落地屏 |
| base ref | 基准引用（base ref） |
| start-from ref | 起始引用（start-from ref） |
| stacked PR / stacking | 堆叠 PR |
| companion app（mobile） | 伴侣应用 |
| telemetry | 遥测 |
| notifications | 通知 |
| remote server / runtime | 远程服务器 / 运行时 |
| pairing | 配对 |
| relay | relay（不译，产品组件名） |
| vault | vault（不译） |
| selector | 选择器 |
| e2e | e2e（不译） |

## 不译名单

Orca、Claude Code、Codex、Cursor CLI、GLM、Grok、Gemini、OpenCode、GitHub、Linear、Jira、GitLab、Monaco、git 全部子命令（worktree/fetch/stash）、`~/.claude`、`~/.codex`、npm、Homebrew、brew、Electron、AppImage、`.deb`、DMG、PowerShell、CMD、SSH、OpenSSH、WSL2、AppImage、TestFlight、APK、markdown、JSON、UI。

## 排版

- 中文全角标点；中英文/数字之间半角空格；代码内半角。
- 引号用 ""（不用「」）；破折号——不带空格。
- "某次变更"不用"一次变更"；"接入"不用"接线"。
- 按钮/菜单名保留英文原文加粗（**Settings → General → Updates**），首次出现可括注中文。

## 已知提取缺陷（翻译时人工修复）

RSC 提取丢失了内联图标组件，以下句子缺词，按上下文补：
- native-chat.md "Type for slash commands" → 应为 "Type `/` for slash commands"
- usage-tracking.md 用量档位 bullet 首条缺 "Detailed"（原文应为 "Detailed — full bars..."）
- settings.md "custom prefix or marine creatures" 前缺设置项名（截图占位符主题，可意译为完整句）
- ssh.md "including $L14d files" → "including `~/.ssh/config.d` files"（依上下文）
- 表格如遇空单元格照译，不留占位。
