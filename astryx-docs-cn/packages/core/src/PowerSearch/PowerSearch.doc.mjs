// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'PowerSearch',
  displayName: 'Power Search',
  category: 'Form Controls',
  keywords: [
    'powersearch',
    'search',
    'searchbar',
    'filter',
    'filterbar',
    'faceted',
    'querybuilder',
    'structured',
    'omnibar',
    '高级搜索',
    '筛选栏',
    '过滤',
  ],
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        '定义可用字段、运算符及其值类型的配置。',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: '当前活跃的过滤器。',
      required: true,
    },
    {
      name: 'onChange',
      type: "(filters: ReadonlyArray<PowerSearchFilter>, changeType: 'add' | 'edit' | 'remove', index: number) => void",
      description:
        "过滤器变化时调用。changeType 为 'add'、'edit' 或 'remove'。index 是受影响过滤器的位置。",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '搜索输入框的无障碍标签。',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持无障碍。',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择过滤器时显示的占位文本。',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '显示"清除全部"按钮，移除所有可编辑过滤器。只读过滤器保留。',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: '阻止添加、编辑或移除过滤器。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用整个组件。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释搜索被禁用的原因。配合 isDisabled，在悬停/键盘聚焦时显示工具提示，并经 aria-disabled 保持输入框可聚焦（输入仍被阻止）。请用它代替把被禁用的 PowerSearch 包进 Tooltip。被禁用的控件会吞掉外部 Tooltip 需要的悬停事件。',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '带类型与可选消息的验证状态对象。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        '显示在输入框开头（任何过滤 token 之前）的图标。转发给内部 Tokenizer。接受语义图标名、SVG 图标组件或直接传 ReactNode。',
      slotElements: [{__element: 'Icon', props: {icon: 'search', size: 'sm'}}],
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description:
        '状态消息相对输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距。',
      default: "'attached'",
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: '过滤值在 token 中显示的最大字符长度。',
      default: '40',
    },
    {
      name: 'maxOperatorMenuItems',
      type: 'number',
      description:
        '字符串与实体值 typeahead 中显示的最大建议数。不影响主字段搜索菜单或枚举值菜单。',
      default: '10',
    },
    {
      name: 'maxSearchResults',
      type: 'number',
      description:
        '非空查询的最大排名结果数。不影响字段值编辑器。空查询浏览最多显示 1,000 个字段。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        '主字段/搜索菜单的宽度（像素）。不影响字段值编辑器。',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: '编辑弹出框中保存按钮的标签。',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        '仅日期的 date_absolute 值以及 date_range 的每个绝对端点读写所用的 IANA 时区：该日在此时区显示、编辑并以其午夜存储；未设置时一天即其 UTC 日。isDateOnly: false 的 date_absolute 值在此时区显示并编辑日期与时间；未设置时用查看者所在时区。例如 "America/New_York"。日期值以 InternationalizationProvider 的历法书写，如 calendar="persian"；过滤值保持 Unix 秒数。',
    },
    {
      name: 'handleRef',
      type: 'Ref<PowerSearchHandle>',
      description:
        '带 focusTypeahead() 与 blurTypeahead() 方法的命令式句柄。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '显示在输入行末尾的内容。适合操作按钮或其他控件。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        '匹配当前过滤器的结果数量。数字时格式化为 "N results"；字符串原样显示。变化经礼貌的 live region 播报给屏幕阅读器。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '搜索输入框与 token 的尺寸。',
      default: "'md'",
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        '运算符/值下拉菜单的最大宽度（像素）。',
    },
    {
      name: 'maxOperatorMenuItems',
      type: 'number',
      description:
        '运算符下拉中显示的最大条目数。',
    },
    {
      name: 'tokenOverflowBehavior',
      type: "'none' | 'unfocusedInline' | 'unfocusedLayer'",
      description:
        '容器过窄时 token 的溢出处理方式。转发给 Tokenizer。',
      default: "'none'",
    },
    {
      name: 'onFocus',
      type: '(e: React.FocusEvent) => void',
      description: '焦点进入搜索输入时触发。',
    },
    {
      name: 'onBlur',
      type: '(e: React.FocusEvent) => void',
      description: '焦点离开搜索输入时触发。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '字段如何呈现筛选编辑。adaptive（默认）在紧凑触屏上使用底部面板，其他情况使用 popover，解析方式与 Selector 相同；服务端渲染和水合期间的渲染均为 popover。popover 在所有设备上是带 typeahead 与编辑弹层的 token 字段。bottom-sheet 在所有设备上把整个字段变成一个显示只读筛选 token 的触发器——点按打开「筛选」面板，每行可编辑或移除一个筛选，并带 Add filter、Done 与 Clear all（先确认，并保留只读筛选）；其上方打开列出字段（或带内联建议的内容搜索）的 Add filter 面板，再上方打开按 运算符 → 值 暂存并从底部确认的取值步骤。关闭某一步露出下方那一步。整个流程编辑的是草稿：添加、编辑、移除筛选和 Clear all 只改草稿，Done 应用时按编辑顺序逐次调用 onChange；草稿有改动时关闭流程会先询问是否丢弃。列表值经 Tokenizer 自身的面板编辑。在 sheet 呈现中，menuWidth 与 tokenOverflowBehavior 没有作用对象，并在开发环境警告。传 presentation="popover" 可在所有设备上保留 token 字段与编辑弹层。',
      default: "'adaptive'",
    },
  ],
  examples: [
    {
      label: '在所有设备上保持弹层',
      code: `const [filters, setFilters] = useState([]);
<PowerSearch
  config={config}
  filters={filters}
  onChange={next => setFilters(next)}
  presentation="popover"
/>`,
    },
  ],
  // `config` and `filters` are custom values the docsite preview cannot
  // generate automatically. Keep this small, but include an initial token so
  // the Properties tab demonstrates a realistic controlled PowerSearch.
  playground: {
    defaults: {
      config: {
        name: 'IssueSearch',
        fields: [
          {
            key: 'status',
            label: '状态',
            defaultOperator: 'is',
            operators: [
              {
                key: 'is',
                label: 'is',
                value: {
                  type: 'enum',
                  values: [
                    {value: 'open', label: '打开'},
                    {value: 'closed', label: '已关闭'},
                  ],
                },
              },
            ],
          },
          {
            key: 'title',
            label: '标题',
            defaultOperator: 'contains',
            operators: [
              {key: 'contains', label: 'contains', value: {type: 'string'}},
            ],
          },
        ],
      },
      filters: [
        {
          field: 'status',
          operator: 'is',
          value: {type: 'enum', value: 'open'},
        },
      ],
    },
  },
  usage: {
    description:
      'PowerSearch 是结构化筛选栏，每个 token 代表一个字段、运算符与值。用于用户需要组合多个搜索条件的复杂多维筛选。简单单字段搜索请改用文本输入框。',
    bestPractices: [
      {
        guidance: true,
        description:
          '定义清晰、描述性强的字段名与别名，让用户快速找到需要的过滤器。',
      },
      {
        guidance: true,
        description:
          '提供结果计数，让用户了解过滤器对数据集的影响。',
      },
      {
        guidance: false,
        description:
          '不要把 PowerSearch 用于简单关键词搜索；单字段查找用标准文本输入框更合适。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 PowerSearch 包进 Tooltip 解释禁用原因；被禁用的控件会吞掉包装器需要的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
  theming: {
    targets: [{className: 'astryx-power-search'}],
    vars: [
      {
        name: '--_power-search-sheet-hit-inset',
        description:
          '触屏 sheet 的图标尺寸操作（Filters 头部的 Add filter 与每行的移除按钮）的不可见命中区域外扩，应用于 ::after 覆盖。细指针为 0；粗指针为负值，把操作扩大到 44px 触摸目标而不改变所绘内容。',
        default: '0px',
        private: true,
      },
      {
        name: '--_power-search-sheet-hit-content',
        description:
          '触屏 sheet 的不可见命中覆盖是否存在。细指针为 `none`，不生成 ::after，悬停仍可到达操作；粗指针为 `""`，由覆盖提供 44px 触摸目标。',
        default: 'none',
        private: true,
      },
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
  name: 'PowerSearch',
  displayName: 'Power Search',
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description: '定义可用字段、运算符及其值类型的配置。',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: '当前活跃的过滤器。',
      required: true,
    },
    {
      name: 'onChange',
      type: "(filters: ReadonlyArray<PowerSearchFilter>, changeType: 'add' | 'edit' | 'remove', index: number) => void",
      description:
        "当过滤器变更时调用。changeType 为 'add'、'edit' 或 'remove'。index 为受影响的过滤器位置。",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '搜索输入框的无障碍标签。',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持无障碍性。',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择过滤器时显示的占位文本。',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '显示清除全部按钮，移除可编辑的过滤器，保留只读过滤器。',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: '阻止添加、编辑或移除过滤器。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用整个组件。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled PowerSearch in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '带有类型和可选消息的验证状态对象。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        '在输入框开头（筛选 token 之前）显示的图标，转发给内部的 Tokenizer。接受语义图标名称、SVG 图标组件或直接传入 ReactNode。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距。',
      default: "'attached'",
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: '令牌中过滤器值显示的最大字符长度。',
      default: '40',
    },
    {
      name: 'maxOperatorMenuItems',
      type: 'number',
      description:
        '字符串和实体值预输入菜单中显示的最大建议数。不影响主字段搜索菜单或枚举值菜单。',
      default: '10',
    },
    {
      name: 'maxSearchResults',
      type: 'number',
      description:
        '非空查询的最大排名结果数。不影响字段值编辑器。使用空查询浏览时最多显示 1,000 个字段。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description: '主字段/搜索菜单的像素宽度。不影响字段值编辑器。',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: '编辑弹出窗口中保存按钮的标签。',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        '仅日期的 date_absolute 值及 date_range 的每个绝对端点读写所用的 IANA 时区：该日在此时区显示、编辑并以其午夜存储；未设置时为 UTC 日。isDateOnly: false 的 date_absolute 值在此时区显示并编辑其日期和时间；未设置时为查看者所在时区。例如 "America/New_York"。日期值使用 InternationalizationProvider 的历法（如 calendar="persian"）显示；筛选值仍为 Unix 秒数。',
    },
    {
      name: 'handleRef',
      type: 'Ref<PowerSearchHandle>',
      description:
        '提供 focusTypeahead() 和 blurTypeahead() 方法的命令式句柄。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '显示在输入行末尾的内容。适用于操作按钮或其他控件。',
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        '匹配当前过滤器的结果数量。数字类型时格式化为"N results"。字符串类型时按原样显示。数量变化会通过 polite 实时区域向屏幕阅读器播报。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '搜索输入框和标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '字段如何呈现筛选编辑。adaptive（默认）在紧凑触摸屏上使用底部面板，其他情况使用 popover，解析方式与 Selector 相同；服务端渲染和水合期间的渲染均为 popover。popover 在所有设备上为带有预输入和编辑弹出层的标记字段。bottom-sheet 在所有设备上将整个字段变为一个显示只读筛选标记的触发按钮——点按后打开列出筛选项的「筛选」面板，每行可编辑或移除筛选（含添加筛选、完成、全部清除；全部清除会先确认，并保留只读筛选）；列出字段（或带内联建议的内容搜索）的「添加筛选」面板在其上方打开，按运算符 → 值暂存并在底部确认的取值步骤再在其上方打开。关闭某一步会露出下方的那一步。整个流程编辑的是草稿：添加、编辑、移除筛选和全部清除都只改动草稿，点按「完成」应用草稿时才按编辑顺序逐次触发 onChange；草稿有改动时关闭流程会先询问是否放弃。列表值通过 Tokenizer 自身的面板编辑。在底部面板呈现中，menuWidth 和 tokenOverflowBehavior 没有作用对象，并会在开发环境中发出警告。传入 presentation="popover" 可在所有设备上保留标记字段和编辑弹出层。',
      default: "'adaptive'",
    },
  ],
  usage: {
    description:
      'PowerSearch is a structured filter bar where each token represents a field, operator, and value. Use it for complex multi-dimensional filtering when users need to combine multiple search criteria. For simple single-field search, use a text input instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Define clear, descriptive field names and aliases so users can quickly find the filter they need.',
      },
      {
        guidance: true,
        description:
          'Provide a result count to give users feedback on how their filters affect the data set.',
      },
      {
        guidance: false,
        description:
          'Use PowerSearch for simple keyword searches; a standard text input is more appropriate for single-field lookups.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled PowerSearch in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '结构化筛选栏，每个 token 代表一个过滤器（字段+运算符+值）。用户从 typeahead 下拉选择字段，在编辑弹层配置运算符与值，以可移除 token 的方式管理过滤器。',
  usage: {
    description:
      'PowerSearch 是结构化筛选栏，每个 token 代表一个字段、运算符与值。用于用户需要组合多个搜索条件的复杂多维筛选。简单单字段搜索请改用文本输入框。',
    bestPractices: [
      {
        guidance: true,
        description:
          '定义清晰、描述性强的字段名与别名，让用户快速找到需要的过滤器。',
      },
      {
        guidance: true,
        description:
          '提供结果计数，让用户了解过滤器对数据集的影响。',
      },
      {
        guidance: false,
        description:
          '不要把 PowerSearch 用于简单关键词搜索；单字段查找用标准文本输入框更合适。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 PowerSearch 包进 Tooltip 解释禁用原因；被禁用的控件会吞掉包装器需要的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    config: '定义可用字段、运算符与值类型的配置。',
    filters: '当前活跃的过滤器。',
    onChange:
      "过滤器变化时调用。changeType 为 'add'、'edit' 或 'remove'。index 为受影响过滤器位置。",
    label: '搜索输入框的无障碍标签。',
    isLabelHidden: '视觉隐藏标签同时保持无障碍。',
    placeholder: '未选择过滤器时显示的文本。',
    hasAutoFocus: '挂载时自动聚焦输入框。',
    hasClear:
      '显示清除全部按钮；移除可编辑过滤器，保留只读过滤器。',
    isReadOnly: '阻止添加、编辑或移除过滤器。',
    isDisabled: '禁用整个组件。',
    status: '带类型 + 可选消息的验证状态对象。',
    startIcon:
      '输入框开头、过滤 token 之前的图标。转发给内部 Tokenizer。',
    statusVariant:
      '状态消息放置：attached 叠加在输入框下方；detached 浮于下方留间距。',
    maxTokenLength: '过滤值在 token 中显示的最大字符长度。',
    maxOperatorMenuItems:
      '字符串/实体值 typeahead 的最大建议数；不含主字段搜索 + 枚举菜单。',
    maxSearchResults:
      '非空查询的最大排名结果数；不含值编辑器。',
    menuWidth: '主字段/搜索菜单宽度（像素）。',
    popoverSaveButtonLabel: '编辑弹层中保存按钮的标签。',
    timezoneID:
      '仅日期值读写所用的 IANA 时区；未设置为其 UTC 日。日期以 provider 历法显示。',
    handleRef:
      '带 focusTypeahead() + blurTypeahead() 方法的命令式句柄。',
    endContent:
      '输入行末尾的内容。适合操作按钮或控件。',
    resultCount:
      '匹配当前过滤器的结果数。数字格式化为 "N results"；字符串原样显示。',
    size: '搜索输入框+token 尺寸。',
    xstyle:
      '布局定制的 StyleX 样式。必须是 stylex.create() 值。',
    presentation:
      "'adaptive'（默认：紧凑触屏用 sheet，否则 popover；SSR/水合渲染 popover）| 'popover'（所有设备均为 token 字段 + 编辑弹层）| 'bottom-sheet'（一个只读 token 触发器 + 堆叠的 Filters / Add filter / 取值面板；行内移除；Clear all 先确认并保留只读；列表值经 Tokenizer 面板）。Sheet 中 menuWidth/tokenOverflowBehavior 无效（开发警告）。presentation=\"popover\" 在所有设备保留弹层。",
  },
};
