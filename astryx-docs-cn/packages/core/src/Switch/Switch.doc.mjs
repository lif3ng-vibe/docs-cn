// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Field',
    required: true,
    description: '排列开关、标签与反馈的容器。',
  },
  {
    name: 'Track',
    required: true,
    description: '显示开或关状态的胶囊形表面。',
  },
  {
    name: 'Thumb',
    required: true,
    description: '状态变化时在轨道上移动的滑块。',
  },
  {
    name: 'Label',
    required: true,
    description: '标识开关所控设置的文本。',
  },
  {
    name: 'Description',
    required: false,
    description: '标签下方的辅助文本。',
  },
  {
    name: 'Spinner',
    required: false,
    description: '忙碌时显示在滑块内的加载指示器。',
  },
  {
    name: 'Status message',
    required: false,
    description: '开关下方的错误、警告或成功消息。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Switch',
  displayName: 'Switch',
  category: 'Form Controls',
  keywords: [
    'switch',
    'toggle',
    '开关',
    '切换',
    'onoff',
    'flipswitch',
    '布尔',
    'toggleswitch',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: '转发至底层 <input> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '开关的标签文本（为无障碍而始终渲染）。',
      required: true,
    },
    {
      name: 'value',
      type: 'boolean',
      description: '开关是开还是关。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '开关状态变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'onChange 之后触发的异步操作。触发乐观 UI 并显示加载指示器，直到 Promise 完成。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '开关是否处于加载状态，在滑块内显示加载指示器。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏标签，同时保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '开关是否禁用。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        '控制轨道与滑块尺寸的尺寸变体。sm（32x20px）对齐 sm 复选框/单选的垂直节奏；md（40x24px，默认）对齐 md 复选框/单选的垂直节奏。',
      default: "'md'",
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '底层复选框输入的 HTML name 属性，用于表单提交（开关开启时提交 "on"）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释开关为何被禁用。与 isDisabled 同用时，会在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持开关可聚焦（切换仍被阻止）。请用此 prop 代替把禁用的 Switch 包进 Tooltip——禁用控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '字段是否可选。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '开关是否必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '带类型与消息的状态指示器。在开关下方显示彩色消息框，类型为 "error" 时设置 aria-invalid。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description:
        '显示在标签文本前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '显示在标签末尾信息图标中的工具提示文本。',
    },
    {
      name: 'labelPosition',
      type: "'start' | 'end'",
      description:
        '标签出现在开关的哪一侧。"start" 将标签放在开关前面。',
      default: "'end'",
    },
    {
      name: 'labelSpacing',
      type: "'hug' | 'spread'",
      description:
        '标签与开关之间的间距行为。"hug" 将它们并排放置；"spread" 将它们推到容器两端（全宽）。',
      default: "'hug'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串原样使用，如 "100%"）。作用于整个字段（标签、控件与状态）使其保持对齐。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-switch',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {
        className: 'astryx-switch-thumb',
        visualProps: ['size'],
        states: ['checked'],
      },
      {
        className: 'astryx-switch-field',
        visualProps: ['labelPosition', 'labelSpacing'],
      },
      {className: 'astryx-switch-label'},
    ],
  },
  usage: {
    accessibility: [
      {
        name: 'Track and thumb',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          '开与关两种轨道各自与背后表面的对比度至少 3:1，滑块与所在轨道亦然。对于 Hover 与 Pointer down，应在着色与按压叠加层应用后测量最终颜色。',
      },
    ],
    anatomy,
    description:
      '用于立即生效的开/关状态的切换控件。支持标签、描述、加载状态与校验。适用于即时生效的设置或偏好。需要表单提交才生效的更改请改用复选框。触屏上手指操作时，它的表现与 iOS 开关一致：按下抬起滑块，拖过即翻转，抬手提交，轻点通过浏览器的 click 切换。滑块在所有设备上保持圆形与尺寸，粗指针下不可见点击区域向 44 × 44 px 扩展，与相邻控件各让一半间距，使轻点落在更近的控件上。开启减弱动效时，触屏上变化以交叉淡入呈现，鼠标下则立即生效。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于立即生效的设置；切换应当无需单独保存操作即可生效。',
      },
      {
        guidance: true,
        description:
          '搭配清晰简洁的标签，描述所控制的设置。',
      },
      {
        guidance: false,
        description:
          '需要表单提交才生效的选项不要用；请改用复选框。',
      },
      {
        guidance: false,
        description:
          '多状态取值不要用开关；它严格是开/关。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的开关包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Switch',
  displayName: 'Switch',
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: '转发至底层 <input> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description: '开关的标签文本（始终渲染以确保无障碍性）。',
      required: true,
    },
    {
      name: 'value',
      type: 'boolean',
      description: '开关是开启还是关闭。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '开关状态变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。触发乐观 UI 并显示加载旋转器直到 Promise 完成。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '开关是否处于加载状态，在滑块内显示旋转器。',
      default: 'false',
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
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '开关是否被禁用。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '底层复选框输入的 HTML name 属性，用于表单提交（开启时提交 "on"）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the switch is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the switch focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled Switch in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否为可选。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '开关是否为必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '带类型和消息的状态指示器。在开关下方显示彩色消息框，当类型为 "error" 时设置 aria-invalid。',
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '开关失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'IconType',
      description: '显示在标签文本前面的图标。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '在标签末尾的信息图标中显示的工具提示文本。',
    },
    {
      name: 'labelPosition',
      type: "'start' | 'end'",
      description: '标签出现在开关的哪一侧。"start" 将标签放在开关前面。',
      default: "'end'",
    },
    {
      name: 'labelSpacing',
      type: "'hug' | 'spread'",
      description:
        '标签和开关之间的间距行为。"hug" 将它们并排放置；"spread" 将它们推到容器的两端（全宽）。"default" 是 "hug" 的已弃用别名。',
      default: "'hug'",
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-switch',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {
        className: 'astryx-switch-thumb',
        visualProps: ['size'],
        states: ['checked'],
      },
      {
        className: 'astryx-switch-field',
        visualProps: ['labelPosition', 'labelSpacing'],
      },
      {className: 'astryx-switch-label'},
    ],
  },
  usage: {
    description:
      'A toggle control for on/off states that take effect immediately. Supports labels, descriptions, loading states, and validation. Use it for settings or preferences that apply instantly. For changes requiring a form submission, use a checkbox instead. Under a finger it moves like the iOS switch on every touch screen: a press lifts the thumb, a drag across flips it, lifting the finger commits, and a tap toggles through the browser’s click. The thumb keeps its circle and size on every device, and under a coarse pointer the invisible hit area grows toward 44 × 44 px, stopping halfway to any neighbouring control so a tap goes to the nearer one. With reduced motion on, a change cross-fades on a touch screen and is immediate with a mouse.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for settings that apply immediately; the toggle should take effect without a separate save action.',
      },
      {
        guidance: true,
        description:
          'Pair with a clear, concise label that describes the setting being controlled.',
      },
      {
        guidance: false,
        description:
          'Use for options that require a form submission to take effect; use a checkbox instead.',
      },
      {
        guidance: false,
        description:
          "Use a switch for multi-state values; it's strictly on/off.",
      },
      {
        guidance: false,
        description:
          'Wrap a disabled switch in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '布尔值的切换开关，带集成标签支持。',
  usage: {
    description:
      '用于立即生效的开/关状态的切换控件。支持标签、描述、加载状态与校验。适用于即时生效的设置或偏好。需要表单提交才生效的更改请改用复选框。触屏上手指操作时表现与 iOS 开关一致：按下抬起滑块，拖过即翻转，抬手提交，轻点通过浏览器的 click 切换。滑块在所有设备上保持圆形与尺寸，粗指针下不可见点击区域向 44 × 44 px 扩展，与相邻控件各让一半间距，使轻点落在更近的控件上。开启减弱动效时，触屏上变化以交叉淡入呈现，鼠标下则立即生效。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于立即生效的设置；切换应当无需单独保存操作即可生效。',
      },
      {
        guidance: true,
        description:
          '搭配清晰简洁的标签，描述所控制的设置。',
      },
      {
        guidance: false,
        description:
          '需要表单提交才生效的选项不要用；请改用复选框。',
      },
      {
        guidance: false,
        description:
          '多状态取值不要用开关；它严格是开/关。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的开关包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    ref: '转发至底层 <input> 的 ref',
    label: '标签文本（为无障碍始终渲染）。',
    value: '开关是开还是关。',
    onChange: '开关状态变化时触发。',
    changeAction:
      'onChange 后的异步操作；触发乐观 UI + 加载指示器直到完成。',
    isLoading: '加载状态；在滑块内显示加载指示器。',
    isLabelHidden: '视觉上隐藏标签；屏幕阅读器仍可访问。',
    description: '标签下方的描述文本。',
    isDisabled: '开关是否禁用。',
    htmlName: '复选框的 HTML name 属性；开启时提交 "on"。',
    isOptional: '字段是否可选；与 isRequired 互斥。',
    isRequired: '开关是否必填；与 isOptional 互斥。',
    status:
      '带类型 + 消息的状态指示器；彩色消息框，error 时设置 aria-invalid。',
    onFocus: '开关获得焦点时触发。',
    onBlur: '开关失去焦点时触发。',
    labelIcon: '标签文本前的图标。',
    labelTooltip: '标签末尾信息图标中的工具提示文本。',
    labelPosition: '标签出现在哪一侧；"start" 放在开关前面。',
    labelSpacing:
      '间距行为；"hug" 并排，"spread" 推到两端（全宽）。',
  },
};
