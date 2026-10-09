---
title: "终端 UI"
---

`@earendil-works/pi-tui` 提供 Pi 所用的终端组件系统。当内置的对话框、通知、状态文本和部件（widget）不足以支撑所需的交互时，扩展可以使用它。

从[扩展](extensions#interact-with-the-user)的 `ctx.ui` 方法入手。只有当 UI 需要自己的渲染、键盘或鼠标输入、焦点、布局或生命周期时，才构建自定义组件。

## 选择集成点

| 需求 | 方案 |
|---|---|
| 选择、确认、输入或多行编辑器 | `ctx.ui.select()`、`confirm()`、`input()` 或 `editor()` |
| 非阻塞反馈 | `ctx.ui.notify()` 或 `setStatus()` |
| 编辑器附近的持久内容 | `ctx.ui.setWidget()` |
| 替换页眉、页脚或编辑器（editor） | 对应的 `ctx.ui` 组件工厂 |
| 临时交互屏幕或浮层（overlay） | `ctx.ui.custom()` |
| 工具或会话条目的自定义渲染 | 扩展渲染器 |

这些 API 在需要时会收到 Pi 当前的主题和按键绑定（keybinding）。不要在扩展内创建第二个终端渲染器。

## 理解组件模型

组件为给定的可用宽度渲染一组终端行。它可以选择性地处理键盘和鼠标输入，并且在其状态或依赖主题的内容变化时必须使缓存的输出失效。

每个渲染行都必须落在给定宽度内。请测量可见终端列数而不是字符串长度，因为 ANSI 转义序列、宽字符、emoji 和组合字符都会改变显示宽度。

请使用 `visibleWidth()`、`truncateToWidth()`、`sliceByColumn()` 和 `wrapTextWithAnsi()`，不要自己实现终端宽度处理。Pi 在每行之后都会重置样式和超链接，因此要在每个渲染行上重新应用样式。

更改组件状态后，使受影响的组件失效，并调用注入的 `tui.requestRender()`。TUI 会合并渲染请求并更新终端。

## 组合内置组件

该包包含常见布局和控件的组件：

- `Text`、`Markdown`、`Image` 和 `TruncatedText` 渲染内容。
- `Container`、`VStack`、`HStack`、`Box` 和 `Spacer` 组合布局。
- `Input` 和 `Editor` 接受文本输入。
- `SelectList` 和 `SettingsList` 实现可搜索的选择和设置流程。
- `ScrollView` 提供有界的可滚动视口。
- `Loader` 和 `CancellableLoader` 报告进行中的工作。
- `MouseRegion` 为其他组件添加指针行为。

优先使用这些组件，不要重造选择、滚动、文本编辑或宽度处理。扩展示例展示了如何把它们与 Pi 的边框和主题组合。

## 处理键盘输入与焦点

终端键盘输入请使用 `matchesKey()` 和 `Key`。解析器已考虑受支持的终端协议和按键修饰符。扩展组件应使用注入的 `KeybindingsManager` 来实现可配置的应用动作。

显示文本光标的组件应实现 `Focusable`，并把 `CURSOR_MARKER` 放在可视光标紧前面。把光标单元格包在 `renderFakeCursor()` 里，TUI 就会以反显方式绘制它，或在显示硬件光标时隐藏 `CURSOR_MARKER` 之后的内容。TUI 用该标记为输入法编辑器定位硬件光标。

包裹 `Input` 或 `Editor` 的容器必须把自身的 `focused` 状态传播给该子组件。缺少传播时，中文、日文、韩文等输入法的候选窗口可能出现在错误的屏幕位置。

替换主编辑器时应继承 Pi 的 `CustomEditor`。它保留了应用快捷键和智能体控制。

把编辑器不处理的按键转发给基类实现；清除自定义编辑器工厂即可恢复默认。

## 处理鼠标输入

全屏模式把归一化的鼠标事件路由给组件。处理器可以标记事件已处理、捕获拖拽序列、请求焦点或请求渲染。

未处理的滚轮事件会滚动最近的 `ScrollView`。未处理的主键拖拽仍可用于转录选择。OSC 8 链接优先于外围的点击区域。

常规模式把鼠标输入留给终端，因为回滚缓冲归终端所有。即使全屏鼠标输入可用，每个交互也要设计键盘路径。

## 使用自定义屏幕与浮层

`ctx.ui.custom()` 临时把交互区域交给一个组件控制，并在该组件调用给定的完成回调时 resolve。

传入 `overlay: true` 可在现有内容之上绘制。浮层选项控制尺寸、锚点、偏移、边距和响应式可见性。浮层句柄可以更改焦点，或在交互仍处于活动状态时用 `setHidden()` 临时隐藏和显示浮层。

获得焦点的浮层在普通渲染之间保持输入所有权。如果浮层仍可见时其他组件需要接收输入，请通过句柄显式释放或转移焦点。

把每个自定义组件实例视为属于单次交互。再次开始该交互时创建新实例。

用传给组件工厂的完成回调结束交互。它会 resolve `ctx.ui.custom()` 的 promise 并销毁组件。不要对 `ctx.ui.custom()` 创建的浮层调用 `OverlayHandle.hide()`。

定位、堆叠、焦点、响应式可见性和动画行为见 [`overlay-qa-tests.ts`](../examples/extensions/overlay-qa-tests.ts)。

## 正确应用主题

使用传给扩展或组件回调的主题（theme）。主题助手为语义色生成 ANSI 样式字符串，例如强调色、弱化文本、成功、警告、错误、工具输出和 Markdown。

用 `theme.style()` 把前景色、背景色与文本属性组合：

```typescript
return new Text(
  theme.style("Done!", {
    fg: "success",
    bg: "toolSuccessBg",
    bold: true,
  }),
  0,
  0,
);
```

样式色可以是语义主题令牌（token）或具体的 `Color`。前景令牌作为 `fg` 接受，背景令牌作为 `bg` 接受；要在另一侧使用某个令牌的颜色，请传入其具体颜色，例如 `{ fg: theme.colors.userMessageBg }`。具体颜色通过 `theme.colors` 获取，需要颜色运算时使用 `@earendil-works/pi-tui` 的 `mixColors()` 等工具。主题设为终端默认值的令牌会以终端自身的颜色渲染；`theme.colors` 报告的是终端为其通告的颜色，未通告时则是猜测值。用 `theme.appearance`（`"dark"` 或 `"light"`）来决定，例如把颜色调亮还是调暗。Pi 会根据终端能力把结果转换为真彩或 256 色输出。主题令牌每个主题只转换一次；尽可能在渲染路径之外计算具体颜色。

现有的 `theme.fg()` 和 `theme.bg()` 助手仍可用于应用单个语义色。

不要永久保存带主题颜色的字符串，除非 `invalidate()` 会重建它们。主题切换会清空渲染缓存，但无法移除嵌入应用状态的旧 ANSI 颜色。

渲染期间求值的主题回调无需特殊重建。无状态组件也可以在每次渲染时计算带主题的输出。

创建终端调色板见[主题](themes)。渲染需要与当前应用主题匹配的 Markdown 时，使用 Pi 的 `getMarkdownTheme()`。

## 保持渲染流畅

渲染在交互路径上运行。按宽度和内容缓存昂贵的布局与高亮工作，并在 `invalidate()` 中清空该缓存。

默认视图保持紧凑，通过展开或专用屏幕呈现细节。自定义工具渲染要处理部分结果，并在可以安全更新时复用上一个组件。

排查渲染问题时，用 `PI_TUI_WRITE_LOG` 捕获原始 ANSI 流。测试窄宽度、宽字符、resize 事件、主题切换、焦点转移，以及常规与全屏两种模式。

## 示例与源码

已提交的扩展示例覆盖主要模式：

- [`preset.ts`](../examples/extensions/preset.ts) 和 [`tools.ts`](../examples/extensions/tools.ts) 使用选择列表和设置列表。
- [`qna.ts`](../examples/extensions/qna.ts) 使用可取消的异步 UI。
- [`modal-editor.ts`](../examples/extensions/modal-editor.ts) 替换编辑器。
- [`custom-footer.ts`](../examples/extensions/custom-footer.ts) 替换页脚。
- [`widget-placement.ts`](../examples/extensions/widget-placement.ts) 在编辑器周围放置持久内容。
- [`doom-overlay/`](../examples/extensions/doom-overlay/) 演示持续渲染的浮层。

公开导出定义在 [`packages/tui/src/index.ts`](https://github.com/earendil-works/pi/blob/main/packages/tui/src/index.ts)。扩展生命周期、状态、工具、事件和模式行为见[扩展](extensions)。
