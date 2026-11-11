// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowExpansion',
  subComponentOf: 'Table',
  displayName: 'useTableRowExpansion',
  description:
    '返回 TablePlugin 的 Hook，在行下方展开一个全宽详情面板，由消费方通过 renderExpanded(item) 渲染。会添加一个前置折叠箭头列和右键"展开/折叠行"操作；由消费方持有 expandedKeys 集合。面板横跨整行，但其内容从第一列开始、越过折叠箭头，使详情与上方表头标签对齐；内缩量跟随表格密度。适用于主从行（订单详情、表单、图表、嵌套表格）。对于子行复用父列的层级数据，请改用 useTableTreeData + useTableTreeState。',
  props: [
    {
      name: 'expandedKeys',
      type: 'Set<string>',
      description: '当前已展开行 key 的集合。由消费方持有。',
      required: true,
    },
    {
      name: 'onToggle',
      type: '(key: string) => void',
      description:
        '某行的展开状态切换时（点击折叠箭头或右键菜单操作）以该行 key 调用。',
      required: true,
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description: '从行条目推导稳定唯一 key。',
      required: true,
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        '为折叠箭头的无障碍名称推导人类可读的行标识。Astryx 会将其与本地化的展开/折叠措辞组合。省略它或返回空文本，可保留通用的 "Expand row" 和 "Collapse row" 标签。',
    },
    {
      name: 'renderExpanded',
      type: '(item: T) => ReactNode',
      description:
        '渲染行展开时显示在行下方全宽面板中的详情内容。接收行条目。',
      required: true,
    },
    {
      name: 'getIsItemExpandable',
      type: '(item: T) => boolean',
      description:
        '控制哪些行可展开。不可展开的行不显示折叠箭头、无右键菜单操作，也从不渲染面板。默认所有行均可展开。',
    },
    {
      name: 'panelVariant',
      type: "'muted' | 'transparent'",
      description:
        "详情面板背后的背景。'transparent'（默认）不绘制任何东西：面板是行的延续，呈现表格所在的任何表面，因此 Card 会透出来，条纹表格的斑马纹也照常显示。'muted' 为其罩一层色，把它标记为注释而非又一行的数据——适用于无卡片、无分隔线、无条纹的素表格，因为那里没有其他东西做出这种区分。这层色是低透明度的近黑色，在深色卡片上几乎不可见：'muted' 基本上是浅色主题的效果。",
      default: "'transparent'",
    },
    {
      name: 'hasRowClickExpansion',
      type: 'boolean',
      description:
        '点击行任意位置即可切换该行，而不只是点击折叠箭头。这是叠加在折叠箭头之上的纯指针便利功能，折叠箭头仍是键盘和辅助技术的无障碍控件。点击可交互的单元格内容（按钮、链接、表单控件）或文本选区不会切换，不可展开的行保持无响应。',
      default: 'false',
    },
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        "来自 useAnimatedLayout 的句柄。启用后，打开或关闭面板会让其后的行（以及表格之后的内容）平滑滑动到新位置而不是跳变，打开的面板以相同动效入场，每行的分隔线也随之移动。在减弱动效（Reduce Motion）下，触屏上各行原地淡入淡出，鼠标操作时立即切换；在带列线的表格中（分隔列或网格线，它们暂不参与移动）则立即切换。不启用时，行会跳变。",
    },
  ],
  examples: [
    {
      label: '主从订单行',
      code: `const [expandedKeys, setExpandedKeys] = useState(new Set());
const expansion = useTableRowExpansion({
  expandedKeys,
  onToggle: key =>
    setExpandedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    }),
  getRowKey: item => item.id,
  getRowLabel: item => item.name,
  renderExpanded: item => <OrderDetails order={item} />,
});

<Table data={orders} columns={columns} idKey="id" plugins={{expansion}} />;`,
    },
    {
      label: '从树行迁移到树插件',
      code: `// useTableRowExpansion is now for DETAIL PANELS, not tree rows. If you used
// it to render nested child rows that reuse the parent columns, move to
// useTableTreeData + useTableTreeState.

// BEFORE (tree rows via useTableRowExpansion + useTableRowExpansionState):
const {data, expansionConfig} = useTableRowExpansionState({
  baseData: tree,
  getChildren: item => item.children ?? [],
  getRowKey: item => item.id,
  expandedKeys,
  setExpandedKeys,
});
const expansion = useTableRowExpansion(expansionConfig);
<Table data={data} columns={columns} idKey="id" plugins={{expansion}} />;

// AFTER (tree rows via the tree plugin):
const {visibleData, treeConfig} = useTableTreeState({
  data: tree,                   // nested data
  idKey: 'id',                  // or a function: idKey={item => item.id}
  childrenKey: 'children',      // replaces getChildren
  defaultExpandedIds: ['root'], // or controlled: expandedIds + onExpandedIdsChange
});
const tree = useTableTreeData({
  ...treeConfig,
  hasExpandAllControl: true,    // was isAllExpanded + onToggleExpandAll
  hasRowClickExpansion: true,   // same prop name
});
<Table data={visibleData} columns={columns} idKey="id" plugins={{tree}} />;`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '返回 TablePlugin，通过 renderExpanded(item) 在行下方展开全宽详情面板。添加折叠箭头列 + 右键展开/折叠操作；由消费方持有 expandedKeys。面板内容从第一列开始（越过折叠箭头），内缩量跟随密度。对复用父列的嵌套子行，请改用 useTableTreeData + useTableTreeState。',
  propDescriptions: {
    expandedKeys: '当前已展开行 key 的集合。由消费方持有。',
    onToggle: '某行的展开状态切换时以该行 key 调用。',
    getRowKey: '从行条目推导稳定唯一 key。',
    getRowLabel:
      '为本地化的展开/折叠控件标签推导行标识。空值或省略保留通用行标签。',
    renderExpanded:
      '渲染展开行下方的全宽详情面板。接收行条目。',
    getIsItemExpandable:
      '控制哪些行可展开。默认所有行均可展开。',
    panelVariant:
      "详情面板背景：'transparent'（默认）不绘制任何东西，面板呈现表格背后的表面，条纹表格的斑马纹不受影响；'muted' 为其罩一层色，适用于没有其他手段区分面板与数据的素表格。",
    hasRowClickExpansion:
      '点击行任意位置即可切换，而不只是折叠箭头；纯指针行为，跳过可交互单元格内容和文本选区。默认 false。',
    animatedLayout:
      '来自 useAnimatedLayout 的句柄：打开或关闭面板让其后的行平滑滑动而非跳变。在减弱动效下触屏原地淡入淡出、鼠标立即切换；带列线时立即切换。',
  },
};
