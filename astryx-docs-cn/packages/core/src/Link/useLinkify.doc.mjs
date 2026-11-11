// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLinkify',
  displayName: 'useLinkify',
  keywords: [
    'linkify',
    'link',
    'autolink',
    'url',
    'email',
    'mailto',
    '纯文本',
    '自定义模式',
    'issue 引用',
    'LinkProvider',
    'routing',
    '链接',
    '自动链接',
  ],
  params: [
    {
      name: 'text',
      type: 'string',
      description:
        '要扫描的纯文本。空文本返回仅含自身的单元素数组。',
      required: true,
    },
    {
      name: 'options',
      type: 'UseLinkifyOptions',
      description: '配置对象。',
      required: false,
    },
    {
      name: 'options.patterns',
      type: 'LinkifyPattern[]',
      description:
        '在内置 URL 与 email 检测之外额外检测的自定义模式（设 hasBuiltins false 时则取代内置检测）。每个模式是一个带全局标志的正则加一个 href 构造器（可用捕获组）、一个可选的 label 构造器与 isExternal 标志。匹配重叠时取最早者；起点相同时自定义模式优先于内置模式。',
      required: false,
    },
    {
      name: 'options.hasBuiltins',
      type: 'boolean',
      description:
        '包含内置的 http(s) URL 与 email 检测。默认 true；当链接识别完全由 patterns 定义时设为 false。',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: '(return value)',
      type: 'ReactNode[]',
      description:
        '把文本返回为纯字符串与 Link 元素的混合数组，每个匹配一个元素，可直接渲染进文本容器。匹配到的 URL 以外部方式打开（isExternal），email 链接为 mailto:，所有链接都经 Link 渲染——因此 LinkProvider 能像手写的 Link 一样在客户端路由点击。',
    },
  ],
  usage: {
    description:
      '在纯文本中查找 URL、email 地址与自定义模式，为每个匹配返回带 Link 的 React 节点；链接遵循 LinkProvider 做客户端路由。凡用户或工具生成的纯文本需要长出安全、有样式的链接，又不希望预先解析成标记的场景都可使用：动态流、评论串、描述字段。自定义模式通过提供一个正则加一个 href 构造器，把项目专属引用（如 #123 这样的 issue 编号、工单 ID）变成链接——例如把捕获组映射到其 URL scheme 的 issue 追踪模式。匹配重叠时取最早者；起点相同时自定义模式优先于内置模式，因此自定义 #123 模式可以与 URL 检测在同一字符串中共存。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把返回的节点直接渲染进文本容器（<p>{nodes}</p>）；hook 已把未匹配的纯文本交错编入。',
      },
      {
        guidance: true,
        description:
          '用 LinkProvider 包裹应用（或所在区域），让检测到的链接走客户端路由而不是整页跳转。',
      },
      {
        guidance: true,
        description:
          '自定义模式要带全局标志（g）。缺了它扫描不会前进，文本含匹配时渲染永远不会结束。',
      },
      {
        guidance: false,
        description:
          '不要在链接化之前把文本预解析成自己的标记——这个 hook 的存在意义就是让纯字符串按原样渲染并把链接组合进去。',
      },
    ],
  },
  relatedComponents: ['Link', 'LinkProvider'],
  importPath: '@astryxdesign/core',
  category: 'link',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '在纯文本中查找 URL、email 与自定义模式；返回纯字符串与 Link 元素交错的 ReactNode[]，链接遵循 LinkProvider 路由。内置 URL/email 检测，自定义全局正则模式带 href/label 构造器，重叠时最早匹配优先（起点相同时自定义优先）。',
  paramDescriptions: {
    text: '要扫描的纯文本；空文本返回 [text]。',
    options: '配置对象。',
    'options.patterns':
      '加在内置检测之前的自定义 LinkifyPattern；每个是 /g 正则 + href 构造器（+ 可选 label、isExternal）。',
    'options.hasBuiltins':
      '包含内置 URL/email 检测（默认 true）。',
  },
  returnDescriptions: {
    '(return value)':
      '纯字符串与 Link 元素的混合数组，可直接放进文本容器；URL 外部打开，email 为 mailto:，全部经 Link/LinkProvider。',
  },
  usage: {
    description:
      '在用户编写的纯文本（动态流、评论、描述）中长出安全、有样式的链接，无需预解析。自定义模式通过捕获组把项目引用（#123、工单 ID）映射到 URL scheme。重叠：最早匹配优先；起点相同时自定义优先。',
    bestPractices: [
      {
        guidance: true,
        description:
          '节点按原样渲染；纯文本已交错编入。',
      },
      {
        guidance: true,
        description: '区域外层包 LinkProvider 以走客户端路由。',
      },
      {guidance: true, description: '自定义模式必须带 g 标志。'},
      {
        guidance: false,
        description: '不要在链接化之前把文本预解析成标记。',
      },
    ],
  },
};
