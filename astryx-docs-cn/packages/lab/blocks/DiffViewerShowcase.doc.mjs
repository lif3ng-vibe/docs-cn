// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Unified diff from a patch',
  displayName: 'Unified diff from a patch',
  description:
    '一个补丁，经 parseUnifiedDiff 解析后以 unified 或 split（并排）视图渲染。点击行号会选中该行，并在其下方展开一条批注行，呈现方式与评审评论一致。',
  exampleFor: 'DiffViewer',
  isReady: true,
  isShowcase: true,
  aspectRatio: 16 / 9,
  componentsUsed: [
    'DiffViewer',
    'Button',
    'HStack',
    'StackItem',
    'VStack',
    'Text',
  ],
};
