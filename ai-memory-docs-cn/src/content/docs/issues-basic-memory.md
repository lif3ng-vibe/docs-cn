---
title: "basic-memory 问题与 PR 痛点综合"
description: "2026 年 4-5 月一波几乎相同的 bug：#782、#783、#788、#793、#799、#800、#802、#803、#804、#805、#810、#820、#834。每一个都是同一形状：某个 MCP 工具忽略或错解析项目/workspace 标识符。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/issues-basic-memory.md"
---

# basic-memory 问题与 PR 痛点综合

> 来源：GitHub `basicmachines-co/basic-memory`。2026-05-21 抓取。
> 跟踪器信噪比异常高——小团队、深技术回复。
> 主导主题：同步正确性、多项目路由、嵌入安装地狱。

## 高频痛点（按排名）

### 1. 同步正确性与文件监视器可靠性——最大的单一主题

- **#580**——监视服务会在进程存活时悄悄失效（无心跳、无活体信号、macOS FSEvents 缓冲溢出时 `awatch()` 永久阻塞）。带部分修复关闭。
- **#758**——监视服务忽略 `--project` 约束，N 个并发 MCP 进程产生 N 个重叠的监视器与竞态。修一个 bug 时又*发现了三个独立 bug*。
- **#798**——监视服务在隐藏目录父级下静默丢事件（如 `~/.claude/...` 下的项目），因为 gitignore 风格 glob 把*每个*以 `.` 开头的组件当隐藏。
- **#765**——「`reset --reindex` 之后过期的 FTS 索引条目仍然存在」：靠检测 `unlink` 之后**持有旧 SQLite inode 的僵尸 MCP 进程**修复。> *「那个进程保持与旧 `memory.db` inode 的连接（已 unlink 但未释放）……新起的 MCP 进程附着到新文件。但任何被路由到僵尸 MCP 进程的工具调用查的是**旧** inode。」* 现在 `bm reset` 在 MCP 进程存活时拒绝运行（PR #776）。
- **#763**——`write_note` 在语义索引完成*之前*返回。维护者辩护说这是有意的架构，但承认 CLI 路径在进程退出时丢嵌入。
- **#839**（OPEN）——CLI `write-note` 打印 `CancelledError` 回溯，因为 `_log_task_failure` 不处理进程退出时的任务取消。与 #763 同根因。
- **#578**——*新实体在单次 sqlite-vec 加载失败后静默跳过嵌入生成*。后台任务错误即发即忘。
- **#634**——文件被外部编辑后 schema-validate 用过期的 `entity_metadata`。
- **#481**——`alembic/env.py` 在模块导入时无条件设 `BASIC_MEMORY_ENV="test"`，静默禁用了生产环境的监视服务。

### 2. 多项目 / 多 workspace 路由——v0.20 创伤簇

2026 年 4-5 月一波几乎相同的 bug：**#782、#783、#788、#793、#799、#800、#802、#803、#804、#805、#810、#820、#834**。每一个都是同一形状：某个 MCP 工具忽略或错解析项目/workspace 标识符。维护者在 #783 上：> *「permalink 每项目唯一，但项目不每 workspace 唯一……任何只持有 permalink 字符串的工具无法区分它们。」* **架构在追赶野心**：permalink 设计成二元组（project, path），后来在压力下不得不长出第三个维度（workspace）。

### 3. SQLite-vec / 嵌入提供方安装地狱

- **#735 / #767**——重复：「Windows 上 worker 连接报 no such module: vec0」。靠确保*每个*触碰 vec0 的会话都调 `_ensure_sqlite_vec_loaded` 修复。
- **#829 / #658**——仍开放的变体。
- **#741 / #681**——FastEmbed 缓存默认 `/tmp/fastembed_cache`，在 Codex CLI 这类沙箱运行时被清空，导致之后每次语义检索 `ONNXRuntimeError: NO_SUCHFILE`。
- **#830**（OPEN）——`docker-compose-postgres.yml` 发的是普通 `postgres:17` 而非 `pgvector/pgvector:pg17`；语义检索静默失败。
- **#831**（OPEN）——Postgres/asyncpg 异步引擎销毁期间 `IndexError: pop from an empty deque`。

### 4. 解析器脆弱性（markdown 作事实源）

- **#738**——解析器把 Obsidian callout 语法（`> [!note]`）捕获成观察类别。
- **#721**——行内 wikilink 附近长文本的笔记 `edit_note` 失败，因为 `relation_type` 超过 `MaxLen`。
- **#528**——云同步给已有 YAML 的文件前置了重复 frontmatter。
- **#408**——标题含未加引号冒号时 YAML frontmatter 解析失败。
- **#256**——*「编辑笔记导致它们从索引消失」*——检索索引的 DELETE 少了 `project_id` 过滤器，一个项目里的编辑把每个同 permalink 项目的检索行都清了。

### 5. 检索质量 / 分页

- **#693**——`read_note` 分页参数在 API 端点被忽略。
- **#354**——`tag:tagname` 语法被静默当作字面文本。
- **#686**（OPEN）——用户在 57 页时撞上 MCP 响应大小限制。
- **#666、#618、#603**（均 OPEN）——重排、时间衰减、长度归一化。维护者承认检索排序偏弱。

### 6. 备份 / 撤销 / git

- **#124**（2025 年 6 月起 OPEN）——基于 git 的撤销。维护者写了设计规格但 issue 仍开放：> *「何时提交一直没有显见的处理方式。每次变更都提交？隔多久提交？推到远端？冲突怎么办？」*
- **#59**——用 `git diff` 防知识损坏/删除。2025 年 3 月起 OPEN。

### 7. 手工捕获摩擦——存在但间接

**没人提过「我烦透了叫智能体记住」。** 但是：

- **#297**——Cursor + basic-memory 产出标题党进度日志（`BREAKTHROUGH - Live Data Packets Detected!`）污染检索结果。维护者关闭为**不是 basic-memory 的错、是 LLM 的**：> *「工具就是工具。你的 LLM 负责怎么用它。」* 这正是驱动手工 `write_note` 工作流的哲学承诺——把全部噪音问题转嫁给用户。
- **#669、#730、#687**（均 OPEN）——三个独立提案，要加一个*监视会话转录并自动构建知识图谱的旁挂进程*。**手工捕获就是摩擦的最强信号。** 维护者有意但未启动。

## 制造了最多问题的设计选择

| 设计选择 | 引用 | 症状 |
|---|---|---|
| 嵌入同步用后台异步 `create_task` | #763、#578、#839 | CLI 退出丢嵌入；静默跳过；CancelledError 回溯 |
| 每项目单一 permalink 空间（不按 workspace） | #783、#802、#834 | 团队启用阻塞；跨 workspace 名称冲突 |
| sqlite-vec 扩展按会话加载、不全局 | #735、#767、#829、#658 | 没加载它的连接上向量操作失败 |
| FastEmbed 缓存默认 `/tmp` | #741、#681 | 沙箱环境每次运行重下模型 |
| 无活体心跳的文件监视器 | #580、#758、#798 | 监视器静默死亡、无恢复、隐藏目录下漏事件 |
| relation_type 上的 schema 校验 `MaxLen` | #721 | 合法 markdown 编辑失败 |
| `bool \| None` 参数上的 FastMCP `AliasChoices` | #818 | JSON schema 损坏；外部客户端静默丢 bool |
| `alembic/env.py` 导入时设 `BASIC_MEMORY_ENV` | #481 | 生产环境监视服务被静默禁用 |
| 运行时内联 DDL `ALTER TABLE` 而非迁移 | #727 | 并发向量同步下 Postgres 死锁 |
| 检索索引 DELETE 无 `project_id` 过滤 | #256 | 一个项目的编辑抹掉另一项目的索引行 |

## 维护者的修复暴露了什么

- **默认值在炮火下翻转**：FastEmbed 缓存（#741）、MCP 进程存活时的 `bm reset` 行为（#765 → PR #776 加 psutil 守卫）、云同步移除 `force_full=True`（#706，之后 #804 再来一次）。
- **多项目参数事后补到几乎每个工具**：PR #777、#789、#803、#807。MCP 工具面在发布后长出了 workspace 维度。
- **为了让工具「对训练数据友好」加别名**（#766：`find_text`/`old_text`/`search` 别名），随即就把 `overwrite` *搞坏*（#818）。#841 回退。
- **困惑之后文档大扩充**：Postgres 设置（#830 仍开）、`bm cloud setup`（#779 曾把用户指向不存在的命令）。
- **范围外撤回**：#720（visible_project_ids 过滤器）以不修关闭，因为*「会把多租户可见性问题漏进本地优先的单用户产品」*。

## 仍未解决的开放 issue——以及为什么难

- **#124 基于 git 的撤销**——开放 11 个月以上。难在提交节奏无定义、markdown 树里的冲突很恶心。
- **#834 混合云模式下的本地 project_id 路由**——同一根因不断生出新症状。
- **#382 / #686 大上下文处理**——检索结果向 LLM 上下文窗口的分页仍未解决。
- **#740 启动时间**——`--help` 要 4.6s，因为 FastMCP/onnxruntime/fastembed 被急切导入。多文件懒导入重构未发布。
- **#830 / #831 / #829 Postgres + sqlite-vec 雷**——安装路径仍在惊吓用户。
- **#669 / #687 转录监视旁挂进程**——圣杯；没人造出来。

## 给 Rust 重写的具体「勿重蹈」教训

1. **不要把索引管线后台任务化到工具回复之后。** `write_note → 返回 → 稍后嵌入` 让工具变成骗子；下一次 `search_notes` 可能漏掉该实体。（#763、#578、#839、#685）。要么索引同步且有界，要么返回结构化的 `index_status: pending|complete` 让调用方能 `--wait`。

2. **身份维度从第一天烙进去。** `(workspace, project, permalink)` 是三元组。事后补装造成 12+ 个 bug（#782/#783/#788/#793/#799/#800/#802/#803/#804/#805/#810/#820/#834）。Rust schema 应在每一层编码完整坐标，哪怕只发布单 workspace 模式。

3. **对监视器，活体探测胜过正确性假设。** 长寿命文件监视器*一定会*失效。从第一天建心跳、看门狗定时器、以及「我们漏事件了吗」的对账环节。（#580、#758、#798）。把每个 notify-rs 式循环当嫌疑人。

4. **把嵌入/向量后端当作会出错的插件，不是默认在场的假设。** sqlite-vec、pgvector、FastEmbed、ONNX——每一个都咬过 basic-memory（#735、#767、#741、#681、#830、#831、#658、#829、#578）。Rust 里把嵌入器隔离在 trait 后面、后端加载不了就在启动时大声失败（不要像 #578 那样静默降级）、缓存路径别默认 `/tmp`。

5. **让 `reset` 安全。** 兄弟进程持有 inode 时 unlink SQLite = 神秘幽灵检索结果（#765）。拿独占建议锁，或破坏性操作前做 psutil 式活进程检查。

6. **运行时永不内联 DDL。** #727 的 Postgres 死锁来自运行时 `ALTER TABLE`。迁移就是迁移；绝不许「确保表存在」代码路径执行 schema 变更。

7. **对手工捕获问题**：跟踪器里*显式*抱怨的缺席是个陷阱。抱怨编码在 (a) 反复出现的转录监视旁挂提案（#669、#687、#730）、(b) 维护者关闭为「不是我们的问题」的 Cursor 污染抱怨（#297）、(c) #124 里「我们该提交什么」的犹疑。**监听 Claude Code/Codex 转录目录、无需 `@-mention` 就写笔记的 Rust 重写，会把最响的隐性疼痛变成招牌功能。**
