// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Tokenizer',
  displayName: 'Tokenizer',
  category: 'Form Controls',
  keywords: [
    'tokenizer',
    'multiselect',
    'multi-select',
    'chips',
    'tags',
    'combobox',
    'autocomplete',
    'taginput',
    'chipinput',
    '多选输入',
    '标签输入',
    '自动补全',
  ],
  playground: {
    // `value` is a required array of custom items the preview cannot
    // auto-generate; without a default the properties tab shows the
    // missing-props placeholder instead of the field. `searchSource` and
    // `onChange` are supplied by the preview's own fallbacks.
    defaults: {
      label: 'Tags',
      placeholder: 'Search...',
      value: [
        {id: '1', label: 'Design'},
        {id: '2', label: 'Engineering'},
      ],
    },
  },
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
      type: 'T[]',
      description: '当前已选项的数组。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: TokenizerChange<T>) => void',
      description:
        "选择变化时调用。change 参数包含受影响的项与类型 ('add' | 'create' | 'remove' | 'reorder')。新增与移除 (包括在空输入框按 Backspace) 会通过礼貌性实时区域向屏幕阅读器播报。",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '输入框占位文本。仅在未选择任何标记时显示。',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        '允许的最大选择数量。达到上限时输入框会隐藏。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '显示“全部清除”按钮，用于批量移除所有标记。',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        '已选标记的自定义渲染函数。默认渲染带 label 与 onRemove 的 Token。',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        '下拉列表项的自定义渲染函数。默认渲染 TypeaheadItem。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框和所有标记交互。输入框保留其 Tab 停靠点：以 aria-disabled 播报为禁用、只读，且不打开、不选中任何内容。当 tokenOverflowBehavior="unfocusedLayer" 且未提供 disabledMessage 时，输入框为原生禁用并移出 Tab 顺序。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '用于表单提交的 HTML name 属性。为每个已选项的 id 渲染一个隐藏输入框。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释 tokenizer 被禁用的原因。搭配 isDisabled 时，在悬停/键盘聚焦时显示 tooltip，并通过 aria-disabled 保持输入框可聚焦 (输入框仍被阻止)。请用此 prop 而非把禁用的 Tokenizer 包进 Tooltip，让原因直接附着在字段本身。',
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
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description:
        '显示的最大搜索结果数。hasCreate 条目会在此之上额外提供，因此菜单可能比该数量多显示一项。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        '下拉菜单的固定像素宽度。菜单不会收缩到小于其锚点宽度。',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        '查询搜索源之前的最小查询长度。低于该长度不发起搜索，菜单保持关闭——除非设置了 hasCreate，此时仍会提供“创建 ...”条目：它由输入文本推导而来，而非通过搜索获取。',
      default: '1',
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
      name: 'hasCreate',
      type: 'boolean',
      description:
        '允许用户从自由文本创建新标记。为 true 时，输入文本与现有结果不匹配时下拉菜单会出现“创建”选项。这些项的 onChange 变更类型为 \'create\'。',
      default: 'false',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变化时触发的回调。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        '在输入框开头、任何标记之前显示的图标。接受语义图标名称、SVG 图标组件，或直接传入 ReactNode。',
      slotElements: [{__element: 'Icon', props: {icon: 'search', size: 'sm'}}],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在输入行末尾显示的内容。适用于按钮、结果计数或其他控件。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'handleRef',
      type: 'React.Ref<TokenizerHandle>',
      description:
        '暴露 focusInput()、focusFirstToken()、focusLastToken()、clearInput() 与 selectAll() 的命令式句柄。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度 (数字 = 像素，字符串原样使用，如 "100%")。设定整个字段 (标签、控件与状态) 的尺寸，使其保持对齐。',
    },
    {
      name: 'tokenOverflowBehavior',
      type: "'none' | 'unfocusedInline' | 'unfocusedLayer'",
      description:
        '控制容器过窄时标记的溢出方式。',
      default: "'none'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '焦点进入 tokenizer 输入框时触发。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '焦点离开 tokenizer 输入框时触发。',
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
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '字段如何呈现其选项。adaptive (默认) 在紧凑触摸屏上使用底部面板，其他情况使用 popover，解析方式与 Selector 相同；服务端渲染与水合渲染均为 popover。popover 在所有设备上都是内联组合框及其锚定建议菜单。bottom-sheet 在所有设备上改为一个显示已选标记的字段，其触发按钮会打开一个高的模态面板：顶部为搜索行，下方为面板打开期间位置保持不变的整行复选框行，hasCreate 时有“创建”行，底部固定显示需确认的“全部清除”与“保存”；面板编辑的是草稿，onChange 仅在“保存”提交时触发一次，草稿有改动时以滑动、遮罩或 Escape 关闭会先询问是否放弃。在面板呈现中，字段框容纳触发按钮、标记与 endContent，并保留内联字段的外框、主题目标与焦点环；触发按钮即控件：ref、id、aria-* 与 data-* 都作用于它，且该呈现下 ref 接收的是触发按钮，因此请将其类型写为 Ref<HTMLInputElement | HTMLButtonElement> (组件接受此类型，TokenizerProps 保留已发布的输入框 ref 类型)。endContent 位于字段行内末端，renderToken 渲染其中的标记，与内联字段一致；它们自身的控件可直接操作，不会打开面板。renderItem、hasClear (面板自带“全部清除”)、hasEntriesOnFocus、menuWidth、tokenOverflowBehavior (字段会换行显示标记) 与 hasAutoFocus 在面板中没有作用对象，传入时开发模式下会警告一次。传入 presentation="popover" 可在所有设备上保留内联字段与这些 prop。',
      default: "'adaptive'",
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-tokenizer',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    description:
      'Tokenizer 是一个多选输入框，让用户搜索、选择并管理多个以可移除 chip 形式展示的条目。当用户需要从可搜索的数据源构建一组选择时使用它，例如添加团队成员、打标签或选择筛选条件。',
    bestPractices: [
      {
        guidance: true,
        description:
          '写一个说明可搜索内容的占位文本，如“搜索人员...”或“添加标签...”，别让输入框是一片空白谜团。',
      },
      {
        guidance: true,
        description:
          '选择数量需要有上限时设置 maxEntries，例如将一次评审限制为 5 名审批人。',
      },
      {
        guidance: true,
        description:
          '用户需要输入数据源中不存在的值时，用 hasCreate 支持自由打标签。',
      },
      {
        guidance: true,
        description:
          '用 status prop 展示校验状态，让用户在选择缺失或无效时立即知晓。',
      },
      {
        guidance: false,
        description:
          '不要用 Tokenizer 做单项选择；请改用 Typeahead。Tokenizer 用于构建两个及以上的条目集合。',
      },
      {
        guidance: false,
        description:
          '避免给 Tokenizer 内的个别标记设置自定义颜色；使用默认标记样式保持整组视觉一致。',
      },
      {
        guidance: false,
        description:
          '不要隐藏标签；每个 Tokenizer 都需要可见标签，让用户明白正在选择什么。仅在周围上下文足以说明用途时使用 isLabelHidden。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 Tokenizer 包进 Tooltip 来解释禁用原因；禁用控件会吞掉包裹层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          '输入框上方的可见文本，说明用户正在选择什么。也用作无障碍名称。',
      },
      {
        name: 'Token chips',
        required: false,
        description:
          '代表每个已选项的可移除 chip。每个 chip 显示一个标签和一个移除按钮。',
      },
      {
        name: 'Search input',
        required: true,
        description:
          '用户输入以搜索数据源的文本框。达到 maxEntries 时隐藏。',
      },
      {
        name: 'Dropdown menu',
        required: false,
        description:
          '用户输入时出现在输入框下方的搜索结果列表。',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          '搜索进行中时显示在字段末尾的加载指示器。',
      },
      {
        name: 'End content',
        required: false,
        description:
          '输入框之后的尾部插槽，用于操作按钮、计数或其他控件。',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          '一键移除所有已选标记的按钮。hasClear 为 true 且存在标记时显示。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Tokenizer',
  displayName: 'Tokenizer',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '提供搜索和引导方法的数据源。`search(query, context)` 可调用 `context.update(items)` 先显示已有的匹配项；返回值是最终列表，同一查询在第一个列表之后的每个列表都保留已显示的行，并只在其后追加新行。',
      required: true,
    },
    {
      name: 'value',
      type: 'T[]',
      description:
        '当前已选项目的数组。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: TokenizerChange<T>) => void',
      description:
        "选择变更时调用。change 参数包含受影响的项目和类型（'add' | 'create' | 'remove' | 'reorder'）。",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '输入框占位文本。仅在未选择任何标记时显示。',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        '允许的最大选择数量。达到限制时输入框会隐藏。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '显示全部清除按钮，用于批量移除所有标记。',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        '已选标记的自定义渲染函数。默认渲染带有 label 和 onRemove 的 Token。',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        '下拉列表项的自定义渲染函数。默认渲染 TypeaheadItem。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框和所有标记交互。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '用于表单提交的 HTML name 属性。为每个已选项目的 id 渲染一个隐藏输入。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip, so the reason is attached to the field itself.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '验证状态对象，包含类型和消息，用于错误/警告/成功状态。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 在状态图标的提示气泡中显示消息。',
      default: "'attached'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉隐藏标签，同时保持其可访问性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '显示在标签下方的辅助文本。',
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
      description:
        '在标签上显示可选指示器。',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '标签上显示的工具提示文本。',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description:
        '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description:
        '下拉列表显示的最大搜索结果数。“创建 ...”条目会在此之外额外提供，因此菜单可能比该数量多显示一项。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description: '下拉菜单的固定像素宽度。菜单不会小于其锚点宽度。',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        '查询搜索源前的最小查询长度。低于该长度不会发起搜索，菜单保持关闭；但设置 hasCreate 时仍会提供“创建 ...”条目——该条目由输入的文本推导而来，并非通过搜索获取。',
      default: '1',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        '查询无匹配结果时显示的内容。接受 ReactNode，因此可在无结果处放置链接或创建入口。会从 DOM 读取其渲染出的文本在礼貌性实时区域中播报；aria-hidden 的部分两处都不包含，不渲染任何文本的内容则不会播报。null 与 undefined 同样视为未提供，将回退到默认值；若要不渲染任何内容，请传入空字符串。',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description:
        '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        '输入框和标记的尺寸。',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '触发搜索前的防抖延迟（毫秒）。同步数据源，以及通过 `context.update` 显示本地匹配项并自行延迟服务器请求的数据源，设置为 0。',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description:
        '搜索查询文本变更时触发的回调。',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        '在输入框开头（token 之前）显示的图标。接受语义图标名称、SVG 图标组件或直接传入 ReactNode。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在输入行末尾显示的内容。适用于按钮、结果计数或其他控件。',
    },
    {
      name: 'handleRef',
      type: 'React.Ref<TokenizerHandle>',
      description: '用于 focus() 和 blur() 控制的命令式句柄。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内（请改为设置 InputGroup 的样式）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框和背景并包含图标与尾部控件的元素，而非原生输入元素。',
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
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        '字段如何呈现选项。adaptive（默认）在紧凑触摸屏上使用底部面板，其他情况使用 popover，解析方式与 Selector 相同；服务端渲染和水合期间的渲染均为 popover。popover 在所有设备上为内联组合框及其锚定建议菜单。bottom-sheet 在所有设备上改为一个显示已选标记的字段，点按其中的触发按钮后打开一个高的模态底部面板——顶部为搜索行，下方为整行复选框行（面板打开期间位置保持不变），hasCreate 时有「创建」行，底部固定显示需确认的「全部清除」和「保存」；面板编辑的是草稿，onChange 仅在「保存」提交时触发一次，草稿有改动时滑动、点击遮罩或按 Escape 关闭会先询问是否放弃。在底部面板呈现中，字段框包含触发按钮、标记和 endContent，并保留内联字段的外框、主题目标和焦点环；触发按钮即为控件：ref、id、aria-* 和 data-* 都作用于它，ref 在该呈现中收到的是触发按钮，因此请将其类型声明为组件所接受的 Ref<HTMLInputElement | HTMLButtonElement>（TokenizerProps 保留已发布的输入框 ref 类型）。endContent 位于字段的行内末端，renderToken 渲染字段中的标记，与内联字段相同；其中的控件可直接操作，不会打开底部面板。renderItem、hasClear（底部面板自带“全部清除”）、hasEntriesOnFocus、menuWidth、tokenOverflowBehavior（字段会换行显示标记）和 hasAutoFocus 在底部面板中没有作用对象，传入时开发模式下会警告一次。传入 presentation="popover" 可在所有设备上保留内联字段和这些属性。',
      default: "'adaptive'",
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-tokenizer',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search, select, and manage multiple items displayed as removable chips. Use it when users need to build a set of selections from a searchable data source, like adding team members, applying tags, or choosing filters.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Write a placeholder that tells users what they can search for, such as "Search people..." or "Add tags...", so the input is not a blank mystery.',
      },
      {
        guidance: true,
        description:
          'Set maxEntries when the number of selections should be bounded, like limiting a review to 5 approvers.',
      },
      {
        guidance: true,
        description:
          'Use hasCreate for free-form tagging where users need to enter values that do not exist in the search source.',
      },
      {
        guidance: true,
        description:
          'Show validation status with the status prop so users know immediately when a selection is missing or invalid.',
      },
      {
        guidance: false,
        description:
          "Don't use Tokenizer for single-item selection; use Typeahead instead. Tokenizer is for building sets of two or more items.",
      },
      {
        guidance: false,
        description:
          'Avoid applying custom colors to individual tokens inside a Tokenizer; use the default token style for visual consistency across the set.',
      },
      {
        guidance: false,
        description:
          "Don't hide the label; every Tokenizer needs a visible label so users understand what they are selecting. Use isLabelHidden only when surrounding context makes the purpose obvious.",
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Tokenizer in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          'The visible text above the input describing what the user is selecting. Also used as the accessible name.',
      },
      {
        name: 'Token chips',
        required: false,
        description:
          'Removable chips representing each selected item. Each chip shows a label and a remove button.',
      },
      {
        name: 'Search input',
        required: true,
        description:
          'The text input where users type to search the data source. Hides when maxEntries is reached.',
      },
      {
        name: 'Dropdown menu',
        required: false,
        description:
          'The search results list that appears below the input as the user types.',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          'Loading indicator shown at the end of the field while a search is in flight.',
      },
      {
        name: 'End content',
        required: false,
        description:
          'A trailing slot after the input for action buttons, counts, or other controls.',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A button that removes all selected tokens at once. Shown when hasClear is true and tokens are present.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带标记 chip 的多选 typeahead。组合 BaseTypeahead 负责搜索、Token 负责 chip。',
  usage: {
    description:
      '多选输入框：搜索并选择多个条目，以可移除 chip 展示。用于团队成员、标签、筛选，或任何从可搜索数据源构建的集合。',
    bestPractices: [
      {
        guidance: true,
        description:
          '占位文本说明可搜索什么，如“搜索人员...”而非留白。',
      },
      {
        guidance: true,
        description:
          '选择有上限时用 maxEntries (如最多 5 名审批人)。',
      },
      {
        guidance: true,
        description:
          '数据源外的自由打标签用 hasCreate。',
      },
      {
        guidance: true,
        description: 'status prop 提供即时校验反馈。',
      },
      {
        guidance: false,
        description:
          '单项选择不要用它；改用 Typeahead。',
      },
      {
        guidance: false,
        description:
          '避免自定义标记颜色；默认样式保持一致。',
      },
      {
        guidance: false,
        description:
          '上下文不足以说明用途时不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 Tokenizer 包进 Tooltip 解释原因；禁用控件会吞掉包裹层所需的悬停事件。改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    containerXstyle:
      '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
    containerClassName: '字段容器的类名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle:
      '可视控件框的 StyleX 样式 (边框、背景、图标)；不是原生输入框。',
    controlClassName: '可视控件框的类名。',
    controlStyle: '可视控件框的内联样式。',
    label: '输入框的无障碍标签。',
    searchSource:
      '带搜索与引导方法的数据源，用于填充下拉菜单。',
    value: '当前已选项的数组。',
    onChange:
      "选择变化时触发。change 参数包含受影响项与类型 ('add'|'create'|'remove'|'reorder')。",
    hasCreate:
      '允许自由文本创建标记。输入文本无匹配时在下拉菜单显示“创建”选项。',
    placeholder: '输入框占位文本。仅在选择标记为空时显示。',
    maxEntries: '允许的最大选择数。达到上限时隐藏输入框。',
    hasClear: '“全部清除”按钮，用于批量移除。',
    renderToken:
      '自定义标记渲染。默认渲染带 label 与 onRemove 的 Token。',
    renderItem: '自定义下拉项渲染。默认渲染 TypeaheadItem。',
    isDisabled: '禁用输入框与所有标记交互。',
    htmlName: 'HTML name 属性；每个已选项 id 一个隐藏输入框。',
    status: '校验状态对象，含 type 与 message，对应错误/警告/成功。',
    statusVariant:
      '状态消息放置方式：attached 叠放在输入框下方；detached 留间距浮于下方；tooltip 在状态图标上显示。',
    isLabelHidden: '视觉隐藏标签；保持无障碍。',
    description: '标签下方的辅助文本。',
    isRequired: '标记字段为必填。',
    isOptional: '在标签上显示可选指示器。',
    labelTooltip: '标签上的 tooltip。',
    hasEntriesOnFocus: '聚焦时在输入前显示引导结果。',
    maxMenuItems:
      '显示的最大搜索结果数；hasCreate 条目在其之上额外提供。',
    menuWidth: '下拉菜单固定像素宽度。',
    minQueryLength:
      '发起搜索前的最小查询长度。低于该值菜单保持关闭，hasCreate 条目除外。',
    emptySearchText: '查询无结果时的内容。ReactNode。',
    hasAutoFocus: '挂载时自动聚焦输入框。',
    size: '输入框与标记尺寸。',
    debounceMs: '搜索防抖延迟 (毫秒)。同步数据源设 0。',
    onChangeQuery: '搜索查询文本变化时触发。',
    startIcon:
      '输入框开头、标记之前的图标。图标名、SVG 组件或 ReactNode。',
    endContent: '输入行末尾的内容。用于按钮、计数、控件。',
    handleRef: '用于 focus() 与 blur() 控制的命令式句柄。',
    presentation:
      "'adaptive' (默认：紧凑触摸屏用面板，其余用 popover；SSR/水合渲染 popover) | 'popover' (所有设备均为内联组合框) | 'bottom-sheet' (字段框带触发按钮 + 一个可搜索的模态面板，整行复选框编辑草稿、“保存”提交；onChange 仅在保存时触发一次)。面板：字段框保留内联外框、主题目标与焦点环；ref 作用于触发按钮；endContent (字段末端) 与 renderToken (字段标记) 照常工作；renderItem/hasClear/hasEntriesOnFocus/menuWidth/tokenOverflowBehavior/hasAutoFocus 无作用对象 (开发模式警告)。presentation=\"popover\" 可在所有设备保留它们。",
  },
};
