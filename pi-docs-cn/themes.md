# 用主题自定义 Pi

主题（theme）控制 Pi 在交互模式（interactive mode）与 HTML 导出中使用的颜色。Pi 内置 `system`、`dark` 和 `light` 三个主题。你可以选定一个主题、跟随终端的浅色或深色外观，或创建自己的配色。

## 使用终端的颜色

`system` 主题是默认主题。它从终端的主题推导 Pi 的颜色，让 Pi 融入终端，而不是自带一套配色：

- Pi 会查询终端的默认前景色、背景色以及 16 种 ANSI 颜色。
- Pi 的每种颜色都从某个 ANSI 颜色取得色相，例如错误取自红色、链接取自蓝色。
- Pi 会为每种颜色设定明度，使其与背景保持最低对比度。正文文本在背景和每个面板上都保持至少 4.5:1 的 WCAG 对比度。
- 当终端在浅色与深色之间切换时，Pi 会重新查询颜色并重建主题。

主题会根据终端上报的信息自适应：

| 终端上报内容 | 结果 |
|---|---|
| 背景色与 ANSI 颜色 | 来自终端调色板的颜色，并针对实际背景进行排布。 |
| 仅背景色 | Pi 自有的色相，并针对实际背景进行排布。 |
| 什么都没有 | 使用 ANSI 颜色索引和终端默认颜色，由终端自行渲染。次要文字较淡，面板没有背景色。 |

Pi 在启动时会向终端询问颜色。终端通常会在几毫秒内应答，Pi 在显示启动标题前最多等待 100 毫秒。如果终端未及时应答，Pi 会退回使用 ANSI 颜色；若颜色稍后到达（例如通过较慢的 SSH 连接），Pi 仍会应用它们。`system` 是保留名称：名为 `system` 的自定义主题会被忽略。

<a id="selecting-a-theme"></a>

## 选择主题

打开 `/settings` 并选择 **Theme**。你可以让所有终端外观使用同一个主题，也可以为浅色和深色终端分别指定主题。

该选择会保存为 `theme` [设置](settings.md#terminal-and-display)：

```json
{
  "theme": "dark"
}
```

没有设置 `theme` 时，Pi 使用 `system`。

自动模式先存浅色主题，再存深色主题：

```json
{
  "theme": "light/dark"
}
```

Pi 根据终端上报的背景色与前景色判断终端是浅色还是深色。如果终端没有上报背景色，Pi 会依次尝试终端的浅色/深色通知、`COLORFGBG` 环境变量，最后默认按深色处理。同一判断逻辑既用于挑选浅色/深色主题对中的主题，也用于确定 `system` 的外观。自动模式生效时，终端上报外观变化后 Pi 会随之切换主题。主题名称不能包含 `/`，因为 Pi 将其保留用于该设置的格式。

使用 `--use-theme` 可为单次运行指定初始主题，而不改变已保存的设置：

```bash
pi --use-theme light
pi --use-theme light/dark
```

命令行选项参见 [CLI 资源](cli.md#resources)。

## 创建自定义主题

复制某个[内置主题](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/src/modes/interactive/theme)，或者新建一个符合该 [schema](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/schemas/theme.schema.json) 的 JSON 文件。内置主题使用 OKHSL 颜色，并为多个角色共用的颜色定义了变量，因此你可以直接调整色相、饱和度或明度。

1. 将文件保存为 `<agent-dir>/themes/my-theme.json`。智能体目录默认为 `~/.pi/agent`。
2. 将其 `name` 设为 `my-theme`。
3. 修改 `vars` 和 `colors` 中的值。
4. 通过 `/settings` 选择 `my-theme`。

用主题名作为文件名。Pi 只会从 `<agent-dir>/themes/<name>.json` 热重载当前生效的用户主题。从其他来源新增或修改主题后，请运行 `/reload`。

## 了解主题文件

| 属性 | 必填 | 职责 |
|---|---|---|
| `$schema` | 否 | 让编辑器能依据 Pi 发布的 schema 进行校验和补全。 |
| `name` | 是 | 在选择器和设置中标识主题。必须唯一，不能包含 `/`，也不能是 `system`。 |
| `appearance` | 否 | `"dark"` 或 `"light"`：主题所针对的背景。省略时 Pi 会从主题颜色推断。 |
| `vars` | 否 | 定义可复用的颜色值。变量可以引用其他变量。 |
| `colors` | 是 | 为终端 UI 角色分配颜色。schema 中标明了必填与可选角色。 |
| `export` | 否 | 覆盖 HTML 导出中的页面与面板背景。 |

主题对象是严格的：只接受文档中列出的顶层字段和颜色 token。可复用的自定义颜色请定义在 `vars` 下；`colors` 或 `export` 下的自定义键以及额外的顶层元数据都会被拒绝。

颜色可用六种形式书写：

| 形式 | 示例 | 含义 |
|---|---|---|
| RGB 十六进制 | `"#0af"` 或 `"#00aaff"` | 三位或六位数字的 sRGB 颜色。 |
| OKLCH | `"oklch(62% 0.1 200)"` | 感知明度、彩度与色相。 |
| OKHSL | `"okhsl(250 60% 55%)"` | 色相、饱和度与明度。饱和度相对于 sRGB 色域在该色相与明度下允许的上限，因此所有值都在色域内，相同的饱和度看起来鲜艳程度一致。 |
| 256 色索引 | `39` | `0` 到 `255` 的 ANSI 调色板索引。 |
| 变量引用 | `"primary"` | `vars` 中某个条目的值。 |
| 终端默认色 | `""` | 终端的默认前景色或背景色。 |

终端默认色会按终端自身的颜色渲染。在 Pi 需要具体值的场合（例如 HTML 导出或扩展的颜色计算），它会使用终端上报的默认颜色，或根据主题外观猜测的黑色或白色。

Pi 会解析链式变量引用。变量缺失或循环引用会使主题无效。Pi 在可用时使用真彩色（truecolor），将 OKLCH 映射到 sRGB 色域，并为 256 色终端近似颜色。HTML 导出会将 OKHSL 值转换为十六进制，因为 CSS 不支持它们。如果颜色与源值不一致，请检查终端的真彩色检测与对比度设置。参见[配置你的终端](terminal-setup.md#override-detected-capabilities)。

确切的属性、必填颜色和可接受的值类型，请参考[主题 JSON schema](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/schemas/theme.schema.json)。

Pi 会在启动时和 `/reload` 时报告无效的主题文件。

## 找到要修改的颜色

主题颜色描述的是界面角色，而不是单个组件。借助下面这些分组可以找到 schema 中相关的部分：

| 区域 | 颜色名 |
|---|---|
| 通用界面 | `accent`、`border*`、`text`、`muted`、`dim`、`success`、`error`、`warning` |
| 选中与全屏 | `selectedBg`、`searchMatch*`、`scrollbar*` |
| 消息 | `userMessage*`、`customMessage*`、`thinkingText` |
| 工具执行 | `toolPendingBg`、`toolSuccessBg`、`toolErrorBg`、`toolTitle`、`toolOutput` |
| Markdown | `md*` |
| 工具 diff | `toolDiff*` |
| 语法高亮 | `syntax*` |
| 编辑器模式 | `thinking*`、`bashMode` |
| HTML 导出 | `export.pageBg`、`export.cardBg`、`export.infoBg` |

schema 是格式参考。内置主题提供了完整的取值，可以复制后调整。

有五个颜色是可选的，省略时会继承另一个颜色：

| 可选颜色 | 回退值 |
|---|---|
| `scrollbarTrack` | `muted` |
| `scrollbarThumb` | `text` |
| `searchMatchBg` | `selectedBg` |
| `searchMatchText` | `text` |
| `thinkingMax` | `thinkingXhigh` |

如果省略 `export` 颜色，Pi 会从 `userMessageBg` 推导 HTML 页面与面板背景。

## 从项目或包加载主题

项目主题放在 `.pi/themes/` 中。项目主题只在授予[项目信任](security.md#understand-project-trust)后才会加载。

也可以通过 `themes` 设置加载主题文件和目录，或在 Pi 包中分发主题。参见[配置](configuration.md)、[设置](settings.md#resources)与 [Pi 包](packages.md)。

每个已加载的主题都必须有唯一的名称。名称重复时，Pi 会将其作为资源冲突上报。
