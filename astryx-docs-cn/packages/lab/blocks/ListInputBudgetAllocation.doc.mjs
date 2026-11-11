// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Budget allocation',
  displayName: 'Budget allocation',
  description:
    '一条记录中混用多种控件类型：比例宽度列中的团队 Selector，旁边是固定 132px 列中的百分比 NumberInput。每个团队只能出现一次（记录级错误），各行合计必须为 100%（列表级错误），Add 最多添加四个团队。',
  exampleFor: 'ListInput',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['ListInput', 'Selector', 'NumberInput', 'VStack'],
};
