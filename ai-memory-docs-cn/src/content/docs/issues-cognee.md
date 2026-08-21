---
title: "cognee 问题与 PR 痛点综合"
description: "2026 年每个提供方都出过线上协议级 bug。"
source: "https://github.com/akitaonrails/ai-memory/blob/main/docs/issues-cognee.md"
---

# cognee 问题与 PR 痛点综合

> 来源：GitHub `topoteretes/cognee`。2026-05-21 抓取。
> 跟踪器画像：约 40% 功能请求（高评论数）、约 40% 下一版即关的 bug、约 20% 卡在架构接缝上真正难的仍开放 bug。

## 高频痛点（按排名）

### A. LLM 适配器脆弱（量最大、翻新最快）

2026 年每个提供方都出过线上协议级 bug。

- Anthropic 适配器丢 `max_tokens`，每次调用 HTTP-422（#2749、#2782——**连续两个发布都带着坏掉的 Anthropic 出货**）。
- Ollama / LlamaCpp 适配器缺 `@observe` 装饰器（#2820）。
- vLLM 挂起，因为 system 消息发在 user 消息之后（#2537）。
- vLLM「custom」提供方不把 `LLM_ENDPOINT` 转发给 LiteLLM（#2412、#2430、#2842）。
- LiteLLM 的 `model_cost` 查表覆盖用户的 `LLM_MAX_COMPLETION_TOKENS`（#2608，#2613、#2582 修复）。
- HTTP/2 流停顿导致顺序 Anthropic 调用 60s 超时（#2607）。
- 非 OpenAI 提供方的预检 LLM 连接测试永久挂起（#2752、#2123、#2380）。
- 本地 OpenAI 兼容的 LM Studio / Ollama 在 macOS 上挂起（#2119、#1743、#1742）。
- **开放未解**：「思考 token + Instructor 不兼容导致的严重性能退化」（#2840）。用户补丁给出根因：`response_model=str` 时，instructor 把 `str` 包进 llama.cpp 不认的 JSON/工具 schema；LLM 返回纯文本、instructor 解析失败，然后 **tenacity 每次尝试睡 8-128s**。LiteLLM 静默丢弃 `chat_template_kwargs`、`reasoning_effort` 这类非标准顶层 kwarg，需要一个 `extra_body` 垫片。

**造成这一切的根源设计选择**：LiteLLM + Instructor 作为通用 LLM 网关。两者翻新都快；都静默丢弃不认识的 kwarg；都把 OpenAI 专属假设烤进结构化输出路径。

### B. 多存储协调与数据完整性 bug

「图 + 向量 + 关系」三件套存储是 cognee 的架构承诺，也是持续高严重度 bug 的来源。

- `EntityAlreadyExistsError`——`Entity("institution")` 与 `EntityType("institution")` 在 UUID 上碰撞（#2510）。第二次 `cognify` 炸了。
- `add_data_points` 的并行 DB 操作造成 SQLite `database is locked` 死锁；**1.0.2 仍可复现**：`multiple PipelineRunErrored ... elapsed 561s before crash`（#2717，OPEN）。
- 大批次（约 4356 条边）`upsert_edges` 时 `cognify` 超出 asyncpg 绑定参数上限（#2829，#2798、#2586 分批修复）。
- `add_data_points` 遇 null 字节（0x00）崩 `asyncpg.CharacterNotInRepertoireError`（#2612，OPEN）。
- `index_data_points`：metadata 字典浅拷贝——只嵌第一个 `index_field`（#2529，OPEN）。
- `get_graph_from_model + copy_model` 丢用户定义的 DataPoint id（#2633，OPEN）。
- `retrieve_existing_edges` 的边去重无效（#2557）。
- `delete_dataset` 在非 "public" Postgres schema 里失败（#2291）。
- **共享数据：从一个数据集删除会把共享它的其他数据集里的同样数据一起抹掉**（#2732，OPEN）。
- `/api/v1/cognify` 的 N+1 查询模式（#2532，OPEN）。
- KuzuAdapter 在 0.5.1 上写入只见于内存、不持久化到磁盘（#1981）。
- `brute_force_triplet_search` 的逐集合距离归一化产出错误排序（#2030，修复 #2451 移除归一化，**随后 #2720 冒出下游问题**）。

### C. 召回质量回归——记忆服务器输不起的 bug

- **#2720（OPEN）**：「图补全检索无论查询什么都返回相同子图」。用户搭建的复现器显示直接查 LanceDB 时不同查询返回不同 top-K，但 cognee 的 `/api/v1/search` 返回约相同的答案——LanceDB 的 ID 没有传播进图投影。用户归因于 #2451 的余波：`brute_force_triplet_search.py` 里下游阈值仍预期 #2451 之前的 [0,1] 尺度，静默回退到未过滤的图。
- `SearchType.CHUNKS` 静默忽略 `node_name` 过滤（#2815）。
- `ENABLE_BACKEND_ACCESS_CONTROL=false` 时 `CHUNKS/SUMMARIES/GRAPH_COMPLETION` 忽略 `datasets=` 过滤器（#2867——维护者的回答基本是「数据集只在开访问控制时可用」）。
- cognee-mcp 的 GRAPH_COMPLETION 丢弃第一个以外的所有数据集（#2617）。
- `TemporalRetriever` 只支持事件，阻塞本体级的时间过滤（#2429，以被内部 Q2 重设计取代关闭——未发布）。
- GRAPH_COMPLETION 不检索自定义 DataPoint 向量集合（#2495）。

### D. 依赖安装地狱

- macOS arm64 + Python 3.14：`kuzu` wheel 不存在；快速开始失败（#2753）。
- `ModuleNotFoundError: No module named 'kuzu' in Docker since v1.0.4`（#2775）——kuzu 移除了但镜像没重建。
- `fastembed` 整个从 Docker 镜像移除，因为它的一个传递依赖不是 Apache/MIT（#2807）。
- LiteLLMEmbeddingEngine 把 `BAAI/bge-m3` 截断成 `bge-m3`（#1915）。
- `embedding_dimensions` 无论什么模型都默认 3072——每个非 3072 维嵌入器都坏（#2751，修复 #2757）。
- LanceDB lance-file 写入器 schema 漂移 / "contained null values" RuntimeError 绕过自动迁移（#2702、#2768）。
- Pydantic v1/v2 摩擦：上界与 openai-agents 冲突（#2019）；`.json()` 弃用（#2042）；泛型校验问题（#1198）。
- Mistral 客户端导入错误（#2481）。
- Vector 与 Graph 配置的 `lru_cache` 哈希失效 bug（#2357），且 **`lru_cache` 最终在 PR #2853 里被干脆禁用**——「refactor: reduce lru cache」。

### E. MCP 服务器相对 FastAPI 的 bug

MCP 包装持续落后核心 API。

- MCP `cognify` 带合法本地文件路径返回成功但不创建任何 Data 条目（#2250，OPEN）。
- cognee-mcp 快速开始在 macOS arm64 + Py 3.14 上失败（#2753）。
- cognee-mcp 的 `cognify(data=str)` 因硬编码 `data.txt` 文件名，第一次之后静默丢弃所有写入（#2747）。
- 默认配置下 MCP recall 失败：`'NoneType' object has no attribute 'id'`——包装器没把 user 传给 cognee.recall（#2855）。
- cognee-cli 的 `--api-url` 不支持 remember/recall/improve/forget（#2809，OPEN）。
- 前端 Docker 构建损坏（#2832）、Turbopack 导入大小写不匹配（#2605）、`cognee-cli -ui` v0.5.5 缺 3 个 npm 依赖（#2413）、UI 编译错误（#2709）。

### F. 认证 / 多租户回归

- 令牌刷新机制字面上没实现；维护者承认*「我们不得不为自己的云部署重写它。现在我们拨不出资源」*（#2065）。
- 请求级 LLM 配置不可能，因为 `get_llm_config()` 与 `get_embedding_config()` 用 `@lru_cache`——单例（#2228）。
- 禁用认证需要*两个*标志：`ENABLE_BACKEND_ACCESS_CONTROL=false` 加 `REQUIRE_AUTHENTICATION=False`（#2808，修复 #2836）。
- 非所有者按名解析数据集时 `cognee.search` 忽略 ACL（#2845）；非所有者复用名字时 `cognee.add` 静默创建一个新的所有者限定的数据集（#2846）；`cognify` 静默跳过非所有者添加的数据（#2847）。
- 智能体显示名泄漏用户 ID（#2811）。
- `GRAPH_DATASET_TO_DATABASE_HANDLER`（用户把 `GRAPH_DATASET_DATABASE_HANDLER` 打错）被静默忽略并默认到 kuzu（#2697）。环境变量名无校验。

## 制造了最多问题的设计选择

1. **经 `@lru_cache` 的单例配置。** 破坏多租户（#2228）、失效 bug（#2357）、最终回退（#2853）。
2. **LiteLLM + Instructor 作为通用 LLM/结构化输出层。** #2412、#2430、#2537、#2608、#2613、#2749、#2782、#2820、#2840、#2842 的源头。
3. **SQLite 作默认关系后端配 greenlet 并行。** #2717：并行 cognify 下 `OperationalError: database is locked`，OPEN。维护者含糊其辞：*「sqlite 不是为生产用例准备的」*。
4. **Kuzu 作默认内嵌图数据库。** Kuzu 上游归档（#2098），维护者选择换成 **Ladybug**（PR #2755）——Kuzu 的一个 *fork*。替换后立刻出 bug：#2768、#2775、WAL 损坏（PR #2838）。**fork 数据库的风险已经兑现。**
5. **LanceDB 作默认向量存储**、schema 迁移假设自动处理漂移。现实：#2702 null 值绕过迁移、#2720 检索管线在向量命中到图子图的路上丢过滤器。
6. **隐式同步的三件套存储（图 + 向量 + 关系 + 可选本体）。** B 节整个完整性 bug 类的源头。编排由 cognee 内部处理，没有任何事务层。
7. **`@lru_cache` + ContextVar 混合模型**做租户隔离。#2228 解释：db 配置用 ContextVar 模式，但 LLM 与嵌入配置不用。
8. **`brute_force_triplet_search` 的逐集合距离归一化**（#2030）——修复 #2451 移除归一化，破坏下游阈值假设，以 #2720 浮出。
9. **后端访问控制即编排平面。** `ENABLE_BACKEND_ACCESS_CONTROL=false` 时，*所有*数据集限定的检索静默降级。（#2867、#2845、#2846、#2847、#2808。）
10. **默认 LLM 成本耦合**：`embedding_dimensions` 默认 3072（text-embedding-3-large），且 litellm 的 `model_cost` 表静默覆盖用户的 `max_completion_tokens`。「假设 OpenAI 默认」产出的两个 bug（#2751、#2608）。

## 维护者的修复暴露了什么

- **配置的 LRU 缓存已被悄悄撤退**（#2853、#2851）。
- **子进程模式 + Redis** 被显式加入以逃离 SQLite-greenlet 陷阱（#2803、#2812）。
- **Ladybug 是他们自己拥有的 Kuzu fork**。已经发布了「fix: resolve issue with WAL file corruption for ladybug」（#2838）。
- **schema 漂移时自动迁移 LanceDB** 不得不加（#2703），在 lance-file 写入器搞崩 worker 之后。
- **Anthropic 适配器坏了整整一个版本周期**——#2749 之后在 1.0.5 又以 #2782 坏了一次。
- **默认值翻转**：`fastembed` 移出核心（#2807）、结果缓存日志默认禁用（#2851）、嵌入维度自动推导而非默认（#2757）、认证单开关（#2836）。
- **功能弃用而非修复**：`TemporalRetriever`（#2429）。

## 维护者没解决的开放 issue

- **#2717 并行 cognify 下的 SQLite 死锁**——跨版本可复现。
- **#2720 LanceDB 过滤器不传播到图投影**——核心检索路径的*正确性* bug。无负责人。
- **#2840 思考 token + Instructor 不兼容。**
- **#2532 `/api/v1/cognify` 的 N+1 查询。**
- **#2612 asyncpg 的 null 字节崩溃。**
- **#2529 `index_data_points` 的浅拷贝 bug。**
- **#2228 请求级 LLM/嵌入配置。** 架构级。
- **#2065 令牌刷新。** 踢给社区。

**这些为什么难**：它们全坐在架构接缝上（配置平面、检索管线、异步编排）。不是一个 PR 能修的。

## 具体的依赖元凶（Rust 必须换个赌法）

| 库 | bug | issue |
|---|---|---|
| litellm | 静默丢 `extra_body` kwarg；`model_cost` 覆盖用户设置 | #2608、#2613、#2840 |
| instructor | 把 `response_model=str` 包进本地 LLM 不认的 JSON schema | #2840 |
| tenacity | 8-128s 退避放大 instructor 的解析失败 | #2840 |
| asyncpg | 绑定参数上限；`\0` 上 `CharacterNotInRepertoireError` | #2829、#2612 |
| lancedb / lance-file | null 值 RuntimeError 绕过迁移 | #2702 |
| pyarrow（lance 底下） | #2720 / #2702 schema 漂移的上游 | #2702 |
| kuzu | 上游归档、Py 3.14 / arm64 的 wheel 空缺 | #2098、#2753 |
| ladybug（kuzu fork） | 每个全新 DB 上版本映射崩溃；WAL 损坏 | #2768、PR#2838 |
| sqlite/sqlalchemy/greenlet | 并行 cognify 下 database-is-locked | #2717 |
| anthropic SDK | `max_tokens` 必需、连续两个发布损坏 | #2749、#2782 |
| fastembed | 传递依赖非 Apache/MIT；移出核心 | #2807 |
| pydantic | v1/v2 摩擦、弃用 `.json()`、上界冲突 | #1198、#2019、#2042 |
| mistralai | 客户端导入错误 | #2481 |
| openai-agents | 与 pydantic 的钉版本冲突 | #2019 |
| HF tokenizers | 分块时每个词触发一次 HF 请求 | #729 |
| Turbopack / npm | 前端构建反复损坏 | #2605、#2413、#2709、#2832 |

## 给 Rust 重写的勿重蹈教训

1. **不要把 LLM 调用放在静默丢 kwarg 的 Python 式通用网关后面。** 每个提供方一个类型化 Rust 客户端，未知字段报错而不是丢弃。（#2840、#2608、#2782。）

2. **不要用 SQLite 存写并行的管线状态。** 用 Postgres，或内嵌方案——LMDB/Sled/带 WAL 的 SQLite 前面经队列串行化的单写入器 actor。（#2717。）

3. **不要把 fork 的内嵌图数据库钉成默认。** 要么押身经百战的外部存储（Postgres + AGE、Neo4j），要么直接在关系存储上建图原语。Kuzu→Ladybug 转换让真实用户付了代价（#2098、#2768、#2775、#2753、PR#2838）。

4. **把检索过滤器传播当一等不变量配属性测试。** 给出 `assert different_queries_yield_different_subgraphs` 这样的测试用例。#2720 里那个 bug 正是杀死记忆产品的那种。

5. **配置从第一天起就必须是请求级的。** 无全局单例、无配置上的 `lru_cache`。用显式传递的请求级上下文类型。（#2228、#2357、PR#2853。）

6. **绝不把 `embedding_dimensions` 默认成常量。** 启动时从 `(provider, model)` 派生；集合维度与模型维度不匹配时拒绝启动。（#2751、#2757。）

7. **幂等摄取配显式 id 派生。** 节点 id 必须是 `(category, name, dataset)` 的函数。跨运行确定性的属性测试。（#2510、#2557、#2633。）

8. **重摄取 / 管线运行状态必须是状态机，不是标志。** "PipelineRunAlreadyCompleted" 阻止了已删文件的重摄取（#2097）。

9. **数据集隔离必须在「访问控制」开关与否两种情况下都工作。** 数据集是每个检索器上硬的查询时过滤器。（#2867、#2845、#2846、#2847。）

10. **每个跨存储变更都分批。** asyncpg 绑定参数上限、SQLite 锁、lance 写入器冲刷——全都根植于无界扇出（#2829、#2717、#2702）。

11. **单一事务边界，或有文档的最终一致性契约。** cognee 图/向量/关系之间的静默跳过是最深的一类 bug。选一个。

12. **审计日志与结果缓存从第一天带保留期。** cognee 的关系库无界增长——9 天 4.2 万条缓存结果（#2548）。他们最终默认禁用；在第一个用户撞上之前就做。

**校准**：按严重度与复发率加权，重复最多的单一教训是：**LLM/结构化输出层（LiteLLM + Instructor）脆弱，多存储同步（图 + 向量 + 关系）是正确性 bug 最深的来源。** 这两样里任何一个做错的 Rust 重写，就会继承 cognee 的跟踪器。
