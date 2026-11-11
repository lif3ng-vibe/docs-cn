// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'TableSelectionToolbar',
  subComponentOf: 'Table',
  displayName: 'Table Selection Toolbar',
  description:
    '基于 Toolbar 构建的、感知选中状态的批量操作表面。传入来自 useTableSelectionState 的 selectionState，使计数、可见性与完全清空和 Table 选中插件保持同步。当应用自行维护选中状态时——例如跨服务端分页的所有匹配行——则传入它自己的 TableSelectionState（见示例）。该组件不拥有表格或粘性布局：可将其置于文档流中，或通过 xstyle 应用调用方自己的定位。',
  props: [
    {
      name: 'selection',
      type: 'TableSelectionState',
      description:
        '共享的选中状态：selectedKeys、selectedCount、hasSelection 和 clearSelection。通常由 useTableSelectionState 返回；自行维护选中状态的应用则自行构建。',
      required: true,
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description:
        '对齐到逻辑起始侧的产品自有操作控件。子控件继承工具栏尺寸。',
    },
    {
      name: 'label',
      type: 'string',
      description: '操作表面的无障碍名称。',
      default: 'Bulk actions',
    },
    {
      name: 'renderSelectionLabel',
      type: '(selectedCount: number) => ReactNode',
      description:
        '覆盖可见的计数文本，用于本地化或领域专属文案。',
      default: 'count => `${count} selected`',
    },
    {
      name: 'clearLabel',
      type: 'string',
      description:
        '清空全部受控选中命令的可见标签。',
      default: 'Unselect All',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        '工具栏尺寸。级联到产品操作控件和清空操作。',
      default: 'sm',
    },
    {
      name: 'variant',
      type: 'SectionVariant',
      description: '工具栏表面变体。',
      default: 'muted',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '调用方自有的布局样式，包括用于浮动组合的粘性定位。',
    },
  ],
  usage: {
    description:
      '将 useTableSelectionState 的两个输出分别传给对应的消费方：selectionConfig 传给 useTableSelection，selectionState 传给 TableSelectionToolbar。自行维护选中状态的应用（例如跨服务端分页的所有匹配行）则传入自己的 config 和 state。产品操作通过 startContent 渲染。固定或浮动定位交给周边布局处理。',
    bestPractices: [
      {
        guidance: true,
        description:
          '直接传入来自 useTableSelectionState 的 selectionState，使计数和清空操作与行选中保持同步，除非应用跨服务端分页自行维护选中状态。',
      },
      {
        guidance: true,
        description:
          '以 startContent 形式提供产品操作，而不是编码为配置对象。',
      },
      {
        guidance: false,
        description:
          '不要通过 Table 插件或其水平滚动包装器注入该工具栏。',
      },
    ],
  },
  examples: [
    {
      label: '选中跨服务端分页的所有匹配行',
      code: `
// The rows load one server page at a time. The app keeps the selection as
// "every matching row, minus the ones the person unticked", so rows on pages
// that never loaded are selected too. Table and the toolbar only show it.
const [isAllMatching, setIsAllMatching] = useState(false);
const [picked, setPicked] = useState(new Set()); // chosen one by one
const [excluded, setExcluded] = useState(new Set()); // unticked in all mode

const isSelected = row =>
  isAllMatching ? !excluded.has(row.id) : picked.has(row.id);
const isPageSelected = pageRows.every(isSelected);
const selectedCount = isAllMatching ? total - excluded.size : picked.size;

const selectionPlugin = useTableSelection({
  getIsItemSelected: isSelected,
  // setRows adds to or removes from excluded in all mode, picked otherwise.
  onSelectItem: ({item, isSelected}) => setRows([item], isSelected),
  onSelectAll: ({isAllSelected}) => setRows(pageRows, isAllSelected),
  getIsAllSelected: () => isPageSelected,
});

<TableSelectionToolbar
  selection={{
    // Only the loaded rows: the full set is not on the client.
    selectedKeys: new Set(pageRows.filter(isSelected).map(row => row.id)),
    selectedCount, // the app's own count
    hasSelection: selectedCount > 0,
    clearSelection: () => {
      setIsAllMatching(false);
      setPicked(new Set());
      setExcluded(new Set());
    },
  }}
  renderSelectionLabel={count =>
    !isAllMatching
      ? count + ' selected'
      : excluded.size === 0
        ? 'All ' + total + ' matching selected'
        : count + ' of ' + total + ' matching selected'
  }
  startContent={
    <>
      <Button label="Archive" variant="ghost" onClick={archive} />
      {/* Beside the action, not in its place. Once used, the offer stays as
          the command that undoes it, so focus stays on it and a second
          press can never run Archive. */}
      {isAllMatching || isPageSelected ? (
        <Button
          label={
            isAllMatching
              ? 'Select only this page'
              : 'Select all ' + total + ' matching'
          }
          variant="ghost"
          onClick={() => {
            if (isAllMatching) {
              // Every row on this page, so the label stays true and the
              // focused button stays mounted.
              setPicked(new Set(pageRows.map(row => row.id)));
              setExcluded(new Set());
            }
            setIsAllMatching(!isAllMatching);
          }}
        />
      ) : null}
    </>
  }
/>;
// In this mode the toolbar's selectedKeys holds only the loaded rows, and
// the count comes from the app. For a bulk action, send the server the
// query and the excluded ids, not a list of selected ids.
`,
    },
  ],
};

export const docsDense = {
  name: 'TableSelectionToolbar',
  displayName: 'Table Selection Toolbar',
  description:
    '感知选中状态的 Toolbar 包装器。消费来自 useTableSelectionState 的 selectionState，或跨服务端分页选中场景下应用自建的状态；负责计数、清空、可见性和 Toolbar 语义。操作与固定/浮动定位由调用方负责。',
  propDescriptions: {
    selection:
      '来自 useTableSelectionState 的 selectionState，或应用自建：selectedKeys/count/presence + 完全清空命令',
    startContent: '产品自有的批量操作控件',
    label: '工具栏的无障碍名称；默认为 Bulk actions',
    renderSelectionLabel: '覆盖可见的计数文案；接收 selectedCount',
    clearLabel: '完全清空按钮的标签；默认为 Unselect All',
    size: '工具栏尺寸；默认 sm，并级联到子控件',
    variant: '工具栏表面；默认 muted',
    xstyle: '调用方自有的布局/定位样式',
  },
};
