---
title: "设备态势管理"
description: "使用设备态势在 tailnet 中强制执行设备规则。"
---

最后验证于 Oct 6, 2026

设备态势管理（device posture management）是一项用于管理访问你网络的设备的安全要求的功能。你可以创建规则，让设备基于一组自定义的安全标准（称为态势，posture）获得条件访问。你可以在态势中配置与特定设备属性相关的规则，例如设备的操作系统或其运行的 Tailscale 版本。

你可以用设备态势管理创建基本规则，例如拒绝所有不满足态势要求的设备的一切访问；也可以用更细的粒度控制访问。例如，你可以要求设备满足更严格的安全要求才能连接生产环境。或者，你可以禁止不满足态势要求的设备访问公司网络的大部分内容，但仍允许它们访问 IT 服务台。

用于创建规则的设备属性可以包括预先填充的主机信息（如操作系统版本）、你通过 postures API 设置的自定义属性，或者从[已集成的端点检测与响应（EDR）和移动设备管理（MDM）工具][docs-device-posture-integrations]同步的属性。

> **注意：**
>
> 属性的可用性[因 Tailscale 套餐而异][ar-usage-by-plan]。

## 优势

* **增强安全性**：在授予 tailnet 访问权限之前先核实设备的安全状态和配置，降低受损或不合规设备带来的风险。
* **情境感知的访问控制**：根据设备状态限制对关键应用和 tailnet 资源的访问。你可以为高合规设备提供提升的访问权限，或完全阻止不合规设备的访问。
* **持续验证**：持续评估设备的健康状况和合规性，并启用自适应访问控制。

## 使用场景

* **安全审计**：实时评估设备的配置与合规情况。
* **远程办公安全**：确保员工设备在访问公司资源之前符合安全标准。
* **自带设备（BYOD）**：结合设备状态，为非托管和受管设备提供对应用和 tailnet 资源的分级访问，安全地支持 BYOD。
* **迈向零信任**：借助微分段、最小权限访问、持续验证和自适应策略，帮助你的组织实现零信任。

## 按套餐区分的可用性

你的 Tailscale 定价套餐决定了在设备态势配置中可以使用哪些设备属性。关于不同类型设备属性的更多信息，请参阅[设备属性][docs-device-posture-attributes]。

| **属性类型**                                     | **套餐**                      |
| ------------------------------------------------ | ----------------------------- |
| 默认属性                                          | 所有套餐                       |
| 第三方集成属性（MDM 和 EDR）                       | Standard、Premium、Enterprise |
| 地理位置                                          | Standard、Premium、Enterprise |
| 自定义属性                                        | Premium、Enterprise           |

更多信息请参阅我们的 [Pricing][co-pricing]（定价）页面。

## 进一步了解设备态势管理

[**了解设备态势与属性**](/docs/features/device-posture/postures-and-attributes) — 理解设备态势与属性及其使用方法。

[**访问规则中的态势**](/docs/features/device-posture/postures-in-access-rules) — 理解态势如何与访问规则配合工作

[**设备态势的监控与告警**](/docs/features/device-posture/monitoring-postures) — 检查设备态势的状态，并在态势检查失败时发送通知。

[**设备态势管理的集成**](/docs/features/device-posture/integrations) — 查看设备态势管理可用的集成。

[**通过 API 获取设备态势属性**](https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes) — 查看用于设备态势属性的 API 命令

[ar-usage-by-plan]: #按套餐区分的可用性

[co-api-get-device-posture-attrs]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[co-pricing]: https://tailscale.com/pricing

[docs-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes#device-posture-attributes

[docs-device-posture-integrations]: /docs/features/device-posture/integrations
