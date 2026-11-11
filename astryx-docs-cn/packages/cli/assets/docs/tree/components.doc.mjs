// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components`: guides for adding and
 * documenting components in an integration package.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'components',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 10},
  title: '组件',
  summary:
    '向集成添加组件，编写其公共契约的文档，让它们在安装该包的每个应用中都能工作。',
  keywords: ['集成组件', '交付组件', '组件文档'],
  slots: {
    guides: {
      title: '组件',
      accepts: {kinds: ['generic', 'namespace']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：在项目之外，会显示为整台机器安装的集成所提供的组件；在项目之内，只显示项目安装的集成所提供的组件。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
    },
  ],
};
