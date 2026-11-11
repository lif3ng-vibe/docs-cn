// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling`: the styling namespace. Groups guides for
 * styling basics (xstyle, className, rest props), advanced patterns
 * (compounds, data attrs, deprecated), and tokens + StyleX setup.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'styling',
  title: '组件样式',
  summary:
    '定制组件外观：xstyle、Tailwind、className、rest props、复合组件、data 属性选择器、令牌与 StyleX 配置。',
  keywords: [
    '样式',
    'xstyle',
    'className',
    '覆盖',
    '定制',
    'css',
    'StyleX',
    '令牌',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
