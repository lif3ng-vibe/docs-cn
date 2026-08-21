---
title: "可选伴随 crate 与项目"
description: "本页记录功能想法的边界：它们在 ai-memory 周边有用，但不应该成为核心 ai-memory 的表面积。PR #118 与 PR #123 是历史动因。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/companion-crates.md"
---

# 可选伴随 crate 与项目

本页记录功能想法的边界：它们在 ai-memory 周边有用，但不应该成为核心 ai-memory 的表面积（surface area）。PR #118 与 PR #123 是历史动因：两者都是正当的产品想法，但都把太多导入、聊天、UI 与变更行为补进了核心服务器。更好的形态是可选的伴随软件，经公共 API 编排 ai-memory。

ai-memory 保持为记忆基底：

- 一个服务器二进制拥有钩子、MCP、markdown wiki、SQLite 索引、认证、准入 webhook 与内置只读浏览器；
- wiki 保持 markdown-in-git 的事实源地位；
- SQLite 保持派生索引；
- 写入经既有的 wiki 变更路径、admin 端点或 MCP 工具；
- 内置的 `/web` 与 `/api/v1` 面保持面向读取。

伴随 crate 可以是更重的产品。它们应经公共 HTTP/MCP 面集成，而不是把处理器、路由或命令面补进核心 workspace。

## 伴随项目的集成规则

伴随项目可以：

- 调用只读的 `/api/v1` 端点获取 workspaces、projects、pages、search、graph、最近页面与简报/总览快照；
- 以智能体/客户端身份运行时调用既有 MCP 工具，如 `memory_write_page`、`memory_delete_page`、`memory_read_page`、`memory_query`；
- 以操作者侧服务器进程身份运行并持有合适 bearer token 时，调用既有 admin 端点如 `/admin/write-page` 与 `/admin/delete-page`；
- 用 `--web-ui-dir` 让 ai-memory 托管一个替代静态 SPA——前提是 SPA 仍用公共 HTTP API、不需要进程内插件；
- 运行自己的 LLM 提示词、导入变换、队列、确认流、UI 状态与项目专属策略；
- 发布自己的 CLI 二进制、Web 服务器、Docker 镜像、测试、发布节奏与文档。

伴随项目不应该：

- 默认成为核心 ai-memory 的 Cargo workspace 成员；
- 增加核心 MCP 工具、admin 端点或 CLI 子命令——除非缺失的接缝（seam）对 ai-memory 自身独立有用；
- 直接写 wiki 文件或 SQLite 行；
- 绕过 `AuthLevel::authorize`、准入 webhook、行为者归因、作用域解析或单写入器存储边界；
- 要求 ai-memory 在进程内托管任意插件代码。

伴随功能应被当作独立产品对待，而不是被否决的想法。它们可以比核心跑得快、有自己的 UX、承载来源专属或工作流专属的行为，而不拓宽 ai-memory 的默认安装。

伴随项目若暴露浏览器写入，必须实现自己的服务端变更代理（mutation broker）。浏览器对话伴随项目；伴随项目带操作者 token 对话 ai-memory。这样 CSRF、确认、审计、限流与 UI 专属策略都留在核心服务器之外。

## `ai-memory-importer`：迁移与摄取伴随项目

这是 PR #118 的伴随形态。第一个实现的伴随项目位于 [`companions/ai-memory-importer`](https://github.com/akitaonrails/ai-memory/tree/main/companions/ai-memory-importer)，是带自己 `[workspace]` 的独立 Cargo 包；它不是根 workspace 成员、不被根 `cargo test --workspace` 覆盖。

### 目标

导入或归一化既有记忆语料，而不让 ai-memory 核心包揽每种来源格式与迁移工作流。

初始来源支持刻意收窄：

- oh-my-claudecode / OMC 的扁平 markdown wiki 目录。

未来来源可以包括：

- Claude Code 记忆图导出，如 `@modelcontextprotocol/server-memory` 的 `memory.jsonl`；
- Qdrant 支撑的记忆集合（用户提供集合 URL 与 schema 映射时）；
- 未来按伴随项目自己的发布节奏维护的一次性导入器。

### 验证

从仓库根显式运行伴随项目检查：

```bash
cargo fmt --check --manifest-path companions/ai-memory-importer/Cargo.toml
cargo test --manifest-path companions/ai-memory-importer/Cargo.toml
cargo clippy --manifest-path companions/ai-memory-importer/Cargo.toml --all-targets -- -D warnings
```

根卫生检查保持独立：

```bash
cargo fmt --check
git diff --check
```

### 产品形态

优先独立仓库加二进制 crate，例如：

```text
companions/ai-memory-importer/
├── Cargo.toml
├── src/main.rs
└── README.md
```

以后只有当共享的 Rust 库以稳定 API 发布且在 ai-memory 之外有用时才共享。它不需要成为本 workspace 的成员。

### 它怎么对话 ai-memory

读取与规划：

- 用 `/api/v1/workspaces`、`/api/v1/projects`、`/api/v1/pages`、`/api/v1/search`、`/api/v1/graph` 检视目标；
- 默认 dry-run，打印计划中的页面写入而不改动 ai-memory。

写入：

- 导入或归一化的页面经 `/admin/write-page` 或 MCP `memory_write_page` 写入；
- v1 不做删除；
- 用 `memory_query` / `memory_read_page` 或 `/api/v1/search` / 页面读取做重复检测与上下文检查；
- 可选地在导入后调 `memory_consolidate` 或 `memory_auto_improve` 做导入后精修，而不是把精修建进核心；
- 批量操作循环走公共的单页操作——除非 ai-memory 日后出于自身原因增加通用批量变更接缝。

按类别归位（re-home）：

- 在伴随项目里计算移动/链接重写计划；
- 移动实现为对新路径的正常写入加对旧路径的删除；
- 保留 ai-memory 页面读取返回的 frontmatter；
- 碰撞、缺页或源哈希变化时失败关闭。

### 安全要求

- 绝不直接打开 ai-memory 的 SQLite 数据库或 wiki 目录。
- 要求显式的目标 workspace/project。
- 只保留公共写入面支持的元数据（`title`、`kind`、`tier`、`tags`、`pinned` 与正文）——除非未来某个通用核心接缝加宽 frontmatter 支持。不要在伴随导入里声称任意 frontmatter 或作者保留。
- 在伴随侧状态里携带幂等键或源指纹，让失败的导入可安全续跑。
- live 模式之前，所有破坏性动作在 dry-run 输出里可见。
- 非覆盖检查按尽力而为对待——除非/直到核心暴露通用的比较并写入接缝；伴随 v1 在每次写入前重查，但无法让那次读取与 `/admin/write-page` 原子。
- LLM 归一化保持可选；确定性导入应无 LLM 也能工作。
- 提供方专属的性能微调（如模型参数改动）不要放进导入器 PR。ai-memory 核心需要提供方修复或优化时，作为小的独立核心变更落地。

### 实施计划

1. 为一种来源格式构建只读规划器与快照夹具。
2. 加 dry-run 输出与碰撞检测。
3. 经既有 ai-memory 公共写入/删除面加 live 写入。
4. 加可选的 LLM 归一化作为伴随侧的一道工序。
5. 导入稳定后，把归位/链接重写做成单独子命令。
6. 只有在反复使用之后，才考虑 ai-memory 核心是否缺少一个小的通用 API 接缝；不要从给核心端点打补丁开始。

## `ai-memory-web-editor`：浏览器聊天/编辑器伴随项目

这是 PR #123 的伴随形态。

状态：**未定**。没有一次新的设计评审之前不要实现这个伴随项目。有用的可写版本比初看起来大：它需要安全的核心比较并写入接缝、伴随变更代理、浏览器认证/CSRF、确认状态、diff、冲突处理、审计与后续的 LLM 提案策略。不清楚这些复杂度是否给 ai-memory 的主目标带来足够收益。系统的意义在于经捕获、整编、评审、待写入与评审门自动改进自己的记忆；手工记忆编辑可能不如看起来有价值，还可能分散对自动循环的改进。

### 目标

提供更丰富的浏览器产品做聊天、编辑与策展，而不把内置 `/web` 浏览器变成可写的应用。

核心内置浏览器刻意保持小巧：项目列表、树视图、markdown 渲染、检索与其他面向读取的检视。独立的 Web 编辑器可以跑得更快、做更强的产品决策。

### 产品形态

优先独立仓库加后端与前端，例如：

```text
ai-memory-web-editor/
├── crates/server/        # 认证、CSRF、变更代理、LLM 编排
├── crates/client/        # UI 或生成的资产
├── src/                  # 初期保持单一二进制 crate 时
└── tests/e2e/
```

伴随项目可以部署在 ai-memory 旁边，经反向代理挂在独立路径或主机下（例如 `https://memory.example.com/editor`），而 ai-memory 保持在 `/api/v1`、`/mcp`、`/admin`、`/hook`、`/web`。

### 它怎么对话 ai-memory

读取：

- 用 `/api/v1` 获取项目列表、页面、最近页面、检索、图、简报与总览数据；
- 聊天编排需要超出裸页面/检索上下文的东西时，用伴随项目自己的 LLM 提供方。

写入：

- 浏览器请求发给伴随后端，不直接发给 ai-memory 的 admin 路由；
- 伴随后端做 CSRF 检查、用户/会话策略、限流与确认状态；
- 批准之后，它带服务端 token 调用 ai-memory 既有的写入/删除面。

变更流程：

1. LLM 把补丁、创建或删除提议为待处理动作。
2. UI 展示显式 diff 与目标 workspace/project/path。
3. 用户确认或拒绝待处理动作。
4. 伴随项目重读当前页面并校验预期的基础哈希。
5. 伴随项目经 ai-memory 公共变更路径应用写入/删除，并记录自己的审计轨迹。

### 安全要求

- 不自动应用来自 LLM 响应的浏览器写入。
- 删除永远要求显式确认。
- 编辑保留既有元数据，除非用户刻意更改。
- 文件夹或检索作用域是上下文限制，不是变更边界；后端必须在应用变更前独立授权目标页面。
- UI 若宣传文件夹作用域的编辑，伴随项目必须在服务端强制目标路径留在允许的文件夹或项目内。
- 伴随项目不得依赖 cookie/basic 认证从浏览器执行非 GET 的 ai-memory 变更。用服务端 token 加伴随项目的 CSRF/会话保护。
- 多用户模式下 `/admin/*` 仅 root。伴随项目要么带操作者 token 运行，要么用适合该行为者的 MCP/工具流；不得假设普通用户 token 能做 admin 写入。
- 公共写入面支持时传播行为者/作者上下文，让准入 webhook 与审计保持有意义。
- 保持 `/api/v1` 只读；不要要求核心 ai-memory 为这个产品暴露可写 CORS 浏览器端点。

### 实施计划

这个计划刻意停放着，直到收益更清楚。

1. 先对着 `/api/v1` 构建只读编辑器外壳。
2. 加选中页面/检索上下文之上的聊天，仍只读。
3. 加带 diff 预览的待处理编辑提案，但没有应用按钮。
4. 经伴随后端与 ai-memory 公共写入端点加确认写入。
5. 最后加确认删除。
6. 保持内置 `/web` UI 不变——除非核心 ai-memory 出于自身需要一次小的只读 API 增强。

## 何时把接缝挪进核心

伴随项目可能揭示一个属于 ai-memory 的缺失原语。只把小的通用接缝挪进核心，且只在伴随项目证明需要之后。

好的核心候选：

- 多个客户端都需要的只读 API 字段；
- 等价于既有 MCP 工具的窄作用域变更端点；
- 防止安全逻辑重复的能力检查或作用域解析辅助。

差的核心候选：

- 来源专属的导入解析器；
- UI 工作流；
- 编辑用的 LLM 聊天提示词；
- 项目专属的打分、修剪或归一化策略；
- 伴随项目专属的 admin 命令。

这让 ai-memory 保持稳定，同时仍允许更丰富的工具在它周围生长。
