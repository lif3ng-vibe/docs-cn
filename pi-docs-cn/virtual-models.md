---
title: "虚拟模型"
---

虚拟模型（virtual model）是一种可选择的模型，它为每个请求挑选一个物理模型。用它按任务、成本或会话状态进行路由。例如，路由器可以把简单问题发给小模型、把难题发给大模型，而用户只需选择一个模型。

虚拟模型通过[扩展](extensions.md)注册。它们与其他模型一样出现在 `/model`、`--model`、限定范围的模型和设置中。虚拟模型可以列在任何提供商之下，包括有物理模型的提供商，例如 `openai-codex/auto`。

## 选择与分发

虚拟模型选择一个模型和一个思考级别（thinking level）。路由器为每个请求把这一对映射到一对物理值：

```
selected (virtual model, virtual level)  ->  dispatched (physical model, physical level)
jev/auto:low                             ->  anthropic/claude-sonnet-4-5:high
```

虚拟思考级别是路由器的输入。其含义由路由器决定；不必对应某个推理预算。

Pi 把这两对区分开：

| | 选择 | 分发 |
|---|---|---|
| 记录于 | `model_change` 和 `thinking_level_change` 条目 | 每条助手消息：`provider`、`api`、`model`、`thinkingLevel` |
| 呈现为 | `ctx.model`、`ctx.thinkingLevel`、`PI_MODEL`、`PI_REASONING_LEVEL`、`/model` | 每次响应的助手消息 |

提供商只收到物理模型。助手消息记录的是物理模型，因此在不同物理模型之间重放会话与手动切换模型后的行为一致。恢复会话时，Pi 从最近的 `model_change` 条目还原虚拟选择。如果该虚拟模型已不再注册，Pi 会回退到上一个作出应答的物理模型。

交互模式下，页脚会在所选内容旁边显示路由到的模型，例如 `auto • high → gpt-5.6-luna • medium`。`/session` 会列出每个物理模型的成本。

上下文用量采用产生最近一次响应的物理模型的限额，即使该响应出现在切换到虚拟模型之前。若没有这样的响应，则采用虚拟模型上声明的限额（如有）。压缩检查同样的限额，也检查每个请求路由到的模型的限额。如果该模型的上下文窗口对会话来说太小，Pi 会在发送请求前先压缩；路由保持路由器所选的结果不变。

## 注册虚拟模型

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerVirtualModel({
    provider: "router",
    id: "auto",
    name: "Auto",
    thinkingLevels: ["low", "high"],
    route(request, ctx) {
      // Tool follow-ups and retries stay on the model that handled the turn.
      const sticky = request.failed ?? request.previous;
      if (request.reason !== "user" && sticky) {
        return { model: sticky.model, thinkingLevel: sticky.thinkingLevel ?? "medium" };
      }
      const id = request.thinkingLevel === "high" ? "claude-sonnet-4-5" : "claude-haiku-4-5";
      return { model: ctx.modelRegistry.find("anthropic", id)!, thinkingLevel: "medium" };
    },
  });
}
```

- `provider` 是模型所列在的提供商。可以是任意提供商 ID。一个提供商可以在其物理模型旁列出多个虚拟模型。在物理提供商下，该提供商持有凭据时虚拟模型才可用；在没有任何提供商使用的 ID 下，它始终可用。
- `id` 不得与该提供商某个物理模型的 ID 相同。如果目录刷新之后新增了同 ID 的物理模型，虚拟模型会将其遮蔽。
- `thinkingLevels` 列出可供选择的级别。默认为 `["off"]`。
- `contextWindow` 和 `maxTokens` 会在首次响应之前显示。未设置的限额视为未知。
- `input` 列出可供选择的输入类型。默认为文本和图像；不支持图像的物理模型会收到占位符。

注册遵循与 `pi.registerProvider()` 相同的排队和重新加载规则。再次注册相同的提供商和 ID 会替换该虚拟模型。`pi.unregisterVirtualModel(provider, id)` 移除它；`pi.unregisterProvider()` 则不会。SDK 代码无需扩展即可注册：`modelRuntime.registerVirtualModel(definition)`。

## 路由请求

`route(request, ctx)` 在使用该虚拟模型发出的每个请求之前运行，返回 `{ model, thinkingLevel }`。模型可以是目录中其提供商持有凭据的任意物理模型；用 `ctx.modelRegistry` 查找。虚拟模型不能路由到另一个虚拟模型。Pi 会把思考级别钳制到返回模型支持的范围内。

| 字段 | 含义 |
|---|---|
| `model`、`thinkingLevel` | 选中的虚拟模型和级别 |
| `reason` | 发起请求的原因，见下 |
| `previous` | `messages` 中最近一次成功响应的物理模型和思考级别 |
| `failed` | 用于 `retry`：失败请求的物理模型、思考级别和助手 `message`（`messages` 已不含该消息）。消息携带 `stopReason` 和 `errorMessage`。路由本身失败时不存在 |
| `state` | 该会话分支上最后一次返回的路由器状态，见下 |
| `messages` | 本次请求的会话内容，包括系统消息 |
| `signal` | 请求的中止信号 |

| `reason` | 请求 |
|---|---|
| `user` | 用户消息之后的首个请求，包括引导（steering）和追问（follow-up）消息 |
| `continuation` | 智能体循环（agent loop）中的其他任何请求，例如工具结果或扩展消息之后 |
| `retry` | 请求失败后的自动重试，包括上下文溢出压缩之后 |
| `direct` | 智能体循环之外的请求，例如压缩摘要或扩展调用 `ctx.modelRegistry.streamSimple()` |

为 `continuation` 返回 `previous`、为 `retry` 返回 `failed` 可以保持提示词缓存和思考签名有效。轮次之间切换模型是允许的，但会丢失提示词缓存。重试也可以切换到另一个模型，例如当 `failed.message.errorMessage` 报告提供商过载或上下文溢出时。

如果 `route()` 抛出异常，或返回虚拟模型、无凭据的模型，该请求会以错误响应结束。

## 保存路由状态

`route()` 可以在模型之外返回 `state`。Pi 把它存储在会话分支上，并在后续请求中作为 `request.state` 传回。用于转录不记录的决策，例如分类器结果或路由阶段：

```typescript
pi.registerVirtualModel<{ phase: "plan" | "build" }>({
  provider: "router",
  id: "phased",
  name: "Phased",
  route(request, ctx) {
    const state = request.state ?? { phase: "plan" };
    const id = state.phase === "plan" ? "claude-opus-4-5" : "claude-haiku-4-5";
    return { model: ctx.modelRegistry.find("anthropic", id)!, thinkingLevel: "medium", state };
  },
});
```

- 状态必须可 JSON 序列化。返回 `undefined` 或 `request.state` 本身则保持当前状态。
- 其他任何返回对象都会被 Pi 在请求发出前存为新状态，即使它与当前状态相等。只在状态变化时返回新对象。请求随后失败时，状态依然保留。
- 状态跟随会话树，因此分叉（fork）和 `/tree` 导航看到的是各自分支的状态。它能在压缩后保留。
- `direct` 请求没有状态，Pi 也会忽略它们返回的状态。

转录已经记录了选择和每个被分发的模型，`ctx.sessionManager.getBranch()` 两者都能拿到。

路由器可以通过 `ctx.modelRegistry` 调用其他模型，例如用来自 `ctx.modelRegistry.findOfType("classifier", provider, id)` 的分类器模型调用 `ctx.modelRegistry.classify()`。该调用会给本轮首个 token 之前增加延迟。

完整路由器见 [`jev-router.ts`](../examples/extensions/jev-router.ts)。它用 Jev 分类器选出的强 OpenAI Codex 模型做规划，让该模型完成首次编辑，然后一次性切换到更便宜的模型，接受一次提示词缓存未命中。它把阶段保存为路由器状态。
