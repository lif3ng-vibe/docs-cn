// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring`: everything for integration authors. The
 * guides build, ship, and fix an integration package; the field reference
 * covers every file it holds.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'authoring',
  title: '创作指南',
  summary:
    '构建一个为 Astryx 应用添加组件、模板、主题、文档与 codemod 的 npm 包，并查阅其中每个文件的每个字段。',
  keywords: [
    'authoring',
    'integration',
    '集成包',
    '制作集成',
    '发布集成',
    '集成创作',
    '创作参考',
  ],
  slots: {
    guides: {
      title: '构建集成',
      accepts: {kinds: ['generic', 'namespace']},
    },
    reference: {
      title: '参考',
      accepts: {kinds: ['generic']},
    },
  },
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：用户可以把你的集成安装到电脑上、与全局 CLI 并列。此后它在任何项目之外的目录中生效；在项目内，则只有该项目也安装了它才生效。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
    },
    {
      type: 'prose',
      text: '集成是一种与 Astryx 用户共享内容的方式：一个由你拥有和维护的包，构建在 Astryx 提供的框架之上。可以发布一个、多个或任意组合，人们一步即可安装。它与 Astryx CLI 及 Core 协同工作。各类内容见 {@link namespace:building-blocks}。',
    },
    {
      type: 'prose',
      text: '例如，把一个轮播组件作为集成交付。任何安装了它的应用都能通过 `{@command search carousel}` 找到它，CLI 会像使用 Astryx Core 组件一样使用它。',
    },
    {
      type: 'prose',
      text: '集成还可以替换内置模板或文档。开始之前，请安装 `@astryxdesign/cli` 并打开 {@link generic:quick-start}。',
    },
    {
      type: 'prose',
      text: '为集成编写的每个文件、每个字段的定义都在 {@link generic:field-reference}。',
    },
    {
      type: 'prose',
      text: '每个集成都要在自己的构建中运行 `{@command integration check --strict}`：这是必须项而非可选项，这样文档、prop 或链接一旦与代码不再匹配，失败的是你的构建，而不是用户的应用。见 {@link generic:checks}。',
    },
  ],
};
