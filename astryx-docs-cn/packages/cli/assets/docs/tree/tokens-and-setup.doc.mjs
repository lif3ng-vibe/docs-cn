// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/tokens-and-setup`: using design tokens in custom
 * styles and configuring a StyleX compiler for swizzled components.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'tokens-and-setup',
  title: '令牌与编译配置',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 30},
  category: 'guide',
  description:
    '在自定义样式中使用设计令牌，并为 swizzle 出的组件配置 StyleX 编译器。',
  keywords: ['StyleX 配置', 'swizzle', 'webpack', 'Vite', 'Next.js'],

  sections: [
    {
      title: '设计令牌',
      content: [
        {
          type: 'prose',
          text: '编写自定义样式时，使用设计令牌而不是硬编码的值。令牌是 CSS 自定义属性，会随当前主题与配色模式自动适配。系统为间距、颜色、圆角、阴影、排版和尺寸提供了令牌。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '在 stylex.create 中使用令牌',
          code: `import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  surface: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
});

<Card xstyle={styles.surface} />`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '在 stylex.create 中使用类型化令牌导入',
          code: `import {colorVars, spacingVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  highlight: {
    backgroundColor: colorVars['--color-accent-muted'],
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
  },
});`,
        },
        {
          type: 'prose',
          text: '两种方式都可行：var() 字符串，或从 tokens.stylex 类型化导入。类型化导入提供自动补全，并在构建时捕获拼写错误。',
        },
        {
          type: 'prose',
          text: '完整的令牌参考（所有间距、颜色、圆角、阴影和排版令牌及其取值）见 {@link namespace:tokens}。如何通过 defineTheme 覆盖令牌见 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      id: 'stylex-setup',
      title: 'StyleX 构建配置（swizzle 出的组件必需）',
      content: [
        {
          type: 'prose',
          text: "Astryx 组件以预编译形态交付：`astryx.css` 与每个包自己的样式表已包含其全部样式，因此使用已发布的包无需任何 StyleX 配置。但 `{@command swizzle <Component>}` 会把原始 StyleX *源码*复制进你的应用，而 StyleX 源码需要构建时的 StyleX 编译器来产出原子化 CSS。没有编译器时，导入该组件会抛出以 `Unexpected 'stylex.create' call at runtime` 开头的错误，页面无法渲染。如果 swizzle 出的组件抛出这个错误，说明应用缺少 StyleX 编译器。用 `stylex.create()` 编写自己的 StyleX 时同理。",
        },
        {
          type: 'table',
          headers: ['打包器', 'StyleX 插件'],
          rows: [
            ['Webpack', '@stylexjs/webpack-plugin'],
            [
              'Vite / Rollup',
              '@stylexjs/rollup-plugin（或社区 Vite 插件）',
            ],
            [
              'Babel（任意打包器）',
              '@stylexjs/babel-plugin + @stylexjs/postcss-plugin',
            ],
            [
              'Next.js（App Router，SWC）',
              '基于 SWC 的转译方案；见下文 Next.js 说明',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Next.js（App Router）是最棘手的一处。StyleX 的官方编译器是 Babel 插件，但在 Next.js 中引入 Babel 配置会禁用 SWC 编译器，连带失去依赖 SWC 的功能（如 `next/font`）。',
        },
        {
          type: 'prose',
          text: '仓库中的 `apps/example-nextjs-stylex` 走 Babel 路线（`next/babel`、`@stylexjs/babel-plugin`、`@stylexjs/postcss-plugin`）。Babel 会关掉 SWC，因此该应用不使用 `next/font`。要保留 `next/font`，请使用 `@stylexswc/nextjs-plugin` 这类基于 SWC 的转译方案。',
        },
        {
          type: 'code',
          lang: 'js',
          label:
            'next.config.mjs：基于 SWC 的 StyleX 转译（保持 next/font 可用）',
          code: `import stylexPlugin from '@stylexswc/nextjs-plugin';

export default stylexPlugin({
  rsOptions: {
    // Resolve the Astryx token modules that swizzled source imports.
    aliases: {'@/*': ['./src/*']},
    unstable_moduleResolution: {type: 'commonJS'},
  },
})({
  // your existing Next.js config
});`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "缺少编译器的症状：导入 swizzle 出的组件会抛出以 `Unexpected 'stylex.create' call at runtime` 开头的错误，页面无法渲染。",
            '在 Next.js 中，Babel 配置会关掉 SWC；如果需要 `next/font`，就不要走这条路。',
            '纯主题定制（defineTheme + astryx theme build）不需要 StyleX 编译器；只有 swizzle 出的或自己编写的 StyleX 源码才需要。',
            '配置了 StyleX 编译器后也要继续加载 `astryx.css`。编译器只构建你自己的和 swizzle 出的源码；绝不要把 `node_modules/@astryxdesign` 加入其输入。',
          ],
        },
      ],
    },
  ],
};
