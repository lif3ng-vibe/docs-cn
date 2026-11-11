// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'NumberInput',
  displayName: 'Number Input',
  category: 'Form Controls',
  keywords: [
    'numberinput',
    'numberfield',
    'stepper',
    'spinner',
    'counter',
    'increment',
    'decrement',
    'quantity',
    'numberpicker',
    '数字输入',
    '步进器',
    '计数器',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '输入框的标签文本（始终渲染以保证无障碍）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: '输入框的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        '有效文本编辑在失焦或按 Enter 时提交、或步进/清除控件改变值时触发的回调。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '尺寸变体。',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签（屏幕阅读器仍可访问）。',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签与输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '字段是否可选（与 isRequired 互斥）。',
    },
    {
      name: 'onKeyDown',
      type: '(e: KeyboardEvent<HTMLInputElement>) => void',
      description: '输入框 keydown 事件时触发的回调。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '字段是否必填（与 isOptional 互斥）。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否禁用。',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '把输入框设为只读：值以完整不透明度显示、仍随表单提交，但无法编辑。与 isDisabled 不同，只读输入框不变暗，并保留其表单值。只读时所有步进方式都关闭：方向键、滚轮与数字步进按钮。同时设置时 isDisabled 优先。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释输入框被禁用的原因。配合 isDisabled，在悬停/键盘聚焦时显示工具提示，并经 aria-disabled 保持输入框可聚焦（字段变为只读）。请用它代替把被禁用的 NumberInput 包进 Tooltip。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '占位符文本。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签末尾信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description:
        '显示在输入框起始处的图标。有效语义名称见 `astryx docs icons`。',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description:
        '显示在标签文本之前的图标。有效语义名称见 `astryx docs icons`。',
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
        '状态消息相对输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，在状态图标上以工具提示显示。',
      default: "'attached'",
    },
    {
      name: 'min',
      type: 'number | null',
      description:
        '允许的最小值。更小的输入在失焦或按 Enter 时提交为该值。',
    },
    {
      name: 'max',
      type: 'number | null',
      description:
        '允许的最大值。更大的输入在失焦或按 Enter 时提交为该值。',
    },
    {
      name: 'step',
      type: 'number | null',
      description: '输入框的步进增量。',
      default: '1',
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        '输入框未聚焦时格式化已提交的值。聚焦编辑时显示原始数值，格式化值经 aria-valuetext 暴露。',
    },
    {
      name: 'isWheelEnabled',
      type: 'boolean',
      description:
        '在已聚焦的输入框上滚动滚轮是否步进数值。当页面滚动应始终优先时禁用此项。',
      default: 'true',
    },
    {
      name: 'hasNumberSteppers',
      type: 'boolean',
      description:
        '在细指针设备上于输入框末尾显示递增与递减按钮。粗指针（如触摸屏）上隐藏；文本输入与键盘步进仍可用。用鼠标或笔按住按钮会重复步进，并在松开时提交一次。',
      default: 'false',
    },
    {
      name: 'units',
      type: 'string | null',
      description:
        '在输入框末尾显示的单位文本（例如 "%" 或 "GB"）。',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: '仅允许整数值（不允许浮点数）。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '输入框有值时显示清除（×）按钮。为 true 时，onChange 回调还接受 null，表示用户清空了输入。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: '表单提交用的 HTML name 属性。',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete 属性。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字=像素，字符串原样使用，例如 "100%"）。作用于整个字段（标签、控件与状态），使其保持对齐。',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '是否在挂载时聚焦输入框。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框失去焦点时触发的回调。',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: '用户按下 Enter 键时触发的回调。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内（应改为样式化 InputGroup）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 与 `style`。',
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
        '可视控件框的 StyleX 样式：绘制边框与背景、承载图标与尾部控件的元素。绝不是原生输入元素。',
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
  theming: {
    targets: [
      {
        className: 'astryx-number-input',
        visualProps: ['size', 'status'],
        states: ['disabled', 'readonly'],
      },
    ],
    derived: [
      // `padding` in any spelling — the shorthand, `paddingBlock`, or a lone
      // `paddingBlockStart` — is parsed by the shared container expansion and
      // emitted as normalized per-side `--astryx-number-input-padding-*`
      // tokens. The wrapper and the number-stepper column both read those, so
      // the column stays flush with the field edges under a themed padding.
      {property: 'padding', expand: 'container'},
      // Scoped to this component's own subtree: the stepper column's outer
      // corners follow the field radius, so a themed `number-input`
      // borderRadius has to reach the var the column reads, not just the
      // wrapper's own `border-radius`.
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  usage: {
    description:
      '带内置校验、min/max 约束与步进控件的数字表单输入。NumberInput 用于数量、度量、百分比及类似输入。',
    bestPractices: [
      {
        guidance: true,
        description:
          '允许粘贴带格式的数字：粘贴的 1,234,234,234 按字段所在区域设置解析，失焦时提交为 1234234234。键入永远不会被拦截。',
      },
      {
        guidance: true,
        description:
          '设置 min、max 与 step，引导用户输入有效值。',
      },
      {
        guidance: true,
        description:
          '显示单位（例如 "%" 或 "GB"），让用户知道数字代表什么。',
      },
      {
        guidance: true,
        description:
          '当输入框出现在滚动表面、滚轮手势应始终滚动页面时，设置 isWheelEnabled={false}。',
      },
      {
        guidance: false,
        description:
          '不要把 NumberInput 用于碰巧含数字的自由文本；请改用 TextInput。',
      },
      {
        guidance: false,
        description: '不要在同一字段上同时设置 isOptional 与 isRequired。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 NumberInput 包进 Tooltip 解释禁用原因。请用 disabledMessage prop，它把原因附加到字段本身。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: '数字输入框的标签。',
      },
      {
        name: 'Description',
        required: false,
        description: '标签下方的附加描述文本。',
      },
      {
        name: 'Icon',
        required: false,
        description: '输入框内的可选图标。',
      },
      {
        name: 'Placeholder',
        required: false,
        description: '输入框为空时显示的占位符文本。',
      },
      {
        name: 'Number steppers',
        required: false,
        description:
          '按配置步进递增或递减的可选按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'NumberInput',
  displayName: 'Number Input',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的标签文本（始终渲染以确保无障碍访问）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | null | undefined',
      description: '输入框的当前值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void',
      description:
        '有效文本编辑在失焦或按 Enter 时提交；步进或清除控件更改值时也会触发回调。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '尺寸变体。',
      default: "'md'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签（屏幕阅读器仍可访问）。',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选（与 isRequired 互斥）。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否必填（与 isOptional 互斥）。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否禁用。',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '将输入框设为只读：值以完整不透明度显示并仍随表单提交，但无法编辑。与 isDisabled 不同，只读输入框不会变暗，并保留其表单值。只读时所有步进方式均被禁用：方向键、滚轮和步进按钮。同时设置时 isDisabled 优先。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持输入框可聚焦（字段变为只读）。请使用此属性，而不是用 Tooltip 包裹已禁用的 NumberInput。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '占位符文本。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'startIcon',
      type: 'IconType',
      description: '显示在输入框起始位置的图标。',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description: '显示在标签文本前的图标。',
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
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。',
      default: "'attached'",
    },
    {
      name: 'min',
      type: 'number | null',
      description: '允许的最小值。更小的输入会在失焦或按 Enter 时提交为该值。',
    },
    {
      name: 'max',
      type: 'number | null',
      description: '允许的最大值。更大的输入会在失焦或按 Enter 时提交为该值。',
    },
    {
      name: 'step',
      type: 'number | null',
      description: '输入框的步进增量。',
      default: '1',
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        '输入框未聚焦时格式化已提交的值。聚焦编辑时显示原始数值，并通过 aria-valuetext 提供格式化值。',
    },
    {
      name: 'isWheelEnabled',
      type: 'boolean',
      description:
        '是否允许在已聚焦的输入框上滚动滚轮来步进数值。当页面滚动应始终优先时请禁用。',
      default: 'true',
    },
    {
      name: 'hasNumberSteppers',
      type: 'boolean',
      description:
        '在精细指针设备上于输入框末尾显示递增和递减按钮。粗指针设备（例如触摸屏）上隐藏按钮；仍可直接输入数值或使用键盘步进。',
      default: 'false',
    },
    {
      name: 'units',
      type: 'string | null',
      description: '在输入框末尾显示的单位文本（例如"%"或"GB"）。',
    },
    {
      name: 'isIntegerOnly',
      type: 'boolean',
      description: '仅允许整数值（不允许浮点数）。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '输入有值时显示清除 (×) 按鈕。启用后， onChange 回调还接受 null 表示用户已清空输入。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description: '用于表单提交的 HTML name 属性。',
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: 'HTML autocomplete 属性。',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '是否在挂载时聚焦输入框。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '输入框失去焦点时触发的回调。',
    },
    {
      name: 'onEnter',
      type: '() => void',
      description: '用户按下 Enter 键时触发的回调。',
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
  ],
  theming: {
    targets: [
      {
        className: 'astryx-number-input',
        visualProps: ['size', 'status'],
        states: ['disabled', 'readonly'],
      },
    ],
    derived: [
      // 任何写法的 `padding`（简写、`paddingBlock`，或单独的
      // `paddingBlockStart`）都由共享的 container 展开解析，并输出为规范化的
      // 每侧 `--astryx-number-input-padding-*` 令牌。容器与数字步进器列都读取
      // 这些令牌，因此在主题化内边距下步进器仍与字段边缘齐平。
      {property: 'padding', expand: 'container'},
      // 作用域限于该组件自身的子树：步进器列的外角跟随字段圆角，因此主题化的
      // `number-input` borderRadius 必须传到步进器读取的变量，而不只是容器
      // 自身的 `border-radius`。
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  usage: {
    description:
      'A form input for numeric values with built-in validation, min/max constraints, and step controls. Use NumberInput for quantities, measurements, percentages, and similar inputs.',
    bestPractices: [
      {
        guidance: true,
        description:
          '可以直接粘贴带格式的数字：粘贴 1,234,234,234 会按字段所在区域设置解析，失去焦点时提交为 1234234234。输入过程中不会拦截按键。',
      },
      {
        guidance: true,
        description:
          'Set min, max, and step to guide users toward valid values.',
      },
      {
        guidance: true,
        description:
          'Show units (e.g. "%" or "GB") so users know what the number represents.',
      },
      {
        guidance: true,
        description:
          'Set isWheelEnabled={false} when the input appears in a scrolling surface where wheel gestures should always scroll the page.',
      },
      {
        guidance: false,
        description:
          'Use NumberInput for free-form text that happens to contain numbers; use TextInput instead.',
      },
      {
        guidance: false,
        description: 'Set both isOptional and isRequired on the same field.',
      },
      {
        guidance: false,
        description:
          "Wrap a disabled NumberInput in Tooltip to explain why it's disabled. Use the disabledMessage prop, which attaches the reason to the field itself.",
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: 'The label for the number input.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Additional description text below the label.',
      },
      {
        name: 'Icon',
        required: false,
        description: 'An optional icon within the input.',
      },
      {
        name: 'Placeholder',
        required: false,
        description: 'Placeholder text shown when the input is empty.',
      },
      {
        name: 'Number steppers',
        required: false,
        description:
          'Optional buttons that increment or decrement by the configured step.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '收集数字输入的数字输入组件，带校验。',
  usage: {
    description:
      '带内置校验、min/max 约束与步进控件的数字表单输入。NumberInput 用于数量、度量、百分比及类似输入。',
    bestPractices: [
      {
        guidance: true,
        description:
          '粘贴的带格式数字可解析：1,234,234,234 按字段所在区域设置提交为 1234234234。键入永不拦截。',
      },
      {
        guidance: true,
        description:
          '设置 min、max 与 step，引导用户输入有效值。',
      },
      {
        guidance: true,
        description:
          '显示单位（例如 "%" 或 "GB"），让用户知道数字代表什么。',
      },
      {
        guidance: true,
        description:
          '当输入框出现在滚动表面、滚轮手势应始终滚动页面时，设置 isWheelEnabled={false}。',
      },
      {
        guidance: false,
        description:
          '不要把 NumberInput 用于碰巧含数字的自由文本；请改用 TextInput。',
      },
      {
        guidance: false,
        description: '不要在同一字段上同时设置 isOptional 与 isRequired。',
      },
      {
        guidance: false,
        description:
          '不要把被禁用的 NumberInput 包进 Tooltip 解释禁用原因。请用 disabledMessage prop，它把原因附加到字段本身。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: '数字输入框的标签。',
      },
      {
        name: 'Description',
        required: false,
        description: '标签下方的附加描述文本。',
      },
      {
        name: 'Icon',
        required: false,
        description: '输入框内的可选图标。',
      },
      {
        name: 'Placeholder',
        required: false,
        description: '输入框为空时显示的占位符文本。',
      },
      {
        name: 'Number steppers',
        required: false,
        description:
          '按配置步进递增或递减的可选按钮。',
      },
    ],
  },
  propDescriptions: {
    containerXstyle:
      '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
    containerClassName: '字段容器的类名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle:
      '可视控件框（边框、背景、图标）的 StyleX 样式；不是原生输入元素。',
    controlClassName: '可视控件框的类名。',
    controlStyle: '可视控件框的内联样式。',
    label: '标签文本（始终渲染以保证无障碍）。',
    value: '输入框当前值。',
    onChange:
      '有效文本编辑在失焦/Enter 提交、或步进/清除控件改变值时的回调。',
    size: '尺寸变体。',
    isLabelHidden: '视觉隐藏标签（屏幕阅读器仍可访问）。',
    description: '标签 + 输入框之间的文本。',
    isOptional: '字段可选（与 isRequired 互斥）。',
    isRequired: '字段必填（与 isOptional 互斥）。',
    isDisabled: '输入框禁用。',
    isReadOnly:
      '只读：值可见 + 仍提交，但不可编辑。与 isDisabled 不同：不变暗。',
    disabledMessage:
      '解释输入框禁用原因。配合 isDisabled 在悬停/聚焦时显示工具提示 + 经 aria-disabled 保持可聚焦（字段变为只读）。用它代替 Tooltip 包裹。',
    placeholder: '占位符文本。',
    labelTooltip: '标签末尾信息图标中的工具提示文本。',
    startIcon: '输入框起始处的图标。',
    labelIcon: '标签文本前的图标。',
    status: '带可选消息的验证状态。',
    statusVariant:
      '状态消息放置方式：attached 叠加在输入框下方；detached 浮于下方留间距；tooltip 隐藏消息框并在状态图标上显示。',
    min: '允许的最小值。',
    max: '允许的最大值。',
    step: '步进增量。',
    formatValue:
      '静止时格式化已提交值；编辑时显示原始数字。',
    isWheelEnabled:
      '允许聚焦时滚轮步进数值。默认 true。',
    hasNumberSteppers:
      '细指针上显示递增 + 递减按钮；粗指针上隐藏。默认 false。',
    units: '单位后缀（例如 "%" 或 "GB"）。',
    isIntegerOnly: '仅允许整数值。',
    hasClear:
      '输入框有值时显示清除按钮。清除时 onChange 也接受 null。',
    htmlName: '表单提交用的 HTML name。',
    autoComplete: 'HTML autocomplete 属性。',
    hasAutoFocus: '挂载时聚焦输入框。',
    onFocus: '聚焦时的回调。',
    onBlur: '失焦时的回调。',
    onEnter: '按 Enter 时的回调。',
  },
};
