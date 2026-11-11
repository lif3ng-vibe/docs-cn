---
title: 'Astryx v0.6.0：会响应的主题，能自适应的组件'
description: '响应式主题规则、能选对表面呈现的 Selector、Neutral 的视觉焕新、六个新模板，以及一条有规格背书的 v1 之路。'
date: '2026-09-10'
type: 'update'
authors:
  - 'team'
tags:
  - 'Release'
  - 'Theming'
  - 'Components'
  - 'Accessibility'
---

Astryx v0.6.0 为产品构建者带来响应式主题规则、能自适应的选择交互，以及一份更有章法的 Neutral 调色板。

记下你今天用的版本，把项目里每个稳定的 Astryx 包都更新到 `0.6.0`，然后运行新 CLI 的升级命令：

```bash
OLD_VERSION=0.5.4 # replace with the Core version your project uses today
npm i @astryxdesign/core@0.6.0 @astryxdesign/cli@0.6.0 @astryxdesign/theme-neutral@0.6.0
npx @astryxdesign/cli upgrade --from "$OLD_VERSION" --apply
```

示例包含 Neutral；项目用到的其他稳定版 Astryx 主题也请在同一步安装里一并更新。

## 主题在 CSS 里响应

主题现在可以根据命名的视口宽度、指针精度、对比度偏好和减弱动效偏好，自适应调整 token、组件样式、排版、颜色、圆角与动效。

```ts
defineTheme({
  name: 'acme',
  adaptations: {
    widthBreakpoints: {sm: 640, md: 768, lg: 1024},
    rules: [
      {
        when: {width: {below: 'md'}, pointer: 'coarse'},
        value: {
          tokens: {'--size-element-md': '44px'},
          components: {
            button: {base: {fontWeight: 'var(--font-weight-bold)'}},
          },
        },
      },
      {
        when: {motion: 'reduce'},
        value: {tokens: {'--duration-medium': '0ms'}},
      },
    ],
  },
});
```

主题可以同时响应多个条件——比如带触控指针的小屏。规则重叠时，靠后的规则优先。因为产物就是 CSS，浏览器立刻完成适配，不必等待 JavaScript 的布局循环。

![同一张评论卡片由同一个 Astryx 主题在两种宽度下渲染。宽屏处理使用蓝色 accent、紧凑控件与更小的圆角；紧凑处理走主题的窄宽度规则：品红 accent、更大的控件、更粗的按钮与更圆的圆角。](/blog/astryx-v0-6-0/responsive-theme.png)

`AppShell` 的命名式移动端导航断点也使用同一份主题自有的宽度映射，其中包括新的 `xl` 和 `2xl` 值。主题家族还可以定义局部 token，而不必把每个主题专属概念都升级为永久性的 Core token。

## Selector 自适应呈现形态

响应式设计不只是间距。在紧凑表面上，同一个选择用带触控尺寸行高的模态底部工作表呈现效果更好；在更宽的表面上，则可以保持锚定式 popover。`Selector` 和 `MultiSelector` 在 v0.6.0 带来了 `presentation="adaptive"` 行为，同时保持选项与选中值不变。

它们还新增了可播报的空状态和 `isReadOnly`，让选中值保持可聚焦、可随表单提交，又不暴露编辑控件。

![一个紧凑的项目表单：打开 Owning team 的 Selector 时，其自适应底部工作表以动画滑入视野，随后关闭。Reviewers 的 MultiSelector 始终留在同一产品上下文中可见。](/blog/astryx-v0-6-0/adaptive-inputs.webp)

## 六个新起点

Astryx 0.6 新增五个向导模板和一个工作项详情页。每一个都对应一种不同的产品形态：

- [Checkout Wizard](/templates/checkout-wizard)——带实时订单摘要的分步结账流程。
- [Form Wizard](/templates/form-wizard)——整页流程，每一步都占满内容宽度。
- [Dialog Wizard](/templates/form-wizard-dialog)——短引导流程，底层页面保持可见。
- [Inline Wizard](/templates/form-wizard-inline)——手风琴式流程，已完成步骤收拢在当前步骤周围。
- [Vertical Wizard](/templates/form-wizard-vertical)——长表单流程，进度常驻并带上下文指引。
- [Work Item Detail](/templates/work-item-detail)——被跟踪条目的视图，含子任务、属性、附件与活动记录。

每个模板都可以在其链接页预览或在 Playground 中打开，也可以用 `astryx template <name>` 添加。

## Neutral 的视觉焕新

Neutral 围绕一份可复现、主题自有的 OKLCH 调色板重建。语义色、语法色与分类色现在都引用命名的调色板色阶，因此调色板源码、生成的颜色、运行时主题和 CLI 模板可以放在一起审阅。

可见的变化都是有意为之：浅色模式的前景色使用更深的色阶；深色模式的彩色梯度低音更沉稳；危险按钮使用由调色板支撑的红色交互色；深色状态表面更扎实；信息横幅使用更安静的蓝色调。语义状态填充现在通过 Neutral 自有的局部 token，在 badge、状态圆点、Stepper 指示器和进度条之间共享。

![同一发布就绪度界面在当前配色模式下、Neutral 更新前后的对比渲染。横向比较 info、success、warning、error 四种状态在横幅、badge、状态圆点、进度条、checkbox，以及主要、次要与危险操作上的呈现。](/blog/astryx-v0-6-0/neutral-makeover.png)

对主题作者来说，0.6 还加入了创作期 OKLCH 调色板生成器，支持终端与 HTML 预览、带类型输出、自定义色阶、确定性生成记录与覆盖保护。

## 一条有规格背书的 v1 之路

在可见发布之外，随着 Astryx 迈向 v1 加固，我们正在为组件和共享系统撰写可长期维护的规格文档。这些记录定义了一个组件拥有什么：公共 API、行为、无障碍要求、结构解剖、主题目标、状态表达以及允许的变化范围。

已批准且标记为 current 的记录，是其覆盖行为的唯一事实来源，供贡献者与维护者参照；草稿或悬而未决的决策仍需人工评审。现行记录也给智能体提供了可核对的具体依据：它们可以把实现与既定契约对照，在测试或文档里抓住漂移，并把 bug 修复与新的系统级决策区分开。

实际目标是一致性与速度：组件之间相互矛盾的处理更少，评审反馈更清晰，对社区贡献的响应更快——因为常规正确性可以对照已定案的决策来检查。新设计与 API 方向仍由人类把握；方向落纸之后，智能体帮助实现保持对齐。

## 迁移到 0.6.0

按上面先安装后升级的顺序操作。先装 `0.6.0` 很关键：CLI 从已安装的 Core 版本推导迁移目标，如果 Core 还在 `0.5.x` 时运行升级，它会报告项目已是最新并跳过 v0.6 迁移。

codemod 处理常见的 focus-hook、IME import、Resizable 与 Astryx 选择器迁移。CSS 层的主要变化是视觉 prop 和状态现在用反射式 `data-*` 属性而不是裸类名：

```css
.astryx-button.primary
/* becomes */
.astryx-button:is(.primary, [data-variant='primary'])
```

运行之后，请检查这些情况：

- 不带限定或自定义的选择器，以及存放在 JavaScript 或 TypeScript 里的选择器；
- 动态的 focus-hook 与 Resizable 配置对象、展开运算和计算属性；
- `isImeKeyEvent` 的非标准 import，它现在来自 `@astryxdesign/core/utils`；
- 自定义 Stepper 集成：`minimumStepWidth` 是像素数值，`registerStep` 接受 `{getIsDisabled}`，紧凑布局内部成员不再公开；
- 读取生成选择器的自定义主题工具；以及
- 预构建的自定义主题，它们必须随 Core 0.6.0 重新构建并部署。

在 `AppShell` 的移动端断点上，恰好落在边界值时渲染更宽的布局；移动模式只在低于边界时生效。主题作者还应预期：无效的适配值和可达的 token 循环会在 CSS 输出前报错。

## 本次发布的其他内容

- CheckboxListItem 和 RadioListItem 的富标签与描述现在会产生正确的无障碍名称和描述。
- TextInput 和 TextArea 会透传 `autoComplete`。
- Popover 的焦点与同一手势重开保护现在覆盖所有打开路径。
- 悬停高亮的选项列表在指针静止时不再反复自动滚动。
- Carousel 的边缘渐隐在 RTL 下正确镜像。
- CLI 集成可以添加受管智能体指引，`doctor integration` 会检查其结构与冲突。
- 调试记录在 `schemaVersion: 3` 下，于整棵命令树填充 `resultCount`、`emptyResult`、`resultKind` 和 `directMatch`。
- `withAstryx()` 会拒绝 Turbopack 配置，而不是完成一个没有样式的构建。

## 致谢

感谢上述变更背后的贡献者：[@AKnassa](https://github.com/AKnassa)、[@Astro-Han](https://github.com/Astro-Han)、[@bhamodi](https://github.com/bhamodi)、[@cixzhang](https://github.com/cixzhang)、[@ernestt](https://github.com/ernestt)、[@faga295](https://github.com/faga295)、[@freddymeta](https://github.com/freddymeta)、[@Geervan](https://github.com/Geervan)、[@gonzoblasco](https://github.com/gonzoblasco)、[@harjothkhara](https://github.com/harjothkhara)、[@Hashim1999164](https://github.com/Hashim1999164)、[@HelloOjasMutreja](https://github.com/HelloOjasMutreja)、[@imdreamrunner](https://github.com/imdreamrunner)、[@jiunshinn](https://github.com/jiunshinn)、[@joaodotwork](https://github.com/joaodotwork)、[@josephfarina](https://github.com/josephfarina)、[@kentonquatman](https://github.com/kentonquatman)、[@Kyujenius](https://github.com/Kyujenius)、[@Lee-Dongwook](https://github.com/Lee-Dongwook)、[@lexs](https://github.com/lexs)、[@ManoharPaturi](https://github.com/ManoharPaturi)、[@mattandryc](https://github.com/mattandryc)、[@ngolin](https://github.com/ngolin)、[@nynexman4464](https://github.com/nynexman4464)、[@PRIEYAN](https://github.com/PRIEYAN)、[@rubyycheung](https://github.com/rubyycheung)、[@trakshan-mishra](https://github.com/trakshan-mishra)、[@yyq1025](https://github.com/yyq1025)。

逐包完整说明见 [Astryx v0.6.0 发布页](https://github.com/meta/astryx/releases/tag/v0.6.0)。
