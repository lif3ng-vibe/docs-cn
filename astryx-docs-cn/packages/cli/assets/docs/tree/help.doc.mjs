// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs authoring/help — find a CLI message and its fix. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'help',
  placement: {parent: 'namespace:authoring', slot: 'guides', order: 40},
  title: '帮助',
  summary: '查找一条 CLI 消息及其修复方法。',
  keywords: ['authoring', '帮助', '故障排除', '错误'],
  slots: {
    guides: {title: '帮助', accepts: {kinds: ['generic']}},
  },
};
