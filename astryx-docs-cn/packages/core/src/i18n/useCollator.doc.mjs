// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCollator',
  displayName: 'useCollator',
  category: 'utilities',
  keywords: [
    'i18n',
    '国际化',
    'internationalization',
    'locale',
    'collation',
    '排序规则',
    'compare',
    '比较',
    'sort',
    '排序',
    'table',
    'hook',
  ],
  params: [
    {
      name: 'options',
      type: 'Intl.CollatorOptions',
      description:
        '可选的排序行为，如数字排序、敏感度、标点处理与大小写顺序。',
      required: false,
    },
  ],
  returns: [
    {
      name: 'collator',
      type: 'Intl.Collator',
      description:
        '绑定到生效 InternationalizationProvider locale 的记忆化排序器。',
    },
  ],
  usage: {
    description:
      '返回用于自定义排序的官方认可 locale 感知比较器。provider locale 或选项变化时重建排序器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在自定义 Table 比较器与其他用户可见的字符串排序中复用 collator.compare。',
      },
      {
        guidance: false,
        description:
          '不要直接构造 Intl.Collator 或调用 localeCompare；那些会绕过 provider 支撑的 locale 契约。',
      },
    ],
  },
  relatedComponents: ['InternationalizationProvider', 'Table'],
  relatedHooks: ['useLocale'],
  importPath: '@astryxdesign/core',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '返回绑定到生效 InternationalizationProvider locale 的记忆化 Intl.Collator。',
  paramDescriptions: {
    options:
      '可选 Intl.CollatorOptions：数字排序、敏感度、标点、大小写顺序等。',
  },
  returnDescriptions: {
    collator:
      '记忆化的 provider 绑定排序器，用于 locale 感知比较与排序。',
  },
  usage: {
    description:
      '自定义用户可见字符串排序时使用 collator.compare，而不是裸 Intl.Collator 或 localeCompare。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在自定义 Table 比较器与字符串排序中复用 collator.compare。',
      },
      {
        guidance: false,
        description:
          '不要直接构造裸 Intl.Collator 或调用 localeCompare。',
      },
    ],
  },
};
