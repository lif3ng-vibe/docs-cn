// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Tag options',
  displayName: 'Tag options',
  description:
    '一个可重排的标签编辑器。每条记录由颜色 Selector 与标签 TextInput 组成；拖动重排手柄或用键盘重排。校验放在最窄的有效层级：失焦后标签为空是字段级错误，颜色与标签的组合不被允许是记录级错误，标签少于五个是列表级错误。',
  exampleFor: 'ListInput',
  isReady: true,
  isShowcase: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['ListInput', 'Selector', 'TextInput', 'VStack'],
};
