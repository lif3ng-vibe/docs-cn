// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Inline picker',
  displayName: 'Inline picker',
  description:
    '内联在 Card 中的 emoji 选择器：按名称或关键词搜索，用方向键移动并选取；最近一次选取的 emoji 显示在选择器上方。',
  exampleFor: 'EmojiPicker',
  isReady: true,
  isShowcase: true,
  aspectRatio: 1,
  componentsUsed: ['EmojiPicker', 'Card', 'HStack', 'VStack', 'Text'],
};
