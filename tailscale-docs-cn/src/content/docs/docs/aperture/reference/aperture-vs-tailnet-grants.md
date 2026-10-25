---
title: "Aperture 授权与 tailnet 策略文件授权对比"
description: "你可以在两个位置定义 Aperture 授权（grant）：Aperture 网关的[配置][docs-aperture-configuration]，或该网关所属 tailnet 的 [tailnet 策略文"
---

最后验证于 Jun 8, 2026

你可以在两个位置定义 Aperture 授权（grant）：Aperture 网关的[配置][docs-aperture-configuration]，或该网关所属 tailnet 的 [tailnet 策略文件][docs-tailnet-policy-file]。两个位置使用相同的 `tailscale.com/cap/aperture` 能力，但**按原样书写时不可互换**。关键差异在于：Aperture 配置授权省略 `dst` 字段，因为目的地隐含为 Aperture 网关本身；而 tailnet 策略文件授权要求显式写出 `dst`。

选择使用哪个位置，取决于你打算如何在整个 tailnet 范围内管理 Aperture 授权。例如，如果你只有一个 Aperture 网关，并且希望把它的授权与 tailnet 其余访问控制分开管理，那么在 Aperture 配置中定义授权可能更简单。反过来，如果你有多个使用共享选择器（如标签或分组）的 Aperture 网关，或者你用 GitOps 管理 tailnet 策略文件，那么在策略文件中定义授权更高效。

| Aperture 配置                                     | Tailnet 策略文件                                                                                                                                     |
| :----------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| 当你只有一个 Aperture 网关时                     | 当你有多个需要统一管理的 Aperture 网关时                                                                                                             |
| 当你单独管理每个 Aperture 网关时                 | 当你使用 [GitOps][docs-gitops] 或其他基础设施即代码工具，把 Aperture 授权与 tailnet 其余访问控制一起管理时                                            |

> **注意：**
>
> 每个授权只在一个位置定义。在两处定义同一个授权不会增加访问权限，只会让实际生效的策略更难梳理。

## 语法对比

下表展示同一个授权在两个位置各自的写法。

| 字段                                 | Aperture 配置                            | Tailnet 策略文件                                       |
| :----------------------------------- | :--------------------------------------- | :----------------------------------------------------- |
| `src`                                | 必填                                     | 必填                                                   |
| `dst`                                | 省略（隐含为 Aperture 设备）             | 必填（必须指向 Aperture 设备）                         |
| `ip`                                 | 不使用                                   | 可选；当授权同时开放网络访问时添加                     |
| `app` → `tailscale.com/cap/aperture` | 必填                                     | 必填                                                   |

`src` 和 `app` 字段在两种形式中完全相同。转换只需添加 `dst`（以及必要时 `ip`）。

## 示例

以下示例对比了 Aperture 配置和 tailnet 策略文件中的授权。该授权让 `ai-users` 分组中的用户可以通过 Aperture 访问 Anthropic 模型。`ai-users` 分组的定义位于 tailnet 策略文件的其他位置，此处未展示。

> **注意：**
>
> 这里的示例使用标签（tag）来标识 Aperture 设备，但你也可以使用 Aperture 网关的主机名或 IP 地址。使用主机名时，请确认它能在策略文件的 `hosts` 部分解析到正确的设备。使用 IP 地址时，请注意一旦 Aperture 设备的 IP 发生变化，授权就会失效，直到你更新该 IP。标签方式可以把此授权应用到多个 Aperture 网关（由标签标识），并且对 IP 变化更有韧性，因此一般推荐使用。

**转换前**：授权在 Aperture 配置中的写法。目的地是隐含的：

```json
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

**转换后**：同一个授权在 tailnet 策略文件中的写法。添加了 `dst` 字段，使授权指向 Aperture 设备：

```json {5}
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["tag:aperture"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

要在同一规则中授予网络连通性，请添加 `ip` 字段：

```json {6}
{
  "grants": [
    {
      "src": ["group:ai-users"],
      "dst": ["tag:aperture"],
      "ip": ["tcp:443"],
      "app": {
        "tailscale.com/cap/aperture": [
          { "role": "user" },
          { "models": "anthropic/**" }
        ]
      }
    }
  ]
}
```

## 将 Aperture 授权转换为 tailnet 策略文件授权

把授权从 Aperture 配置转换到 tailnet 策略文件，请按以下步骤操作：

1. 确定 Aperture 设备：

   选择 `dst` 引用 Aperture 设备的方式。例如，可以使用应用于设备的[标签（tag）][docs-tags]（如 `tag:aperture`），或使用策略文件 `hosts` 部分中定义的主机别名。标签是推荐做法，因为它们不受 IP 变化影响，并能自动应用到替换设备。

2. 原样复制 `src` 和 `app` 字段：

   来源匹配和 `tailscale.com/cap/aperture` 能力数组原封不动地照搬。不要修改 `role` 或 `models` 条目。

3. 添加 `dst` 字段：

   插入一个指向 Aperture 设备的 `dst` 字段。取值应指向该授权要应用到的 Aperture 网关。如果只有一个网关，可以直接指向它（例如 `dst: ["tag:aperture"]` 或 `dst: ["host:aperture-device"]`）。如果有多个应共享此授权的网关，请使用共同标签（例如 `dst: ["tag:aperture"]`，其中所有相关设备都带有 `aperture` 标签）。

4. 如果授权同时授予网络访问，请添加 `ip`：

   如果你要把网络访问和模型访问合并到一个授权中，请添加一个包含 Aperture 监听端口的 `ip` 字段（例如 `["tcp:443"]`）。如果已有单独的授权允许访问 Aperture 设备的网络，那么模型访问授权只需要 `dst`。

5. 保存并验证：

   保存策略文件，然后从授权覆盖的设备发送一个测试请求。响应成功说明能力已到达 Aperture。如果请求返回 HTTP 403，说明授权未生效。请参阅下文[故障排除][ar-troubleshooting]。

> **警告：**
>
> 把 Aperture 配置授权不加 `dst` 字段直接复制到 tailnet 策略文件中，会**让授权悄无声息地完全失效**。策略文件接受该授权，但它匹配不到任何目的地，因此 Aperture 永远收不到该能力。Tailscale 目前不会为这种情况显示任何警告或错误。
>
> 同样，把 tailnet 策略文件授权不删除 `dst` 字段就复制进 Aperture 配置，会触发校验错误，因为 `dst` 不是 Aperture 配置中的有效字段。

## 故障排除

如果 tailnet 策略文件中的授权没有生效，而策略文件又没有报错，最可能的原因是缺少 `dst` 字段。从 Aperture 配置复制过来的授权省略了 `dst`，因此在策略文件中它匹配不到任何目的地，`tailscale.com/cap/aperture` 能力永远到不了 Aperture。结果是 Aperture 返回 HTTP 403，或完全没有模型访问权限，而策略文件不会给出任何警告。

要解决此问题，请确认授权包含指向 Aperture 设备的 `dst` 字段（例如 `"dst": ["tag:aperture"]`）。使用 [Preview rules](https://console.tailscale.com/admin/acls/preview) 标签页确认规则解析到 Aperture 设备。

为 Aperture 配置编写的授权放到策略文件中是不完整的。反过来也一样：带 `dst` 和 `ip` 字段的策略文件授权不属于 Aperture 配置，因为那些字段在那里不被使用。请确认你使用的形式与所在位置匹配。

## 相关内容

* [控制模型访问][docs-grant-model-access]：在 Aperture 配置中配置授权。
* [Aperture 配置参考][docs-aperture-configuration]：完整的授权模式。
* [tailnet 策略文件语法][docs-tailnet-policy-file]：策略文件中的授权结构。
* [Aperture 故障排除][docs-troubleshooting]：诊断访问错误。

[ar-troubleshooting]: #故障排除

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-gitops]: /docs/gitops

[docs-grant-model-access]: /docs/aperture/how-to/grant-model-access

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/reference/syntax/policy-file

[docs-troubleshooting]: /docs/aperture/troubleshooting
