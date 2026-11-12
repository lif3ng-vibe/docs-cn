// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'motion',
  title: '动效',
  category: 'foundations',
  description:
    '用于动画与过渡的时长与缓动令牌。',
  tokenCategory: 'duration',

  sections: [
    {
      title: '概览',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '动效服务于两个目的：让界面更易理解，也让它用起来更愉悦。面板动画展开能帮助视线追踪什么发生了变化、新内容落在布局的哪里。这些时刻降低认知负担，让界面显得反应灵敏。',
        },
        {
          type: 'prose',
          text: "与此同时，调校得当的动效会给应用一种用户能察觉的精致与打磨感——即便他们说不出个所以然。",
        },
        {
          type: 'prose',
          text: '设计系统提供时长与缓动令牌，让这些时刻在你的应用中保持一致。',
        },
      ],
    },
    {
      title: '时长',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '九个时长令牌，分快、中、慢三个档带，另有 `--duration-exit`——标准的关闭时长，跟随 `--duration-fast`。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Duration Tokens',
        },
      ],
    },
    {
      title: '缓动',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "四条缓动曲线。`--ease-standard` 减速，用于状态变化。`--ease-entrance` 用于到来的元素，`--ease-move` 用于在屏幕上移动的元素；主题的 `character` 同时设定这两者，在 `standard` 时它们等于 `--ease-standard`。`--ease-exit` 加速，用于离开的元素：它从静止起步、快速离场，因此移动在整个时长内始终可见，且在每个 `character` 下都相同。",
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Easing Tokens',
        },
      ],
    },
    {
      title: '动效的用武之地',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '界面的某些部分得益于动画。面板、对话框与可折叠区块在瞬间出现时会让人迷失方向，动画给了视线一个跟随的轨迹。Toast 与通知只需恰到好处的入场，让人注意到而不受惊吓。开关翻转、选中高亮这类状态变化，加上简短的过渡会显得更有意图。',
        },
        {
          type: 'prose',
          text: '共同点是：这些都是用户需要理解发生了什么的时刻。',
        },
      ],
    },
    {
      title: '动效的帮倒忙之处',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "表格行悬停。列表项高亮。任何用户每分钟要做几十次的操作。给这些交互加上可感知的时长，会让界面像是在追赶光标。让它们快到用户永远察觉不到延迟。",
        },
        {
          type: 'prose',
          text: '阻塞交互的动画更糟。如果用户必须等面板滑完才能点击其中的内容，动画就成了障碍。动效绝不该挡在用户与下一步操作之间。',
        },
      ],
    },
    {
      title: '运动原则',
  category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            "并非所有东西都需要退场动画。用户正在离开的元素——工具提示、悬停卡片、下拉菜单——可以瞬间消失。用户的注意力早已转移。只有当退场动画有助于用户定向时才做动画，比如面板收起、对话框关闭以露出下方内容。",
            '既然要做退场动画，就让它与入场匹配。从右侧滑入的面板应滑回右侧退出。',
            '方向应与操作匹配。向内容深处导航应感觉在前进，返回应感觉在归位。这能让用户在应用结构中始终有方向感。',
            "上下文 UI 应与它的触发器浑然一体。下拉菜单应从打开它的按钮处展开。弹出层应出现在它所描述的元素附近。命令面板、Toast 这类全局 UI 不在此列，它们有自己固定的位置。",
          ],
        },
      ],
    },
    {
      title: '尊重用户偏好',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '部分用户对动效敏感；一个人眼中的精致动画，可能让另一个人不适。当操作系统的减弱动效设置开启时，Astryx 组件在鼠标或触控板下即刻切换；在手指触摸下则以交叉淡入淡出替代移动：仅改变不透明度，200 ms 以内。原地变化的值，如进度填充，在任何指针下都立即取新值。你自己的动画也用 `@media (prefers-reduced-motion: reduce)` 做同样处理，触摸交叉淡入淡出再加上 `(pointer: coarse)`。',
        },
      ],
    },
    {
      id: 'usage',
      title: '用动效令牌做动画',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "从动效令牌设置过渡时长与缓动，这样主题重调动效时，你的动画也随之重调。到来的元素用 `--ease-entrance`，在屏幕上移动的元素用 `--ease-move`（跟随主题的 `character`），离开的元素用 `--ease-exit`（在每个 `character` 下保持不变）。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '应用动效令牌',
          code: `import {durationVars, easeVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  fadeIn: {
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  slideUp: {
    transitionProperty: 'transform, opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-entrance'],
  },
});`,
        },
      ],
    },
    {
      id: 'theme-motion',
      title: '从主题调整动效',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: "主题用 `defineTheme` 的 `motion` 里两个旋钮决定动效手感。它们驱动 CSS 动效令牌，`tempo` 还为触摸动效的弹簧计时；这些弹簧暂不跟随 `character`。每个主题都遵循个人的减弱动效设置；没有主题会放松它。",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "`tempo` 缩放所有动效时长：1 是 Astryx 自身，0.75 最快，1.5 最慢（超出范围的值会被钳制）。",
            "`character` 决定动效的活泼程度：`'crisp'` 减速且不过冲，`'standard'` 是 Astryx 自身，`'expressive'` 在入场与移动时轻微过冲。退场与淡入淡出从不过冲。",
          ],
        },
        {
          type: 'code',
          lang: 'ts',
          label: '更快、更利落的主题',
          code: `export const brandTheme = defineTheme({
  name: 'brand',
  motion: {tempo: 0.85, character: 'crisp'},
});`,
        },
        {
          type: 'prose',
          text: "有些动效从不跟随旋钮，因为它们追踪手指或系统：手指跟手、惯性与橡皮筋、屏幕键盘、按压模型的起始延迟、取消距离与点击闪光（其释放淡出跟随 tempo）、悬停意图延迟、手势阈值、Spinner 与 Skeleton 等忙碌指示器的循环，以及 200 ms 的减弱动效交叉淡入淡出。",
        },
        {
          type: 'prose',
          text: '优先级从低到高：旋钮，其次是时长刻度（`fast`、`medium`、`slow`、`ratio`，只作用于它设定的时长），最后是显式 `tokens`。没有 `motion` 的主题渲染结果与从前完全一致。',
        },
      ],
    },
    {
      title: '最佳实践',
  category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            '为涉及空间变化的过渡加动画：面板展开、内容扩展、元素进入屏幕。',
            '小而高频的交互用快档令牌；重排布局的较大过渡用中档令牌。',
            '尊重操作系统层面的减弱动效偏好。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "让悬停状态或高频交互显得落在用户后面。",
            '让动画拖住用户与新内容交互的时机。过渡应在下一步操作之前完成（或不阻塞它）。',
            "让元素的运动与它的来处或去向相矛盾。",
          ],
        },
      ],
    },
  ],
};
