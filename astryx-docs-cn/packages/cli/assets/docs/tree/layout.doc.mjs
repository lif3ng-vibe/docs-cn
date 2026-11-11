// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout`: the layout namespace. A root of the docs tree
 * that groups the outside-in layout guides: scaffold, structure,
 * headers-and-panels, spacing, and responsive.
 *
 * The flat layout topic this replaces was a 22 KB monolith. Each child guide
 * now answers one question and is findable by search on its own.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'layout',
  title: '布局',
  summary:
    '由外向内构建应用布局：初始化各区域、组织内容、调优间距，再适配不同宽度。',
  keywords: [
    '布局',
    '初始化',
    '结构',
    '间距',
    '响应式',
    'AppShell',
    'SideNav',
    'TopNav',
    'hasDivider',
    'MobileNav',
    'contentWidth',
  ],
  blocks: [
    {
      type: 'prose',
      text: '由外向内构建布局。在任何内容出现之前先敲定外壳与各区域的预算，再向内推进。内容优先的布局会漂移成一列带内边距的卡片，因为每个区块最终都在发明自己的容器。',
    },
    {
      type: 'list',
      style: 'ordered',
      items: [
        '初始化（scaffold）：选定外壳，为每个区域分配预算，并选择导航方式',
        '组织（structure）：为每个区域的内容排序，并为其选定容器',
        '间距（spacing）：将每个区域对齐到一条内容线，再设定间距与密度',
        '断点（breakpoints）：决定宽度变化时每个区域的行为',
      ],
    },
    {
      type: 'prose',
      text: '本指南只决定布局，不涉及组件 API。运行 `{@command build "<idea>"}` 从最贴合你应用类型的模板开始，运行 `{@command component <Name>}` 查看组件的 prop。',
    },
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
