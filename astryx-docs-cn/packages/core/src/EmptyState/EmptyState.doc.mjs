// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'EmptyState',
  displayName: 'Empty State',
  category: 'Content',
  keywords: ["emptystate","empty","placeholder","nodata","noresults","blankslate","空状态","占位","无数据","无结果","插图"],
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        '在空状态内部按配置的标题级别渲染的主要信息。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        '可选的辅助文本，在标题下方提供额外上下文。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选的图标或插图，显示在标题上方；渲染为装饰性元素（aria-hidden="true"）。',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        '可选的操作按钮，显示在描述下方，默认水平排列，isCompact 为 true 时垂直堆叠。',
      slotElements: [{__element: 'Button', props: {label: 'Action', variant: 'secondary'}}],
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '仅控制渲染的 HTML 标题标签（h1-h6），使标题适配文档大纲。这是用于无障碍的语义变化，不会改变标题的视觉大小，标题大小始终固定，与级别无关。',
      default: '3',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        '启用紧凑变体，减少间距，适用于空间受限的内容区域。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  playground: {
    defaults: {
      title: 'No results found',
      description: 'Try adjusting your search or filter criteria.',
      actions: {__element: 'Button', props: {label: 'Clear filters', variant: 'secondary'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-empty-state', visualProps: ['variant']},
      {className: 'astryx-empty-state-title', visualProps: ['variant']},
      {className: 'astryx-empty-state-description', visualProps: ['variant']},
    ],
  },
  usage: {
    description: 'EmptyState 在内容区域没有数据时显示占位内容。用于空列表、零搜索结果、首次设置或已清空的收件箱。务必提供标题和下一步操作，避免用户卡住。',
    bestPractices: [
      { guidance: true, description: '提供清晰的标题和行动号召按钮，让用户知道如何继续。' },
      { guidance: true, description: '使用能强化空状态语境的插图或图标。' },
      { guidance: true, description: '空间有限的卡片或侧边栏中使用紧凑变体。' },
      { guidance: false, description: '不要让空状态没有任何引导；务必说明发生了什么、用户接下来能做什么。' },
      { guidance: false, description: '不要用 "无数据" 这类泛泛之语；具体说明什么为空、为什么。' },
      { guidance: false, description: '需要立即处理的错误信息不要用 EmptyState；请改用 Banner。' },
    ],
    anatomy: [
      {name: 'Container', required: true, description: '居中的根元素，持有间距、阅读顺序和紧凑布局变体。'},
      {name: 'Icon', required: false, description: '标题上方的视觉提示，强化语境，如零结果时的搜索图标。'},
      {name: 'Title', required: true, description: '说明什么为空的主要信息："还没有项目"而非 "无数据"。'},
      {name: 'Description', required: false, description: '补充说明为何为空或用户可以做什么的额外上下文。'},
      {name: 'Actions', required: false, description: '引导用户进行下一步的一两个按钮，如 "创建项目" 或 "清除筛选"。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'EmptyState',
  displayName: 'Empty State',
  props: [
    {
      name: 'title',
      type: 'string',
      description:
        '在空状态内部按配置的标题级别渲染主要信息。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        '可选的辅助文本，在标题下方提供额外上下文。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选的图标或插图，显示在标题上方；渲染为装饰性元素（aria-hidden="true"）。',
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        '可选的操作按钮，显示在描述下方，默认水平排列，isCompact 为 true 时垂直堆叠。',
    },
    {
      name: 'headingLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        '仅控制渲染的 HTML 标题标签（h1-h6），使标题适配文档大纲。这是用于无障碍的语义变化，不会改变标题的视觉大小，标题大小始终固定，与级别无关。',
      default: '3',
    },
    {
      name: 'isCompact',
      type: 'boolean',
      description:
        '启用紧凑变体，减少间距，适用于空间受限的内容区域。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-empty-state', visualProps: ['variant']},
      {className: 'astryx-empty-state-title', visualProps: ['variant']},
      {className: 'astryx-empty-state-description', visualProps: ['variant']},
    ],
  },
  usage: {
    description: 'EmptyState shows a placeholder when a content area has no data. Use it for empty lists, zero search results, first-time setups, or cleared inboxes. Always include a title and a next step so the user is not stuck.',
    bestPractices: [
      { guidance: true, description: 'Include a clear title and a call-to-action button so users know how to proceed.' },
      { guidance: true, description: 'Use an illustration or icon that reinforces the context of the empty state.' },
      { guidance: true, description: 'Use the compact variant inside cards or sidebars where space is limited.' },
      { guidance: false, description: 'Leave an empty state without guidance; always explain what happened and what the user can do next.' },
      { guidance: false, description: 'Use a generic message like "No data"; be specific about what is empty and why.' },
      { guidance: false, description: 'Use an EmptyState for error messages that require immediate action; use a Banner instead.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '内容区域没有数据时的占位内容：图标、标题、描述、操作按钮',
  usage: {
    description: 'EmptyState 为空列表、零搜索结果、首次设置显示占位内容。务必提供标题和下一步。',
    bestPractices: [
      { guidance: true, description: '提供清晰的标题和行动号召按钮，让用户知道如何继续。' },
      { guidance: true, description: '使用能强化空状态语境的插图或图标。' },
      { guidance: true, description: '空间有限的卡片或侧边栏中使用紧凑变体。' },
      { guidance: false, description: '不要让空状态没有任何引导；务必说明发生了什么、用户接下来能做什么。' },
      { guidance: false, description: '不要用 "无数据" 这类泛泛之语；具体说明什么为空、为什么。' },
      { guidance: false, description: '需要立即处理的错误信息不要用 EmptyState；请改用 Banner。' },
    ],
  },
  propDescriptions: {
    title: '在空状态内渲染为标题（h1-h6）的主要信息。',
    headingLevel: '仅为适配文档大纲控制 HTML 标题标签（h1-h6）；不改变标题视觉大小。',
    description: '可选的次要文本，在标题下方提供额外上下文。',
    icon: '标题上方的可选图标/插图；渲染为装饰性（aria-hidden="true"）。',
    actions: '描述下方的可选操作按钮；默认水平排列，isCompact 时垂直。',
    isCompact: '启用紧凑变体，减少间距，适用于受限区域。',
    xstyle: '布局自定义用 StyleX 样式。必须是 stylex.create() 的值。',
  },
};
