---
title: ROI 计算器
draft: true
description: 对比 GitHub 与 GitLab 仓库中每位工程师的交付速度、issue 走势与记录到的 AI 花费
---

# ROI 计算器

对比团队在 GitHub 与 GitLab 仓库中的已合并变更、合并耗时、bug 报告与记录到的 AI 花费。

ROI 计算器把仓库活动与 LiteLLM 网关记录的花费结合在一起。将仓库账号关联到内部用户，即可查看每位工程师的交付速度以及每次合并变更的花费。在管理界面（Admin UI）中打开 **Observability > ROI Calculator**。

## 连接仓库

需要一个已连接数据库的网关。**Proxy Admin** 用户可以配置连接、关联账号并执行同步；**Proxy Admin Viewer** 用户只能查看报告。

打开 **Connections**，然后通过应用或访问令牌连接 **GitHub** 或 **GitLab**，选择仓库并点击 **Save and sync**。你可以选择多个仓库，包括嵌套的 GitLab 项目。**Add connection** 可以让 GitHub 与 GitLab 同时保持连接，包括自托管实例。每个连接各自维护自己的凭据、仓库和账号匹配关系。

GitHub 令牌需要对仓库元数据、Pull Request 和 issue 的读取权限；GitLab 令牌需要 `read_api` 以及对相应项目的访问权限。公开仓库可以留空令牌，但受提供商匿名 API 限额的约束。没有 GitHub 令牌时，也可以按名称添加公开仓库。

对于 GitHub Enterprise 或自管 GitLab，展开 **Self-hosted instance** 并填入其 HTTPS API URL，例如 `https://github.example.com/api/v3` 或 `https://gitlab.example.com/api/v4`。不同主机视为不同连接，因此令牌和用户名不会跨主机复用。

首次同步会读取当前周期、上一个周期以及去年同一周期。可以选择 **Last 7 days**、**Last 28 days** 或 **Last 90 days**。每个时间窗口覆盖所选数量的完整 UTC 天，且不包含今天。**Previous period** 指紧邻的等长上一窗口；**Same period last year** 长度相同，截止于去年对应的日期（2 月 29 日按 2 月 28 日处理）。仪表板会同时显示这两个日期范围。更改时间范围会触发一次同步，后续刷新会沿用最近一次成功加载的范围。**Sync now** 会刷新所有已选仓库。自动同步默认每天执行一次，且只在网关运行期间进行。设置 API 接受 `update_interval_minutes: 0` 表示手动刷新，或设为不小于 `5` 的值表示自动刷新。

刷新间隔作用于整个工作区，包括每个已连接的提供商和所有已选仓库。新增或编辑连接时，间隔保持不变，除非你显式修改。

空仓库也是一份有效的报告，只是已合并变更数为零。在没有匹配的观测数据之前，合并耗时与每次合并变更的花费暂无数值。失败或已取消的同步会保留上一份完整报告。

## 配置应用连接

网关运营者只需为每个提供商应用配置一次，之后用户即可直接在仪表板上完成连接，无需粘贴访问令牌。

把 `PROXY_BASE_URL` 设置为网关的公开 URL。注册一个 GitHub App，授予只读的 **Metadata**、**Pull requests** 和 **Issues** 权限，并启用会过期的用户访问令牌。将回调 URL 设为：

```text
<PROXY_BASE_URL>/roi-calculator/observed/oauth/github/callback
```

将 Setup URL 设为 `<PROXY_BASE_URL>/roi-calculator/observed/oauth/github/installed`，启用 **Redirect on update**，并保持安装期间的授权为关闭状态。在应用设置中生成私钥，GitHub 才允许安装该应用，请妥善保管私钥。网关在授权时使用应用的 client ID 和生成的 client secret，不需要这把私钥。配置以下变量：

```bash
LITELLM_ROI_GITHUB_CLIENT_ID=<app-client-id>
LITELLM_ROI_GITHUB_CLIENT_SECRET=<app-client-secret>
LITELLM_ROI_GITHUB_APP_SLUG=<app-url-slug>
```

对于 GitLab，注册一个机密（confidential）OAuth 应用，授予 `read_api` 和 `read_user` 权限范围，并将回调 URL 设为：

```text
<PROXY_BASE_URL>/roi-calculator/observed/oauth/gitlab/callback
```

配置 `LITELLM_ROI_GITLAB_CLIENT_ID` 和 `LITELLM_ROI_GITLAB_CLIENT_SECRET`。自托管应用还需设置 `LITELLM_ROI_GITHUB_URL` 或 `LITELLM_ROI_GITLAB_URL`，取值为提供商的基 URL（不带 API 后缀）。应用凭据和 `PROXY_BASE_URL` 必须在所有网关 worker 之间保持一致。

访问令牌和刷新令牌会使用网关配置的加密密钥加密存储。授权流程使用 PKCE，以及绑定在 HTTP-only 浏览器 Cookie 上的一次性 state。网关会自动刷新即将过期的凭据。

## 查看报告

| 指标 | 计算方式 |
| --- | --- |
| 已合并变更 | 周期内所有已选仓库中合并的 PR 或 MR |
| 交付速度 | 某人匹配到的已合并变更，包含每周变更数，以及与上一周期或去年同期的对比 |
| 合并耗时中位数 | 从发起到合并的中位耗时，包括夜间和周末 |
| 新增 bug | 周期内新开的、带 `bug`、`kind:bug` 或 `type::bug` 标签的 issue（前提是采集了这些标签） |
| 新增回归 | 周期内新开的、带 `regression`、`kind:regression` 或 `type::regression` 标签的 issue（前提是采集了这些标签） |
| revert 标题变更 | 标题以 `revert` 开头的已合并 PR 或 MR |
| 每次合并变更的记录花费 | 已匹配人员在周期内的网关记录花费，除以其匹配到的已合并变更 |

使用 **Engineers** 查看按人拆分的结果，用 **Pull requests**、**Merge requests** 或 **Merged changes** 查看底层变更，用 **Quality** 查看 issue 与 revert 信号，用 **Branch spend** 查看带标记的请求成本。点开某位工程师，可以对比其不同周期并检查其已合并变更。

合并耗时是自然流逝时间，不是实际工作时长。30 秒完成的合并会显示为 `<1m`。bug 标签和 revert 标题属于仓库层面的信号，并非实测失败率，也不是针对个人的缺陷评分。这些对比反映的是记录到的活动变化，并不能证明这些变化由 AI 带来。

bug 和回归计数会汇总所有启用了 issue 追踪的仓库。如果没有任何已选仓库启用 issue 追踪，这些数据将不可用。

### 关联账号

打开 **Link accounts**，选择一个内部网关邮箱，再填入该用户的当前和历史用户名，多个用户名以逗号分隔。GitHub 和 GitLab 对每个已连接主机各有独立字段。同一邮箱可以同时持有两个提供商上的多个账号；不同主机上的相同用户名仍是相互独立的身份。

公开资料邮箱与网关用户明确匹配时会自动关联。手动匹配的优先级更高，移除一个匹配后，同一公开邮箱不会被立即重新关联。保存后会更新报告，但不会重新抓取仓库活动。

Agent 生成的变更只有在受支持的 Agent 元数据明确指明请求者时，才会计入对应人员。未指派请求者的 Agent 变更仍会计入仓库总量。

### 理解花费

每个人的网关花费在所有已选仓库和提供商范围内只计一次。选择仓库会改变已合并变更的分母，但不会把该用户的网关用量过滤到这些仓库。汇总数据用已关联人员的记录花费除以其匹配到的已合并变更。

举例来说，某人记录到的网关花费为 `$120`、匹配到 6 次已合并变更，那么每次合并变更的记录花费就是 `$20`。这是账号层面的比值，与某个 PR 被直接标记的成本并不是一回事。

绕过网关的用量不在计算范围内。没有花费记录意味着成本未知，而记录到零成本的请求是真实的零。没有已合并变更时，每次变更花费这一比值就没有分母。

## 将实际请求成本归因到分支

要追踪某个分支的 AI 成本，需要在每次模型请求中同时发送仓库标签和分支标签：

```json
{
  "model": "your-gateway-model",
  "messages": [{"role": "user", "content": "Help implement this change"}],
  "metadata": {
    "tags": [
      "repo:gitlab.com/example/platform/api",
      "branch:feature/search"
    ]
  }
}
```

GitHub 使用形如 `repo:github.com/example/api` 的仓库标签。自托管实例需要包含主机名和仓库路径（不带 API 后缀）。请使用 PR 或 MR 的 **source** 仓库与分支，若涉及 fork 则使用 fork 的仓库。GitHub 仓库名不区分大小写；GitLab 项目路径和分支名必须完全一致。

同样的标签也可以通过逗号分隔的请求头发送：

```text
x-litellm-tags: repo:github.com/example/api,branch:feature/search
```

配置你使用的编码工具或封装脚本，让每个请求都携带这两个标签。客户端示例见 [请求标签](./request_tags.md)。标签存储在花费日志的 `request_tags` 字段中；单纯的分支元数据或 Git release 标签都不能替代这一对标签。

同步完成后，**Branch spend** 会显示每个带标签分支的记录花费与请求数。当周期内恰好只有一个已合并变更使用该源仓库和分支时，已合并变更列表会显示 **Tagged spend**。分支成本涵盖跨用户、跨密钥的所有请求，且不要求邮箱匹配。

完全相同的重复标签只计一次请求。仓库或分支标签缺失或冲突时，该请求不参与归因。当周期内多个已合并变更共用一个分支时，其成本仍会显示在 **Branch spend** 中，不会被重复计入多个 PR。要获得无歧义的匹配，请为每个变更使用独立的分支。

分支成本只覆盖同一 UTC 报告窗口内保留的请求日志，不一定覆盖 PR 的完整生命周期。窗口开始之前产生的成本不在这份报告之内。

## 故障排查

| 看到的现象 | 排查方向 |
| --- | --- |
| 没有应用连接按钮 | 在网关上配置提供商应用，或改用令牌 |
| 仓库无法加载 | 检查令牌权限、有效期、组织审批以及 API URL |
| 没有任何活动 | 检查已选仓库和报告日期；今天不计入统计 |
| 缺少某位工程师 | 把该用户的用户名关联到一个已有的内部网关邮箱 |
| 没有带标签的分支花费 | 每个请求都发送完全一致的成对标签，保留花费日志，并在报告日结束后执行同步 |
| 分支成本被多个变更分摊 | 为每个变更使用不同的源分支 |
| 同步失败 | 修复提供商访问或速率限制后重试；上一份完整报告仍然可用 |

网关记账详见 [花费追踪](./cost_tracking.md)，仪表板配置详见 [管理界面](./ui.md)。
