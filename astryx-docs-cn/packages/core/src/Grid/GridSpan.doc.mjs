// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'GridSpan',
  subComponentOf: 'Grid',
  displayName: 'Grid Span',
  isHiddenFromOverview: true,
  description: '可跨越多列或多行的网格项。',
  playground: {
    wrapper: {component: 'Grid', props: {columns: 3, gap: 2}},
    defaults: {
      columns: 2,
      children: '跨越 2 列',
    },
  },
  props: [
    {
      name: 'columns',
      type: "number | 'full'",
      description:
        "要跨越的列数；使用 `'full'` 跨越所有显式列。",
    },
    {
      name: 'rows',
      type: 'number',
      description: '要跨越的行数。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于跨度包装元素的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于跨度包装元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        '应用于跨度包装元素的内联样式。设置 `columns` 或 `rows` 时，其 `grid-column` 或 `grid-row` 会替换 `style` 中的同名属性。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到跨度包装元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'GridSpan',
  isHiddenFromOverview: true,
  displayName: 'Grid Span',
  description: '可跨越多列或多行的网格项。',
  props: [
    {
      name: 'columns',
      type: "number | 'full'",
      description: "要跨越的列数；使用 `'full'` 跨越所有显式列。",
    },
    {
      name: 'rows',
      type: 'number',
      description: '要跨越的行数。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于跨度包装元素的 StyleX 样式。必须是 stylex.create() 的值，而不是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '应用于跨度包装元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        '应用于跨度包装元素的内联样式。设置 `columns` 或 `rows` 时，其 `grid-column` 或 `grid-row` 会替换 `style` 中的同名属性。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到跨度包装元素的 Ref。',
    },
  ],
};

export const docsDense = {
  name: 'GridSpan',
  displayName: 'Grid Span',
  description: '跨越多列/多行的网格项。',
  propDescriptions: {
    columns: "要跨越的列数；'full' 跨越所有显式列。",
    rows: '要跨越的行数。',
    children: '内容。',
    xstyle: '跨度包装元素上的 StyleX 样式；仅接受 stylex.create() 的值。',
    className: '跨度包装元素上的 CSS 类名。',
    style:
      '跨度包装元素上的内联样式；设置 columns/rows 会替换其 grid-column/grid-row。',
    ref: '指向跨度包装 div 的 ref。',
  },
};
