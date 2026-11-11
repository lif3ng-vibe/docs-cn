// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Inline comments',
  displayName: 'Inline comments',
  description:
    '一个贴近真实的 Markdown 文档评审场景：高亮段落与 Comments 侧边面板保持同步。选中未批注的段落会发起一条带引用的线程；回复与解决操作更新由宿主持有的数据。',
  exampleFor: 'Comments',
  isReady: true,
  aspectRatio: 3 / 2,
  componentsUsed: ['Button', 'Card', 'Comments', 'HStack', 'Text', 'VStack'],
};
