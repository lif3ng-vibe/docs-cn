// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'In a popover',
  displayName: 'In a popover',
  description:
    '从一个表情按钮在无内边距的 Popover 中打开 emoji 选择器。保留 Popover 的自动聚焦：焦点落在搜索框，输入立即可搜索。',
  exampleFor: 'EmojiPicker',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['EmojiPicker', 'Popover', 'IconButton', 'Text', 'HStack'],
};
