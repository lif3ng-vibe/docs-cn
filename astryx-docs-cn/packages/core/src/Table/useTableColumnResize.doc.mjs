// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableColumnResize',
  subComponentOf: 'Table',
  displayName: 'useTableColumnResize',
  description:
    '返回 TablePlugin 的 Hook，为列头边框添加可拖动的调整手柄。支持指针 + 键盘（WAI-ARIA 窗口分隔符）调整、RTL、每列最小/最大宽度，以及比例列保留（调整相邻列以保持表格全宽）。在释放时提交宽度。',
  props: [
    {
      name: 'columnWidths',
      type: 'Record<string, number>',
      description:
        '受控的像素宽度覆盖，按列 key 索引。某个 key 存在时会覆盖该列声明的宽度。',
    },
    {
      name: 'onColumnResizeEnd',
      type: '(updates: Record<string, number>) => void',
      description:
        '调整完成时（pointerup / Enter）调用。接收所有宽度发生变化的列 key 的映射；将其合并到你的 columnWidths 状态中。',
    },
    {
      name: 'minWidth',
      type: 'number',
      description:
        '调整期间的全局最小列宽（像素）。设置后覆盖每列默认值。',
    },
    {
      name: 'maxWidth',
      type: 'number',
      description: '调整期间的全局最大列宽（像素）。',
      default: 'Infinity',
    },
    {
      name: 'columns',
      type: 'TableColumn<T>[]',
      description:
        '列定义，用于推导每列的最小宽度，并区分比例列与像素列，以决定相邻列/末列的调整行为。',
    },
  ],
};

export const docsZh = {
  name: 'useTableColumnResize',
  displayName: 'useTableColumnResize',
  description:
    '返回 TablePlugin 的 Hook，为列表头边框添加可拖动的调整手柄。支持指针 + 键盘（WAI-ARIA 窗口分隔符）调整、RTL、每列最小/最大宽度，以及比例列保留（调整相邻列以保持表格全宽）。在释放时提交宽度。',
  props: [
    {
      name: 'columnWidths',
      type: 'Record<string, number>',
      description: '受控的像素宽度覆盖，按列键索引。存在某键时会覆盖该列声明的宽度。',
    },
    {
      name: 'onColumnResizeEnd',
      type: '(updates: Record<string, number>) => void',
      description:
        '调整完成时（pointerup / Enter）调用。接收所有宽度发生变化的列键的映射——将其合并到你的 columnWidths 状态中。',
    },
    {
      name: 'minWidth',
      type: 'number',
      description: '调整期间的全局最小列宽（像素）。设置后覆盖每列默认值。',
    },
    {
      name: 'maxWidth',
      type: 'number',
      description: '调整期间的全局最大列宽（像素）。',
      default: 'Infinity',
    },
    {
      name: 'columns',
      type: 'TableColumn<T>[]',
      description:
        '列定义——用于推导每列最小宽度，并区分比例列与像素列以确定相邻列/末列的调整行为。',
    },
  ],
};

export const docsDense = {
  name: 'useTableColumnResize',
  displayName: 'useTableColumnResize',
  description:
    '返回 TablePlugin 的 Hook，带可拖动的列宽调整手柄。指针 + 键盘（WAI-ARIA 分隔符）、RTL、每列最小/最大值、比例保留（调整相邻列）。释放时提交。',
  propDescriptions: {
    columnWidths: '受控的像素宽度覆盖，按列 key 索引。',
    onColumnResizeEnd:
      '调整结束时调用；接收所有变化列宽的映射，合并进状态。',
    minWidth: '调整期间的全局最小列宽（像素）。',
    maxWidth: '调整期间的全局最大列宽（像素）。默认 Infinity。',
    columns:
      '列定义：推导每列最小值 + 检测比例/像素列，决定相邻列/末列行为。',
  },
};
