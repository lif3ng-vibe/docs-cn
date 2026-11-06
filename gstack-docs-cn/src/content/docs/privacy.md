---
title: "隐私与遥测"
---


除非你主动选择加入，gstack 不会上报任何关于你如何使用它的信息。网络流量共三类，每一类都有自己的开关。

**遥测**（telemetry，需主动开启，默认关闭）。首次运行时 gstack 会询问一次，你可以拒绝，并随时用 `gstack-config set telemetry off` 关闭。

- **每次技能运行上报的内容**：技能名、事件类型、结果（success/error/abort）、耗时、gstack 版本、操作系统与 CPU 架构、是否使用了浏览器、该次运行是正式执行还是测试、一个会话 ID、活跃会话标记的数量（见下文）、错误类别、失败步骤，以及一条经 gstack 秘密脱敏（secret redaction）处理并截断到 200 字符的错误消息。`community` 会附加一个稳定的设备 ID；`anonymous` 不发送任何 ID。提示词注入检测事件会附加攻击页面的域名、载荷哈希、置信度分数、检测层级和判定结果。
- **绝不发送的内容**：代码、文件路径、仓库名、分支名、提示词，以及你写下的任何其他内容。
- **留在你机器上的内容**：若已选择加入，每次运行还会连同仓库名与分支一起记录到 `~/.gstack/analytics/skill-usage.jsonl`（位于你的状态根目录之下；见 [docs/state-root.md](https://github.com/garrytan/gstack/blob/main/docs/state-root.md)），以便 `gstack-analytics` 展示你自己的仪表盘。`gstack-telemetry-sync` 在任何数据上传之前会删除这两个字段（`anonymous` 模式下还包括设备 ID）。遥测关闭时，gstack 完全不记录使用分析；那里不会有任何新写入。
- **数据的去向**：[Supabase](https://supabase.com)（一个开源的 Firebase 替代品）。schema 位于 [`supabase/migrations/`](https://github.com/garrytan/gstack/tree/main/supabase/migrations/)，你可以据此核查收集了什么。仓库里的 publishable key 是公开密钥；行级安全（row-level security）拒绝直接访问，edge functions 则强制执行 schema 校验、事件白名单和字段长度限制。

**更新检查**（update check，默认开启，与遥测设置无关）。每次交互式技能启动都会运行 `gstack-update-check`。缓存过期时（结果为最新之后的 60 分钟、有待升级期间的 12 小时、失败之后的 10 分钟），它会向 GitHub 查询最新版本：对 `github.com/garrytan/gstack` 执行一次 `git ls-remote`，从 `raw.githubusercontent.com` GET 一次 `VERSION` 文件；当该版本与你的相同而 `main` 已领先于你的检出版本时，还会向 `api.github.com` 的 compare 端点 GET 两个提交 SHA 的比较结果。GitHub 会看到你的 IP 地址；关于你或你代码的任何信息都不会发送。遥测开启时，同一检查还会把你的 gstack 版本和操作系统发送到 gstack 的 Supabase。用 `gstack-config set update_check false` 可关闭该检查。

**外部评审**（outside review，默认开启；第一次会打印一条提示）。计划评审、`/autoplan`、`/review` 与 `/ship` 的对抗性评审、`/ship` 的设计检查、`/design-review`、`/design-consultation`、`/office-hours`、`/document-release` 和 `/spec` 可以请第二个模型做独立评审：在 Claude Code 下用 Codex，在 Codex 下用 Claude Code。这会把评审提示词及相关代码、diff 或计划发送给对应服务商，使用的是你自己的 Codex 或 Claude Code 登录。一台机器上的首次发送会说明使用的是哪家服务商、哪个账号。用 `gstack-config set codex_reviews disabled` 可关闭；此后负责发送的二进制程序会拒绝执行（`not_run`、`consent_missing`），不启动任何东西，无法读取的配置也按已禁用处理。`/codex` 和 `/claude-code` 在你点名要求时仍会运行。

**不属于遥测的本地状态**。无论遥测如何设置，gstack 都会保留少量本地文件。它们是功能性状态而非使用日志，且这些文件永远不会被发送：

- **会话标记**：`~/.gstack/sessions/<pid>`，每个活跃 agent 会话对应一个空文件，在技能启动时创建、120 分钟后删除。这个数量让技能能察觉一台机器上同时有多个会话；遥测开启时，该数字就是上文的会话数。
- **项目时间线**：`~/.gstack/projects/<repo>/timeline.jsonl` 记录带分支名的技能启动与结束，供 `/context-restore` 和 `/retro` 使用。只有当你开启 `artifacts_sync_mode full` 时它才会离开本机（[docs/gbrain-sync.md](/gbrain-sync/)）。

**每次出站发送都有回执**。任何由 gstack 发起的网络发送（包括遥测）都会在发送前向 `~/.gstack/security/egress.jsonl` 写入一条哈希链式、防篡改的出站回执；若回执写不进去，敏感的汇聚端会干脆拒绝发送。用 `gstack-egress list` 审计，用 `gstack-egress verify` 校验链条（发现篡改时退出码为 3），用 `gstack-egress grants` 查看长期授权设置。台账记录的是尝试过的发送，事故因此可审计；它是审计轨迹，不是网络防火墙。

**可选的第三方桥接默认关闭，同样带回执**。目前唯一的桥接是 [Memorable 回忆桥](/memorable-workflow-memory/)，只有在你运行 `gstack-memorable enable` 之后，它才会把你的提示词交给一个本地安装的厂商二进制程序；每次交接都会先写一条回执，授权会出现在 `gstack-egress grants` 中，而厂商随后发送了什么，文档里仅以"厂商声明"的形式记录。
