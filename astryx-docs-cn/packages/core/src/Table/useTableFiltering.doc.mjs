// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableFiltering',
  subComponentOf: 'Table',
  displayName: 'useTableFiltering',
  isHiddenFromOverview: true,
  description: '为表格添加内联列筛选器的 Table 插件，控件可为弹出式或内联。与 useTableFilterState 搭配管理状态。通过 PowerSearch 字段定义支持文本、单选、多选、日期和数字筛选类型。',
  props: [
    {
      name: 'filters',
      type: 'TableFilterState',
      description: '当前筛选状态：列 key 到筛选值的映射。',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: TableFilterValue | null) => void',
      description: '用户更改筛选值时调用。null 表示清除筛选。',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline' | 'inline-compact'",
      description: '筛选控件的显示变体。',
      default: "'popover'",
    },
  ],
};

export const docsZh = {
  name: 'useTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useTableFiltering',
  description: '表格筛选插件，添加内联列过滤器（弹出式或内联控件）。与 useTableFilterState 配合使用管理状态。',
  props: [
    {
      name: 'filters',
      type: 'TableFilterState',
      description: '当前筛选状态——列键到筛选值的映射。',
      required: true,
    },
    {
      name: 'onFilterChange',
      type: '(columnKey: string, value: TableFilterValue | null) => void',
      description: '用户更改筛选值时调用。null 清除筛选。',
      required: true,
    },
    {
      name: 'variant',
      type: "'popover' | 'inline' | 'inline-compact'",
      description: '筛选控件的显示变体。',
      default: "'popover'",
    },
  ],
};

export const docsDense = {
  name: 'useTableFiltering',
  isHiddenFromOverview: true,
  displayName: 'useTableFiltering',
  description: '表格筛选插件：内联列筛选器（弹出式/内联）。与 useTableFilterState 搭配。',
  propDescriptions: {
    filters: '当前筛选状态映射（columnKey → 值）。',
    onFilterChange: '筛选变化时调用。null 清除。',
    variant: '筛选控件的显示变体。',
  },
};
