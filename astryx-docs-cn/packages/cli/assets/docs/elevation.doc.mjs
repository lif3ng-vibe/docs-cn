// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'elevation',
  title: '阴影层级',
  category: 'foundations',
  description:
    '用于视觉层级与内嵌状态环的阴影令牌。',
  tokenCategory: 'shadow',

  sections: [
    {
      title: '概览',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '层级令牌通过 box-shadow 营造深度。三个级别（low、med、high）为浮动元素建立视觉层级。内嵌阴影为交互组件提供焦点环与选中环。',
        },
      ],
    },
    {
      title: '层级刻度',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '每个级别都有更强的偏移与扩散。阴影颜色通过 light-dark() 自动适配深色模式。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Shadow Tokens',
        },
      ],
    },
    {
      title: '选择级别',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '按表面离页面多远来选级别，而不是按你想要多少阴影。层级编码的是堆叠顺序：级别越高，表面在 UI 上层叠的内容越多。每个表面只用一个级别，且只有当表面确实位于其他内容之上时，才把它抬到 `none` 之上。',
        },
        {
          type: 'table',
          headers: ['级别', '何时使用', '示例'],
          rows: [
            [
              'none',
              '组件扁平并嵌入表面之中；它是页面的一部分，而非层叠其上。这是除 ChatComposer 外所有表面的默认值。',
              '网格中的 Card、内联 Banner、标准 Button',
            ],
            [
              'low',
              '组件处于正常页面流中，但应与背景区分开。用于强调，或把组件与身后的表面分离；组件仍在页面上，并不悬浮于其他内容之上。',
              '需要强调的凸起 Card、ChatComposer',
            ],
            [
              'med',
              '组件盖在同页的其他内容之上；它浮在邻近元素上方，但不覆盖整个屏幕。',
              'Popover、浮动 Banner、浮动操作 Button',
            ],
            [
              'high',
              '组件覆盖整个 UI；它是最顶层，通常带有背板或从其余一切夺取焦点。',
              '模态 Dialog、全屏覆盖表面',
            ],
          ],
        },
        {
          type: 'prose',
          text: '若两个表面重叠，位于上方的取更高级别。若表面不与任何内容重叠，就是 `none` 或 `low`；绝不会是 `med` 或 `high`。',
        },
      ],
    },
    {
      title: 'elevation prop',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '可配置的表面只暴露一个 `elevation` prop，而不是让使用者手写 box-shadow。它接受分级枚举 `none | low | med | high`，并按组件收窄到该表面所需的档位：Card、ClickableCard、SelectableCard、Button、IconButton、ButtonGroup、ToggleButton 与 Banner 暴露完整刻度，而 ChatComposer 只暴露 `none | low`。`none` 是扁平字面量（`box-shadow: none`）；其余级别映射到上面的 `--shadow-*` 令牌，因此表面保持主题无关。',
        },
        {
          type: 'prose',
          text: 'prop 默认值保持现有外观：除 ChatComposer 外每个表面默认 `none`，ChatComposer 默认 `low` 以保持其凸起外观。设置 `elevation="none"` 可将其压平；扁平的输入区会绘制边框，静止/悬停/焦点三种状态的处理与文本输入框一致。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用 elevation prop 抬升表面',
          code: `import {Plus} from 'lucide-react';

// Flat by default; raise only when the surface needs to float.
<Card elevation="low">Raised card</Card>

// A floating action button.
<IconButton icon={<Icon icon={Plus} />} label="New" variant="primary" elevation="med" />

// Flatten the composer (defaults to 'low').
<ChatComposer elevation="none" onSubmit={handleSubmit} />`,
        },
        {
          type: 'prose',
          text: '始终浮动的表面没有 prop：固有浮层（Dialog、Popover、Tooltip、Toast、HoverCard、DropdownMenu 以及组合它们的组件）把层级写死在内部，从不暴露该 prop。流式内容（输入框、Text、布局）永不抬升；输入字段使用内嵌环，那是与层级相互独立的概念。',
        },
      ],
    },
    {
      title: '用法',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: '构建自定义表面时，从令牌刻度读取层级，而不是手写阴影；也就是 elevation prop 解析到的那组令牌。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '应用层级',
          code: `import {shadowVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  dropdown: {
    boxShadow: shadowVars['--shadow-med'],
  },
  dialog: {
    boxShadow: shadowVars['--shadow-high'],
  },
  inputFocused: {
    boxShadow: shadowVars['--shadow-inset-selected'],
  },
});`,
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
            '在可配置表面上优先使用 `elevation` prop，再考虑手写任何自定义阴影。',
            '按表面离页面的远近选级别：扁平/嵌入用 `none`，在流中但需区分用 `low`，盖住页面内容用 `med`，覆盖整个 UI 用 `high`。见“选择级别”。',
            '输入焦点/选中状态用内嵌阴影；它们比 outline 组合性更好。',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            '在应用代码里手写 `box-shadow`；应设置 `elevation` prop 或读取 `shadowVars`。',
            '抬升并不位于其他内容之上的表面；不重叠的表面是 `none` 或 `low`，绝不是 `med` 或 `high`。',
            '在同一元素上堆叠多个层级。',
            '用层级阴影做装饰性边框。应改用 --color-border 令牌。',
          ],
        },
      ],
    },
  ],
};
