// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SyntaxTheme',
  displayName: 'Syntax Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'syntax',
    '语法',
    'highlighting',
    '高亮',
    'code',
    '代码',
    'theme',
    '主题',
    'codeblock',
    'prism',
    'shiki',
  ],
  playground: {
    defaults: {
      theme: 'github-light',
      children: {
        __element: 'CodeBlock',
        props: {
          code: "const status = response.ok ? 'success' : 'error';",
          language: 'tsx',
          title: 'status.ts',
        },
      },
    },
  },
  usage: {
    description:
      '为子树中的 CodeBlock 与任何代码组件应用语法高亮颜色。默认情况下，代码组件使用主题级语法颜色（经 defineTheme({ syntax: ... }) 设置），它们派生自调色板（关键字用 --color-text-accent、字符串用 --color-text-green 等）。SyntaxTheme 允许按区域覆盖这些颜色。该系统使用 14 个语义令牌（keyword、string、comment、number、function、type、variable、operator、constant、tag、attribute、property、punctuation、background），并对照 11 个社区主题做了校验。自定义主题用 defineSyntaxTheme() 创建，可使用 [light, dark] 元组实现自动 color-scheme 适配。内置预设：oneDarkPro、dracula、monokai、nord、tokyoNight、catppuccinMocha、githubLight、githubDark、solarizedLight、oneLight（从 @astryxdesign/core/theme/syntax 导入）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '应用全局代码样式用 defineTheme() 的 syntax 字段。仅当特定区域需要不同外观时才用 SyntaxTheme。',
      },
      {
        guidance: true,
        description:
          '从内置预设中挑选，或用 defineSyntaxTheme() 创建品牌专属颜色的自定义主题。',
      },
      {
        guidance: true,
        description:
          '语法主题支持 light-dark() 元组：每个令牌在浅色/深色模式下可有不同值，由配色方案自动解析。',
      },
      {
        guidance: true,
        description:
          '单个 CodeBlock 可直接传 syntaxTheme prop：它等价于把该块包进 SyntaxTheme。为整个代码组件区域设置主题时用 SyntaxTheme 包裹。',
      },
    ],
  },
  props: [
    {
      name: 'theme',
      type: 'SyntaxTheme',
      required: true,
      description:
        '语法高亮主题：@astryxdesign/core/theme/syntax 的预设，或用 defineSyntaxTheme() 创建的自定义主题。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        '内容子树。其中所有 CodeBlock 组件都会使用此语法主题。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      '为子树中的 CodeBlock + 任何代码组件应用语法高亮颜色。默认代码组件使用主题级语法颜色（经 defineTheme({ syntax: ... }) 设置），派生自调色板（关键字用 --color-text-accent、字符串用 --color-text-green 等）；SyntaxTheme 按区域覆盖。14 个语义令牌（keyword、string、comment、number、function、type、variable、operator、constant、tag、attribute、property、punctuation、background）对照 11 个社区主题校验。自定义主题用 defineSyntaxTheme() 创建，可用 [light, dark] 元组自动适配 color-scheme。内置预设：oneDarkPro、dracula、monokai、nord、tokyoNight、catppuccinMocha、githubLight、githubDark、solarizedLight、oneLight（从 @astryxdesign/core/theme/syntax 导入）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '应用全局代码样式用 defineTheme() 的 syntax 字段。仅特定区域需要不同外观时才用 SyntaxTheme。',
      },
      {
        guidance: true,
        description:
          '从内置预设挑选，或用 defineSyntaxTheme() 创建品牌专属颜色的自定义主题。',
      },
      {
        guidance: true,
        description:
          '语法主题支持 light-dark() 元组：每个令牌在浅色/深色模式下可有不同值，由配色方案自动解析。',
      },
      {
        guidance: true,
        description:
          '单个 CodeBlock：直接传 syntaxTheme prop（等价于 SyntaxTheme 包裹）。整片代码组件区域：用 SyntaxTheme 包裹。',
      },
    ],
  },
  propDescriptions: {
    theme:
      '语法高亮主题：@astryxdesign/core/theme/syntax 的预设，或用 defineSyntaxTheme() 创建的自定义主题',
  },
};
