// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Host-owned placement',
  displayName: 'Comment pin in a document margin',
  description:
    '由调用方定位的 CommentPin，置于文档边距中。宿主将其锚点映射到标记的逻辑 bottom-start 角并掌控周边布局；标记则掌控自己紧凑的交互表面。激活标记会切换其选中状态。',
  exampleFor: 'CommentPin',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: ['Card', 'CommentPin', 'Text', 'VStack'],
};
