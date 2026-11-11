// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  displayName: 'Checkbox Input',
  group: 'Checkbox',
  category: 'Form Controls',
  keywords: [
    '复选框',
    '勾选',
    '切换',
    '对勾',
    '不确定',
    '布尔值',
    '三态',
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
        '复选框的标签文本（为无障碍而始终渲染）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '是否在视觉上隐藏标签（屏幕阅读器仍可访问）。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        '复选框处于选中、未选中还是不确定状态。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '复选框状态变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        '变更时的异步操作。未被阻止时在 onChange 之后触发。等待期间显示加载指示器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '复选框是否处于加载状态。显示加载指示器并阻止交互。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '复选框是否禁用。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '底层复选框 input 的 HTML name 属性，可用于表单提交（勾选时提交 "on"）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释复选框为何禁用。配合 isDisabled 使用时，在悬停/键盘聚焦时显示 tooltip，并通过 aria-disabled 保持复选框可聚焦（切换仍被阻止）。用它替代把禁用的 CheckboxInput 包进 Tooltip 的做法。禁用的控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '复选框是否只读。以完整不透明度显示当前状态但阻止交互。与 `isDisabled` 不同，只读复选框不会在视觉上变暗。',
      default: 'false',
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
        '复选框是否必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        '复选框的尺寸。sm 用于紧凑布局，md 为默认。在粗指针（触摸）下，带标签复选框的目标通过不可见点击区域向 44 px 扩展。它不会缩小到所在行以下，与相邻控件较近时止于间距的一半；控件本身尺寸不变。',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description:
        '显示在标签文本之前的语义图标名称或自定义内容。有效语义名称见 `astryx docs icons`。',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description:
        '状态指示器。在复选框下方显示彩色消息框，错误时设置 aria-invalid。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段的宽度（数字 = 像素，字符串按原样使用，如 "100%"）。同时设定整个字段（标签、控件与状态）的宽度，使其保持对齐。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-checkbox-input', visualProps: ['size']},
      {
        className: 'astryx-checkbox-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-checkbox-label'},
    ],
    vars: [
      {
        name: '--_indicator-press-image',
        description:
          '该行的触摸按下图像，传递给自行绘制按下效果的第一方指示器。仅在该行自身被按下时根据按下涂层设置；在拥有按下效果的 CheckboxList 行之下，取该行的按下涂层。只有该行声明它。',
        default: 'none',
        private: true,
      },
    ],
  },
  usage: {
    accessibility: [
      {
        name: 'Checkbox box',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Checked'],
        description:
          '未选中时的方框边缘与选中时的填充色，与背后表面的对比度至少达到 3:1。Hover 与 Pointer down 状态需测量应用色调与按下覆盖层之后的最终颜色。',
      },
    ],
    description:
      'CheckboxInput 用于切换单个开/关值。适用于"启用通知"这类设置、条款接受或自愿加入的选择。一组中的多个复选框请改用 CheckboxList。',
    bestPractices: [
      {
        guidance: true,
        description:
          '始终提供可见标签，让用户知道自己在切换什么。仅当周围上下文已足够明确时才使用 isLabelHidden。',
      },
      {
        guidance: true,
        description:
          '为需要额外上下文的选项添加 description，例如说明"共享使用数据"实际共享了什么。',
      },
      {
        guidance: true,
        description:
          '组内仅选中部分项目时，"全选"复选框使用 indeterminate 状态。',
      },
      {
        guidance: false,
        description:
          '不要将复选框用于互斥选择；只能单选时请用 RadioList。',
      },
      {
        guidance: false,
        description:
          '不要将复选框用于立即生效的操作；请改用切换开关或按钮。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的复选框包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
    anatomy: [
      {
        name: 'Checkbox',
        required: true,
        description:
          '复选框本体：未选中、选中或不确定状态。',
      },
      {
        name: 'Label',
        required: true,
        description:
          '描述复选框控制对象的文本。出于无障碍始终存在。',
      },
      {
        name: 'Description',
        required: false,
        description: '标签下方的辅助文本，提供额外上下文。',
      },
      {
        name: 'Status message',
        required: false,
        description:
          '复选框下方的错误、警告或成功消息。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxInput',
  displayName: 'Checkbox Input',
  usage: {
    description:
      'CheckboxInput toggles a single on/off value. Use it for settings like "Enable notifications", terms acceptance, or opt-in choices. For multiple checkboxes in a group, use CheckboxList instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a visible label so the user knows what they are toggling. Use isLabelHidden only when surrounding context makes it obvious.',
      },
      {
        guidance: true,
        description:
          'Add a description for choices that need extra context, like explaining what "Share usage data" actually shares.',
      },
      {
        guidance: true,
        description:
          'Use the indeterminate state for "select all" checkboxes when only some items in a group are selected.',
      },
      {
        guidance: false,
        description:
          'Use a checkbox for mutually exclusive choices; use RadioList when only one option can be selected.',
      },
      {
        guidance: false,
        description:
          'Use a checkbox for actions that take effect immediately; use a toggle switch or button instead.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled checkbox in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: '转发至底层 <input> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description: '复选框的标签文本（始终为无障碍性而渲染）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否视觉隐藏标签（屏幕阅读器仍可访问）。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'value',
      type: "boolean | 'indeterminate'",
      description: '复选框是否为选中、未选中或不确定状态。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '复选框状态变更时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        '异步变更操作。在 onChange 之后触发（未被阻止时）。等待期间显示加载旋转器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '复选框是否处于加载状态。显示旋转器并阻止交互。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '复选框是否禁用。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '底层复选框输入的 HTML name 属性，用于表单提交（勾选时提交 "on"）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip: disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '复选框是否为只读。以完整不透明度显示当前状态但阻止交互。与 isDisabled 不同，只读复选框不会变暗。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '复选框是否必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        '复选框尺寸。sm 用于紧凑布局，md 为默认。在粗指针（触摸）下，带可见标签的复选框的目标通过不可见的点击区域向 44 px 扩展。它不小于所在行，与相邻控件较近时止于间距的一半；尺寸不变。',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description: '标签文本前显示的语义图标名称或自定义内容。',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description:
        '状态指示器。在复选框下方显示彩色消息框，错误时设置 aria-invalid。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-checkbox-input',
        visualProps: ['size'],
      },
      {
        className: 'astryx-checkbox-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-checkbox-label'},
    ],
    vars: [
      {
        name: '--_indicator-press-image',
        description:
          '复选框行的触摸按下图像，传递给自行绘制按下效果的第一方指示器。仅在该行自身被按下时根据按下涂层设置；在拥有按下效果的 CheckboxList 行中，取该行的按下涂层。只有该行声明它。',
        default: 'none',
        private: true,
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '用于设置、条款与自愿加入选择的开/关切换',
  usage: {
    description:
      'CheckboxInput 切换单个开/关值。用于设置、条款接受、自愿加入选择。成组请用 CheckboxList。',
    bestPractices: [
      {
        guidance: true,
        description:
          '始终提供可见标签让用户知道在切换什么；仅当上下文足够明确时用 isLabelHidden。',
      },
      {
        guidance: true,
        description:
          '需要额外上下文的选项加 description，如"共享使用数据"实际共享什么。',
      },
      {
        guidance: true,
        description:
          '组内仅部分选中时，"全选"用 indeterminate。',
      },
      {
        guidance: false,
        description:
          '互斥选择不要用复选框；单选用 RadioList。',
      },
      {
        guidance: false,
        description:
          '立即生效的操作不要用复选框；改用开关或按钮。',
      },
      {
        guidance: false,
        description:
          '禁用复选框不要包 Tooltip；禁用控件会吞掉包装层所需悬停事件。改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    ref: '转发至底层 <input> 的 ref',
    label: '标签文本；为无障碍始终渲染',
    isLabelHidden: '视觉隐藏标签（屏幕阅读器仍可访问）',
    description: '标签下方文本',
    value: '选中、未选中或不确定',
    onChange: '状态变化回调',
    changeAction:
      '异步操作；在 onChange 后触发，等待期间显示加载指示器',
    isLoading: '显示加载指示器 + 阻止交互',
    isDisabled: '禁用复选框',
    htmlName: '复选框的 HTML name 属性；勾选时提交 "on"。',
    isOptional: '标记字段可选（与 isRequired 互斥）',
    isRequired: '标记字段必填（与 isOptional 互斥）',
    size: 'sm（紧凑）或 md（默认）',
    onFocus: '获得焦点回调',
    onBlur: '失去焦点回调',
    labelIcon: '标签文本前的语义图标名或自定义内容',
    status: 'error/warning/success 消息；错误时设置 aria-invalid',
  },
};
