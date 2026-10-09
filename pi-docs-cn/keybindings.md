---
title: "按键绑定参考"
---

Pi 暴露可分配按键绑定的命名动作，例如 `app.session.new`。你可以在 Pi 的[用户配置](configuration#%E6%99%BA%E8%83%BD%E4%BD%93%E7%9B%AE%E5%BD%95)中修改默认绑定，或为未绑定的动作指定按键。

运行 `/hotkeys` 查看主编辑器和应用当前生效的快捷键。

## 分配按键绑定

创建 `<agent-dir>/keybindings.json`。agent 目录默认为 `~/.pi/agent`，详见[agent 目录](configuration#%E6%99%BA%E8%83%BD%E4%BD%93%E7%9B%AE%E5%BD%95)。

把每个动作标识符映射到一个按键或按键列表：

```json
{
  "app.session.new": "ctrl+shift+n",
  "app.session.tree": ["ctrl+shift+t", "alt+shift+t"]
}
```

已配置的值会替换该动作的默认绑定。用空列表可禁用某个动作的按键绑定：

```json
{
  "tui.altScreen.pageUp": []
}
```

编辑文件后，运行 `/reload` 将更改应用到当前会话。

## 按键语法

按键写作 `modifier+key`。修饰键有 `ctrl`、`shift`、`alt` 和 `super`。修饰键可以组合。有效按键包括：

- **字母**：`a-z`
- **数字**：`0-9`
- **特殊键**：`escape`、`esc`、`enter`、`return`、`tab`、`space`、`backspace`、`delete`、`insert`、`clear`、`home`、`end`、`pageUp`、`pageDown`、`up`、`down`、`left`、`right`
- **功能键**：`f1`-`f12`
- **符号**：`` ` ``、`-`、`=`、`[`、`]`、`\`、`;`、`'`、`,`、`.`、`/`、`!`、`@`、`#`、`$`、`%`、`^`、`&`、`*`、`(`、`)`、`_`、`+`、`|`、`~`、`{`、`}`、`:`、`<`、`>`、`?`

示例：`ctrl+shift+x`、`alt+ctrl+x`、`ctrl+shift+alt+x`、`super+k`、`ctrl+super+k` 和 `ctrl+1`。

`super` 绑定要求终端单独上报该修饰键，通常通过 Kitty 键盘协议。不支持该能力的终端中可能无法工作。

## 动作

### 终端 UI

#### 光标移动

| 按键绑定 ID | 默认值 | 说明 |
|---|---|---|
| `tui.editor.cursorUp` | `up` | 上移光标，到顶部时翻阅更早的历史 |
| `tui.editor.cursorDown` | `down` | 下移光标，到底部时翻阅更新的历史 |
| `tui.editor.historyPrevious` | 无 | 选择上一条提示词历史条目 |
| `tui.editor.historyNext` | 无 | 选择下一条提示词历史条目 |
| `tui.editor.cursorLeft` | `left`, `ctrl+b` | 左移光标 |
| `tui.editor.cursorRight` | `right`, `ctrl+f` | 右移光标 |
| `tui.editor.cursorWordLeft` | `alt+left`, `ctrl+left`, `alt+b` | 光标左移一个词 |
| `tui.editor.cursorWordRight` | `alt+right`, `ctrl+right`, `alt+f` | 光标右移一个词 |
| `tui.editor.cursorLineStart` | `home`, `ctrl+a` | 移到行首 |
| `tui.editor.cursorLineEnd` | `end`, `ctrl+e` | 移到行尾 |
| `tui.editor.jumpForward` | `ctrl+]` | 向前跳到指定字符 |
| `tui.editor.jumpBackward` | `ctrl+alt+]` | 向后跳到指定字符 |
| `tui.editor.pageUp` | `pageUp`, `ctrl+pageUp` | 向上翻页 |
| `tui.editor.pageDown` | `pageDown`, `ctrl+pageDown` | 向下翻页 |

专用的历史动作无论光标位置如何都会翻阅提示词历史，并优先于使用相同按键的应用动作。

#### 文本编辑

| 按键绑定 ID | 默认值 | 说明 |
|---|---|---|
| `tui.editor.deleteCharBackward` | `backspace` | 向后删除一个字符 |
| `tui.editor.deleteCharForward` | `delete`, `ctrl+d` | 向前删除一个字符 |
| `tui.editor.deleteWordBackward` | `ctrl+w`, `alt+backspace` | 向后删除一个词 |
| `tui.editor.deleteWordForward` | `alt+d`, `alt+delete` | 向前删除一个词 |
| `tui.editor.deleteToLineStart` | `ctrl+u` | 删除到行首 |
| `tui.editor.deleteToLineEnd` | `ctrl+k` | 删除到行尾 |
| `tui.editor.yank` | `ctrl+y` | 粘贴最近删除的文本 |
| `tui.editor.yankPop` | `alt+y` | yank 后在删除过的文本间循环 |
| `tui.editor.undo` | `ctrl+-`（Windows 上为 `ctrl+z`；WSL 上为 `alt+z`） | 撤销上次编辑 |

#### 输入与选择

| 按键绑定 ID | 默认值 | 说明 |
|---|---|---|
| `tui.input.newLine` | `shift+enter`, `ctrl+j` | 插入新行 |
| `tui.input.submit` | `enter` | 提交输入 |
| `tui.input.tab` | `tab` | 制表符或自动补全 |
| `tui.input.copy` | `ctrl+c` | 复制选中内容 |
| `tui.select.up` | `up` | 上移选择 |
| `tui.select.down` | `down` | 下移选择 |
| `tui.select.pageUp` | `pageUp` | 列表中向上翻页 |
| `tui.select.pageDown` | `pageDown` | 列表中向下翻页 |
| `tui.select.confirm` | `enter` | 确认选择 |
| `tui.select.cancel` | `escape`, `ctrl+c` | 取消选择 |

#### 全屏

全屏模式下，这些动作控制对话记录，并优先于使用相同按键的编辑器动作。

| 按键绑定 ID | 默认值 | 说明 |
|---|---|---|
| `tui.altScreen.pageUp` | `pageUp` | 对话记录上翻一页 |
| `tui.altScreen.pageDown` | `pageDown` | 对话记录下翻一页 |
| `tui.altScreen.halfPageUp` | 无 | 对话记录上翻半页 |
| `tui.altScreen.halfPageDown` | 无 | 对话记录下翻半页 |
| `tui.altScreen.lineUp` | 无 | 对话记录上滚一行 |
| `tui.altScreen.lineDown` | 无 | 对话记录下滚一行 |
| `tui.altScreen.previousPrompt` | `ctrl+shift+up`, `ctrl+up`（仅 Windows 和 WSL 上有 `ctrl+up`） | 跳到上一个标记的消息 |
| `tui.altScreen.nextPrompt` | `ctrl+shift+down`, `ctrl+down`（仅 Windows 和 WSL 上有 `ctrl+down`） | 跳到下一个标记的消息 |
| `tui.altScreen.search` | `ctrl+shift+f`（Windows 和 WSL 上为 `ctrl+f`） | 搜索渲染后的对话记录 |
| `tui.altScreen.searchNext` | `enter`, `ctrl+g` | 搜索时选中下一个匹配 |
| `tui.altScreen.searchPrevious` | `shift+enter`, `ctrl+shift+g` | 搜索时选中上一个匹配 |
| `tui.altScreen.searchClose` | `escape` | 关闭对话记录搜索 |
| `tui.altScreen.top` | `ctrl+home` | 滚动到对话记录开头 |
| `tui.altScreen.bottom` | `ctrl+end` | 滚动到对话记录末尾并跟随新输出 |

### 应用级

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.interrupt` | `escape` | 取消 / 中止 |
| `app.clear` | `ctrl+c` | 清空编辑器（第一次）/ 退出（第二次） |
| `app.exit` | `ctrl+d` | 退出（编辑器为空时） |
| `app.suspend` | `ctrl+z`（Windows 上为无） | 挂起到后台 |
| `app.editor.external` | `ctrl+g` | 在外部编辑器中打开（`externalEditor`、`$VISUAL`、`$EDITOR`、Windows 上的 Notepad，或其他平台的 `nano`） |
| `app.clipboard.pasteImage` | `ctrl+v`（Windows 和 WSL 上为 `alt+v`） | 从剪贴板粘贴 macOS 上的文件、图片或文本 |

在原生 Windows 上，`app.suspend` 没有默认绑定，因为 Windows 终端不支持 Unix 作业控制。手动指定后，Pi 会显示状态消息而不是挂起。WSL 使用正常的 `ctrl+z` 与 `fg` 行为。

### 会话

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.session.new` | 无 | 开始新会话（`/new`） |
| `app.session.tree` | 无 | 打开会话树导航器（`/tree`） |
| `app.session.fork` | 无 | 分叉当前会话（`/fork`） |
| `app.session.resume` | 无 | 打开会话恢复选择器（`/resume`） |
| `app.session.togglePath` | `ctrl+p` | 切换路径显示 |
| `app.session.toggleSort` | `ctrl+s` | 切换排序模式 |
| `app.session.toggleNamedFilter` | `ctrl+n` | 切换仅显示命名条目的过滤器 |
| `app.session.rename` | `ctrl+r` | 重命名会话 |
| `app.session.delete` | `ctrl+d` | 删除会话 |
| `app.session.deleteNoninvasive` | `ctrl+backspace` | 查询为空时删除会话 |

### 模型与思考

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.model.select` | `ctrl+l` | 打开模型选择器 |
| `app.model.cycleForward` | `ctrl+p` | 循环切换到下一个模型 |
| `app.model.cycleBackward` | `shift+ctrl+p`（Windows 和 WSL 上为 `alt+p`） | 循环切换到上一个模型 |
| `app.models.save` | `ctrl+s` | 把所选默认模型或范围模型配置保存到设置 |
| `app.thinking.cycle` | `shift+tab` | 循环切换思考级别 |
| `app.thinking.save` | `ctrl+s` | 把当前思考级别保存到设置 |
| `app.thinking.toggle` | `ctrl+t` | 折叠或展开思考块 |

### 显示与消息队列

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.tools.expand` | `ctrl+o` | 折叠或展开工具输出 |
| `app.message.copy` | `ctrl+x` | 在 `/tree` 中复制选中的消息；全屏模式下，当 `fullscreenCopyOnSelect` 为 `false` 时复制当前选中内容；否则复制最后一条助手消息。在 OAuth 登录界面则复制登录 URL |
| `app.message.followUp` | `alt+enter`（Windows 和 WSL 上为 `ctrl+q`） | 将追问消息加入队列 |
| `app.message.dequeue` | `alt+up`（Windows 和 WSL 上为 `alt+q`） | 把队列中的消息恢复到编辑器 |

### 会话树导航

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.tree.foldOrUp` | `ctrl+left`, `alt+left` | 折叠当前分支段，或跳到上一个分支段开头 |
| `app.tree.unfoldOrDown` | `ctrl+right`, `alt+right` | 展开当前分支段，或跳到下一个分支段开头或分支末尾 |
| `app.tree.editLabel` | `shift+l` | 编辑所选树节点上的标签 |
| `app.tree.toggleLabelTimestamp` | `shift+t` | 在会话树中切换标签时间戳 |
| `app.tree.filter.default` | `ctrl+d` | 把会话树过滤器设为默认视图 |
| `app.tree.filter.noTools` | `ctrl+t` | 切换隐藏工具结果的会话树过滤器 |
| `app.tree.filter.userOnly` | `ctrl+u` | 切换只显示用户消息的会话树过滤器 |
| `app.tree.filter.labeledOnly` | `ctrl+l` | 切换只显示带标签条目的会话树过滤器 |
| `app.tree.filter.all` | `ctrl+a` | 切换显示全部条目的会话树过滤器 |
| `app.tree.filter.cycleForward` | `ctrl+o` | 向前循环切换会话树过滤器 |
| `app.tree.filter.cycleBackward` | `shift+ctrl+o` | 向后循环切换会话树过滤器 |

### 范围模型选择器

在范围模型选择器（通过 `/scoped-models` 打开）内使用。

| 按键绑定 ID | 默认值 | 说明 |
|--------|---------|-------------|
| `app.models.enableAll` | `ctrl+a` | 启用所有模型（或当前搜索匹配的所有模型） |
| `app.models.clearAll` | `ctrl+x` | 清空所有模型（或当前搜索匹配的所有模型） |
| `app.models.toggleProvider` | `ctrl+p` | 切换当前提供商的所有模型 |
| `app.models.reorderUp` | `alt+up` | 在循环顺序中上移所选模型 |
| `app.models.reorderDown` | `alt+down` | 在循环顺序中下移所选模型 |
