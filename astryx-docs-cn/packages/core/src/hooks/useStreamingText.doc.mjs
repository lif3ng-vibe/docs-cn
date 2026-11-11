// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useStreamingText',
  displayName: 'useStreamingText',
  keywords: ['streaming', '流式', 'text', 'typewriter', '打字机', 'animation', 'ai', 'chat', 'markdown', 'reveal', 'llm', 'chunked', '分块'],
  params: [
    {
      name: 'targetText',
      type: 'string',
      description: '要逐步展示的完整目标文本。有新分块到达时，用累积文本更新该值。',
      required: true,
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: '文本当前是否正在流式传输。为 false 时 hook 立即返回完整 targetText。',
      required: true,
    },
    {
      name: 'options',
      type: 'UseStreamingTextOptions',
      description: '流式行为的可选配置。',
      required: false,
    },
    {
      name: 'options.speed',
      type: "'natural' | 'fast' | 'instant'",
      description: "文本展示的速度预设。'natural' 为稳定的约 2 字符/帧，'fast' 随积压缩放约 4 字符/帧，'instant' 直接返回全文、无动画。",
      default: "'natural'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'displayedText',
      type: 'string',
      description: '要渲染的 targetText 部分。流式期间稳定增长直至完整 targetText，非流式时等于 targetText。',
    },
  ],
  usage: {
    description:
      '用 requestAnimationFrame 把突发式的流式文本平滑为稳定的逐字符展示。将到达速率与展示速率解耦。按单词与语法边界推进，避免从 markdown 或单词中间截断，防止 markdown 渲染器出现视觉毛刺。动画时序在可用时经 useTheme 取自 Astryx 动效令牌，在主题 provider 之外有合理的回退。isStreaming 变为 false 时直接跳到全文。',
    bestPractices: [
      { guidance: true, description: '把累积文本（而不是单个分块）作为 targetText 传入；hook 在内部处理增量展示。' },
      { guidance: true, description: '流结束后把 isStreaming 设为 false，以跳到最终文本。' },
      { guidance: true, description: "在搜索结果等无动画场景、或用户偏好减弱动效时使用 speed='instant'。" },
      { guidance: false, description: '不要用于不变的静态文本；对非流式内容 hook 会增加不必要的开销。' },
    ],
  },
  relatedComponents: ['Markdown'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/hooks',
  category: 'streaming',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '用 requestAnimationFrame 把突发式流式文本平滑为稳定的逐字符展示。将到达速率与展示速率解耦。按单词 + 语法边界推进，避免从 markdown/单词中间截断，防止 markdown 渲染器出现视觉毛刺。动画时序在可用时经 useTheme 取自 Astryx 动效令牌，主题 provider 之外有合理回退。isStreaming 变为 false 时跳到全文。',
  paramDescriptions: {
    targetText: '要逐步展示的完整目标文本。有新分块到达时，用累积文本更新该值。',
    isStreaming: '文本当前是否正在流式传输。为 false 时 hook 立即返回完整 targetText。',
    options: '流式行为的可选配置。',
    'options.speed': "文本展示速度预设。'natural' 稳定约 2 字符/帧，'fast' 随积压缩放约 4 字符/帧，'instant' 无动画返回全文。",
  },
  returnDescriptions: {
    displayedText: '要渲染的 targetText 部分。流式期间稳定增长至完整 targetText / 非流式时等于 targetText。',
  },
  usage: {
    description:
      '用 requestAnimationFrame 把突发式流式文本平滑为稳定的逐字符展示。将到达速率与展示速率解耦。按单词 + 语法边界推进，避免从 markdown/单词中间截断，防止 markdown 渲染器出现视觉毛刺。动画时序在可用时经 useTheme 取自 Astryx 动效令牌，主题 provider 之外有合理回退。isStreaming 变为 false 时跳到全文。',
    bestPractices: [
      { guidance: true, description: '把累积文本（而非单个分块）作为 targetText 传入；hook 在内部处理增量展示。' },
      { guidance: true, description: '流结束后把 isStreaming 设为 false，跳到最终文本。' },
      { guidance: true, description: "在搜索结果等无动画场景/偏好减弱动效时使用 speed='instant'。" },
      { guidance: false, description: '不要用于不变的静态文本；对非流式内容 hook 会增加不必要的开销。' },
    ],
  },
};
