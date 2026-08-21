---
title: "cognee 调研报告"
description: "Cognee 自称「智能体背后的脑」——一个记忆控制平面。它摄取异构数据（文本、PDF、CSV、代码、网页），然后持续构建混合的知识图谱 + 向量索引 + 关系目录。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/research-cognee.md"
---

# cognee 调研报告

> 源项目：`topoteretes/cognee`（Python，知识图谱 + 向量 + 关系，MCP 服务器）。

## 1. 目的与范围

Cognee 自称**「智能体背后的脑」——一个记忆控制平面**（`README.md:40,67`）。它摄取异构数据（文本、PDF、CSV、代码、网页），然后持续构建混合的**知识图谱 + 向量索引 + 关系目录**，让智能体既能按含义（嵌入）也能按结构（图关系）检索上下文。当前公开 SDK 刻意极简——四个动词：`remember`、`recall`、`forget`、`improve`（README L127）。内部它们映射到更老的 `add`/`cognify`/`search`/`prune` 原语。Cognee 把自己定位在 RAG 检索器与「公司大脑」之间，带多租户隔离、本体接底、以及一个捕获智能体轨迹的 Claude Code 插件。

## 2. Cognify 管线（系统心脏）

管线由 `run_pipeline` 执行的一列 **`Task` 对象**组成。规范定义在 `cognee/api/v1/cognify/cognify.py:316-344`：

```python
default_tasks = [
    Task(classify_documents),                                  # EXTRACT
    Task(extract_chunks_from_documents, ...),                  # EXTRACT
    Task(extract_graph_and_summarize, graph_model=..., ...),   # COGNIFY（LLM）
    Task(add_data_points, embed_triplets=embed_triplets, ...), # LOAD
    Task(extract_dlt_fk_edges),                                # LOAD（关系外键边）
]
```

逐步：

1. **文档分类**（`cognee/tasks/documents/classify_documents.py`）。把每个裸 `Data` 行包进类型化的 `Document` 子类（`PdfDocument`、`TextDocument`、`DltRowDocument` 等），让下游分块器知道怎么读内容。

2. **文档分块**（`cognee/tasks/documents/extract_chunks_from_documents.py` + `cognee/modules/chunking/TextChunker.py:1-60`）。默认 `TextChunker` 用 `chunk_by_paragraph` 把段落打包到 `max_chunk_size` token（按 `min(embedding_max_completion_tokens, llm_max_completion_tokens // 2)` 计算）。每块成为一个带 `metadata={"index_fields": ["text"]}` 的 `DocumentChunk` DataPoint——那些 `index_fields` 是存储层后来知道要嵌什么的方式。

3. **提取图 + 摘要**（`cognee/tasks/graph/extract_graph_and_summarize.py:21-37`）。经 `asyncio.gather` 在每块上并发两个 LLM 任务：
  - `extract_graph_from_data`（`cognee/tasks/graph/extract_graph_from_data.py:128-222`）对每块调 `extract_content_graph(chunk.text, graph_model, custom_prompt)`——一个 `instructor`/`litellm` 背书的结构化调用，返回 `Node`/`Edge` 的 Pydantic `KnowledgeGraph`。缺源/目标的边被过滤（L181-188）。实体节点随后经 `expand_with_nodes_and_edges(..., ontology_resolver, ...)`（L110-112）对照本体校验。出处被盖到每个 DataPoint 上（`_stamp_provenance_deep`，L30-53）。既有边经 `retrieve_existing_edges` 去重。
  - `summarize_text` 为每块产出 `TextSummary`，供之后「SUMMARIES」检索用。

4. **持久化节点、边与嵌入**（`cognee/tasks/storage/add_data_points.py:30-149`）。`get_graph_from_model` 递归把 Pydantic 图走成 `(nodes, edges)` 元组，然后 `deduplicate_nodes_and_edges` 去重。管线按 `EngineCapability.HYBRID_WRITE` 分支：
  - 混合后端（如 Postgres+pgvector）：一个事务里 `graph_engine.add_nodes_with_vectors(nodes)`。
  - 否则并行写：`graph_engine.add_nodes(nodes)` + `index_data_points(...)` 到向量引擎。
  - `embed_triplets=True` 时，构造 `(source -› relation -› target)` 文本串并作为额外 `Triplet` DataPoint 嵌入（L184-265）。这正是让图走查检索可按相似度命中的东西。

5. **DLT 外键边**——为摄取的 SQL/DLT 背书数据集加确定性的外键边，零 LLM 成本。

还有一条平行的**时间**管线（`cognify.py:347-392`），把图提取器换成 `extract_events_and_timestamps` → `extract_knowledge_graph_from_events`，构建时间感知的图。

## 3. 存储后端——三栈、可插拔

Cognee 总是并行用三个存储，由 `UnifiedStoreEngine` 抽象（`cognee/infrastructure/databases/unified/unified_store_engine.py:11-66`）：

| 层 | 默认 | 其他支持 |
|---|---|---|
| **图** | `ladybug`（Kuzu fork，基于文件） | `neo4j`、`postgres`（AGE 式）、`kuzu`、`ladybug-remote`、`neptune`、`neptune_analytics`（混合） |
| **向量** | `lancedb`（基于文件，子进程隔离） | `pgvector`、`chromadb`、`neptune_analytics` |
| **关系** | `sqlite`（aiosqlite） | 经 SQLAlchemy async 的 `postgres` |

选择**由环境驱动**：`GRAPH_DATABASE_PROVIDER`、`VECTOR_DB_PROVIDER`、`DB_PROVIDER`，带归一化凭据。还有个 `USE_UNIFIED_PROVIDER=pghybrid` 短路，让单个 Postgres 实例同时背书图+向量+关系。

两个 `EngineCapability` 标志（`HYBRID_WRITE`、`HYBRID_SEARCH`）让管线按「节点+向量能否落进一个事务（省一次往返）还是需要两次写」分支。

默认的仅本地栈因此是：**SQLite + LanceDB + Ladybug/Kuzu**，全部基于文件——不需要服务器。家庭实验室对齐的话，这就是精简配置。

## 4. 检索

召回是**多策略且自动路由**的。`SearchType` 枚举（`cognee/modules/search/types/SearchType.py`）列出 16 个策略：`GRAPH_COMPLETION`（默认）、`GRAPH_COMPLETION_COT`、`GRAPH_COMPLETION_CONTEXT_EXTENSION`、`GRAPH_COMPLETION_DECOMPOSITION`、`GRAPH_SUMMARY_COMPLETION`、`RAG_COMPLETION`、`TRIPLET_COMPLETION`、`CHUNKS`、`CHUNKS_LEXICAL`、`SUMMARIES`、`CYPHER`、`NATURAL_LANGUAGE`、`TEMPORAL`、`FEELING_LUCKY`、`CODING_RULES`、`AGENTIC_COMPLETION`。

`recall()` API（`cognee/api/v1/recall/recall.py:314-513`）经 `route_query(query_text)` 选一个——`query_router.py` 里**基于规则的分类器**（「when/before/after」的正则 → `TEMPORAL`、关键词片段 → `CHUNKS_LEXICAL`、多跳措辞 → `GRAPH_COMPLETION_COT` 等）。默认回退 `GRAPH_COMPLETION`。

旗舰检索器是 `GraphCompletionRetriever`（`cognee/modules/retrieval/graph_completion_retriever.py`）。它用 **`brute_force_triplet_search`**（`cognee/modules/retrieval/utils/brute_force_triplet_search.py:216-355`）：

1. 嵌入查询，**跨多集合并行向量检索**：`Entity_name`、`TextSummary_text`、`EntityType_name`、`DocumentChunk_text`、`EdgeType_relationship_name`（L281-290）。
2. 把结果投进 `CogneeGraph` 记忆片段，用带 `triplet_distance_penalty` 与 `feedback_influence` 的节点+边组合相似度给三元组打分（L318-333）。
3. 可选地从顶部种子节点扩 `neighborhood_depth` 跳。
4. 把前 K 条边解析成自然语言句子（`resolve_edges_to_text`）。
5. 以 `graph_context_for_question.txt` 作用户提示词喂给 LLM 补全。

召回还支持**会话缓存先过**（对关系会话表里近期 QA 条目的关键词匹配），会话未命中时**落入图**（`recall.py:382-397, 447-457`）。这就是「混合工作记忆 + 长期记忆」模式。

## 5. 记忆生命周期——Cognee 确实会重组

Cognee 在一次性摄取之外有显式的**记忆富化**。`improve()` API（`cognee/api/v1/improve/improve.py:36-232`）跑至多五个阶段：

1. **反馈权重**：带赞/踩评级的会话条目调整*回答时用到的那些*图节点/边上的 `feedback_weight`（`apply_feedback_weights_pipeline`，L284-299）。经检索时记录的 `used_graph_element_ids` 跟踪。评级更高的答案抬升其源节点；更低的压低。
2. **持久化会话问答**：把会话转录 cognify 进带 `node_set="user_sessions_from_cache"` 标签的永久图。
3. **三元组富化 / memify**：`cognee/memify_pipelines/create_triplet_embeddings.py` 构建并嵌入新三元组数据点。
4. **全局上下文索引**：`global_context_index_pipeline` 在全部文本摘要上构建桶+根摘要。
5. **图 → 会话同步**：把近期新增的图边增量拷进会话缓存成 JSON 行，让活着的智能体无需重新查询就拿到新知识。

还有一条 **`consolidate_entity_descriptions.py`** 管线（`cognee/memify_pipelines/consolidate_entity_descriptions.py`），走实体节点、取邻居+边、并经 LLM 重写其 `description` 字段（Pydantic `NodeDescription`）。`apply_frequency_weights.py` 按使用频率老化知识。去重发生在写入时（`add_data_points.py`）与提取时（`retrieve_existing_edges`）。

所以：**不是一次性的。** 有清晰的反馈环、摘要整编与边老化概念。没有自动衰减/TTL，但 `feedback_weight` 与 `frequency_weight` 给了你操纵杆。

## 6. MCP 集成

有，在 `cognee-mcp/`——带自己 pyproject 的兄弟项目。服务器（`cognee-mcp/src/server.py`）用官方 `mcp` SDK 走 stdio/SSE/HTTP。**公开暴露的工具刻意极简**（L1076-1222）：

- `remember(data, dataset_name?, session_id?, custom_prompt?)`——带 `session_id` 时快写会话缓存；不带则跑完整 `add + cognify` 管线。
- `recall(query, search_type?, datasets?, session_id?, top_k=10)`——自动路由检索类型。
- `forget(dataset?, everything=False)`——跨三个存储删除。

有*内部*工具注册但 API 模式不暴露：`cognify`、`search`、`list_data`、`delete`、`prune`、`improve`，加一组 UI 捆绑（`visualize_graph_ui`、`upload_file_ui`、`open_cognee_workspace`、`cognify_file`）——从 `src/app_bundles/visualize-graph.html` 打开内嵌 HTML 工作区。

**值得注意的设计选择**：逐 MCP 客户端自动命名数据集（`cursor_vscode_memory`、`claude_code_memory`），不同智能体不互相污染记忆——除非传 `dataset_name="main_dataset"` 选择共享。用 `COGNEE_MCP_AGENT_SCOPED=false` 切换。

MCP 集成是**手工的**，即智能体显式调 `remember`/`recall`。Claude Code 插件（独立仓库 `cognee-integrations`）经 Claude Code 生命周期钩子（`SessionStart`、`PostToolUse`、`UserPromptSubmit`、`PreCompact`、`SessionEnd`）自动化它——见 README L204。

## 7. 运维关切

**部署**：顶层 `Dockerfile` 构建 FastAPI 服务器；`cognee-mcp/Dockerfile` 构建 MCP 服务器。`docker-compose.yml` 在 8000 端口发 API，**资源限额 4 CPU + 8 GB RAM**——不小。部署目标含 Cognee Cloud、Modal、Railway、Fly.io、Render、Daytona（`distributed/deploy/`）。

**每次摄取的 LLM 成本**：重。对*每个*块，cognify 跑：

- 1 次结构化提取调用（实体/关系 → Pydantic KnowledgeGraph）
- 1 次摘要调用
- N 次嵌入调用（每 Entity/EntityType/DocumentChunk/TextSummary/EdgeType 行一次，加可选 Triplet 行）

一份 100 块的文档轻松产生 200+ 次 LLM 调用加数百次嵌入。`chunks_per_batch` 默认 100；`LLM_RATE_LIMIT_*` 环境变量存在但默认关。

**需要 API key**：`LLM_API_KEY` 必需——除非你经 `ollama`/`huggingface` extras 指向本地模型。默认提供方是 OpenAI（`openai>=1.80.1` 是核心依赖）。经 `litellm` 默认用它自己的嵌入模型。

**仅本地栈**：SQLite + LanceDB + Ladybug 意味着存储层**无外部服务**，但 LLM 才是成本大头。把 OpenAI 换成 Ollama 变成吃 CPU/GPU 但免费。

## 8. 最值得采纳的想法

1. **任务列表管线组合。** `cognify.py:316-344` 读起来像一份数据流食谱。每个 `Task` 是带 `batch_size` 配置与上下文对象的薄包装。这是移植到 Rust 最干净的模式——管线表示为类型化的 `Vec<Box<dyn Task>>`，让任务声明自己的批处理行为。

2. **三元组嵌入是一等公民。** 直接嵌 `(source -› relation -› target)` 文本（`add_data_points.py:184-265`）是让图可按语义相似度检索、可走查的诀窍。这真正是「向量 RAG」与「图 RAG」之间的桥。

3. **能力标志驱动的存储门面。** `UnifiedStoreEngine.has_capability(HYBRID_WRITE)` 让同一条管线定位分离的 `(Kuzu, LanceDB)` 或融合的 `(Postgres+pgvector)`，而无需条件散落各处。

4. **带反馈权重的 `improve()` 生命周期。** 图元素上的 `feedback_weight` 加检索轨迹里的 `used_graph_element_ids` 是个锋利的想法——它给你分级知识而无需重训任何东西。

5. **召回时多集合向量检索。** 并行查询 `Entity_name`、`TextSummary_text`、`DocumentChunk_text` 与边集合并按三元组分数合并，而不是挑一个索引，是核心检索动作。

6. **出处盖戳**（`_stamp_provenance_deep`）——每个 DataPoint 带 `source_pipeline` + `source_task`，让图可调试。

## 9. 对精简家庭实验室的现实缺点

- **依赖重量**：40+ 核心依赖——`openai`、`litellm`、`instructor`、`sqlalchemy`、`aiosqlite`、`lancedb`、`pylance`、`ladybug`、`networkx`、`pypdf`、`fastapi`、`fastapi-users`、`rdflib`、`langdetect`、`datamodel-code-generator`、`tiktoken`、`tenacity`、`aiolimiter`、`diskcache`、`fakeredis`，加可选 extras（neo4j、chromadb、postgres、anthropic、ollama、huggingface、scraping、dlt、monitoring）。冷安装巨大——`poetry.lock` **1.4 MB**。
- **到处 Python async + LRU 缓存的引擎句柄**（`closing_lru_cache`）——调试过期适配器问题需要加 `_GraphEngineHandle`（见 `get_graph_engine.py:56-105` 那 50 行 docstring）。这是你继承的复杂度。
- **每次 cognify 的 LLM 成本**高。没有显眼的「这个块哈希我已经提取过实体了」缓存——重摄取重复劳动。`incremental_loading=True` 有帮助但只在数据集级。
- **要备份三个数据库**、要迁移三个。翻 `ENABLE_BACKEND_ACCESS_CONTROL` 就得擦 `.cognee_system/` 的告示（cognee-mcp/README L518-525）说明多存储协调很脆弱。
- docker-compose 里 **8 GB RAM 限额**是推荐下限。LanceDB + Kuzu + 嵌入模型同时加载，对低端 NAS 很重。
- **`ladybug` 的 bus factor**——同一组织钉在 0.16.0 的 Kuzu fork。他们停止维护，你就被绑在单一供应商的图数据库上。
- **两层 MCP API**：公开 3 个工具 + 10 个以上「内部」工具意味着 API 面在动；不稳定。

对 Rust 家庭实验室 MCP 服务器，**精简等价物**是：SQLite（关系）+ 单一内嵌向量存储（如 `lancedb-rs` 或内嵌 `sqlite-vec`）+ 内嵌图数据库（CozoDB、SurrealDB、或就带正经索引的 SQL 表）——然后移植*任务管线 + 三元组嵌入 + 能力标志模式*，完全跳过 FastAPI/users/migrations/UI 捆绑栈。

### 关键文件参考

- 管线定义：`cognee/api/v1/cognify/cognify.py:316-344`
- 图提取（LLM 调用点）：`cognee/tasks/graph/extract_graph_from_data.py:128-222`
- 三存储写路径：`cognee/tasks/storage/add_data_points.py:62-149`
- 三元组嵌入：`cognee/tasks/storage/add_data_points.py:184-265`
- 向量后端工厂：`cognee/infrastructure/databases/vector/create_vector_engine.py:150-318`
- 图后端工厂：`cognee/infrastructure/databases/graph/get_graph_engine.py:241-457`
- 统一门面：`cognee/infrastructure/databases/unified/unified_store_engine.py:11-66`
- 检索（图+向量混合）：`cognee/modules/retrieval/utils/brute_force_triplet_search.py:216-355`
- 图补全检索器：`cognee/modules/retrieval/graph_completion_retriever.py`
- 召回 + 自动路由：`cognee/api/v1/recall/recall.py:314-513`、`cognee/api/v1/recall/query_router.py`
- Improve / 生命周期：`cognee/api/v1/improve/improve.py:36-411`
- Memify 管线：`cognee/memify_pipelines/`
- MCP 服务器：`cognee-mcp/src/server.py:1076-1222`
- 依赖与 extras：`pyproject.toml:22-160`
