---
title: "Jira 事项抽屉"
description: "像关联 Linear 或 GitHub 条目一样，浏览、编辑 Jira Cloud 或自托管 Server/Data Center 事项并关联到 worktree。"
source: "https://www.onorca.dev/docs/review/jira"
---

# Jira 事项抽屉

像关联 Linear 或 GitHub 条目一样，浏览、编辑 Jira Cloud 或自托管 Server/Data Center 事项并关联到 worktree。

Jira 与 GitHub、Linear 并排出现在任务抽屉中。浏览 Jira 事项、更新它们，并从任意事项创建 worktree，全程不必离开 Orca。

## 接入 Jira 站点

1. 打开侧边栏 **Tasks**（任务）条目，从来源选择器选择 **Jira**——即使尚未保存任何凭据，Jira 默认就排在 GitHub 和 Linear 旁边。
2. 点击 **Connect Jira**。**Connect Jira site**（接入 Jira 站点）对话框出现。
3. 选择 **Cloud** 或 **Self-hosted (Server / Data Center)**（自托管 Server / Data Center）。

**Cloud**

- **Jira Cloud site URL**（Jira Cloud 站点 URL）——例如 `https://example.atlassian.net`。
- **Atlassian email**（Atlassian 邮箱）——你的 Atlassian 账号上的地址。
- **Atlassian API token**（Atlassian API 令牌）——在 [id.atlassian.com → Security → API tokens](https://id.atlassian.com/manage-profile/security/api-tokens) 创建。

**Self-hosted**（自托管）

- **Jira base URL**（Jira 基础 URL）——你的 Server/DC 站点根地址（Jira 不在 `/` 下时含路径）。
- 认证方式：

- **Personal access token**（个人访问令牌）——Bearer PAT（现代 Server/DC 首选）。
- **Username and password**（用户名和密码）——供没有 PAT 的旧实例使用的 Basic 认证。

1. 点击 **Connect**。Orca 验证凭据并加载你的站点。

可以接入多个 Atlassian 站点。接入一个站点后，Tasks 标题栏会出现站点选择器；选择 **All sites**（所有站点）可合并各站点的事项。

如果你完全不用 Jira，可在 [Settings → Tasks](/settings) 中把它从来源选择器隐藏。

## 使用 Jira

- 各来源启用后，任务抽屉会在统一列表中显示 GitHub、Linear 和 Jira 事项。
- 打开事项，在侧边抽屉查看完整描述、评论和元数据。可就地编辑状态（通过可用的流转）、优先级、经办人和自定义字段。
- 从抽屉的评论编写器添加评论。
- **New Jira issue**（新建 Jira 事项）在你误关对话框时保留标题和描述——Escape、Cancel、点击外部或关闭。同一应用会话内重开对话框时文本会恢复；草稿在成功创建后清空，应用重启后不保留。事项类型等其他选择器仍沿用打开时的默认值。
- 从 Jira 事项创建 worktree 会预填任务名并把 worktree 关联到该事项，评审与事项始终绑定在一起。
- 在 **Create workspace**（创建工作区）对话框中，也可以把 Jira 事项 URL（`https://…/browse/ABC-123`）粘贴到名称字段，或把字段切换为 **Jira** 搜索并按文本选取事项。Orca 会填入工作区名、关联事项，并在 worktree 卡片上显示键值 + 摘要与 **View on Jira**（在 Jira 查看）。粘贴支持多站点：连接的多个站点匹配该 URL 来源时，Orca 会询问用哪一个；都不匹配时，会提示该站点未连接。
- Orca 按仓库记住你上次使用的任务来源，因此以 Jira 为主的仓库下次打开时默认是 Jira。

> **凭据存放位置**：你的 Atlassian API 令牌或自托管凭据通过操作系统钥匙串加密并存储在本地——仅用于调用你配置的 Jira 站点。不再使用 Orca 时，可从 Atlassian 账号设置撤销令牌。

## 后续步骤

- [Linear 事项抽屉](/review/linear)——对 Linear 使用同一套流程。
- [托管评审、议题与 Actions](/review/github)——Jira 事项进行中后，把 worktree 交给托管评审。
- [在 Orca 中提交与推送](/review/commit-push)——不离开 Orca 发布分支。
