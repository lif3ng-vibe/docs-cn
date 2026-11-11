// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/tailwind`: the Tailwind v4 bridge,
 * cascade layer order, and utility-class usage backed by system tokens.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'tailwind',
  title: 'Tailwind',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 20},
  category: 'guide',
  description:
    'Tailwind v4 桥接、cascade layer 顺序，以及由系统令牌支撑的工具类用法。',
  keywords: [
    'tailwind-theme.css',
    '工具类',
    'preflight',
    '既有 Tailwind 应用',
    'cascade layer 顺序',
  ],

  sections: [
    {
      title: 'Tailwind',
      content: [
        {
          type: 'prose',
          text: '`@astryxdesign/core/tailwind-theme.css` 处的 Tailwind v4 桥接用 `@theme reference inline` 把 Tailwind 主题变量映射到系统 CSS 变量，因此 `text-primary`、`bg-surface`、`border-border`、`rounded-lg`、`shadow-md` 等工具类始终与当前激活主题保持同步，而不会发出与之竞争的运行时声明。',
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
          text: '在任何导入之前预先声明所有 layer。这让 reset 层级最低，Tailwind preflight 在 reset 之上，组件与主题样式居中，Tailwind utilities 排在最后——这样 `className` 上的工具类就能有意覆盖组件默认样式。',
        },
        {
          type: 'prose',
          text: 'layer 的名次由页面中第一个点名它的样式表决定，因此只有 `globals.css` 最先加载时这个顺序才成立。把它作为根布局或应用入口的第一个导入，放在任何导入 Astryx 或主题 CSS 的模块之前。这包括由 `{@command theme add}` 生成的 `astryx-themes` 模块，以及任何导入主题 `theme.css` 的根组件。如果主题样式表先加载，Tailwind preflight 会盖过 Astryx 基础样式，主题覆盖就会落败。如果 `globals.css` 无法最先加载，就把 `@layer` 行挪进单独的 `layers.css`，改为最先导入它。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '根布局或应用入口',
          code: `import './globals.css'; // first: declares the cascade-layer order

import {themes, defaultThemeSlug} from './astryx-themes';`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '由系统令牌支撑的 Tailwind 类',
          code: `<section className="rounded-lg border border-border bg-surface p-4 text-primary shadow-md">
  <Button label="Save" variant="primary" />
</section>`,
        },
        {
          type: 'prose',
          text: 'Tailwind 桥接是通用互操作模式的具体示例：暴露另一个库的语义 API，但把取值指向系统令牌变量。',
        },
      ],
    },
    {
      title: '把 Astryx 加入已在用 Tailwind 的应用',
      content: [
        {
          type: 'prose',
          text: 'Tailwind 一节中的配方是给新应用的完整 `globals.css`。已在用 Tailwind 的应用保留自己的文件：它的 `@import "tailwindcss"`、`@theme` 映射和 `:root` 变量维持原样。在 Tailwind 导入上方加一行 `@layer`，并在其下方加入 Astryx 样式表。',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css（既有 Tailwind 应用）',
          code: `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss"; /* the app's own entry, unchanged */
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";

/* The app's own @theme and :root rules stay below, unchanged. */`,
        },
        {
          type: 'prose',
          text: '这个配方省去了 `tailwind-theme.css`。桥接会把 Tailwind 主题名映射到系统令牌，包括 Tailwind 自身的默认名（如 `rounded-lg`、`shadow-md`），因此在既有应用中它会改变应用自有类的呈现效果。只有当应用没有用到它所映射的名字时才加入它。',
        },
        {
          type: 'prose',
          text: 'Astryx 主题定义了自己的 CSS 自定义属性（颜色、间距、圆角、阴影、字体、动效等），{@link namespace:tokens} 有完整清单。应用中与之同名的令牌会以两种方式之一发生冲突。应用的 `@theme` 键会取 Astryx 的值，因为 `astryx.css` 在 Tailwind 的 `theme` layer 之上、于 `:root` 上设置了这些令牌：写了 `@theme { --spacing-4: 1.5rem }`，应用的 `gap-4` 仍是 16px。把该块标记为 `@theme inline` 可以让工具类保留应用自己的值。应用的 `:root` 变量则会替换 Astryx 的值，从而改变 Astryx 自身的组件：`:root { --spacing-4: 1.5rem }` 会把 Astryx 的第 4 级间距从 16px 变成 24px。在根 Theme 组件重新设置某个令牌之处（如 `--color-warning`），其内部的应用自有规则读到的是 Astryx 的值。凡与应用同名的令牌，请重命名。',
        },
        {
          type: 'prose',
          text: '把 `@layer` 行放在应用的 `@import "tailwindcss"` 之上，绝不放在其下。`@layer` 语句只对页面还没见过的 layer 名排序，而 Tailwind 导入在加载时会点名 `theme`、`base`、`components`、`utilities`。在这条导入之下，该语句只能把 `reset`、`astryx-base`、`astryx-theme` 追加到 Tailwind 的 `utilities` 之后。这会颠倒 cascade：Astryx reset 就会压过应用里的所有工具类，例如会移除应用的工具类给控件加的边框与内边距。而且没有任何东西会报告这一点：构建与浏览器控制台都保持干净，`@layer` 行在源码里看起来也依然正确，只有渲染出的页面会显出问题。',
        },
        {
          type: 'prose',
          text: 'Tailwind 一节的加载顺序规则仍然适用：`globals.css` 必须是页面最先加载的样式表，让它的 `@layer` 行最先点名各 layer。',
        },
      ],
    },
  ],
};
