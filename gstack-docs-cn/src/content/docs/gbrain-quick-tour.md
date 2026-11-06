---
title: "GBrain 与 gstack：快速导览"
---


[USING_GBRAIN_WITH_GSTACK.md](/gbrain-with-gstack/) 的精简版——完整版收录了每种场景、旗标、辅助二进制和排障步骤。本页就是 README 从前的那段介绍。

```bash
/setup-gbrain
```

四条路径，任选其一：

- **Supabase，已有 URL**——你的云端 agent 已经开通了大脑；粘贴 Session Pooler URL，这台笔记本就用上同一份数据。
- **Supabase，自动开通**——粘贴一个 Supabase Personal Access Token；技能会创建新项目、轮询到健康、取回 pooler URL、交给 `gbrain init`。全程约 90 秒。
- **PGLite 本地**——零账号、零网络，约 30 秒。大脑只隔离在这台 Mac 上。适合先试水；之后用 `/setup-gbrain --switch` 迁到 Supabase。
- **远程 gbrain MCP**——你的大脑跑在另一台机器（Tailscale、ngrok、内网 LAN）或队友的服务器上；粘贴 MCP URL 和 bearer token。可选再搭配一个本地 PGLite，在 split-engine 模式下做符号感知的代码搜索。最适合不想本地起库又要跨机器记忆的场景。

初始化之后，技能会提议把 gbrain 注册为 Claude Code 的 MCP 服务器（`claude mcp add gbrain -- gbrain serve`），这样 `gbrain search`、`gbrain put` 等就以一等类型化工具的身份出现——而不是从 bash 里 shell-out 调用。

**让大脑保持最新**。在任意仓库运行 `/sync-gbrain`，即可把该仓库的代码重新索引进 gbrain（默认增量，`--full` 全量重建，`--dry-run` 预览）。技能会经 `gbrain sources add` 把当前目录注册为联邦来源，运行 `gbrain sync --strategy code`，并向项目的 CLAUDE.md 写入一段 `## GBrain Search Guidance` 块，让 agent 优先用 `gbrain search`/`code-def`/`code-refs` 而不是 Grep。能力检查一旦失败，该块会被自动移除——不会留下指向未安装工具的过期指引。

**逐远端信任策略**。你机器上的每个仓库会被归入三个层级之一：

- `read-write`——agent 既能搜索大脑，也能从这个仓库写回新页面
- `read-only`——agent 只能搜索、绝不写入（最适合多客户顾问：搜共享大脑没问题，但别在客户 B 的仓库里把客户 A 的工作混进去）
- `deny`——完全不允许与 gbrain 交互

技能每个仓库只问一次。该决定在同一远端的所有 worktree 和分支间保持粘性。

**gstack 记忆同步（另一项功能，复用同一套私有仓库基础设施**）。可选地把你的 gstack 状态（learnings、CEO 计划、设计文档、复盘、开发者画像）推送到一个私有 git 仓库，让记忆跟着你跨机器走；配有一次性的隐私提示（全部入白名单/仅产物/关闭），还有一个纵深防御的秘密扫描器，在 AWS key、token、PEM 块和 JWT 离开你的机器之前拦下它们。

```bash
gstack-artifacts-init
```

**在 Conductor 里跑 gstack**？Conductor 会显式地从每个工作区的进程环境中剥掉 `ANTHROPIC_API_KEY` 和 `OPENAI_API_KEY`，所以付费评测和 gbrain embeddings 无法开箱即用。改在 Conductor 的工作区环境配置里设置 `GSTACK_ANTHROPIC_API_KEY` 和 `GSTACK_OPENAI_API_KEY`——gstack 的 TS 入口会在运行时把它们提升为规范名称。完整细节与"向新入口添加该导入"的贡献者清单见 [Conductor 与 GSTACK_* 环境变量](/gbrain-with-gstack/#conductor-与-gstack_-环境变量)。
