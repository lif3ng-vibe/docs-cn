// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RichTextView',
  displayName: 'Rich Text View',
  category: 'Content',
  keywords: [
    '富文本',
    'richtext',
    'rich text',
    '查看器',
    'viewer',
    '只读',
    'read-only',
    'lexical',
    '渲染',
    'render',
    'serialized',
  ],
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        '要渲染的序列化编辑器状态：JSON.stringify(editorState.toJSON()) 生成的 JSON 字符串。value 变化时视图随之更新。',
      required: true,
    },
    {
      name: 'nodes',
      type: 'ReadonlyArray<Klass<LexicalNode>>',
      description:
        '在默认集合之外注册的 Lexical 节点。请传入内容创作时所用的相同节点，使自定义节点类型能够反序列化。',
    },
    {
      name: 'markdownExtensions',
      type: 'ReadonlyArray<RichTextMarkdownExtension>',
      description:
        '此视图要绘制其节点的 Markdown 插件，每个都经 createRichTextExtension 采用。插件节点按核心 Markdown 的方式渲染；未传入插件的节点则显示其源码。请传入内容转换时所用的扩展，并在客户端模块中创建。',
    },
    {
      name: 'codeLanguages',
      type: 'ReadonlyArray<CodeLanguage>',
      description:
        "代码围栏可声明的 CodeBlock 语言，例如 @astryxdesign/core/CodeBlock/languages/graphql 中的 graphql。请传入与 Markdown 的 codeLanguages 相同的列表，使阅读与编辑使用相同的语言标签与着色。",
    },
    {
      name: 'plugins',
      type: 'ReactNode',
      description:
        '在视图内渲染的只读 Lexical 插件，例如悬停卡片或装饰器。',
    },
    {
      name: 'namespace',
      type: 'string',
      description: 'Lexical composer 命名空间。',
      default: "'astryx-view'",
    },
    {
      name: 'onParseError',
      type: '(error: Error) => void',
      description:
        'value 无法解析或渲染时调用，例如 JSON 格式损坏或节点类型未经 nodes 注册。可用于记录或上报该失败。',
    },
    {
      name: 'errorFallback',
      type: 'ReactNode',
      description:
        'value 无法解析或渲染时渲染的内容。视图渲染它而不是抛出异常。',
      default: 'null',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '视图根元素的 StyleX 样式。',
    },
  ],
  usage: {
    description:
      '只读渲染 RichTextEditor 序列化的内容，与编辑器绘制相同的节点、表格、代码块和 Markdown 插件节点。由 @astryxdesign/richtext 交付，lexical 与 @lexical/* 为可选 peer 依赖。',
    bestPractices: [
      {
        guidance: true,
        description:
          '存储 RichTextEditor onChange 中的 editorState.toJSON()，并将字符串化的 JSON 作为 value 传入。',
      },
      {
        guidance: true,
        description:
          '在编辑器与视图上注册相同的自定义节点与 markdownExtensions，使存储的内容能完整往返。',
      },
      {
        guidance: true,
        description:
          '当存储的内容可能来自更旧或外来的 schema 时，传入 onParseError 与 errorFallback。默认情况下解析失败会渲染空内容而不是抛出异常。',
      },
      {
        guidance: false,
        description:
          '不要用 RichTextView 渲染 Markdown 源码；那个场景请使用核心 Markdown。',
      },
    ],
  },
};
