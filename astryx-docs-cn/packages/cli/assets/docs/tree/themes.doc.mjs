// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes`: author a theme
 * in an integration; apps install, apply, and extend it like any theme.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'themes',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 30},
  title: '主题',
  summary:
    '在你的集成中编写主题；应用可以像使用任何主题一样安装、应用并扩展它。',
  keywords: [
    '集成主题',
    '交付主题',
    '定义主题',
    '主题调色板',
    '扩展主题',
  ],
  blocks: [
    {
      type: 'prose',
      text: '全局模式下：在项目之外，主题列表包含为整台计算机安装的集成所提供的主题，且在那里的 `theme add` 也只会展示这些主题；而在项目内，它只列出该项目所安装集成的主题。参见 {@link namespace:global} 与 {@link generic:global-integrations}。',
    },
    {
      type: 'prose',
      text: '主题贡献包含可编辑的 `defineTheme` 源码，外加构建产物模块与生产 CSS。`integration add theme` 初始化源码脚手架并声明包的 exports；`theme build` 写出构建产物。应用安装该包、运行 `theme add`、从生成的应用模块中应用主题，并通过 `extends` 定制它，而不是复制源码。',
    },
    {
      type: 'prose',
      text: '这些指南覆盖完整路径：初始化源码脚手架、生成调色板、定义并构建主题、交付字体与资源、运行 `integration verify`，以及编写文档说明应用如何添加和扩展主题。应用主题（包括模式与 SSR）对所有主题都一样；参见 {@link generic:use-a-theme}。',
    },
  ],
  slots: {
    guides: {
      title: '指南',
      accepts: {kinds: ['generic']},
    },
  },
};
