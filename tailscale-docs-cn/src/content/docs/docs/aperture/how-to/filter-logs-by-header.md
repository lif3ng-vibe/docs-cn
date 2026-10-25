---
title: "按头部过滤日志"
description: "Aperture 把请求和响应头部以压缩数据的形式存入捕获记录，默认不为它们建立索引。为特定头部建立索引后，即可在受支持的管理"
---

最后验证于 Sep 28, 2026

\[Missing snippet: aperture\_terms.mdx]

Aperture 把请求和响应头部以压缩数据的形式存入捕获记录，默认不为它们建立索引。为特定头部建立索引后，你就可以在受支持的管理仪表盘页面上按头部的有无或取值过滤请求。

下面的步骤直接编辑配置 JSON。你也可以在[管理仪表盘][docs-aperture-dashboard-admin]中使用 `/admin/settings/reporting` 的 **Administration** > **Reporting** 页面。每个步骤都给出两种方法的操作说明。

## 前提条件

开始之前，你需要：

* 一个至少配置了一个提供商的 [Aperture 网关][docs-aperture-get-started]。
* 对 [Aperture 配置][docs-aperture-configuration]的管理员访问权限，可以通过 `/admin/settings/reporting`（**Reporting** 页面）或 `/admin/settings/config`（原始配置编辑器）。

配置使用 HUJSON 编写，它是允许注释和尾随逗号的 JSON。标准 JSON 是合法的 HUJSON。

## 头部过滤的工作原理

头部过滤由两部分组成：

* `filterable` 列表控制 Aperture 按名称和取值为哪些头部建立索引，初始为空。列表之外的头部只保留在捕获记录中。
* 受支持的[管理仪表盘][docs-aperture-dashboard-admin]页面上的过滤控件查询这些索引。

为一个头部建立索引本身并不让任何人都能过滤它。调用者（包括管理员）只有在授权通过 `filterable_headers` 能力把该头部分配给他们时，才能在受支持的 Aperture 管理仪表盘页面上把该索引用作过滤器。

已建立索引的头部值的保留时间会超过捕获保留期。捕获保留只限制 Aperture 能为新配置的头部回填多久之前的历史。添加头部后，它对新请求立即可过滤，Aperture 会从仍在捕获保留窗口内的捕获记录回填历史。捕获记录已被清除的请求无法回填。

头部值在存储前会做清洗，以避免持久保存密钥。Aperture 总会对匹配内置凭证模式的值做脱敏，且该模式集合无法扩展。要让某个头部的值完全不进入存储，把它标记为仅记录存在。参阅[将头部存为仅记录存在][ar-store-a-header-as-presence-only]。

以下步骤用 `x-request-id` 在日志中追踪请求。为该头部建立索引、授予其访问权限，然后在 **Logs** 中过滤出匹配的请求。

## 第 1 步：选择要建立索引的头部

先确定要按哪些头部过滤。合适的候选是低基数、稳定、能标识或分类请求的头部，例如 `user-agent`、路由或追踪标识符，或你的网关添加的头部。避免每个请求都唯一的头部（如 `date`），它们作为过滤器没什么用。

## 第 2 步：把头部添加到配置中

\[Missing snippet: aperture\_admin\_nav.mdx] 在顶层 `database` 对象内添加 `headers` 块，把每个头部作为对象列在 `filterable` 下：

```json
"database": {
  "headers": {
    "filterable": [
      { "name": "user-agent" },
      { "name": "x-request-id" },
    ],
  },
}
```

头部名称不区分大小写，并同时作用于请求和响应两个方向。保存后，Aperture 会为新请求索引所列头部，并回填近期历史。

你也可以不编辑 JSON 来管理该列表。在 `/admin/settings/reporting` 的 **Administration** > **Reporting** 页面，于 **Stored filterable headers** 下选择 **Add header**，输入头部名称，然后选择 **Save header filtering**。用行旁的垃圾桶图标可停止索引该头部。页面会显示已配置的头部数量，其 **Header backfill status** 面板显示 Aperture 已索引了多少已完结日期的历史。

## 第 3 步：授予过滤访问权限

在授权分配之前，任何人都无法按该头部过滤，管理员也不例外。在覆盖需要过滤日志的用户的那条授权中，添加 `filterable_headers` 能力并列出头部名称：

```json
"grants": [
  {
    "src": ["*"],
    "app": {
      "tailscale.com/cap/aperture": [
        { "filterable_headers": ["user-agent", "x-request-id"] },
      ],
    },
  },
]
```

使用 `["*"]` 可授予所有已建立索引的头部。对这些用户，被授予的头部会作为选项出现在受支持的 Aperture 管理仪表盘页面的 **Header** 过滤器中。完整授权结构请参阅[授权][docs-aperture-grants]。

你也可以不编辑 JSON 来创建和管理这些授权：

* 在 `/admin/settings/reporting` 的 **Administration** > **Reporting** 页面，于 **Header filter grants** 下选择 **Add assignment**。把 **Source** 设为需要过滤日志的用户、组或标签，例如 `alice@example.com`、`group:eng`、`tag:api` 或 `*`。在 **Filterable headers** 下列出头部名称，然后选择 **Save assignment**。下方的表格列出所有已存在的分配及其来源与头部，每行都有编辑或删除的控件。头部字段会提示你在第 2 步中配置的头部，并拒绝不在其中的名称，因此请先保存头部列表。
* 在 `/admin/settings/grants` 的 **Administration** > **Grants** 页面，已带有该能力的授权会显示可就地编辑的 **Filterable headers** 字段。要给尚无该能力的授权添加能力，请使用 **Reporting** 页面或配置编辑器。

## 第 4 步：将头部存为仅记录存在（可选）

默认情况下，Aperture 会在脱敏后存储每个已索引头部的值，因此你可以按子串或精确值匹配。如果只想为存在性检查建立索引、永不存储其值，请在该头部上设置 `redact_values`：

```json
"database": {
  "headers": {
    "filterable": [
      { "name": "user-agent" },
      { "name": "authorization", "redact_values": true },
    ],
  },
}
```

仅记录存在的头部只支持 **Present** 匹配；**Contains** 和 **Is exactly** 对它不可用。适用于取值敏感或基数过高、不宜持久存储的头部。

在 **Administration** > **Configuration** 页面设置 `redact_values`**。Reporting** 页面会遵循该字段，但不编辑它。

## 第 5 步：在 Logs 页面过滤

打开 `/admin/logs` 的 [**Logs**][docs-aperture-dashboard-admin]，选择 **Filter +** > **Header**。对每个头部过滤器设置：

* 方向：**Req** 匹配请求头部，**Resp** 匹配响应头部，**Any** 匹配任一。
* 头部名称：从你被授予的头部中选择。
* 匹配方式：**Present**（头部存在）、**Contains**（值包含某子串）或 **Is exactly**（值等于你输入的字符串）。**Contains** 和 **Is exactly** 不区分大小写，且对仅记录存在的头部不可用。

过滤胶囊（filter pill）会汇总你的选择，显示为 `Req x-request-id contains abc`、`Req x-request-id is exactly abc` 或 `Any x-request-id present`。

要让一个头部匹配多个值，请在过滤器内选择 **+ header** 添加 OR 条件。胶囊会用 `OR` 连接条件，例如 `Req x-request-id contains abc OR Req x-request-id contains def`。

要进一步收窄，添加更多 **Header** 过滤器。单个胶囊内的条件用 `OR` 组合；多个独立的 **Header** 过滤器以及其他生效的过滤器（如用户或日期）之间用 `AND` 组合。请求必须匹配每一个胶囊才会显示。

如果没有可用的头部，**Header** 过滤器会直接说明而不列出选项，并链接到 **Reporting** 页面。

## 参考

完整字段说明请参阅 [`database.headers`][docs-aperture-configuration-headers] 配置参考。

[ar-store-a-header-as-presence-only]: #第-4-步将头部存为仅记录存在可选

[docs-aperture-configuration-headers]: /docs/aperture/configuration#databaseheaders-字段

[docs-aperture-configuration]: /docs/aperture/configuration

[docs-aperture-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-grants]: /docs/aperture/configuration#grants
