// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Margin comment',
  displayName: 'Margin comment',
  description:
    '文档旁边一张 Card 中的单个评论线程：它引用所属段落，按压后展开其回复与回复撰写器，并可将其标记为已解决。',
  exampleFor: 'CommentThread',
  isReady: true,
  isShowcase: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['CommentThread', 'Card'],
};
