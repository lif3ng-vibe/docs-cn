import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基于标签的路由

## 快速上手

### 1. 在 config.yaml 中定义标签

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["free"] # 👈 Key Change
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["paid"] # 👈 Key Change
  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["default"] # OPTIONAL - All untagged requests will get routed to this

router_settings:
  enable_tag_filtering: True # 👈 Key Change

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 2. 使用 `tags=["free"]` 发起请求

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ],
    "tags": ["free"]
  }'
```

**响应：**

```json
{
  "id": "chatcmpl-33c534e3d70148218e2d62496b81270b",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "\n\nHello there, how may I assist you today?",
        "role": "assistant"
      }
    }
  ],
  "model": "{{openai_large}}",
  "object": "chat.completion",
  "usage": {"completion_tokens": 12, "prompt_tokens": 9, "total_tokens": 21}
}
```

### 3. 使用 `tags=["paid"]` 发起请求

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ],
    "tags": ["paid"]
  }'
```

**响应：**

```json
{
  "id": "chatcmpl-9maCcqQYTqdJrtvfakIawMOIUbEZx",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "Good morning! How can I assist you today?",
        "role": "assistant"
      }
    }
  ],
  "model": "{{openai_large}}",
  "object": "chat.completion",
  "usage": {"completion_tokens": 10, "prompt_tokens": 12, "total_tokens": 22}
}
```

## 通过请求头调用

```bash
curl -L -X POST 'http://0.0.0.0:4000/v1/chat/completions' \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $LITELLM_API_KEY" \
-H 'x-litellm-tags: free,my-custom-tag' \
-d '{
  "model": "{{openai_large}}",
  "messages": [
    {
      "role": "user",
      "content": "Hey, how'\''s it going?"
    }
  ]
}'
```

## 设置默认标签

### 1. 在 yaml 中设置默认标签

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["default"] # 👈 Key Change - All untagged requests will get routed to this
    model_info:
      id: "default-model"
```

### 2. 启动代理

```bash
$ litellm --config /path/to/config.yaml
```

### 3. 发起不带标签的请求

```bash
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello, Claude gm!"}
    ]
  }'
```

## 否定标签（黑名单）

在任意标签前加 `!` 前缀，即可**排除**携带该确切标签的部署。当你想避开某个特定的提供商或模型系列、又不想把所有允许的备选都列出来时，这个功能很有用。

### 快速示例

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["!provider:anthropic"]}
  }'
```

所有带 `provider:anthropic` 标签的部署都会在路由前从候选池中移除，其余部署均可参与路由。

### 配置示例

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["provider:anthropic"]

  - model_name: chat
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["provider:openai"]

  - model_name: chat
    litellm_params:
      model: vertex_ai/{{gemini_flash}}
      api_key: os.environ/VERTEX_API_KEY
      tags: ["provider:vertex"]

router_settings:
  enable_tag_filtering: true

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 正向标签与否定标签组合使用

用正向标签选定一个层级，再用否定标签在该层级内排除某个提供商：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["paid", "!provider:anthropic"]}
  }'
```

### 排除多个提供商

发送多个 `!` 标签即可排除不止一组部署：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["!provider:anthropic", "!provider:openai"]}
  }'
```

最后只剩 vertex 部署可用。

### 否定标签配合回退链

当主模型组被禁用后，路由器会自动落到已配置的回退上：

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: primary
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["provider:anthropic"]

  - model_name: fallback
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["provider:openai"]

router_settings:
  enable_tag_filtering: true
  fallbacks:
    - {"primary": ["fallback"]}

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "primary",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["!provider:anthropic"]}
  }'
# primary is banned -> falls through to fallback (provider:openai)
```

### 否定标签语义

| 行为 | 说明 |
|----------|--------|
| 匹配方式 | 精确的标签字符串匹配。`!provider:anthropic` 只移除恰好带有 `provider:anthropic` 标签的部署 |
| 不支持正则 | 否定标签是普通字符串，不是正则模式。`!provider:(anthropic\|openai)` 只会排除恰好带有 `provider:(anthropic\|openai)` 标签的部署。要排除多个提供商，请分开发送多个标签：`["!provider:anthropic", "!provider:openai"]`。注意：部署配置中的 `tag_regex` 是正则，但那由运维方配置，与客户端提供的否定标签无关 |
| 仅禁用请求 | 如果请求只带 `!` 标签、没有正向标签，基础池与不带标签的请求一致：有带 default 标签的部署就用它们，否则用全部部署。排除集随后叠加在该池之上 |
| 全部被排除 | 如果否定标签把所有候选都移除，请求会以 `no_deployments_with_tag_routing` 失败 |
| 无标签部署 | 没有配置 `tags` 字段的部署永远不会被否定标签排除 |
| 请求头 | 否定标签也支持通过 `x-litellm-tags` 请求头传递：`-H 'x-litellm-tags: !provider:anthropic'` |

## 必需标签（AND）

在任意标签前加 `&` 前缀，即可将其设为必需。与只需命中一个的普通标签不同，部署必须同时携带请求中所有带 `&` 前缀的标签才有资格成为候选。这适合组合多个相互独立的约束，例如"必须具备高推理能力且必须来自 Anthropic"：如果改用普通标签的 OR 语义，就可能命中推理能力低的 Anthropic 部署，或推理能力高但非 Anthropic 的部署。

### 快速示例

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["&reasoning_type:high", "&provider:anthropic"]}
  }'
```

只有同时携带 `reasoning_type:high` 和 `provider:anthropic` 的部署才有资格。

### 配置示例

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["reasoning_type:high", "provider:anthropic"]

  - model_name: chat
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["reasoning_type:high", "provider:openai"]

router_settings:
  enable_tag_filtering: true

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 必需标签、否定标签与普通标签组合使用

执行顺序是：先做 `!` 排除，再用 `&` 必需标签收窄剩余候选，最后由普通标签在幸存者中按常规的 OR 偏好做选择：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["&reasoning_type:high", "provider:anthropic", "provider:openai", "!inference:cerebras"]}
  }'
# must be high-reasoning, AND (anthropic OR openai), AND not cerebras-hosted
```

### 必需标签（AND）语义

| 行为 | 说明 |
|----------|--------|
| 匹配方式 | 精确的标签字符串匹配，与否定标签相同。不支持正则 |
| 仅必需请求 | 如果请求只带 `&` 标签（没有普通或否定标签），基础池与不带标签的请求一致：有带 default 标签的部署就用它们，否则用全部部署。必需标签过滤随后叠加在该池之上 |
| 正则/请求头偏好不会稀释必需 AND 请求 | 只含必需 AND 的请求始终返回所有满足必需标签的部署，即使其中某个恰好还命中无关的 `tag_regex`/User-Agent 偏好；绝不会收窄成只返回正则命中的那个部署 |
| 全部被淘汰 | 如果必需标签把所有候选都淘汰，请求会以 `no_deployments_with_tag_routing` 失败，除非模型组开启了 [`allow_fail_open`](#失败放行回退allow_fail_open) |
| 请求头 | 必需标签也支持通过 `x-litellm-tags` 请求头传递：`-H 'x-litellm-tags: &reasoning_type:high'` |

## 失败放行回退（`allow_fail_open`）

默认情况下，当 `!` 或 `&` 标签把模型组内的部署全部排除时，请求会以 `no_deployments_with_tag_routing` 失败。在组内每个部署的 `model_info` 中设置 `allow_fail_open: true`，即可改为回退到带 default 标签的部署池，而不是让请求直接失败。

这是一项显式开启的功能。不设置时行为不变：无法满足的 `!` 或 `&` 约束照旧抛错，与现有否定标签的表现完全一致。

### 配置示例

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["provider:anthropic"]
    model_info:
      allow_fail_open: true

  - model_name: chat
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["provider:openai", "default"]
    model_info:
      allow_fail_open: true

router_settings:
  enable_tag_filtering: true

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 未设置 `allow_fail_open` 时

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["!provider:anthropic", "!provider:openai"]}
  }'
# both deployments banned, allow_fail_open unset -> fails with no_deployments_with_tag_routing
```

### 设置 `allow_fail_open` 后

沿用上面的配置，同样的请求会改为回退到带 default 标签的部署，哪怕它正是请求想排除的那个：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["!provider:openai"]}
  }'
# openai deployment banned; anthropic deployment is not "default"-tagged, so the
# pool falls back to whichever deployment IS "default"-tagged (openai here) -> the
# ban is treated as advisory rather than failing the request
```

:::warning
回退到 default 池后，返回的部署仍可能是请求明确想排除的那个，这一风险对所有可归因于调用方的约束都存在。只应在"无法满足的 `!`/`&` 约束可以降级、不必失败"的模型组上设置 `allow_fail_open`；如果该约束是硬性合规要求（例如"绝不把该账户的流量路由到某提供商"），就不要设置。

从密钥或团队级策略继承来的约束不会被丢弃。代理会把来自密钥/团队元数据的标签与请求自身携带的标签分开追踪（记录在 `metadata.inherited_tags` 中），因此 `allow_fail_open` 只会丢弃调用方自己可控的约束。即使调用方在提交冲突标签的同时又原样重交了继承标签的值，这套机制依然成立；单纯的集合相减无法把这种值冲突与诚实的调用方标签区分开。如果只丢弃调用方可控部分后已无可路由的部署，请求会照常报错，而不是放行。

这层保护依赖代理层。绕过代理直接调用 SDK 的 `Router`（未设置 `metadata.inherited_tags`）时，会无条件回退到完全不受约束的 default 池，就像所有标签都出自调用方一样。这也正是 `allow_fail_open` 在代理之外一贯的行为。
:::

### allow_fail_open 语义

| 行为 | 说明 |
|----------|--------|
| 配置位置 | `model_info.allow_fail_open`，不是 `litellm_params`。为保证行为一致，请在共享同一模型组的每个部署上都设置；路由器只检查其中任意一个成员 |
| 默认值 | 未设置（即 `false`）。除非模型组显式开启，现有的 `!` 否定行为保持不变 |
| 作用范围 | 只作用于 `!` 或 `&` 导致的候选耗尽。普通标签耗尽维持原有行为：存在 default 池则回退，否则报错 |
| 回退池 | 与不带标签请求和仅禁用请求使用的 default 池相同，且不会重新套用请求自身的 `!`/`&` 约束 |
| 继承标签保护 | 是否丢弃取决于标签来源（`metadata.inherited_tags`，由代理根据密钥/团队策略填充），而不是把调用方自己的标签从全集中减去；因此即便调用方另行提交了完全相同的值，密钥/团队继承的约束依然受保护 |

## 显式路由指令（`tag_routing_prefix`）

基于标签的路由判断"这个标签是否用于路由"的方式，是看某个部署的字面标签字符串是否恰好匹配。这种启发式通常是对的，但调用方自造、匹配不到任何部署的 `&`/`!` 标签会被当作可疑噪声，可能挡住 `allow_fail_open` 的回退（见上文），哪怕调用方真心发出的就是一个无法满足却真实存在的请求。配置 `router_settings.tag_routing_prefix` 后，调用方可以把特定标签标为可信、无歧义的路由指令，用该前缀的标签就彻底不存在这种歧义。

任何以所配置前缀开头的请求标签都会先剥掉前缀，再按常规的 `!`/`&`/普通标签逻辑匹配；由于调用方已显式声明路由意图，不再需要词表检查。不带前缀的标签仍走现有的处理流程，完全不变，因此引入该前缀不需要任何迁移。

### 快速示例

配置 `tag_routing_prefix: "route:"` 之后：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["feature:demo", "route:!provider:openai"]}
  }'
# feature:demo is untouched attribution, never meant for routing; route:!provider:openai
# is stripped to !provider:openai and matched as an explicit ban
```

### 配置示例

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["default", "provider:anthropic"]
    model_info:
      allow_fail_open: true

  - model_name: chat
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["provider:openai"]

router_settings:
  enable_tag_filtering: true
  tag_routing_prefix: "route:" # opt-in: enables the prefix mechanism

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 带前缀标签与未知标签放行守卫

只要带了前缀，`&`/`!` 标签就会被[未知标签放行守卫](#失败放行回退allow_fail_open)视为已知标签，无论是否有部署的字面标签能匹配它，因为调用方已显式声明了路由意图：

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["route:&provider:anthropic", "route:&custom-routing-key"]}
  }'
# custom-routing-key matches no deployment's tags, but because it is prefix-marked
# the caller has explicitly declared it a routing directive -- allow_fail_open still
# proceeds to the default-tagged pool instead of being blocked by the "does an
# invented tag hide a satisfiable answer" guard
```

### tag_routing_prefix 语义

| 行为 | 说明 |
|----------|--------|
| 配置位置 | `router_settings.tag_routing_prefix`，字符串，默认 `""` |
| 默认值 | `""`。`str.startswith("")` 对任何字符串都返回真，因此在配置之前该机制完全不生效 |
| 匹配方式 | 精确的字面前缀匹配，不会自动追加分隔符。请自行配置带结尾分隔符的前缀（例如 `"route:"` 而非 `"route"`）；不带分隔符的前缀可能碰巧命中恰好以相同字符开头的无关标签 |
| 剥离顺序 | 先剥前缀，再做 `!`/`&` 解析，因此 `route:!provider:x` 和 `route:&provider:x` 都能正常工作 |
| 不带前缀的标签 | 仍走现有处理流程，完全不变：普通标签使用已知标签词表启发式，`!`/`&` 标签使用未知标签放行守卫 |
| 与失败放行的交互 | 无论部署标签词表如何，带前缀的 `&`/`!` 标签在 `allow_fail_open` 的未知标签守卫看来都算已知标签 |

## 按模型组的标签过滤（`enable_tag_filtering`）

在 `model_info` 中设置 `enable_tag_filtering`，可以只为某一个模型组覆盖 `router_settings.enable_tag_filtering`，开启或关闭均可。它的判定在模型组级别进行：路由器会查看所请求 `model_name` 组内的任意一个部署，只要该部署设置了 `model_info.enable_tag_filtering`，这个值就会取代全局默认值，作用于该组的所有请求。请在共享该组的每个部署上统一设置，与 `allow_fail_open` 已有的约定一致。

对于同时服务多个互不相关模型组的代理来说，这一点很重要。为了满足某个组的 `&`/`!` 合规路由而全局打开 `router_settings.enable_tag_filtering`，会让其他所有组的请求也被纳入标签评估。只在那个组的部署上设置 `model_info.enable_tag_filtering: true` 就能避免这种情况。反过来也行：划出一个不受标签影响的兜底组或应急响应组，代理的其余部分照常强制标签过滤。

### 快速示例

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "chat-compliance",
    "messages": [{"role": "user", "content": "Hello"}],
    "metadata": {"tags": ["&provider:anthropic"]}
  }'
# router_settings.enable_tag_filtering is false, but chat-compliance opts in via
# model_info.enable_tag_filtering: true, so the "&" constraint still applies
```

### 配置示例

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: chat-compliance
    litellm_params:
      model: anthropic/{{anthropic}}
      api_key: os.environ/ANTHROPIC_API_KEY
      tags: ["provider:anthropic"]
    model_info:
      enable_tag_filtering: true # opt in for this group only

  - model_name: chat-compliance
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
      tags: ["provider:openai"]
    model_info:
      enable_tag_filtering: true

  - model_name: incident-response
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
    model_info:
      enable_tag_filtering: false # opt out for this group only

router_settings:
  enable_tag_filtering: false # router-wide default; chat-compliance overrides it

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

使用这份配置时，尽管全局默认是关闭的，`chat-compliance` 仍会在每次请求上评估标签；而包括 `incident-response` 在内的所有其他模型组则忽略标签，回退到普通的负载均衡路由。如果把全局默认改成 `true`，`chat-compliance` 的行为不受影响，照旧评估标签，而 `incident-response` 显式设置的 `enable_tag_filtering: false` 让它继续保持豁免。

### enable_tag_filtering 语义

| 行为 | 说明 |
|----------|--------|
| 配置位置 | `model_info.enable_tag_filtering`，不是 `litellm_params`。请在共享同一模型组的每个部署上都设置；路由器只检查其中任意一个成员 |
| 优先级 | 从低到高：`router_settings.enable_tag_filtering`（全局默认）；其次是被请求组上设置的 `model_info.enable_tag_filtering`，它可为该组单独开启或关闭全局默认；最后是来自密钥/团队设置的请求级 `enable_tag_filtering` |
| 请求级只能上调 | 由代理根据密钥/团队设置写入的请求级设置只能开启过滤。请求级 `enable_tag_filtering=True` 仍能压过用 `enable_tag_filtering: false` 自行退出的组；但不存在请求级手段，能推翻路由器与模型组已经做出的关闭决定 |
| 默认值 | 未设置。模型组遵循 `router_settings.enable_tag_filtering`，与该覆盖机制出现之前完全一样 |
| 作用范围 | 作用于该组整个标签过滤决策，不只是 `&`/`!` 的处理。关闭过滤的组会一视同仁地忽略普通、否定和必需标签 |
| 与健康状态无关 | 该值从模型组配置的全部部署中解析，而非只看当前健康的部署；单个部署进入冷却，不会因为把唯一携带该覆盖的部署移出轮换，就悄悄改变整个组的标签策略 |

## 基于正则的标签路由（`tag_regex`）

在部署上使用 `tag_regex`，可以按请求头（例如 `User-Agent`）匹配进来的请求，而不要求客户端显式发送标签。正则模式由运维方配置、在服务端编译，不由调用方提供。

:::warning
User-Agent 是客户端提供的请求头，任何调用方都能把它设成任意值。请把 `tag_regex` 用作流量分类，不要用作访问控制。

基于请求头的路由本身不构成安全边界。只有当请求先经过上游认证层（例如先校验凭据、在流量到达 LiteLLM 之前就拒绝未认证请求的 API 网关或反向代理）时，它才有意义。缺少这样的层时，任何客户端都可以伪造 User-Agent，被路由到本不该到达的部署。
:::

### 1. 配置

```yaml showLineNumbers title="config.yaml"
model_list:
  # Claude Code traffic → dedicated deployment, matched by User-Agent
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/converse/anthropic-claude-sonnet-4-6
      aws_region_name: us-east-1
      aws_role_name: arn:aws:iam::111122223333:role/LiteLLMClaudeCode
      tag_regex:
        - "^User-Agent: claude-code\\/"   # matches claude-code/1.x, 2.x, etc.
    model_info:
      id: claude-code-deployment
  # All other traffic falls back to the default deployment
  - model_name: claude-sonnet
    litellm_params:
      model: bedrock/converse/anthropic-claude-sonnet-4-6
      aws_region_name: us-east-1
      aws_role_name: arn:aws:iam::444455556666:role/LiteLLMDefault
      tags:
        - default
    model_info:
      id: regular-deployment

router_settings:
  enable_tag_filtering: true
  tag_filtering_match_any: true

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 2. 验证路由

```bash
# Claude Code request (User-Agent set automatically by Claude Code)
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "User-Agent: claude-code/1.2.3" \
  -d '{"model": "claude-sonnet", "messages": [{"role": "user", "content": "hi"}]}'
# -> x-litellm-model-id: claude-code-deployment

# Any other client (no matching User-Agent) -> default deployment
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{"model": "claude-sonnet", "messages": [{"role": "user", "content": "hi"}]}'
# -> x-litellm-model-id: regular-deployment
```

### 匹配语义

| 行为 | 说明 |
|----------|--------|
| 引擎 | Python `re.search`；模式不必加锚点，除非你想固定匹配字符串的开头（`^`）或结尾（`$`） |
| 输入格式 | 模式匹配的是 `"Header-Name: value"` 形式的字符串。目前只开放 `User-Agent`：`User-Agent: claude-code/1.2.3` |
| 匹配逻辑 | 恒为 OR，任意一个模式命中即可选中该部署。`tag_filtering_match_any=False` 只作用于普通 `tags`，不影响 `tag_regex` |
| 非法模式 | `re.compile` 失败的模式会被记录并跳过，不会导致硬错误 |
| 与普通标签的交互 | 当部署同时配置 `tags` 和 `tag_regex`，且 `tag_filtering_match_any=False` 时，若严格的标签检查已未通过，正则路径会被阻断。正则不能推翻严格标签策略 |
| 可信输入 | 模式由运维方在配置中设定，绝不来自调用方。这是它与否定标签（请求元数据里的 `!foo`）的关键区别，后者始终按普通字面量处理 |

### 与否定标签的交互

否定排除先于 `tag_regex` 匹配执行。当一个部署同时带有普通 `tags` 列表和 `tag_regex` 时，这个顺序就很关键：

1. 路由器先移除 `tags` 与请求排除集有交集的部署。
2. `tag_regex` 匹配只在幸存的候选上运行。

**情况 1：否定标签排除了普通标签部署，`tag_regex` 部署不受影响**

```yaml
model_list:
  - model_name: chat
    litellm_params:
      tag_regex: ["^User-Agent: claude-code\\/"]   # no plain tags
    model_info: {id: claude-code-deployment}

  - model_name: chat
    litellm_params:
      tags: ["provider:anthropic"]
    model_info: {id: anthropic-deployment}
```

```bash
curl ... -H "User-Agent: claude-code/1.2.3" \
  -d '{"model":"chat","metadata":{"tags":["!provider:anthropic"]}}'
# anthropic-deployment is excluded; claude-code-deployment is matched by User-Agent
# -> x-litellm-model-id: claude-code-deployment
```

**情况 2：否定标签排除了持有 `tag_regex` 的部署，触发仅禁用路径**

如果被否定的标签与 `tag_regex` 在同一个部署上，该部署会先被排除。候选池里不再有带 `tag_regex` 的部署时，`has_tag_filter` 变为 `False`，仅禁用路径被触发，剩余部署直接返回。

```yaml
model_list:
  - model_name: chat
    litellm_params:
      tag_regex: ["^User-Agent: claude-code\\/"]
      tags: ["group:claude"]   # negation target is on the tag_regex deployment
    model_info: {id: claude-code-deployment}

  - model_name: chat
    litellm_params:
      tags: ["provider:openai"]
    model_info: {id: openai-deployment}
```

```bash
curl ... -H "User-Agent: claude-code/1.2.3" \
  -d '{"model":"chat","metadata":{"tags":["!group:claude"]}}'
# claude-code-deployment excluded; no tag_regex deployments remain
# ban-only path returns openai-deployment regardless of User-Agent
# -> x-litellm-model-id: openai-deployment
```

### 可观测性

```json
{
  "tag_routing": {
    "matched_via": "tag_regex",
    "matched_value": "^User-Agent: claude-code\\/",
    "user_agent": "claude-code/1.2.3",
    "request_tags": []
  }
}
```

## 基于团队的标签路由（企业版）

### 配置

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["teamA"] # 👈 Key Change
    model_info:
      id: "team-a-model"
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["teamB"] # 👈 Key Change
    model_info:
      id: "team-b-model"
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/
      tags: ["default"] # OPTIONAL - All untagged requests will get routed to this

router_settings:
  enable_tag_filtering: True # 👈 Key Change

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 创建带标签的团队

```bash
# Create Team A
curl -X POST http://0.0.0.0:4000/team/new \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["teamA"]}'

# Create Team B
curl -X POST http://0.0.0.0:4000/team/new \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["teamB"]}'
```

### 为团队成员生成密钥

```bash
# Generate key for Team A
curl -X POST http://0.0.0.0:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "team_a_id_here"}'

# Generate key for Team B
curl -X POST http://0.0.0.0:4000/key/generate \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"team_id": "team_b_id_here"}'
```

### 验证路由

```bash
curl -i -X POST http://0.0.0.0:4000/chat/completions \
  -H "Authorization: Bearer team_a_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fake-openai-endpoint",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```
