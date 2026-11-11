// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Comments panel',
  displayName: 'Comments panel',
  description:
    '一个可实际操作的 Comments 面板：带回复的线程、表情回应、编辑历史、受控的输入中状态与隐藏的已读元数据、行内评论、不打断阅读的未读回复展开、一条仍在撰写中的智能体（agent）回复、一个已解决的线程、一条发送失败的评论、活动事件，以及可加载的更早评论。可以发布、回复、回应、编辑、删除与解决；宿主会更新受控的评论数据。',
  exampleFor: 'Comments',
  isReady: true,
  isShowcase: true,
  aspectRatio: 3 / 4,
  componentsUsed: ['Comments', 'VStack'],
};
