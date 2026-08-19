---
title: "故障排查与常见问题"
description: "故障排查与常见问题——Orca 文档。"
source: "https://www.onorca.dev/docs/troubleshooting"
---

# 故障排查与常见问题

## 智能体无法启动

- 打开终端，手动运行该智能体的 CLI。如果在那里也失败，问题出在 CLI 本身的认证或安装上——与 Orca 无关。
- 确保 CLI 位于 Orca 可见的 `PATH` 上（查看 [Settings → Agents](/settings)）。
- 试试标签页上的 **Restart** 卡片。

## Diff 视图显示异常 / 卡住

- 点击 diff 工具栏上的刷新图标——Orca 会重新读取 worktree。
- 外部 `git` 操作（rebase、reset）可能落在两次刷新之间。

## Worktree 创建失败

- 起始引用（start-from ref）可能尚未拉取。在仓库中打开终端并运行 `git fetch origin`。
- 目标目录中可能已存在该分支的 worktree——删除它，或换一个新的分支名。

## Orca CLI 提示 "command not found"

在 [Settings → General → Orca CLI](/settings) 中注册 CLI。在 macOS 上它会向 `~/.local/bin` 安装一个 shim；请确保该目录在你的 shell `PATH` 上。

## SSH 能连上但远程终端失败

- 确认远程机器装有 Node 且有网络访问，供首次 relay 安装使用。
- 在 Linux 上，如果终端始终无法启动，请安装 C/C++ 工具链：make、g++/clang++、python3（参见 [SSH worktree](/ssh)）。
- 安装工具后重新连接，让 Orca 重新安装原生模块。

## SSH 对文件有效但 "Download Folder" 不可用

文件夹下载需要递归 SFTP 传输。在仅有系统 SSH 的连接上，文件下载可能仍然可用。可以退回用终端里的 `tar`/`scp`。

## "Open in VS Code" 被禁用或仅限本地

- 使用 SSH worktree（而不是远程 Orca 服务器的活动运行时）。
- 将 Open-in 命令设为 VS Code / Insiders，而不是 Cursor 或多参数 shell 命令。
- 如果主机已被移除，请刷新 SSH 目标。

## Kerberos 登录失败

- 确保 `klist` 显示该主机 realm 的有效票据。
- 确认 OpenSSH 配置中该 Host 的 `GSSAPIAuthentication yes`，然后在 Settings → SSH 中重新导入或重新测试该目标。

## 浏览器报 `browser_no_tab`

当前 worktree 中没有打开的标签页。用 `orca tab create --url ...` 打开一个，或手动打开浏览器窗格并导航。

## 性能与内存

- 关掉你不再使用的 worktree。每个 worktree 都会让文件监视器保持活动。
- 带大量浏览器标签页的分屏布局是最大的内存消耗者——关掉不需要的浏览器。

## GitHub PR 面板 / 检查 / Tasks 报错

限流、`gh` 认证失效、缺少 scope 和仓库访问问题都会反映在 Source Control 和 PR Checks 面板中。完整排查矩阵见 **[GitHub 错误排查](/github-errors)**（包括为什么 Settings 里的 **GitHub API Budget** 看起来正常而 REST 调用仍被拦截）。

快速检查：

```
gh auth status -h github.com
gh api user
gh api rate_limit --jq '.resources.core'
```

## 日志

**Help → Open Logs** 会打开 Orca 的日志目录。提交 bug 时请附上。

## 报告问题

- **Help → Send Feedback**（应用内）——把截图粘贴或拖入对话框，或选择图片文件；提交前会显示缩略图。难以复现的 bug 请附上[日志](#日志)。
- [GitHub Issues](https://github.com/stablyai/orca/issues)——bug 和功能请求。
- [Discord](https://discord.gg/fzjDKHxv8Q)——实时求助。
