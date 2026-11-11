// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useOutlineFromMarkdown',
  displayName: 'useOutlineFromMarkdown',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'markdown',
    'headings',
    'heading ids',
    'same-page navigation',
    '大纲',
    '目录',
    '标题',
    '同页导航',
  ],
  params: [
    {
      name: 'markdown',
      type: 'string',
      description:
        'Markdown 源。传入你用 Markdown 渲染的同一字符串。',
      required: true,
    },
    {
      name: 'options',
      type: 'ParseOutlineFromMarkdownOptions',
      description:
        '解析选项。文档不经插件渲染时省略。',
      required: false,
    },
    {
      name: 'options.plugins',
      type: 'ReadonlyArray<MarkdownPluginEntry>',
      description:
        '有序 Markdown 插件列表。把同一列表传给 Markdown，使转换、标签与 id 一致。列表引用变化时会重新计算大纲。',
      required: false,
    },
    {
      name: 'options.isFinal',
      type: 'boolean',
      description:
        '源是否完整。Markdown 的 isStreaming 为 true 期间传 false，使两者应用相同的转换。',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'items',
      type: 'OutlineItem[]',
      description:
        '每个根标题一项，按文档顺序，可直接用于 Outline 的 items prop。在无 sources 的完整文档中，id 即 Markdown 渲染在标题上的 id，label 是标题文本，level 是其 1 到 6 的层级。',
    },
  ],
  usage: {
    description:
      '提取 Markdown 字符串的标题，供渲染文档旁的 Outline 使用。它使用与 Markdown 相同的解析器与标题 slug，因此在完整文档中每项都链接到其标题，且围栏代码绝不计为标题。结果基于源与选项做记忆化。在 React 之外，请用 parseOutlineFromMarkdown。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把同一字符串、插件列表与完成状态传给 Markdown 与本 hook，内容完成后 items 才能与渲染的标题匹配。',
      },
      {
        guidance: true,
        description:
          '把插件列表声明在组件外或做记忆化。每次渲染新数组都会重算大纲。',
      },
      {
        guidance: true,
        description:
          '一页多个文档时，为每个文档安装一个带 headingIdPrefix 的 createMarkdownHeadingLinks，避免 id 冲突。',
      },
      {
        guidance: false,
        description:
          '不要手写 items 或用正则找标题。它们会与渲染出的 id 漂移。',
      },
      {
        guidance: false,
        description:
          '不要指望流式期间每项都有目标。Markdown 逐渐显现文本并裁剪未完成语法，内容完成前标题可能缺失或 id 不同。',
      },
      {
        guidance: false,
        description:
          '不要指望某项链接到引用了 Markdown sources 条目的标题。hook 收不到 sources，因此 id 不同：对于 \'# Intro [ref]\'，Markdown 渲染 intro，而 hook 返回 intro-ref。',
      },
      {
        guidance: false,
        description:
          '不要指望嵌套标题（例如引用块中的标题）也有项。只有根标题成为项。',
      },
    ],
  },
  relatedComponents: ['Outline', 'Markdown'],
  importPath: '@astryxdesign/core/Outline',
  category: 'Navigation',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '把 Markdown 字符串的标题提取为 OutlineItem[]，供渲染文档旁的 Outline 使用。解析器与标题 slug 与 Markdown 相同；基于源与选项记忆化。',
  paramDescriptions: {
    markdown: 'Markdown 源；与 Markdown 渲染的同一字符串。',
    options: '解析选项；文档不带插件时省略。',
    'options.plugins':
      '有序插件列表；把同一列表传给 Markdown。引用变化即重算。',
    'options.isFinal':
      '源是否完整；Markdown 的 isStreaming 为 true 期间传 false。',
  },
  returnDescriptions: {
    items:
      '每个根标题一项，按文档顺序：无 sources 的完整文档中 id 即渲染 id，label 为标题文本，level 为 1-6。',
  },
  usage: {
    description:
      '提取 Markdown 字符串的标题，供渲染文档旁的 Outline 使用。解析器与 slug 与 Markdown 相同，完整文档中 items 链接到其标题。React 之外请用 parseOutlineFromMarkdown。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把同一字符串、插件列表与完成状态传给 Markdown 与本 hook；内容完成后 items 与标题匹配。',
      },
      {
        guidance: true,
        description:
          '保持插件列表稳定；每次渲染新数组都会重算。',
      },
      {
        guidance: true,
        description:
          '一页多个文档：每个文档一个带 headingIdPrefix 的 createMarkdownHeadingLinks。',
      },
      {
        guidance: false,
        description: '不要手写 items 或用正则找标题。',
      },
      {
        guidance: false,
        description:
          '不要指望流式期间每项都有目标；内容完成前标题可能缺失或 id 不同。',
      },
      {
        guidance: false,
        description:
          '不要指望某项链接到引用 sources 条目的标题；hook 收不到 sources，id 会不同。',
      },
      {
        guidance: false,
        description:
          '不要指望嵌套标题也有项；只有根标题算数。',
      },
    ],
  },
};
