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
    name: 'Trigger',
    required: true,
    description:
      '显示当前选择或占位文本、在可编辑时打开选择面板的绘制控件。',
  },
  {
    name: 'Icon-rendered start icon',
    required: false,
    description:
      '通过 Icon 渲染的可选前置语义图标或图标组件。',
  },
  {
    name: 'Caller-rendered start content',
    required: false,
    description:
      '直接渲染在触发器起始处的可选任意 React 内容。',
  },
  {
    name: 'Trigger clear button',
    required: false,
    description:
      'hasClear 启用时移除选中值的共享清除操作。',
  },
  {
    name: 'Status icon',
    required: false,
    description:
      'attached 或 tooltip 状态时替代展开指示器显示的状态符号。',
  },
  {
    name: 'Indicator icon',
    required: false,
    description:
      '状态呈现未替代时显示的尾部 chevron；反映收起或展开状态。',
  },
  {
    name: 'Search row',
    required: false,
    description:
      '面板头部，含无边框搜索输入框与可选清除操作。',
  },
  {
    name: 'Search icon',
    required: false,
    description:
      '搜索行内通过 Icon 渲染的前置放大镜。',
  },
  {
    name: 'Search clear button',
    required: false,
    description:
      '有查询内容时显示在搜索行中的共享清除操作。',
  },
  {
    name: 'Option row',
    required: false,
    description: '单个所给选项的可选行。',
  },
  {
    name: 'SelectorOption-rendered content',
    required: false,
    description:
      '用 SelectorOption 渲染的选项内容——来自默认渲染器，或返回 SelectorOption 的 renderOption。',
  },
  {
    name: 'Bare caller-rendered option content',
    required: false,
    description:
      'renderOption 未选用 SelectorOption 时直接返回的任意内容。',
  },
  {
    name: 'Option selection indicator',
    required: false,
    description:
      '每个选项按选中或未选中状态渲染的最终选中标记。最终指示器不绘制任何内容时，其布局空间会收缩。',
  },
  {
    name: 'Option divider',
    required: false,
    description:
      '在公开 options 数据中提供、用于分隔相邻选项组的分隔线。',
  },
  {
    name: 'Section heading',
    required: false,
    description: '带标题的选项行分组的可见标题。',
  },
  {
    name: 'Empty state',
    required: false,
    description:
      '共享面板内容没有选项或搜索无匹配时显示的消息。',
  },
  {
    name: 'Pointer popup',
    required: false,
    description:
      'popover 呈现时承载共享面板内容的锚定绘制表面。',
  },
  {
    name: 'Touch sheet heading',
    required: false,
    description:
      '底部面板呈现时位于共享面板内容上方的标题。',
  },
  {
    name: 'Touch sheet',
    required: false,
    description:
      '底部面板呈现时承载同一面板内容的 BottomSheet 表面。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Selector',
  displayName: 'Selector',
  group: 'Selector',
  category: 'Form Controls',
  keywords: [
    'selector',
    'select',
    'dropdown',
    'combobox',
    '选择器',
    '下拉选择',
    '下拉框',
    'picker',
    'listbox',
    'chooser',
    'autocomplete',
    '自动补全',
    'option',
    'selectmenu',
  ],
  theming: {
    targets: [
      {
        className: 'astryx-selector',
        visualProps: ['variant', 'size', 'status'],
        states: ['disabled', 'readonly'],
      },
      {className: 'astryx-selector-option'},
      {
        className: 'astryx-selector-option-row',
        visualProps: ['size'],
        states: ['selected', 'disabled'],
      },
      {className: 'astryx-selector-search'},
      {className: 'astryx-selector-section-heading'},
      {className: 'astryx-selector-empty-state'},
      {className: 'astryx-selector-indicator-icon', states: ['state']},
      {className: 'astryx-selector-check'},
      {className: 'astryx-selector-popup'},
    ],
  },
  description: '从选项列表中进行选择的下拉选择器。',
  playground: {
    defaults: {
      label: '水果',
      options: [
        {value: 'apple', label: '苹果'},
        {value: 'orange', label: '橙子'},
        {value: 'banana', label: '香蕉'},
      ],
    },
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '无障碍标签文本。',
      required: true,
    },
    {
      name: 'options',
      type: 'SelectorOption[]',
      description:
        '条目数组：字符串、带 value/label/description/icon/disabled 的对象、分隔线（{type: "divider"}）或分组（{type: "section", title, options}）。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '当前选中的值。',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '选择变化时触发的回调。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '选中值时显示清除（×）按钮。为 true 时 onChange 也接受 null，表示用户清除了选择。',
      default: 'false',
    },
    {
      name: 'hasSearch',
      type: 'boolean',
      description:
        '是否显示用于筛选选项的搜索输入框。用户输入时，匹配数量（或 "No results found"）会通过 polite live region 播报给屏幕阅读器。搜索框自带可见入口：前置放大镜图标，以及输入查询后出现的尾部清除（✕）按钮，可重置查询并把焦点还给输入框。',
      default: 'false',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description: '搜索输入框的占位文本。',
      default: "'Search...'",
    },
    {
      name: 'emptyText',
      type: 'ReactNode',
      description:
        '下拉面板没有可显示选项时显示的内容，面板打开时也会在 polite live region 中播报。播报内容是该内容渲染出的文本、从 DOM 读取，因此元素按书写形式播报，aria-hidden 的部分在显示与播报中都会排除。isLoading 期间不显示。',
      default: "'No options'",
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        '搜索查询无匹配选项时在下拉面板中显示的内容，同时会在 polite live region 中播报。播报内容是该内容渲染出的文本、从 DOM 读取，因此元素按书写形式播报，aria-hidden 的部分在显示与播报中都会排除。',
      default: "'No results found'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选中值时显示的占位文本。',
      default: "'Select...'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '选择器的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'variant',
      type: "'input' | 'secondary' | 'ghost'",
      description:
        '触发器的视觉样式。input 是表单用的带边框输入样式；secondary 匹配当前主题的次要按钮（默认无边框、中性填充），用于导航和工具栏；ghost 无边框且透明，匹配 ghost 按钮，用于工具栏场景。',
      default: "'input'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用选择器。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '让选择器只读：选中值保持可见、可聚焦，并包含在表单提交中，同时通过 aria-readonly 保留 combobox 身份。选择面板、清除操作与展开指示器都会移除。与 isDisabled 不同，控件不会变暗。两者同时设置时 isDisabled 优先。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '用于表单提交的 HTML name 属性。渲染一个携带选中值的隐藏 input，类似原生 select。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释选择器为何被禁用。与 isDisabled 同用时，会在触发器悬停与键盘聚焦时以工具提示显示原因；触发器与所有禁用选择器一样保持可聚焦（aria-disabled），激活仍被阻止。请用此 prop 代替把禁用的 Selector 包进 Tooltip。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签，同时保持无障碍可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '将字段标记为可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: '带可选消息的校验状态。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对输入框的放置方式。attached 直接叠在带边框输入框下方，仅对 input 变体有效；secondary 与 ghost 选择器默认把 attached 状态消息改为分离式。紧凑的工具栏控件请用 tooltip。',
      default:
        "'attached' for input selectors; 'detached' for secondary and ghost selectors",
    },
    {
      name: 'renderOption',
      type: '(option: SelectorOptionData) => ReactNode',
      description:
        '下拉列表中每个可选项的自定义渲染函数。请用它代替 JSX 子元素；分隔线与分组由选择器自行渲染。',
    },
    {
      name: 'renderValue',
      type: '(option: SelectorOptionData) => ReactNode',
      description:
        '闭合触发器内选中项的自定义渲染函数。单行值遵循当前尺寸 token，包括紧凑或宽松间距刻度，以及带图标或清除控件的情形。内边距会适配触发行盒，每多一行控件就增高一行（默认 token 下单行 28/32/36，两行 48/52/56）。内容继承触发器行高；设置更大字体的内容应自行设置行高，让触发器长高以容纳。在 InputGroup 内，行高由组决定：SelectorOption 会折叠为单行并省略显示，任何更高的节点都会在行处截断。',
    },
    {
      name: 'indicatorPosition',
      type: "'start' | 'end'",
      description:
        '选项行哪个逻辑边承载渲染的选中标记。空标记不占空间，因此选中与未选中标签可能移位或可用宽度不同。end 是与 Typeahead 和 CommandPalette 一致的官方约定。',
      default: "'end'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '选项列表的呈现方式。adaptive 在紧凑触屏上用底部面板，其余情况用锚定弹出层。',
      default: "'popover'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串原样使用，如 "100%"）。作用于整个字段（标签、控件与状态）使其保持对齐。不设宽度时字段跟随其显示值，可随所在行收缩（值被截断）而不是溢出行；筛选栏请用 `<HStack wrap="wrap">`，让选择器在手机上换到第二行。',
    },
    {
      name: 'startIcon',
      type: 'IconType | ReactNode',
      description: '显示在选择器触发器起始处的图标。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '在触发器中显示加载 spinner。',
      default: 'false',
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description:
        '触发按钮的点击处理器。在选择器切换面板之前运行；preventDefault() 不能阻止其开合。',
    },
    {
      name: 'onFocus',
      type: '(event: FocusEvent) => void',
      description:
        '触发按钮的焦点处理器。在选择器自身的焦点处理之前运行。',
    },
    {
      name: 'onKeyDown',
      type: '(event: KeyboardEvent) => void',
      description:
        '触发按钮的按键处理器。在内置键盘模型之后运行，被它处理并取消的按键会跳过此处理器。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内无效（请改为设置 InputGroup 样式），在 `horizontal-labels` FormLayout 中也无效。不接受根级 `xstyle`、`className` 与 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        '字段容器的类名。定位目标与 `containerXstyle` 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        '字段容器的内联样式。定位目标与 `containerXstyle` 相同。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视化控件盒的 StyleX 样式：即绘制边框与背景、容纳值、图标和尾部控件的元素。绝不作用于触发按钮本身。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视化控件盒的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视化控件盒的内联样式。',
    },
  ],
  components: [{name: 'SelectorOption'}],
  usage: {
    description:
      '从选项列表中选择单个值的下拉选择器。支持标签、校验、描述与必填/可选状态。表单与设置中呈现中等数量选项时使用。键盘 typeahead 与原生 select 一致：在聚焦的闭合触发器上输入会直接选中匹配选项，重复按键在共享首字母的选项间循环，空格也算匹配字符（"new y" 可达 "New York"）。菜单打开时，输入移动高亮，Enter 确认。开启 hasSearch 时，在闭合触发器上输入会打开弹出层并预填搜索框。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供可见标签，让用户明白自己在选什么。',
      },
      {
        guidance: true,
        description:
          '列表超过约 8 项时，用分组与分隔线组织选项。',
      },
      {
        guidance: true,
        description:
          '自定义选项行请用 renderOption。不要把 SelectorOption 直接作为 JSX 子元素传入。',
      },
      {
        guidance: true,
        description:
          '设置有意义的占位文本，提示预期选择（如 "Choose a country" 而非 "Select..."）。',
      },
      {
        guidance: true,
        description:
          '仅当选择器需要作为同一装饰输入表面的一部分、带短前缀或后缀 addon 时，才放入 InputGroup。',
      },
      {
        guidance: true,
        description:
          '当选择器位于导航或工具栏、旁边是次要按钮或分段控件时，用 variant="secondary"，让它与它们共用样式而不是被读作表单字段。当选择器位于有 ghost 按钮的工具栏时，用 variant="ghost"。若在这些位置需要校验状态，优先 statusVariant="tooltip"，保持工具栏高度紧凑。',
      },
      {
        guidance: true,
        description:
          '当选择器在紧凑触屏上应变为底部面板时，用 presentation="adaptive"。',
      },
      {
        guidance: false,
        description:
          '不要用于操作菜单；触发命令或导航请用 Dropdown Menu。',
      },
      {
        guidance: false,
        description:
          '只有两个选项时不要用；请改用 SegmentedControl 或单选按钮。',
      },
      {
        guidance: false,
        description:
          '不要用 Selector 做导航；链接就应该是链接，而不是下拉选项。',
      },
      {
        guidance: false,
        description:
          '不要用于是/否或开/关选择；请改用 Switch 或 CheckboxInput。',
      },
      {
        guidance: false,
        description:
          '不要不加分组地放超过约 20 个选项；大列表考虑 Typeahead。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 Selector 包进 Tooltip 来解释禁用原因。请用 disabledMessage prop，它会把原因直接挂在触发器上。',
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A dropdown selector for choosing a single value from a list of options. Supports labels, validation, descriptions, and required/optional states. Use it in forms and settings when presenting a moderate number of options. Keyboard typeahead matches a native select: typing on the focused closed trigger selects the matching option directly, repeated presses cycle through options sharing a first letter, and spaces count as match characters ("new y" reaches "New York"). With the menu open, typing moves the highlight and Enter commits. With hasSearch, typing on the closed trigger opens the popup and seeds the search input.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a visible label so users understand what they are selecting.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to organize options when the list exceeds ~8 items.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows. Do not pass SelectorOption directly as JSX children.',
      },
      {
        guidance: true,
        description:
          'Set a meaningful placeholder that hints at the expected selection (e.g. "Choose a country" not "Select...").',
      },
      {
        guidance: false,
        description:
          'Use for action menus; use Dropdown Menu for triggering commands or navigation.',
      },
      {
        guidance: false,
        description:
          'Use when there are only two options; use a SegmentedControl or radio buttons instead.',
      },
      {
        guidance: false,
        description:
          'Use Selector for navigation; links should be links, not dropdown options.',
      },
      {
        guidance: false,
        description:
          'Use for yes/no or on/off choices; use Switch or CheckboxInput instead.',
      },
      {
        guidance: false,
        description:
          'Put more than ~20 options without sections; consider Typeahead for large lists.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Selector in Tooltip to explain why it is disabled. Use the disabledMessage prop, which attaches the reason to the trigger itself.',
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '从选项列表中选择单个值的下拉选择器。支持标签、校验、描述与必填/可选状态。表单与设置中呈现中等数量选项时使用。键盘 typeahead 与原生 select 一致：在聚焦的闭合触发器上输入直接选中匹配选项，重复按键在共享首字母的选项间循环，空格也算匹配字符（"new y" 可达 "New York"）。菜单打开时，输入移动高亮，Enter 确认。开启 hasSearch 时，在闭合触发器上输入会打开弹出层并预填搜索框。',
    bestPractices: [
      {
        guidance: true,
        description: '提供可见标签，让用户明白自己在选什么。',
      },
      {
        guidance: true,
        description: '列表超过约 8 项时，用分组与分隔线组织选项。',
      },
      {
        guidance: true,
        description:
          '自定义行用 renderOption；不要把 SelectorOption 作为 JSX 子元素传入。',
      },
      {
        guidance: true,
        description:
          '设置有意义的占位文本，提示预期选择（如 "Choose a country" 而非 "Select..."）。',
      },
      {
        guidance: true,
        description:
          '仅当选择器需要短前缀或后缀 addon 时才放入 InputGroup。',
      },
      {
        guidance: true,
        description:
          '导航/工具栏中挨着次要按钮时用 variant="secondary"；有 ghost 按钮的工具栏用 variant="ghost"；校验状态优先 statusVariant="tooltip" 保持紧凑。',
      },
      {
        guidance: false,
        description:
          '不要用于操作菜单；触发命令或导航请用 Dropdown Menu。',
      },
      {
        guidance: false,
        description:
          '只有两个选项时不要用；请改用 SegmentedControl 或单选按钮。',
      },
      {
        guidance: false,
        description:
          '不要用 Selector 做导航；链接就应该是链接，而不是下拉选项。',
      },
      {
        guidance: false,
        description:
          '不要用于是/否或开/关选择；请改用 Switch 或 CheckboxInput。',
      },
      {
        guidance: false,
        description:
          '不要不加分组地放超过约 20 个选项；大列表考虑 Typeahead。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 Selector 包进 Tooltip 来解释禁用原因。请用 disabledMessage prop，它会把原因直接挂在触发器上。',
      },
    ],
    anatomy,
  },
};
