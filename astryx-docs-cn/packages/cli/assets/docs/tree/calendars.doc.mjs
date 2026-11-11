// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs calendars`: calendar systems in detail. Which calendars
 * date components show, how to load Temporal, server rendering, and the
 * lunisolar calendars. The `internationalization/i18n-calendars` guide has the
 * short version.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'calendars',
  // The docsite lists guide pages by title, so this one sorts directly below
  // Internationalization, the page that links here.
  title: '国际化：历法',
  summary:
    '以波斯历、希伯来历、伊斯兰历、佛历、日本历、阴阳历等历法显示日期，同时值保持公历 ISO 日期。',
  keywords: [
    'calendar',
    '历法',
    '波斯历',
    'Jalali',
    '希伯来历',
    'Hijri',
    '伊斯兰历',
    '佛历',
    '日本年号',
    '阴阳历',
    '农历',
    'dangi',
    '埃塞俄比亚历',
    'Temporal',
    'polyfill',
    'u-ca',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
  blocks: [
    {
      type: 'prose',
      text: '除非应用另行选择，`Calendar`、DateInput、DateRangeInput 与 DateTimeInput 默认显示公历。值永远不会随历法改变：始终保持公历 ISO 日期。简版说明见 {@link generic:i18n-calendars}。',
    },
  ],
};
