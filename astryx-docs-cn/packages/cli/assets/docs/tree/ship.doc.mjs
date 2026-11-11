// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file astryx docs authoring/ship — test, publish, and upgrade. */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'ship',
  placement: {parent: 'namespace:authoring', slot: 'guides', order: 30},
  title: '交付',
  summary: '测试、发布并升级你的包。',
  keywords: ['authoring', '交付', '发布', '版本发布', '升级'],
  slots: {
    guides: {title: '交付', accepts: {kinds: ['generic']}},
  },
};
