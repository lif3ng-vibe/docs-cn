// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries`: the styling-libraries namespace.
 * Groups guides for CSS/StyleX, Tailwind, other semantic-token libraries,
 * and non-CSS token processing.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'styling-libraries',
  title: '其他样式库',
  summary:
    '让 Tailwind、StyleX、Panda、Chakra、MUI、CSS-in-JS、CSS Modules 与非 CSS 渲染器接入系统令牌。',
  keywords: [
    'Tailwind',
    'StyleX',
    'Panda',
    'Chakra',
    'MUI',
    'Emotion',
    'styled-components',
    'CSS Modules',
    '互操作',
    '样式库互操作',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
