---
title: "概览"
description: "每个 worktree 专属的内置浏览器——地址栏、历史、开发者工具，标签页按 worktree 隔离。"
source: "https://www.onorca.dev/docs/browser/overview"
---

$undefined

每个 Orca worktree 都有自己专属的浏览器。这是一个真正的 Chromium 窗口——地址栏、历史记录、开发者工具——内嵌在窗格里。标签页以 worktree（工作树）为作用域，你正在开发的应用不会干扰其他工作。

按 worktree 隔离的浏览器窗格，带地址栏与标签页栏

## 控件

- 地址栏带历史记录与模糊 URL 补全。非 URL 文本会用你的[默认搜索引擎](/settings)搜索——与[新标签页 omnibox](/model/quick-open#新标签页-omnibox) 使用同一引擎。在 **+** 输入框里给查询加 `?` 前缀可强制搜索。
- 后退 / 前进 / 重新加载 / 停止。悬停重新加载控件可见普通重载快捷键；右键（或长按）可见 **Reload** 与 **Hard Reload** 及各自快捷键——在迭代本地前端资源时，强制刷新会绕过缓存。
- `Cmd-F`——页内查找。
- `Cmd-T`——新建标签页，作用域为本 worktree。
- `Cmd-Shift-T`——重新打开最近关闭的标签页。

## Worktree 作用域

标签页按 worktree 过滤。切换 worktree 会恢复该 worktree 的浏览器标签页与滚动位置。

按 worktree 隔离的浏览器标签页，会话持久——一键即可从 Chrome 或 Edge 导入 Cookie。Google 登录态不导入；请在 Orca 中直接登录 Google。

## 链接路由

在 [Settings → Browser → Link Routing](/settings) 里，选择来自终端、markdown 与编辑器的 http(s) 链接在 Orca 的按 worktree 浏览器还是系统浏览器中打开。

嵌套的 **Hold Shift…** 开关可以让单次带平台修饰键的点击反转该默认行为（macOS 上是 `⇧⌘-click`，Windows / Linux 上是 `Shift+Ctrl+click`）：

- 当链接在 **Orca** 中打开时，修饰键会把这一个链接发给系统浏览器。
- 当链接在**系统浏览器**中打开时，开启该开关后，修饰键会改为把这一个链接放进 Orca 的内置浏览器（普通点击仍走系统浏览器）。

远程/SSH 来源的链接即使带修饰键也绝不会在 Orca 浏览器内打开。终端链接还能弹出一个带 **Orca Browser** / **System Browser** 的点击浮层——见[终端 → 链接操作](/terminal#链接操作)。

## 下载

浏览器下载在活动或刚完成时显示在工具栏下方的下载栏里，操作包括取消进行中的下载、打开已完成的文件、在文件夹中显示、或关掉该行。

## 分享为 artifact

在 worktree 浏览器中打开的本地 HTML 文件，可用工具栏中的 **Share as artifact** 通过已登录的 Orca 账号生成公开查看链接（与 Markdown 使用同一开关和管理界面）。相对引用的 HTML 资源不会上传——请分享自包含文件或使用资源的绝对 URL。见 [Settings → Artifacts](/settings#artifacts) 与 [CLI 参考 → Artifacts](/cli/reference#artifacts)。

## 视口尺寸仿真

在浏览器标签页上设置自定义视口尺寸，无需调整整个窗格即可测试响应式布局。Orca 底层使用 Chrome DevTools Protocol 的设备仿真，页面在 `window.innerWidth` 与媒体查询中看到的就是仿真后的尺寸。

## 自动化

智能体也可以通过 [Orca CLI](/cli/overview) 脚本化驱动这个浏览器——`orca snapshot`、`orca click`、`orca fill` 等等。就是你正在用的那个浏览器，同样的标签页。

智能体通过 CLI 驱动 Orca 内置浏览器——同样的标签页、同样的会话

## 后续步骤

- [设计模式](/browser/design-mode)——把浏览器变成"指针到代码"的反馈回路。
- [浏览器配置](/browser/profiles)——让浏览器以特定的登录身份、Cookie 集合或 user agent 运行。
