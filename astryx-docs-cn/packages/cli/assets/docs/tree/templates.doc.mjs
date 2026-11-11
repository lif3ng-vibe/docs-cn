// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/templates`: guides for adding,
 * documenting, packaging, and testing templates in an integration package.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'templates',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 20},
  title: '模板',
  summary:
    '模板是用 Astryx 构建的现成 UI 页面或页面分区。应用将它们复制进自己的代码，再适配到自己的产品。',
  keywords: [
    '集成模板',
    '模板质量',
    '模板评级',
    '模板资源',
    '模板包',
    '替换核心模板',
  ],
  slots: {
    build: {
      title: '构建',
      accepts: {kinds: ['generic', 'namespace']},
    },
    quality: {
      title: '质量',
      accepts: {kinds: ['namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：为整台计算机安装的集成，其模板会出现在项目之外；而在项目内，只会显示该项目所安装集成的模板。参见 {@link namespace:global} 与 {@link generic:global-integrations}。',
    },
  ],
};
