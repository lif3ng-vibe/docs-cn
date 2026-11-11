// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTableSortableState',
  displayName: 'useTableSortableState',
  group: 'Table',
  keywords: [
    'table',
    'sort',
    'sorting',
    '多列排序',
    '排序状态',
    'comparator',
    'useTableSortable',
    '本地排序',
  ],
  params: [
    {
      name: 'config',
      type: 'UseTableSortableStateConfig<T, TSortKey>',
      description: '要排序的行以及排序状态的归属方式。',
      required: true,
    },
    {
      name: 'config.data',
      type: 'T[]',
      description:
        '要排序的行。该 Hook 返回排序后的副本，从不修改原数组。',
      required: true,
    },
    {
      name: 'config.defaultSort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description:
        'Hook 自持状态时的初始排序状态。传入 sort 时忽略。',
      default: '[]',
      required: false,
    },
    {
      name: 'config.sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description:
        '受控排序状态。与 onSortChange 一起传入，由你自己持有状态。',
      required: false,
    },
    {
      name: 'config.onSortChange',
      type: "(sort: Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>) => void",
      description:
        '以下一个排序状态调用。传入 sort 时必填。',
      required: false,
    },
    {
      name: 'config.comparators',
      type: 'Partial<Record<TSortKey, (a: T, b: T) => number>>',
      description:
        '每个排序 key 的升序比较器；降序时 Hook 会反转其结果。未提供比较器的 key 对数字按数值比较，其他值按字符串使用当前 InternationalizationProvider locale 下的数字 collator 比较，并将 null、undefined 和 NaN 在升序时排在最后、降序时排在最前。',
      required: false,
    },
    {
      name: 'config.allowUnsortedState',
      type: 'boolean',
      description:
        "传给 useTableSortable：第三次点击表头时该列回到未排序状态，而不是 'ascending'。",
      default: 'true',
      required: false,
    },
    {
      name: 'config.isMultiSortEnabled',
      type: 'boolean',
      description:
        '传给 useTableSortable：Shift+点击表头会将该列追加为下一个排序 key，若已参与排序则切换其方向，而不是替换整个排序。',
      default: 'false',
      required: false,
    },
  ],
  returns: [
    {
      name: 'sortedData',
      type: 'T[]',
      description:
        'data 的排序副本，基于 data 与排序状态做记忆化。并列时保持 data 中的原有顺序。',
    },
    {
      name: 'sort',
      type: "Array<{sortKey: TSortKey, direction: 'ascending' | 'descending'}>",
      description: '当前排序状态，第一个条目最优先。',
    },
    {
      name: 'sortConfig',
      type: 'UseTableSortableConfig<TSortKey>',
      description:
        '传给 useTableSortable(sortConfig)，并把得到的插件交给 Table。',
    },
    {
      name: 'applySort',
      type: '(data: T[]) => T[]',
      description:
        '用当前排序状态和比较器对另一个数组排序，适用于第二数据源或子集。',
    },
  ],
  usage: {
    description:
      "持有 Table 的排序状态并在本地对行排序，是 useTableSortable 之上的便捷封装。传入行数据、渲染 sortedData，并把 sortConfig 交给 useTableSortable。该 Hook 自己维护状态（受控时从 sort 和 onSortChange 读取），因此点击表头即可重新排序，组件内无需任何排序代码。启用 isMultiSortEnabled 后，Shift+点击可追加决胜列。对于在服务端排序的数据，请直接使用 useTableSortable，在数据所在处排序。",
    bestPractices: [
      {
        guidance: true,
        description:
          '完整数据集在内存中时使用它，并将 sortedData 传给 Table。',
      },
      {
        guidance: true,
        description:
          '为顺序不等于其字符串或数值大小的值添加比较器，例如状态等级。',
      },
      {
        guidance: false,
        description:
          '不要用于服务端排序或服务端分页的数据；该 Hook 只排序传入的行。',
      },
    ],
  },
  relatedComponents: ['Table'],
  relatedHooks: ['useTableSortable', 'useCollator'],
  importPath: '@astryxdesign/core/Table',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "持有 Table 的排序状态 + 本地排序行；useTableSortable 之上的便捷封装。渲染 sortedData，把 sortConfig 传给 useTableSortable。非受控或受控（sort + onSortChange）。isMultiSortEnabled：Shift+点击追加决胜列。服务端排序数据请直接用 useTableSortable。",
  paramDescriptions: {
    config: '行数据 + 排序状态的归属方式。',
    'config.data': '行数据；返回排序副本，不修改原数组。',
    'config.defaultSort':
      '非受控的初始排序状态；传入 sort 时忽略。',
    'config.sort': '受控排序状态；与 onSortChange 搭配。',
    'config.onSortChange': '以下一个排序状态调用；使用 sort 时必填。',
    'config.comparators':
      '每个 key 的升序比较器（降序时反转）。未提供时数字按数值比较，其他值按 provider locale 的数字 collator 作字符串比较；null/undefined/NaN 升序排最后、降序排最前。',
    'config.allowUnsortedState':
      '传给 useTableSortable：第三次点击回到未排序。',
    'config.isMultiSortEnabled':
      '传给 useTableSortable：Shift+点击追加排序 key 或切换其方向。',
  },
  returnDescriptions: {
    sortedData: '排序副本，基于 data + 排序做记忆化；并列保持 data 顺序。',
    sort: '当前排序状态。',
    sortConfig: '传给 useTableSortable；插件交给 Table。',
    applySort: '用当前状态 + 比较器排序另一个数组。',
  },
  usage: {
    description:
      '基于 useTableSortable 为 Table 提供本地排序状态 + 已排序行：渲染 sortedData，把 sortConfig 传给 useTableSortable。启用 isMultiSortEnabled 时 Shift+点击追加决胜列。服务端排序数据请用 useTableSortable。',
    bestPractices: [
      {
        guidance: true,
        description: '用于内存中的数据；把 sortedData 传给 Table。',
      },
      {
        guidance: true,
        description:
          '为非自然顺序添加比较器（如状态等级）。',
      },
      {
        guidance: false,
        description: '不要用于服务端排序/分页数据。',
      },
    ],
  },
};
