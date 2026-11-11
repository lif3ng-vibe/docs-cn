// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TableRow',
  subComponentOf: 'Table',
  displayName: 'Table Row',
  isHiddenFromOverview: true,
  description: '<tr> 包装器，在 Table 内部使用时读取 TableContext，以应用条纹、悬停和分隔线样式。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '行单元格元素。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'TableRow',
  isHiddenFromOverview: true,
  displayName: 'Table Row',
  description: '<tr> 包装器，读取 TableContext 以在 Table 内部使用时应用条纹、悬停和分隔线样式。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '行单元格元素。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'TableRow',
  isHiddenFromOverview: true,
  displayName: 'Table Row',
  description: '<tr> 包装器；读取 TableContext 应用条纹/悬停/分隔线样式。',
  propDescriptions: {
    children: '行单元格元素。',
  },
};
