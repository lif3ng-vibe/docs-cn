// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableGroupedRows',
  subComponentOf: 'Table',
  displayName: 'useTableGroupedRows',
  description:
    '将扁平数据数组分组为可折叠分节行的 Hook。每个不同的 groupBy 值都会生成一个全宽的分节表头行，带折叠箭头开关、组标签和成员计数；折叠时隐藏该组的数据行，表头保持可见。展开状态保存在折叠箭头按钮上，而不是原生表格行上。与 useTableTreeState 一致：由消费方持有 collapsedGroups 集合，Hook 返回 {data, plugin, idKey}——分别作为 data、plugins 和 idKey 传给 Table。分组作用于你传入的行，因此在分页场景下顺序是筛选、排序、切片、再分组：先按组 key 排序、再按用户的 key 排序，使一个分节的行保持连续，每页都追加到表格底部，而不是在读者眼前把行插进中间。按行数截断的页仍会在分节中间切断，此时表头计的是已加载的行数而非实际总数："6" 会悄悄变成 "10"。若完整结果集已在手，请把截断点前移到所在分节的末尾：这样每个渲染出的分节都是完整的，其计数即为总数。',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description: '要分组的扁平数据。',
      required: true,
    },
    {
      name: 'groupBy',
      type: '(item: T) => string',
      description:
        '推导行的组 key。相同 key 的行归入同一分节。',
      required: true,
    },
    {
      name: 'collapsedGroups',
      type: 'Set<string>',
      description: '当前已折叠组 key 的集合。',
      required: true,
    },
    {
      name: 'onToggleGroup',
      type: '(groupKey: string) => void',
      description: '切换某组表头时以该组 key 调用。',
      required: true,
    },
    {
      name: 'renderGroupHeader',
      type: '(groupKey: string, count: number, collapsed: boolean) => ReactNode',
      description:
        "组表头内容（折叠箭头右侧）的自定义渲染器。默认为 `<groupKey> (<count>)`。",
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description:
        '真实行的稳定 key。省略时回退为位置 key。',
    },
    {
      name: 'groupOrder',
      type: 'string[]',
      description:
        '显式指定组顺序；未列出的组按首次出现顺序排在其后。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '将扁平数据数组分组为可折叠的分节行。每个 groupBy 值生成一个全宽表头（折叠箭头 + 标签 + 计数）；折叠隐藏其行，aria-expanded 保持在按钮上而非原生行上。返回 {data, plugin, idKey}：分别传给 Table 的 data / plugins / idKey。由消费方持有 collapsedGroups 集合。分页下顺序为筛选、排序、切片、分组：先按组 key 排序，使分节保持连续、各页在底部追加。按行数截断会落在分节中间，表头计的是本页而非整节；若完整结果集已在手，把截断点移到所在分节末尾，让每个渲染出的分节都完整。',
  propDescriptions: {
    data: '要分组的扁平数据。',
    groupBy: "推导行的组 key。相同 key = 同一分节。",
    collapsedGroups: '当前已折叠组 key 的集合。',
    onToggleGroup: '切换表头时以组 key 调用。',
    renderGroupHeader:
      "自定义表头内容（折叠箭头右侧）。默认 '<key> (<count>)'。参数：(key, count, collapsed)。",
    getRowKey: '真实行的稳定 key；省略时回退为位置 key。',
    groupOrder: '这些组 key 靠前排；其余保持首次出现顺序。',
  },
};
