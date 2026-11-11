// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useAnnounce',
  displayName: 'useAnnounce',
  keywords: [
    'announce',
    'live region',
    'aria-live',
    'screen reader',
    'accessibility',
    'a11y',
    'status',
    'alert',
    'polite',
    'assertive',
    'visually hidden',
    'wcag',
    'replace',
    'result count',
    '播报',
    '实时区域',
    '屏幕阅读器',
  ],
  params: [
    {
      name: 'options',
      type: 'UseAnnounceOptions',
      description: '配置对象。',
      required: false,
    },
    {
      name: 'options.hasReplace',
      type: 'boolean',
      description:
        '该实例只陈述一个当前状态，如搜索的结果数：它写入的每条消息会撤回该实例上一条尚未播报的消息 (无论礼貌级别)，并以自己的礼貌级别播报。已播报的消息保留。其他实例及未开 hasReplace 的实例的消息仍会合并。组件报告的每种状态各给一个实例，例如结果数一个、选择变化一个。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'announce',
      type: '(message: string, politeness?: "polite" | "assertive") => void',
      description:
        '通过调用方可被听到的实时区域播报消息：页面 body 上的共享区域；当调用组件渲染在打开的 Astryx 模态框 (Dialog、模态 BottomSheet、模态 Drawer、Lightbox、MobileNav、CommandPalette) 内时，则是该模态框内的常驻区域——原生模态框会把页面 body 区域对辅助技术隐藏。politeness 默认 "polite"；同一帧内播报的消息按顺序合并为一次播报，相同的重复只保留一次，但 hasReplace 实例的每条消息会替换该实例上一条尚未播报的消息。空消息不播报，而是清除任何残留状态，包括尚未播报的合并消息。',
    },
  ],
  usage: {
    description:
      '以命令式方式通过视觉隐藏的实时区域向屏幕阅读器播报消息。用于仅靠视觉传达的状态：搜索结果数、“无结果”、加载与保存确认、校验错误 (WCAG 4.1.3 状态消息)。polite 与 assertive 区域在首次使用时以空内容创建并保持挂载，这正是播报可靠的原因：多数屏幕阅读器会忽略与内容一起插入的实时区域。每条消息在播报后几秒即被清空，避免过期状态滞留在无障碍树中。消息送达调用者所在之处：从打开的 Astryx 模态框内发出会送往该模态框内的区域并在其中被听到，调用代码无需改动；模态框即将关闭时发出的消息会经由之后暴露的区域送达而非丢失。模态框外发出的调用——即使来自渲染它的组件——使用页面 body 区域。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用它替代手搓 aria-live div；与内容一起渲染的区域通常根本不播报。',
      },
      {
        guidance: true,
        description:
          '"polite" 用于状态与结果数；"assertive" 留给错误与时效性警报，因为它会打断屏幕阅读器正在说的内容。',
      },
      {
        guidance: true,
        description:
          '播报结果而非交互：“12 个结果”而非“已执行搜索”。',
      },
      {
        guidance: true,
        description:
          '持续变化的值 (如用户输入时的结果数) 走专用的 useAnnounce({hasReplace: true}) 实例，让快于一帧的输入只播报最新计数。',
      },
      {
        guidance: false,
        description:
          '不要播报 DOM 中已可见且已正确标注的内容；那对屏幕阅读器用户是重复打扰。',
      },
    ],
  },
  relatedComponents: ['VisuallyHidden', 'Toast'],
  relatedHooks: ['useClipboard'],
  importPath: '@astryxdesign/core/hooks',
  category: 'accessibility',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '命令式屏幕阅读器播报，经视觉隐藏实时区域：页面 body 区域，或调用组件渲染所在的打开 Astryx 模态框内的区域 (原生模态框会隐藏 body 区域)。polite + assertive 区域首次使用时空创建并保持挂载，播报因此可靠 (多数辅助技术忽略与内容一起插入的实时区域)。消息约 2 秒后自动清除。',
  paramDescriptions: {
    options: '配置对象。',
    'options.hasReplace':
      '实例只陈述一个当前状态 (如搜索结果数)：每条消息撤回该实例上一条未播报消息 (无论礼貌级别)，以自己的级别播报；已播报的保留；其他实例及未开 hasReplace 的实例仍合并。默认 false。',
  },
  returnDescriptions: {
    announce:
      '经调用方可被听到的实时区域播报消息：页面 body，或调用组件渲染所在的打开 Astryx 模态框内 (Dialog、模态 BottomSheet/Drawer、Lightbox、MobileNav、CommandPalette)。politeness 默认 "polite"；同帧消息按序合并，相同重复只留一次，但 hasReplace 实例替换自身未播报消息；空消息清除残留及未播报状态。',
  },
  usage: {
    description:
      '向屏幕阅读器播报仅视觉传达的状态：结果数、“无结果”、加载/保存确认、校验错误 (WCAG 4.1.3)。区域预先空挂载，更新才可播报；文本自动清除，过期状态不滞留无障碍树。',
    bestPractices: [
      {
        guidance: true,
        description:
          '替代手搓 aria-live div；与内容一起渲染的区域通常不播报。',
      },
      {
        guidance: true,
        description:
          '"polite" 用于状态/计数；"assertive" 仅用于错误与时效性警报 (会打断)。',
      },
      {
        guidance: true,
        description:
          '播报结果而非交互：“12 个结果”，不是“已执行搜索”。',
      },
      {
        guidance: true,
        description:
          '持续变化的值 (输入时的结果数)：用专属 useAnnounce({hasReplace: true}) 实例，快于一帧的输入只播报最新。',
      },
      {
        guidance: false,
        description:
          '别播报 DOM 中已可见且已标注的内容；对辅助技术用户是重复。',
      },
    ],
  },
};
