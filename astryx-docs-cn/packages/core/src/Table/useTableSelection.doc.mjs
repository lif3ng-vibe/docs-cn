// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableSelection',
  subComponentOf: 'Table',
  displayName: 'useTableSelection',
  description:
    '返回 TablePlugin 的 Hook，实现带复选框、全选和 aria-selected 的行选中。使用 React Context 实现各复选框的独立重渲染。',
  props: [
    {
      name: 'getIsItemSelected',
      type: '(item: T) => boolean',
      description: '返回给定条目当前是否选中。',
      required: true,
    },
    {
      name: 'onSelectItem',
      type: '(event: {item: T; isSelected: boolean}) => void',
      description:
        '行复选框切换时调用。isSelected 为新的期望状态。',
      required: true,
    },
    {
      name: 'onSelectAll',
      type: '(event: {isAllSelected: boolean}) => void',
      description: '全选表头复选框切换时调用。',
      required: true,
    },
    {
      name: 'getIsAllSelected',
      type: '() => boolean',
      description:
        '返回是否所有可选择条目当前都已选中。',
      required: true,
    },
    {
      name: 'getIsIndeterminate',
      type: '() => boolean',
      description:
        '返回选中是否为部分选中（部分但非全部）。将全选复选框渲染为不确定状态。',
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description:
        '返回某行是否应显示复选框。不可选中的行在选择单元格中不渲染任何内容。',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description:
        '返回某行的复选框是否可交互。禁用的行显示禁用状态的复选框。',
      default: '() => true',
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        '为行推导人类可读的标识；行复选框的隐藏标签变为 `Select ${getRowLabel(item)}`，让屏幕阅读器播报每个复选框选中的是哪一行。省略时回退为 "Select row"。',
    },
    {
      name: 'hasRowHighlight',
      type: 'boolean',
      description:
        '为选中的行绘制强调色罩色。当周围的界面已用行背景表达其他含义（例如某行已在详情面板中打开）时设为 false。该罩色是内联样式，无法从业务代码覆盖。只去掉背景：无论哪种取值，选中行仍会设置 aria-selected。',
      default: 'true',
    },
  ],
  examples: [
    {
      label: '无障碍的逐行复选框名称',
      code: `
const selectionPlugin = useTableSelection({
  getIsItemSelected: item => selectedIds.has(item.id),
  onSelectItem: ({item, isSelected}) => toggle(item.id, isSelected),
  onSelectAll: ({isAllSelected}) => selectAll(isAllSelected),
  getIsAllSelected: () => selectedIds.size === users.length,
  // Screen readers announce "Select Alice", "Select Bob", ...
  // instead of an undifferentiated "Select row" for every checkbox.
  getRowLabel: item => item.name,
});

<Table
  data={users}
  columns={columns}
  idKey="id"
  plugins={{selection: selectionPlugin}}
/>;
`,
    },
    {
      label: '关闭选中行的罩色',
      code: `
// This table already uses row background to mean "open in the detail
// panel". Turning the selection wash off keeps that meaning unambiguous;
// the checkbox and aria-selected still carry the selection.
const selectionPlugin = useTableSelection({
  getIsItemSelected: item => selectedIds.has(item.id),
  onSelectItem: ({item, isSelected}) => toggle(item.id, isSelected),
  onSelectAll: ({isAllSelected}) => selectAll(isAllSelected),
  getIsAllSelected: () => selectedIds.size === users.length,
  hasRowHighlight: false,
});
`,
    },
  ],
};

export const docsZh = {
  name: 'useTableSelection',
  displayName: 'useTableSelection',
  description:
    '返回 TablePlugin 的 Hook，实现带复选框、全选和 aria-selected 的行选择功能。使用 React Context 实现独立的复选框重新渲染。',
  props: [
    {
      name: 'getIsItemSelected',
      type: '(item: T) => boolean',
      description: '返回给定项是否当前被选中。',
      required: true,
    },
    {
      name: 'onSelectItem',
      type: '(event: {item: T; isSelected: boolean}) => void',
      description: '当行复选框被切换时调用。isSelected 为新的期望状态。',
      required: true,
    },
    {
      name: 'onSelectAll',
      type: '(event: {isAllSelected: boolean}) => void',
      description: '当全选表头复选框被切换时调用。',
      required: true,
    },
    {
      name: 'getIsAllSelected',
      type: '() => boolean',
      description: '返回所有可选择项是否当前都被选中。',
      required: true,
    },
    {
      name: 'getIsIndeterminate',
      type: '() => boolean',
      description:
        '返回选择是否为部分选中（部分但非全部）。将全选复选框渲染为不确定状态。',
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description:
        '返回行是否应显示复选框。不可选择的行在选择单元格中不渲染任何内容。',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description: '返回行复选框是否可交互。禁用的行显示禁用状态的复选框。',
      default: '() => true',
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        '为行派生人类可读的标识；行复选框的隐藏标签变为 `Select ${getRowLabel(item)}`，让屏幕阅读器播报每个复选框选择的是哪一行。省略时回退为 "Select row"。',
    },
    {
      name: 'hasRowHighlight',
      type: 'boolean',
      description:
        '为选中的行绘制强调色背景。当周围的界面已用行背景表达其他含义（例如该行已在详情面板中打开）时设为 false —— 该背景是内联样式，无法从业务代码覆盖。仅去掉背景：无论如何选中的行仍会设置 aria-selected。',
      default: 'true',
    },
  ],
};

export const docsDense = {
  name: 'useTableSelection',
  displayName: 'useTableSelection',
  description:
    '返回实现行选中的 TablePlugin 的 Hook，带复选框、全选和 aria-selected。使用 React Context 实现各复选框的独立重渲染。',
  propDescriptions: {
    getIsItemSelected: '返回条目是否选中。',
    onSelectItem:
      '行复选框切换时调用；isSelected = 新的期望状态。',
    onSelectAll: '全选表头复选框切换时调用。',
    getIsAllSelected: '返回是否所有可选择条目都已选中。',
    getIsIndeterminate:
      '返回部分选中状态；将复选框渲染为不确定状态。',
    getIsItemSelectable:
      '返回行是否显示复选框；不可选中的行不渲染任何内容。',
    getIsItemEnabled:
      '返回行复选框是否可交互；禁用的行显示禁用状态复选框。',
    getRowLabel:
      '为复选框的隐藏标签推导行标识：`Select ${getRowLabel(item)}`。省略时回退为 "Select row"。',
    hasRowHighlight:
      'false => 跳过选中行的强调色罩色（内联样式，业务代码不可覆盖）。aria-selected 不受影响。默认 true。',
  },
};
