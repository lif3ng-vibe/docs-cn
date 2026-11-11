// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs global/monorepos`: how a folder's project is found, in
 * workspaces and nested folders (spec AST-081 FR2).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'monorepos',
  placement: {
    parent: 'namespace:global',
    slot: 'guides',
    order: 7,
  },
  title: 'Monorepo 与嵌套目录',
  category: 'guide',
  keywords: [
    'monorepo',
    'workspace',
    '嵌套目录',
    '嵌套项目',
    '子目录',
    'packages 目录',
    '当前项目',
    'yarn pnp',
    '依赖上提',
  ],
  description:
    'Astryx 如何找到一个目录所属的项目，以及在 monorepo、嵌套应用或另一个项目里克隆的仓库中由哪个版本应答。',
  sections: [
    {
      id: 'find',
      title: '项目如何被找到',
      content: [
        {
          type: 'prose',
          text: 'Astryx 从当前目录向上搜索：当前目录或上方几层装了 `@astryxdesign/core` 或 `@astryxdesign/cli`，否则找最近一个声明了其中之一的 `package.json`，直到仓库根为止。什么都没有的目录在项目之外。',
        },
      ],
    },
    {
      id: 'workspaces',
      title: 'Workspaces',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '声明了 Astryx 的 workspace 成员就是一个独立项目，即使依赖包被上提到仓库根。仓库根的 CLI 照常应答它；自带 Core 而任何地方都没有 CLI 的成员，则由你启动的 astryx 命令应答。',
            '没有自己的 `package.json` 的目录（如 `src/` 或 `scripts/`）归属于其上层项目。',
            '自己构建 CLI 的仓库，CLI 位于 `packages/cli`、与 `packages/core` 里的 Core 并列，运行的就是这个 CLI。',
          ],
        },
      ],
    },
    {
      id: 'nested',
      title: '嵌套目录',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '位于另一个项目内部的目录（如嵌套应用或克隆下来的仓库）由外围项目的版本应答。',
            '目录名的比较方式与文件系统一致：通过链接到达的目录，或在 macOS、Windows 上大小写不同的输入，都与目录本身等效。',
            "在 Yarn Plug'n'Play 项目里，Astryx 看不到项目自带的 CLI，因此由你启动的 astryx 命令应答。要通过 Yarn（`yarn astryx`）运行项目的 CLI 来直接使用它。",
          ],
        },
      ],
    },
    {
      id: 'more',
      title: '更多关于 global 模式',
      content: [
        {
          type: 'prose',
          text: '本文是 {@link namespace:global} 的一部分：global 模式是什么，以及各部分如何工作。',
        },
      ],
    },
  ],
};
