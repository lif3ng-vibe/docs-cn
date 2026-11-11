// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableSortable',
  subComponentOf: 'Table',
  displayName: 'useTableSortable',
  description: '面向 Table 的无头（headless）多列排序插件。以 config 对象调用：`useTableSortable({ sort, onSortChange })`。返回一个 TablePlugin，传给 `<Table plugins={{ sort: sortPlugin }} />`。',
  usage: {
    description: '以包含排序状态和回调的 config 对象调用 useTableSortable。将返回的插件通过 plugins prop 传给 Table。',
  },
  props: [
    {
      name: 'sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description: "当前排序状态（TableSortState<TSortKey>）。条目的有序数组；第一个是主排序，其余是决胜项。空数组表示未排序。方向使用完整单词：'ascending' / 'descending'，而不是 'asc' / 'desc'。",
      required: true,
    },
    {
      name: 'onSortChange',
      type: "(sort: Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>) => void",
      description: '用户点击表头单元格更改排序时调用。接收下一个排序状态。',
      required: true,
    },
    {
      name: 'allowUnsortedState',
      type: 'boolean',
      description: "允许循环回未排序。true 时：'ascending'、'descending'、未排序。false 时：'ascending'、'descending'、'ascending'。",
      default: 'false',
    },
    {
      name: 'isMultiSortEnabled',
      type: 'boolean',
      description: '通过 Shift+点击启用多列排序。普通点击仍会替换整个排序状态。',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'useTableSortable',
  displayName: 'useTableSortable',
  description: '无头多列排序插件。用户拥有排序状态并提供回调。Shift+点击启用二级排序列。排序指示器自动渲染在表头单元格中。',
  props: [
    {
      name: 'sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description: "当前排序状态。{sortKey, direction} 条目的有序数组。第一个条目是主排序。方向值为完整单词 'ascending' / 'descending'，不是 'asc' / 'desc'。",
      required: true,
    },
    {
      name: 'onSortChange',
      type: "(sort: Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>) => void",
      description: '用户点击表头单元格更改排序时调用。',
      required: true,
    },
    {
      name: 'allowUnsortedState',
      type: 'boolean',
      description: "允许循环回到未排序状态。为 true 时：'ascending'、'descending'、未排序。为 false 时：'ascending'、'descending'、'ascending'。",
      default: 'false',
    },
    {
      name: 'isMultiSortEnabled',
      type: 'boolean',
      description: '通过 Shift+点击启用多列排序。普通点击仍替换整个排序状态。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'useTableSortable',
  displayName: 'useTableSortable',
  description: '无头（headless）多列排序插件。由消费方持有排序状态 + 回调。Shift+点击追加次级排序。排序指示器自动渲染在表头单元格中。',
  propDescriptions: {
    sort: "当前排序状态；{sortKey, direction: 'ascending'|'descending'} 条目的有序数组。不是 'asc'/'desc'。",
    onSortChange: '点击表头更改排序时调用。',
    allowUnsortedState: "允许循环到未排序。true：ascending>descending>未排序。false：ascending>descending>ascending。",
    isMultiSortEnabled: '通过 Shift+点击启用多列排序。普通点击替换排序状态。',
  },
};
