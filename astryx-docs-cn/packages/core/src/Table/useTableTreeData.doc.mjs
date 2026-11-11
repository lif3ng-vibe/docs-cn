// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableTreeData',
  subComponentOf: 'Table',
  displayName: 'useTableTreeData',
  description:
    '面向 Table 的无头（headless）树插件：渲染嵌套行，在树列（默认第一列）中带逐级缩进和展开/折叠箭头，并在表体行上通过 aria-level、在每个展开/折叠按钮上通过 aria-expanded 反映层级。可与其他 Table 插件组合：规范插件顺序将 tree 置于 selection 之前，因此复选框列位于缩进树列的左侧。喂给它来自 useTableTreeState 的 treeConfig，或针对服务端驱动的树或已预先拍平的树直接构造 config。当没有任何行可展开（扁平数据）时，所有变换都是直通的，表格渲染结果与没有该插件时完全一致。已知限制：树列会换行其单元格内容，因此 textOverflow="truncate" 的工具提示在树列内不适用。',
  props: [
    {
      name: 'getRowMeta',
      type: '(item: T) => TableTreeRowMeta | undefined',
      description:
        '可见行的结构元数据：{id, level（从 0 开始）, hasChildren, isExpanded}。',
      required: true,
    },
    {
      name: 'onToggleItem',
      type: '(item: T) => void',
      description: "切换某行的展开状态。",
      required: true,
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        '为展开器推导人类可读的行标识。Astryx 会将其与本地化的展开/折叠措辞组合。省略它或返回空文本，可保留通用的 "Expand row" 和 "Collapse row" 标签。',
    },
    {
      name: 'hasExpandableRows',
      type: 'boolean',
      description:
        '数据集中是否存在可展开的行。为 false 时该插件是空操作：无展开器、无缩进、无树形 ARIA。',
      required: true,
    },
    {
      name: 'hasExpandAllControl',
      type: 'boolean',
      description:
        '在树列表头显示全部展开/全部折叠开关。需要 isAllExpanded 以及 onExpandAll/onCollapseAll（均由 useTableTreeState 提供）。',
      default: 'false',
    },
    {
      name: 'isAllExpanded',
      type: "boolean | 'indeterminate'",
      description:
        '跨所有可展开行的聚合展开状态，驱动表头的全部展开开关。全部展开时为 true，全部折叠时为 false，部分展开时为 indeterminate。',
    },
    {
      name: 'onExpandAll',
      type: '() => void',
      description: '展开所有可展开行。接到表头控件上。',
    },
    {
      name: 'onCollapseAll',
      type: '() => void',
      description: '折叠所有行。接到表头控件上。',
    },
    {
      name: 'indent',
      type: "'sm' | 'md' | 'lg'",
      description:
        '每级缩进步长，映射到 spacing-3 / spacing-4 / spacing-6 令牌。',
      default: "'md'",
    },
    {
      name: 'treeColumnKey',
      type: 'string',
      description:
        '承载缩进 + 展开器的列。默认为第一列。',
    },
    {
      name: 'hasRowClickExpansion',
      type: 'boolean',
      description:
        '为 true 时，点击可展开行的任意位置也会切换其展开（折叠箭头之外）。这是纯指针的便利功能：键盘和辅助技术用户通过折叠箭头按钮切换。点击可交互的单元格内容（按钮、链接、表单控件）或文本选区不会切换。叶子行保持无响应，在扁平数据上是空操作。',
      default: 'false',
    },
  ],
  examples: [
    {
      label: '可展开文件夹的文件树',
      code: `const {visibleData, treeConfig} = useTableTreeState({
  data: files,          // rows may nest under 'children'
  idKey: 'id',
  defaultExpandedIds: ['src'],
});
const tree = useTableTreeData({
  ...treeConfig,
  getRowLabel: item => item.name,
});

<Table data={visibleData} columns={columns} idKey="id" plugins={{tree}} />;`,
    },
  ],
};

export const docsDense = {
  name: 'useTableTreeData',
  displayName: 'useTableTreeData',
  description:
    '无头（headless）树插件：在树列（默认第一列）上提供缩进 + 展开箭头，表体行带 aria-level，每个展开按钮带 aria-expanded。规范插件顺序将 tree 置于 selection 之前（复选框列位于树列左侧）。消费来自 useTableTreeState 的 treeConfig，或针对服务端驱动的树直接构造。hasExpandableRows=false => 完全空操作（扁平数据迁移）。',
  propDescriptions: {
    getRowMeta:
      '每个可见行的结构元数据：{id, level（从 0 开始）, hasChildren, isExpanded}',
    onToggleItem: '切换行展开',
    getRowLabel:
      '为本地化的展开/折叠无障碍名称推导行标识。空值或省略保留通用行标签。',
    hasExpandableRows: 'false => 插件为空操作（无展开器/缩进/ARIA）',
    indent:
      "每级缩进步长：'sm' | 'md' | 'lg'（spacing-3/4/6）。默认 'md'。",
    treeColumnKey:
      '承载缩进 + 展开器的列。默认第一列。',
    hasExpandAllControl:
      '在树列表头显示全部展开/全部折叠开关。需要 isAllExpanded + onExpandAll/onCollapseAll（来自 useTableTreeState）。默认 false。',
    isAllExpanded:
      "驱动表头开关的聚合状态：true（全部）| false（无）| 'indeterminate'（部分）。",
    onExpandAll: '展开所有可展开行（表头控件）',
    onCollapseAll: '折叠所有行（表头控件）',
    hasRowClickExpansion:
      'true => 点击可展开行的行体切换其展开（折叠箭头之外）。叶子行无响应；扁平数据上为空操作。默认 false。',
  },
};
