// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'InternationalizationProvider',
  displayName: 'Internationalization Provider',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'i18n',
    '国际化',
    'internationalization',
    'localization',
    '本地化',
    'locale',
    'translation',
    '翻译',
    'translations',
    'provider',
    '语言',
  ],
  usage: {
    description:
      '包裹你的应用以设置生效的 locale，并（可选）合并额外的翻译词表与按 locale 的覆盖项。子树内的 Astryx 组件针对此上下文解析其字符串。没有 provider 时，组件回退到自带的英文默认值。',
    anatomy: [
      {
        name: 'Provider boundary',
        required: true,
        description:
          '一个非视觉的上下文边界，向下层 Astryx 组件提供 locale、消息词表、覆盖项与方向，并为 `Calendar` 提供日历系统。它不渲染任何 DOM 元素。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '目标 locale 已有自带词表时，使用 `@astryxdesign/core/locales/*` 的 Astryx locale 词表。',
      },
      {
        guidance: true,
        description:
          '仅在 Astryx 尚未提供该 locale 或你在测试进行中的翻译时，才使用同构形的本地词表。',
      },
      {
        guidance: true,
        description:
          '使用真实的 BCP 47 标签如 `fr-FR`、`pt-BR`、`ar-SA`；区域 locale 先回退到基础语言，再回退到英文。',
      },
      {
        guidance: true,
        description:
          "请自行在 `<html>`（或包裹元素）上设置 `dir` 属性；provider 不会设置它。Astryx 组件根据 DOM `dir` 镜像布局与方向性图标，缺少它时 RTL locale 不会视觉镜像。用 `getLocaleDirection(locale)` 为 provider 与 DOM 推导该值。",
      },
      {
        guidance: true,
        description:
          '设置 `calendar` 可让 `Calendar`、`DateInput`、`DateRangeInput` 与 `DateTimeInput` 以其他历法系统显示，Timestamp、PowerSearch 与 Schedule 的日期也以该历法书写。locale 永远不会选择历法：`fa-IR` 在你设置 `calendar="persian"` 之前显示公历日期，`locale` 中的 `-u-ca-` 关键字（如 `th-TH-u-ca-buddhist`）同样保持公历。日期值始终是公历 ISO 字符串。',
      },
      {
        guidance: false,
        description:
          '不要把自定义词表映射强制转换为 `any`；i18n 包导出 `ProviderMessagesByLocale`、`MessagesByLocale`、`Catalog` 与 `RuntimeCatalog` 用于本地词表类型标注。',
      },
    ],
  },
  props: [
    {
      name: 'locale',
      type: 'string',
      required: true,
      description:
        '生效 locale 的 BCP 47 语言标签（如 "en"、"pt"、"pt-BR"、"zh-Hans"）。区域标签先回退到基础语言，再回退到自带的 "en" 词表。',
    },
    {
      name: 'messages',
      type: 'ProviderMessagesByLocale',
      required: false,
      description:
        '可选的映射：BCP 47 标签到富格式或生成的运行时词表。紧凑的自带词表从 `@astryxdesign/core/locales/*.generated.js` 导入；自带的 "en" 词表始终可用，无需在此列出。',
    },
    {
      name: 'overrides',
      type: 'Overrides',
      required: false,
      description:
        '在自带默认值之上应用的稀疏按 locale 键覆盖。覆盖项按 locale 键控，因此运行时切换 locale 会取到正确的集合。',
    },
    {
      name: 'dir',
      type: "'ltr' | 'rtl'",
      required: false,
      description:
        '上下文的显式文本方向覆盖。省略时方向经 `Intl.Locale.getTextInfo()` 从 `locale` 推导。它设置 Astryx 读取的方向，但不会设置 DOM `dir` 属性；你必须自行在 `<html>`（或包裹元素）上设置 `dir`，因为 Astryx 组件镜像布局与方向性图标依据的是 DOM `dir`，而不是这个 prop。两处应设为同一值并保持同步。',
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      required: false,
      description:
        "子树的历法系统，如 'persian'、'hebrew' 或 'buddhist'。`Calendar`、`DateInput`、`DateRangeInput` 与 `DateTimeInput` 以它显示，Timestamp、PowerSearch 与 Lab 的 Schedule 以它书写日期。省略时历法为公历：locale 永远不会选择历法，无论是通过其默认历法还是 `-u-ca-` 关键字。组件自身的 `calendar` prop 优先。值始终是公历 ISO 日期。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 `Temporal`；上下文会保留所请求的历法，运行时缺少 `Temporal` 时这些组件显示公历日期并在开发环境告警。在服务端与浏览器加载 `temporal-polyfill/full/global` 之类的 polyfill。",
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: '随国际化 provider 渲染的内容。',
    },
  ],
  examples: [
    {
      label: '加载 Astryx 自带的 locale 词表',
      code: `import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import frFR from '@astryxdesign/core/locales/fr-FR.generated.js';

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider locale="fr-FR" messages={{'fr-FR': frFR}}>
      {children}
    </InternationalizationProvider>
  );
}`,
    },
    {
      label: '覆盖一个 Astryx 字符串',
      code: `import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider
      locale="en"
      overrides={{
        en: {'@astryx.selector.placeholder': 'Choose...'},
      }}
    >
      {children}
    </InternationalizationProvider>
  );
}`,
    },
    {
      label: '以波斯历法显示 Calendar',
      code: `import type {ReactNode} from 'react';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';

// Values stay Gregorian ISO dates, for example '2026-10-30'.
export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider locale="fa-IR" calendar="persian">
      {children}
    </InternationalizationProvider>
  );
}`,
    },
    {
      label: '提供本地回退词表',
      code: `import type {ReactNode} from 'react';
import {
  InternationalizationProvider,
  type MessagesByLocale,
} from '@astryxdesign/core/i18n';
import ptBR from './locales/pt-BR.json';

const messages: MessagesByLocale = {'pt-BR': ptBR};

export function AppI18n({children}: {children: ReactNode}) {
  return (
    <InternationalizationProvider locale="pt-BR" messages={messages}>
      {children}
    </InternationalizationProvider>
  );
}`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '包裹应用以设置生效 locale，并（可选）合并翻译词表 + 按 locale 覆盖项。Astryx 组件针对此上下文解析字符串；缺失键回退到自带英文。',
  usage: {
    description:
      '包裹应用以设置生效 locale，并（可选）合并翻译词表 + 按 locale 覆盖项。Astryx 组件针对此上下文解析字符串；缺失键回退到自带英文。',
    bestPractices: [
      {
        guidance: true,
        description:
          '目标 locale 已有自带词表时，使用 `@astryxdesign/core/locales/*.generated.js` 的紧凑 Astryx 词表。',
      },
      {
        guidance: true,
        description:
          'Astryx 尚未提供目标 locale 或测试进行中的翻译时，使用富格式 `Catalog` 或紧凑 `RuntimeCatalog`。',
      },
      {
        guidance: true,
        description:
          '使用真实 BCP 47 标签如 `fr-FR`、`pt-BR`、`ar-SA`；区域 locale 先回退到基础语言再回退到英文。',
      },
      {
        guidance: true,
        description:
          '自行在 `<html>`（或包裹元素）上设置 `dir`；provider 不会设置。Astryx 根据 DOM `dir` 镜像布局与方向性图标，缺少它时 RTL locale 不会镜像。provider 与 DOM 都用 `getLocaleDirection(locale)` 推导。',
      },
      {
        guidance: false,
        description:
          '不要把自定义词表映射强制转换为 `any`；i18n 包导出 `ProviderMessagesByLocale`、`MessagesByLocale`、`Catalog` 与 `RuntimeCatalog` 用于本地词表类型标注。',
      },
    ],
  },
  propDescriptions: {
    locale:
      'BCP 47 语言标签（如 "en"、"pt-BR"）；区域标签先回退到基础语言再回退到 "en"',
    messages:
      'BCP 47 标签到富格式 Catalog 或生成 RuntimeCatalog 的映射；"en" 始终可用',
    overrides:
      '在自带默认值之上应用的稀疏按 locale 键覆盖',
    calendar:
      'Calendar、DateInput、DateRangeInput、DateTimeInput、Timestamp、PowerSearch 与 Schedule 日期的历法系统（默认 gregory；locale 中的 -u-ca- 关键字不会选择它）；值始终为公历 ISO；非公历对齐的历法需要 Temporal',
  },
};
