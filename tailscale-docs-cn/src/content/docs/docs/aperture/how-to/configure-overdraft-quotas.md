---
title: "配置透支配额"
description: "默认情况下，Aperture 会并行扣减每条匹配请求的[配额桶][docs-aperture-quotas]：如果一个请求花费 $1 且有三个桶匹配，每个桶都会扣 $1。透支增加了一个顺"
---

最后验证于 Sep 29, 2026

默认情况下，Aperture 会并行扣减每条匹配请求的[配额桶][docs-aperture-quotas]：如果一个请求花费 $1 且有三个桶匹配，每个桶都会扣 $1。透支（overdraft）增加了顺序扣减的维度：它不是一次性扣减所有匹配的桶，而是让一条透支链先花主桶，只有当主桶耗尽时才向链中的下一个桶借用。

当大多数用户应共享同一份额度、但部分用户需要额外余量时，可以使用透支。你可以给每个人一个基础配额，然后让某个组或个人向额外的桶借用，而无需为所有人重新定义基础配额。

## 透支的工作原理

请求按顺序从链中的桶扣款：

1. 先花主桶。
2. 当主桶无法覆盖全部费用时，取用主桶的剩余额度，再向下一个透支桶借用差额。
3. 按配置的顺序继续向其余透支桶借用。
4. 只有整条链都无法覆盖费用时，请求才会被拒绝。

单个请求的费用可以拆分到多个桶。如果主桶剩余 $0.50 而请求花费 $2.00，Aperture 会从主桶扣 $0.50，再向下一个透支桶借 $1.50。链中最后一个桶可以为覆盖请求而变成负数；一旦如此，整条链会保持阻塞，直到补充额度使合计余额回到零以上。

透支只改变单条链内部的行为。请求通过不同配额条目匹配到的桶仍然并行扣减。

## 前提条件

开始之前，你需要：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限。
* 至少定义两个[配额桶][docs-aperture-quotas]：一个主桶，以及一个或多个用作溢出的桶。

## 第 1 步：定义配额桶

\[Missing snippet: aperture\_admin\_nav.mdx] 在 `quotas` 部分定义桶。溢出桶就是一个普通的配额定义，定义中没有任何内容把它标记为透支。下面的示例定义了一个按用户的每日桶和一个共享的工程池：

```json
"quotas": {
  "daily:<user>": {
    "capacity": "$10.00",
    "rate": "$5.00/day",
    "on_exceed": "reject"
  },
  "eng-team-pool": {
    "capacity": "$200.00",
    "rate": "$200.00/week",
    "on_exceed": "reject"
  }
}
```

## 第 2 步：在授权中添加透支

透支配置在授权的分配上，而不是桶的定义上。你可以在 Aperture 管理仪表盘中添加，也可以直接编辑配置文件。

### 使用 Aperture 管理仪表盘

\[Missing snippet: aperture\_admin\_nav.mdx] 打开要修改的授权，或新建一条授权。授权中每个配额桶都有一个 **Add overdraft bucket** 控件。从你已定义的配额列表中选择一个溢出桶，然后可以继续添加更多桶来延长链。拖动桶即可设置 Aperture 的扣款顺序（从先到后）。可视化编辑器只允许选择已存在的桶，并会防止链包含自己的主桶或重复的桶。

### 编辑配置文件

在授权的某个配额条目中添加 `overdrafts` 列表。该列表按顺序命名要回退到的桶：

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "role": "user" },
        {
          "models": "**",
          "quotas": [{"bucket": "daily:<user>"}]
        }
      ]
    }
  },
  {
    "src": ["group:eng"],
    "app": {
      "tailscale.com/cap/aperture": [
        {
          "models": "**",
          "quotas": [
            {"bucket": "daily:<user>", "overdrafts": ["eng-team-pool"]}
          ]
        }
      ]
    }
  }
]
```

在这份配置中，每个用户都从自己的 `daily:<user>` 桶扣款。`group:eng` 的成员在每日桶耗尽后，还会溢出到 `eng-team-pool`。同一个桶可以是一组用户的主配额，同时是另一组用户的透支桶，因为角色来自分配方式，而不是桶的定义。

你可以在同一条授权中组合并行配额与顺序透支：列出多个 `quotas` 条目即可并行扣减桶；给任一条目加上 `overdrafts` 列表，即可让该桶按顺序回退。

\[Missing snippet: aperture\_grant\_dst\_note.mdx]

## 第 3 步：分层授权以处理例外（可选）

透支让你可以在不改动基础策略的情况下给特定用户更高的限额。按从宽到窄的顺序叠加授权：

* 一条宽泛的授权为每个用户应用标准配额。
* 一条更窄的授权为需要更大容量的组添加透支。
* 一条更窄的授权为个人添加另一个透支。

Aperture 会把适用于某用户的多条授权合并为一份有效配置，因此该用户继承标准策略以及适用于他们的回退容量。

### 授权如何合并

在同一条授权内，Aperture 按你列出的顺序使用透支桶。

当多条授权为同一个主桶贡献透支时，Aperture 会合并这些列表。除非授权之间指定的顺序互相冲突，否则 Aperture 会保留每条授权内部定义的顺序。

Aperture 逐个桶地构建合并列表。只有在所有必须排在它前面的桶都加入后，它才会加入该桶。当有多个桶都可以排在下一位时，Aperture 会选择它在各条授权中最先遇到的那个，而不是按字母排序。

如果授权之间的顺序互相冲突，Aperture 会保存配置并发出警告。例如，一条授权把 `pool-a` 列在 `pool-b` 之前，而另一条把 `pool-b` 列在 `pool-a` 之前。如果冲突导致 Aperture 无法完成有序列表，它会保留已排好的桶，并按跨授权首次遇到的顺序追加剩余的桶。

如果这些桶必须按特定顺序运行，请在一条授权中一起列出并保持该顺序，同时在包含它们的其他授权中保持一致。要消除警告，请改正冲突的顺序，或者在其中一条授权中定义顺序，并从其他授权中删除冲突的顺序。

## 第 4 步：验证与故障排除

保存配置后，确认链的行为符合预期：

1. 使用授权包含透支的用户发送测试请求，直到主桶耗尽，然后确认后续请求仍然成功并从溢出桶扣款。
2. 通过聊天门户 `/quotas` 的[配额状态][docs-monitor-quotas]或 `GET /api/quotas` 查看桶余额。仅用作溢出目标的桶会与主桶分区显示。

当用户报告额度用尽时，检查实际适用于该用户的配额和透支。在 `/admin/dashboard`，管理员可以选择一个用户并查看其有效配置，也可以调用 `GET /api/quotas?login_name=<user>`。用它回答诸如以下的问题：

* 该用户是只收到了基础授权，还是也收到了添加回退桶的更窄授权？
* 哪些透支桶适用，顺序如何？
* 链中最后一个桶的余额是否足以覆盖该请求？

如果一个请求耗尽了整条链，Aperture 会以 HTTP 429 拒绝它，并返回类似 `Aperture quota exceeded: daily:<user>` 的响应体，其格式与提供商的原生错误格式一致（例如 Anthropic 的 `rate_limit_error`、OpenAI 的 `insufficient_quota`）。更多故障排除细节请参阅[Aperture 故障排除][docs-troubleshooting]。

## 后续步骤

* [设置按用户的支出限额][docs-set-per-user]，定义透支链所依赖的主桶。
* [检查并补充预算][docs-monitor-quotas]，监控桶余额并手动添加额度。
* 完整字段参考与更多示例请参阅[配额配置参考][docs-aperture-quotas]。

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-get-started]: /docs/aperture/get-started

[docs-monitor-quotas]: /docs/aperture/how-to/check-and-refill-budgets

[docs-set-per-user]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-troubleshooting]: /docs/aperture/troubleshooting
