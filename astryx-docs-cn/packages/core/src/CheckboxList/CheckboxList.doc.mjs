// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Group',
    required: true,
    description: '带标签复选框组的容器。',
  },
  {
    name: 'Group label',
    required: true,
    description: '说明复选框选项所代表内容的文本。',
  },
  {
    name: 'Description',
    required: false,
    description: '组标签下方的辅助文本。',
  },
  {
    name: 'Options list',
    required: true,
    description: '包含可用复选框选项的列表。',
  },
  {
    name: 'Option row',
    required: true,
    description: '包含单个选项的可选行。',
  },
  {
    name: 'Checkbox',
    required: true,
    description: '选项的选中指示器。',
  },
  {
    name: 'Option label',
    required: true,
    description: '标识选项的主要内容。',
  },
  {
    name: 'Option description',
    required: false,
    description: '选项标签下方的次要文本。',
  },
  {
    name: 'End content',
    required: false,
    description: '选项行末尾由调用方提供的内容。',
  },
  {
    name: 'Spinner',
    required: false,
    description: '等待中的复选框内显示的加载指示器。',
  },
  {
    name: 'Status message',
    required: false,
    description: '组下方的错误、警告或成功消息。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CheckboxList',
  displayName: 'Checkbox List',
  group: 'Checkbox',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  keywords: [
    '复选框列表',
    '复选框',
    '复选框组',
    '多项选择',
    '多选',
    '清单',
  ],
  description:
    '复选框组容器，与字段集成以提供标签、描述与状态。',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '复选框组的标签文本（为无障碍而始终渲染）。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'CheckboxListItem 元素。',
      slotElements: [
        {
          __element: 'CheckboxListItem',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
      required: true,
    },
    {
      name: 'value',
      type: 'string[]',
      description: '当前选中的值（collection 模式）。',
    },
    {
      name: 'onChange',
      type: '(values: string[]) => void',
      description: '选中值变化时触发的回调。',
    },
    {
      name: 'changeAction',
      type: '(values: string[]) => void | Promise<void>',
      description:
        '变更时的异步操作，带乐观更新。Promise 等待期间，被切换项的复选框内显示加载指示器，并标记为 aria-busy。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '组是否可选。在组标签后显示可选指示器，除非外层 FormLayout 已默认将字段设为可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '组是否需要至少一个勾选项。按与其他输入字段相同的规则在组标签后显示必填指示器。没有任何勾选项时，浏览器会阻止提交并将焦点移到第一个既非禁用也非只读的复选框，并显示其自带消息。禁用或只读的组不做要求。请通过 status 展示自己的错误文本。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '列表项的间距密度。',
      default: "'balanced'",
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: '是否在项与项之间显示分隔线。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用全部复选框项。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释组为何禁用。作用于整组禁用状态（isDisabled），而非单个项。配合 isDisabled 使用时，在悬停/键盘聚焦时显示 tooltip，并通过 aria-disabled 保持复选框可聚焦（切换仍被阻止）。用它替代把禁用的 CheckboxList 包进 Tooltip 的做法。禁用的控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description:
        '是否将全部复选框项设为只读。以完整不透明度显示当前状态但阻止交互。与 isDisabled 不同，只读复选框不会在视觉上变暗。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '状态指示器（{ type, message }）。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段的宽度（数字 = 像素，字符串按原样使用，如 "100%"）。同时设定整个字段（标签、控件与状态）的宽度，使其保持对齐。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内无效（应改为样式化 InputGroup），在 `horizontal-labels` FormLayout 中也无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        '字段容器的 class 名。定位范围与 `containerXstyle` 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        '字段容器的内联样式。定位范围与 `containerXstyle` 相同。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：即绘制边框与背景、承载图标和末端控件的元素。绝不是原生 input。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的 class 名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  components: [{name: 'CheckboxListItem'}],
  usage: {
    anatomy,
    description:
      'CheckboxList 用于展示一小复选框组，让用户同时开关多个选项。适合放在设置页、筛选面板或需要所有选项无需滚动即可见的表单中。单个独立复选框（如"我同意条款"）请改用 CheckboxInput。只能单选时用 RadioList。列表长到需要搜索或滚动时，请改用 MultiSelector。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持列表简短：三到七个选项最佳。超过后改用带搜索与滚动的 MultiSelector。',
      },
      {
        guidance: true,
        description:
          '选项下方有辅助文本时开启分隔线（hasDividers）；否则标签与描述会混在一起。',
      },
      {
        guidance: true,
        description:
          '组标签要说明选项代表什么："导出格式"比"选项"传达的信息更多。',
      },
      {
        guidance: false,
        description:
          '用户只能选一项时不要用 CheckboxList；这正是 RadioList 的用途。',
      },
      {
        guidance: false,
        description:
          '不要在尾部插槽（endContent）中放按钮或链接；整行已可点击，嵌套按钮会形成两个相互竞争的点击目标。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 CheckboxList 包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
  theming: {
    targets: [{className: 'astryx-checkbox-list'}],
    vars: [
      {
        name: '--_checkbox-row-press-paint',
        description:
          '拥有复选框按下效果的行交给复选框框体的触摸按下涂层：静止时为 none，粗指针下触摸按压控制器按下该行时，按按下力度提供按下涂层。由该行自身的按压部件设置在行上；框体读取最近行的值，因此放在行内容中的列表保留自己各行的涂层。',
        default: 'none',
        private: true,
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'CheckboxList shows a small group of checkboxes so users can turn several options on or off at once. Place it in settings pages, filter panels, or forms where every choice should be visible without scrolling. For a single standalone checkbox (like "I agree to the terms"), use CheckboxInput instead. If only one option can be picked, use RadioList. If the list is long enough to need searching or scrolling, use MultiSelector instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the list short: three to seven options is the sweet spot. Beyond that, switch to MultiSelector which adds search and scrolling.',
      },
      {
        guidance: true,
        description:
          'Turn on dividers (hasDividers) when items have helper text underneath; without them the labels and descriptions blur together.',
      },
      {
        guidance: true,
        description:
          'Write a group label that says what the choices represent: "Export formats" tells users more than "Options".',
      },
      {
        guidance: false,
        description:
          'Show a CheckboxList when the user can only pick one thing; that is what RadioList is for.',
      },
      {
        guidance: false,
        description:
          'Put buttons or links inside the trailing slot (endContent); the whole row is already tappable, so a nested button creates two competing click targets.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled CheckboxList in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '多选值复选框组组件。collection 模式（父级状态）+ 独立模式（每项自身状态）。',
  usage: {
    description:
      'CheckboxList 用于展示一小复选框组，让用户同时开关多个选项。适合放在设置页、筛选面板或需要所有选项无需滚动即可见的表单中。单个独立复选框（如"我同意条款"）请改用 CheckboxInput。只能单选时用 RadioList。列表长到需要搜索或滚动时，请改用 MultiSelector。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持列表简短：三到七个选项最佳。超过后改用带搜索与滚动的 MultiSelector。',
      },
      {
        guidance: true,
        description:
          '选项下方有辅助文本时开启分隔线（hasDividers）；否则标签与描述会混在一起。',
      },
      {
        guidance: true,
        description:
          '组标签要说明选项代表什么："导出格式"比"选项"传达的信息更多。',
      },
      {
        guidance: false,
        description:
          '用户只能选一项时不要用 CheckboxList；这正是 RadioList 的用途。',
      },
      {
        guidance: false,
        description:
          '不要在尾部插槽（endContent）中放按钮或链接；整行已可点击，嵌套按钮会形成两个相互竞争的点击目标。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 CheckboxList 包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
};
