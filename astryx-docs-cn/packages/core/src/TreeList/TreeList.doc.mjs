// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Tree list',
    required: true,
    description: '呈现层级树的容器。',
  },
  {
    name: 'Header',
    required: false,
    description: '调用方提供的、为树显示命名的内容。',
  },
  {
    name: 'Item',
    required: true,
    description: '层级中一个节点对应的渲染行。',
  },
  {
    name: 'Chevron',
    required: false,
    description:
      '为带子节点的 Item 渲染的展开/收起控件。',
  },
  {
    name: 'Chevron glyph',
    required: false,
    description: 'Chevron 内由 Icon 渲染的方向符号。',
  },
  {
    name: 'Item label',
    required: true,
    description: '标识 Item 的主要内容。',
  },
  {
    name: 'Item description',
    required: false,
    description: '渲染在 Item 标签下方的次要文本。',
  },
  {
    name: 'Start content',
    required: false,
    description: '渲染在 Item 标签之前、由调用方提供的内容。',
  },
  {
    name: 'End content',
    required: false,
    description: '渲染在 Item 标签之后、由调用方提供的内容。',
  },
  {
    name: 'Guide',
    required: false,
    description: '展示父子关系的连接线。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  category: 'Table & List',
  keywords: ['tree', 'hierarchy', 'nested', 'accordion', 'folder', 'expand', 'collapse', 'treeview', 'outline', '树形', '层级', '展开', '折叠'],
  playground: {
    defaults: {
      items: [
        {id: '1', label: 'Documents', children: [
          {id: '1a', label: 'Report.pdf'},
          {id: '1b', label: 'Notes.md'},
        ]},
        {id: '2', label: 'Images', children: [
          {id: '2a', label: 'Photo.jpg'},
        ]},
        {id: '3', label: 'README.md'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-tree-list', visualProps: ['density', 'variant']},
      {className: 'astryx-tree-list-item', visualProps: ['density'], states: ['selected', 'disabled']},
      {className: 'astryx-tree-list-chevron', states: ['state']},
      {className: 'astryx-tree-list-item-label', states: ['selected']},
      {className: 'astryx-tree-list-guide'},
    ],
    vars: [
      {name: '--tree-list-indent', description: '每级缩进步长。每个嵌套层级的行按此距离缩进，引导线随之保持对齐。在 `tree-list` 目标上设置以调整该度量 (如用 `var(--spacing-5)` 获得更宽缩进)。', default: 'var(--spacing-4)'},
      {name: '--tree-list-row-gap', description: '相邻行之间的垂直间距。默认 `2px` (var(--spacing-0-5)) 提供细微分隔；在 `tree-list` 目标上设置以加宽或收拢间距。连接引导线会自动跨越该间距 (线保持连续) 且不超出最后一行，无需调整引导线高度。', default: 'var(--spacing-0-5)'},
      {name: '--_tree-indent', description: '单行缩进距离，按行由 --tree-list-indent 与行深度计算得出。调整缩进请设置 --tree-list-indent；此为解析后的值。', default: '0px', private: true},
      {name: '--_tree-focus-z', description: '行在其 treeitem 获得键盘焦点期间的层叠顺序，由每个 treeitem 发布，使聚焦行绘制在引导线之上。不是主题定制杠杆。', default: 'auto', private: true},
    ],
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description:
        '树列表容器。接受 items 数据与渲染配置。展开状态在内部管理。',      props: [
        {
          name: 'items',
          type: 'TreeListItemData[]',
          description:
            '递归树项数据：含 id、label、可选 children 与 isExpanded，以及应用到该项行的可选 xstyle、className、style。',
          required: true,
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '项目的间距密度。',
          default: "'balanced'",
        },
        {
          name: 'variant',
          type: "'lineGuides' | 'noGuides'",
          description:
            '层级引导线的视觉处理。lineGuides 显示连接线；noGuides 隐藏连接线、保留缩进。与 density 正交。',
          default: "'lineGuides'",
        },
        {
          name: 'animatedLayout',
          type: 'AnimatedLayout',
          description:
            'useAnimatedLayout({containerRef}) 返回的句柄。传入后，展开或收起一行时，该行之后直到该容器内的行与内容会以同一个共享动效角色平滑移动而非跳动，新显示的行与箭头也走同一动效。不传时，该行之后的内容立即就位。',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            '标题内容，通过 aria-labelledby 与树关联。',
          slotElements: [{__element: 'Text', props: {type: 'body'}, children: 'Header'}],
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      '带分支连接线的可展开树结构，用于展示层级数据。适用于文件管理器、嵌套分类浏览，或任何需要呈现父子关系的界面。手指操作下，展开一行时其下方行平滑滑动、子项以同一时序淡入，收起时反向回放；传入 `animatedLayout` 句柄可让树之后的内容也一起平滑移动。',
    bestPractices: [
      {guidance: true, description: '为每个节点提供有意义的标签与图标，让层级易于扫读。'},
      {guidance: true, description: '预展开重要分支，让用户立刻看到关键内容。'},
      {guidance: true, description: '只要树中存在任何可展开项，叶子行就会为箭头列预留对齐空间；只有完全扁平的树 (没有任何可展开项) 才会贴边渲染各行。请依赖这一机制，而不是用自定义 CSS 微调缩进。'},
      {guidance: false, description: '不要嵌套超过 4–5 层；压平结构或改用其他模式。'},
      {guidance: false, description: '不要用树展示扁平的非层级数据；请改用 List。'},
    ],
  },
};

// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'TreeList',
  displayName: 'Tree List',
  group: 'TreeList',
  theming: {
    targets: [
      {className: 'astryx-tree-list', visualProps: ['density', 'variant']},
      {className: 'astryx-tree-list-item', visualProps: ['density'], states: ['selected', 'disabled']},
      {className: 'astryx-tree-list-chevron', states: ['state']},
      {className: 'astryx-tree-list-item-label', states: ['selected']},
      {className: 'astryx-tree-list-guide'},
    ],
    vars: [
      {name: '--tree-list-indent', description: '每级缩进步长。每个嵌套层级的行按此距离缩进，引导线随之对齐。在 `tree-list` 目标上设置以调整该度量（例如用 `var(--spacing-5)` 获得更宽的缩进）。', default: 'var(--spacing-4)'},
      {name: '--tree-list-row-gap', description: '相邻行之间的垂直间距。默认 `2px`（var(--spacing-0-5)）提供细微的分隔；在 `tree-list` 目标上设置以加宽或关闭间距。连接引导线会自动跨越该间距（线保持连续）且不会超出最后一行，因此无需调整引导线高度。', default: 'var(--spacing-0-5)'},
    ],
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description:
        '树列表容器。接受 items 数据和渲染配置。展开状态在内部管理。',
      props: [
        {
          name: 'items',
          type: 'TreeListItemData[]',
          description:
            '递归树项数据。每项有 id、label、可选 children 数组和可选 isExpanded 布尔值用于设置初始状态。',
          required: true,
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '项目的间距密度。',
          default: "'balanced'",
        },
        {
          name: 'variant',
          type: "'lineGuides' | 'noGuides'",
          description:
            '层级引导线的视觉呈现。lineGuides 显示连接线；noGuides 隐藏连接线并保留缩进。与 density 正交。',
          default: "'lineGuides'",
        },
        {
          name: 'animatedLayout',
          type: 'AnimatedLayout',
          description:
            'useAnimatedLayout({containerRef}) 返回的句柄。传入后，展开或收起一行时，该行之后直到该容器内的行和内容会以同一个共享动效角色平滑移动，而不是跳动；新显示的行和箭头也使用同一动效。不传时，该行之后的内容会立即就位。',
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            '标题内容，通过 aria-labelledby 与树关联。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'An expandable tree structure for displaying hierarchical data with branch connector lines. Use it for file explorers, nested category browsers, or any interface that visualizes parent-child relationships.',
    bestPractices: [
      {guidance: true, description: 'Provide meaningful labels and icons for each node to make the hierarchy easy to scan.'},
      {guidance: true, description: 'Pre-expand important branches so users see key content immediately.'},
      {guidance: true, description: 'Leaf rows reserve space for a chevron column whenever the tree has any expandable item to line up under; only a fully flat tree (no expandable items at all) renders its rows flush. Rely on this rather than nudging indentation with custom CSS.'},
      {guidance: false, description: 'Nest more than 4–5 levels deep; flatten the structure or use a different pattern.'},
      {guidance: false, description: 'Use a tree for flat, non-hierarchical data; use a List instead.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '面向层级数据的数据驱动树列表：支持展开/收起、分支线与可交互项。扁平 items 数组 + 递归 children，无组合、无 cloneElement。',
  usage: {
    anatomy,
    description:
      '带分支连接线的可展开树结构，展示层级数据。用于文件管理器、嵌套分类浏览或任何呈现父子关系的界面。',
    bestPractices: [
      {guidance: true, description: '为每个节点提供有意义的标签与图标，让层级易于扫读。'},
      {guidance: true, description: '预展开重要分支，让用户立刻看到关键内容。'},
      {guidance: true, description: '树中存在任何可展开项时，叶子行会为箭头列预留对齐空间；只有完全扁平的树才贴边渲染各行。依赖这一机制，不要用自定义 CSS 微调缩进。'},
      {guidance: false, description: '不要嵌套超过 4–5 层；压平结构或改用其他模式。'},
      {guidance: false, description: '不要用树展示扁平的非层级数据；请改用 List。'},
    ],
  },
  propDescriptions: {
    items: '递归树项数据：id、label、可选 children + isExpanded，及其行上的可选 xstyle/className/style。',
    density: '项目间距密度。',
    variant: '引导线处理：lineGuides 显示连接线，noGuides 隐藏 (保留缩进)。与 density 正交。',
    animatedLayout: 'useAnimatedLayout({containerRef}) 的句柄；展开/收起以共享动效角色平滑移动该容器内该行之后的内容。省略：之后内容瞬间就位。',
    header: '标题内容，经 aria-labelledby 关联到树。',
    xstyle: '布局 StyleX 样式。必须是 stylex.create() 值。',
  },
  components: [
    {
      name: 'TreeList',
      displayName: 'Tree List',
      description: '树列表容器。接受 items 数据 + 渲染配置。展开在内部管理。',
      propDescriptions: {
        items: '递归树项数据：id、label、可选 children + isExpanded，及其行上的可选 xstyle/className/style。',
        density: '项目间距密度。',
        variant: '引导线处理：lineGuides 显示连接线，noGuides 隐藏 (保留缩进)。与 density 正交。',
        header: '标题内容，经 aria-labelledby 关联到树。',
        xstyle: '布局 StyleX 样式。必须是 stylex.create() 值。',
      },
    },
  ],
};
