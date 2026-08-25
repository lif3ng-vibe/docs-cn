---
title: "v0.3 路线图"
description: "从 v0.2 顺延的条目与 M10 之后浮现的想法。这里没有任何东西已承诺到某个里程碑；这是一片停车场（parking lot）。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/v0.3-roadmap.md"
---

# v0.3 路线图

从 v0.2 顺延的条目与 M10 之后浮现的想法。
这里没有任何东西已承诺到某个里程碑；这是一片停车场（parking lot，暂存待办清单）。

## 大功能

### 整编中的规则 vs 事实消歧

**问题。** 用户有时把持久的项目规则敲给智能体——「别忘了永远不新增一个不带单元测试的函数」「我们合并前总是跑 lint」「memory 不得存 PII」。这些在 ai-memory 里落成普通观察。但它们作为项目 `CLAUDE.md` / `AGENTS.md` 里的指令更有用，因为：

- 规则需要在每个相关动作上生效；ai-memory 查询在智能体想起调用时才触发。
- 项目指令文件签入版本控制、全团队可见。

**草图。** 扩展整编器的结构化输出 schema，把每条浮出的观察分类为 `{decision, fact, rule, gotcha}`。带规则标签的条目落进单独页面 `wiki/_rules/uncommitted.md` 并浮出一条 lint 发现：

> 「这条规则不在你项目的 CLAUDE.md 里——考虑加进去，让智能体每个回合都看到，而不只在它检索记忆时。」

检测启发式：以 `always`、`never`、`don't`、`remember to`、`before X always`、`as a rule` 开头，或含 `(rule|policy|convention)`。简单，约 50 行加 lint 面。

输出*仅是建议*——ai-memory 绝不自动编辑用户的 CLAUDE.md / AGENTS.md / 项目指令文件。

### 把既有项目的历史引导进 wiki

**问题。** 今天 ai-memory 对任何项目都从空开始。对在 `git log`、`docs/`、`README.md`、代码注释里沉淀了数月决策的既有项目，那是用户已经付过一次钱的大量温热上下文，而我们扔掉了。

**草图。** 一个 `ai-memory bootstrap` 一次性子命令。输入：

- `git log --oneline -p` 过滤出有实质提交信息的（如正文 > 100 字符、约定式提交前缀、或匹配 `^(feat|fix|refactor|design):`）。
- README + `docs/*.md` + `CLAUDE.md`（如存在）。
- 代码库的模块级文档注释（`find . -name "*.rs" | xargs head -30`，语言感知）。

LLM 把这些整编成：

- 每个反复主题一页 `wiki/concepts/<topic>.md`
- 每个 ADR 形状的提交一页 `wiki/decisions/0001-…md`
- 一页总结「我对这个项目学到了什么」的引导交接页

引导页的 frontmatter 带 `tier: bootstrap`，让 lint 环节把它们当作低于会话生长页面的置信度，且正常参与衰减清扫。

**风险。** LLM 编造的细节污染 wiki。缓解：用户保留前审阅 + 提交 wiki 树（它是 git 仓库）；引导页显式打标让 `forget-sweep` 可以定向；LLM 被指示给不确定的论断加 `(needs verification)` 后缀。

### CI 矩阵收紧

目前 `ci.yml` 只在 `ubuntu-latest` 上跑 fmt + clippy + test + cargo-deny + cargo-audit + gitleaks。值得加：

- macOS runner（抓住 stat / SELinux 标签假设）
- 一步 `cargo build --release`，不发在 release 模式优化下失败的东西
- 一步 docker-build 冒烟，确认每次 push 后 `docker run --rm $IMAGE --version` 可用

## 小打磨

### 钩子脚本作为生成产物——试过，已放弃

一个从扁平的智能体 × 事件矩阵模板化脚本的 `bin/regen-hooks` 曾存在并被移除。前提不再成立：各包不再相同。智能体带着自己的事件词汇表（`CLAUDE_CODE_EVENTS`、`KIMI_CODE_EVENTS`、`KIRO_CLI_V*_EVENTS`、Devin 的 `post-compaction`……），每个 `.sh` 有 `.ps1` 伙伴，正文委托给 `hooks/_lib.sh` / `hooks/lib/ai-memory-hook.ps1`，还有若干带逐智能体行为（Claude Code 的 `hookSpecificOutput` 包装、Antigravity 的门控启动交接）。忠实还原那一切的生成器等于用 bash 重写一遍 `render_shared.rs`。

它本要防的漂移改由 `bundled_posix_and_powershell_hooks_stay_in_parity` 覆盖：该测试枚举 `hooks/` 下每个包并断言每个 `.sh` 都有发出相同 `event=`/`agent=` 的 `.ps1` 伙伴。加事件意味着加两个文件加智能体事件数组里的条目（在 `crates/ai-memory-cli/src/commands/render_shared.rs`）。

### 整编器提示词模板化

`crates/ai-memory-consolidate/src/consolidator.rs` 里的 `build_batch_request` 与 `build_request` 都靠 `push_str` 拼提示词。两个提示词用常量没问题。数量涨到四个以上时，一个小模板化辅助就开始值回成本。

### `Handoff` 字段分组——已完成

已在 #457 发布：结构体的 18 个公开字段分组为 `HandoffScope`、`HandoffOrigin`、`HandoffContent` 与 `HandoffLifecycle` 子结构体，各自 `#[serde(flatten)]`，MCP 线上 JSON 不变。

### `cargo install ai-memory` + `mise use -g github:akitaonrails/ai-memory`

状态：mise 一半完成、无需代码；cargo install 一半受阻。

`mise use -g github:akitaonrails/ai-memory` 今天已对既有带标签 GitHub Releases 可用——mise 的 GitHub 后端匹配 `ai-memory-<os>-<arch>.tar.gz` 资产命名惯例，无需插件或注册表条目，解压前验证校验和、工件证明与 SLSA 出处。文档见 `docs/install.md`。

`cargo install ai-memory` 无法按现有名字发布：crate 名 `ai-memory` 已被 crates.io 上一个无关项目占用，工作区里其他每个 crate 都依赖的基础内部 crate `ai-memory-core` 也一样。发布至少需要给 `ai-memory-core` 挑一个新的注册表名（依赖方经 `package = "..."` 保留 `ai_memory_core` Rust 路径，所以无源码改动）——这是 crates.io 发布拥有者要做的命名决定，不该单方面拍板。在此之前搁置。
