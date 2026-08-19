---
title: "设置参考"
description: "设置参考——Orca 文档。"
source: "https://www.onorca.dev/docs/settings"
---

# 设置参考

设置按窗格分组。这里的一切都可以用 `Cmd-,` 再输入关键字搜索到。文档中的功能页面会直接链接到对应的窗格。

## General

- **Orca CLI**——为 shell 和智能体注册内置的命令行工具。
- **Updates**——检查并安装更新。在 **Check for Updates** 上配合修饰键点击：

| 修饰键 | 效果 |
| --- | --- |
| **Shift+点击** | 包含最新的 **RC** 预发布版 |
| **Cmd+点击**（macOS）/ **Ctrl+点击**（Windows/Linux） | 最新的 **perf** 标签预发布版 |
| **Option+点击**（仅 macOS） | 选择一个**已验证的本地 macOS 构建**（通过兼容性检查）。失败时显示 "Could Not Use Local Build"，并提供 **Choose Another Build**。 |

- **Open in menu**——选择 worktree 的 **Open in** 菜单中出现的应用。VS Code / Insiders 会为 SSH worktree 启用 **Remote SSH** 打开；其他编辑器仍仅限本地路径。
- **UI zoom**——本安装级别的 UI 缩放。
- **工作区默认命名**——选择一个自定义前缀，或让 Orca 用海洋生物来命名。
- **Editor Word Wrap**——文件编辑器的默认换行（默认开启）。可从文件标签页的 **⋯** 菜单或用 `Alt+Z` 切换。与 **Diff Word Wrap** 相互独立。

## Appearance

- 主题、强调色、密度。
- UI 字体族；编辑器字体需显式设置（留空 = 跟随终端字体；设了值则仅覆盖文件编辑器和 diff）。
- 编辑器 minimap 开关。
- 状态栏开关，包括 **Resource Manager**（CPU/内存/会话、守护进程控制、工作区磁盘扫描）。
- **Usage percentages**——在状态栏名单上以**已用 %** 或**剩余 %** 显示提供商限额。
- App Icon——在 Classic、Watercolor 和 Blue 之间轮换 Dock 和窗口切换器中显示的图标。
- **Language**——界面语言的主控制。在 System（跟随操作系统）、English、中文（简体）、한국어、日本語 或 Español 之间切换。设置搜索也能用 "language" 的本土词（语言 / 語言 / 언어 / 言語 / Idioma）匹配，UI 还在英文时也能找到 Language。

## Git

- 默认基准引用解析器。
- 提交签名选项。
- 外部 git 工具使用的编辑器。
- **Auto-Rename Branch From Work**——智能体开始工作后，重命名 Orca 生成的海洋生物分支。
- **GitHub API Budget**——来自本地 `gh` CLI 的 REST（core）、Search 和 GraphQL 剩余额度。当 PR 检查或 Tasks 停止刷新时有用；如果数字看起来正常但 GitHub 仍对实时调用限流，参见 [GitHub 错误排查](/github-errors)。

## Terminal

- 字体、主题、光标样式、内边距。
- Ghostty 导入。
- Warp 主题导入——用 **Import themes from Warp** 引入你的 Warp YAML 主题（按操作系统自动发现 Warp 的主题文件夹），或用 **Import from YAML** 导入任意一个装着 Warp 格式主题文件的文件夹。
- macOS 日文键盘的 JIS Yen（¥）映射为反斜杠（\）。
- Windows 默认 shell（PowerShell 或 CMD）。
- **Allow TUI Clipboard Writes (OSC 52)**——**默认开启**。允许 Zellij、tmux、Neovim、fzf、Grok（及类似程序）通过 PTY 写系统剪贴板，SSH 场景下同样有效。偏好旧的锁定行为可关闭。

## Quick Commands

- 保存的终端命令和智能体提示词预设，范围为全局或项目。每行都有命令内容的复制控件。
- 用于审查和编辑命令列表的范围过滤器。同一列表会同步到[移动端伴侣应用](/mobile)。
- 在远程或多主机配置下，命令按拥有它的 Orca 主机分组（**Saved on**）。主机归属与 Global/Project 范围相互独立，也与命令实际在哪里运行无关——参见 [Terminal → Quick Commands](/terminal#快速命令)。

## Agents

- 已安装的智能体——检测到的 CLI，可启用或禁用。
- 启用/禁用检测到的智能体，让启动菜单只显示你想用的那些 CLI。
- **Agent Permissions**——对未自定义的智能体，选 **Yolo** 可减少 CLI 权限弹窗，选 **Manual** 则保留各智能体自己的批准流程。
- Claude 和 Codex 账号列表。
- 每个智能体的启动钩子。
- **Agent status hooks**——在 Orca 中显示工作 / 等待 / 完成状态。切换无需重启应用即生效（包括 Windows 的 WSL 钩子 relay）。CLI：`orca agent hooks on|off|status`。
- **Keep computer awake**——**On**（持续保持唤醒）、**Agent**（智能体工作时保持唤醒）或 **Off**。桌面状态栏上的同一控件名为 **Caffeinate**（咖啡杯图标）。已配对的网页客户端上隐藏。
- **Skill freshness**——Agents 窗格和技能卡片仍显示完整状态。侧边栏导航只对需要操作的技能打徽标（**Update available**、**Needs attention** / 需要审查）；健康、加载中和可选未安装的行保持安静。用对话框中的 **Update** 在后台刷新全局技能（不占用终端）。进度显示在状态栏上；关闭对话框不会取消运行。参见 [Orca 技能](/cli/skills#保持技能最新)。

## Browser

- 配置（参见[浏览器配置](/browser/profiles)）。
- **Default Zoom**——应用到新打开浏览器标签页的缩放级别（Cmd-滚轮的逐标签页调整会单独记忆）。
- Design Mode 默认值。
- Devtools 开关。
- **Link Routing**——在 Orca 的浏览器或系统浏览器中打开来自终端、markdown 和编辑器的 http(s) 链接。嵌套的 **Hold Shift…** 为单次点击反转该默认（`⇧⌘-click` / `Shift+Ctrl+click`）。参见[每 worktree 浏览器](/browser/overview#链接路由)。
- **Show terminal link actions**——**默认开启**。普通点击终端链接会打开一个紧凑的操作弹出框。关闭后需要 `⌘`-click / `Ctrl`-click。参见 [Terminal → Link actions](/terminal#链接操作)。
- **Default Search Engine**——在浏览器地址栏或[新标签页 omnibox](/model/quick-open#新标签页-omnibox) 中输入非 URL 文本时使用。

## Artifacts

- **Orca account**——登录（与 Orca Relay 同一账号体系）以发布和管理共享文件。
- **Allow publishing public artifact links**——**默认关闭**。设备级闸门：开启后，你、智能体和本机上的 `orca` CLI 可以上传 HTML/Markdown 并生成公开查看链接。关闭不会删除既有链接。
- **Show Artifacts** / 侧边栏快捷方式——打开 Artifacts 列表，搜索、预览、复制或删除账号拥有的链接。
- **Ask Before Deleting Artifacts**——断开公开链接前的可选确认。
- 从打开的本地 HTML 页面或 Markdown 编辑器用 **Share as artifact** 分享，或经由 `orca artifacts …`。参见 [CLI 参考 → Artifacts](/cli/reference#artifacts)。

## Integrations

- GitHub OAuth。
- Linear API token。
- Jira——Cloud（邮箱 + API token）或自托管 Server/Data Center（PAT 或用户名/密码）。参见 [Jira 事项抽屉](/review/jira)。
- Bitbucket Cloud——用 **Email & API token**（默认）或 **Access token** 进行 **Connect**。Orca 会在保存前验证凭据。`ORCA_BITBUCKET_*` 环境变量优先，并会隐藏 Connect / Disconnect。保存的凭据留在本机——在[远程 Orca 服务器](/remote-servers)上，请改为在服务器上设置这些环境变量。参见[托管审查](/review/github)。
- MiniMax——粘贴 MiniMax 会话 cookie（来自 `platform.minimax.io/console/usage`），为 MiniMax CLI 启用本地用量和限流追踪。可选的 group ID 和用量模型字段会覆盖从 cookie 取到的默认值。
- MCP 服务器。

## Notifications

- 智能体完成：系统、声音、chip。
- 每个类别独立的自定义桌面通知声。
- PR 检查失败。
- 有可用更新。

## Voice

- **Enable Voice Dictation**——需要麦克风权限（macOS 可能会打开"隐私与安全性"）。
- **Microphone**——选择听写使用的输入设备。默认为系统麦克风；不想用系统默认时选择具体设备（例如耳机）。所选麦克风被拔出或缺失时，Orca 会回退到系统默认并显示一条非阻塞提示。
- **Dictation mode**——**Toggle**（按快捷键开始/停止）或 **Hold**（按住快捷键说话）。
- **Speech Model**——下载/选择端上模型，或粘贴 API key 后使用云端 OpenAI 模型：

- **Parakeet TDT v3**（推荐）——多语言欧洲语言，离线。
- **Parakeet TDT v2**——英语，更快。
- **Zipformer** 系列——中英双语流式；流式 EN/ZH；**Zipformer Streaming KO**（韩语）。
- **Paraformer Bilingual**——中文方言 + 英语。
- **Parakeet TDT-CTC JA**——日语。
- **SenseVoice**——中 / 英 / 日 / 韩 / 粤语，自动语言检测。
- **Whisper Tiny**——90+ 种语言，精度较低。
- **GPT-4o mini / GPT-4o Transcribe**——云端；需要同一窗格下填入 OpenAI key。

- 听写过程中，**Listening…** 药丸会显示 **Stop** 控件；toggle 模式下工具提示还会显示听写快捷键。

## SSH

- SSH worktree、目标、口令（passphrase）、默认身份文件。
- 高级：代理 / 跳板主机；**Reuse SSH connection for faster setup**（系统 OpenSSH 多路复用；默认开启）。
- Kerberos 主机：OpenSSH 配置中的 `GSSAPIAuthentication` 驱动系统 OpenSSH 认证（参见 [SSH worktree](/ssh)）。

## Remote Orca Servers

- 配对并连接远程 Orca 运行时。
- 把本桌面应用宣告为服务器，并创建可撤销的访问链接。
- 为服务器路由的项目、终端和提供商检查选择高级默认运行时。

## Shortcuts

- 完整键位表——每个绑定都可重映射。
- Toggle Sleeping Workspaces 出厂未绑定；想给侧边栏的休眠 worktree 过滤器一个直接快捷键，可在此分配。
- **Toggle Workspace Board** 出厂未绑定；在此分配后，可用一个快捷键开关 Workspace Board。`workspace.openBoard` 的既有绑定继续有效。
- 关闭所有编辑器标签页，默认为 macOS 上的 `Cmd+Option+W` 和 Windows / Linux 上的 `Ctrl+Alt+W`。
- **标签页导航默认值（新安装）：**跨所有类型的下一个/上一个标签页为 `Cmd+Shift+]` / `Cmd+Shift+[`（Linux/Windows 上为 Ctrl）。同类型的下一个/上一个为 `Cmd+Option+]` / `Cmd+Option+[`。上一个最近标签页为 `Ctrl+Tab`。既有安装保留 `~/.orca/keybindings.json` 中的自定义覆盖。
- **Add Review Note** 默认为 `Cmd+Shift+A`（macOS）/ `Ctrl+Shift+A`（Windows / Linux）；可重映射。
- **Send Review Notes to Agent** 出厂未绑定；在此分配后，无需鼠标即可为活动 worktree 的 diff 批注打开发送菜单。

## Repository

- 每仓库的基准引用和钩子。
- worktree 创建时自动运行的命令。
- 侧边栏的仓库图标：选择图标、可搜索的完整 emoji 选择器、上传图片、网站 favicon 或 GitHub 头像，再选预设或自定义的十六进制徽标色。
- 提交信息、PR 详情和分支名的 Source Control AI 覆盖。
- **Worktree Shared Paths**——从主检出物化到每个新 worktree 的 gitignored 路径（macOS 上尽可能 APFS clone-copy，否则符号链接）。与检入仓库的 `orca.yaml` 中的 `worktree.sharedDirectories` 和 `.worktreeinclude` 互补（参见 [Worktree](/model/worktrees)）。

## Floating Workspace

- **Enable Floating Workspace**——用于**不**绑定仓库 worktree 的终端、浏览器和 markdown 标签页的全局界面。
- **Terminal Directory**——新浮动终端标签页的起始目录（`~` = 主目录）。
- **Toggle Button Location**——浮动工作区开关出现的位置；无论按钮放在哪里，键盘快捷键都有效。

## Plugins（Experimental）

- **Plugin system**——Settings → Plugins。先打开系统，再逐个审查并启用每个插件。未经你同意，任何东西都不会运行。
- **Marketplaces**——添加 git marketplace 源，浏览插件，预览能力（面板、命令、语言包、VM 配方），安装、更新或回滚。
- 插件 worker 始终运行在本机；SSH 工作区上的操作仍经由 Orca 路由。
- 能力与 API 形态可能变化；请将第三方插件视为不受信软件。

## Experimental

- [活动页](/activity)——Slack 风格的智能体事件 worktree 动态。
- 紧凑 worktree 卡片——在布局仍处实验阶段时，隐藏侧边栏中冗余的第二行。
- [智能体休眠](/agents/hibernation)——暂停闲置的后台智能体，重新打开时自动恢复。
- **Agent Dashboard**——Needs You / Working / Done 智能体的看板（可选 Idle），外加实验性 **Agent Map**；搜索和项目/工作区/PR 过滤；窗口内打开或弹出打开。**Show idle agents** 位于仪表盘的看板设置控件上，不在这里。参见[智能体与会话](/model/agents-sessions#智能体仪表盘)。
- **Chat UI**——受支持的智能体终端上的可选聊天界面。参见 [Chat UI](/agents/native-chat)。
- **Cloud VM**——为仓库自有的按需环境（云沙箱、VM 或本地 Docker）显示安装控制和工作区 **Run on** 目标。安装指南和配方安装位于这个实验开关之下。参见 [Orca 的运行方式](/ways-to-run#4-云-vm每工作区环境)。
- 尚未稳定的功能——行为可能变化。
