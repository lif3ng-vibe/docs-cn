// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TimeInput',
  displayName: 'Time Input',
  category: 'Form Controls',
  keywords: [
    'timeinput',
    'timepicker',
    'time',
    'clock',
    '小时',
    '分钟',
    '上午/下午',
    'timeselect',
    'timefield',
    '排期',
  ],

  usage: {
    description:
      "TimeInput 默认在粗指针设备上使用浏览器/操作系统的时间选择器，在精细指针设备上使用 Astryx 文本字段。它将值转换为标准格式，并在文本字段界面上支持方向键调整。适用于表单、排期流程或任何用户需要选择具体时间的界面。",
    bestPractices: [
      {
        guidance: true,
        description:
          "ref、id、data-*、aria-* 等基础 prop 和 DOM 事件处理器作用于时间输入元素，即被聚焦和播报的元素。同一事件的 DOM 处理器在 TimeInput 自己的处理器之后运行，且仍会收到它已处理的事件（包括它调用过 preventDefault 的事件），因此无法取消内置行为。",
      },
      {
        guidance: true,
        description:
          "保持 hourFormat 不设置，让字段遵循 InternationalizationProvider locale 的小时制（en-US 为 12 小时制，en-GB 或 de-DE 为 24 小时制）。只在字段本身需要固定格式时才设置它，并把个人的 12/24 小时制偏好放在 provider locale 上（如 'en-US-u-hc-h23'），而不是逐个字段设置。",
      },
      {
        guidance: true,
        description:
          '当上下文存在有效范围（如营业时间或活动时段）时设置 min 和 max 约束，使用户无法提交越界时间。',
      },
      {
        guidance: true,
        description:
          '提供提示预期格式或用途的 description 或 placeholder，例如 "营业时间：9 点 – 17 点"。',
      },
      {
        guidance: true,
        description:
          '用 status prop 内联呈现校验错误：显示 "时间必须在营业时间内" 之类的消息，让用户明确知道要改什么。',
      },
      {
        guidance: true,
        description:
          '字段可选时启用 hasClear，让用户能清除之前选择的时间。',
      },
      {
        guidance: true,
        description:
          '当时间需要单行前缀或后缀附加项（如开始/结束标签或时区标记）时，把 TimeInput 放入 InputGroup。',
      },
      {
        guidance: false,
        description:
          "不要用 TimeInput 同时选择日期和时间；请与独立的 DateInput 搭配。",
      },
      {
        guidance: false,
        description:
          "不要隐藏标签；即使空间紧张，也保持标签可见或提供 description，使用途清晰。",
      },
      {
        guidance: false,
        description:
          '不要用 Tooltip 包裹已禁用的 TimeInput 来解释禁用原因。请改用 disabledMessage prop，它把原因绑定在字段上。',
      },
    ],
    anatomy: [
      {
        name: 'Clock icon',
        required: false,
        description:
          '标识字段的前置时钟图标；在原生模式下可打开浏览器/操作系统选择器。',
      },
      {
        name: 'Time control',
        required: true,
        description:
          '原生模式下是真正的 input type=time；精细指针、presentation="text-input"、秒数和自定义步进场景则是 Astryx 可编辑文本字段。',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          '重置值的尾部按钮，在 hasClear 为 true 且已设值时显示。',
      },
      {
        name: 'Status icon',
        required: false,
        description:
          '指示 error、warning 或 success 状态的尾部图标。',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          '加载期间替换尾部内容，表示异步操作进行中。',
      },
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的标签文本（无障碍所必需）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '视觉上隐藏标签，同时保持屏幕阅读器可访问。',
      default: 'false',
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
        '在标签旁显示 "(optional)" 指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '将字段标记为必填并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框并抑制交互。输入框仍可聚焦并暴露 `aria-disabled`。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示并描述输入框（激活仍被阻止）。请使用此 prop，而不是用 Tooltip 包裹已禁用的 TimeInput。',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'ISO 格式（HH:MM 或 HH:MM:SS）的受控时间值。',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description:
        '时间变化时触发的回调。输入被清除时接收 undefined。',
    },
    {
      name: 'changeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。包装在 React transition 中以提供乐观 UI；挂起时触发加载旋转器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '使输入框进入加载状态，显示旋转器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description:
        'ISO 格式的最小可选时间。范围外的值将被拒绝。',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description:
        'ISO 格式的最大可选时间。范围外的值将被拒绝。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: '在时间显示和解析中包含秒。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '已设值且输入框未被禁用时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "控制显示格式。'12h' 显示 locale 的上午/下午时段（如 '2:30 PM'、'오후 2:30'）；'24h' 使用 24 小时制（如 '14:30'）。未设置时遵循 InternationalizationProvider locale 的小时制：en-US 为 12 小时制，en-GB 和 de-DE 为 24 小时制。要遵循个人偏好，请在 locale 标签上传递（如 'en-US-u-hc-h23'），而不是逐个字段设置。",
      default: "the locale's hour cycle",
    },
    {
      name: 'increment',
      type: 'number',
      description:
        '用户按上或下方向键时增加或减少的分钟数。步长为整分钟；小数值不改变时间。',
      default: '1',
    },
    {
      name: 'presentation',
      type: "'text-input' | 'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "选择时间所用的界面。'adaptive-native'（默认）在精细指针上使用 Astryx 文本字段、在粗指针上使用浏览器/操作系统 input type=time——但 hasSeconds 或 increment 不为 1 时保留文本字段，因为 iOS 没有秒数滚轮且把 step 当作校验而非选择器节奏；'native' 始终使用浏览器/操作系统控件且无 Astryx 回退；'adaptive-bottom-sheet' 在精细指针上用文本字段、在粗指针上用 Astryx 底部时间滚轮；'bottom-sheet' 在任何指针上都强制使用滚轮；'text-input'（与没有独立 TimeInput 界面的 'popover' 相同）只保留文本字段。原生模式会转发 min/max 并在提交时强制校验。hourFormat 控制关闭状态的格式；打开的系统选择器遵循设备 locale。",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用：请使用 presentation（'touch' = 'adaptive-native'、'always' = 'native'、'never' = 'text-input'）。仍完全按已发布行为工作；同时设置时以 presentation 为准。",
      default: "'touch'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '未选择时间时显示的占位符文本。输入框聚焦且为空时，格式提示会覆盖此文本。',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控制输入框元素的高度。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '为边框着色并显示图标的状态指示器。提供消息时渲染在输入框下方。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以工具提示呈现。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '在标签行末尾以信息图标形式渲染的工具提示文本。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串按原样使用，如 "100%"）。会设定整个字段（标签、控件和状态）的尺寸以保持对齐。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于包含标签、控件和状态的 Field 容器的 StyleX 样式。containerClassName 和 containerStyle 以类名和内联样式作用于同一容器。在没有 Field 容器渲染的地方无效（开发警告）：InputGroup 内（请设置 group）和 horizontal-labels FormLayout 中。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：带边框、包含文本、图标和末端控件的元素，绝非原生输入。controlClassName 和 controlStyle 以类名和内联样式作用于同一框。本组件不接受根级 xstyle、className 和 style，此属性取代它们。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'TimeInput',

  displayName: 'Time Input',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '输入框的标签文本（无障碍性所必需）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，同时保持屏幕阅读器的无障碍性。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签旁显示"（可选）"指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填并设置 aria-required。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框并抑制交互。输入框仍可聚焦并暴露 `aria-disabled`。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框为何被禁用。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示提示，并描述输入框（仍阻止输入和调整）。请使用此属性，而不是用 Tooltip 包裹已禁用的 TimeInput。',
    },
    {
      name: 'value',
      type: 'ISOTimeString',
      description: 'ISO 格式的受控时间值（HH:MM 或 HH:MM:SS）。',
    },
    {
      name: 'onChange',
      type: '(value: ISOTimeString | undefined) => void',
      description: '时间变化时触发的回调。输入被清除时接收 undefined。',
    },
    {
      name: 'changeAction',
      type: '(value: ISOTimeString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。包装在 React transition 中以提供乐观 UI；挂起时触发加载旋转器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '使输入框进入加载状态，显示旋转器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISOTimeString',
      description: 'ISO 格式的最小可选时间。超出范围的值将被拒绝。',
    },
    {
      name: 'max',
      type: 'ISOTimeString',
      description: 'ISO 格式的最大可选时间。超出范围的值将被拒绝。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description: '在时间显示和解析中包含秒。',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '当有值且输入框未被禁用时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "控制显示格式。'12h' 使用区域设置的上午/下午用语（例如 '2:30 PM'、'오후 2:30'）；'24h' 使用 24 小时制（例如 '14:30'）。未设置时遵循 InternationalizationProvider 区域设置的小时制：en-US 为 12 小时制，en-GB 和 de-DE 为 24 小时制。要遵循用户自己的偏好，请在区域标签中传入（例如 'en-US-u-hc-h23'），而不是逐个字段设置。",
      default: '区域设置的小时制',
    },
    {
      name: 'increment',
      type: 'number',
      description:
        '用户按上或下方向键时增加或减少的分钟数。步长为整分钟；传入小数时时间保持不变。',
      default: '1',
    },
    {
      name: 'presentation',
      type: "'text-input' | 'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "选择时间所用的界面。'adaptive-native'（默认）在精细指针上使用 Astryx 文本字段、在粗指针上使用浏览器/操作系统 input type=time——但 hasSeconds 或 increment 不为 1 时保留文本字段；'native' 始终使用浏览器/操作系统控件且不回退；'adaptive-bottom-sheet' 在精细指针上用文本字段、在粗指针上用 Astryx 底部滚轮选择器；'bottom-sheet' 在任何指针上强制使用滚轮；'text-input'（与无独立界面的 'popover' 相同）只保留文本字段。原生模式会传递 min/max 并在提交时强制校验。hourFormat 控制关闭状态的显示；打开的系统选择器遵循设备区域设置。",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用：请使用 presentation（'touch'='adaptive-native'、'always'='native'、'never'='text-input'）。仍按已发布行为工作；同时设置时以 presentation 为准。",
      default: "'touch'",
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '未选择时间时显示的占位符文本。当输入框聚焦且为空时，格式提示会覆盖此文本。',
      default: "'Select a time'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控制输入框元素的高度。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '为边框着色并显示图标的状态指示器。当提供消息时，消息渲染在输入框下方。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '在标签行末尾以信息图标形式渲染的工具提示文本。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于包含标签、控件和状态的 Field 容器的 StyleX 样式；containerClassName 与 containerStyle 以类名和内联样式作用于同一容器。没有 Field 容器时（InputGroup 内或 horizontal-labels FormLayout 中）不生效，并在开发环境发出警告。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '作用于可见控件框（带边框、包含文本、图标和末端控件的元素，而非原生 input）的 StyleX 样式；controlClassName 与 controlStyle 以类名和内联样式作用于同一元素。本组件不接受根级 xstyle、className 和 style。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    description:
      'TimeInput 默认在粗指针设备上使用浏览器/操作系统的时间选择器，在精细指针设备上使用 Astryx 文本字段。它将时间转换为标准格式，并在文本字段界面支持方向键调整。适用于表单、排期流程和其他时间选择场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the time input, the element that is focused and announced. A DOM handler runs after TimeInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          "Leave hourFormat unset so the field follows the InternationalizationProvider locale's hour cycle (12-hour in en-US, 24-hour in en-GB or de-DE). Set it only when the field itself needs a fixed format, and carry a person's own 12/24-hour preference on the provider locale (e.g. 'en-US-u-hc-h23') rather than on each field.",
      },
      {
        guidance: true,
        description:
          'Set min and max constraints when the context has a valid range, like business hours or event windows, so users cannot submit an out-of-bounds time.',
      },
      {
        guidance: true,
        description:
          'Provide a description or placeholder that hints at the expected format or purpose, like "Business hours: 9 AM \u2013 5 PM".',
      },
      {
        guidance: true,
        description:
          'Use the status prop to surface validation errors inline: show a message like "Time must be during business hours" so users know exactly what to fix.',
      },
      {
        guidance: true,
        description:
          'Enable hasClear when the field is optional, so users can remove a previously selected time.',
      },
      {
        guidance: false,
        description:
          "Don't use TimeInput for combined date-and-time selection; pair it with a separate DateInput instead.",
      },
      {
        guidance: false,
        description:
          "Don't hide the label; even when space is tight, keep the label visible or provide a description so the purpose is clear.",
      },
      {
        guidance: false,
        description:
          'Wrap a disabled TimeInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
      },
    ],
    anatomy: [
      {
        name: 'Clock icon',
        required: false,
        description:
          '用于识别时间字段的前置时钟图标；在原生模式下也可打开浏览器/操作系统选择器。',
      },
      {
        name: 'Time control',
        required: true,
        description:
          '原生模式下使用真正的 input type=time；精细指针、presentation="text-input"、秒或自定义步进场景使用 Astryx 可编辑文本字段。',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A trailing button to reset the value, shown when hasClear is true and a value is set.',
      },
      {
        name: 'Status icon',
        required: false,
        description:
          'A trailing icon indicating error, warning, or success state.',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          'Replaces trailing content during loading to show an async action is in progress.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '时间输入框：触摸设备默认用浏览器/操作系统选择器，秒数或自定义步进场景回退为 Astryx 文本字段。',
  usage: {
    description:
      'TimeInput 默认在粗指针上用浏览器/操作系统选择器，在精细指针上用 Astryx 文本输入。它标准化值，并在文本字段界面上支持方向键调整。',
    bestPractices: [
      {
        guidance: true,
        description:
          "ref、id、data-*、aria-* 等基础 prop 和 DOM 事件处理器作用于时间输入元素（被聚焦和播报的元素）。DOM 处理器在 TimeInput 自己的处理器之后运行，仍会收到已处理的事件，因此无法取消内置行为。",
      },
      {
        guidance: true,
        description:
          "保持 hourFormat 不设置以遵循 provider locale 的小时制；把个人 12/24 小时制偏好放在 locale 标签上（en-US-u-hc-h23），而非逐个字段。",
      },
      {
        guidance: true,
        description:
          '为营业时间等有效范围设置 min/max 约束。',
      },
      {
        guidance: true,
        description:
          '提供提示预期格式的 description 或 placeholder。',
      },
      {
        guidance: true,
        description: '用 status prop 内联呈现校验错误。',
      },
      {guidance: true, description: '可选字段启用 hasClear。'},
      {
        guidance: true,
        description:
          '需要单行前缀或后缀附加项（如标签或时区标记）时放入 InputGroup。',
      },
      {
        guidance: false,
        description:
          "不要用于日期加时间；请搭配 DateInput。",
      },
      {
        guidance: false,
        description: "不要隐藏标签；保持可见以清晰表达。",
      },
      {
        guidance: false,
        description:
          "不要用 Tooltip 包裹已禁用的 TimeInput；请改用 disabledMessage prop。",
      },
    ],
  },
  propDescriptions: {
    label: '标签文本（无障碍所必需）。',
    isLabelHidden: '视觉上隐藏标签；保持屏幕阅读器可访问。',
    description: '标签与输入之间的描述文本。',
    isOptional:
      '显示 "(optional)" 指示器。与 isRequired 互斥。',
    isRequired:
      '标记必填并设置 aria-required。与 isOptional 互斥。',
    isDisabled: '禁用输入框，抑制交互。',
    disabledMessage:
      '禁用时在悬停/聚焦的工具提示中显示的原因；描述输入框。',
    value: 'ISO 格式（HH:MM 或 HH:MM:SS）的受控时间。',
    onChange: '时间变化时触发。清除时接收 undefined。',
    changeAction:
      'React transition 内 onChange 之后的异步操作；挂起时触发旋转器。',
    isLoading: '加载状态，带旋转器。',
    min: 'ISO 格式的最小可选时间。范围外被拒绝。',
    max: 'ISO 格式的最大可选时间。范围外被拒绝。',
    hasSeconds: '在显示和解析中包含秒。',
    hasClear: '已设值且未禁用时显示清除按钮。',
    hourFormat:
      "显示格式。'12h' 显示 locale 的上午/下午时段；'24h' 用 24 小时制。未设置时遵循 provider locale 的小时制（-u-hc- 标签承载个人偏好）。",
    increment:
      '按上/下方向键时增减的分钟数。仅整分钟；小数值不改变时间。',
    presentation:
      "选择器界面：'adaptive-native'（默认）= 精细指针文本字段 / 粗指针浏览器/操作系统（hasSeconds 或 increment!=1 保留文本字段）；'native' = 始终浏览器/操作系统，无回退；'adaptive-bottom-sheet' = 精细指针文本字段 / 粗指针 Astryx 滚轮面板；'bottom-sheet' = 始终面板；'text-input'/'popover' = 仅文本字段。",
    nativePicker:
      "已弃用，用 presentation：'touch'='adaptive-native'、'always'='native'、'never'='text-input'。仍按已发布行为工作；同时设置时以 presentation 为准。",
    placeholder: '为空时的占位符。聚焦且为空显示格式提示。',
    size: '输入框元素高度。',
    status: '彩色边框 + 图标。消息渲染在输入框下方。',
    statusVariant:
      '状态消息放置方式：attached 叠加于输入框下方；detached 留间距浮于下方；tooltip 隐藏消息框并显示在状态图标上。',
    labelTooltip: '标签行末尾以信息图标呈现的工具提示。',
    containerXstyle:
      'Field 容器（标签+控件+状态）；另有 containerClassName/containerStyle。InputGroup 或 horizontal-labels FormLayout 中无效。',
    controlXstyle:
      '可视控件框（边框/背景/图标），绝非原生输入；另有 controlClassName/controlStyle。不接受根级 xstyle/className/style。',
  },
};
