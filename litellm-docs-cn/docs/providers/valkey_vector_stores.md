import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Valkey 向量存储

通过 LiteLLM 统一的向量存储 API，检索你已在 [Valkey](https://valkey.io/) 中建立索引的文档；任何虚拟密钥（virtual key）都能对数据存储发起检索，而自身无需持有 Valkey 凭据。

LiteLLM 对 Valkey 只读取；构建与加载索引仍由你负责。每次搜索会用你注册的模型为查询生成向量，对你的索引执行一次 KNN [`FT.SEARCH`](https://valkey.io/commands/ft.search/)，并返回与其他提供商完全一致的 OpenAI 格式结果；得分按 `1 - cosine distance` 计算，数值越高表示越相近。

## 快速上手

你需要准备三样东西：
1. 一台加载了 [valkey-search](https://valkey.io/topics/search/) 模块的 Valkey 服务器
2. 一个嵌入（embedding）模型（即当初为你的文档生成向量的那个模型）
3. 覆盖这些文档的 [`FT` 索引](https://valkey.io/commands/ft.create/)

## 1. 在 Valkey 中开启向量搜索

Valkey 本身是键值存储，对向量一无所知。向量搜索能力来自 [valkey-search](https://github.com/valkey-io/valkey-search) 模块，它引入了 `FT.*` 命令族（见 [Valkey 文档](https://valkey.io/topics/search/)），并且必须加载到你的服务器上。为此 LiteLLM 不引入任何 Python 依赖：网关自带的 Redis 客户端足以与该模块通信。

在本地最快拿到一台可用服务器的方式是使用 [valkey-bundle](https://hub.docker.com/r/valkey/valkey-bundle) 镜像，模块已预装：

```bash showLineNumbers title="本地带向量搜索的 Valkey"
docker run -d -p 6379:6379 valkey/valkey-bundle:latest
```

托管版的 [ElastiCache for Valkey](https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-elasticache-vector-search/)（节点型集群上的 Valkey 8.2）和 [MemoryDB](https://docs.aws.amazon.com/memorydb/latest/devguide/vector-search.html) 已内置该模块。集群模式也没问题：LiteLLM 把 `FT.SEARCH` 发到端点解析出的那个节点，valkey-search 自身会[把查询分发到各分片并合并结果](https://valkey.io/topics/search/)。自建服务器则用 [`valkey-server --loadmodule /path/to/libsearch.so`](https://github.com/valkey-io/valkey-search#load-the-module) 启动。

如果模块缺失，LiteLLM 仍能正常连接，但之后每次搜索都会失败，因为服务器会拒绝这个从未听过的命令：

```
litellm.APIConnectionError: unknown command 'FT.SEARCH', with args beginning with:
'my-search-index' '*=>[KNN 3 @embedding $vec AS vector_distance]' ...
```

## 2. 按 LiteLLM 读取的格式存放文档

每个文档对应一个 Valkey [HASH](https://valkey.io/topics/hashes/)，其中包含一个文本字段（默认 `text`）和一个 FLOAT32 向量字段（默认 `embedding`）；`FT.SEARCH` 查询的正是覆盖这些键的 [`FT.CREATE`](https://valkey.io/commands/ft.create/) 索引。Valkey 哈希没有模式（schema）可言，LiteLLM 无法猜测哪个字段是什么，因此你注册的字段名必须与数据保持一致。

```bash showLineNumbers title="创建索引"
FT.CREATE my-search-index ON HASH PREFIX 1 kb: \
  SCHEMA embedding VECTOR HNSW 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE
```

`DIM` 必须等于嵌入模型的维度（`text-embedding-3-small` 为 1536）。写入文档时，请使用你稍后要在 LiteLLM 中注册的同一个模型生成向量：

```python showLineNumbers title="把文档写入索引"
import struct

import litellm
from redis import Redis

client = Redis(host="localhost", port=6379)

docs = {
    "kb:refunds": "Refunds are issued back to the original payment method and normally settle within five business days.",
    "kb:shipping": "Standard shipping takes three to five business days inside the continental United States.",
}

response = litellm.embedding(model="openai/text-embedding-3-small", input=list(docs.values()))

for (key, text), item in zip(docs.items(), response.data):
    embedding = item["embedding"]
    client.hset(key, mapping={"text": text, "embedding": struct.pack(f"<{len(embedding)}f", *embedding)})
```

换用别的模型会悄无声息地返回错误结果；维度不一致则会直接报错 `query vector blob size (N) does not match index's expected size (M)`。

## 3. 向 LiteLLM 注册索引

注册是告诉 LiteLLM 索引在哪里、用哪个模型为查询生成向量；它不会在 Valkey 中创建任何东西。请先在 **模型** 下添加该嵌入模型，名称沿用提供商的模型名（`text-embedding-3-small`），因为 LiteLLM 会复用该模型的凭据，同时把这个名称发送给提供商。

<Tabs>
<TabItem value="ui" label="管理界面">

打开 **工具 > 向量存储**，切到 **管理向量存储** 标签页，点击 **+ 添加向量存储**。

<img src="/img/valkey_vs_manage_tab.png" alt="管理向量存储标签页，含添加向量存储按钮" />

提供商选择 **Valkey**。表单会说明它需要什么并展示连接字段：把 `FT` 索引的名称填入"向量存储 ID"，填好主机和端口，再选择生成索引中已有向量的那个嵌入模型。除非你的哈希用了别的字段名，否则"文本字段"和"向量字段名称"无需改动。

<img src="/img/valkey_vs_add_modal.png" alt="新建向量存储弹窗，已选择 Valkey 提供商且各字段填写完毕" />

点击 **创建** 后，该存储就会出现在表格里，随时可以搜索：

<img src="/img/valkey_vs_created_row.png" alt="管理向量存储表格中列出新创建的 Valkey 存储" />

创建存储并不会测试连接。主机、端口或索引名有误，都要等第一次搜索才会暴露，所以建议马上在[测试向量存储标签页](#4-测试向量存储)里跑一次搜索。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: openai/text-embedding-3-small
    litellm_params:
      model: openai/text-embedding-3-small
      api_key: os.environ/OPENAI_API_KEY

vector_store_registry:
  - vector_store_name: support-knowledge-base
    litellm_params:
      vector_store_id: my-search-index
      custom_llm_provider: valkey
      valkey_host: my-valkey.example.com
      valkey_port: 6379
      valkey_password: os.environ/VALKEY_PASSWORD
      valkey_ssl: true
      litellm_embedding_model: openai/text-embedding-3-small
```

```bash
litellm --config /path/to/config.yaml
```

</TabItem>
<TabItem value="api" label="管理 API">

```bash showLineNumbers title="注册索引"
curl -X POST 'http://localhost:4000/vector_store/new' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "vector_store_id": "my-search-index",
    "custom_llm_provider": "valkey",
    "vector_store_name": "Support Knowledge Base",
    "litellm_params": {
      "valkey_host": "my-valkey.example.com",
      "valkey_port": 6379,
      "litellm_embedding_model": "openai/text-embedding-3-small"
    }
  }'
```

该存储会写入 LiteLLM 数据库，立即可以搜索，无需重启。管理 API 的其余内容见[托管向量存储](../vector_stores/managed_vector_stores.md)。

</TabItem>
</Tabs>

## 4. 测试向量存储

在管理界面（Admin UI）中，**测试向量存储**标签页会针对已注册的存储发起一次真实搜索，并展示每条命中及其得分；这是确认连接、索引名与嵌入模型全部对得上的最快方式：

<img src="/img/valkey_vs_test_results.png" alt="测试向量存储标签页，针对一个客服问题展示六条按相关性排序的结果" />

同样的搜索，走 HTTP 则是：

```bash showLineNumbers title="搜索索引"
curl -X POST 'http://localhost:4000/v1/vector_stores/my-search-index/search' \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query": "how long does a refund take?", "max_num_results": 3}'
```

```json
{
  "object": "vector_store.search_results.page",
  "search_query": "how long does a refund take?",
  "data": [
    {
      "score": 0.5899661779400001,
      "content": [
        {
          "text": "Refunds are issued back to the original payment method and normally settle within five business days. Contact support if the money has not arrived after that.",
          "type": "text"
        }
      ],
      "file_id": "kb:refunds",
      "filename": "kb:refunds"
    },
    {
      "score": 0.36476153135300005,
      "content": [
        {
          "text": "Every API key is limited to 600 requests per minute. Requests over the limit return HTTP 429 with a Retry-After header telling you how long to wait.",
          "type": "text"
        }
      ],
      "file_id": "kb:rate-limits",
      "filename": "kb:rate-limits"
    }
  ]
}
```

`file_id` 和 `filename` 就是各条命中所在的 Valkey 键。`max_num_results` 默认为 10，取值必须在 1 到 50 之间。

使用 SDK 时，可以不注册存储，直接内联传入连接参数：

```python showLineNumbers title="从 Python SDK 发起搜索"
import litellm

response = litellm.vector_stores.search(
    vector_store_id="my-search-index",
    query="how long does a refund take?",
    custom_llm_provider="valkey",
    valkey_host="my-valkey.example.com",
    litellm_embedding_model="openai/text-embedding-3-small",
    max_num_results=3,
)
```

`litellm.vector_stores.asearch` 是对应的异步版本。两者都依赖 `redis` 包，代理服务器已随附安装；纯 SDK 环境请运行 `pip install redis`。

存储一经注册，任何接受向量存储 ID 的 LiteLLM 功能都可以使用它，包括[`/chat/completions` 中的 RAG](../completion/knowledgebase.md)，只需传入 `tools: [{"type": "file_search", "vector_store_ids": ["my-search-index"]}]`。

## 配置项参考

表中多数配置保持默认值即可。真正决定搜索能否命中的，是索引名、主机、嵌入模型，以及那两个字段名。

| 配置项 | 界面标签 | 是否必填 | 填写内容 |
|---|---|---|---|
| `vector_store_id` | 向量存储 ID | 是 | `FT` 索引的名称，必须与传给 `FT.CREATE` 的名字完全一致。这不是随意起的标签；名字不存在时会报错 `Index with name '...' not found in database 0` |
| `valkey_host` | Valkey 主机 | 是 | 纯主机名或 IP，不带协议前缀和端口，即填 `my-valkey.example.com` 而非 `redis://my-valkey.example.com:6379` |
| `valkey_port` | Valkey 端口 | 否 | 默认 `6379`，仅当服务器监听其他端口时才需要修改 |
| `valkey_password` | Valkey 密码 | 否 | 仅当服务器要求 AUTH 时填写，否则留空 |
| `valkey_ssl` | 使用 TLS | 否 | 默认 `false`。ElastiCache 或 MemoryDB 集群启用传输中加密时设为 `true`，这正是让 LiteLLM 以 `rediss://` 连接的开关 |
| `litellm_embedding_model` | 嵌入模型 | 是 | 生成索引中向量的那个确切模型。换用其他模型会返回看似合理实则错误的结果；维度不一致则直接报错 |
| `valkey_text_field` | 文本字段 | 否 | 默认 `text`。必须与存放可读文本的哈希字段一致，否则每条结果的正文都会是空的 |
| `valkey_embedding_field` | 向量字段名称 | 否 | 默认 `embedding`。必须与创建索引时使用的字段一致 |
| `litellm_embedding_config` | 不适用 | 否 | 嵌入调用的额外参数，如 `api_key` 或 `api_base`。在代理服务器上通常可以省略，因为 LiteLLM 会从已注册的模型解析这些信息 |

## 故障排查

**`unknown command 'FT.SEARCH'`** 表示服务器没有向量搜索能力。运行 `valkey-cli FT._LIST`：装了模块的服务器会列出它的索引，没装的会重复同样的 unknown command 报错。最常见的原因是用了普通的 `valkey/valkey` 镜像。

**`query vector blob size (N) does not match index's expected size (M)`** 表示存储上注册的嵌入模型返回的维度数与建索引时不一致。两个数字都是字节数，除以 4 就是参与比对的维度；要么注册当初构建索引的那个模型，要么按新维度重建索引。

**结果返回但正文为空** 表示命中是真实的，只是 `valkey_text_field` 指向的字段在你的哈希里不存在。对返回的任意一个键执行 `HGETALL`，把该字段改成真正存放正文的那一个。

**`Connection refused`，或搜索先卡住然后失败**，通常意味着端口填错，或安全组没有放行网关。LiteLLM 连接等待 5 秒、命令执行等待 30 秒，所以主机不可达时会快速失败，而不会一直占着一个 worker。

**排序看起来毫无规律** 问题多半出在嵌入模型上。查询与文档用了不同模型生成向量时不会报任何错，所以请核对存储注册的模型与数据写入任务实际使用的模型是否一致。

## 不支持的功能

Valkey 向量存储只支持搜索。LiteLLM 无法针对 Valkey 创建索引（`POST /v1/vector_stores`）、上传文件或执行 `/rag/ingest`，这也是管理界面的创建向量存储标签页里没有 Valkey 的原因；索引需要你用 `FT.CREATE` 和 `HSET` 自行构建并写入。搜索的 `filters` 参数同样未实现，传入后会直接报错，而不是被静默忽略。

装有同一模块的 Valkey 服务器还可以支撑 LiteLLM 的[语义缓存](../proxy/caching_semantic.md)；那是另一项独立功能，拥有自己的索引，且由 LiteLLM 负责创建和写入。
