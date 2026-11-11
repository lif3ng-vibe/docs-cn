// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'In a popover',
  displayName: 'In a popover',
  description:
    '在无内边距的 Popover 中，从一段文本打开单个线程。线程通过 `onDismiss` 接管 Popover 的关闭，因此要禁用 Popover 的点击外部关闭与 Escape 关闭：在线程外按压或按 Escape 会关闭线程，但当存在未保存回复时，第一次这样的操作只会让线程抖动并保留草稿。',
  exampleFor: 'CommentThread',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: [
    'CommentThread',
    'Popover',
    'Button',
    'Card',
    'Text',
    'VStack',
  ],
};
