// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs internationalization`: the internationalization namespace.
 * Groups guides for quick-start locale setup, library integration, calendars,
 * and RTL + testing.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'internationalization',
  title: '国际化',
  summary:
    '设置当前生效的 locale、加载词表、与自己的 i18n 库共存、展示其他历法、处理 RTL（从右到左布局），并测试翻译。',
  keywords: [
    'i18n',
    '国际化',
    'locale',
    '翻译',
    'RTL',
    'right-to-left',
    '语言',
    '词表',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
