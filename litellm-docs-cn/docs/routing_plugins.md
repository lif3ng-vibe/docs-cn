# 路由插件

:::info

路由插件自 **v1.92.x** 起可用（随周四发布上线）。这一设计仍在演进中，欢迎在 GitHub 的 autorouter 讨论区告诉我们你会怎么用它、接下来还想看到什么：[#32168](https://github.com/BerriAI/litellm/discussions/32168)。

:::

路由插件（routing plugin）构成一条流水线：每个插件接收路由上下文（routing context），对其进行增强，再传给下一个插件，最后才做出路由决策。

有两种配置入口：

- **Python SDK**：把插件实例传给 `Router(plugins=[...])`，每次路由决策都会执行。
- **代理 YAML**：`complexity_router_config.plugins` 接受点分路径引用，在复杂度路由器挑选层级（tier）的环节执行，作用对象是该层级的实际候选池。

插件不会取代路由器；它的作用是在路由器做出最终决策前，以标准化的方式增强路由上下文。

复杂度自动路由器还会接入第二个独立插件，负责决策的另一半：分类器插件（classifier plugin）负责指定层级，候选池的筛选则交给路由插件。二者共享同一个上下文对象，接口不同，并且可以组合使用。参见[分类器插件：选择层级](#分类器插件选择层级)。

## 插件的能力与限制

插件可以：

- **缩小 `candidate_models`**：删除条目即可限制 Router 能选中哪些部署；新增条目无效，只有初始部署池中的模型才会被派发。
- **发布 `signals`**：后续插件从 `context.signals` 读取；Router 与下游策略（auto-router、complexity-router、adaptive-router、quality-router）则从 `metadata["routing_plugin_signals"]` 读取。
- **终止流水线**：从 `run()` 抛出异常即可短路请求。把候选缩到零同样会中止请求（抛出 `ValueError`）。
- **读取 `raw_messages` 或 `structured_messages`**：仅限读取，二者都不会写回发出的请求。需要与提供商无关的 OpenAI 对话格式时读 `structured_messages`；需要原始线上负载（`/chat/completions`、`/v1/messages`、Responses API 的 `input` 等）时读 `raw_messages`。

插件不能：

- **修改请求体**：改动 `context.raw_messages` 或 `context.structured_messages` 并不会重写发给提供商的消息。要改写提示词，请使用调用前钩子或防护栏（guardrail）；路由插件对请求是只读的。
- **直接修改请求元数据**：`context.metadata` 只是一份副本。请改经 `context.signals` 发布；Router 会把它们呈现在 `metadata["routing_plugin_signals"]` 上。
- **向候选池添加部署**：过滤只做包含与排除。把 Router 的 `model_list` 中不存在的模型加进 `candidate_models` 没有任何效果。
- **替复杂度路由器选层级**：路由插件只在已判定出的层级上运行。要自行决定层级，请编写[分类器插件](#分类器插件选择层级)。

## 端到端完整示例

1. 用户发起请求。
2. 语言插件检测到 `en`。
3. 领域分类器以 0.93 的置信度将其标记为 `coding`。
4. 租户策略把可用提供商限定为 OpenAI 和 Anthropic。
5. 预算插件移除超出租户成本策略的模型。
6. Router 拿到增强后的路由上下文，从剩余模型中选出最优的一个。

## 快速上手

```python
from litellm import Router
from litellm.types.router import RoutingContext


class LanguageDetector:
    async def run(self, context: RoutingContext) -> RoutingContext:
        context.signals["language-detector"] = {"lang": "en"}
        return context


class DomainClassifier:
    async def run(self, context: RoutingContext) -> RoutingContext:
        context.signals["domain-classifier"] = {"domain": "coding", "confidence": 0.93}
        return context


class TenantPolicy:
    ALLOWED = {"acme-corp": {"openai", "anthropic"}}

    async def run(self, context: RoutingContext) -> RoutingContext:
        tenant = context.metadata.get("tenant", "default")
        allowed = self.ALLOWED.get(tenant, {"openai", "anthropic", "self-hosted"})
        context.candidate_models = [
            m for m in context.candidate_models if m.split("/")[0] in allowed
        ]
        return context


class BudgetPolicy:
    COST_CAP_PER_TOKEN = 0.000001
    COST_BY_MODEL = {
        "openai/{{openai_small}}": 0.0000002,
        "anthropic/{{anthropic}}": 0.000002,
        "openai/{{openai_large}}": 0.000002,
    }

    async def run(self, context: RoutingContext) -> RoutingContext:
        context.candidate_models = [
            m for m in context.candidate_models
            if self.COST_BY_MODEL.get(m, 0) <= self.COST_CAP_PER_TOKEN
        ]
        return context


router = Router(
    model_list=[
        {"model_name": "smart-router", "litellm_params": {"model": "openai/{{openai_small}}"}},
        {"model_name": "smart-router", "litellm_params": {"model": "anthropic/{{anthropic}}"}},
        {"model_name": "smart-router", "litellm_params": {"model": "openai/{{openai_large}}"}},
        {"model_name": "smart-router", "litellm_params": {"model": "ollama/llama-3-70b"}},
    ],
    plugins=[LanguageDetector(), DomainClassifier(), TenantPolicy(), BudgetPolicy()],
)

response = await router.acompletion(
    model="smart-router",
    messages=[{"role": "user", "content": "Write a function to reverse a linked list."}],
    metadata={"tenant": "acme-corp"},
)
```

## 路由上下文

插件作者不必了解每家提供商的请求格式，只需面向一个稳定接口开发：

```python
class RoutingContext(BaseModel):
    raw_messages: list[dict[str, Any]]         # original request payload, read-only
    structured_messages: list[dict[str, Any]]  # normalized to OpenAI chat format, read-only
    candidate_models: list[str]                # provider/model; narrow to restrict Router
    metadata: dict[str, Any]                   # tenant, user, session info (copy; not writable back)
    signals: dict[str, Any]                    # write here to pass output downstream
```

任何对象只要实现了 `async def run(self, context) -> RoutingContext`，就是一个插件。

## 请求生命周期

插件在自动路由之前运行。`async_pre_routing_hook` 内部的顺序如下：

1. 请求进入 `acompletion()`（或其他异步 Router 入口）。
2. **路由插件流水线按列表顺序执行**：每个插件的 `run()` 都能看到上一个插件做出的修改。
3. auto-router / complexity-router / adaptive-router / quality-router 进行派发；若依赖插件输出，则读取 `metadata["routing_plugin_signals"]`。
4. 健康部署过滤强制执行缩小后的 `candidate_models`，所处环节与基于标签的路由相同。
5. 路由策略（`simple-shuffle`、`usage-based-routing-v2`、`cost-based-routing`、`latency-based-routing`、`least-busy`）从剩余部署中选出一个。
6. 向提供商发起调用。

每个请求只运行一次流水线。候选缩到零会抛出 `ValueError`；插件返回零候选属于策略决策，如果悄悄回退到未过滤的池子，策略就被架空了。

## 与复杂度自动路由器配合使用

插件与复杂度自动路由器有两种组合方式：

**供路由器消费的信号**：插件写入 `context.signals` 的任何内容都会在路由器运行前呈现在 `metadata["routing_plugin_signals"]` 上，领域分类插件因此可以发布自己的标签，路由器据此决策。

**候选缩小作为硬性策略闸门**：插件缩小的是层级实际的候选池。如果插件把某层级的候选全部剔除，这次调用就会抛出异常；路由器不会回退到 `default_model`，否则等于留了一个无条件绕过策略的后门。

### 在代理（YAML）中配置

在 `complexity_router_config` 下添加 `plugins`。每个条目是指向 `RoutingPlugin` 实例的点分路径，解析方式与 `litellm_settings.callbacks` 相同（路径相对于 `config.yaml` 所在目录）。

```yaml
model_list:
  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        tiers:
          SIMPLE: ["{{openai_small}}"]
          MEDIUM: ["{{openai_small}}"]
          COMPLEX: ["{{openai_large}}", "{{openai_small}}"]
          REASONING: ["{{openai_large}}", "{{openai_small}}"]
        default_model: {{openai_small}}
        plugins:
          - plugins.cost_ceiling_plugin.cost_ceiling_plugin

  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

  - model_name: {{openai_large}}
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY
```

同目录下的 `plugins/cost_ceiling_plugin.py`：

```python
class CostCeilingPlugin:
    def __init__(self, max_cost_per_token: float, cost_by_model: dict):
        self.max_cost_per_token = max_cost_per_token
        self.cost_by_model = cost_by_model

    async def run(self, context):
        context.candidate_models = [
            m for m in context.candidate_models
            if self.cost_by_model.get(m, 0.0) <= self.max_cost_per_token
        ]
        context.signals["cost-ceiling-plugin"] = {"max_cost_per_token": self.max_cost_per_token}
        return context


cost_ceiling_plugin = CostCeilingPlugin(
    max_cost_per_token=0.000001,
    cost_by_model={"{{openai_small}}": 2e-07, "{{openai_large}}": 2e-06},
)
```

代理在启动时解析每个点分路径，校验结果是否为 `RoutingPlugin`（否则以清晰的报错终止启动），并把实例接入每一个选层级的环节：加权评分、`keyword_tier_rules` 覆盖，以及无用户消息时的默认层级路径。任何路由都绕不开这条流水线。

对于路由到 `["{{openai_large}}", "{{openai_small}}"]` 层级的 `COMPLEX` 请求，`CostCeilingPlugin` 会剔除 `{{openai_large}}`（超出上限），所有派发最终都落在 `{{openai_small}}` 上。

在代理上把插件与复杂度路由器搭配使用时，有两点行为需要了解：

- **配置插件后 `session_affinity` 会被禁用**：否则缓存会把会话首轮的模型固定下来，并在后续轮次跳过插件流水线，会话中途的策略调整（例如越过预算上限）就只会作用于首轮。
- **`adaptive=True` 与 `plugins` 同用会在配置校验阶段报错**：bandit 选择器尚不能消费插件缩小后的候选池。

### 从 SDK 配置

接线方式相同，插件以实例形式传给 `Router(plugins=[...])`。规则也一样：候选缩小作用于已判定层级的目标池，候选一个不剩就抛出异常，`default_model` 不是逃生通道。

```python
from litellm import Router

router = Router(
    model_list=[
        {"model_name": "{{openai_small}}", "litellm_params": {"model": "openai/{{openai_small}}"}},
        {"model_name": "{{openai_large}}", "litellm_params": {"model": "openai/{{openai_large}}"}},
        {
            "model_name": "smart-router",
            "litellm_params": {
                "model": "auto_router/complexity_router",
                "complexity_router_config": {
                    "tiers": {
                        "SIMPLE": ["{{openai_small}}"],
                        "COMPLEX": ["{{openai_large}}", "{{openai_small}}"],
                    },
                    "default_model": "{{openai_small}}",
                },
            },
        },
    ],
    plugins=[cost_ceiling_plugin],
)
```

## 分类器插件：选择层级

路由插件缩小的是路由器可供挑选的池子，分类器插件决定的则是用哪个池子。它取代复杂度路由器的分类环节：层级的判定权从启发式评分器、LLM 分类器或关键词规则转移到你的代码，路由器随后服务该层级的模型。

当层级无法从提示词内容推断出来时，就适合用它：按团队或租户套餐路由，按你自有服务中的权益路由，或按故障期间切换的开关路由。调用方身份会随 `context.metadata` 一并提供（`user_api_key_team_id`、`user_api_key_team_alias`、`user_api_key_user_id`），因此按团队或租户分层不需要自己再搭管线。

:::info

分类器插件随 **v1.99.x** 发布（[PR #37249](https://github.com/BerriAI/litellm/pull/37249)）。仅支持配置文件，与 `plugins` 的限制一致：活跃对象无法经 HTTP 传输，因此这两个键都不能通过模型管理 API 或 UI 设置。

:::

把 `classifier_type` 设为 `custom`，并把 `classifier_plugin` 指向一个 `ClassifierPlugin` 实例的点分路径，启动时的解析方式与 `plugins` 条目完全一致（相对于 `config.yaml` 所在目录）。`classifier_plugin_timeout_ms` 限制调用时长，默认为 3000。

```yaml title="config.yaml"
model_list:
  - model_name: smart-router
    litellm_params:
      model: auto_router/complexity_router
      complexity_router_config:
        classifier_type: custom
        classifier_plugin: plugins.tier_by_team.tier_by_team
        classifier_plugin_timeout_ms: 3000
        tiers:
          SIMPLE: ["{{openai_small}}"]
          REASONING: ["{{openai_large}}", "{{openai_small}}"]
        default_model: {{openai_small}}

  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY
```

同目录下的 `plugins/tier_by_team.py`：

```python
class TierByTeam:
    async def classify(self, context):
        team = context.metadata.get("user_api_key_team_alias")
        if team == "research":
            return "REASONING"
        if team == "support":
            return "SIMPLE"
        return None


tier_by_team = TierByTeam()
```

任何实现了 `async def classify(self, context) -> str | None` 的对象都是分类器插件。它接收与路由插件相同的 `RoutingContext`，返回层级名称：内置层级（`SIMPLE`、`MEDIUM`、`COMPLEX`、`REASONING`）或其 `tier_labels` 显示名。返回 `None` 表示拒绝处理，请求交给已配置的回退机制。

### 与路由插件的区别

`ClassifierPlugin` 是一个独立接口，并非 `RoutingPlugin` 的重载；两者差异源于各自决策的对象不同。

一个路由器有一个分类器和一串路由插件：`classifier_plugin` 接收单个点分路径，`plugins` 接收按流水线顺序执行的列表。“选哪个层级”这个问题没有串联的必要，因为第一个答案就是最终答案。

`candidate_models` 在这里只作参考。它以快照形式给出每个层级的模型，让分类器知道路由器能服务什么，但真正决定池子的是你返回的层级，过滤这个列表不会产生任何效果，缩小候选是路由流水线的职责。

失败在两个接口上含义相反。路由插件把候选缩到零会抛出异常，因为缩到零是策略决策，悄悄放宽池子等于让策略失效。分类器拒绝、抛异常、超出 `classifier_plugin_timeout_ms`，或返回路由器不认识的层级时，等于没有产出任何策略，请求会按 LLM 分类器失败时的同样方式回退：`classifier_fallback` 把请求交给启发式评分器，或交给 `default_model`。分类器插件宕机只会让路由质量下降，绝不会让请求失败。

配置错误在启动时就会暴露，而不是等到第一次分类请求。点分路径解析不出带异步 `classify` 的对象会被拒绝，并指明是哪个配置键；`classifier_type: custom` 却没有配套插件会报错；`classifier_plugin` 出现在其他 `classifier_type` 下同样报错，因为它永远不会被执行。

### 两者组合使用

两个键都在同一个 `complexity_router_config` 上，路由器可以同时设置。分类器先选层级，路由流水线再过滤该层级的池子，基于团队的分类器和成本上限路由插件因此可以叠加使用，彼此互不知晓。

前文针对 `plugins` 的两条限制只针对候选缩小，不适用于分类器插件。`session_affinity` 继续有效，因为分类器只在需要分类的轮次运行，固定机制跳过的是分类而非策略。`adaptive: true` 也能组合，在分类器返回的层级内做 Thompson 采样；而 `adaptive` 与 `plugins` 搭配仍会在配置校验阶段报错。

路由器的其余行为与文档一致：`keyword_tier_rules` 在分类器之前短路，升级关键词仍可把它返回的层级向上提升，`classifier_context_*` 设置仍只对 LLM 分类器生效，因为插件自己读取消息。每次决策都以 `cause=classifier_plugin` 记录日志。完整字段参考见[自动路由](./proxy/auto_routing.md#分类)页面。

## 局限性

仅支持异步。配置了插件时，同步的 `Router.completion()` 会报错。支持的路由策略：`simple-shuffle`、`usage-based-routing-v2`、`cost-based-routing`、`latency-based-routing`、`least-busy`，以及 `auto_router/*`（目前即复杂度路由器）。旧版 `usage-based-routing`（v1）会报错。

代理 YAML 配置目前只接入了复杂度路由器。其他自动路由器（adaptive、semantic、quality）仍需通过 SDK 使用。

当前的候选过滤只支持包含与排除。加权评分（插件表达偏好，如“优先 Claude”“惩罚昂贵模型”，而非彻底剔除模型）不在第一版范围内。

## 参考

配置：[`router_settings.plugins`](./proxy/config_settings#router_settings-参考)。
相关 PR：[#32972](https://github.com/BerriAI/litellm/pull/32972)（SDK）、[#33251](https://github.com/BerriAI/litellm/pull/33251)（复杂度路由器的代理 YAML）、[#37249](https://github.com/BerriAI/litellm/pull/37249)（分类器插件）。讨论：[#32168](https://github.com/BerriAI/litellm/discussions/32168)。

## 参与讨论

自 **v1.92.x** 起可用（随周四发布上线）。路由插件和自动路由器下一步走向哪里仍在积极讨论中，我们想听听你会写什么样的插件、需要哪些信号、又会选用哪些路由策略。欢迎在 GitHub 的 autorouter 讨论区分享你的使用场景并持续关注：[#32168](https://github.com/BerriAI/litellm/discussions/32168)。
