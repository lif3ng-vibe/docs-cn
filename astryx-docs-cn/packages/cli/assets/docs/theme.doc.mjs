// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'theme',
  title: '主题定制',
  category: 'guide',
  keywords: ['主题', '主题定制', '主题系统', '深色模式', 'defineTheme', 'provider'],
  description:
    '如何使用与创建主题：应用主题见「使用主题」，创建与定制主题见「创作主题」。',

  sections: [
    {
      id: 'quick-start',
      title: '把应用包进主题',
      content: [
        {
          type: 'prose',
          text: '安装一个主题，用 CLI 导入它，并把生成的模块接线一次。完整指南——可用主题、集成主题、深色模式、嵌套主题与生产构建——见 {@link generic:use-a-theme}。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '把生成的模块接线一次',
          code: "import {Theme} from '@astryxdesign/core/theme';\nimport {themes, defaultThemeSlug} from './astryx-themes';\n\nfunction App() {\n  return (\n    <Theme theme={themes[defaultThemeSlug]}>\n      <YourApp />\n    </Theme>\n  );\n}",
        },
      ],
    },
    {
      id: 'creating-a-custom-theme',
      title: '创建自定义主题',
      content: [
        {
          type: 'prose',
          text: '使用 `defineTheme` 配合令牌覆盖、刻度配置与组件样式覆盖。完整指南——调色板生成、扩展主题、适配、自定义变体与生产构建——见 {@link generic:author-a-theme}。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '快速开始',
          code: '{@command theme add stone}   # use an existing theme\n{@command theme eject stone} # fork its source to customize\n{@command theme build src/themes/stone/stoneTheme.ts}',
        },
        {
          type: 'prose',
          text: '要建立一套新的协调色彩系统，运行 `{@command theme palette generate palette.config.json --out palette.generated.ts}`。审阅并提交生成的调色板模块与回执，导入其 `palette` 导出，再从语义令牌引用稳定档位。重新生成已采纳的调色板会更新所有保留这些引用的映射令牌；生成本身不会改写主题。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '把语义令牌映射到生成的调色板档位',
          code: "import {defineTheme} from '@astryxdesign/core/theme';\nimport {palette} from './palette.generated';\n\nconst myTheme = defineTheme({\n  name: 'my-theme',\n  tokens: {\n    '--color-background-surface': [\n      palette.neutral.light[100],\n      palette.neutral.dark[15],\n    ],\n  },\n});",
        },
      ],
    },
    {
      id: 'icon-sizes',
      title: '图标尺寸',
      content: [
        {
          type: 'prose',
          text: "主题在其样式表中设定每个 Icon 尺寸的宽高：在 `components.icon['size:sm']`（或 `xsm`、`md`、`lg`）上写 `width` 与 `height` 即可调整该尺寸的字形，语义图标名与传给 `Icon` 的 SVG 组件一视同仁。尺寸用 `px` 或 `rem` 给出：语义图标的字号取自它，因此 `em` 值也会随之放大外框。主题未触碰的尺寸在 16px 根字号下保持 12、16、20 或 24px（`xsm`、`sm`、`md`、`lg`），并随根字号缩放；`rem` 保留这一缩放。四个尺寸名固定不变。",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '设定 Icon 尺寸的宽高',
          code: "const brandTheme = defineTheme({\n  name: 'brand',\n  components: {\n    icon: {\n      'size:sm': {width: '1.125rem', height: '1.125rem'},\n      'size:lg': {width: '1.75rem', height: '1.75rem'},\n    },\n  },\n});",
        },
      ],
    },
    {
      id: 'light-dark-mode',
      title: '深色模式',
      content: [
        {
          type: 'prose',
          text: '浅色、深色与跟随系统三种模式：{@link generic:use-a-theme}。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '浅色/深色元组',
          code: "'--color-accent': ['#0064E0', '#2694FE'],\n//                   ^light     ^dark",
        },
      ],
    },
    {
      title: '集成主题',
      content: [
        {
          type: 'prose',
          text: '安装一个集成，Astryx 会自动发现它的主题。用 `{@command theme add <name> --package <integration>}` 导入。`theme eject` 仅用于独立的源码分叉。完整流程见 {@link generic:use-a-theme}。',
        },
      ],
    },
  ],
};
