// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMultiCombobox',
  displayName: 'useMultiCombobox',
  group: 'MultiSelector',
  keywords: [
    'combobox',
    'multi-select',
    'multiselect',
    'listbox',
    'grid',
    'toggle',
    'highlight',
    '活动选项',
    'aria-activedescendant',
    'keyboard',
    'headless',
    'apg',
    'accessibility',
    'a11y',
    '多选',
  ],
  params: [
    {
      name: 'options',
      type: 'UseMultiComboboxOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.selectableItems',
      type: 'MultiSelectorOptionData[]',
      description:
        '选项，顺序与渲染顺序一致。带 `disabled` 的选项不能切换，且在已打开列表中移动时被跳过。打开绝不停在禁用选项上：ArrowUp 打开时落在最后一个可用选项上，ArrowDown、按压、Enter 或 Space 落在第一个可用选项上。',
      required: true,
    },
    {
      name: 'options.isOpen',
      type: 'boolean',
      description: '是否显示列表。该状态由调用方管理。',
      required: true,
    },
    {
      name: 'options.onOpen',
      type: '() => unknown',
      description:
        '显示列表时调用。返回 `false` 拒绝；此时 hook 不动高亮。',
      required: true,
    },
    {
      name: 'options.onClose',
      type: '() => void',
      description: '隐藏列表时调用。高亮先重置。',
      required: true,
    },
    {
      name: 'options.onToggle',
      type: '(itemValue: string) => void',
      description:
        '以要添加或移除的选项值调用。切换后列表保持打开。',
      required: true,
    },
    {
      name: 'options.listboxId',
      type: 'string',
      description:
        'listbox（或 grid）元素的 id。选项与操作单元格的 id 由它派生。',
      required: true,
    },
    {
      name: 'options.hasSearch',
      type: 'boolean',
      description:
        '列表是否有自己的搜索框。此时 Space 变为输入而非切换；按压或 Enter 打开时不预高亮（ArrowDown 与 ArrowUp 仍分别打开在第一个与最后一个可用选项上）；Delete 与 Backspace 编辑查询；type-to-select 关闭。Home 与 End 仍跳到第一个与最后一个选项，因此要把它们留给光标的搜索输入应在这之前拦截，并改用 PageUp 与 PageDown。',
      default: 'false',
    },
    {
      name: 'options.onClear',
      type: '() => void',
      description:
        '清除所有已选值。提供后，控件关闭时按 Delete 或 Backspace 即清除，清除不再只靠指针。列表打开或设置了 `hasSearch` 时忽略。',
    },
    {
      name: 'options.hasValue',
      type: 'boolean',
      description:
        '是否有任何已选值。为 false 时跳过 Delete 与 Backspace 清除。',
      default: 'false',
    },
    {
      name: 'options.isGrid',
      type: 'boolean',
      description:
        '每行是否把选项单元格与操作单元格配对。此时行内结束方向键把高亮移到该行的操作、行内起始方向键移回，在 RTL 布局中跟随视觉方向；操作上按 Enter 运行 `onActivateAction` 而非切换。',
      default: 'false',
    },
    {
      name: 'options.rowHasAction',
      type: '(index: number) => boolean',
      description:
        '网格中，`index` 处的行是否有可移动到的操作单元格。',
    },
    {
      name: 'options.onActivateAction',
      type: '(index: number) => void',
      description:
        '网格中，运行高亮行操作单元格里的控件。选择不变。',
    },
    {
      name: 'options.isDisabled',
      type: 'boolean',
      description: '控件是否忽略点击与按键。',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'highlightedIndex',
      type: 'number',
      description: '活动行索引，无活动行时为 -1。',
    },
    {
      name: 'setHighlightedIndex',
      type: '(index: number) => void',
      description:
        '设置活动行，例如过滤之后。高亮落在该行的选项单元格。',
    },
    {
      name: 'highlightedCell',
      type: "'option' | 'action'",
      description:
        "活动行中高亮的是哪个单元格；`'action'` 仅在网格中。",
    },
    {
      name: 'activeDescendantId',
      type: 'string | undefined',
      description:
        "作为控件 `aria-activedescendant` 传入的 id：活动选项，网格中为其操作单元格。列表关闭或无活动项时为 undefined。",
    },
    {
      name: 'getItemId',
      type: '(index: number) => string',
      description: '渲染在 `index` 处选项上的 id。',
    },
    {
      name: 'getActionCellId',
      type: '(index: number) => string',
      description:
        '网格中，渲染在 `index` 行操作单元格上的 id。',
    },
    {
      name: 'onTriggerClick',
      type: '() => void',
      description: '从控件上的按压切换列表。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description:
        '保持焦点的控件按键处理器。ArrowDown 与 ArrowUp 打开列表或移动活动行；Enter（无搜索时还有 Space）切换活动选项且列表保持打开；Escape 与 Tab 关闭；Home、End、PageUp 与 PageDown 跳到第一个或最后一个选项；无搜索时，键入字符跳到标签以其开头的下一个选项，与 Selector 相同（重复字母循环，单个字母从活动选项之后开始搜索），Space 仍切换。',
    },
    {
      name: 'onItemMouseEnter',
      type: "(item: MultiSelectorOptionData, index: number, cell?: 'option' | 'action') => void",
      description:
        '把悬停的选项或其操作单元格设为活动，不滚动列表也不移动焦点。',
    },
  ],
  usage: {
    description:
      '跟踪多选 combobox 的活动选项并处理其按键，DOM 焦点始终留在控件上。它驱动 MultiSelector；与 useCombobox 不同，切换选项后列表保持打开，且行可携带操作单元格。它不渲染任何东西、不设置任何属性：调用方渲染控件与列表，并根据其返回值接线 ARIA 属性。',
    bestPractices: [
      {
        guidance: true,
        description:
          "每个选项用 `id={getItemId(index)}` 渲染，并把 `activeDescendantId` 作为控件的 `aria-activedescendant` 传入。",
      },
      {
        guidance: true,
        description:
          '仅当行在选项旁携带控件时才用 `isGrid`；给每个操作单元格 `id={getActionCellId(index)}`。',
      },
      {
        guidance: true,
        description:
          '新查询导致选项变化时，用 useAnnounce 播报结果数量。',
      },
      {
        guidance: false,
        description:
          '不要每次切换后关闭列表；多选保持打开，才能连续选取多个选项。',
      },
    ],
  },
  relatedComponents: ['MultiSelector'],
  relatedHooks: ['useCombobox', 'useAnnounce'],
  importPath: '@astryxdesign/core/MultiSelector',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '多选 combobox 状态 + 按键；焦点留在控件上。驱动 MultiSelector。切换后列表保持打开；行可携带操作单元格（网格）。不渲染、不设属性：调用方渲染并接线 ARIA。',
  paramDescriptions: {
    options: '配置。',
    'options.selectableItems':
      '按渲染顺序的选项；禁用项不可切换，在打开列表中移动时跳过；打开落在第一个/最后一个可用选项（ArrowUp：最后一个）。',
    'options.isOpen': '是否显示列表；状态由调用方管理。',
    'options.onOpen':
      '显示列表；返回 false 拒绝（高亮不动）。',
    'options.onClose': '隐藏列表；高亮先重置。',
    'options.onToggle': '添加/移除值；列表保持打开。',
    'options.listboxId':
      'listbox/grid id；选项与操作单元格 id 由它派生。',
    'options.hasSearch':
      '自带搜索框：Space 变输入，按压/Enter 打开不预高亮（ArrowDown/Up 仍第一个/最后一个可用项），Delete/Backspace 编辑查询，type-to-select 关闭。Home/End 仍跳转；要留给光标请先拦截，改用 PageUp/PageDown。',
    'options.onClear':
      '全部清除；控件关闭时 Delete/Backspace 触发。打开或 hasSearch 时忽略。',
    'options.hasValue': '是否有已选值；为 false 时跳过清除。',
    'options.isGrid':
      '行 = 选项 + 操作单元格；行内结束/起始方向键在两者间移动（感知 RTL）；操作上 Enter -> onActivateAction。',
    'options.rowHasAction': '网格：index 行是否有操作单元格。',
    'options.onActivateAction':
      '网格：运行高亮行的操作；选择不变。',
    'options.isDisabled': '忽略点击与按键。',
  },
  returnDescriptions: {
    highlightedIndex: '活动行索引，-1 = 无。',
    setHighlightedIndex: '设置活动行（落在选项单元格）。',
    highlightedCell: "'option' | 'action'（action 仅网格）。",
    activeDescendantId:
      '控件 aria-activedescendant：活动选项或其操作单元格；关闭/无活动时为 undefined。',
    getItemId: 'index 处选项的 id。',
    getActionCellId: '网格：index 行操作单元格的 id。',
    onTriggerClick: '从控件按压切换列表。',
    onKeyDown:
      '控件 keydown：ArrowDown/Up 打开或移动；Enter（无搜索时 Space）切换且保持打开；Escape/Tab 关闭；Home/End/PageUp/PageDown 跳转；键入字符按标签前缀跳到下一个选项，与 Selector 相同（无搜索时）；Space 仍切换。',
    onItemMouseEnter:
      '悬停使选项/操作单元格成为活动；不滚动、不移焦点。',
  },
  usage: {
    description:
      '无头多选 combobox：活动选项 + 按键，焦点留在控件上；切换后列表保持打开。调用方渲染并接线 ARIA。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选项 id = getItemId(index)；控件 aria-activedescendant = activeDescendantId。',
      },
      {
        guidance: true,
        description:
          '仅当行携带控件时才用 isGrid；操作单元格 id = getActionCellId(index)。',
      },
      {
        guidance: true,
        description: '新查询时用 useAnnounce 播报结果数量。',
      },
      {
        guidance: false,
        description: '不要每次切换后关闭；多选保持打开。',
      },
    ],
  },
};
