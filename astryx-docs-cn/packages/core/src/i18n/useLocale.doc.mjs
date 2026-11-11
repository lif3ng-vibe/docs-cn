// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useLocale',
  displayName: 'useLocale',
  category: 'utilities',
  keywords: [
    'i18n',
    '国际化',
    'internationalization',
    'localization',
    '本地化',
    'locale',
    'language',
    '语言',
    'provider',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'locale',
      type: 'Locale',
      description:
        "生效的 InternationalizationProvider BCP 47 locale。没有 provider 时回退到 'en'。",
    },
  ],
  usage: {
    description:
      '读取权威的 Astryx locale。用它把 provider locale 传递进纯格式化辅助函数与同族包 API；不要从 navigator.language 或硬编码字面量派生第二个 locale。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把返回的 locale 传给需要显式 locale 的纯 Astryx 辅助函数或包 API。',
      },
      {
        guidance: false,
        description:
          '不要用 navigator.language 或硬编码显示 locale 作为回退；InternationalizationProvider 才是 locale 来源。',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider'],
  relatedHooks: ['useCollator', 'useTranslator', 'useDirection'],
  importPath: '@astryxdesign/core',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "返回生效的 InternationalizationProvider locale，没有 provider 时回退到 'en'。",
  usage: {
    description:
      '作为纯格式化辅助函数与同族包 API 的唯一 locale 来源。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把该 locale 传入需要显式 locale 的纯辅助函数。',
      },
      {
        guidance: false,
        description:
          '不要回退到 navigator.language 或硬编码显示 locale。',
      },
    ],
  },
  returnDescriptions: {
    locale: "生效的 provider BCP 47 locale；没有 provider 时为 'en'。",
  },
};
