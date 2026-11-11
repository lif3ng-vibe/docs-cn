// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableSelectionState',
  subComponentOf: 'Table',
  displayName: 'useTableSelectionState',
  description:
    'useTableSelection 的状态管理配套 Hook。返回 selectionConfig（用于行为插件）和 selectionState（用于感知选中状态的 UI，如 TableSelectionToolbar）。自动处理全选时的禁用/可选择行过滤：禁用行被冻结（在全选/取消全选时保持其状态），不可选中的行被排除。',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description: '表格中渲染的完整数据数组。',
      required: true,
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string)',
      description:
        'key 提取器：属性名或返回唯一字符串 ID 的函数。',
      required: true,
    },
    {
      name: 'selectedKeys',
      type: 'Set<string>',
      description: '受控的已选中条目 ID 集合。',
      required: true,
    },
    {
      name: 'setSelectedKeys',
      type: 'Dispatch<SetStateAction<Set<string>>>',
      description: '受控选中 keys 的设置器。',
      required: true,
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description:
        '该行是否显示复选框？不可选中的行在全选时被排除。',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description:
        '该行的复选框是否可交互？禁用行被冻结：全选保留其状态。',
      default: '() => true',
    },
  ],
};

export const docsDense = {
  name: 'useTableSelectionState',
  displayName: 'useTableSelectionState',
  description:
    'useTableSelection 的状态配套 Hook。返回 selectionConfig（行为插件）+ selectionState（感知选中状态的 UI）。自动处理全选时的禁用/可选择行过滤：禁用行冻结（全选/取消全选时保持状态），不可选中的行排除。',
  propDescriptions: {
    data: '表格中渲染的完整数据数组',
    idKey: 'key 提取器：属性名或返回唯一字符串 ID 的函数',
    selectedKeys: '受控的已选中条目 ID 集合',
    setSelectedKeys: '受控选中 keys 的设置器',
    getIsItemSelectable:
      '返回行是否显示复选框；不可选中的行在全选时排除。默认 () => true。',
    getIsItemEnabled:
      '返回行复选框是否可交互；禁用行冻结：全选保留其状态。默认 () => true。',
  },
};
