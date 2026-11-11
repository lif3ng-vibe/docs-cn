// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Pagination',
    required: true,
    description:
      '包含当前分页控件与可选每页大小选择器的导航地标。',
  },
  {
    name: 'Page-size selector',
    required: false,
    description: '选择每页显示多少条的可选 Selector。',
  },
  {
    name: 'First/last buttons',
    required: false,
    description:
      '跳转到已知首页或末页的可选 Button 控件。',
  },
  {
    name: 'Previous/next buttons',
    required: true,
    description:
      '在页面之间前进或后退的 Button 控件。',
  },
  {
    name: 'Page number button',
    required: false,
    description:
      '编号呈现中可直接选择的某一页按钮。',
  },
  {
    name: 'Ellipsis',
    required: false,
    description:
      '不相邻页码按钮之间的省略标记。',
  },
  {
    name: 'Count readout',
    required: false,
    description:
      '显示当前条目范围与总条目数的文本。',
  },
  {
    name: 'Compact readout',
    required: false,
    description: '显示当前页与总页数的文本。',
  },
  {
    name: 'Dot',
    required: false,
    description:
      '反映并切换激活页的页指示控件。',
  },
  {
    name: 'Page input label',
    required: false,
    description: '可编辑页码字段的前置可见标签。',
  },
  {
    name: 'Page input',
    required: false,
    description: '用于直接输入页码的 NumberInput。',
  },
  {
    name: 'Page input total',
    required: false,
    description: '显示已知总页数的后置文本。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Pagination',
  displayName: 'Pagination',
  category: 'Navigation',
  keywords: ["pagination","pager","paginator","pagenavigation","paging","paginate","pages","pagecontrol","分页","页码","翻页"],
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。第 1 页为首页。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description: '页码变化时调用。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(page: number) => void | Promise<void>',
      description:
        '页码变化时的异步操作。在 onChange 之后触发，并使用 React transitions 实现内置加载状态。',
    },
    {
      name: 'totalItems',
      type: 'number',
      description:
        '总条目数。用于计算页数。与 totalPages 同时提供时优先。',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        '总页数。知道页数但不知道条目数时使用。',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description:
        '当前页之后是否还有更多页。用于总数未知的游标分页。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页条目数。强制转换为正整数；非有限值回退到默认值。',
      default: '10',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description:
        '可用的每页大小选项。提供时显示每页大小选择器下拉。',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description:
        '每页大小变化时调用。自动重置到第 1 页。',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'input' | 'none'",
      description:
        "控制上一页/下一页按钮之间显示内容的视觉变体。'pages' 显示带省略号的页码按钮，'count' 显示 'X-Y of Z' 文本，'compact' 显示 'Page X of Y'（用 hasFirstLast 加首页/末页按钮），'dots' 显示点指示器，'input' 显示带前置标签的可编辑页码框（'Page [ n ] / N'），默认两侧带首页/末页按钮——该框需要一个已知总数来钳制，因此在游标/hasMore 模式下禁用；'none' 仅显示上一页/下一页按钮。",
      default: "'pages'",
    },
    {
      name: 'pageLabel',
      type: 'string',
      description:
        "'input' 变体中可编辑框前显示的名词，例如 'Page' 或 'Row'。导航始终基于页码（经 onChange）；此项只是重新标注该框。默认为本地化的 'Page'。",
    },
    {
      name: 'hasFirstLast',
      type: 'boolean',
      description:
        "是否显示首页/末页（«/»）双箭头按钮，位于上一页/下一页两侧。适用于 'input' 变体（除非设为 false 否则显示）和 'compact' 变体（仅在 true 时显示）；其他变体忽略。页数未知（游标/hasMore 分页）时省略。",
      default: "true for 'input'; false for 'compact'",
    },
    {
      name: 'step',
      type: 'number',
      description:
        '上一页/下一页按钮每次点击前进的页数。钳制在有效页码范围内，因此会越界的步进落在首页/末页。大于 1 时，按钮的无障碍名称反映跨步页数。非整数或小于 1 的值回退为 1。',
      default: '1',
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        "当前页两侧显示的页码按钮数量。仅在 variant='pages' 时生效。",
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '分页控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '组件是否禁用。',
      default: 'false',
    },
    {
      name: 'label',
      type: 'string',
      description: '导航地标的无障碍标签。',
      default: "'Pagination'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-pagination', visualProps: ['size', 'variant']},
      {className: 'astryx-pagination-dot', visualProps: ['size'], states: ['active']},
      {className: 'astryx-pagination-input-label', visualProps: ['size']},
      {className: 'astryx-pagination-input-total', visualProps: ['size']},
    ],
  },
  playground: {
    defaults: {
      page: 1,
      totalItems: 100,
      pageSize: 10,
      variant: 'pages',
    },
  },
  usage: {
    anatomy,
    description:
      'Pagination 让用户逐页翻阅内容。放在表格、列表或卡片网格之下，让用户在结果中前后移动。按场景选变体：数据表用编号页，大列表用计数，空间紧张用 compact，轮播用 dots。',
    bestPractices: [
      { guidance: true, description: '把分页放在它控制的内容之下，让用户先看到结果再翻页。' },
      { guidance: true, description: '数据表需要跳到指定页时，用 pages 变体。' },
      { guidance: true, description: '用户需要控制一次看多少条时，用 count 变体配每页大小选择器。' },
      { guidance: true, description: '轮播与引导流程中总数少、位置比数字重要时，用 dots 变体。' },
      { guidance: true, description: '总数已知时传 totalItems，让用户看到还剩多少内容。' },
      { guidance: false, description: '所有条目一页放得下时不要显示分页；没有可翻的东西。' },
      { guidance: false, description: '超过约 10 页不要用 dots 变体；点会小到没有用处。' },
      { guidance: false, description: '不要把分页放在内容上方；用户预期它在底部。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Pagination',
  displayName: 'Pagination',
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。第 1 页为首页。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description: '页码变化时调用。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(page: number) => void | Promise<void>',
      description:
        '页码变化时的异步操作。在 onChange 之后触发，使用 React transitions 实现内置加载状态。',
    },
    {
      name: 'totalItems',
      type: 'number',
      description:
        '总项目数。用于计算页数。同时提供时优先于 totalPages。',
    },
    {
      name: 'totalPages',
      type: 'number',
      description:
        '总页数。当你知道页数但不知道项目数时使用。',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description:
        '当前页之后是否还有更多页。用于总数未知的游标分页。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页项目数。强制转换为正整数；非有限值回退到默认值。',
      default: '10',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description:
        '可用的每页大小选项。提供时显示每页大小选择器下拉菜单。',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description:
        '每页大小变化时调用。自动重置到第 1 页。',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'input' | 'none'",
      description:
        "控制上一页/下一页按钮之间显示内容的视觉变体。'pages' 显示带省略号的页码按钮，'count' 显示 'X-Y of Z' 文本，'compact' 显示 'Page X of Y'（可通过 hasFirstLast 添加首页/末页按钮），'dots' 显示点指示器，'input' 显示带前置标签的可编辑页码框——'Page [ n ] / N'——默认两侧带首页/末页按钮，'none' 仅显示上一页/下一页按钮。",
      default: "'pages'",
    },
    {
      name: 'pageLabel',
      type: 'string',
      description:
        "'input' 变体中可编辑框前显示的名词，如 'Page' 或 'Row'。导航始终基于页码（通过 onChange）；此项仅用于重新标注。默认为本地化的 'Page'。",
    },
    {
      name: 'hasFirstLast',
      type: 'boolean',
      description:
        "是否显示首页/末页（«/»）双箭头按钮，位于上一页/下一页两侧。适用于 'input' 变体（除非设为 false 否则显示）和 'compact' 变体（仅在设为 true 时显示）；其他变体忽略此项。当页数未知（游标/hasMore 分页）时省略。",
      default: "'input' 为 true；'compact' 为 false",
    },
    {
      name: 'step',
      type: 'number',
      description:
        '上一页/下一页按钮每次点击前进的页数。会被限制在有效页码范围内，因此超出范围的步进会落在首页/末页。大于 1 时，按钮的无障碍名称会反映跨步页数。非整数或小于 1 的值回退为 1。',
      default: '1',
    },
    {
      name: 'siblingCount',
      type: 'number',
      description:
        "当前页两侧显示的页码按钮数量。仅在 variant='pages' 时生效。",
      default: '1',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '分页控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '组件是否禁用。',
      default: 'false',
    },
    {
      name: 'label',
      type: 'string',
      description: '导航地标的无障碍标签。',
      default: "'Pagination'",
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
      {className: 'astryx-pagination', visualProps: ['size', 'variant']},
      {className: 'astryx-pagination-dot', visualProps: ['size'], states: ['active']},
      {className: 'astryx-pagination-input-label', visualProps: ['size']},
      {className: 'astryx-pagination-input-total', visualProps: ['size']},
    ],
  },
  usage: {
    anatomy,
    description:
      'Pagination lets users step through pages of content. Place it below a table, list, or card grid so users can move forward and backward through results. Pick a variant to match the context: numbered pages for data tables, a count for large lists, compact for tight spaces, or dots for carousels.',
    bestPractices: [
      { guidance: true, description: 'Place pagination below the content it controls so users see results before navigating.' },
      { guidance: true, description: 'Use the pages variant for data tables where users need to jump to a specific page.' },
      { guidance: true, description: 'Use the count variant with a page size selector when users need to control how many items they see at once.' },
      { guidance: true, description: 'Use the dots variant for carousels and walkthroughs where the total is small and position matters more than a number.' },
      { guidance: true, description: 'Pass totalItems when the total is known so users can see how much content remains.' },
      { guidance: false, description: 'Show pagination when all items fit on a single page; there is nothing to paginate.' },
      { guidance: false, description: 'Use the dots variant for more than about 10 pages; the dots become too small to be useful.' },
      { guidance: false, description: 'Place pagination above the content; users expect it at the bottom.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '翻阅内容页的独立分页控件。支持多种显示变体 + 适配已知总数或游标分页。',
  usage: {
    anatomy,
    description:
      'Pagination 让用户逐页翻阅内容。放在表格、列表或卡片网格之下，让用户在结果中前后移动。按场景选变体：数据表用编号页，大列表用计数，空间紧张用 compact，轮播用 dots。',
    bestPractices: [
      { guidance: true, description: '把分页放在它控制的内容之下，让用户先看到结果再翻页。' },
      { guidance: true, description: '数据表需要跳到指定页时，用 pages 变体。' },
      { guidance: true, description: '用户需要控制一次看多少条时，用 count 变体配每页大小选择器。' },
      { guidance: true, description: '轮播与引导流程中总数少、位置比数字重要时，用 dots 变体。' },
      { guidance: true, description: '总数已知时传 totalItems，让用户看到还剩多少内容。' },
      { guidance: false, description: '所有条目一页放得下时不要显示分页；没有可翻的东西。' },
      { guidance: false, description: '超过约 10 页不要用 dots 变体；点会小到没有用处。' },
      { guidance: false, description: '不要把分页放在内容上方；用户预期它在底部。' },
    ],
  },
  propDescriptions: {
    page: '当前页码（从 1 开始）。',
    onChange: '页码变化时调用。',
    changeAction:
      '页码变化时的异步操作。在 onChange 之后触发；用 React transitions 显示加载。',
    totalItems: '总条目数。计算页数。优先于 totalPages。',
    totalPages: '总页数。知道页数但不知道条目数时用。',
    hasMore: '当前页之后还有更多页。用于游标分页。',
    pageSize: '每页条目数；强制转换为正整数，非有限值回退默认',
    pageSizeOptions: '每页大小选项。提供时显示选择器下拉。',
    onPageSizeChange: '每页大小变化时调用。自动重置到第 1 页。',
    variant: "上一页/下一页之间的显示。'input' = 'Page [n] / N' + 首页/末页。",
    pageLabel: "'input' 框前的名词（例如 'Page' 或 'Row'）。导航仍基于页码。默认本地化的 'Page'。",
    hasFirstLast: "显示首页/末页（«/»）按钮。'input' 默认 true；'compact' 默认 false（显式开启）。其他变体忽略。总数未知时省略。",
    step: '上一页/下一页按钮每次点击前进的页数。钳制在范围内；< 1 或非整数回退为 1。',
    siblingCount: "当前页两侧的页码按钮数；仅 variant='pages'。",
    size: '控件尺寸。',
    isDisabled: '组件禁用。',
    label: '导航地标的无障碍标签。',
    xstyle:
      '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 值。',
  },
};
