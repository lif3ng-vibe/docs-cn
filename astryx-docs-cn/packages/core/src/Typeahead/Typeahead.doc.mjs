// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Field',
    required: false,
    description:
      '独立的 Field 外壳，提供标签与可选辅助内容；在 InputGroup 内省略。',
  },
  {
    name: 'Input surface',
    required: true,
    description:
      '承载可编辑输入框或已选标记的绘制控件表面。',
  },
  {
    name: 'Icon-rendered start icon',
    required: false,
    description:
      '经 Icon 渲染的可选前置语义图标或图标组件。',
  },
  {
    name: 'Caller-rendered start content',
    required: false,
    description:
      '直接渲染在输入表面起始处的可选任意 React 内容。',
  },
  {
    name: 'Selected token',
    required: false,
    description:
      '控件非编辑模式下展示已选项的标记。',
  },
  {
    name: 'Spinner',
    required: false,
    description:
      '搜索进行中显示在输入表面末尾的加载指示器。',
  },
  {
    name: 'Clear button',
    required: false,
    description:
      '启用 hasClear 时移除已选项的共享清除操作。',
  },
  {
    name: 'Dropdown',
    required: false,
    description:
      '锚定定位的 listbox 表面，包含当前搜索结果。',
  },
  {
    name: 'Empty state',
    required: false,
    description: '搜索完成但无结果时显示的消息。',
  },
  {
    name: 'Result row',
    required: false,
    description:
      '拥有高亮、选中、指针与键盘行为的稳定选项包装。',
  },
  {
    name: 'Default item content',
    required: false,
    description:
      'renderItem 与 item.element 缺省时渲染在结果行内的标准 TypeaheadItem 标签与辅助内容。',
  },
  {
    name: 'Caller-rendered item content',
    required: false,
    description:
      '通过 renderItem 或 item.element 提供的调用方结果内容，位于稳定的结果行内。',
  },
  {
    name: 'Result group heading',
    required: false,
    description: '带标签结果行组的可见标题。',
  },
  {
    name: 'Selected result state',
    required: false,
    description:
      '当前结果行呈现的选中样式与尾部对勾。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Typeahead',
  displayName: 'Typeahead',
  group: 'Typeahead',
  category: 'Form Controls',
  keywords: [
    'typeahead',
    'autocomplete',
    'combobox',
    'searchbox',
    'autosuggest',
    'select',
    'dropdown',
    'lookup',
    'searchable',
    'suggestion',
    'picker',
    '自动补全',
    '搜索选择',
    '下拉选择',
  ],
  description:
    '带标签、描述、校验与全部字段功能的成品 typeahead。以 Field 包装 BaseTypeahead，覆盖主要使用场景。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '提供搜索与引导方法的数据源。`search(query, context)` 可在返回前调用 `context.update(items)` 先展示已掌握的匹配项；其返回值即最终列表，同一查询在首个列表之后的每个列表都会把已展示的行保留在前、新行追加其后。',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: '当前选中项，未选中时为 null。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: '选择变化时调用。',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框占位文本。',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '显示清除按钮，用于取消当前选中值。',
      default: 'true',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框。字段保留其 Tab 停靠点：以 aria-disabled 播报为禁用、只读，且不打开、不选中任何内容。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释输入框被禁用的原因。搭配 isDisabled 时，在悬停/键盘聚焦时显示 tooltip，原因描述该字段 (激活仍被阻止)。请用此 prop 而非把禁用的 Typeahead 包进 Tooltip，让原因直接附着在字段本身。',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '下拉列表显示的最大项目数。',
      default: '10',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        '查询搜索源前的最小查询长度。低于该长度不发起搜索，菜单保持关闭。',
      default: '1',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '校验状态对象，含 type 与 message，用于错误/警告/成功状态。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠放在输入框下方 (带边框处理)；detached 作为独立元素浮于下方并留有间距；tooltip 通过信息提示按钮展示消息。',
      default: "'attached'",
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        '下拉列表项的自定义渲染函数。默认渲染 TypeaheadItem。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签，同时保持其无障碍可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的辅助文本。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签上显示可选指示器。',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签上显示的 tooltip 文本。',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        '查询无匹配结果时显示的内容。接受 ReactNode，因此可在无结果处放置链接或创建入口。会以礼貌性实时区域播报其渲染出的文本 (从 DOM 读取)；aria-hidden 的部分两处都不包含，不渲染任何文本的内容则不会播报。null 与 undefined 同样视为未提供，将回退到默认值；若要不渲染任何内容，请传入空字符串。',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入框与标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '触发搜索前的防抖延迟 (毫秒)。同步数据源，以及通过 `context.update` 先显示本地匹配、再自行延迟服务器请求的数据源，设置为 0。',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变化时触发的回调。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '下拉列表打开或关闭时的回调。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度 (数字 = 像素，字符串原样使用，如 "100%")。设定整个字段 (标签、控件与状态) 的尺寸，使其保持对齐。',
    },
    {
      name: 'startIcon',
      type: 'IconType | ReactNode',
      description: '显示在输入框起始处的 SVG 图标组件。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器 (标签、控件与状态整体) 的 StyleX 样式。在 InputGroup 内 (请改为设置 InputGroup 的样式) 或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 与 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框与背景、容纳图标与尾部控件的元素。绝不是原生输入框。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  components: [{name: 'BaseTypeahead'}, {name: 'TypeaheadItem'}],
  theming: {
    targets: [
      {className: 'astryx-typeahead', visualProps: ['status', 'size']},
      {className: 'astryx-typeahead-dropdown'},
      {className: 'astryx-typeahead-empty-state'},
      {className: 'astryx-typeahead-item'},
    ],
  },
  usage: {
    anatomy,
    description:
      '从大型或动态数据集中选择单项的可搜索输入框。输入时即出现结果，支持异步数据源、防抖搜索与自定义项渲染。选项列表大到 Selector 下拉放不下时使用它。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供描述性占位文本，暗示用户可以搜索什么。',
      },
      {
        guidance: true,
        description:
          '用户能从输入前看到热门或最近选项中受益时，聚焦即显示建议。',
      },
      {
        guidance: true,
        description:
          '远程数据源增加搜索延迟，避免过多网络请求。',
      },
      {
        guidance: true,
        description:
          '远程数据源应立即显示页面已有的匹配：在 `search` 中调用 `context.update(local)`，传 `debounceMs={0}`，在数据源中延迟服务器请求，并返回以已展示行在前的服务器答案。',
      },
      {
        guidance: true,
        description:
          'typeahead 需要单行前缀或后缀插件时放入 InputGroup 使用。',
      },
      {
        guidance: false,
        description:
          '不要用于简短的静态选项列表；用 Selector 可发现性更好。',
      },
      {
        guidance: false,
        description: '不要用于多选；请改用 Tokenizer。',
      },
      {
        guidance: false,
        description:
          '不要把多个 Typeahead 相邻摆放而不带区分它们的清晰标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 Typeahead 包进 Tooltip 解释禁用原因；禁用触发器会吞掉包裹层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide descriptive placeholder text that hints at what users can search for.',
      },
      {
        guidance: true,
        description:
          'Show suggestions on focus when users benefit from seeing popular or recent options before typing.',
      },
      {
        guidance: true,
        description:
          'Add a search delay for remote data sources to avoid excessive network requests.',
      },
      {
        guidance: true,
        description:
          'For a remote source, show the matches the page already has at once: call `context.update(local)` in `search`, pass `debounceMs={0}`, delay the server request in the source, and return the server answer with the shown rows first.',
      },
      {
        guidance: false,
        description:
          'Use for short, static option lists; use Selector for better discoverability.',
      },
      {
        guidance: false,
        description: 'Use for multi-selection; use Tokenizer instead.',
      },
      {
        guidance: false,
        description:
          'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Typeahead in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带键盘导航的单选可搜索下拉。经 searchSource 接口支持异步+同步搜索。',
  usage: {
    description:
      '从大型或动态数据集中选择单项的可搜索输入框。输入即出结果，支持异步数据源、防抖搜索与自定义项渲染。选项列表大到 Selector 放不下时使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供描述性占位文本，暗示用户可以搜索什么。',
      },
      {
        guidance: true,
        description:
          '用户能从输入前看到热门或最近选项中受益时，聚焦即显示建议。',
      },
      {
        guidance: true,
        description:
          '远程数据源增加搜索延迟，避免过多网络请求。',
      },
      {
        guidance: true,
        description:
          '远程数据源应立即显示页面已有的匹配：在 `search` 中调用 `context.update(local)`，传 `debounceMs={0}`，在数据源中延迟服务器请求，并返回以已展示行在前的服务器答案。',
      },
      {
        guidance: true,
        description:
          '需要单行前缀/后缀插件时放入 InputGroup。',
      },
      {
        guidance: false,
        description:
          '不要用于简短静态选项列表；用 Selector 可发现性更好。',
      },
      {
        guidance: false,
        description: '不要用于多选；请改用 Tokenizer。',
      },
      {
        guidance: false,
        description:
          '多个 Typeahead 相邻摆放时要有区分它们的清晰标签。',
      },
      {
        guidance: false,
        description:
          '禁用的 Typeahead 不要包进 Tooltip；改用 disabledMessage prop。',
      },
    ],
  },
};
