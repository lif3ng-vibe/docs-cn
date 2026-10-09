# 配置你的终端

大多数现代终端无需额外配置即可配合 Pi 使用。当修饰键组合、滚动、链接、图片、颜色或输入法（input-method editor，IME）候选窗口的定位行为不符合预期时，请参考本页。

Pi 使用扩展按键协议（extended-key protocol），让终端能够把 `Shift+Enter`、`Alt+Enter` 这类组合键与普通的 `Enter` 区分开。终端代理、多路复用器（multiplexer）以及 IDE 内置终端可能会更改或丢弃这些信息。

## 故障排查

| 症状 | 从这里开始 |
|---|---|
| `Shift+Enter` 被当作提交而不是插入换行 | 下方你的终端对应小节；tmux 用户参见[在 tmux 中运行 Pi](tmux.md) |
| `Alt+Enter` 无法将追问排入队列 | [WezTerm](#wezterm)、[Alacritty](#alacritty) 或 [Windows Terminal](#windows-terminal) |
| 全屏滚动异常缓慢 | [iTerm2](#iterm2) |
| 链接可以点击但没有悬停预览 | [Ghostty](#ghostty) |
| 未检测到内联图片或颜色 | [覆盖自动检测的能力](#覆盖自动检测的能力) |
| 输入法候选窗口出现在错误位置 | [WezTerm](#wezterm) 或 [IntelliJ IDEA](#intellij-idea-集成终端) |
| 修饰键只在 tmux 中失效 | [在 tmux 中运行 Pi](tmux.md) |

使用 `/hotkeys` 查看 Pi 当前生效的快捷键。要修改它们，参见[按键绑定](keybindings.md)。

## Kitty

Kitty 无需额外配置即可支持所需的键盘协议。

## iTerm2

普通终端模式无需额外配置即可使用。

### 修复全屏滚动缓慢

在全屏模式下，视口由 Pi 接管，因此 iTerm2 会发送鼠标滚轮上报（mouse-wheel report）而不是滚动原生终端历史。此时快速的触控板手势每次大约只能移动一行。

要改变这一行为：

1. 打开 **iTerm2 > Settings > Advanced**。
2. 搜索 **Trackpad scrolls fast?**。
3. 将其设为 **No**。

这是 iTerm2 的全局设置，也可能同时改变原生的触控板滚动行为。底层问题在 [iTerm2 issue 9619](https://gitlab.com/gnachman/iterm2/-/work_items/9619) 中跟踪。

## Apple Terminal

只要终端支持，Pi 就会启用增强按键上报。如果 Terminal.app 对 `Shift+Enter` 仍然只发送普通的 Return，Pi 会启用 macOS 本地修饰键回退，将其视为 `Shift+Enter`。

该回退仅在 Pi 与 Terminal.app 运行在同一台 Mac 上时有效。当 Pi 通过 SSH 运行在另一台机器上时，它无法读取本地修饰键状态。

## Ghostty

如果 `Alt+Backspace` 不起作用，请在 Ghostty 的配置中加入以下映射：

```text
keybind = alt+backspace=text:\x1b\x7f
```

配置文件在 macOS 上是 `~/Library/Application Support/com.mitchellh.ghostty/config`，在 Linux 上是 `~/.config/ghostty/config`。

较旧的 Claude Code 配置中可能包含：

```text
keybind = shift+enter=text:\n
```

这会发送原始换行符（linefeed），Pi 无法将其与 `Ctrl+J` 区分开。如果你添加这条映射只是因为旧版 Claude Code 的缘故，请移除它。Pi 本身已将 `Ctrl+J` 绑定为换行的替代键，所以这条映射看起来能用，但实际上会阻止 Pi 和 tmux 收到真正的 `Shift+Enter` 事件。

### 在全屏模式下打开链接

在全屏模式下链接仍然可以点击，但在 Pi 捕获鼠标输入期间，Ghostty 不会显示平时的悬停下划线或 URL 预览。按住 macOS 上的 `Shift+Command` 或 Linux 上的 `Shift+Ctrl`，即可使用 Ghostty 原生的链接处理。

## WezTerm

WezTerm 通常通过 xterm 扩展按键上报 `Shift+Enter`。要显式启用 Kitty 键盘协议，请创建 `~/.wezterm.lua`：

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.enable_kitty_keyboard = true
return config
```

### 在 macOS 上转发 Alt+Enter

在 macOS 上，WezTerm 默认将 `Option+Enter` 绑定为全屏。要把它用于 Pi 的追问队列，请在你的 `config.keys` 表中加入以下条目：

```lua
{
  key = 'Enter',
  mods = 'ALT',
  action = wezterm.action.SendString('\x1b[13;3u'),
}
```

一个完整的最小配置如下：

```lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.keys = {
  {
    key = 'Enter',
    mods = 'ALT',
    action = wezterm.action.SendString('\x1b[13;3u'),
  },
}
return config
```

### 在 WSL 中定位输入法候选窗口

如果在 WSL 中 CJK 输入法的候选窗口不跟随 Pi 的文本光标，请显示硬件光标：

```bash
export PI_HARDWARE_CURSOR=1
pi
```

你也可以改为在 Pi 设置中将 `showHardwareCursor` 设为 `true`。

## Alacritty

Alacritty 通常能上报 `Shift+Enter`。在 macOS 上，`Option+Enter` 可能会以普通 `Enter` 的形式到达。将以下内容加入 `~/.config/alacritty/alacritty.toml`，把它转发给 Pi：

```toml
[[keyboard.bindings]]
key = "Enter"
mods = "Alt"
chars = "\u001b[13;3u"
```

修改文件后重启 Alacritty。

## VS Code 集成终端

VS Code 1.109.5 及更新版本默认在集成终端中启用 Kitty 键盘协议。

对于旧版本，请在 `keybindings.json` 中添加一条 `Shift+Enter` 终端绑定：

```json
{
  "key": "shift+enter",
  "command": "workbench.action.terminal.sendSequence",
  "args": { "text": "\u001b[13;2u" },
  "when": "terminalFocus"
}
```

用户级 `keybindings.json` 文件通常位于：

- macOS：`~/Library/Application Support/Code/User/keybindings.json`
- Linux：`~/.config/Code/User/keybindings.json`
- Windows：`%APPDATA%\\Code\\User\\keybindings.json`

## Zed 集成终端

将以下绑定加入 Zed 的 `keymap.json`：

```json
{
  "context": "Terminal",
  "bindings": {
    "shift-enter": ["terminal::SendText", "\u001b[13;2u"],
    "ctrl--": ["terminal::SendText", "\u001b[45;5u"],
    "ctrl-alt-]": ["terminal::SendText", "\u001b[93;7u"]
  }
}
```

## Windows Terminal

Windows Terminal 使用 Pi 在 Windows 和 WSL 上的默认快捷键。完整列表参见[按键绑定](keybindings.md)。

### 转发 Shift+Enter

使用 `Ctrl+Shift+,` 或通过 **Settings > Open JSON file** 打开 Windows Terminal 的 `settings.json`。将以下对象加入其 `actions` 数组：

```json
{
  "command": { "action": "sendInput", "input": "\u001b[13;2u" },
  "keys": "shift+enter"
}
```

完全关闭并重新打开 Windows Terminal，然后验证 `Shift+Enter` 能在 Pi 中插入新的一行。

### 将 Alt+Enter 用于追问

Windows Terminal 默认将 `Alt+Enter` 绑定为全屏。因此在 Windows 和 WSL 上，Pi 使用 `Ctrl+Q` 发送追问。

要改用 `Alt+Enter`，请配置 Windows Terminal 转发该按键，并在 Pi 的 `keybindings.json` 中将 `app.message.followUp` 绑定到 `alt+enter`。参见[按键绑定](keybindings.md#assign-keybindings)。

## xfce4-terminal 与 Terminator

这些终端无法可靠地区分带修饰键的 Enter 组合与普通 `Enter`。因此 `Ctrl+Enter`、`Shift+Enter` 之类的自定义绑定可能不生效。

如果需要这些快捷键，请使用支持现代扩展按键协议的终端，例如 Kitty、Ghostty、WezTerm、iTerm2、Windows Terminal，或兼容的 Alacritty 版本。

## IntelliJ IDEA 集成终端

IntelliJ IDEA 内置终端无法可靠地区分 `Shift+Enter` 与普通 `Enter`。请用 `Ctrl+J` 插入换行，或在支持现代扩展按键协议的终端中运行 Pi。

如果输入法候选窗口不跟随文本光标，请显示硬件光标：

```bash
export PI_HARDWARE_CURSOR=1
pi
```

## 覆盖自动检测的能力

Pi 会自动检测 OSC 8 超链接、内联图片协议和真彩色（truecolor）支持。终端代理或多路复用器可能让检测结果不准确。

| 能力 | 环境变量 | 设置项 |
|---|---|---|
| 超链接 | `PI_HYPERLINKS=1\|0\|auto` | `terminal.hyperlinks: true\|false\|"auto"` |
| 内联图片 | `PI_IMAGE_PROTOCOL=kitty\|iterm2\|none\|auto` | `terminal.images: "kitty"\|"iterm2"\|false\|"auto"` |
| 真彩色 | `PI_TRUE_COLOR=1\|0\|auto` | `terminal.trueColor: true\|false\|"auto"` |

设置项优先于环境变量。未设置或取值为 `auto` 时保留自动检测。

只在整个终端链路都支持某个能力时才强制启用。不支持的转义序列可能破坏渲染。权威取值定义参见[环境变量](environment-variables.md#pi-process-configuration)与[设置](settings.md)。

## 程序状态

Pi 通过[程序状态协议（Program Status Protocol，OSC 7501）](https://www.superlogical.com/rex/docs/build/program-status)上报自身状态，让终端和智能体仪表盘能够显示它是在工作、在等你、已完成还是失败了：

| 状态 | 何时上报 |
|---|---|
| `working` | 智能体运行或压缩正在进行中。消息内容是会话名称。 |
| `blocked` | 扩展对话框或登录流程在等你操作。消息内容是对话框标题。 |
| `done` | 一次运行已结束。消息内容是会话名称。 |
| `error` | 一次运行以错误结束且不再重试。消息内容是错误的第一行。 |
| `idle` | Pi 已启动，或你取消了运行。 |

上报内容绝不包含提示词或模型输出。Pi 只在终端应答了协议的能力询问之后才发送上报；tmux 和 screen 不会转发这些上报。设置 `PI_PROGRAM_STATUS=1` 可跳过询问直接发送，设置 `PI_PROGRAM_STATUS=0` 可将其关闭。
