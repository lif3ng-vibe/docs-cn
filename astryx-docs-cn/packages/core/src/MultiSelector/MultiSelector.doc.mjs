// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Field',
    required: false,
    description:
      '独立的 Field 外壳，提供标签与可选的辅助内容；在 InputGroup 内省略。',
  },
  {
    name: 'Trigger',
    required: true,
    description:
      '显示当前选择或占位符的可视控件，可编辑时打开选择表面。',
  },
  {
    name: 'Icon-rendered start icon',
    required: false,
    description:
      '经 Icon 渲染的可选起始语义图标或图标组件。',
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
      '启用 hasClear 时移除全部已选值的共享清除操作。',
  },
  {
    name: 'Status icon',
    required: false,
    description:
      'attached 或 tooltip 状态下替代展开指示器显示的状态图形。',
  },
  {
    name: 'Indicator icon',
    required: false,
    description:
      '状态呈现未取代时显示的尾部箭头；反映收起或展开状态。',
  },
  {
    name: 'Search row',
    required: false,
    description:
      '面板头部，含无边框搜索输入与可选清除操作。',
  },
  {
    name: 'Search icon',
    required: false,
    description:
      '搜索行内经 Icon 渲染的前置放大镜。',
  },
  {
    name: 'Search clear button',
    required: false,
    description:
      '存在查询时搜索行中显示的共享清除操作。',
  },
  {
    name: 'Option row',
    required: false,
    description:
      '选项或可选全选项的可选行。',
  },
  {
    name: 'Option checkbox indicator',
    required: false,
    description:
      'CheckboxInput 指示器，呈现每行的选中、未选或半选状态。',
  },
  {
    name: 'Option divider',
    required: false,
    description:
      '公开 options 数据中提供的分割线，用于分隔相邻的选项组。',
  },
  {
    name: 'Section heading',
    required: false,
    description: '带标签选项组的可见标题。',
  },
  {
    name: 'Empty state',
    required: false,
    description:
      '共享面板内容没有选项或没有搜索匹配时显示的消息。',
  },
  {
    name: 'Pointer popup',
    required: false,
    description:
      'popover 呈现下承载共享面板内容的锚定着色表面。',
  },
  {
    name: 'Touch sheet heading',
    required: false,
    description:
      'bottom-sheet 呈现下共享面板内容上方的标题。',
  },
  {
    name: 'Touch sheet',
    required: false,
    description:
      'bottom-sheet 呈现下承载同一面板内容的 BottomSheet 表面。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'MultiSelector',
  displayName: 'Multi Selector',
  group: 'Selector',
  category: 'Form Controls',
  keywords: [
    'multiselect',
    'checkbox',
    'dropdown',
    'multi',
    'picker',
    'checklist',
    'facet',
    'filter',
    'select',
    '多选',
    '复选',
    '下拉',
    '筛选',
  ],
  playground: {
    defaults: {
      label: '水果',
      options: [
        {value: 'apple', label: '苹果'},
        {value: 'orange', label: '橙子'},
        {value: 'banana', label: '香蕉'},
      ],
      value: [],
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-multi-selector',
        visualProps: ['variant', 'size', 'status'],
        states: ['disabled', 'readonly'],
      },
      {className: 'astryx-multi-selector-empty-state'},
      {className: 'astryx-multi-selector-search'},
      {className: 'astryx-multi-selector-section-heading'},
      {
        className: 'astryx-multi-selector-indicator-icon',
        states: ['state'],
      },
      {
        className: 'astryx-multi-selector-option',
        visualProps: ['size'],
        states: ['select-all', 'selected', 'disabled'],
      },
      {className: 'astryx-multi-selector-popup'},
    ],
  },
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
      description:
        '带复选框的多选下拉框，用于选择多个条目。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签文本。',
          required: true,
        },
        {
          name: 'options',
          type: 'MultiSelectorOptionType[]',
          description:
            '条目数组：字符串、带 value/label/icon/disabled 的对象、分割线或分组。选项可携带 `action`：一个由调用方渲染并命名的节点——IconButton、Button 或菜单触发器。一旦有选项携带，弹层即为网格，每行把选项与其操作配对：Up/Down 移动行，行内结束方向键到达操作，Enter 触发它，指针与触摸直接按压它，按压它绝不改变选择。',
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: '当前选中的值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string[], change?: MultiSelectorChange) => void',
          description:
            '选择变化时调用。创建（hasCreate）会以 `{type: "create", query}` 作为第二个参数到达，且 query 已附加到 value；调用方需在同一次更新中加入匹配的选项。其他变化不传描述符，单参数处理器照常工作。',
          required: true,
        },
        {
          name: 'changeAction',
          type: '(value: string[]) => void | Promise<void>',
          description: '变化时的异步操作。在 onChange 之后触发。',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '未选择值时显示的占位文本。',
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
            '触发器的视觉样式。input 是表单用的带边框输入处理；secondary 匹配当前主题的次要按钮（默认无边框、中性填充），用于导航与工具栏；ghost 无边框且透明，匹配 ghost 按钮，用于工具栏场景。',
          default: "'input'",
        },
        {
          name: 'triggerDisplay',
          type: "'count' | 'labels' | 'badges'",
          description: '在触发器中显示已选项的方式。',
          default: "'count'",
        },
        {
          name: 'formatValue',
          type: '(items: {value: string; label: string}[]) => string',
          description:
            '在 triggerDisplay="count" 或 "labels" 时格式化触发器文本。接收已选项（value 加解析后的 label）；数量即 items.length。triggerDisplay="badges" 不使用它。',
        },
        {
          name: 'maxBadges',
          type: 'number',
          description:
            '出现“+N”之前显示的最大徽章数。仅用于 triggerDisplay="badges"。',
          default: '3',
        },
        {
          name: 'hasSelectAll',
          type: 'boolean',
          description: '是否显示全选复选框。',
        },
        {
          name: 'selectAllLabel',
          type: 'string',
          description: '全选复选框的标签。',
          default: "'Select all'",
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description:
            '是否显示用于过滤选项的搜索输入。用户输入时，匹配数量（或 "No results found"）会通过礼貌的 live region 播报给屏幕阅读器。搜索框带内置功能：前置放大镜图标，以及输入查询后出现的尾部清除（✕）按钮——它会重置查询并把焦点还给输入框。',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: '搜索输入的占位文本。',
          default: "'Search...'",
        },
        {
          name: 'emptyText',
          type: 'ReactNode',
          description:
            '没有可显示选项时下拉面板中显示的内容，面板打开时也会在礼貌的 live region 中播报。播报内容是该内容渲染出的文本、从 DOM 读取，因此元素按其书写方式播报，aria-hidden 部分在显示与播报中都被排除。isLoading 期间不显示。',
          default: "'No options'",
        },
        {
          name: 'emptySearchText',
          type: 'ReactNode',
          description:
            '搜索查询未匹配任何选项时下拉面板中显示的内容，并同时播报到礼貌的 live region。播报内容是该内容渲染出的文本、从 DOM 读取，因此元素按其书写方式播报，aria-hidden 部分在显示与播报中都被排除。',
          default: "'No results found'",
        },
        {
          name: 'hasCreate',
          type: 'boolean',
          description:
            '配合 hasSearch：当输入文本在搜索的大小写不敏感匹配下不等于任何选项标签时，在列表首行提供 `Create "<query>"` 行。选中它，或无高亮项时按 Enter，会以附加到 value 的 query 和 `{type: "create", query}` 描述符调用 onChange，然后清空搜索；调用方必须在同一次更新中为新值添加选项。isLoading 期间不提供。没有 hasSearch 时在开发环境警告且不提供任何东西。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用选择器。',
        },
        {
          name: 'isReadOnly',
          type: 'boolean',
          description:
            '把选择器设为只读：已选值保持可见、可聚焦并纳入表单提交，且以 aria-readonly 保留其 combobox 身份。选择表面、清除操作与展开指示器被移除。与 isDisabled 不同，控件不变暗。两者同时设置时 isDisabled 优先。',
          default: 'false',
        },
        {
          name: 'htmlName',
          type: 'string',
          description:
            '表单提交用的 HTML name 属性。为每个已选值渲染一个隐藏输入，类似原生多选。',
        },
        {
          name: 'disabledMessage',
          type: 'string',
          description:
            '解释选择器被禁用的原因。配合 isDisabled 时，在触发器悬停与键盘聚焦时以工具提示显示原因；触发器与所有被禁用的选择器一样保持可聚焦（aria-disabled），激活仍被阻止。请用它代替把被禁用的 MultiSelector 包进 Tooltip。',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '视觉上隐藏标签，同时保持其可访问。',
        },
        {
          name: 'description',
          type: 'string',
          description: '标签下方显示的辅助文本。',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: '把字段标记为可选。',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '把字段标记为必填。',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: '在触发器中显示加载旋转器。',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: '带可选消息的验证状态。',
        },
        {
          name: 'statusVariant',
          type: "'attached' | 'detached' | 'tooltip'",
          description:
            '状态消息相对输入框的放置方式。attached 直接叠加在带边框输入框下方，仅对 input 变体有效；secondary 与 ghost 选择器默认把 attached 状态消息改为分离显示。紧凑工具栏控件请用 tooltip。',
          default:
            "'attached' for input selectors; 'detached' for secondary and ghost selectors",
        },
        {
          name: 'renderOption',
          type: '(option: MultiSelectorOptionData) => ReactNode',
          description:
            '下拉中每个可选项的自定义渲染函数。分割线、分组与全选行不会调用它。',
        },
        {
          name: 'indicatorPosition',
          type: "'start' | 'end'",
          description:
            '选项行哪一侧承载复选框。end 把它推到行的远端，全选行同样如此。',
          default: "'start'",
        },
        {
          name: 'presentation',
          type: "'popover' | 'bottom-sheet' | 'adaptive'",
          description:
            '选项列表的呈现方式。adaptive 在紧凑触屏上使用底部抽屉，其余情况使用锚定浮层。',
          default: "'popover'",
        },
        {
          name: 'width',
          type: 'SizeValue',
          description:
            '字段宽度（数字=像素，字符串原样使用，例如 "100%"）。作用于整个字段（标签、控件与状态），使其保持对齐。',
        },
        {
          name: 'startIcon',
          type: 'IconType | ReactNode',
          description: '在选择器触发器起始处显示的图标。',
        },
        {
          name: 'hasClear',
          type: 'boolean',
          description: '有已选值时显示清除按钮。',
          default: 'false',
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description: '下拉在挂载时是否默认打开。',
          default: 'false',
        },
        {
          name: 'renderTrigger',
          type: '(props: MultiSelectorRenderTriggerProps) => ReactNode',
          description:
            "渲染面板所挂靠的控件——列表行中的一个图形、一个 chip、一个图标按钮——取代选择器自带的字段与按钮。把给定的 props（{ref, id, onClick, onKeyDown, onFocus, aria-haspopup, aria-expanded, aria-controls, aria-busy}）展开到它上面；listbox 锚定于该控件并以 `label` 命名。字段外观（Field、状态、清除、旋转器）不再渲染。配合 handleRef 可从别处的按键打开。",
        },
        {
          name: 'handleRef',
          type: 'React.Ref<MultiSelectorHandle>',
          description:
            '带 open()、close()、toggle() 与 isOpen() 的命令式句柄。优先于在父级镜像打开状态；可见性由选择器自己管理。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '面板每次打开或关闭时调用，无论起因：触发器、键盘、点击外部关闭、Escape 或句柄。',
        },
        {
          name: 'onClick',
          type: '(event: MouseEvent) => void',
          description:
            '触发器（或 renderTrigger 控件）上的点击处理器。在内置切换之后运行，无法取消它。',
        },
        {
          name: 'onFocus',
          type: '(event: FocusEvent) => void',
          description:
            '触发器上的焦点处理器。在选择器自身的焦点处理之前运行。',
        },
        {
          name: 'onKeyDown',
          type: '(event: KeyboardEvent) => void',
          description:
            '触发按钮上的按键处理器。在内置键盘模型之后运行；该模型处理并取消的按键不会传给它。',
        },
        {
          name: 'containerXstyle',
          type: 'StyleXStyles',
          description:
            '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内（应改样式化 InputGroup）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 与 `style`。',
        },
        {
          name: 'containerClassName',
          type: 'string',
          description:
            '字段容器的类名。作用目标同 `containerXstyle`。',
        },
        {
          name: 'containerStyle',
          type: 'CSSProperties',
          description:
            '字段容器的内联样式。作用目标同 `containerXstyle`。',
        },
        {
          name: 'controlXstyle',
          type: 'StyleXStyles',
          description:
            '可视控件框的 StyleX 样式：绘制边框与背景、承载值、图标与尾部控件的元素。绝不是触发按钮本身。',
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
    },
  ],
  usage: {
    anatomy,
    description:
      '从列表中选择多个值的复选下拉框。已选项可显示为数量、标签或徽章。用于筛选，或展示需要多选的有限选项集合。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于数量适中、需要多选的有限选项集合。',
      },
      {
        guidance: true,
        description:
          '列表超过约 15 个选项时启用搜索过滤。',
      },
      {
        guidance: true,
        description:
          '自定义选项行用 renderOption；复选框功能仍由 MultiSelector 管理。',
      },
      {
        guidance: true,
        description:
          '当多数用户会全选或几乎全选时，启用全选。',
      },
      {
        guidance: true,
        description:
          '仅在控件需要短前缀或后缀插件、作为同一个装饰输入表面的一部分时，才放进 InputGroup；优先用 count 或 labels 触发显示，让组合保持单行。',
      },
      {
        guidance: true,
        description:
          '多选器与次要按钮或分段控件并排时用 variant="secondary"，与 ghost 按钮并排时用 variant="ghost"。若那里需要验证状态，优先 statusVariant="tooltip"，保持工具栏高度紧凑。',
      },
      {
        guidance: true,
        description:
          '当多选器在紧凑触屏上应变成底部抽屉时，使用 presentation="adaptive"。',
      },
      {
        guidance: false,
        description: '不要用于单值选择；请改用 Selector。',
      },
      {
        guidance: false,
        description: '不要在未启用搜索的情况下展示超过约 20 个选项。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 MultiSelector 包进 Tooltip 来解释禁用原因。请使用 disabledMessage prop，它把原因附加到触发器本身。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
      description: '带复选框的多选下拉框，用于从列表中选择多项。',
      propDescriptions: {
        label: '无障碍标签文本。',
        options:
          '项目数组——字符串、带 value/label/icon/disabled 的对象、分隔线或分组。',
        value: '当前选中的值。',
        onChange: '选择变化时触发的回调。',
        changeAction: '变化时的异步操作，在 onChange 之后触发。',
        placeholder: '未选择值时显示的占位文本。',
        size: '选择器的尺寸变体。',
        triggerDisplay: '在触发器中显示选中项的方式。',
        formatValue:
          '格式化 triggerDisplay="count" 或 "labels" 时的触发器文本。接收选中项（value 及解析后的 label），数量为 items.length。triggerDisplay="badges" 不使用此属性。',
        maxBadges:
          '显示"+N"之前的最大徽章数。仅适用于 triggerDisplay="badges"。',
        hasSelectAll: '是否显示全选复选框。',
        selectAllLabel: '全选复选框的标签。',
        hasSearch: '是否显示用于过滤选项的搜索输入。',
        searchPlaceholder: '搜索输入的占位文本。',
        emptyText: '没有可显示的选项时，下拉面板中显示的内容。',
        emptySearchText: '搜索查询未匹配到任何选项时，下拉面板中显示的内容。',
        hasCreate:
          '配合 hasSearch：当输入的文本与任何选项标签都不匹配时，在列表首行提供“创建 "<query>"”行；选中后通过 onChange 以 {type: "create", query} 描述符报告，调用方需在同一次更新中添加该选项。',
        isDisabled: '禁用选择器。',
        isReadOnly:
          '将选择器设为只读：保留当前值、焦点顺序和表单提交，但移除选择面板、清除操作和展开指示器。与 isDisabled 不同，只读控件不会变暗；两者同时设置时 isDisabled 优先。',
        htmlName:
          '用于表单提交的 HTML name 属性。为每个已选值渲染一个隐藏输入，类似原生多选。',
        disabledMessage:
          '解释选择器被禁用的原因。与 isDisabled 一起使用时，悬停/键盘聚焦时显示工具提示，触发器与所有被禁用的选择器一样通过 aria-disabled 保持可聚焦（仍无法激活）。请使用此属性，而不是用 Tooltip 包裹被禁用的选择器。',
        isLabelHidden: '视觉上隐藏标签同时保持其可访问性。',
        description: '标签下方显示的辅助文本。',
        isOptional: '将字段标记为可选。',
        isRequired: '将字段标记为必填。',
        isLoading: '在触发器中显示加载旋转器。',
        status: '带可选消息的验证状态。',
        statusVariant:
          '状态消息的放置方式：attached 直接叠加在输入框下方；detached 作为独立元素浮于下方并留有间距。',
        renderOption:
          '每个可选选项的自定义渲染函数。不会用于分隔线、分组或全选行。',
        renderTrigger:
          '由调用方渲染面板的触发控件（替代选择器自带的字段和按钮）；将传入的属性展开到该控件上，列表框将锚定于它并由 label 命名。',
        handleRef: '命令式句柄：open()、close()、toggle()、isOpen()。',
        onOpenChange: '面板每次打开或关闭时触发，无论由何种方式引起。',
        presentation:
          '选项列表的呈现方式：锚定弹出框、底部抽屉，或根据紧凑触控屏自适应。',
        onClick: '触发器的点击处理函数，在内置开关之后运行，无法取消它。',
        onFocus: '触发器的焦点处理函数，在选择器自身的焦点处理之前运行。',
        onKeyDown:
          '触发器的按键处理函数，在内置键盘模型之后运行；该模型处理并取消的按键不会传给它。',
        containerXstyle:
          '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内或 `horizontal-labels` FormLayout 中无效。不接受根级 xstyle、className 和 style。',
        containerClassName: '字段容器的类名，作用目标同 containerXstyle。',
        containerStyle: '字段容器的内联样式，作用目标同 containerXstyle。',
        controlXstyle:
          '可视控件框的 StyleX 样式：绘制边框和背景并包含值、图标与尾部控件的元素，而非触发按钮本身。',
        controlClassName: '可视控件框的类名。',
        controlStyle: '可视控件框的内联样式。',
      },
    },
  ],
  usage: {
    description:
      'A checkbox dropdown for selecting multiple values from a list. Selected items can display as a count, labels, or badges. Use it for filtering or when presenting a finite set of options where multiple choices are needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for a moderate, finite set of options where multiple choices are needed.',
      },
      {
        guidance: true,
        description:
          'Enable search filtering when the list exceeds ~15 options.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows; the checkbox affordance remains owned by MultiSelector.',
      },
      {
        guidance: true,
        description:
          'Enable select-all when most users will want all or nearly all options selected.',
      },
      {
        guidance: false,
        description: 'Use for single-value selection; use Selector instead.',
      },
      {
        guidance: false,
        description: 'Show more than ~20 options without enabling search.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled MultiSelector in Tooltip to explain why it is disabled. Use the disabledMessage prop, which attaches the reason to the trigger itself.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '复选多选下拉框，适用于有限集合，如列开关或筛选刻面',
  usage: {
    description:
      '从列表中选择多个值的复选下拉框。已选项可显示为数量、标签或徽章。用于筛选，或展示需要多选的有限选项集合。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于数量适中、需要多选的有限选项集合。',
      },
      {
        guidance: true,
        description:
          '列表超过约 15 个选项时启用搜索过滤。',
      },
      {
        guidance: true,
        description:
          '自定义行用 renderOption；复选框功能仍由 MultiSelector 管理。',
      },
      {
        guidance: true,
        description:
          '当多数用户会全选或几乎全选时，启用全选。',
      },
      {
        guidance: true,
        description:
          '仅在需要短前缀或后缀插件时放进 InputGroup；优先用 count 或 labels 触发显示，让组合保持单行。',
      },
      {
        guidance: true,
        description:
          '与次要按钮或分段控件并排用 variant="secondary"，与 ghost 按钮并排用 variant="ghost"；紧凑验证状态优先 statusVariant="tooltip"。',
      },
      {
        guidance: false,
        description: '不要用于单值选择；请改用 Selector。',
      },
      {
        guidance: false,
        description: '不要在未启用搜索的情况下展示超过约 20 个选项。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 MultiSelector 包进 Tooltip 来解释禁用原因。请使用 disabledMessage prop，它把原因附加到触发器本身。',
      },
    ],
  },
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
      description: '复选多选下拉框',
      propDescriptions: {
        label: '无障碍标签',
        options:
          '条目：字符串、带 value/label/icon/disabled 的对象、分割线、分组',
        value: '已选值',
        onChange: '选择变化时的回调',
        changeAction: '异步；在 onChange 之后触发',
        placeholder: '未选择时显示的文本',
        size: '尺寸变体',
        variant:
          '触发器视觉样式：input 带边框控件、匹配主题次要按钮的 secondary 控件，或透明的 ghost 控件',
        triggerDisplay: '在触发器中显示已选项的方式',
        formatValue:
          '格式化 count/labels 触发器文本；接收已选项',
        maxBadges: '出现“+N”之前的最大徽章数；仅徽章模式',
        hasSelectAll: '显示全选复选框',
        selectAllLabel: '全选标签',
        hasSearch: '显示搜索输入',
        searchPlaceholder: '搜索占位文本',
        emptyText: '没有选项时的面板内容',
        emptySearchText: '查询无匹配时的面板内容',
        hasCreate:
          '配合 hasSearch：无匹配标签时首行为 Create "<query>"；经 onChange 以 {type: "create", query} 描述符报告；调用方负责添加选项',
        isDisabled: '禁用选择器',
        isReadOnly:
          '只读：保留值、焦点与表单提交；移除菜单、清除与展开指示器',
        htmlName: 'HTML name 属性；每个已选值一个隐藏输入。',
        disabledMessage:
          '禁用原因；配合 isDisabled 在悬停/聚焦时显示工具提示，触发器经 aria-disabled 保持可聚焦；用它代替 Tooltip 包裹',
        isLabelHidden: '视觉上隐藏标签',
        description: '标签下方的辅助文本',
        isOptional: '标记为可选',
        isRequired: '标记为必填',
        isLoading: '触发器中的旋转器',
        status: '带可选消息的验证状态',
        statusVariant:
          '状态消息放置；secondary 与 ghost 默认分离 attached；紧凑工具栏用 tooltip。',
        renderOption:
          '每个可选项的自定义渲染函数；不用于分割线/分组/全选',
        renderTrigger:
          '调用方渲染的开启控件，取代字段+按钮；展开给定 props；listbox 锚定其上，以 label 命名',
        handleRef: '命令式 open()/close()/toggle()/isOpen()',
        onOpenChange: '每次打开/关闭都触发，无论起因',
        presentation:
          'popover、bottom-sheet 或紧凑触屏 adaptive 呈现',
        onClick:
          '触发器点击；在内置切换之后运行，无法取消',
        onFocus: '触发器焦点；在内置焦点处理之前运行',
        onKeyDown: '触发器按键；在内置键盘模型之后运行',
        containerXstyle:
          '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
        containerClassName: '字段容器的类名。',
        containerStyle: '字段容器的内联样式。',
        controlXstyle:
          '可视控件框（边框、背景、图标）的 StyleX 样式；不是触发按钮。',
        controlClassName: '可视控件框的类名。',
        controlStyle: '可视控件框的内联样式。',
      },
    },
  ],
};
