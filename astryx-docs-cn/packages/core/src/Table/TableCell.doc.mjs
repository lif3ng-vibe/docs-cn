// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TableCell',
  subComponentOf: 'Table',
  displayName: 'Table Cell',
  isHiddenFromOverview: true,
  description: '<td> 包装器，读取 TableContext 以在 Table 内部使用时应用密度内边距、字体大小和分隔线边框。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '单元格内容。',
    },
  ],
};

export const docsZh = {
  name: 'TableCell',
  isHiddenFromOverview: true,
  displayName: 'Table Cell',
  description: '<td> 包装器，读取 TableContext 以在 Table 内部使用时应用密度内边距、字体大小和分隔线边框。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '单元格内容。',
    },
  ],
};

export const docsDense = {
  name: 'TableCell',
  isHiddenFromOverview: true,
  displayName: 'Table Cell',
  description: '<td> 包装器；读取 TableContext 获取密度内边距、字体大小与分隔线边框。',
  propDescriptions: {
    children: '单元格内容。',
  },
};
