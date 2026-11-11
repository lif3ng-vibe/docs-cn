// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTranslator',
  displayName: 'useTranslator',
  category: 'utilities',
  keywords: [
    'i18n',
    '国际化',
    'internationalization',
    'localization',
    '本地化',
    'translation',
    '翻译',
    'translate',
    'locale',
    'hook',
  ],
  params: [],
  returns: [
    {
      name: 'value',
      type: '(key: string, values?: Record<string, string | number | Date>) => string',
      description:
        '绑定到当前 InternationalizationProvider 上下文的稳定翻译函数。传入消息键与可选的 ICU MessageFormat 值即可获得生效 locale 下的格式化字符串。可安全用于渲染、事件处理器、effect 或父组件生命周期内运行的任何代码。',
    },
  ],
  usage: {
    description:
      '返回一个翻译函数，按键解析时依据当前 locale、provider 覆盖项与自带的英文回退词表。在组件内调用；返回的函数可在该组件作用域内的任何地方使用。',
  },
  relatedComponents: ['InternationalizationProvider'],
  importPath: '@astryxdesign/core',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '返回绑定到当前 InternationalizationProvider 上下文的翻译函数的 hook。传入 ICU MessageFormat 键与值即可获得生效 locale 的格式化字符串。',
  usage: {
    description:
      '返回按键依据当前 locale、provider 覆盖项与自带英文回退词表解析的翻译函数。',
  },
  returnDescriptions: {
    value:
      '绑定到当前 InternationalizationProvider 上下文的翻译函数。传入消息键 + 可选 ICU MessageFormat 值；返回生效 locale 的格式化字符串。可安全用于渲染、事件处理器、effect。',
  },
};
