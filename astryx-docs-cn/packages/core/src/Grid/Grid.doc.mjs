// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Grid container',
    required: true,
    description:
      '按行和列排布调用方条目的二维布局容器。',
  },
  {
    name: 'Spanning item',
    required: false,
    description:
      '可选的 GridSpan 包装器，改变单个条目的列或行参与方式。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Grid',
  displayName: 'Grid',
  group: 'Layout',
  category: 'Layout',
  keywords: ["grid","columns","responsive","auto-fill","auto-fit","masonry","tiles","row","col","simplegrid","responsive grid","card grid","网格","栅格","响应式","列","行","卡片网格"],
  usage: {
    anatomy,
    description:
      '用于按行和列排布子元素的 CSS grid 布局容器。卡片画廊、仪表盘和任何多列布局都用 Grid。需要在小屏幕上重排的列数，使用 `columns={{minWidth, max}}`；数字 `columns` 在所有宽度下都是精确的 N 列，从不重排。',
    bestPractices: [
      { guidance: true, description: '必须在手机上可用时默认用响应式列：`columns={{minWidth: 240, max: 4}}` 渲染最多 4 列，每列至少 240px，窄屏时降为单个全宽列。' },
      { guidance: false, description: '必须在小屏幕上工作的行不要用 `columns={4}`；数字从不重排，在手机上会渲染出四条窄轨道。数字留给必须固定的行，如一周 7 天。' },
      { guidance: true, description: '始终把 `minWidth` 与 `max` 搭配：`max` 限制宽屏下的列数上限，并允许最后一列在窄容器中收缩；只用 `{minWidth}` 会在窄于 `minWidth` 的手机上溢出。' },
      { guidance: true, description: '为了一致的条目宽度使用 `repeat: \'fill\'`（默认）；需要条目拉伸填满剩余空间时用 `\'fit\'`。' },
      { guidance: false, description: '不要手写 CSS grid；Grid 已为你处理间距和响应式行为。' },
      { guidance: false, description: '不要用 `HStack` 换行来做网格；请改用 Grid。' },
      { guidance: true, description: '轨道模板使用 CSS 变量间接引用（不是原始内联样式），因此 `xstyle` 对 `gridTemplateColumns` 的覆盖（包括 `@media` 查询内）会生效。' },
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-grid', visualProps: ['align', 'columns', 'gap', 'justify']},
      {className: 'astryx-grid-span'},
    ],
  },
  playground: {
    defaults: {
      columns: 3,
      gap: 2,
      children: [
        {__element: 'Card', props: {padding: 4}, children: '条目 1'},
        {__element: 'Card', props: {padding: 4}, children: '条目 2'},
        {__element: 'Card', props: {padding: 4}, children: '条目 3'},
      ],
    },
  },
  description: '固定或响应式列数的网格容器；`{minWidth, max}` 会重排，数字从不重排。',
  props: [
    {
      name: 'columns',
      type: "number | {minWidth: number, max?: number, repeat?: 'fill' | 'fit'}",
      description: '列配置。数字在所有宽度下都精确创建 N 条 `1fr` 轨道且从不重排（如 `columns={3}`）；子项的最小内容可能加宽其轨道。需要小屏幕重排的列数用 `{minWidth, max}`。响应式列使用对象：`minWidth` 设置最小列宽（px），`repeat` 控制轨道行为（`"fill"` 保留空轨道以保持等宽，`"fit"` 折叠空轨道让条目拉伸；默认 `"fill"`），`max` 限制最大列数。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: '容器宽度。数字按像素处理，字符串原样使用。',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: '容器高度。数字按像素处理，字符串原样使用。',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: '容器最大宽度。数字按像素处理，字符串原样使用。',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: '容器最小高度。数字按像素处理，字符串原样使用。',
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '所有条目之间的间距。',
    },
    {
      name: 'rowGap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '行间距；在行轴上覆盖 `gap`。',
    },
    {
      name: 'columnGap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '列间距；在列轴上覆盖 `gap`。',
    },
    {
      name: 'rowHeight',
      type: 'number',
      description:
        '每条隐式行轨道的高度（像素）。与 `GridSpan rows={N}` 搭配可实现瀑布流式布局。',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end' | 'stretch'",
      description:
        '条目的垂直对齐（`align-items`）。不设置时保留浏览器默认值 `normal`，会把没有自然尺寸或宽高比的条目拉伸。',
    },
    {
      name: 'justify',
      type: "'start' | 'center' | 'end' | 'stretch'",
      description:
        '条目的水平对齐（`justify-items`）。不设置时保留浏览器默认值 `normal`，会把没有自然尺寸或宽高比的条目拉伸。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '网格内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  components: [
    {name: 'GridSpan'},
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    anatomy,
    description:
      'A CSS grid layout container for arranging children in rows and columns. Use Grid for card galleries, dashboards, and any multi-column layout. For columns that reflow on small screens, use `columns={{minWidth, max}}`; a numeric `columns` is exactly N columns at every width and never reflows.',
    bestPractices: [
      { guidance: true, description: 'Default to responsive columns for anything that must survive a phone: `columns={{minWidth: 240, max: 4}}` renders at most 4 columns, each at least 240px, and drops to one full-width column when narrow.' },
      { guidance: false, description: 'Use `columns={4}` for a row that must work on small screens; a number never reflows and renders four narrow tracks on a phone. Reserve numbers for rows that must stay fixed, such as a 7-day week.' },
      { guidance: true, description: 'Always pair `minWidth` with `max`: `max` caps the count on wide screens and lets the last column shrink to a narrow container; `{minWidth}` alone overflows a phone narrower than `minWidth`.' },
      { guidance: true, description: 'Use `repeat: \'fill\'` (the default) for consistent item widths. Use `\'fit\'` when items should stretch to fill leftover space.' },
      { guidance: false, description: 'Write manual CSS grid; Grid handles spacing and responsive behavior for you.' },
      { guidance: false, description: 'Use `HStack` with wrapping for grids; use Grid instead.' },
      { guidance: true, description: 'Track templates use CSS-variable indirection (not raw inline styles), so `xstyle` overrides of `gridTemplateColumns` (including inside `@media` queries) take effect.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '基于 CSS Grid 的布局，支持响应式列数。',
  usage: {
    anatomy,
    description: '用于按行和列排布子元素的 CSS grid 布局容器。卡片画廊、仪表盘和任何多列布局都用 Grid。需要在小屏幕上重排的列数，使用 `columns={{minWidth, max}}`；数字 `columns` 在所有宽度下都是精确的 N 列，从不重排。',
    bestPractices: [
      { guidance: true, description: '必须在手机上可用时默认用响应式列：columns={{minWidth: 240, max: 4}} = 最多 4 列，每列 >= 240px，窄屏时单个全宽列。' },
      { guidance: false, description: '必须在小屏工作的行不要用 columns={4}；数字从不重排（手机上 4 条窄轨道）。数字只留给必须固定的行，如一周 7 天。' },
      { guidance: true, description: '始终把 minWidth 与 max 搭配：max 限制宽屏列数上限，并让最后一列在窄容器中收缩；只用 {minWidth} 会在窄于 minWidth 的手机上溢出。' },
      { guidance: true, description: '为了一致的条目宽度使用 repeat: \'fill\'（默认）；需要条目拉伸填满剩余空间时用 \'fit\'。' },
      { guidance: false, description: '不要手写 CSS grid；Grid 已为你处理间距和响应式行为。' },
      { guidance: false, description: '不要用 HStack 换行做网格；请改用 Grid。' },
      { guidance: true, description: '轨道模板使用 CSS 变量间接引用而非内联样式，因此 xstyle/@media 对 gridTemplateColumns 的覆盖会生效。' },
    ],
  },
};
