// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Mailing list',
  displayName: 'Mailing list',
  description:
    '一个单列列表：初始为空，显示空状态且 Add 仍可用，添加到六个地址后停止。重复的地址是记录级错误，格式非法的地址在失焦后是字段级错误，移除最后一个地址则显示列表必填错误。',
  exampleFor: 'ListInput',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['ListInput', 'TextInput', 'VStack'],
};
