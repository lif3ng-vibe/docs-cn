// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs migration`: the migration namespace. Groups the
 * incremental migration guides: setup (theme, CSS, layers), component
 * replacement, and verification.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'migration',
  title: '迁移',
  summary:
    '把现有的 Tailwind、shadcn 或 Radix 应用渐进式迁移到设计系统——设置、组件替换与验证。',
  keywords: [
    '迁移',
    '迁移指南',
    'migrate',
    'Tailwind',
    'shadcn',
    'Radix',
    '共存',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
