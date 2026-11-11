// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'List',
    required: true,
    description: '当前可见内容的水平列表容器。',
  },
  {
    name: 'Items',
    required: true,
    description:
      '由当前宽度与数量限制选出可见显示的调用方条目。',
  },
  {
    name: 'Overflow indicator',
    required: false,
    description:
      '针对因宽度或数量限制而折叠的条目，由调用方渲染的可选指示器。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'OverflowList',
  displayName: 'Overflow List',
  category: 'Table & List',
  keywords: [
    'overflow',
    'truncate',
    'collapse',
    'breadcrumb',
    'toolbar',
    'tag-list',
    'pill-list',
    'more',
    'clamp',
    'responsive',
    '溢出',
    '折叠',
    '面包屑',
    '工具栏',
  ],
  playground: {
    // children is required; without seeded items the properties-tab preview
    // renders an empty list. Provide a few items so the preview is meaningful.
    // `observeParent` measures the (full-width) preview container instead of
    // the list's own collapsed content box, so the row shows all items rather
    // than collapsing to one.
    defaults: {
      behavior: 'observeParent',
      children: [
        {__element: 'Button', props: {label: '概览', variant: 'secondary'}},
        {__element: 'Button', props: {label: '动态', variant: 'secondary'}},
        {__element: 'Button', props: {label: '设置', variant: 'secondary'}},
        {__element: 'Button', props: {label: '成员', variant: 'secondary'}},
        {__element: 'Button', props: {label: '账单', variant: 'secondary'}},
      ],
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '要渲染的条目。每个子元素应为单一元素。',
      required: true,
    },
    {
      name: 'overflowRenderer',
      type: '(overflowItems: OverflowItem[]) => ReactNode',
      description:
        '溢出指示器的渲染函数。接收隐藏条目列表（每项含 child 与 index）。仅在有条目溢出时调用。',
    },
    {
      name: 'onOverflowChange',
      type: '(overflowItems: OverflowItem[]) => void',
      description:
        '折叠集合变化时调用：有内容折叠时传入折叠条目，行重新变宽、全部放得下时传入空数组。成员与顺序变化即使数量不变也会上报；无关的重渲染与回调标识变化不会。无溢出时保持静默，包括挂载时。动态条目请使用稳定的 React key。',
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '条目间距，使用间距令牌步进值（0、0.5、1、1.5、2、3、4、5、6、8、10）。',
      default: '2',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      description:
        '即使溢出也始终显示的最小条目数。',
      default: '0',
    },
    {
      name: 'maxVisibleItems',
      type: 'number',
      description:
        '最多显示的条目数（即使全部都放得下）。它是 minVisibleItems 的上限伙伴；多余条目折叠进溢出指示器。若小于 minVisibleItems，则以下限为准。',
      default: 'undefined (no cap)',
    },
    {
      name: 'maxRows',
      type: 'number',
      description:
        '在把其余条目折叠进溢出指示器之前，允许条目换行到的最大行数。是数字而非布尔值。单行行为请留 undefined（或设 1）。假定行高一致。',
      default: 'undefined (single line)',
    },
    {
      name: 'collapseFrom',
      type: "'start' | 'end'",
      description: '溢出时从哪一端开始折叠条目。',
      default: "'end'",
    },
    {
      name: 'behavior',
      type: "'observeSelf' | 'observeParent'",
      description:
        "控制测量哪个元素的可用宽度。'observeSelf' 使用容器自身宽度。'observeParent' 观察父元素，适用于列表需保持内容尺寸但仍要探测可用空间的场景。",
      default: "'observeSelf'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-overflow-list'}],
  },
  usage: {
    anatomy,
    description:
      '超过可用宽度时自动隐藏条目的水平列表。OverflowList 用于面包屑、工具栏、标签列表，或任何需要在较小尺寸下优雅折叠的行。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供有意义的 overflowRenderer："再显示 N 项"徽章、下拉菜单或计数指示器。',
      },
      {
        guidance: true,
        description:
          '当该行已有自己的菜单时，用 onOverflowChange 把折叠条目喂给它，而不是用 overflowRenderer 再加第二个锚点。',
      },
      {
        guidance: true,
        description:
          '设置 minVisibleItems 保持关键条目可见，设置 maxVisibleItems 让行无论可用宽度多少都封顶在固定数量。',
      },
      {
        guidance: true,
        description:
          '用 maxRows 让条目在折叠进指示器之前换行到有限的行数（例如两行标签云）。',
      },
      {
        guidance: false,
        description:
          '不要把 OverflowList 用于纵向堆叠；经 maxRows 支持水平多行换行，但条目仍从左到右排列，而非从上到下。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'OverflowList',
  displayName: 'Overflow List',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '要渲染的项目，每个子元素应为单一元素。',
      required: true,
    },
    {
      name: 'overflowRenderer',
      type: '(overflowItems: OverflowItem[]) => ReactNode',
      description:
        '溢出指示器的渲染函数。接收隐藏项目列表（每项包含 child 和 index）。仅在有溢出项时调用。',
    },
    {
      name: 'onOverflowChange',
      type: '(overflowItems: OverflowItem[]) => void',
      description:
        '折叠项集合变化时调用：发生折叠时传入折叠项，行重新变宽、全部放得下时传入空数组。没有溢出时（包括挂载时）不会调用。用于将折叠项交给周围界面已有的菜单，避免列表再挂载一个自己的指示器。',
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '项目间距，使用间距步进值（0、0.5、1、1.5、2、3、4、5、6、8、10）。',
      default: '2',
    },
    {
      name: 'minVisibleItems',
      type: 'number',
      description: '溢出时始终显示的最小项目数。',
      default: '0',
    },
    {
      name: 'maxVisibleItems',
      type: 'number',
      description:
        '始终显示的最大项目数（即使全部都能放下）。它是 minVisibleItems 的上限伙伴；多余项目会折叠进溢出指示器。若小于 minVisibleItems，则以下限为准。',
      default: 'undefined（无上限）',
    },
    {
      name: 'maxRows',
      type: 'number',
      description:
        '在将其余项目折叠进溢出指示器之前，允许项目换行到的最大行数。是数字而非布尔值。留空（或设为 1）表示单行。假定行高一致。',
      default: 'undefined（单行）',
    },
    {
      name: 'collapseFrom',
      type: "'start' | 'end'",
      description: '溢出时从哪一端开始折叠项目。',
      default: "'end'",
    },
    {
      name: 'behavior',
      type: "'observeSelf' | 'observeParent'",
      description:
        "控制测量可用宽度的元素。'observeSelf' 使用容器自身宽度；'observeParent' 观察父元素，适用于需要内容尺寸但仍检测可用空间的场景。",
      default: "'observeSelf'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须使用 stylex.create() 的值，而非内联样式对象。',
    },
  ],
  usage: {
    anatomy,
    description:
      'A horizontal list that automatically hides items when they exceed the available width. Use OverflowList for breadcrumbs, toolbars, tag lists, or any row that needs to collapse gracefully at smaller sizes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a meaningful overflowRenderer: a "+N more" badge, a dropdown, or a count indicator.',
      },
      {
        guidance: true,
        description:
          'When the row already has its own menu, use onOverflowChange to feed the collapsed items into it instead of adding a second anchor with overflowRenderer.',
      },
      {
        guidance: true,
        description:
          'Set minVisibleItems to keep key items visible, and maxVisibleItems to cap the row at a fixed count regardless of available width.',
      },
      {
        guidance: true,
        description:
          'Use maxRows to let items wrap onto a bounded number of rows (e.g. a two-row tag cloud) before collapsing the rest into the indicator.',
      },
      {
        guidance: false,
        description:
          'Use OverflowList for a vertical stack; horizontal multi-row wrap is supported via maxRows, but items still flow left-to-right, not top-to-bottom.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带溢出指示器的水平列表：隐藏超出容器宽度的条目',
  usage: {
    anatomy,
    description:
      '超过可用宽度时自动隐藏条目的水平列表。OverflowList 用于面包屑、工具栏、标签列表，或任何需要在较小尺寸下优雅折叠的行。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供有意义的 overflowRenderer："再显示 N 项"徽章、下拉菜单或计数指示器。',
      },
      {
        guidance: true,
        description:
          '当该行已有自己的菜单时，用 onOverflowChange 把折叠条目喂给它，而不是用 overflowRenderer 再加第二个锚点。',
      },
      {
        guidance: true,
        description:
          '设置 minVisibleItems 保持关键条目可见，设置 maxVisibleItems 让行无论可用宽度多少都封顶在固定数量。',
      },
      {
        guidance: true,
        description:
          '用 maxRows 让条目在折叠进指示器之前换行到有限的行数（例如两行标签云）。',
      },
      {
        guidance: false,
        description:
          '不要把 OverflowList 用于纵向堆叠；经 maxRows 支持水平多行换行，但条目仍从左到右排列，而非从上到下。',
      },
    ],
  },
  propDescriptions: {
    children: '要渲染的条目，每个子元素应为单一元素',
    overflowRenderer:
      '渲染溢出指示器，接收带 index 的隐藏条目',
    onOverflowChange:
      '成员/顺序变化时携带折叠条目触发（行重新放得下时为空数组）；忽略无关渲染/回调标识变化；动态条目需稳定的 React key',
    gap: '条目间距，使用间距步进值',
    minVisibleItems: '溢出时也始终显示的最小条目数',
    maxVisibleItems:
      '最多显示的条目数（上限）；多余条目折叠进指示器；小于下限时以下限为准',
    maxRows:
      '条目换行到最多 N 行后折叠其余（数字，非布尔）；undefined = 单行',
    collapseFrom: '从哪一端开始折叠',
    behavior:
      'observeSelf（默认）或 observeParent，用于内容尺寸容器',
    xstyle: 'StyleX 样式，只能用 stylex.create() 值',
  },
};
