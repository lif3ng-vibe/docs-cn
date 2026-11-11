// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'InputGroup',
  displayName: 'Input Group',
  group: 'Field',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  keywords: [
    'inputgroup',
    'addon',
    'prefix',
    'suffix',
    'connected',
    'grouped',
    'input',
    '输入组',
    '前缀',
    '后缀',
  ],
  theming: {
    targets: [
      {className: 'astryx-input-group', visualProps: ['size', 'status']},
      {className: 'astryx-input-group-text'},
    ],
  },
  description:
    '把输入框与前缀、后缀附件组合成一行相连的整体。获得焦点的成员会浮在相邻元素之上，焦点环得以完整显示。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'InputGroupText、Button 附件以及兼容的输入子元素：TextInput、NumberInput、TimeInput、DateInput、Typeahead、Selector 或 MultiSelector。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '组的无障碍标签。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签与输入组之间的帮助文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用整个组。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '在标签后显示 "可选" 指示器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '组内输入框的默认尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '校验状态。消息显示在组下方。组的边框不变；主题可依据 `data-status` 设置该行的样式。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签末尾的工具提示文本。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '测试选择器。',
    },
  ],
  components: [{name: 'InputGroupText'}],
  usage: {
    description:
      'InputGroup 把输入框与前缀/后缀附件连接成一个视觉单元。用于 URL 输入框、货币输入框、带操作按钮的搜索框，或任何需要上下文装饰的输入框。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用文本附件显示单位、前缀或后缀，说明输入格式（如 "$"、"kg"、"https://"）。',
      },
      {
        guidance: true,
        description:
          '静态前缀/后缀（如 "$"、"kg"、"https://"）用 InputGroupText。',
      },
      {
        guidance: true,
        description:
          '附加到输入框的操作用 Button；InputGroup 自动连接其圆角。',
      },
      {
        guidance: true,
        description:
          'InputGroup 搭配兼容的单行输入：TextInput、NumberInput、TimeInput、DateInput、Typeahead、Selector、MultiSelector。',
      },
      {
        guidance: true,
        description:
          '组内每个输入的 label 保持具体；分组输入会自动把组 label 与自身 label 组合，并继承组的 description/status 上下文。',
      },
      {
        guidance: false,
        description:
          '不要把多个文本输入放进一个组；请用独立字段。',
      },
      {
        guidance: false,
        description:
          '不要用 InputGroup 放无关输入；它服务于带装饰的单个输入。',
      },
      {
        guidance: false,
        description:
          '不要将 InputGroup 与 TextArea、Slider、Switch、CheckboxInput 或 RadioList 搭配。',
      },
    ],
    anatomy: [
      {name: 'Label', required: true, description: '组上方的文本。'},
      {
        name: 'Prefix addon',
        required: false,
        description: '输入框之前的内容（文本、图标或按钮）。',
      },
      {
        name: 'Input',
        required: true,
        description:
          '主输入元素（TextInput、NumberInput、TimeInput、DateInput、Typeahead、Selector 或 MultiSelector）。',
      },
      {
        name: 'Suffix addon',
        required: false,
        description: '输入框之后的内容（文本、图标或按钮）。',
      },
      {
        name: 'Status message',
        required: false,
        description: '组下方的 error、warning 或 success 消息。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '把输入框与前缀/后缀附件组合在相连容器中',
  usage: {
    description:
      'InputGroup 把输入框与附件相连。用于 URL 输入框、货币输入框、带操作的搜索框。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用文本附件显示单位、前缀或后缀，说明输入格式（如 "$"、"kg"、"https://"）。',
      },
      {
        guidance: true,
        description:
          '静态前缀/后缀（如 "$"、"kg"、"https://"）用 InputGroupText。',
      },
      {
        guidance: true,
        description:
          '附加到输入框的操作用 Button；InputGroup 自动连接其圆角。',
      },
      {
        guidance: true,
        description:
          'InputGroup 搭配兼容的单行输入：TextInput、NumberInput、TimeInput、DateInput、Typeahead、Selector、MultiSelector。',
      },
      {
        guidance: true,
        description:
          '组内每个输入的 label 保持具体；分组输入会把组 label 与自身 label 组合，并继承组的 description/status。',
      },
      {
        guidance: false,
        description:
          '不要把多个文本输入放进一个组；请用独立字段。',
      },
      {
        guidance: false,
        description:
          '不要用 InputGroup 放无关输入；它服务于带装饰的单个输入。',
      },
      {
        guidance: false,
        description:
          '不要将 InputGroup 与 TextArea、Slider、Switch、CheckboxInput 或 RadioList 搭配。',
      },
    ],
  },
};
