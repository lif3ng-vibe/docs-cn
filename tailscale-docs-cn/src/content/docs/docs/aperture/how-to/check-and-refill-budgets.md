---
title: "检查并补充预算"
description: "配置[按用户的支出限额][docs-aperture-set-per-user-spending-limits]或[团队预算][docs-aperture-set-team-budget]后，你可以查看预算的消耗情况并手动"
---

最后验证于 Sep 28, 2026

配置[按用户的支出限额][docs-aperture-set-per-user-spending-limits]或[团队预算][docs-aperture-set-team-budget]后，你可以查看预算的消耗情况，并手动补充已耗尽的配额桶。

## 前提条件

开始之前，请确保你具备以下条件：

* 一个已配置配额的 [Aperture 网关][docs-aperture-get-started]。详情参阅[配额配置参考][docs-aperture-quotas]。
* 能通过网络访问 Aperture 网关 URL（默认为 `http://ai`）。
* 查看组织范围的配额数据或补充配额桶需要[管理员访问权限][docs-aperture-set-up-admin-access]。用户可以在聊天门户中查看自己的配额状态。

## 在 Web 界面查看配额状态

用户可以在 [Aperture 聊天门户][docs-aperture-chat]中打开 `/quotas`，查看个人配额桶、余额、补充状态以及受影响的模型。

管理员可以在 `/admin/quotas` 查看组织范围的配额覆盖情况。要查看或调整特定用户的配额桶，请打开 `/admin/dashboard` 并选择该用户。

## 在管理仪表盘中补充配额桶

1. 打开 `/admin/quotas`。
2. 选择要修改配额的用户。
3. 找到对应的配额桶，选择 **Adjust balance**。
4. 选择 **Add funds**，输入要添加的金额，然后选择 **Add**。

如果想直接替换当前余额，请选择 **Set balance**，输入新余额，然后选择 **Set**。

## 使用 API 查看配额状态

管理员可以查询 `GET /api/quotas` 端点，获取所有配额桶的当前状态：

```shell
curl http://ai/api/quotas
```

响应包含每个桶的名称、当前余额、容量和补充速率。

## 补充配额桶

管理员可以使用 `POST /api/quotas/refill` 端点手动为已耗尽的桶添加额度：

```shell
curl -X POST http://ai/api/quotas/refill \
  -H "Content-Type: application/json" \
  -d '{"bucket": "daily:alice@example.com", "amount": "$5.00"}'
```

把 `bucket` 的值替换为要补充的桶的名称。`amount` 的值会加到当前余额上，上限为该桶配置的 `capacity`。Aperture 不允许余额超过 `capacity`。

> **注意：**
>
> 只有拥有[管理员访问权限][docs-aperture-set-up-admin-access]的用户才能补充配额桶。

## 后续步骤

* 如果还没有配置个人预算，先[设置按用户的支出限额][docs-aperture-set-per-user-spending-limits]。
* [设置团队预算][docs-aperture-set-team-budget]，限制整个组织的总支出。
* [将使用数据导出到 S3][docs-aperture-export-s3]，用于长期的成本分析与报告。

[docs-aperture-chat]: /docs/aperture/reference/chat

[docs-aperture-export-s3]: /docs/aperture/how-to/export-usage-data-to-s3

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-quotas]: /docs/aperture/configuration#quotas

[docs-aperture-set-per-user-spending-limits]: /docs/aperture/how-to/set-per-user-spending-limits

[docs-aperture-set-team-budget]: /docs/aperture/how-to/set-team-budget

[docs-aperture-set-up-admin-access]: /docs/aperture/how-to/set-up-admin-access
