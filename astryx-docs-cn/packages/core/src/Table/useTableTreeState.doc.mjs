// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableTreeState',
  subComponentOf: 'Table',
  displayName: 'useTableTreeState',
  description:
    'useTableTreeData 的状态管理配套 Hook。持有展开集合（受控或非受控），并把嵌套数据拍平为可见行数组；折叠的子树会被卸载而非隐藏，因此表格表体恰好只含可见行。返回 expandAll/collapseAll 辅助方法、供表头全部展开控件使用的聚合状态 isAllExpanded（true/false/indeterminate），以及开箱即用的树插件 config。注意：由于折叠行会被卸载，折叠子树内单元格局部的 React 状态会在折叠时丢失；需要保留的状态请提升出去。',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description:
        '嵌套数据：行可在 childrenKey 下携带子行。扁平数据（任何地方都没有 children）使插件成为空操作，因此可以在数据变成层级结构之前就采用它。',
      required: true,
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string | number)',
      description:
        '行 ID 访问器：属性名或返回唯一 id 的函数。',
      required: true,
    },
    {
      name: 'childrenKey',
      type: 'string',
      description: '保存每行 children 数组的属性。',
      default: "'children'",
    },
    {
      name: 'defaultExpandedIds',
      type: 'Iterable<string>',
      description:
        '非受控模式下的初始展开行 id。提供 expandedIds 时忽略。',
    },
    {
      name: 'expandedIds',
      type: 'ReadonlySet<string>',
      description:
        '受控的展开行 id 集合。与 onExpandedIdsChange 搭配。',
    },
    {
      name: 'onExpandedIdsChange',
      type: '(ids: ReadonlySet<string>) => void',
      description:
        '展开变化时（两种模式均然）以下一个展开集合调用。在懒加载场景中，在此触发子级的拉取。',
    },
    {
      name: 'isItemExpandable',
      type: '(item: T) => boolean',
      description:
        '该行是否显示展开器？覆盖默认的"children 非空"检查；用于懒加载——子级尚未拉取时行即可展开。',
    },
    {
      name: 'sortSiblings',
      type: '(siblings: T[]) => T[]',
      description:
        '拍平期间对每个兄弟组独立排序；子级始终紧跟其父级之下。传入来自 useTableSortableState 的 applySort，可与列排序组合。',
    },
    {
      name: 'indent',
      type: "'sm' | 'md' | 'lg'",
      description:
        '每级缩进步长（spacing-3 / spacing-4 / spacing-6），转发给 useTableTreeData。',
      default: "'md'",
    },
    {
      name: 'treeColumnKey',
      type: 'string',
      description:
        '承载缩进 + 展开器的列，转发给 useTableTreeData。默认为第一列。',
    },
  ],
};

export const docsDense = {
  name: 'useTableTreeState',
  displayName: 'useTableTreeState',
  description:
    'useTableTreeData 的状态配套 Hook。持有展开集合（受控或非受控），把嵌套数据拍平为可见行（折叠子树被卸载而非隐藏）。返回 {visibleData, treeConfig, expandedIds, isAllExpanded, expandAll, collapseAll}（isAllExpanded = true/false/indeterminate，供表头全部展开控件使用）。折叠子树内单元格局部状态在折叠时丢失；需要保留的状态请提升。',
  propDescriptions: {
    data: '嵌套数据；行在 childrenKey 下携带子行。扁平数据 => 插件为空操作。',
    idKey: '行 ID 访问器：属性名或返回唯一 id 的函数',
    childrenKey: "保存 children 数组的属性。默认 'children'。",
    defaultExpandedIds: '初始展开 id（非受控）',
    expandedIds: '受控展开集合；与 onExpandedIdsChange 搭配',
    onExpandedIdsChange:
      '变化时以下一个展开集合调用（两种模式均然）；在此触发懒加载子级拉取',
    isItemExpandable:
      '覆盖"children 非空"可展开检查（懒加载）',
    sortSiblings:
      '拍平期间对每个兄弟组排序；传入来自 useTableSortableState 的 applySort',
    indent: "每级缩进步长：'sm' | 'md' | 'lg'。默认 'md'。",
    treeColumnKey: '承载缩进 + 展开器的列。默认第一列。',
  },
};
