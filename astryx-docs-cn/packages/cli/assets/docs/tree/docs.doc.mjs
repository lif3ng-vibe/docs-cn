// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/docs`: the guides to
 * writing docs for an integration package, which join the same docs tree as
 * the CLI's own (spec:AST-046, spec:AST-047).
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'docs',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 40},
  title: '文档',
  summary:
    '编写随你的包一起交付的文档，让人们和智能体（agent）既能通过搜索找到，也能逐层浏览。',
  keywords: ['编写文档', '文档话题', '文档小节', 'placement', '链接'],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
  blocks: [
    {
      type: 'prose',
      text: '在全局模式下：为整台电脑安装的集成，其文档在项目之外也会出现；在项目内，则只出现该项目安装的集成的文档。见 {@link namespace:global} 与 {@link generic:global-integrations}。',
    },
  ],
};
