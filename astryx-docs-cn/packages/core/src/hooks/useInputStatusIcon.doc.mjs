// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useInputStatusIcon',
  displayName: 'useInputStatusIcon',
  keywords: [
    'input',
    'status',
    '状态',
    'icon',
    '图标',
    'error',
    'warning',
    'success',
    'validation',
    '校验',
    'tooltip',
    'info tip',
    'field',
    'describedby',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseInputStatusIconOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.status',
      type: 'InputStatus',
      description:
        "input 的状态（类型加消息），没有状态时为 undefined。",
    },
    {
      name: 'options.statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description: '状态相对 input 的呈现方式。',
      default: "'attached'",
    },
    {
      name: 'options.isInGroup',
      type: 'boolean',
      description:
        'input 是否位于 InputGroup 内——InputGroup 自行负责状态渲染。',
      default: 'false',
    },
    {
      name: 'options.size',
      type: 'IconSize',
      description: '字段内图标的大小。',
      default: "'md'",
    },
  ],
  returns: [
    {
      name: 'statusIcon',
      type: 'ReactNode',
      description:
        '渲染在 input 容器内的交互元素：普通图标，或带工具提示的可聚焦信息提示按钮。不应渲染图标时为 null。',
    },
    {
      name: 'describedBy',
      type: 'string | undefined',
      description:
        "添加到 input 的 aria-describedby 的 ID，恰好在工具提示元素存在于 DOM 中时才有值，因此不会出现悬空引用。",
    },
  ],
  usage: {
    description:
      '为描边 input 构建字段内的状态交互元素及其无障碍接线，使同族每个 input 在给定状态下表现一致。attached 变体渲染普通字形，把文本留给消息框；detached 变体在这里不渲染任何东西，因为消息框已自带图标；tooltip 变体渲染一个真正可聚焦的按钮，其工具提示可通过键盘、指针、触屏与辅助技术访问。构建描边 input 时使用它，不要用于字段级消息展示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 statusIcon 渲染在 input 容器内，并把 describedBy 合并进控件的 aria-describedby 列表。',
      },
      {
        guidance: true,
        description:
          '让 hook 决定何时不渲染；把 isInGroup 和变体透传进来，而不是在调用处自行分支。',
      },
      {
        guidance: false,
        description:
          '不要只靠图标传达状态；只有 tooltip 变体携带消息，其余变体仍需消息框。',
      },
    ],
  },
  relatedComponents: [
    'TextInput',
    'TextArea',
    'NumberInput',
    'DateInput',
    'FileInput',
    'FieldStatus',
    'InputGroup',
  ],
  relatedHooks: ['useInputContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '为描边 input 构建字段内状态交互元素 + 无障碍接线。attached = 普通字形（消息框承载文本）；detached = 不渲染（消息框自带图标）；tooltip = 可聚焦的信息提示按钮，可经键盘/指针/触屏/辅助技术访问。',
  paramDescriptions: {
    options: '配置对象。',
    'options.status': 'input 状态（类型 + 消息），或为 undefined。',
    'options.statusVariant': '状态相对 input 的呈现方式。',
    'options.isInGroup': '位于 InputGroup 内，由其自行负责状态渲染。',
    'options.size': '字段内图标大小。',
  },
  returnDescriptions: {
    statusIcon:
      '渲染在 input 容器内的节点；不应渲染任何东西时为 null。',
    describedBy:
      '用于 aria-describedby 的 ID，恰好在工具提示元素位于 DOM 中时才有值。',
  },
  usage: {
    description:
      '构建描边 input 时使用，使所有 input 在同一状态下表现一致；不用于字段级消息展示。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 statusIcon 渲染在 input 容器内；把 describedBy 合并进 aria-describedby。',
      },
      {
        guidance: true,
        description:
          '透传 isInGroup 与变体；让 hook 决定何时不渲染。',
      },
      {
        guidance: false,
        description:
          '不要只靠图标表达含义；只有 tooltip 变体携带消息。',
      },
    ],
  },
};
