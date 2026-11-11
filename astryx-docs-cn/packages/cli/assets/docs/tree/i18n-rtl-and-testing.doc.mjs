// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs internationalization/i18n-rtl-and-testing`: text
 * direction (RTL), pseudo-locale testing, and contributor guidance.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'i18n-rtl-and-testing',
  title: 'RTL 与测试',
  placement: {parent: 'namespace:internationalization', slot: 'guides', order: 30},
  category: 'guide',
  description:
    '文本方向（RTL）、伪 locale 测试，以及面向开发者与译者的贡献指南。',
  keywords: [
    'dir',
    '伪 locale',
    '测试',
    'Crowdin',
    '逻辑属性',
  ],

  sections: [
    {
      title: '文本方向（RTL）',
      content: [
        {
          type: 'prose',
          text: "Astryx 在跟踪 locale 的同时跟踪文本方向（`'ltr'` 或 `'rtl'`）。默认情况下，方向通过 [`Intl.Locale.getTextInfo()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo) 从你传给 `<InternationalizationProvider>` 的 `locale` 推导得出，因此阿拉伯语（`ar`）、希伯来语（`he`）、波斯语（`fa`）、乌尔都语（`ur`）等 RTL locale 会自动解析为 `'rtl'`。",
        },
        {
          type: 'prose',
          text: '你不需要在每个组件上做任何接线。方向一旦设定，astryx 组件会自行镜像：布局与间距通过 CSS 逻辑属性翻转，方向性图标（chevron、caret）原地翻转，键盘方向键左右互换，浮层定位到正确一侧。只需设定一次方向，整棵组件树都会跟随。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '由 locale 推导方向',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';

// direction resolves to 'rtl' automatically from the Arabic locale
<InternationalizationProvider locale="ar">
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: '传入可选的 `dir` prop 可强制指定方向。它会覆盖由 locale 推导的默认值；适合在英文词表下测试 RTL 布局，或在你已知方向时跳过推导。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '显式覆盖方向',
          code: `// force RTL layout while keeping English strings
<InternationalizationProvider locale="en" dir="rtl">
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: '还有一步：把方向也告诉浏览器。在页面上添加 `dir` 属性——通常加在 `<html>` 标签上。正是它让文本对齐到正确一侧、标点与混排文本正确流动、布局镜像。provider 负责 astryx 组件；`dir` 属性负责页面上其余的一切。',
        },
        {
          type: 'prose',
          text: 'Astryx 不会替你设置 `dir`；你需要自己设置，与传给 provider 的方向保持一致。如果你的应用是服务端渲染的（如 Next.js），`getLocaleDirection()` 辅助函数可以从 locale 计算方向，便于在页面渲染时设置：',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '在 Next.js 根布局中设置 <html dir>',
          code: `import {getLocaleDirection} from '@astryxdesign/core/i18n';

export default function RootLayout({children, params}) {
  const {locale} = params;
  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body>{children}</body>
    </html>
  );
}`,
        },
        {
          type: 'prose',
          text: "在纯客户端应用中，每当 locale 变化时在 `<html>` 上设置同样的属性。（`getLocaleDirection()` 对无法识别的内容会安全地返回 `'ltr'`，因此可以对任意 locale 字符串调用它。）",
        },
        {
          type: 'prose',
          text: '要让从左到右的页面中某一部分从右到左显示——比如一段阿拉伯语引文或一个评论串——把该部分包在自己的 `<InternationalizationProvider dir="rtl">` 里，并在其外层元素上加 `dir="rtl"`。从该区域内部打开的弹出浮层——菜单、对话框、popover、tooltip——也会镜像：它们以逻辑 CSS 锚点定位，因此会落在正确一侧并自动继承该区域的方向。',
        },
      ],
    },
    {
      title: '测试你的翻译',
      content: [
        {
          type: 'prose',
          text: 'Astryx 会生成一个 `pseudo` locale，把每条字符串包在 `⟦…⟧` 中，并把字母替换为带变音符的形近字符。在开发环境开启它，可以发现硬编码的 astryx 字符串以及由更长文本引起的布局问题。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '开启伪本地化',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import pseudo from '@astryxdesign/core/locales/pseudo.generated.js';

<InternationalizationProvider locale="pseudo" messages={{pseudo}}>
  <App />
</InternationalizationProvider>;`,
        },
      ],
    },
    {
      title: '面向贡献者',
      content: [
        {
          type: 'heading',
          level: 3,
          text: '开发者',
        },
        {
          type: 'prose',
          text: 'Astryx 组件作者应使用 `useTranslator()` 读取字符串，而不是硬编码面向用户的文本。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '读取一条 astryx 字符串',
          code: `import {useTranslator} from '@astryxdesign/core/i18n';

function SaveButton() {
  const t = useTranslator();
  return <button>{t('@astryx.actions.save')}</button>;
}`,
        },
        {
          type: 'prose',
          text: 'Astryx 自身的字符串位于 `packages/core/locales/en.json`。新增面向用户的字符串必须经过 `useTranslator`；这由 `@astryx/no-hardcoded-i18n-string` ESLint 规则强制执行。新增 key 时所用的别名与解析（alias-and-resolve）模式见 AI 贡献指南。',
        },
        {
          type: 'prose',
          text: '当你编写需要响应方向的组件时，请从 DOM 解析方向，而不是在渲染时用 JavaScript 读取，并选用能生效的最轻量工具。按优先级排列：',
        },
        {
          type: 'heading',
          level: 4,
          text: '1. 优先使用 CSS 逻辑属性',
        },
        {
          type: 'prose',
          text: '使用 `insetInlineStart`、`paddingInlineEnd`、`marginInline` 等替代物理属性 `left`/`right`。大多数镜像需求仅需如此；浏览器会根据所处环境的 `dir` 自动翻转。`@astryx/no-physical-properties` ESLint 规则强制执行这一点。',
        },
        {
          type: 'heading',
          level: 4,
          text: '2. 方向性图标：用 CSS 镜像，而不是换图标名',
        },
        {
          type: 'prose',
          text: '渲染一个固定的字形，并用共享的 `rtlStyles.mirror` 包裹它（一个仅在 `[dir="rtl"]` 下生效的 `scaleX(-1)`）。它通过层叠从祖先的 `dir` 翻转，因此在服务端也能工作且没有水合闪烁。不要在 JS 里挑选 `chevronLeft` 还是 `chevronRight`。Pagination、Calendar 与 Carousel 的 chevron 都是这样处理的。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用 CSS 镜像方向性图标',
          code: `import * as stylex from '@stylexjs/stylex';
import {rtlStyles} from '@astryxdesign/core';

function NextButton() {
  // One glyph; CSS flips it under RTL. No direction read.
  return (
    <span {...stylex.props(rtlStyles.mirror)}>
      <Icon icon="chevronRight" />
    </span>
  );
}`,
        },
        {
          type: 'heading',
          level: 4,
          text: '3. 行为逻辑：在事件发生时惰性读取 DOM',
        },
        {
          type: 'prose',
          text: '对于 CSS 无法表达的行为——键盘方向键映射、拖拽/滚动计算——在交互发生时用 `isRtlElement(el)`（检查 `getComputedStyle().direction`）读取方向，绝不在渲染期间读取。焦点原语（`useListFocus`、`useGridFocus`、`useTreeFocus`）已能从其容器自动检测方向，方向键会自动翻转；不要给它们传方向标志。',
        },
        {
          type: 'heading',
          level: 4,
          text: '4. useDirection() 上下文：最后的手段',
        },
        {
          type: 'prose',
          text: "只有在渲染期间确实需要方向值、且上述方案都不适用时才使用它。它是 SSR 安全的，在 provider 外返回 `'ltr'`（与 `useTranslator` 的静默回退一致），但它是唯一一条在 provider 的 `direction` 与 `<html dir>` 不一致时可能在水合（hydration）阶段出现不匹配的路径；因此请优先选择上述纯粹从 DOM 解析的方案。自 CSS 镜像迁移完成以来，没有任何 astryx 组件在渲染时从上下文读取方向。",
        },
        {
          type: 'heading',
          level: 3,
          text: '译者',
        },
        {
          type: 'prose',
          text: 'Crowdin 是首选的贡献方式：[加入一门语言](https://crowdin.com/project/astryx)，在网页界面翻译字符串，你的成果会同步回仓库，无需开 PR。如果你更喜欢那种流程，直接对 `packages/core/locales/*.json` 提 PR 也可以。',
        },
      ],
    },
  ],
};
