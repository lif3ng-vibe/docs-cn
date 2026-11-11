// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs internationalization/i18n-library-integration`: override
 * default text, coexist with your own i18n library, or use astryx as your
 * i18n library.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'i18n-library-integration',
  title: '库集成',
  placement: {parent: 'namespace:internationalization', slot: 'guides', order: 20},
  category: 'guide',
  description:
    '覆盖 astryx 的默认文案，与 react-intl / i18next / next-intl / LinguiJS 共存，或将 astryx 用作你的 i18n 库。',
  keywords: [
    'react-intl',
    'i18next',
    'next-intl',
    'LinguiJS',
    '覆盖 overrides',
    'useTranslator',
  ],

  sections: [
    {
      title: '覆盖 astryx 的默认文案',
      content: [
        {
          type: 'prose',
          text: '使用 `overrides` 修改个别字符串，无需交付完整词表。覆盖按 locale 组织，并合并到内置词表与用户提供的词表之上。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '修改一条英文字符串',
          code: `<InternationalizationProvider
  locale="en"
  overrides={{en: {'@astryx.pagination.next': 'Next →'}}}
>
  <App />
</InternationalizationProvider>`,
        },
        {
          type: 'prose',
          text: '对同一个 key，覆盖的优先级高于内置英文和任何 `messages` 词表。适合用于品牌语气微调或一次性措辞修改。',
        },
      ],
    },
    {
      title: 'astryx 与你自己的 i18n 库搭配使用',
      content: [
        {
          type: 'prose',
          text: 'Astryx 组件通过 astryx 的 provider 渲染 astryx 字符串；消费方组件通过你已在用的任意 i18n 库渲染自己的字符串：react-intl、i18next、next-intl、LinguiJS 等。两套系统共存，并从同一数据源读取当前 locale。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Astryx 与 react-intl 并存',
          code: `import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {FormattedMessage, IntlProvider, useIntl} from 'react-intl';
import astryxFr from './locales/astryx/fr.json'; // astryx's UI, in French
import appFr from './locales/app/fr.json';       // your app strings, in French

function Pricing() {
  // Consumer strings — resolved by react-intl.
  const intl = useIntl();

  return (
    <section>
      <h1><FormattedMessage id="pricing.heading" /></h1>

      {/* Astryx Selector — trigger placeholder, search-box placeholder,
          clear-button aria-label all resolved by
          <InternationalizationProvider>. Options come from react-intl. */}
      <Selector
        label={intl.formatMessage({id: 'pricing.region.label'})}
        options={[
          {value: 'na', label: intl.formatMessage({id: 'pricing.region.na'})},
          {value: 'eu', label: intl.formatMessage({id: 'pricing.region.eu'})},
        ]}
        hasSearch
        hasClear
      />

      <Button label={intl.formatMessage({id: 'pricing.cta.subscribe'})} />
    </section>
  );
}

export default function App() {
  return (
    // Same locale, two providers reading their own catalogs.
    <IntlProvider locale="fr" messages={appFr}>
      <InternationalizationProvider locale="fr" messages={{fr: astryxFr}}>
        <Pricing />
      </InternationalizationProvider>
    </IntlProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: '让两个 provider 的 locale 保持同步，各库管理自己的词表。Astryx 看不到你的应用字符串，你的 i18n 库也看不到 astryx 内部内容。运行时切换 locale 的方式相同：用新的 `locale` prop 重新渲染两个 provider，整棵树即时更新。',
        },
        {
          type: 'prose',
          text: '单一词表用法（由 react-intl 或 i18next 等外部 i18n 运行时通过一个 provider 同时解析你的应用字符串与 astryx 字符串）已列入路线图，将通过 `Translator` 适配器实现。进度见 [meta/astryx#4029](https://github.com/meta/astryx/issues/4029)。目前请按上文所示让两个 provider 并存运行。',
        },
      ],
    },
    {
      title: '将 astryx 用作你的 i18n 库',
      content: [
        {
          type: 'prose',
          text: '对有大量本地化需求的生产应用，我们推荐使用专门的 i18n 库，如 react-intl、i18next、next-intl 或 LinguiJS。如果你的应用较小，或不想引入另一个运行时，也可以通过 astryx 解析自己的字符串。应用 key 请放在与 `@astryx.*` 分开的命名空间中，并自带 `en` 词表，因为 astryx 内置的英文回退只包含 astryx 组件字符串。',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: '用 astryx 翻译应用字符串',
          code: `import {Button} from '@astryxdesign/core/Button';
import {
  InternationalizationProvider,
  useTranslator,
  type Catalog,
  type MessagesByLocale,
} from '@astryxdesign/core/i18n';

const en: Catalog = {
  '@myapp.actions.save': {defaultMessage: 'Save'},
};

const fr: Catalog = {
  '@myapp.actions.save': {defaultMessage: 'Enregistrer'},
};

const messages: MessagesByLocale = {en, fr};

function SaveButton() {
  const t = useTranslator();
  return <Button label={t('@myapp.actions.save')} />;
}

export default function App() {
  return (
    <InternationalizationProvider locale="fr" messages={messages}>
      <SaveButton />
    </InternationalizationProvider>
  );
}`,
        },
        {
          type: 'prose',
          text: '`Catalog` 为富结构的 `{defaultMessage, description?}` 编写形态提供类型；`RuntimeCatalog` 为生成的 key 到消息字符串映射提供类型；`ProviderMessagesByLocale` 对 provider 接受两种形态，而 `MessagesByLocale` 保留仅富结构的原始上下文形态。',
        },
      ],
    },
  ],
};
