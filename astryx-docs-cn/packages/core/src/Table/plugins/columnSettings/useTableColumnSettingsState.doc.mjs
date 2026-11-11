// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useTableColumnSettingsState',
  displayName: 'useTableColumnSettingsState',
  group: 'Table',
  keywords: [
    'table',
    'column',
    'columns',
    '列设置',
    '列可见性',
    '表格设置',
    'useTableColumnSettingsState',
    'useTableColumnSettings',
  ],
  params: [
    {
      name: 'config',
      type: 'UseTableColumnSettingsStateConfig<TColumnKey>',
      description: '要配置的列与激活 keys 的状态管理。',
      required: true,
    },
    {
      name: 'config.columns',
      type: 'ReadonlyArray<ColumnSettingsOption<TColumnKey>>',
      description:
        '全部可用列及其元数据（key、label、isAlwaysVisible、group），供设置 UI 使用。',
      required: true,
    },
    {
      name: 'config.activeColumnKeys',
      type: 'ReadonlyArray<TColumnKey>',
      description:
        '当前激活的列 keys，按显示顺序。只有此列表中的列才会在表格中渲染。',
      required: true,
    },
    {
      name: 'config.onChangeActiveColumnKeys',
      type: '(keys: ReadonlyArray<TColumnKey>) => void',
      description:
        '激活列变化（通过切换、全部显示或重置）时调用，用于更新消费方状态。',
      required: true,
    },
    {
      name: 'config.defaultColumnKeys',
      type: 'ReadonlyArray<TColumnKey>',
      description:
        'resetToDefault 恢复的默认列集合。省略时，resetToDefault 激活所有列。',
      required: false,
    },
  ],
  returns: [
    {
      name: 'columnSettingsConfig',
      type: 'UseTableColumnSettingsStateConfig<TColumnKey>',
      description:
        '开箱即用的 config，可直接传给 useTableColumnSettings(columnSettingsConfig)。',
    },
    {
      name: 'activeColumnKeys',
      type: 'ReadonlyArray<TColumnKey>',
      description:
        '按显示顺序透传当前激活的列 keys。',
    },
    {
      name: 'toggleColumn',
      type: '(key: TColumnKey) => void',
      description:
        '切换列可见性：移除激活列或追加未激活列。对 isAlwaysVisible 列不生效。',
    },
    {
      name: 'isColumnActive',
      type: '(key: TColumnKey) => boolean',
      description:
        '指定列当前是否在激活列 keys 列表中。',
    },
    {
      name: 'isColumnToggleable',
      type: '(key: TColumnKey) => boolean',
      description:
        '指定列是否可切换（当 isAlwaysVisible 为 true 时返回 false）。',
    },
    {
      name: 'showAllColumns',
      type: '() => void',
      description: '激活表格中所有已配置的列。',
    },
    {
      name: 'resetToDefault',
      type: '() => void',
      description:
        '将激活列 keys 重置为 defaultColumnKeys（若省略 defaultColumnKeys 则为所有列）。',
    },
    {
      name: 'setActiveColumnKeys',
      type: '(keys: string[]) => void',
      description:
        '根据 key 字符串列表设置激活列 keys，并保证 isAlwaysVisible 列保持激活。',
    },
  ],
  usage: {
    description:
      '面向 Table 的无头（headless）列可见性与排序状态管理。管理哪些列处于激活状态，提供切换和重置操作，并产出可直接喂给 useTableColumnSettings 的 config 对象。与渲染器无关，可搭配任何列选择器 UI。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 columnSettingsConfig 直接传给 useTableColumnSettings，并把得到的插件交给 Table。',
      },
      {
        guidance: true,
        description:
          '为关键的标识列（如 name 或 ID）标记 isAlwaysVisible: true，避免用户误隐藏。',
      },
      {
        guidance: false,
        description:
          '不要直接修改 activeColumnKeys 数组；应使用 toggleColumn、showAllColumns 或 resetToDefault。',
      },
    ],
  },
  relatedComponents: ['Table'],
  relatedHooks: ['useTableColumnSettings', 'useTableSelectionState'],
  importPath: '@astryxdesign/core/Table',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '面向 Table 的无头（headless）列可见性与排序状态。管理激活列与切换/重置操作，为 useTableColumnSettings 产出 config。与渲染器无关；可搭配任何选择器 UI。',
  paramDescriptions: {
    config: '列 + 激活 keys 的状态管理。',
    'config.columns':
      '全部可用列及其元数据（key、label、isAlwaysVisible、group）。',
    'config.activeColumnKeys': '按显示顺序的激活列 keys。',
    'config.onChangeActiveColumnKeys':
      '在列切换、全部显示或重置时调用。',
    'config.defaultColumnKeys':
      'resetToDefault 使用的默认列集合；省略则显示全部。',
  },
  returnDescriptions: {
    columnSettingsConfig: '直接传给 useTableColumnSettings。',
    activeColumnKeys: '按显示顺序的激活列 keys。',
    toggleColumn: '切换列可见性（isAlwaysVisible 时不生效）。',
    isColumnActive: '该列当前是否激活。',
    isColumnToggleable: '该列是否可切换。',
    showAllColumns: '激活所有列。',
    resetToDefault: '重置为 defaultColumnKeys（或所有列）。',
    setActiveColumnKeys: '设置激活 keys，保留 isAlwaysVisible 列。',
  },
  usage: {
    description:
      '面向 Table 的无头（headless）列可见性与排序状态：提供切换和重置操作，并为 useTableColumnSettings 产出 config。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 columnSettingsConfig 直接传给 useTableColumnSettings。',
      },
      {
        guidance: true,
        description:
          '为关键的标识列标记 isAlwaysVisible: true。',
      },
      {
        guidance: false,
        description:
          '不要直接修改 activeColumnKeys；应使用提供的切换和重置操作。',
      },
    ],
  },
};
