// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableFilterState',
  subComponentOf: 'Table',
  displayName: 'useTableFilterState',
  isHiddenFromOverview: true,
  description: '表格筛选的受管状态 Hook。返回当前筛选映射和 onChange 处理程序。将结果直接传给 useTableFiltering。',
  props: [
    {
      name: 'initialState',
      type: 'TableFilterState',
      description: '可选的初始筛选状态映射。',
    },
  ],
};

export const docsZh = {
  name: 'useTableFilterState',
  isHiddenFromOverview: true,
  displayName: 'useTableFilterState',
  description: '表格筛选的受管状态 hook。返回当前筛选映射和 onChange 处理程序。将结果直接传递给 useTableFiltering。',
  props: [
    {
      name: 'initialState',
      type: 'TableFilterState',
      description: '可选的初始筛选状态映射。',
    },
  ],
};

export const docsDense = {
  name: 'useTableFilterState',
  isHiddenFromOverview: true,
  displayName: 'useTableFilterState',
  description: '受管的筛选状态 Hook。返回筛选映射 + onChange 处理程序，供 useTableFiltering 使用。',
  propDescriptions: {
    initialState: '可选的初始筛选状态映射。',
  },
};
