// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/components/describe-the-component`:
 * choose and maintain the ComponentDoc shape that matches a component's public
 * source.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'describe-the-component',
  placement: {parent: 'namespace:components', slot: 'guides', order: 20},
  title: '描述组件',
  summary:
    '编写并维护默认的组件文档，并在一个组件族拥有多个导出、或某个成员需要独立文件时进行调整。',
  keywords: [
    '组件文档',
    'component doc',
    '组件族',
    '子组件',
  ],
  slots: {
    guides: {
      title: '描述组件',
      accepts: {kinds: ['generic']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '组件的 `.doc.mjs` 是集成公开契约的一部分，不是可选的注解。Astryx 用它生成 CLI 输出与搜索结果，人们和智能体（agent）读它来判断组件是否适用以及如何使用。',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        '源码与它的 `.doc.mjs` 一同修改。',
        '只要公开名称、导入、行为、prop、默认值、示例或无障碍要求发生变化，就更新文档。',
        '`integration verify` 检查文档结构与打包后的导入，`doctor integration components` 把每张 props 表与组件的 TypeScript props 逐一比对（{@link generic:check-the-props}）。两者都无法证明正文仍与组件相符。',
      ],
    },
    {
      type: 'prose',
      text: '每份组件文档都有一个稳定的身份标识，以及足够的使用指引，让读者能正确选用。请从下面的形态中挑选与你的模块匹配的一种。',
    },
    {
      type: 'prose',
      text: '每次源码或文档变更后，重新读取一遍组件输出。这份输出正是人们和智能体拿到的东西。',
    },
    {
      type: 'code',
      lang: 'bash',
      code: '{@command component AcmeCarousel}',
    },
  ],
};
