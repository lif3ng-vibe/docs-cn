import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MongoDB 向量存储（BETA）

:::warning[BETA]
MongoDB 向量存储集成目前是 **BETA**（公测）功能，支持通过可选的 [LiteLLM MongoDB sidecar](https://github.com/BerriAI/litellm-mongodb)（边车服务）搜索现有的 MongoDB Vector Search 索引。在接入 LiteLLM 之前，请先准备好你的集合（collection）、索引和已完成嵌入的文档。
:::

你可以把 MongoDB Atlas 或自托管 MongoDB 部署中的文档用作对话补全的上下文。LiteLLM 会为用户查询生成嵌入，搜索你的索引，并把检索到的文本传给你的对话模型。你也可以直接执行搜索，只取回文档和相似度得分，而不生成回答。

- 通过管理界面（Admin UI）、配置文件或管理 API [连接你的索引](#连接你的索引)。
- 通过 curl 或 OpenAI Python SDK [在对话补全中使用 MongoDB](#在对话补全中使用-mongodb)。
- 参考一个[完整的实战示例](../tutorials/mongodb_vector_search.md)，其中使用 Atlas 中原创的虚构政策文档。

## 开始之前

你需要准备：

- **已启用 Vector Search 的 MongoDB 部署**。自托管部署请参照 MongoDB 的[部署指南](https://www.mongodb.com/docs/search/self-managed/current/)和[版本兼容性要求](https://www.mongodb.com/docs/search/self-managed/current/deployment/compatibility-requirements/)。未启用 Vector Search 的 MongoDB 服务器无法处理这类查询。
- **已存有文档的集合和可查询的 Vector Search 索引**。文档必须同时包含可读文本和已存储的嵌入。如果需要创建索引，请参见 MongoDB 的 [Vector Search 索引指南](https://www.mongodb.com/docs/vector-search/indexes/vector-search-type/)。
- **Sidecar 可访问的连接字符串**。数据库用户需要有搜索该集合以及列出其搜索索引的权限。请在数据库的网络规则中放行 Sidecar 所在主机。
- **文档所用的嵌入模型**。查询嵌入必须与已存储向量使用相同的模型和输出维度。维度相同但模型不同的嵌入，可能在不报错的情况下返回不相关的结果。

按常规方式安装 LiteLLM 即可。MongoDB 驱动只在独立的 Sidecar 中运行：

```bash
pip install 'litellm[proxy]'
```

如果要直接使用 Python SDK，请安装 `litellm`，部署 Sidecar，然后参见[通过 Python SDK 搜索](#通过-python-sdk-搜索)。SDK 和标准 LiteLLM 镜像都不需要 PyMongo。LiteLLM 不会自动启动或安装 Sidecar。

:::note[RC 配置变更]
如果你在 `v1.101.0-rc.1` 中试用过 MongoDB，请把 `mongodb_connection_string` 迁移到 Sidecar 的 `MONGODB_CONNECTION_STRING` 环境变量，并在 LiteLLM 注册中改用 `api_base` 和 `api_key`。已有的 MongoDB 数据和索引保持不变；应用内的搜索和对话请求也不受影响。该集成仍处于 BETA 阶段。
:::

### 选择模型

通过代理发请求时，请使用已配置好的 LiteLLM 代理。通过 UI 或管理 API 注册还需要代理数据库。可以在管理界面的 **Models** 下添加模型，或写入你现有的 `model_list` 配置：

| 模型 | 用途 | 要求 |
|---|---|---|
| 嵌入模型 | 将每条搜索查询转换为向量 | 必须与嵌入集合内容时使用的模型和维度一致。 |
| 对话模型 | 根据检索到的文本生成回答 | LiteLLM 支持的对话模型。仅对话补全需要。 |

凭据以及各提供商特有的设置，请在每个模型部署上分别配置。MongoDB 并不要求使用 OpenAI：嵌入提供商应与你存储向量时使用的保持一致，对话提供商则可任选。[示例文档教程](../tutorials/mongodb_vector_search.md)展示了一种使用 OpenAI 的配置。

## 部署 Sidecar

每条 MongoDB 连接字符串对应运行一个 Sidecar。只要该 Sidecar 的 MongoDB 用户有权限访问相应数据库、集合和索引，多个 LiteLLM 注册就可以共用它。Sidecar 负责运行官方 MongoDB 驱动；LiteLLM 仍通过你配置的模型生成查询嵌入，并照常路由对话请求。

在 Sidecar 的部署密钥中设置 `MONGODB_CONNECTION_STRING` 和一个足够强的 `MONGODB_SIDECAR_API_KEY`，并把同一个 Sidecar 密钥提供给 LiteLLM。MongoDB 凭据和 TLS 文件都保存在 Sidecar 环境里。

<Tabs>
<TabItem value="docker" label="Docker">

适用于 LiteLLM 代理或 SDK 运行在同一台主机上的场景：

```bash
docker run --rm --name mongodb-sidecar \
  -p 127.0.0.1:8080:8080 \
  -e MONGODB_CONNECTION_STRING \
  -e MONGODB_SIDECAR_API_KEY \
  ghcr.io/berriai/litellm-mongodb:v0.1.0-beta.1
```

Sidecar URL 使用 `http://127.0.0.1:8080`。请固定镜像的版本标签或摘要。该镜像支持 Linux amd64 和 arm64，以用户 `10001:10001` 运行。

</TabItem>
<TabItem value="compose" label="Docker Compose">

把下面这个可选服务添加到运行 LiteLLM 的 Compose 项目中：

```yaml
services:
  mongodb-sidecar:
    image: ghcr.io/berriai/litellm-mongodb:v0.1.0-beta.1
    network_mode: service:litellm
    depends_on:
      litellm:
        condition: service_started
        restart: true
    environment:
      MONGODB_CONNECTION_STRING: ${MONGODB_CONNECTION_STRING:?required}
      MONGODB_SIDECAR_API_KEY: ${MONGODB_SIDECAR_API_KEY:?required}
    restart: unless-stopped
```

需要 Docker Compose 2.17 或更高版本。把 `network_mode` 和 `depends_on` 中的 `litellm` 替换为你现有 LiteLLM 服务的名称，并把 `MONGODB_SIDECAR_API_KEY` 传给该服务。共享网络命名空间后，LiteLLM 就能用 `http://127.0.0.1:8080` 作为 `api_base`。这种部署方式下 Sidecar 不需要占用宿主机端口。如果网络命名空间相互独立，请改用 HTTPS 暴露 Sidecar。

请通过 Compose 重启 LiteLLM，让 Sidecar 一并重启并加入它的网络命名空间：

```bash
docker compose restart litellm
```

修改 LiteLLM 镜像或容器配置后，请重新创建这两个服务：

```bash
docker compose up -d --force-recreate litellm mongodb-sidecar
```

`restart: true` 这一依赖项设置只对 Compose 操作生效；Docker 的自动重启策略和直接执行 `docker restart` 都不会重启依赖服务。如果 LiteLLM 是在 Compose 之外重启的，请在它启动之后再执行 `docker compose restart mongodb-sidecar`。否则 Sidecar 可能仍挂在原来的网络命名空间上，导致 MongoDB 搜索失败。如果两个服务需要各自独立地重启和恢复，请改用独立的 HTTPS 部署。详见 Docker 的[依赖重启行为](https://docs.docker.com/reference/compose-file/services/#depends_on)文档。

</TabItem>
<TabItem value="helm" label="Kubernetes / Helm">

在 LiteLLM 命名空间中创建名为 `mongodb-sidecar` 的 Kubernetes Secret，包含 `connection-string` 和 `api-key` 两个键。对于 LiteLLM 的 `litellm-helm` chart，可以通过其现有的 `extraContainers` 设置加入 Sidecar：

```yaml title="values-mongodb.yaml"
extraEnvVars:
  - name: MONGODB_SIDECAR_API_KEY
    valueFrom:
      secretKeyRef:
        name: mongodb-sidecar
        key: api-key
extraContainers:
  - name: mongodb-sidecar
    image: ghcr.io/berriai/litellm-mongodb:v0.1.0-beta.1
    ports:
      - name: mongodb-http
        containerPort: 8080
    env:
      - name: MONGODB_CONNECTION_STRING
        valueFrom:
          secretKeyRef:
            name: mongodb-sidecar
            key: connection-string
      - name: MONGODB_SIDECAR_API_KEY
        valueFrom:
          secretKeyRef:
            name: mongodb-sidecar
            key: api-key
    securityContext:
      runAsNonRoot: true
      runAsUser: 10001
      runAsGroup: 10001
      allowPrivilegeEscalation: false
      capabilities:
        drop: [ALL]
    livenessProbe:
      httpGet:
        path: /health/liveness
        port: mongodb-http
    startupProbe:
      httpGet:
        path: /health/liveness
        port: mongodb-http
      failureThreshold: 30
      periodSeconds: 2
```

把这些值合并进你现有的 chart 配置，保留原有的额外环境变量和容器。MongoDB 注册的 `api_base` 设为 `http://127.0.0.1:8080`；同一 Pod 内的容器共享网络。不需要额外的 Service，也没有强制的 chart 依赖。

可通过 `/health/readiness` 监测 MongoDB 连接状态。如果把 MongoDB 就绪探针挂在 LiteLLM Pod 内的容器上，MongoDB 故障时整个 Pod 都会被摘除，进而影响其他提供商。如果 MongoDB 需要独立的就绪状态、扩缩容或可用性，请使用单独的 Sidecar Deployment 和 Service。

</TabItem>
</Tabs>

两个密钥也可以改为以只读方式挂载，并通过 `MONGODB_CONNECTION_STRING_FILE` 或 `MONGODB_SIDECAR_API_KEY_FILE` 引用。取值变量和文件变量只能二选一，不要同时设置。文件必须对容器用户 10001 可读。如需 MongoDB TLS，请在 URI 中加入 `tlsCAFile`、`tlsCertificateKeyFile` 等选项，并把文件挂载到 Sidecar 内对应路径。证书校验默认保持开启。

远程 Sidecar 必须使用 HTTPS。只有当两个进程共享主机或网络命名空间、且地址是字面回环 IP（如 `127.0.0.1` 或 `[::1]`）时才接受 HTTP。这样可以避免 Sidecar 的 bearer 密钥和查询数据经过未加密的网络链路。如果 Sidecar 部署在别的主机或 Deployment 上，请使用 LiteLLM 信任证书的 HTTPS 反向代理；`api_base` 可以带上代理的路径前缀，但不包含 `/v1`。服务的 HTTP 端口应保持私有，只在该代理之后访问。

`/health/liveness` 用于检查 HTTP 进程，`/health/readiness` 用于执行一次有超时上限的 MongoDB ping。超时、连接池和版本发布等事项请参见 [Sidecar 运维指南](https://github.com/BerriAI/litellm-mongodb#operations)。

## 连接你的索引

只需注册一次现有索引，之后在请求中按 ID 引用即可。请把所有尖括号中的值替换为你部署中的实际值。

| 取值 | 查找位置 |
|---|---|
| `<index-name>` | MongoDB Vector Search 索引的确切名称。它会成为 LiteLLM 的 `vector_store_id`。 |
| `<database-name>` / `<collection-name>` | 包含你文档的数据库和集合。 |
| `<vector-field>` | 索引定义中的向量 `path`。 |
| `<text-field>` | 文档中存放可读文本的字段，例如 `text` 或 `metadata.body`。 |
| `<embedding-model-name>` | 注册在 LiteLLM 代理上的嵌入模型名称。 |
| `<chat-model-name>` | 注册在 LiteLLM 代理上的对话模型名称。 |

搜索之前，索引必须处于 **READY** 状态且可查询。注册的显示名与它的 ID 相互独立。保存注册不会创建索引、不会导入文档，也不会验证连接是否可用。

任选下面一种注册方式：

<Tabs>
<TabItem value="ui" label="Admin UI">

1. 打开 **Tools > Vector Stores**，选择 **Manage Vector Stores**，然后点击 **+ Add Vector Store**。
2. 提供商选择 **MongoDB (BETA)**。该连接器同样支持启用了 Vector Search 的自托管 MongoDB。
3. 在 **Vector Store ID** 中填入确切的索引名称，然后填写 **Sidecar URL**、**Sidecar API Key**、**Database** 和 **Collection**。
4. 选择已注册的 **Embedding Model**。把 **Vector Field Name** 和 **Text Field** 设为你集合中的对应字段。**Candidates Considered** 留空即使用默认值。
5. 点击 **Create**，然后用 **Test Vector Store** 搜索一个你确定存在于文档中的内容。检查返回的文本，确认连接和字段映射是否正确。

注册请使用 **Manage Vector Stores**。单独的 **Create Vector Store** 流程是在提供商侧新建存储，不支持 MongoDB。

</TabItem>
<TabItem value="config" label="config.yaml">

在代理的环境中把 `MONGODB_SIDECAR_API_KEY` 设为 Sidecar 上配置的密钥。Sidecar URL 必须是代理进程可以访问的地址。

把下面的注册内容加入你现有的代理配置，保留原有的 `model_list` 和认证设置：

```yaml showLineNumbers title="config.yaml"
vector_store_registry:
  - vector_store_name: "<display-name>"
    litellm_params:
      vector_store_id: "<index-name>"
      custom_llm_provider: mongodb
      api_base: http://127.0.0.1:8080
      api_key: os.environ/MONGODB_SIDECAR_API_KEY
      mongodb_database: "<database-name>"
      mongodb_collection: "<collection-name>"
      mongodb_text_field: "<text-field>"
      mongodb_embedding_field: "<vector-field>"
      litellm_embedding_model: "<embedding-model-name>"
```

用更新后的配置启动或重启代理：

```bash
litellm --config config.yaml --port 4000
```

环境变量必须对运行中的代理进程可见。Docker 场景下请用 `--env-file` 或 `-e` 传入；宿主机上的 `.env` 文件不会自动进入容器。

</TabItem>
<TabItem value="api" label="管理 API">

在配置了数据库的代理上，把 `LITELLM_API_KEY` 设为具有向量存储管理权限的 LiteLLM 密钥。如有需要，替换其中的代理 URL：

```bash showLineNumbers title="注册现有 MongoDB 索引"
curl -X POST 'http://localhost:4000/vector_store/new' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "vector_store_id": "<index-name>",
    "custom_llm_provider": "mongodb",
    "vector_store_name": "<display-name>",
    "litellm_params": {
      "api_base": "http://127.0.0.1:8080",
      "api_key": "<sidecar-api-key>",
      "mongodb_database": "<database-name>",
      "mongodb_collection": "<collection-name>",
      "mongodb_text_field": "<text-field>",
      "mongodb_embedding_field": "<vector-field>",
      "litellm_embedding_model": "<embedding-model-name>"
    }
  }'
```

注册信息会存入 LiteLLM 数据库。管理与访问控制请参见 [托管向量存储](../vector_stores/managed_vector_stores.md)。

</TabItem>
</Tabs>

:::note[通过 UI 或管理 API 的首次注册]
如果代理启动时还没有任何已注册的向量存储，直接搜索可能在对话检索就绪之前就能工作。保存第一个存储后，请等待代理完成数据库同步或重启代理，再在对话补全中使用 `file_search`。启动时通过 `config.yaml` 加载存储可以避免这段初始延迟。
:::

## 在对话补全中使用 MongoDB

调用 `/v1/chat/completions` 时带上引用已注册索引 ID 的 `file_search` 工具。LiteLLM 会在同一次请求中完成上下文检索并调用你的对话模型。

把 `LITELLM_API_KEY` 设为有权访问该对话模型和已注册向量存储的 LiteLLM 密钥。下面的代理 URL、模型名称、索引名称和问题请替换为你自己的值。

<Tabs>
<TabItem value="chat-curl" label="curl">

```bash showLineNumbers title="与你的 MongoDB 文档对话"
curl -X POST 'http://localhost:4000/v1/chat/completions' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "<chat-model-name>",
    "messages": [
      {
        "role": "system",
        "content": "Answer using the provided context. If the context does not contain the answer, say you do not know."
      },
      {
        "role": "user",
        "content": "<question-about-your-documents>"
      }
    ],
    "tools": [
      {
        "type": "file_search",
        "vector_store_ids": ["<index-name>"]
      }
    ]
  }'
```

</TabItem>
<TabItem value="chat-python" label="OpenAI Python SDK">

把客户端指向你的 LiteLLM 代理，并通过 `extra_body` 传入 LiteLLM 的 `file_search` 工具：

```python showLineNumbers title="通过 LiteLLM 进行对话补全"
import os

from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:4000/v1",
    api_key=os.environ["LITELLM_API_KEY"],
)

response = client.chat.completions.create(
    model="<chat-model-name>",
    messages=[
        {
            "role": "system",
            "content": "Answer using the provided context. If the context does not contain the answer, say you do not know.",
        },
        {"role": "user", "content": "<question-about-your-documents>"},
    ],
    extra_body={
        "tools": [{"type": "file_search", "vector_store_ids": ["<index-name>"]}]
    },
)

message = response.model_dump()["choices"][0]["message"]
print(message["content"])

# Inspect the documents retrieved for this answer.
for page in (message.get("provider_specific_fields") or {}).get("search_results", []):
    for result in page["data"]:
        print(result["file_id"], result["score"], result["content"])
```

</TabItem>
</Tabs>

LiteLLM 用该存储配置的嵌入模型为最后一条用户消息生成嵌入，执行 MongoDB 的 `$vectorSearch` 聚合，并把检索到的文本加入对话。随后对话模型在 `choices[0].message.content` 中生成回答。

该端点上的 `file_search` 由 LiteLLM 在调用对话模型之前处理，你的应用不需要执行工具调用，也不需要单独发搜索请求。`vector_store_ids` 中要填确切的索引名称，而不是注册的显示名。

### 验证检索结果

检索成功时，文档会出现在 `choices[0].message.provider_specific_fields.search_results`。检查其中的文本和得分，确认回答有相关的素材来源。更多示例参见[访问搜索结果](../completion/knowledgebase.md#获取搜索结果引用)。

仅凭一次成功的对话响应并不能证明 MongoDB 检索生效了：即使检索失败，对话也可能正常完成。如果缺少来源，请执行一次[直接搜索索引](#直接搜索索引)来独立排查连接问题。

## 直接搜索索引

如果你只想取回文档而不生成对话回答，可以使用直接搜索。把 `LITELLM_API_KEY` 设为有权访问该已注册存储的 LiteLLM 密钥。

```bash showLineNumbers title="通过代理搜索"
curl -X POST 'http://localhost:4000/v1/vector_stores/<index-name>/search' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "<question-about-your-documents>",
    "max_num_results": 3
  }'
```

结果出现在响应的 `data` 数组中：

| 响应字段 | 含义 |
|---|---|
| `content` | 从你配置的 `mongodb_text_field` 读取的文本。 |
| `file_id` / `filename` | MongoDB 文档的 `_id` 转换成的字符串。 |
| `score` | MongoDB 的 `vectorSearchScore`。数值越大表示结果越相似；该分数并不是回答置信度百分比。 |

`max_num_results` 默认为 `10`，取值范围为 `1` 到 `50`。想检查搜索质量，可以用一条与已知文档相关的查询。[示例文档教程](../tutorials/mongodb_vector_search.md#test-search)里有一个具体的查询和预期结果。

## 通过 Python SDK 搜索

把 Sidecar 设置直接传给 `litellm.vector_stores.search` 即可，不需要在代理上注册。在 SDK 进程的环境中设置 `MONGODB_SIDECAR_API_KEY` 以及你嵌入提供商的凭据。MongoDB URI 只应出现在单独部署的 Sidecar 中。

```python showLineNumbers title="不通过代理直接搜索"
import os

import litellm

response = litellm.vector_stores.search(
    vector_store_id="<index-name>",
    query="<question-about-your-documents>",
    custom_llm_provider="mongodb",
    api_base="http://127.0.0.1:8080",
    api_key=os.environ["MONGODB_SIDECAR_API_KEY"],
    mongodb_database="<database-name>",
    mongodb_collection="<collection-name>",
    mongodb_text_field="<text-field>",
    mongodb_embedding_field="<vector-field>",
    litellm_embedding_model="<provider>/<embedding-model>",
    max_num_results=3,
)

print(response)
```

异步用法是带着同样的参数调用 `await litellm.vector_stores.asearch(...)`。直接调用 SDK 时使用提供商的嵌入模型名称；通过代理时使用已注册的嵌入模型名称。

## 配置项参考

这些配置项通过已注册存储的 `litellm_params` 传入，或在直接 SDK 搜索时作为关键字参数传入。

| 设置项 | 是否必填 | 说明 |
|---|---|---|
| `vector_store_id` | 是 | MongoDB Vector Search 索引的确切名称。 |
| `custom_llm_provider` | 是 | 固定为 `mongodb`。 |
| `api_base` | 是 | Sidecar 的 HTTPS 源地址或反向代理路径前缀。仅字面回环 IP 支持 HTTP。不要追加 `/v1`。 |
| `api_key` | 是 | Sidecar 的 bearer 密钥。也可以通过 LiteLLM 环境中的 `MONGODB_SIDECAR_API_KEY` 提供。 |
| `mongodb_database` | 是 | 集合所在的数据库。即使 URI 中已包含数据库名也必须填写。 |
| `mongodb_collection` | 是 | 存放文档和向量的集合。 |
| `litellm_embedding_model` | 是 | 用于嵌入查询的模型。必须与存储向量时使用的模型一致。 |
| `mongodb_embedding_field` | 否 | 索引覆盖的向量字段。默认为 `embedding`。 |
| `mongodb_text_field` | 否 | 存放可读文本的字段。默认为 `text`；支持 `metadata.body` 这样的点号路径。 |
| `mongodb_num_candidates` | 否 | 返回最前面的结果之前考察的候选数量。默认为 `max(100, 10 * max_num_results)`。显式指定的值必须不小于 `max_num_results` 且不超过 `10000`。数值越大可能提升召回率，但会增加延迟。 |
| `litellm_embedding_config` | 否 | 嵌入调用的附加参数，例如 `dimensions`、`api_key` 或 `api_base`。在代理上请尽量把这些配置放到嵌入模型的部署上。 |

搜索的 `query` 不能为空，长度不超过 32,000 个字符。传入字符串列表时会用空格拼接，并作为单条查询嵌入。

## 故障排查

| 现象 | 排查要点 |
|---|---|
| 旧配置提示需要 `pymongo` 或 `mongodb_connection_string` | 改用包含 BETA Sidecar 适配器的 LiteLLM 版本，部署 Sidecar，并配置 `api_base` 和 `api_key`。 |
| HTTP 401：Sidecar 认证失败 | 让 LiteLLM 的 `api_key` 与 Sidecar 的 `MONGODB_SIDECAR_API_KEY` 保持一致。该密钥独立于你的 MongoDB 密码和 LiteLLM 客户端密钥。 |
| HTTP 400：索引缺失或不可查询 | 核对数据库、集合和索引名称是否完全正确，等待索引进入 READY 且可查询状态。 |
| HTTP 400：维度不匹配或向量字段未建立索引 | 让查询嵌入的模型和维度与你的文档一致，并让 `mongodb_embedding_field` 与索引定义中的 `path` 一致。 |
| HTTP 400：命中的文档都没有文本字段 | 把 `mongodb_text_field` 设为存放可读文本的字段；若字段嵌套，需包含完整的点号路径。 |
| HTTP 400：凭据被拒绝 | 检查 Sidecar 的 URI 凭据、认证数据库以及数据库用户的权限。 |
| Atlas 报告 `bad auth : authentication failed`（代码 `8000`） | 核对已保存连接字符串中数据库用户的密码和集群。这是索引搜索之前的认证失败。数据库用户与你的 Atlas 网站登录账号是两回事；参见 [Atlas 连接故障排查](https://www.mongodb.com/docs/atlas/troubleshoot-connection/#authentication-to-the-cluster-failed)。 |
| Sidecar 启动失败：URI 无效或缺少密钥 | 检查 Sidecar 环境和密钥文件挂载。URI 凭据中的特殊字符需做百分号编码，例如 `p@ss/word` 应写成 `p%40ss%2Fword`。 |
| TLS 文件无法读取 | 确认 `tlsCAFile` 和 `tlsCertificateKeyFile` 指向 Sidecar 进程可读的文件。在容器中要使用 Sidecar 容器内的路径。 |
| HTTP 408：部署或查询超时 | 检查主机名解析和连通性。Atlas 上请检查 IP 访问列表以及集群是否被暂停；自托管部署请检查主机、端口和防火墙。 |
| HTTP 503：连接中断或被拒绝 | 先确认 Sidecar 在运行且 URL 可访问，再检查 MongoDB 连接和 TLS 设置。节点重启或副本集故障转移之后可以重试。 |
| 注册第一个存储后对话返回 `Invalid value: 'file_search'` | 先等待数据库同步或重启代理以加载注册，再重试。确认 `vector_store_ids` 中填的是已注册的索引 ID。 |

超时和连接中断会返回可重试的错误（`408` 和 `503`）。连通性恢复后，无需重启 LiteLLM 即可继续搜索。

## BETA 版限制

- **仅支持搜索**：集合和索引的创建、文档嵌入的生成以及文档导入都在 LiteLLM 之外完成。MongoDB 不支持 LiteLLM 的向量存储创建、文件管理和 `/rag/ingest` 等 API。
- **不支持搜索过滤和查询改写**：`filters`、`ranking_options` 和 `rewrite_query` 都会被拒绝，`rewrite_query: false` 也不例外。提供商特有的 `mongodb_filter` 同样不受支持，传入即被拒绝。
- **不通过 MongoDB 自动嵌入**：请配置 `litellm_embedding_model`；不会使用 MongoDB 的自动嵌入集成。
- **首次注册可能要等一段时间才能用于对话请求**：运行中的代理如果还没有向量存储注册表，第一次通过 UI 或 API 注册后，需要等数据库同步或重启代理，`file_search` 才能在对话补全中生效。
