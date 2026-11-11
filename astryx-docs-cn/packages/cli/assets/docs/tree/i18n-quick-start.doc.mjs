// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs internationalization/i18n-quick-start`: wrap your app in
 * a provider, load a locale catalog, and swap languages at runtime.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'i18n-quick-start',
  title: '快速开始',
  placement: {parent: 'namespace:internationalization', slot: 'guides', order: 10},
  category: 'guide',
  description:
    '用 InternationalizationProvider 包裹你的应用，加载 locale 词表，并在运行时切换语言。',
  keywords: [
    'InternationalizationProvider',
    '快速开始',
    '语言切换',
  ],

  sections: [
    {
      title: '快速开始',
      content: [
        {
          type: 'prose',
          text: '国际化能力随 `@astryxdesign/core` 一起提供，无需额外安装。把应用包在 `<InternationalizationProvider>` 里并设置生效的 `locale`；astryx 组件会从该 provider 获取本地化字符串。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '包裹你的应用',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';

function App() {
  return (
    <InternationalizationProvider locale="en">
      <YourApp />
    </InternationalizationProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: 'provider 始终带有内置英文词表。启用其他 locale 时，通过 `messages` 传入额外的词表。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '加载 astryx 的 locale 词表',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import frFR from '@astryxdesign/core/locales/fr-FR.generated.js';

<InternationalizationProvider
  locale="fr-FR"
  messages={{'fr-FR': frFR}}>
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: 'Astryx 为受支持的 locale 提供英文与官方翻译。`@astryxdesign/core/locales/*.generated.js` 的精简运行时模块只包含应用所需的消息；现有的 `@astryxdesign/core/locales/*.json` 文件则保留译者上下文。在某个 locale 可用之前，应用可以任一形态传入本地词表。缺失的 key 沿 locale 链回退到英文（例如 `pt-BR` 先走到 `pt`，再走到随包发布的 `en`）。',
        },
        {
          type: 'prose',
          text: 'locale 词表只影响 astryx 字符串。你的应用可以继续用自己的 i18n 系统处理产品文案。',
        },
      ],
    },
    {
      title: '运行时切换语言',
      content: [
        {
          type: 'prose',
          text: '用新的 `locale` prop 重新渲染 `<InternationalizationProvider>`，所有 astryx 字符串即时更新。无需刷新页面，也无需单独调用 API。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '在多个 locale 间切换',
          code: `const [locale, setLocale] = useState<'en' | 'fr'>('en');

<InternationalizationProvider locale={locale} messages={{fr}}>
  <Button
    label={locale === 'en' ? 'Français' : 'English'}
    onClick={() => setLocale(l => (l === 'en' ? 'fr' : 'en'))}
  />
  <App />
</InternationalizationProvider>;`,
        },
        {
          type: 'prose',
          text: '持久化用户的选择（localStorage、cookie、URL 段、账号设置）由消费方自行负责。Astryx 只读取你传入的 `locale`。',
        },
      ],
    },
  ],
};
