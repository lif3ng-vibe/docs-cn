// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/add-a-theme`:
 * scaffold a theme in a package — blank, or forked from an existing theme.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-theme',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 10},
  title: '添加主题',
  category: 'guide',
  description:
    '在你的包中初始化一个主题——空白主题，或从现有主题分叉而来。',
  sections: [
    {
      id: 'add-a-theme',
      title: '添加主题',
      content: [
        {
          type: 'prose',
          text: '运行 `integration add theme` 并传入小写 kebab-case 的 slug。它会把一个空白主题——`defineTheme` 骨架及其描述符——写入以该 slug 命名的文件夹。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add theme ocean}',
        },
        {
          type: 'code',
          lang: 'text',
          code: `theme contribution added

[ok] ocean

Declare theme root ./themes in astryx.integration.mjs.

- themes/ocean/oceanTheme.ts
- themes/ocean/oceanTheme.doc.mjs
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: '`oceanTheme.ts` 导出 `oceanTheme`（一个 `defineTheme` 源），而 `oceanTheme.doc.mjs` 是 `theme list` 读取的描述符。该命令还会声明 `./themes/ocean` 与 `./themes/ocean.css` 两个包导出。每个字段的定义见 {@link schema:theme-doc}。',
        },
        {
          type: 'prose',
          text: '源码与构建产物都随你的包一起发布。用 `theme build` 构建源码，发布前再运行 `integration verify`。应用通过 `theme add` 登记并导入构建出的模块与样式表；`theme eject` 则会创建一份独立的源码分叉。见 {@link generic:use-a-theme-in-an-app}。',
        },
      ],
    },
    {
      id: 'start-from-an-existing-theme',
      title: '从现有主题起步',
      content: [
        {
          type: 'prose',
          text: '如果不想从空白开始，可以传入 `--from` 以现有主题为起点。它会复制该主题作为你的出发点，供你在此基础上另走方向——这是一次分叉，不会与原主题保持关联。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@command integration add theme ocean --from neutral}',
        },
        {
          type: 'prose',
          text: '副本会保留基础主题所用的包，例如用于图标的 `lucide-react`：`--from` 会把它们加入你的 `dependencies`，因此安装了你包的应用也会一并得到它们。构建主题前请重新安装一遍依赖。',
        },
        {
          type: 'prose',
          text: '改动较多时用 `--from`。如果只是小改动、且希望与基础主题保持关联，请改用 `extends`（见 {@link generic:define-the-theme}）。',
        },
      ],
    },
    {
      id: 'ship-several-themes',
      title: '交付多个主题',
      content: [
        {
          type: 'prose',
          text: '一个包可以交付不止一个主题。每个 slug 运行一次 `integration add theme`；每个主题都有自己的文件夹和描述符，`theme list` 会全部列出。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: '全局模式下：用户把你的包安装到电脑上、与全局 CLI 并列时，你的主题会列在任何项目之外的目录中，在那里 `theme add` 只做列出、不写入任何文件；在项目内，则只有该项目也安装了你的包时才会出现。见 {@link namespace:global} 和 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
