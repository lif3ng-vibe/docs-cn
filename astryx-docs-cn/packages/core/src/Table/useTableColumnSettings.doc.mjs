// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableColumnSettings',
  subComponentOf: 'Table',
  displayName: 'useTableColumnSettings',
  description: '面向 Table 的无头（headless）列可见性与排序管理。提供筛选后的列、切换辅助方法，以及为列选择器 UI 预构建的 MultiSelector 选项。',
  props: [
    {
      name: 'columns',
      type: 'ColumnSettingsOption[]',
      description: '全部可用列及其元数据，供设置 UI 使用。每个条目包含 key、label、可选的 isAlwaysVisible 和 group。',
      required: true,
    },
    {
      name: 'activeColumnKeys',
      type: 'string[]',
      description: '当前激活的列 key，按显示顺序。只有 key 在此数组中的列才会显示。',
      required: true,
    },
    {
      name: 'onChangeActiveColumnKeys',
      type: '(keys: string[]) => void',
      description: '激活列变化（切换、重新排序）时调用。',
      required: true,
    },
    {
      name: 'defaultColumnKeys',
      type: 'string[]',
      description: '"重置为默认"使用的默认列集合。省略时，重置将显示所有列。',
    },
  ],
};

export const docsZh = {
  name: 'useTableColumnSettings',
  displayName: 'useTableColumnSettings',
  description: '无头列可见性和排序管理。提供筛选后的列、切换帮助方法和 MultiSelector 选项。',
  props: [
    {
      name: 'columns',
      type: 'ColumnSettingsOption[]',
      description: '所有可用列及其设置 UI 的元数据。每个条目包含 key、label、可选的 isAlwaysVisible 和 group。',
      required: true,
    },
    {
      name: 'activeColumnKeys',
      type: 'string[]',
      description: '当前活动的列键，按显示顺序排列。',
      required: true,
    },
    {
      name: 'onChangeActiveColumnKeys',
      type: '(keys: string[]) => void',
      description: '活动列更改时调用。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'useTableColumnSettings',
  displayName: 'useTableColumnSettings',
  description: '无头（headless）列可见性/排序管理。提供筛选后的列、切换辅助方法、MultiSelector 选项。',
  propDescriptions: {
    columns: '全部可用列及元数据（key、label、isAlwaysVisible、group）。',
    activeColumnKeys: '按显示顺序的激活列 key。',
    onChangeActiveColumnKeys: '列切换/重新排序时调用。',
    defaultColumnKeys: '重置时使用的默认列集合。省略 = 显示全部。',
  },
};
