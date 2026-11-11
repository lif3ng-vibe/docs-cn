// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Inside a card',
  displayName: 'Inside a card',
  description:
    '在卡片父级上设置 container="card"：线程变成由分隔线划定边界的 Section，因此卡片永不嵌套，撰写器停靠在卡片底部。',
  exampleFor: 'Comments',
  isReady: true,
  aspectRatio: 3 / 4,
  componentsUsed: ['Comments', 'Card'],
};
