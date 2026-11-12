# GLOSSARY.md — herdr-docs-cn 术语表

> 翻译与终检的统一依据。并行批次注入同一份；终检按此 grep 抽查一致性。

## 不译名单（产品名/工具名/协议/命令）

| 原词 | 处理 |
|---|---|
| Herdr | 不译（产品名） |
| herdr-core | 不译（后台服务名，代码体） |
| Herdr TUI | 不译（终端版产品名） |
| herdr-app | 不译（应用配置目录/仓库名） |
| herdr | 不译（CLI 命令 `hc`、`herdr`） |
| mod | 不译（Herdr 功能扩展机制名；首现可注「mod，功能扩展」） |
| layout | 译「布局」（普通词）；作为 Herdr 画廊分类名时页面 UI 译「布局」 |
| OSC 7501 | 不译（状态协议名） |
| AGENTS.md | 不译（文件名） |
| Claude Code / Codex / Pi / Amp / Gemini CLI | 不译（智能体产品名） |
| tmux / SSH / Tailscale / git / worktree | 不译 |
| Apache 2.0 | 不译 |
| Y Combinator | 不译（首现可注「Y Combinator（YC）」） |
| RECIPE.md | 不译（文件名） |
| GitHub / Discord / X | 不译 |

## 核心术语（英 → 中）

| 英文 | 中文 | 备注 |
|---|---|---|
| agent | 智能体 | 全站统一；不译「代理/助手」 |
| coding agent | 编码智能体 | |
| space | 空间 | Herdr 的组织单位，每仓库一个 space |
| tab | 标签页 | |
| pane | 窗格 | |
| sidebar | 侧边栏 | |
| machine | 机器 | 指通过 SSH 接入的远程主机 |
| terminal | 终端 | |
| needs you | 需要你 | 智能体状态；卡片/侧边栏徽标 |
| working | 工作中 | 状态 |
| done | 已完成 | 状态 |
| idle | 空闲 | 状态 |
| blocked | 被阻塞 | OSC 7501 状态 |
| inbox | 收件箱 | 手机端列表 |
| runtime | 运行时 | |
| theme | 主题 | |
| layout | 布局 | |
| helper | 辅助智能体 | "It starts helpers" 语境 |
| report back | 回报 | helper 完成后向主智能体回报 |
| launch / launched | 启动 | |
| window | 窗口 | |
| app | 应用 | |
| native | 原生 | native app → 原生应用 |

## UI 文案定稿（导航/按钮/页脚——全站模板统一）

| 英文 | 中文 |
|---|---|
| Herdr App | Herdr App（导航项，不译） |
| Mobile | 移动端 |
| Core | Core（导航项指 herdr-core 文档页，不译） |
| Gallery | 画廊 |
| Guide | 指南 |
| Blog | 博客 |
| Download | 下载 |
| Privacy | 隐私 |
| Community | 社区 |
| Tell your agent | 告诉你的智能体 |
| Copy | 复制 |
| Copied | 已复制 |
| View on GitHub → | 在 GitHub 查看 → |
| Report this mod | 举报此 mod |
| Report this layout | 举报此布局 |
| Updated <date> | 更新于 <date> |
| No two Herdrs look alike. | 没有两台 Herdr 长得一样。 |
| Made for your agents. Remade by them. | 为你的智能体而生，由它们重塑。 |
| Open source, Apache 2.0 | 开源，Apache 2.0 |

## 排版规范（全站）

- 中文全角标点（，。：；？！、（）""——）；中英文/数字之间一个半角空格
- 引号用 ""，不用「」；破折号——不带空格
- 代码、命令、路径、配置键、报错原文一律半角原样
- 示例终端输出（`hc ls` 的表格输出等）保留英文原样，说明段翻译
