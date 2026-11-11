// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'Family member declaration',
  displayName: 'Family member declaration',
  description:
    '每条记录三个简单字段，即推荐的上限：法定全名、关系 Selector，以及固定 176px 列中的 DateInput。顺序无关紧要，因此列表不可重排。在 640px 或更窄时，每条记录的各字段纵向堆叠并重复显示标签。',
  exampleFor: 'ListInput',
  isReady: true,
  aspectRatio: 4 / 3,
  componentsUsed: ['ListInput', 'TextInput', 'Selector', 'DateInput', 'VStack'],
};
