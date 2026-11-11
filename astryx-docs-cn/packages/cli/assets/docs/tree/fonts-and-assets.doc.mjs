// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs authoring/building-blocks/themes/fonts-and-assets`:
 * ship a theme's optional font loader beside its built module and CSS.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'fonts-and-assets',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 35},
  title: '字体与资产',
  category: 'guide',
  description:
    '在主题中写明字体，然后导出一个可选的字体样式表，供 `theme add` 连同构建出的主题一起导入。',
  sections: [
    {
      id: 'name-the-font',
      title: '写明字体',
      content: [
        {
          type: 'prose',
          text: '主题在 `typography` 中写明其字体：`body`、`heading` 与 `code`，每个角色都有 `family` 和 `fallbacks`。它们设置每个组件都会读取的 `--font-family-*` 令牌。务必给出真实的 `fallbacks`，让文本在字体加载之前、以及始终未加载时依然可读。省略时，`heading` 会继承 `body` 的 `family` 与 `fallbacks`。',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// themes/ocean/oceanTheme.ts
export const oceanTheme = defineTheme({
  name: 'ocean',
  typography: {
    body: {family: 'Acme Sans', fallbacks: 'system-ui, sans-serif'},
    code: {family: 'Acme Mono', fallbacks: 'ui-monospace, monospace'},
  },
  // ...your tokens
});`,
        },
        {
          type: 'prose',
          text: '完整的字阶与字体角色见 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      id: 'ship-the-font-loader',
      title: '交付字体加载器',
      content: [
        {
          type: 'prose',
          text: '写出字体族并不等于加载它。当主题使用非系统字体时，在构建出的模块与生产 CSS 旁添加 `<slug>.fonts.css`，再把它导出为 `./themes/<slug>.fonts.css`。`theme add` 会把该样式表连同构建出的主题一起导入。',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"exports": {
  "./themes/ocean": "./themes/ocean/ocean.js",
  "./themes/ocean.css": "./themes/ocean/ocean.css",
  "./themes/ocean.fonts.css": "./themes/ocean/ocean.fonts.css"
}`,
        },
        {
          type: 'prose',
          text: '该样式表可以包含自托管的 `@font-face` 规则，或导入一份托管样式表。托管 `@import` 简单，但与预连接的 `<link>` 相比会延迟加载；请有意地做出这一取舍。当 doctor 无法证明加载器存在时——例如只有托管 `@import`，或应用自行加载字体族而没有字体样式表——它会发出警告，但该警告不会导致应用失败。',
        },
        {
          type: 'code',
          lang: 'css',
          code: `/* themes/ocean/ocean.fonts.css */
@font-face {
  font-family: 'Acme Sans';
  src: url('./fonts/acme-sans.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '加载主题用到的每种字重与字形，不要让浏览器合成粗体或斜体。',
            '把自托管字体文件及其许可证一并打进包里。',
            '让 CSS 与字体资产保持副作用属性，以免打包器移除加载器。',
            '运行 `integration verify`；导出的字体样式表无法解析时它会失败，但它不检查样式表所指向的字体文件。',
          ],
        },
      ],
    },
    {
      id: 'verify-in-an-app',
      title: '在应用中验证',
      content: [
        {
          type: 'prose',
          text: '发布前运行 `integration verify`。然后在一个干净的应用中安装包，运行 `theme add`，应用生成的主题，并在浏览器中打开。源码、打包导出与应用结果构成一条链路；最后一步也要检查。',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '文本以写明的字体族、在每种字重与字形下渲染——斜体解析为真实的斜体字形，而非合成的倾斜。',
            '每个字体请求都成功；没有任何文本静默回退到系统字体。',
            '配色对在浅色与深色模式下都仍满足对比度要求。',
          ],
        },
      ],
    },
  ],
};
