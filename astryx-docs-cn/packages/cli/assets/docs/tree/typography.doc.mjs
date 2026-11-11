// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs typography`: the typography namespace. Groups guides for
 * font setup, the type scale, and best practices.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'typography',
  title: '排版',
  summary:
    '字体族、几何字阶、字重、行高与语义文本令牌，用于一致且无障碍的文本样式。',
  keywords: [
    '排版',
    '字体',
    '字阶',
    '标题',
    '文本',
    '字重',
    '行高',
    'display',
  ],
  slots: {
    guides: {title: '指南', accepts: {kinds: ['generic']}},
  },
};
