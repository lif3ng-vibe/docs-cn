// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-overview`
 *
 * One question: "How do I set up CSS?"
 * Three paths, each with its exact imports. Every path loads the prebuilt
 * stylesheets (spec:AST-080 FR5); none compiles Astryx package source.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'styling-overview',
  title: '样式总览',
  category: 'guide',
  description:
    '如何搭建 CSS——三条路径的确切导入：纯 CSS、Tailwind，以及用于你自己代码的 StyleX——外加每个 Astryx 包附带的样式表。',
  keywords: [
    '样式',
    'CSS',
    '初始化',
    '导入',
    'StyleX',
    'Tailwind',
    'astryx.css',
    'globals.css',
  ],

  sections: [
    {
      id: 'pick-a-path',
      title: '选择路径',
      content: [
        {
          type: 'table',
          headers: ['路径', '适合', '需要构建步骤？'],
          rows: [
            [
              '纯 CSS',
              '大多数应用。用 className、xstyle 或任意 CSS 库写样式。',
              '不需要。',
            ],
            [
              'Tailwind',
              '使用 Tailwind v4 的应用。CSS 桥接把工具类映射到设计令牌。',
              "除 Tailwind 自身外不需要。",
            ],
            [
              '为自己代码使用 StyleX',
              '你自己的 `stylex.create()` 样式与 swizzle（弹出）的组件。Astryx 本身保持预构建。',
              '需要——为你的代码加 StyleX 插件。',
            ],
          ],
        },
        {
          type: 'prose',
          text: '三条路径加载同样的 Astryx 预构建样式表、解析到同一组设计令牌，并都支持主题与深色模式。它们都不编译 Astryx 包源码。你可以在一个应用里混用。',
        },
      ],
    },
    {
      id: 'plain',
      title: '纯 CSS',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: '安装',
          code: '{@pm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral}',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";`,
        },
        {
          type: 'prose',
          text: "搞定。组件开箱即用——用 `className`、`xstyle` 或 `style` 写样式。把 `theme-neutral` 换成任意主题包即可（`{@command theme list}` 查看可用项）。",
        },
      ],
    },
    {
      id: 'tailwind',
      title: 'Tailwind',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: '安装',
          code: '{@pm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral}',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`,
        },
        {
          type: 'prose',
          text: '`@layer` 声明至关重要——没有它，组件样式会压过 Tailwind 工具类，`className` 覆盖会失效。桥接（`tailwind-theme.css`）把 `text-primary`、`bg-surface`、`rounded-lg` 这类类映射到设计令牌，无需 JS。',
        },
        {
          type: 'prose',
          text: '已配置 Tailwind 的项目只需更小的改动，见 {@link generic:tailwind}。Tailwind v3 请看 {@link generic:migration-setup} 中的层权变通。',
        },
      ],
    },
    {
      id: 'stylex-own-code',
      title: '为自己代码使用 StyleX',
      content: [
        {
          type: 'prose',
          text: '只有当你编写自己的 StyleX（`stylex.create()`）或 swizzle 组件（`{@command swizzle <Component>}`，把组件的 StyleX 源码复制进你的应用）时才需要。纯 CSS 路径已支持 `xstyle` 覆盖——这条路径是为你自己写的 StyleX 代码准备的。部分内置页面模板也用 StyleX 做布局；如果你脚手架生成了这种模板并看到 "Unexpected stylex.create call at runtime"，请按下面为你的打包器加上编译器插件。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '安装',
          code: '{@pm install @astryxdesign/core @stylexjs/stylex @astryxdesign/theme-neutral}',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";`,
        },
        {
          type: 'prose',
          text: '保留 `astryx.css`：Astryx 组件样式永远来自预构建样式表。StyleX 编译器只指向你自己的源码，绝不指向 `node_modules/@astryxdesign`。为你的打包器添加插件：',
        },
        {
          type: 'table',
          headers: ['打包器', '插件'],
          rows: [
            ['Webpack', '@stylexjs/webpack-plugin'],
            ['Vite / Rollup', '@stylexjs/rollup-plugin'],
            [
              'Babel（任意）',
              '@stylexjs/babel-plugin + @stylexjs/postcss-plugin',
            ],
            ['Next.js（保留 next/font）', '@stylexswc/nextjs-plugin'],
          ],
        },
        {
          type: 'prose',
          text: '如果 swizzle 出的组件在运行时报 `stylex.create` 错误，说明应用缺少 StyleX 编译器：见 {@link generic:tokens-and-setup} 的 StyleX Build Setup 一节。',
        },
        {
          type: 'prose',
          text: "`{@command swizzle <Component>}` 会把 `astryx-swizzle.json` 标记写入一个它拥有的输出文件夹（复制时新建的、空的，或它先前标记过的）；该文件夹下的所有模块随后都按 Astryx 源码编译，因此把副本放进专属文件夹，比如默认的 `components/astryx`。对已装有其他文件的文件夹，它不写标记，而是说明如何手动添加。使用 `@astryxdesign/build` 的 Babel、PostCSS 与 Vite 集成，或 webpack 下的 `withAstryx()` 时，该文件夹下的副本会编译进 `astryx-base`，位于 `astryx-theme` 之下，主题组件覆盖能像覆盖包组件一样到达它。在 Turbopack 下，以及使用上面的原生 StyleX 插件时，副本的规则落在你自己的样式里、位于 `astryx-theme` 之上，主题组件覆盖到不了它。",
        },
      ],
    },
    {
      id: 'other-packages',
      title: '其他 Astryx 包',
      content: [
        {
          type: 'prose',
          text: '凡是组件带样式的 Astryx 包都附带自己的预构建样式表。对每个用到的包，在 `astryx.css` 之后导入它。它们都把规则放进同一个 `astryx-base` 层，因此你的主题覆盖能压过每一个包。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/richtext/richtext.css"; /* Rich Text */
@import "@astryxdesign/lab/lab.css"; /* Lab */
@import "@astryxdesign/charts/charts.css"; /* Charts */
@import "@astryxdesign/theme-neutral/theme.css";`,
        },
        {
          type: 'table',
          headers: ['包', '样式表'],
          rows: [
            ['@astryxdesign/core', '@astryxdesign/core/astryx.css'],
            ['@astryxdesign/richtext', '@astryxdesign/richtext/richtext.css'],
            ['@astryxdesign/lab', '@astryxdesign/lab/lab.css'],
            ['@astryxdesign/charts', '@astryxdesign/charts/charts.css'],
          ],
        },
      ],
    },
    {
      id: 'what-each-file-does',
      title: '每个导入做什么',
      content: [
        {
          type: 'table',
          headers: ['导入', '层', '用途'],
          rows: [
            [
              'reset.css',
              'reset',
              '跨浏览器 reset（box-sizing、margin、color-scheme）。经 :where() 实现零优先级。',
            ],
            [
              'astryx.css',
              'astryx-base',
              '预构建组件样式。每条路径都必须。',
            ],
            [
              'richtext.css, lab.css, charts.css',
              'astryx-base',
              '你使用的其他 Astryx 包各自的预构建样式。在 astryx.css 之后加载。',
            ],
            [
              'theme.css',
              'astryx-theme',
              '以 CSS 自定义属性形式出现的设计令牌（颜色、间距、圆角、排版）。换主题即换包。',
            ],
            [
              'tailwind-theme.css',
              '—',
              'Tailwind v4 桥接。把工具类映射到设计令牌。纯 CSS，无 JS。仅 Tailwind 路径。',
            ],
          ],
        },
      ],
    },
    {
      id: 'further-reading',
      title: '延伸阅读',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '{@link namespace:styling}——xstyle、className、data 属性选择器、代码中的设计令牌。',
            '{@link namespace:styling-libraries}——Tailwind 桥接细节、Panda、Chakra、MUI、CSS Modules 与非 CSS 令牌解析。',
            '{@link generic:use-a-theme}——应用主题、深色模式、嵌套主题。{@link generic:author-a-theme}——defineTheme、覆盖、生产构建。',
            '{@link namespace:migration}——级联层审计、Tailwind v3 共存与基础冒烟测试。',
          ],
        },
      ],
    },
  ],
};
