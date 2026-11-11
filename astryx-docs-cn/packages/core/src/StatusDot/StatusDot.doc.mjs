// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Dot',
    required: true,
    description:
      '承载所选语义变体的绘制状态圆点。',
  },
  {
    name: 'Status icon',
    required: false,
    description: '圆点内渲染的可选调用方图标。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'StatusDot',
  displayName: 'Status Dot',
  category: 'Feedback & Status',
  keywords: [
    'statusdot',
    'dot',
    'indicator',
    '状态点',
    '状态',
    '指示器',
    '信号',
    '在线状态',
    'presence',
    '在线',
  ],
  props: [
    {
      name: 'variant',
      type: "'success' | 'warning' | 'error' | 'accent' | 'neutral'",
      description: '语义颜色变体。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '通过 aria-label 暴露的无障碍标签。',
      required: true,
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description:
        '启用脉冲动画；尊重 prefers-reduced-motion: reduce 设置。',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: '悬停时显示的工具提示文本，解释状态含义。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选图标，居中渲染于圆点内，以 currentColor（变体的前景色）着色。为状态提供非颜色标记，请为每个状态使用不同图标。布尔值和空字符串会被忽略，因此 `cond && <Icon />` 是安全的。与 AvatarStatusDot 的契约一致。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-status-dot', visualProps: ['variant']}],
  },
  usage: {
    anatomy,
    description:
      '传达状态（如在线/离线或严重级别）的小型彩色圆点。支持五种语义变体与可选脉冲动画。始终与可见文本标签搭配，因为不应只靠颜色承载含义。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 StatusDot 用作在/不在的二元信号；不要在一个圆点里编码多个不同状态——仅靠颜色与尺寸无法可靠区分。',
      },
      {
        guidance: true,
        description:
          '始终与可见文本标签搭配，避免状态只靠颜色传达。',
      },
      {
        guidance: true,
        description:
          '提供描述性的 `label` prop，保证屏幕阅读器可访问。',
      },
      {
        guidance: true,
        description:
          '当圆点必须在没有相邻文本的情况下独立成立时，搭配一个以独特形状承载状态的图标，让含义在失去颜色时仍然保留。',
      },
      {
        guidance: true,
        description:
          '如果无法加标签或图标，请确保状态在别处以无障碍方式传达（如相邻文本、表格列或 live region）。',
      },
      {
        guidance: false,
        description:
          '不要只靠颜色传达状态；StatusDot 单独使用并非完全无障碍，构建者必须通过标签、图标或无障碍替代方式让状态在上下文中可区分。',
      },
      {
        guidance: false,
        description:
          '不要把脉冲动画用于纯装饰；请保留给需要立即关注的状态。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'StatusDot',
  displayName: 'Status Dot',
  props: [
    {
      name: 'variant',
      type: "'success' | 'warning' | 'error' | 'accent' | 'neutral'",
      description: '语义颜色变体。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '通过 aria-label 暴露的无障碍标签。',
      required: true,
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description: '启用脉冲动画；尊重 prefers-reduced-motion: reduce 设置。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '可选图标，居中渲染于圆点内，以 currentColor（变体的前景色）着色。为状态提供非颜色标记，请为每个状态使用不同图标。布尔值和空字符串会被忽略，因此 `cond && <Icon />` 是安全的。与 AvatarStatusDot 的契约一致。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-status-dot', visualProps: ['variant']}],
  },
  usage: {
    anatomy,
    description:
      'A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.',
      },
      {
        guidance: true,
        description:
          'Always pair with a visible text label so status is not conveyed by color alone.',
      },
      {
        guidance: true,
        description:
          'Provide a descriptive `label` prop for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.',
      },
      {
        guidance: true,
        description:
          "If you can't add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).",
      },
      {
        guidance: false,
        description:
          'Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.',
      },
      {
        guidance: false,
        description:
          'Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '用于状态显示（在线/离线、严重级别等）的小型彩色圆点指示器。',
  usage: {
    anatomy,
    description:
      '传达状态（如在线/离线或严重级别）的小型彩色圆点。支持五种语义变体与可选脉冲动画。始终与可见文本标签搭配，因为不应只靠颜色承载含义。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用作在/不在的二元信号；不要在一个圆点里编码多个不同状态。',
      },
      {
        guidance: true,
        description:
          '始终与可见文本标签搭配，避免状态只靠颜色传达。',
      },
      {
        guidance: true,
        description:
          '提供描述性的 `label` prop，保证屏幕阅读器可访问。',
      },
      {
        guidance: true,
        description:
          '圆点需独立成立时，搭配以独特形状承载状态的图标，让含义不依赖颜色。',
      },
      {
        guidance: true,
        description:
          '无法加标签或图标时，确保状态在别处以无障碍方式传达（相邻文本、表格列或 live region）。',
      },
      {
        guidance: false,
        description:
          '不要只靠颜色传达状态；StatusDot 单独使用并非完全无障碍，需用标签、图标或无障碍替代方式让状态可区分。',
      },
      {
        guidance: false,
        description:
          '不要把脉冲动画用于纯装饰；保留给需要立即关注的状态。',
      },
    ],
  },
  propDescriptions: {
    variant: '语义颜色变体。',
    label: '经 aria-label 暴露的无障碍标签。',
    isPulsing: '脉冲动画；尊重 prefers-reduced-motion: reduce。',
    tooltip: '悬停时解释状态含义的工具提示文本。',
    icon:
      '可选 ReactNode，居中渲染于圆点内（currentColor 前景色）；状态的非颜色标记，每个状态用不同图标。布尔/空字符串忽略（cond && <Icon/> 安全）。与 AvatarStatusDot 契约一致。',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值。',
  },
};
