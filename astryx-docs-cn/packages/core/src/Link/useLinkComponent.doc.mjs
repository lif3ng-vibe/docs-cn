// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLinkComponent',
  displayName: 'useLinkComponent',
  group: 'Link',
  keywords: [
    'link',
    'router',
    '客户端路由',
    'LinkProvider',
    'as',
    '多态',
    'anchor',
    'nextjs',
    'href',
    '链接',
  ],
  params: [
    {
      name: 'as',
      type: 'LinkComponentType',
      description:
        "渲染链接所用的组件，例如路由器的 link 组件或 'a'。设置后优先于任何 LinkProvider。",
      required: false,
    },
  ],
  returns: [
    {
      name: 'LinkComponent',
      type: 'LinkComponentType',
      description:
        '解析后的组件：依次取 as、最近的 LinkProvider 组件、原生 \'a\'。只要解析结果相同，该组件就保持稳定。渲染前会按 Link href 规则检查 href 与 to；任一被拒绝时渲染无目标的锚点，且绝不调用路由器。除非显式传入 to，自定义组件会收到 to={href}。',
    },
  ],
  usage: {
    description:
      "解析由哪个组件渲染链接，让自定义组件中的链接与应用路由器协同工作，就像 Astryx 自身的链接一样。顺序为：as 参数、最近的 LinkProvider 组件、原生锚点。用 href 渲染返回的组件（若路由器读取 to，也传入 to）。渲染前会按 Link href 规则检查两个目标：被拒绝的目标会渲染成无目标的锚点，且绝不会用它调用自定义路由器。除非显式传入 to，自定义组件会收到 to={href}。",
    bestPractices: [
      {
        guidance: true,
        description:
          '在自定义组件内部的链接上使用它，这样接到路由器上的 LinkProvider 就能作用到它们，无需在每个链接上传 prop。',
      },
      {
        guidance: true,
        description:
          "对路由器无法处理的目标（例如文件下载或应用外的页面）传 as='a'。",
      },
      {
        guidance: false,
        description:
          '不要在共享组件里直接 import 路由器的 link；那样该组件会无视 LinkProvider 与目标检查。',
      },
    ],
  },
  relatedComponents: ['Link', 'LinkProvider'],
  relatedHooks: ['useLinkify'],
  importPath: '@astryxdesign/core/Link',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '解析由哪个组件渲染链接：依次取 as 参数、最近的 LinkProvider 组件、原生锚点。自定义组件中的链接与应用路由器协同，如同 Astryx 链接。按 Link href 规则检查 href/to：被拒绝 => 无目标锚点，绝不调用路由器。除非显式传入 to，自定义组件收到 to={href}。',
  paramDescriptions: {
    as: "渲染链接所用的组件（路由器 link 或 'a'）；优先于 LinkProvider。",
  },
  returnDescriptions: {
    LinkComponent:
      "解析后的组件（as、LinkProvider、'a' 依次取）；按解析结果保持稳定。先检查 href/to；被拒绝 => 无目标锚点，不调用路由器。除非显式传入 to，自定义组件收到 to={href}。",
  },
  usage: {
    description:
      '解析链接组件：依次取 as、最近的 LinkProvider、原生锚点。用 href（及 to）渲染它。被拒绝的目标渲染成无目标锚点，绝不调用路由器。除非显式传入 to，自定义组件收到 to={href}。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在自定义组件内部的链接上使用，让接到路由器的 LinkProvider 能作用到它们。',
      },
      {
        guidance: true,
        description:
          "对路由器无法处理的目标（下载、应用外的页面）传 as='a'。",
      },
      {
        guidance: false,
        description:
          '不要在共享组件里直接 import 路由器 link；那会跳过 LinkProvider 与目标检查。',
      },
    ],
  },
};
