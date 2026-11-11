// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableStickyColumns',
  subComponentOf: 'Table',
  displayName: 'useTableStickyColumns',
  description:
    '返回 TablePlugin 的 Hook，将一段连续的列固定到表格的起始和/或结束边缘。被固定的列获得累积偏移量，并在滚动内容上方呈现柔和的、随滚动感知的阴影。空配置（{}）是有效的空操作，不固定任何列。',
  props: [
    {
      name: 'startKeys',
      type: 'string[]',
      description:
        '固定到起始（inline-start / LTR 中为左侧）边缘的列 key：从第一列到最后一个列出的 key 的连续区段。',
    },
    {
      name: 'endKeys',
      type: 'string[]',
      description:
        '固定到结束（inline-end / LTR 中为右侧）边缘的列 key：从第一个列出的 key 到最后一列的连续区段。',
    },
  ],
};

export const docsZh = {
  name: 'useTableStickyColumns',
  displayName: 'useTableStickyColumns',
  description:
    '返回 TablePlugin 的 Hook，将一组连续的列固定到表格的起始和/或结束边缘。固定的列具有累积偏移量，并在滚动内容上方显示柔和的、随滚动感知的阴影。空配置 ({}) 是有效的空操作，不固定任何列。',
  props: [
    {
      name: 'startKeys',
      type: 'string[]',
      description:
        '固定到起始（inline-start / LTR 中为左侧）边缘的列键——从第一列到最后列出的键的连续范围。',
    },
    {
      name: 'endKeys',
      type: 'string[]',
      description:
        '固定到结束（inline-end / LTR 中为右侧）边缘的列键——从第一个列出的键到最后一列的连续范围。',
    },
  ],
};

export const docsDense = {
  name: 'useTableStickyColumns',
  displayName: 'useTableStickyColumns',
  description:
    '返回 TablePlugin 的 Hook，将连续的列区段固定到起始/结束边缘，带累积偏移 + 随滚动感知的阴影。空配置 = 空操作。',
  propDescriptions: {
    startKeys:
      '固定到起始边缘的列 key（从第 0 列到最后列出的 key 的连续区段）。',
    endKeys:
      '固定到结束边缘的列 key（从第一个列出的 key 到最后一列的连续区段）。',
  },
};
