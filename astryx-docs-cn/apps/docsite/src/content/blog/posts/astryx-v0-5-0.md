---
title: 'Astryx v0.5.0：30 个 locale、统一的 Escape 键，以及进入核心的底部工作表'
description: '0.4.0 以来的所有内容汇聚成一个发布：覆盖层的共享关闭栈、带 codemod 的 Banner API 变更、28 个新 locale 词表，以及能真正落到 CSS 的主题继承。'
date: '2026-08-24'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Accessibility'
  - 'Internationalization'
---

Astryx v0.5.0 发布，汇集了 0.4.0 以来的八个版本。

```bash
npm i @astryxdesign/core@0.5.0
```

每个稳定的 `@astryxdesign/*` 包都以同一版本发布，请把它们全部升级到 `0.5.0`。仅限 canary 的包——`lab`、`charts`、`richtext`、`vega`——则独立版本化。

## 两个破坏性变更

先预览迁移：

```bash
npx @astryxdesign/cli upgrade --from <your-version>
```

这只是 dry run。加上 `--apply` 才会把变更写入磁盘。

### Banner 的折叠行为收敛为一个 `collapsible` prop

`defaultIsExpanded` 已移除，内容也可以完全退出折叠——这恰恰是横幅最常见的诉求（[#5255](https://github.com/meta/astryx/pull/5255)）。`collapsible` 接受布尔值或配置，沿用 `SideNav.collapsible` 确立的约定：

```tsx
// `status` and `title` are required on every Banner
<Banner status="error" title="Check 3 fields">…</Banner>                                 // unchanged: starts closed
<Banner status="error" title="Check 3 fields" collapsible={false}>…</Banner>             // always visible, no toggle
<Banner status="error" title="Check 3 fields" collapsible={{defaultIsOpen: true}}>…</Banner>   // replaces defaultIsExpanded
<Banner status="error" title="Check 3 fields" collapsible={{isOpen, onOpenChange}}>…</Banner>  // controlled
```

默认渲染不变，codemod 会重写每一个点名了这个 prop 的调用处。它看不见展开运算——TypeScript 也看不见，因为不会对展开做多余属性检查——所以运行之后请再 grep 一遍 `defaultIsExpanded`，并手工迁移 `<Banner {...props} />`。

### 一次 Escape 只关闭一层

过去每个覆盖层都有自己独立的 Escape 监听器，所以按一次键可能同时关掉一个 Popover _和_承载它的 Dialog。现在覆盖层共享同一个关闭栈，把每次按键只路由给最顶层，别的什么都不动（[#4881](https://github.com/meta/astryx/pull/4881)）。Dialog 里的 Tooltip 关闭的只是 tooltip。

"最顶层"来自 React 树的嵌套关系，因此能穿透 portal。一层通过 `useLayerDismissal` 的 `escapeBehavior` 声明它如何处理按键——`close`，或对必须吞掉按键的强制 Dialog 使用 `block`。受控层、IME 组合输入，以及 Android 返回手势这类浏览器发起的关闭行为，都遵循同样的最顶层规则。

这里没有 codemod，因为没有 prop 挪动。如果你自己监听 Escape，有一件事需要知道：这个栈会用 `preventDefault()` 认领按键，但不去阻止传播，所以 `window` 上的 `keydown` 监听器现在会看到过去会被焦点陷阱层拦下的 Escape，且 `defaultPrevented` 已经为 `true`。

### 一并移除的内容

UMD 产物（`dist/astryx.umd.js`，连同 `unpkg` 和 `jsdelivr` 包字段）已移除。它绑定到 `window.React`，而 React 19 不再提供会定义该全局变量的构建，所以不存在任何可迁移的可用配置；`astryx template --cdn` 会写出替代它的 import-map 页面。三个被放弃的页面模板也一并下线：`table-page-chart`、`table-page-heatmap-status` 和 `table-page-shoe-store-heatmap`。

## 三次晋升

"晋升"意味着一个组件离开实验性的 `lab` 包，进入你可以放心依赖的包。它必然改变 import 路径，因此是发布中最需要你留意的部分。

### Bottom Sheet → core（v0.4.4）

`BottomSheet` 和 `BottomSheetSwitcher` 现在来自 `@astryxdesign/core`（[#5080](https://github.com/meta/astryx/pull/5080)），`snapPoints` 把拖拽停靠点交给宿主决定——可以是视口比例（`0.5`）、百分比（`'50%'`）或长度（`'320px'`）。内容已滚到底时继续上滑不会戛然而止，而是继续拉高工作表；停在停靠位上的工作表会在窗口缩放或设备旋转时重新解析几何；移动端键盘也不再推移页面，或让停靠位从工作表底下溜走。

![同一展开状态的 Bottom Sheet 的两次渲染，左侧浅色模式，右侧深色模式。每幅图都展示了窄视口上一个工作表的顶部：圆角顶边、内容上方居中的小拖拽把手、一行说明文字、一条分隔线，以及一份带距离标注、一直滚出画面底部的附近地点列表。](/blog/astryx-v0-5-0/bottomsheet.png)

### Stepper → core（本次发布）

`Stepper` 和 `Step` 现在来自 `@astryxdesign/core`（[#5201](https://github.com/meta/astryx/pull/5201)），保留横竖两种布局、分离式与轨道式指示器、语义化状态、密度与非线性导航。前进一步时连接线会有动效——accent 填充从线段的前沿长出来，向前走看起来就像进度沿轨道行进。后退、跨步跳转、中途挂载以及 `prefers-reduced-motion` 会同时生效。

![同一五步 Stepper 的两次渲染，左侧浅色模式，右侧深色模式。一个垂直的工作区配置流程，指示器直接坐在连接轨道上：前两步已完成，带实心对勾指示器；第三步为当前步，是实心圆环配加粗标签；最后两步未开始，是弱化的数字圆圈。轨道在已完成部分为实线，未开始部分为弱化色，每一步的标签下都有一行描述。](/blog/astryx-v0-5-0/stepper.png)

### RichTextEditor → `@astryxdesign/richtext`（v0.4.1）

基于 Lexical 的编辑器从 `lab` 迁入了自己的包（[#4678](https://github.com/meta/astryx/pull/4678)），因此可以独立走 canary。**这次并不是转正**——`@astryxdesign/richtext` 只以 `@canary` 发布，与 `lab` 完全一样。对你来说变化的是 import：`RichTextEditor`、`RichTextView` 和 `RichTextEditorToolbar` 现在来自 `@astryxdesign/richtext`。

![同一 RichTextEditor 的两次渲染，左侧浅色模式，右侧深色模式。每幅图都是一个标注为 "Notes" 的字段，顶部横贯一排格式化工具栏——撤销、重做、Paragraph 区块类型菜单，然后是粗体、斜体、下划线、删除线、代码和链接——下方编辑区里是句子 "Release notes for v0.5.0 — now in its own package."，其中版本号为粗体。](/blog/astryx-v0-5-0/richtexteditor.png)

## 亮点

### 30 个 locale，日期跟随你的 provider

core 最初只带 `en` 和 `fr-FR`，现在携带 30 个 locale 词表。`DateInput`、`DateTimeInput`、`DateRangeInput` 和 `Calendar` 的格式化与解析走环境中的 `InternationalizationProvider` locale，而非浏览器的；Calendar 的星期表头使用 CLDR stand-alone-short 名称。Selector、MultiSelector、Typeahead、FileInput、Tokenizer 和 Lightbox 的 live-region 播报现在来自词表并带 ICU 复数，而不是追加一个英文 "s"。新增的 `useLocale` 和 `useCollator` 导出让你自己的代码在格式化和比较时用上同一个 locale。

CJK 输入也安全了。`Selector`、`MultiSelector`、`Typeahead`、`DateInput`、`DateTimeInput`、`TimeInput` 和 `NumberInput` 会等 IME 完成组词后才把 keydown 当作命令读取，所以提交组词的 Enter 不再顺带提交字段——取消组词的 Escape 也不会关闭任何层。

### 主题现在真正继承 `extends`

用 `extends` 构建的主题过去只输出自己的声明，于是继承链上的每个使用者拿到的都是标准几何形状外加一层新调色板。现在基座会解析进子主题的输出，`defineTheme` 遇到坏的 `extends` 会抛错，而不是默默继承个空。

焦点环也是 token——`--focus-outline-width`、`--focus-outline-style`、`--focus-outline-color` 和 `--focus-outline-offset` 驱动 core 和 lab 里的每一个焦点环，覆盖一次即可全系统重塑焦点样式。`color.accent` 还接受 `[light, dark]` 元组，为两种配色方案各派生一套调色板。

### 键盘、指针与触控

`TabList` 在你声明 `role="tablist"` 时遵循 WAI-ARIA tabs 模式，比自身标签更窄的横条会滚动而不是溢出容器——每个 tab 仍然是一个 tab，没有任何东西藏进菜单。`ButtonGroup` 是单一 Tab 停靠点，成员之间用方向键移动。`Breadcrumbs` 用半粗字重而非仅用颜色标记当前层级，这是 WCAG 1.4.1 的要求，旧的纯色调处理无法满足。core 和 lab 中的禁用元素不再绘制悬停状态和可交互光标。在粗指针设备上，Slider 轨道、`sm` 尺寸的 checkbox、radio 和 switch，以及共用的清除按钮都达到 WCAG 2.5.8 AA 的 24×24 最小值——仅指可点区域；可见外观没有任何移动。

### 更多可用的构建素材

- `FormLayout` 接受 `defaultOptionality`，表单只需标记例外项。
- `DateRangeInput` 接受 `minRangeSpan` 和 `maxRangeSpan`。
- `DateTimeInput` 接受 `timeOptionInterval`，用于预设时间下拉。
- `MultiSelector` 通过 `formatValue` 格式化整行触发器文本。
- `Table` 插件可以隐藏主体单元格的内容。
- `AspectRatio` 把 `ratio` 作为类级声明输出，因此可以按断点覆盖。
- PowerSearch 可浏览的字段上限从 10 提升到 1,000，按各字段的 `group` 分组，把 `menuWidth` 应用于字段菜单和搜索菜单，并在取值 typeahead 中遵循 `maxOperatorMenuItems`。
- Markdown 解析器拒绝 `javascript:`、`vbscript:` 和 `data:text/html` URL。增量解析会在未闭合代码围栏期间保留已定型的块：流式输出一篇 500 段的回复时，重建的块数从 126,756 降到 1,869。

### CLI

`astryx theme targets` 列出每一个组件的主题定制目标——它的 `defineTheme` 键、它绘制的类、它接受的 prop 与状态——并提供 `--json` 供 lint 和审计脚本使用。`astryx theme template` 写出一份带注释的空白主题，`astryx theme build` 在一个进程里接受任意数量的主题文件。`astryx template --cdn` 写出钉在你所装版本上的免构建页面。五个新的 dashboard 页面模板加入模板集。集成还可以贡献参考文档主题，由 `astryx docs` 提供、`astryx search` 索引。

## 致谢

非常感谢 0.4.0 以来八个版本中贡献过的所有人：[@AKnassa](https://github.com/AKnassa)、[@andrskr](https://github.com/andrskr)、[@arham766](https://github.com/arham766)、[@Astro-Han](https://github.com/Astro-Han)、[@athz](https://github.com/athz)、[@bhamodi](https://github.com/bhamodi)、[@cixzhang](https://github.com/cixzhang)、[@ejhammond](https://github.com/ejhammond)、[@Eloitor](https://github.com/Eloitor)、[@ernestt](https://github.com/ernestt)、[@freddymeta](https://github.com/freddymeta)、[@Geervan](https://github.com/Geervan)、[@gonzoblasco](https://github.com/gonzoblasco)、[@Han5991](https://github.com/Han5991)、[@HelloOjasMutreja](https://github.com/HelloOjasMutreja)、[@imdreamrunner](https://github.com/imdreamrunner)、[@is-jain](https://github.com/is-jain)、[@jiunshinn](https://github.com/jiunshinn)、[@josephfarina](https://github.com/josephfarina)、[@kentonquatman](https://github.com/kentonquatman)、[@Kevinjohn](https://github.com/Kevinjohn)、[@lexs](https://github.com/lexs)、[@nynexman4464](https://github.com/nynexman4464)、[@potatowagon](https://github.com/potatowagon)、[@rubyycheung](https://github.com/rubyycheung)、[@Sunil56224972](https://github.com/Sunil56224972)、[@Unmesh100](https://github.com/Unmesh100)。

特别感谢 [@Sunil56224972](https://github.com/Sunil56224972) 提交的 Markdown 安全报告与修复（[#4330](https://github.com/meta/astryx/pull/4330)）。

完整变更日志见 [v0.5.0 发布页](https://github.com/meta/astryx/releases/tag/v0.5.0)。
