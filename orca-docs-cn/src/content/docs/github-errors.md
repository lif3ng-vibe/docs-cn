---
title: "GitHub 错误"
description: "诊断 Orca PR 检查、Tasks 与源代码管理中的限流、认证失败及其他 GitHub CLI 错误。"
source: "https://www.onorca.dev/docs/github-errors"
---

Orca 通过你机器上（或远程 Orca 主机上）的 **GitHub CLI（`gh`）** 与 GitHub 通信。当 PR 状态、检查、议题或 Tasks 刷新失败时，原因几乎总是 GitHub 认证、权限或 API 限流——而不是 PR 面板本身坏了。

本页介绍你最常遇到的错误及修复方法。

## 快速分诊

| 你看到的现象 | 可能原因 | 首先尝试 |
| --- | --- | --- |
| “GitHub is rate-limiting requests” / “rate limit exceeded (core)” | 你的账号的 GitHub REST（core）配额耗尽 | 等待重置；暂停多余的 `gh` / 智能体 / Orca 调用；查看 [Settings → Git → GitHub API Budget](/settings) |
| “GitHub authentication is unavailable” / `gh auth` 提示登录 | `gh` 未登录、令牌过期或 `GITHUB_TOKEN` 无效 | `gh auth status`，然后 `gh auth login` |
| “GitHub did not allow access” / HTTP 403（非限流） | 缺少 scope 或无权访问该仓库 | |

## 限流（最常见）

GitHub 给每个**已认证用户**一份按小时共享的预算。**该账号下的所有工具共用它**：Orca、终端里的 `gh`、调用 `gh` 的 Claude/Codex/Grok 智能体、CI 脚本、浏览器扩展和其他应用。

### Orca 关注的配额桶

| 配额桶 | 覆盖范围 | 典型限额（已认证） |
| --- | --- | --- |
| **REST (core)** | 大多数 PR/议题/API 调用（`gh pr view`、检查元数据、许多 REST 端点） | 每小时 5,000 |
| **GraphQL** | Project/Tasks 与一些更丰富的 PR 查询 | 每小时 5,000 点 |
| **Search** | 由搜索驱动的列表 | 每分钟 30 |

当主配额桶耗尽时，GitHub 返回 HTTP **403** 及 `API rate limit exceeded` 之类的消息。Orca 把它归类为限流，尽可能保留最后已知的 PR 状态，并在短时间内**停止再派生 `gh` 调用**，避免单个限额演变成一片失败风暴。

### 为什么 Settings 看起来"正常"而 PR 面板被限流

**Settings → Git → GitHub API Budget** 读取 GitHub 专门的 `rate_limit` 端点。该探测**不计入**限流统计，有时同一用户的真实 REST 调用已经返回 `remaining: 0`，它仍显示有剩余配额。

两者矛盾时，按这个优先级判断：

1. **PR / Checks 面板上的错误**（实时请求失败）
2. 真实的 CLI 检查（见下文）
3. Settings 里的预算数字（有用，但仅是探测值）

也不要把 **GitHub API Budget** 与账号页里的 **Claude / Codex / Grok 用量**混为一谈——后者是 AI 提供商限额，不是 GitHub 的 REST 配额。

### 在终端确认限流

```
# 探测（不消耗配额；可能比实际情况显得更健康）
gh api rate_limit --jq '.resources | {core, graphql, search}'

# 真实 REST 调用——PR 刷新依赖的就是它
gh api user -i 2>&1 | head -40
```

如果 `gh api user` 返回 **403**、`API rate limit exceeded` 与 `X-Ratelimit-Remaining: 0`，该账号的 REST 会被封到 `X-Ratelimit-Reset`（Unix 纪元秒）为止。

### 通常什么会耗尽配额

- 同时打开多个 Orca 窗口或 electron-dev 构建（每个都可能刷新 PR / Tasks）
- 自动化 `gh` 的智能体（指派 PR/议题、轮询检查、批量 GraphQL）
- 重度 Tasks / 多仓库扇出，同时还在刷新 PR 面板
- 其他使用同一 GitHub 用户令牌的应用

### 应对措施

1. **等待**错误信息或 `X-Ratelimit-Reset` 里显示的小时级重置。
2. **减少并发的 GitHub 客户端**——退出多余的 Orca 实例，暂停批量 `gh` 自动化。
3. 限流期间不要猛刷 PR 面板；Orca 已在退避。
4. 脚本里优先批量 GraphQL；不要在个人账号上对大批 PR 逐条循环 REST。
5. 重置后如果 PR 刷新仍失败，再查认证（下一节）。

## 认证问题

Orca 继承该主机上 `gh` 使用的登录方式。

### 检查状态

```
gh auth status -h github.com
gh api user --jq '{login, id}'
```

健康输出：已登录、令牌有效、`gh api user` 返回你的登录名。

### 常见的坑

**shell 配置里的 `GITHUB_TOKEN` / `GH_TOKEN`**

如果导出了这些变量（例如在 `~/.bash_profile` 或 `~/.zshrc` 里的 `export GITHUB_TOKEN=$(gh auth token)`），`gh` 会优先用它们而不是钥匙串。过期或错误的环境变量令牌会导致莫名其妙的认证或限流表现。先取消再重新登录：

```
unset GITHUB_TOKEN GH_TOKEN
gh auth logout -h github.com
gh auth login -h github.com
```

**过期或已撤销的令牌**

`gh auth status` 可能显示令牌无效。运行 `gh auth login`（或 `gh auth refresh`）并重启 Orca，让它拿到新凭据。

**组织 SAML SSO**

私有组织仓库可能需要为令牌做 SSO 授权。在 GitHub 令牌设置里打开该组织的 SSO 授权链接，然后重试。

**远程 / SSH worktree**

GitHub 认证**按主机隔离**。在笔记本上登录不会让远程机器上的 `gh` 登录。SSH 到主机在那里运行 `gh auth login`，或在 Orca 的远程服务器 GitHub 预算视图里查看该环境。

## 权限与仓库错误

| 症状 | 含义 |
| --- | --- |
| 不含 "rate limit" 的 HTTP 403 | 令牌缺少 scope，或你无权查看该资源 |
| HTTP 404 / "could not resolve to a Repository" | 仓库不存在、已改名，或对该令牌不可见 |
| "resource not accessible by integration" | 该应用/令牌类型无法执行此操作 |

修复方法：

- 确认以与 `gh api user` 相同的用户在浏览器中登录后能打开该 PR/仓库
- 用包含 `repo` 的经典 scope 重新认证（用到那些功能时再加 `read:org` / `project`）
- 对 GitHub Enterprise，确保 `gh` 已在该主机名上认证（`gh auth login --hostname …`）

## 网络与 GitHub 故障

关于超时、"could not resolve host" 或 "GitHub is unreachable" 的消息属于连通性问题：

- 查看 [GitHub Status](https://www.githubstatus.com/)
- 尝试关闭 VPN / 公司代理
- 在远程主机上确认到 `api.github.com` 的出站 HTTPS 正常

## 缺少 GitHub CLI

如果 Orca 报告 GitHub CLI 不可用：

1. 安装 [`gh`](https://cli.github.com/)
2. 确认 `which gh` 在普通终端可用
3. 完全退出并重新打开 Orca（让 PATH 对上）
4. 在 Windows 上，安装到 Orca 启动时所用的同一环境（WSL 还是原生）

## GitHub 失败时 Orca 的行为

- **限流 / 故障**：PR 与 Checks 面板优先显示**最后已知状态**加一条简短横幅，而不是清空 UI。
- **硬性认证 / 权限失败**：你会看到明确的空状态或横幅文案，提示修复登录或访问权限。
- **熔断器**：主配额桶限流 403 之后，Orca 会短暂拒绝为该桶（`core`、`search` 或 `graphql`）再派生 `gh`，让应用保持响应，不越陷越深。

## 在 Orca 中查看 GitHub API 预算

打开 **[Settings → Git](/settings)**，找到 **GitHub API Budget**：

- GitHub 探测到的 **REST / Search / GraphQL** 剩余额度
- 等限流过去后刷新
- 在远程 Orca 服务器上，用远程高级预算视图查看**服务器持有**的 `gh` 身份（本地 Settings 只显示桌面客户端）

## 仍然卡住？

1. 在与 Orca 相同的机器/用户下，用 `gh pr view` 或 `gh api user` 在终端复现一次。
2. 收集日志：**Help → Open Logs**。
3. 提 issue 时附上分类后的错误文本（不要机密）、脱敏的 `gh auth status` 输出，以及终端里的 `gh` 是否同样失败。

- [GitHub Issues](https://github.com/stablyai/orca/issues)
- [Discord](https://discord.gg/fzjDKHxv8Q)

## 相关页面

- [GitHub 评审、议题与 Actions](/review/github)——依赖 GitHub 的 PR 与 Checks 功能
- [设置](/settings)——Integrations 与 Git 面板
- [用量与限流追踪](/agents/usage-tracking)——AI 提供商限额（Claude/Codex），不是 GitHub API
- [故障排查](/troubleshooting)——Orca 通用问题
