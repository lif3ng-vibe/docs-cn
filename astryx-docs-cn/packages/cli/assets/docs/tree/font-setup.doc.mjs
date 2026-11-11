// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs typography/font-setup`: font families, custom fonts,
 * font sizes, and font weights.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'font-setup',
  title: '字体设置',
  placement: {parent: 'namespace:typography', slot: 'guides', order: 10},
  category: 'foundations',
  description:
    '字体族、自定义字体加载、几何字号与语义字重。',
  keywords: [
    '字体族',
    '自定义字体',
    'webfont',
    'Google Fonts',
    'font-face',
    '字号',
    '字重',
    '几何字阶',
  ],

  sections: [
    {
      title: '概述',
      content: [
        {
          type: 'prose',
          text: '排版建立在几何字阶之上：基准字号 × ratio^step，默认值为 14px 和 1.2。每种文本样式都是一个语义令牌，组合字号、字重与行高，组件因此表达意图（标题、正文、标签）而非原始数值。',
        },
        {
          type: 'prose',
          text: '两层协同工作：原始字号令牌（--font-size-xs ... --font-size-5xl）构成几何字阶，语义字阶令牌（--text-heading-1-size、--text-body-leading 等）通过 var() 引用它们。主题在 defineTheme 中调整基准与比率即可覆盖整个字阶；所有语义令牌自动重算。',
        },
      ],
    },
    {
      title: '字体族',
      content: [
        {
          type: 'prose',
          text: '三种字体角色：body（界面文本）、heading（标题）与 code（等宽）。默认情况下，body 与 heading 共用同一系统字体栈；code 使用等宽字体栈。自定义主题可为每个角色指定不同字体族；heading 未显式设置时继承 body。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Family Tokens',
        },
      ],
    },
    {
      id: 'loading-custom-fonts',
      title: '自定义字体',
      content: [
        {
          type: 'prose',
          text: 'Astryx 从不加载字体文件。defineTheme 与构建出的 CSS 只设置 font-family：写一个 webfont（Fraunces、JetBrains Mono 等）会让每个浏览器去查找它，在应用未加载它时静默回退。`{@command theme build}` 会在主题写了既非 CSS 通用族也非常见系统字体的字体族时发出警告，并打印应添加的代码片段；加载字体始终是应用自己的职责。',
        },
        {
          type: 'code',
          lang: 'html',
          label: 'Google Fonts：加入文档的 <head>',
          code: `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=JetBrains+Mono&display=swap"
/>`,
        },
        {
          type: 'code',
          lang: 'css',
          label: '自托管：每个字体族与字重一个 @font-face',
          code: `@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/fraunces.woff2') format('woff2');
  font-weight: 400 700; /* variable-font range, or one weight per file */
  font-display: swap; /* fallback text stays visible while the font loads */
}`,
        },
        {
          type: 'prose',
          text: "务必让 webfont 搭配真实的回退字体栈（尺寸相近的系统字体加一个通用族），使文本在字体加载前、以及始终未加载时依然可读：defineTheme({typography: {heading: {family: 'Fraunces', fallbacks: 'Georgia, serif'}}})。",
        },
      ],
    },
    {
      title: '字号',
      content: [
        {
          type: 'prose',
          text: '几何字阶：round(base × ratio^step)，以 rem 表示。默认字阶为 14px × 1.2，产生从 4xs（6px）到 5xl（42px）的 12 档。在 defineTheme 中调整基准与比率会重新生成每个字号令牌，同时保持比例关系。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Size Tokens',
        },
      ],
    },
    {
      title: '字重',
      content: [
        {
          type: 'prose',
          text: '四种语义字重：normal（400，正文/代码）、medium（500，标签/数据）、semibold（600，标题）、bold（700，强调）。字阶令牌通过 var() 引用它们，主题因此可以重新映射数值。',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Font Weight Tokens',
        },
      ],
    },
  ],
};
