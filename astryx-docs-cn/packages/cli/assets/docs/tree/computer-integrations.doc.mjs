// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/computer-integrations`: integrations installed next to the
 * global install, where they work, and how to see them (spec AST-081 FR12).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'computer-integrations',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 6,
  },
  title: '全局安装的集成',
  category: 'guide',
  keywords: [
    '全局集成',
    '全局安装集成',
    'npm i -g integration',
    '项目之外使用集成',
    '为本机安装',
  ],
  description:
    '与全局安装并列安装的集成，在任何项目之外的文件夹中都可用。在项目内，只有项目安装的集成可用，其余的会列为可添加项。',
  sections: [
    {
      id: 'install',
      title: '全局安装一个集成',
      content: [
        {
          type: 'prose',
          text: '用安装 CLI 的同样方式安装集成，让两者并列放置：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @astryxdesign/cli @acme/widgets --global}',
        },
        {
          type: 'prose',
          text: '把 CLI 与集成一起安装到同一个文件夹并从那里运行 CLI 的工具，同样算数。`npx` 与项目版本的缓存永远不算。',
        },
      ],
    },
    {
      id: 'outside',
      title: '在项目之外，它们生效',
      content: [
        {
          type: 'prose',
          text: '在任何项目之外的文件夹中，Astryx 会像项目加载自己的集成那样，加载与你的全局安装并列的每个集成：它的组件、模板、文档、主题与 discover 源都会出现，它声明的命令名会成为 Astryx 所打印命令的开头。`@astryxdesign/core` 或 `@astryxdesign/cli` 的 peer 范围不含你的全局版本的集成会被跳过，`{@command doctor}` 会说明原因。',
        },
      ],
    },
    {
      id: 'inside',
      title: '在项目内，只有项目的集成生效',
      content: [
        {
          type: 'prose',
          text: '项目的回答必须与它安装的内容匹配：来自它未安装的包的组件无法构建。因此在项目内，仅全局安装的集成不会起任何作用。当它支持项目的版本并能加载时，`{@command discover}` 会把它列在项目可添加的包之中，并附上项目的安装命令。当项目安装了同一个集成时，用的是项目的副本。',
        },
      ],
    },
    {
      id: 'check',
      title: '查看哪些生效',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '在项目之外，`{@command doctor}` 会列出它使用的全局集成，并对每个跳过的发出警告。',
            '在项目内，`{@command doctor}` 和 `{@command discover}` 会列出项目可添加的集成。',
          ],
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于全局模式',
      content: [
        {
          type: 'prose',
          text: '本页属于 {@link namespace:global}，那里解释了全局模式是什么，以及各部分如何运作。构建集成：见 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
