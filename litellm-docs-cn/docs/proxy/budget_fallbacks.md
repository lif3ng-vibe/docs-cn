import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 预算回退

:::info

`v1.92.x` 及以上版本可用。

:::

当密钥的 [`model_max_budget`](./users#-虚拟密钥按模型) 被超出时，把请求重路由到回退模型，而不是返回 `budget_exceeded` 错误。

默认情况下，一旦密钥在某个模型上的花费超过其上限，`model_max_budget` 就会拦截请求。`budget_fallbacks` 允许你在密钥本身上为每个模型配置回退链，这样请求会被静默重路由到第一个仍有剩余预算的回退模型。花费会计入回退模型名下，而不是耗尽预算的那个。

这是一项虚拟密钥（virtual key）设置，无需修改 `config.yaml`，也不涉及路由器（router）层面的回退。

## 触发条件

回退在同时满足以下全部条件时生效：

密钥已为所请求的模型配置了 `model_max_budget`，且该模型累计花费已超过其 `budget_limit`；密钥在 `budget_fallbacks` 中也有对应所请求模型的条目。系统会选用链中第一个自身仍在预算内的回退模型（或者它没有 `model_max_budget` 条目，或者其上限尚未触顶）；如果所有回退模型都超出预算，则照常抛出原始的 `BudgetExceededError`。

路由器层面的回退（`config.yaml` 中的 `fallbacks: [{model: [...]}]`）不受影响，仍会在下游提供商（provider）报错时触发。`budget_fallbacks` 只作用于鉴权层内针对单个密钥的 `model_max_budget` 检查。

## 快速上手

### 1. 生成一个带单模型预算与回退链的密钥

```bash
curl 'http://0.0.0.0:4000/key/generate' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model_max_budget": {
      "anthropic-haiku-4-5": {"budget_limit": 0.01, "time_period": "1d"}
    },
    "budget_fallbacks": {
      "anthropic-haiku-4-5": ["{{openai_large}}"]
    }
  }'
```

`budget_fallbacks` 是一个 `Dict[str, List[str]]`，以主模型名作为键，值则是该模型的有序回退链。

### 2. 发送请求

客户端照常指向主模型即可：

```bash
curl 'http://0.0.0.0:4000/v1/chat/completions' \
  --header 'Authorization: Bearer <sk-generated-key>' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "anthropic-haiku-4-5",
    "messages": [{"role": "user", "content": "hello"}]
  }'
```

在密钥的 `anthropic-haiku-4-5` 用量未超上限时，请求仍由 `anthropic-haiku-4-5` 处理。一旦触顶，后续请求会透明地改由 `{{openai_large}}` 服务，调用方不会看到任何 `budget_exceeded` 错误。

### 3. 确认重路由

`/spend/logs?api_key=<sk-generated-key>` 会把发生回退之后的用量归到 `{{openai_large}}` 名下（部署与 `model_group` 均是如此），因此成本追踪、请求标记和单模型预算依然准确。

## 链式回退

列表中的每个条目按顺序尝试，第一个自身仍在 `model_max_budget` 限额内的回退会被采用。这意味着你可以定义一条分级回退链，逐级换到更便宜或限额更高的模型：

```bash
curl 'http://0.0.0.0:4000/key/generate' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model_max_budget": {
      "{{openai_large}}":   {"budget_limit": 5.0,  "time_period": "1d"},
      "{{anthropic}}": {"budget_limit": 2.0,  "time_period": "1d"},
      "{{openai_small}}":    {"budget_limit": 1.0,  "time_period": "1d"}
    },
    "budget_fallbacks": {
      "{{openai_large}}": ["{{anthropic}}", "{{openai_small}}"]
    }
  }'
```

对 `{{openai_large}}` 的请求会一直留在 `{{openai_large}}`，直到其每日 5 美元额度用尽，随后切换到 `{{anthropic}}`，再在该密钥达到每日 2 美元上限时切换到 `{{openai_small}}`。如果 `{{openai_small}}` 也超出了每日 1 美元的上限，请求最终会返回 `budget_exceeded`。

不在 `model_max_budget` 之列的回退模型，从预算检查的角度视为不设上限，只要轮到它就一定会被选中。

## 更新已有密钥

使用 `/key/update` 就能修改回退链，无需重新生成密钥：

```bash
curl 'http://0.0.0.0:4000/key/update' \
  --header "Authorization: Bearer $LITELLM_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "key": "sk-generated-key",
    "budget_fallbacks": {"anthropic-haiku-4-5": ["{{openai_large}}", "{{openai_small}}"]}
  }'
```

## 相关阅读

[虚拟密钥 model_max_budget](./users#-虚拟密钥按模型)、[回退管理端点](./fallback_management)、[可靠性与回退](./reliability)。
