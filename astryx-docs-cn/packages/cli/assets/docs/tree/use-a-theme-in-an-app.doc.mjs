// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/use-a-theme-in-an-app`:
 * an app installs the integration and applies or extends the theme, like any theme.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'use-a-theme-in-an-app',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 40},
  title: '使用并扩展主题',
  category: 'guide',
  description:
    '应用安装集成包后即可应用或扩展你的主题，与任何主题的做法相同。',
  sections: [
    {
      id: 'apply-the-theme',
      title: '应用主题',
      content: [
        {
          type: 'prose',
          text: '先安装集成包，然后用主题的 slug 与包名运行 `theme add`。该命令会记录包的来源，并重新生成一个应用主题模块，其中导入构建后的主题、生产环境 CSS 以及可选的字体 CSS。`theme eject` 仅用于把源码复制为独立的本地 fork。',
        },
        {
          type: 'code',
          lang: 'bash',
          code: '{@pm install @acme/astryx-widgets}\n{@command theme add ocean --package @acme/astryx-widgets}',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {Theme} from '@astryxdesign/core/theme';
import {themes, defaultThemeSlug} from './astryx-themes';

<Theme theme={themes[defaultThemeSlug]}>
  <App />
</Theme>`,
        },
        {
          type: 'prose',
          text: '`theme list` 显示可用、已添加与默认的主题。用 `theme use <slug>` 更改默认主题，用 `theme remove <slug>` 停止导入某个主题，`theme eject <slug>` 则仅在应用需要独立源码 fork 时使用。应用一个主题——`mode`、SSR 与生产构建——对所有主题的做法都相同；参见 {@link generic:use-a-theme}。',
        },
      ],
    },
    {
      id: 'extend-the-theme',
      title: '通过扩展来自定义',
      content: [
        {
          type: 'prose',
          text: '常规的定制不应复制包源码。导入构建后的主题，并用 `defineTheme({extends: importedTheme, ...})` 派生新主题，只覆盖应用需要修改的令牌。`theme eject` 仅在应用必须持有独立源码 fork 时使用。参见 {@link generic:define-the-theme}。',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {oceanTheme} from '@acme/astryx-widgets/themes/ocean';

export const productTheme = defineTheme({
  name: 'product',
  extends: oceanTheme,
  tokens: {'--color-accent': ['#0051a3', '#4aa3ff']},
});`,
        },
      ],
    },
    {
      id: 'global-mode',
      title: '在全局模式下',
      content: [
        {
          type: 'prose',
          text: '在全局模式下：在每个使用该主题的应用中安装主题包；在项目内，CLI 会忽略为整台电脑安装的包。参见 {@link namespace:global} 与 {@link generic:global-integrations}。',
        },
      ],
    },
  ],
};
