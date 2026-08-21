---
title: "basic-memory 调研报告"
description: "Basic Memory 是本地优先、MCP 原生、基于 Markdown 的个人知识图谱。它的口号是「你的 AI 再也不会忘记」。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/research-basic-memory.md"
---

# basic-memory 调研报告

> 源项目：`basicmachines-co/basic-memory`（Python，MCP 原生，markdown 落盘）。
> 既作为灵感研究，也作为我们明确背离的手工 write_note 模型的样本。

## 1. 目的与范围

Basic Memory 是**本地优先、MCP 原生、基于 Markdown 的个人知识图谱**。它的口号是「你的 AI 再也不会忘记」：笔记以纯 Markdown 文件存在于磁盘，人类（在 Obsidian、VS Code 里）与 LLM（经 MCP）都读写它们，一个 SQLite/Postgres 索引保持知识图同步。

**该模型明确是*手工的*。** 用户（或者更常见地，响应用户的智能体）调用 `write_note`、`edit_note`、`move_note` 等。对话内容**没有隐式捕获**。`README.md:317-356` 的「工作原理」示例字面就是*「让 LLM 捕获它：『做一个关于咖啡冲泡方法的笔记。』』* README 甚至把用户提示词（「为我们的项目架构决策创建一个笔记」）规定为激活步骤。代码库里没有任何自动保存对话回合的东西。最接近自动化的是 `continue_conversation` *提示词*（`src/basic_memory/mcp/prompts/continue_conversation.py:18-90`），而它只*检索*——它让模型搜索近期活动并加载上下文；从不写。

## 2. 存储模型

**Markdown 与 SQL 双份，文件是事实源。** 每条笔记是一个带 YAML frontmatter 的 Markdown 文件：

```yaml
---
title: Coffee Brewing Methods
type: note
permalink: coffee-brewing-methods
tags: [coffee, brewing]
---
```

语法定义在 `docs/NOTE-FORMAT.md`，由 `src/basic_memory/markdown/entity_parser.py:1-27` 用 `markdown-it` 加自定义 `observation_plugin` 与 `relation_plugin` 解析。三个语义原语：

- **实体**（每文件一个）：`src/basic_memory/models/knowledge.py:28-149`。持有 `title`、`note_type`、`permalink`、`file_path`、`checksum`、`mtime`、`size`、`entity_metadata`（自定义 frontmatter 的 JSON）、`external_id`（稳定 UUID）。
- **观察**：`- [category] text #tag (context)` 行，索引进 `observation` 表（`knowledge.py:220-263`）。
- **关系**：`- relation_type [[Other Entity]]` 行，索引进 `relation`（`knowledge.py:265-311`）。裸 `[[X]]` 变成 `links_to`。关系可以是*未解析的*（目标存在前 `to_id` 为 NULL），同步时自动解析。

**检索**是双栈，按 `database_backend` 配置选择（`src/basic_memory/config.py:222-226`）：

- **SQLite**：FTS5 虚拟表 `search_index`，自定义分词器 `'unicode61 tokenchars 0x2F'` 让 `/` 可检索（`src/basic_memory/models/search.py:62-94`）。语义向量经 `sqlite-vec` 虚拟表 `search_vector_embeddings`（`search.py:146-153`）。
- **Postgres**：真 `search_index` 表，带 `tsvector` GIN + `pgvector`（`search.py:17-58`），加 `pg_trgm` 做模糊链接解析（迁移 `f8a9b2c3d4e5`）。

混合检索默认：向量候选 `semantic_vector_k=100`、相似度阈值 `0.55`、模型 `bge-small-en-v1.5` 经 FastEmbed（`config.py:233-313`）。语义开启时检索类型为 `hybrid`，否则 `text`（`config.py:313-318`）。

还有一张 `NoteContent` 表（`knowledge.py:152-217`），把 markdown 正文**物化进 DB**，带 `file_write_status` 状态机（`pending|writing|synced|failed|external_change_detected`）与 `db_version`/`file_version` 做 AI 写入与人类文件编辑之间的冲突解决。

## 3. 暴露的 MCP 工具

所有工具经 `@mcp.tool` 装饰器注册并从 `src/basic_memory/mcp/tools/__init__.py:9-65` 导出。每个工具都带 MCP `readOnlyHint`/`destructiveHint`/`idempotentHint`/`openWorldHint` 标注，让智能体安全选择。每一个工具都要求**显式调用**——没有一个由服务器自己触发。

| 工具 | 标注 | 文件 |
|---|---|---|
| `write_note` | 破坏性、非幂等 | `tools/write_note.py:21` |
| `edit_note`（append/prepend/find_replace/replace_section/insert_*） | 非破坏性 | `tools/edit_note.py:225` |
| `read_note`、`view_note`、`read_content` | 只读 | `tools/read_note.py:64`、`view_note.py:13`、`read_content.py:157` |
| `delete_note` | 破坏性 | `tools/delete_note.py:184` |
| `move_note` | 非破坏性（更新链接） | `tools/move_note.py:346` |
| `search_notes`（高级：tags、status、metadata_filters、after_date、search_type=text/vector/hybrid） | 只读 | `tools/search.py:564` |
| `recent_activity` | 只读 | `tools/recent_activity.py:28` |
| `build_context`（解析 `memory://` URI、走关系图 N 跳、`depth=1..3`） | 只读 | `tools/build_context.py:114` |
| `list_directory`、`canvas`（Obsidian canvas）、`list_workspaces` | 混合 | 各处 |
| `list_memory_projects`、`create_memory_project`、`delete_project` | 混合 | `tools/project_management.py` |
| `schema_infer`、`schema_validate`、`schema_diff`（frontmatter 上的 Picoschema） | 只读 | `tools/schema.py:206-440` |
| ChatGPT 兼容 `search` / `fetch` | 只读 | `tools/chatgpt_tools.py:107-171` |
| `cloud_info`、`release_notes` | 只读 | |

随附两个 MCP **提示词**：`continue_conversation` 与 `recent_activity`（都只检索）。还有一条 `view_note` UI 工件路径。

## 4. 记忆生命周期

**没有生命周期。** 对整个 `src/` 树 grep `decay|aging|consolidat|summariz|forget|expire|ttl|prune|archive_old`——无关的 OAuth token 过期与 SQLAlchemy `expire_on_commit` 之外零命中。笔记**永远只追加**，除非人类或智能体显式调 `delete_note`、`move_note`、`edit_note`。没有自动摘要、没有自动合并重复、检索排序没有新近度加权（只有 `after_date` 过滤器）、没有「冷存储」层。`recent_activity`（`tools/recent_activity.py:28`）只是按 `created_at`/`updated_at` 查询；它不塑造记忆。

唯一的后台进程是 `WatchService`（`src/basic_memory/sync/watch_service.py:81-145`）+ `SyncService`（`src/basic_memory/sync/sync_service.py:153-188`），在 1000 ms 的 `sync_delay`（`config.py:338`）后对账文件与 DB。那是内务，不是生命周期。

## 5. 跨项目 / 跨智能体

项目是一等概念。配置持有 `Dict[str, ProjectEntry]`（`config.py:184-195`），每个带 `path`、`mode`（`LOCAL` 或 `CLOUD`——逐项目路由）、可选 `workspace_id`、与 bisync 状态。`default_project` 自动设为第一个项目（`config.py:705-711`）。

**项目解析是统一的三级链**（`docs/ARCHITECTURE.md:298-324`）：显式 `project` 参数 → 默认 → 单项目回退。每个 MCP 工具接受 `project` 与 `project_id`（UUID）参数。`get_project_client(project, ...)`（`mcp/project_context.py`）按项目路由到本地 ASGI 或云 HTTP，所以可以混用。

智能体交接上，没有特殊握手——basic-memory 同等对待所有 MCP 客户端。「交接」的故事是：智能体 A 往项目 `foo` 写笔记，智能体 B（任何指向同一项目的其他 MCP 客户端）读它们。磁盘上的 Markdown 文件是通用语。没有会话/智能体标识符、没有逐智能体的草稿区。`created_by`/`last_updated_by` 列存在（`knowledge.py:99-102`）但只在云端填充（user_profile_id），本地/CLI 为 null。

## 6. 备份与可移植性

- **默认位置**：笔记在 `~/basic-memory`（按 `BASIC_MEMORY_HOME` 环境变量，README:197），SQLite DB + 配置在 `~/.basic-memory/`（`config.py:24, 67-80`）。配置在 `~/.basic-memory/config.json`，chmod 0600。
- **可移植性**：对文件极佳（就是 Markdown——`git clone`、`rsync`、Syncthing、rclone 都行）。DB 是派生索引——`bm sync` 从文件重建它。
- **schema 迁移**：`src/basic_memory/alembic/versions/` 里 22 个 Alembic 迁移，启动时经 `get_or_create_db` 自动跑（`services/initialization.py:23-38`）。迁移同时覆盖 SQLite 与 Postgres。
- **导入器**（Claude 对话、ChatGPT 导出、`memory.json`——原版 MCP "memory" 服务器格式）在 `src/basic_memory/importers/`。
- **云同步**用 `rclone bisync`（`config.py:136-138, 164-167`），不是自定义协议——又一个可移植的选择。

## 7. 值得借鉴的优点

1. **文件是事实源、DB 是派生索引。** 任何 DB 损坏都能挺过去，与 git、版本控制、grep 相处融洽。经文件监视器 + 校验和实现双向人类/AI 编辑。
2. **每个工具上的 MCP 行为标注**（`readOnlyHint`、`destructiveHint` 等，`tools/write_note.py:23`）。智能体无需试错就能规划多步动作。
3. **激进的 `AliasChoices` 参数别名**（`write_note.py:31` 接受 `directory|folder|dir|path`；`search.py:574` 接受 `query|q|search|text`）。LLM 用训练里顺手够到的任何名字；工具吸收差异。
4. **`memory://` URI 方案 + `build_context` 图走查器**（`tools/build_context.py:114-247`）——把 wiki 链接变成可导航的上下文。比倾倒整张图干净。
5. **未解析关系是一等状态**（`knowledge.py:282`）——`to_id` 可空，目标出现后解析。前向引用直接可用。
6. **逐项目路由**，本地/云模式按项目混配，不按服务器。
7. **组合根 + 类型化客户端模式**（`docs/ARCHITECTURE.md:14-256`）让 MCP/CLI/API 入口干净可测。
8. **`NoteContent` 表**带 `file_write_status` 状态机（`knowledge.py:155-217`）处理智能体写入与磁盘上人类编辑的竞态——保留 DB 缓存的话值得复制。

## 8. 弱点 / 摩擦（避免）

1. **手工 `write_note` 仪式是头号摩擦。** 用户必须显式告诉模型「为这个做个笔记」，而模型每次调用都要决定*标题*、*目录*、*标签*、*note_type*、以及语义观察/关系语法。`write_note` 签名有 11 个参数（`write_note.py:25-45`）。整个跳过它：捕获应当是无感的（回合后摘要、自动显著度打分等）——不是模型必须记得调用的工具。
2. **永远只追加。** 没有衰减、没有整编、没有自动去重。长期运行的图积累 cruft。近期 v0.20 加了守卫让 `write_note` 冲突时*报错*而不是静默 upsert（`write_note.py:240-262`），保护了数据但把管理身份的负担推回给智能体。对智能体长期记忆，衰减/合并/整编必不可少而这里缺席。
3. **语义语法是人类书写的约定。** `- [category] text #tag (context)` 与 `- relation_type [[Target]]` 对 Obsidian 里的人类直观，但要求 LLM 每次都*正确生成*这个格式。漂移是常态。Rust 服务器可以原生存边、让 LLM 输出散文。
4. **笔记身份脆弱。** `permalink` 从标题/路径派生；重命名制造工作（`update_permalinks_on_move` 默认 `False`，`config.py:349-352`）。11 列的 `entity` 表 + 独立的 `note_content` 是要和文件保持同步的一大堆机械。
5. **没有智能体/会话模型。** 没有「谁写的」「哪个会话」「用户意图是什么」的概念。`created_by` 只为云认证存在（`knowledge.py:99-102`）。多智能体交接需要把出处烙进去。
6. **检索排序是关键词或向量、带固定的 `min_similarity=0.55`**（`config.py:307-312`）。没有新近度/重要性重排、没有使用反馈、没有逐查询学习。
7. **Markdown 事实源的取舍。** 文件系统延迟、校验和重算、FTS5 重建、断路器重试跟踪（`sync_service.py:179-281`）——一大堆基础设施只为让 DB 与文件一致。对文件只因 LLM 写过它们才存在的智能体记忆，这是没有回报的开销——保持 DB 为主、只在需要时导出 Markdown。
8. **工具面宽（约 25 个工具）。** 智能体要在 `write_note`/`edit_note`/`move_note`/`delete_note`/`read_note`/`view_note`/`read_content`/`search`/`search_notes`/`build_context`/`recent_activity`/`list_directory`/`list_memory_projects`/`canvas`/`schema_*` 里挑。即便有标注，描述工具就烧掉大量上下文。瞄准更小、更正交的一组。

**结论**：借鉴*图 + 观察 + wiki 链接*原语、*memory:// URI* 导航、*类型化客户端 + 组合根*分层、*MCP 标注*、以及*文件作可移植导出*的想法——但反转捕获模型（无感而非调用）、加生命周期（衰减/整编/摘要）、保持 DB 为主、加智能体/会话出处、并发布窄得多的 MCP 工具面。
