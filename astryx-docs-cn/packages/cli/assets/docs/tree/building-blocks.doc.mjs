// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs authoring/building-blocks — the kinds you can add. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'building-blocks',
  placement: {parent: 'namespace:authoring', slot: 'guides', order: 20},
  title: '构建素材',
  summary:
    '添加组件、模板、主题、文档与 codemod，并配置集成如何工作。',
  keywords: [
    'authoring',
    '构建素材',
    '贡献',
    '向集成添加内容',
    '贡献类型',
  ],
  slots: {
    guides: {
      title: '构建素材',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：用户把你的包安装到电脑上、与全局 CLI 并列时，你添加的每一类内容也会在任何项目之外的目录中生效；在项目内，则只有该项目也安装了它才生效。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
    },
    {
      type: 'prose',
      text: '以下就是你能向集成添加的全部内容类型，可以任意组合，不限于其中某一种。',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        '一个组件，或一整个组件库。',
        '组件搭配主题与模板。',
        '只要文档，如果这就是你所需的全部。',
        '智能体（agent）指引，让应用中的 AI 智能体遵循你的组件库。',
        'codemod，在你的破坏性变更中自动更新应用代码。',
      ],
    },
    {
      type: 'prose',
      text: '下面的每一类内容都有自己的指南。打开其中一篇，即可深入了解如何添加它，以及随着包的成长如何保持其健康。',
    },
  ],
};
