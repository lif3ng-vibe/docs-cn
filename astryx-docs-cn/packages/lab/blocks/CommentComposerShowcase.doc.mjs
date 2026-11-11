// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'New comment',
  displayName: 'New comment',
  description:
    '评论撰写器（composer）引用其评论所针对的段落：输入文字、添加表情，然后用 Enter 或 Post 发布。',
  exampleFor: 'CommentComposer',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['CommentComposer', 'VStack', 'Text'],
};
