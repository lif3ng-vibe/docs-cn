---
title: "终端"
description: "终端——基于 xterm.js，为 AI 智能体工作流调校，支持主题导入、OSC 52、原生按键绑定与快速命令。"
source: "https://www.onorca.dev/docs/terminal"
---

# 终端

$undefined

Orca 的终端与 VS Code 使用的一样，都基于 xterm.js，外加一些为 AI 智能体工作流调校的功能。

Ghostty 风格的终端——首次启动即可导入你的 Ghostty 主题、字体与光标

## 窗格与标签页

终端就是标签页——见[标签页、窗格与分屏布局](/model/tabs-panes-splits)。把终端窗格分屏，就得到并排的两个 shell。

智能体终端标签页显示智能体身份与实时状态：工作中、等待输入、已完成或已完成未读。对 Claude 与 Codex，当 Orca 能把窗格对应到会话时，标签页标题还可以显示 **AI Vault 会话名**（自定义标题 / 线程名）——手动重命名仍然优先。

## TUI 剪贴板（OSC 52）

许多终端 UI（Zellij、tmux、Neovim、fzf、Grok）通过 **OSC 52** 而不是操作系统剪贴板 API 复制。Orca **默认允许**这类写入，因此从远程/TUI 复制经 SSH 与在本地效果一致。

开关：[Settings → Terminal → Allow TUI Clipboard Writes (OSC 52)](/settings)。

## 搜索

`Cmd-F` 打开回滚缓冲内查找。支持匹配高亮、大小写、正则与匹配项导航。

## 链接操作

直接点击终端链接（HTTP/OSC 8 URL、文件路径、工作区、终端或任务句柄）会打开一个紧凑的操作浮层，而不是立即导航。对本地 Web 链接，浮层提供 **Orca Browser** 与 **System Browser**；远程链接只能走系统浏览器。Web 链接还有 **Copy link**，它复制解析后的 URL（包括隐藏的 OSC 8 目标地址）且不关闭浮层——文件与工作区目标保持不变。`Cmd`-点击（macOS）/ `Ctrl`-点击（Windows / Linux）仍然直接打开，`Shift+Cmd` / `Shift+Ctrl`-点击仍然使用[链接路由](/browser/overview#链接路由)的备用方向。

在 [Settings → Browser → Show terminal link actions](/settings) 关闭该浮层。关闭后，打开链接需要修饰键点击。

## 复制终端上下文

右键终端并选择 **Copy Context**，复制该窗格一段有边界的记录。当你想把智能体最近的输出粘贴到其他工具、又不想启动一个 Orca fork 时使用。

## 主题

终端配色主题可在 [Settings → Terminal](/settings) 配置。Orca 自带一组流行主题，且每个都可自定义。

## Ghostty 导入

如果你使用 Ghostty，Orca 可以在首次启动时导入它的主题、字体与光标配置。之后可在 [Settings → Terminal → Import from Ghostty](/settings) 重新导入。

## Warp 主题导入

如果你在 Warp 里攒了主题，在 [Settings → Terminal](/settings) 的终端主题选择器中点击 **Import themes from Warp**，即可把它们导入为 Orca 终端主题。Orca 会扫描当前操作系统的 Warp 主题目录（macOS 为 `~/.warp/themes`，Linux 为 `$$XDG_DATA_HOME/warp-terminal/themes`，Windows 为 `%APPDATA%\warp\Warp\data\themes`），让你挑选要导入的 YAML 主题。旁边的 **Import from YAML** 按钮使用同一选择器，可指向任意存放 Warp 格式 `.yaml`/`.yml` 文件的文件夹——当你的主题不在默认位置时很有用。

导入的主题会与 Orca 内置主题一起出现在主题下拉列表中。

## Windows shell

Windows 的默认 shell 可在 [Settings → Terminal](/settings) 中于 PowerShell、Command Prompt 与 WSL 之间配置。`wsl.exe --status` 成功时会自动提供 WSL。标签栏的 **+** 下拉还有子菜单，可以临时以任意 shell 打开一次性标签页，而不改变默认值。

对位于 WSL 文件系统（`\\wsl.localhost\...`）的仓库，Orca 通过 `wsl.exe -d <distro>` 启动。对在 WSL 中打开的 Windows 路径仓库，Orca 把工作目录换算为 `/mnt/<drive>/...` 并放入登录 bash。

## 快捷键

- `Cmd-T`——在当前 worktree 新建终端标签页。
- `Cmd-Alt-T`（macOS）——用默认智能体新建智能体标签页。Linux 与 Windows 上该组合键默认未绑定；可在 [Settings → Shortcuts](/settings) 分配（搜索 "New agent tab"）。每个受支持的智能体还有各自的 "New agent tab" 操作——绑定组合键即可直接启动特定 CLI，不必经过默认智能体。
- `Cmd-W`——关闭当前标签页。
- `Cmd-\`——向右分屏。
- `Cmd-Shift-\`——向下分屏。

## 原生按键绑定

Orca 声明支持 kitty 键盘协议，因此终端应用能看到真实的 `Shift+Enter`、`Ctrl+Enter` 等感知修饰键的按键——这些绑定在 Orca 中的行为与在 Ghostty、WezTerm 或你的原生终端中一致。

经 kitty 键盘协议的原生按键绑定——Shift+Enter 等按键到达智能体 CLI 的方式与独立终端完全一致。

对 macOS 上的日文 JIS 键盘，如果你希望物理日元键在终端会话中发送反斜杠，请启用 **Settings → Terminal → JIS Yen (¥) to Backslash (\)**。

## 浮动终端

浮动终端是全局 shell 界面，无论你处于哪个 worktree 或标签页，一个组合键即可唤出。新安装默认开启。

- 用 `Cmd+Option+A`（macOS）/ `Ctrl+Alt+A`（Linux/Windows）切换。面板已打开时同一组合键聚焦它，已聚焦时则收起。
- 点击窗口边缘的浮动按钮，或在 [Settings → Terminal → Floating terminal](/settings) 把触发器移到状态栏。
- 在同一设置下配置起始工作目录（默认 `~`），让新的浮动标签页落在你期望的位置。
- 浮动面板有自己的标签页，并支持编排 setup——无需占用 worktree 窗格即可启动后台 Run。

## 快速命令

快速命令保存你经常运行的终端命令，例如 `npm run dev`、`pnpm test` 或项目专属的 setup 脚本。也可以为 Claude、Codex 这类启动时接收提示的智能体保存可复用的提示词。在 **Settings → Quick Commands** 或标签栏的 **Add command** 按钮创建，然后在 worktree 标签栏的快速命令分体按钮或终端右键菜单中运行。

每条命令有标签、命令文本与作用域。到处通用的命令用 **Global**；只想在特定仓库的 worktree 里显示的用 **Project**。标签栏按钮会新建终端标签页并运行命令；终端右键菜单可以把命令插入当前终端。用命令行上的复制控件（Settings 列表、标签栏菜单或[移动端快速命令](/mobile#快速命令)）把命令正文放进剪贴板。

当你连接了配对的[远程 Orca 服务器](/remote-servers)（或其他执行主机）时，选择器可以**本地与远程**并列显示，按主机标注（例如 *Local Mac* 与 *Orca Server*）。**Saved on** 表示命令存储在哪台主机上；运行命令仍在你在哪个终端或工作区里调用的地方执行——因此客户端的命令也可以在远程 worktree 里运行。不声明多主机快速命令的旧服务器会回退为仅本地列表。
