// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCombobox',
  displayName: 'useCombobox',
  group: 'Selector',
  keywords: [
    'combobox',
    'listbox',
    'select',
    'dropdown',
    '组合框',
    '下拉',
    'highlight',
    '活动选项',
    'aria-activedescendant',
    '键盘',
    '方向键',
    'headless',
    '无头',
    'autocomplete',
    '自动补全',
    'apg',
    'accessibility',
    'a11y',
    '无障碍',
  ],
  params: [
    {
      name: 'options',
      type: 'UseComboboxOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.selectableItems',
      type: 'ReadonlyArray<T extends {value: string; disabled?: boolean}>',
      description:
        '与渲染顺序一致的选项数组：`SelectorOptionData`，或任何带字符串 `value` 与可选 `disabled` 的选项类型。带 `disabled` 的选项不可选，且在已打开列表中移动时会被跳过；通过 `onKeyDown` 的 ArrowDown 或 ArrowUp 打开列表时，若选中项可用则落在选中项上，否则落在第一个或最后一个可用选项上。',
      required: true,
    },
    {
      name: 'options.isOpen',
      type: 'boolean',
      description: '是否显示列表。该状态由调用方持有。',
      required: true,
    },
    {
      name: 'options.onOpen',
      type: '() => unknown',
      description:
        '请求显示列表时调用。返回 `false` 可拒绝；此时 Hook 不改动高亮。',
      required: true,
    },
    {
      name: 'options.onClose',
      type: '() => void',
      description:
        'Hook 隐藏列表时调用；Hook 会先重置高亮。调用方自行关闭列表时（例如外部按压），还应调用 `setHighlightedIndex(-1)`。',
      required: true,
    },
    {
      name: 'options.listboxId',
      type: 'string',
      description:
        'listbox 元素的 id。选项 id 通过 `getItemId` 从它派生。',
      required: true,
    },
    {
      name: 'options.value',
      type: 'string',
      description:
        '选中的值。列表打开时若它可用则高亮它；否则 ArrowUp 落在最后一个可用选项上，ArrowDown、按压、Enter 或 Space 落在第一个。禁用选项绝不会在打开时被高亮，没有可用选项时则都不高亮。',
    },
    {
      name: 'options.onSelect',
      type: '(value: string) => void',
      description:
        '以所选值调用。选中也会关闭列表。',
    },
    {
      name: 'options.onClear',
      type: '() => void',
      description:
        '清除值。提供后，在闭合控件上按 Delete 或 Backspace 即可清除，因此清除不只靠指针。列表打开或设置 `hasSearch` 时忽略。',
    },
    {
      name: 'options.hasSearch',
      type: 'boolean',
      description:
        '列表是否自带搜索框。此后 Space 变为输入而非选中；用按压或 Enter 打开时不再预高亮（ArrowDown 与 ArrowUp 仍落在选中项或第一个/最后一个可用选项）；闭合控件上的可打印字符进入 `onSearchSeed`。',
      default: 'false',
    },
    {
      name: 'options.onSearchSeed',
      type: '(char: string) => void',
      description:
        '设置 `hasSearch` 时，接收控件聚焦期间输入的每个除 Space 外的可打印字符；列表闭合时会先打开它，因此输入即查无需单独的打开步骤。',
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
      description:
        '活动选项的索引，无活动选项时为 -1。设置 `hasSearch` 时，用按压或 Enter 打开不会设置它，因此 Hook 自行关闭列表后仍为 -1；ArrowDown 与 ArrowUp 仍落在选中项或第一个/最后一个可用选项。仅当它指向已渲染的选项时，才把它渲染为活动选项并写入 `aria-activedescendant`。',
    },
    {
      name: 'setHighlightedIndex',
      type: '(index: number) => void',
      description:
        '设置活动选项，例如在筛选改变选项时。',
    },
    {
      name: 'getItemId',
      type: '(index: number) => string',
      description:
        '渲染到 `index` 处选项上的 id。把控件的 `aria-activedescendant` 设为 `isOpen && highlightedIndex >= 0 && highlightedIndex < selectableItems.length ? getItemId(highlightedIndex) : undefined`，这样它绝不会指向不存在的选项，空列表时也安全。',
    },
    {
      name: 'onTriggerClick',
      type: '() => void',
      description: '在控件上按压时切换列表。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent) => void',
      description:
        '保持焦点在控件上的按键处理器。ArrowDown 与 ArrowUp 打开列表或移动活动选项；Enter（无搜索时还有 Space）选中它或打开列表；Escape 与 Tab 关闭列表；Home、End、PageUp 与 PageDown 跳到第一个或最后一个选项。为光标保留 Home 与 End 的可编辑控件不把它们传给此处理器，CommandPalette 即是如此。',
    },
    {
      name: 'onItemSelect',
      type: '(item: T) => void',
      description: '按压某个选项时选中它，然后关闭列表。',
    },
    {
      name: 'onItemMouseEnter',
      type: '(item: T, index: number) => void',
      description:
        '让悬停的选项变为活动项，不滚动列表也不移动焦点。',
    },
    {
      name: 'getFieldProps',
      type: '(props?: {onKeyDown?(event: React.KeyboardEvent): void}) => object',
      description:
        '你渲染的单行 `input` 的 props：`role="combobox"`、`aria-expanded`、`aria-autocomplete="list"`、仅在 listbox 渲染时才有的 `aria-controls`（`isOpen` 且至少一个选项）、仅在某个选项激活时才有的 `aria-activedescendant`，以及字段的按键处理器。自己的 `onKeyDown` 请传在这里而不是展开旁边：它在 Hook 的处理器之后运行（除非该处理器认领了该键），且可以按其元素标注类型。',
    },
    {
      name: 'getListboxProps',
      type: '() => object',
      description:
        '你渲染的 listbox 的 props，可放在文档任意位置，包括页面文档流中：包含 `id` 与 `role`，以及一个让焦点留在字段内的按压处理器。`isOpen` 且有选项时渲染，并用 `aria-label` 或 `aria-labelledby` 命名。',
    },
    {
      name: 'getOptionProps',
      type: '(index: number) => object',
      description:
        '`index` 处选项的 props：其 `id`、`role`、`aria-selected`（活动选项上为 true）、禁用项上的 `aria-disabled`、不移动焦点即可激活它的指针移动，以及选中它的按压。',
    },
  ],
  usage: {
    description:
      '跟踪单选 combobox 的活动选项并处理其按键，同时 DOM 焦点保持在控件上。它驱动 Selector 与 CommandPalette；当这些组件覆盖不到时，可用它构建 combobox，包括架在你自己渲染的单行文本框上的情形，例如结果替换页面某区段的搜索框，或对话框中的 "添加成员" 输入框。它不渲染任何东西：字段、listbox 与选项都由你渲染，把 `getFieldProps`、`getListboxProps`、`getOptionProps` 展开到其上；对于按钮之类的控件，也可以从 `onKeyDown` 与 `getItemId` 自行接 `role`、`aria-expanded`、`aria-controls` 与 `aria-activedescendant`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用 `id={getItemId(index)}` 渲染每个选项，且仅在 `isOpen` 且 `highlightedIndex` 指向已渲染选项时才设置控件的 `aria-activedescendant`，CommandPalette 即是如此。',
      },
      {
        guidance: true,
        description:
          '无搜索框的输入即选场景，先运行 useTypeahead 的处理器，返回 false 时再落到本 `onKeyDown`，Selector 即是如此。',
      },
      {
        guidance: true,
        description:
          '自行渲染字段时，展开各 prop getter，并在新查询改变选项时自行设置活动选项：设为第一个选项则 Enter 选中它，设为 -1 则 Enter 仍归字段。',
      },
      {
        guidance: true,
        description:
          '新查询改变选项时，通过 useAnnounce 播报结果数量（AST-075 DEC-2）。无匹配时，播报字段为此显示的文案。',
      },
      {
        guidance: false,
        description:
          '不要把非选项的控件（如新建按钮或空态消息）渲染在 listbox 内部；请渲染在它旁边。',
      },
      {
        guidance: false,
        description:
          '不要把 DOM 焦点移到选项上；焦点保持在控件上时，活动选项通过 `aria-activedescendant` 播报。',
      },
    ],
    accessibility: [
      {
        name: 'Focus stays in the field',
        category: 'Semantics',
        requirement: 'AST-075 FR1',
        description:
          '使用各 prop getter 时，移动活动选项绝不会把焦点移出字段。字段通过 `aria-activedescendant` 指名活动选项，无活动选项时不携带该属性。',
      },
      {
        name: 'Expanded state follows the list',
        category: 'Semantics',
        requirement: 'AST-075 FR2',
        description:
          'listbox 渲染期间，字段暴露 `aria-expanded="true"` 和指向它的 `aria-controls`。否则暴露 `aria-expanded="false"` 且不引用任何东西。',
      },
      {
        name: 'Roles',
        category: 'Semantics',
        requirement: 'AST-075 FR3',
        description:
          '字段是带 `aria-autocomplete="list"` 的 `combobox`。列表是由 `option` 组成的 `listbox`，活动选项上为 `aria-selected="true"`。字段与列表的命名由你提供。',
      },
      {
        name: 'Keys',
        category: 'Keyboard',
        requirement: 'AST-075 FR4',
        description:
          '列表显示时，ArrowDown 与 ArrowUp 移动活动选项并循环；Enter 选中活动选项，且只有此时才拦下字段自身的 Enter；无论按住什么修饰键，Escape 都会隐藏列表，同一次按压不会关闭外层对话框或弹出层。列表隐藏时，有选项的情况下 ArrowDown 会显示它。打开但无选项的字段仍响应 Escape（关闭列表），因此打开期间请渲染空态消息。Home、End、其他组合键（如 Shift+Enter）以及所有其余按键都到达字段。',
      },
      {
        name: 'Input method',
        category: 'Keyboard',
        requirement: 'AST-075 FR5',
        description:
          '输入法组字期间，任何按键都不会移动、选中或隐藏。',
      },
      {
        name: 'Pointer',
        category: 'Semantics',
        requirement: 'AST-075 FR6',
        description:
          '指针移到选项上即激活它且不移动焦点；按压选项即选中它，且整个按压过程字段保持焦点。',
      },
      {
        name: 'Result count',
        category: 'Content',
        requirement: 'AST-075 FR7',
        description:
          '由你负责播报：组合 useAnnounce（AST-075 DEC-2），让每个新查询礼貌地播报一次选项数量或无选项。无选项时播报字段显示的文案。',
      },
    ],
  },
  relatedComponents: ['Selector', 'CommandPalette'],
  relatedHooks: ['useMultiCombobox', 'useTypeahead', 'useAnnounce'],
  importPath: '@astryxdesign/core/Selector',
  category: 'focus',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '单选 combobox 的状态 + 按键；焦点保持在控件上。驱动 Selector / CommandPalette，以及架在你渲染的单行字段上的 combobox（结果替换区段的搜索框、添加成员输入框）。不渲染任何东西：展开 getFieldProps / getListboxProps / getOptionProps，或自行接 role、aria-expanded、aria-controls、aria-activedescendant。',
  paramDescriptions: {
    options: '配置。',
    'options.selectableItems':
      '按渲染顺序的选项：SelectorOptionData 或任何带字符串 value 与可选 disabled 的类型；禁用项不可选，在打开列表中移动时被跳过（onKeyDown ArrowDown/Up 打开时落在可用的选中项上，否则第一个/最后一个可用项）。',
    'options.isOpen': '是否显示列表；状态由调用方持有。',
    'options.onOpen': '显示列表；返回 false 拒绝（高亮不动）。',
    'options.onClose':
      'Hook 隐藏列表；先重置高亮。调用方自行关闭（外部按压）：还要 setHighlightedIndex(-1)。',
    'options.listboxId': 'listbox id；选项 id 从它派生（getItemId）。',
    'options.value':
      '选中值；可用时打开即高亮，否则 ArrowUp -> 最后一个可用项，其他打开方式 -> 第一个可用项；绝不指向禁用项。',
    'options.onSelect': '以所选值调用；选中即关闭。',
    'options.onClear':
      '清除值；闭合控件上的 Delete / Backspace。打开或 hasSearch 时忽略。',
    'options.hasSearch':
      '列表自带搜索框：Space 变输入，按压 / Enter 打开不预高亮（ArrowDown/Up 仍落在选中项，否则第一个/最后一个可用项），闭合控件上的可打印字符 -> onSearchSeed。',
    'options.onSearchSeed':
      'hasSearch 下，控件聚焦期间输入的每个除 Space 外的可打印字符（闭合则先打开）。',
    'options.isDisabled': '忽略点击 + 按键。',
  },
  returnDescriptions: {
    highlightedIndex:
      '活动选项索引，-1 = 无。hasSearch：按压 / Enter 打开不设置（Hook 关闭后仍为 -1）；ArrowDown/Up 仍落在选中项，否则第一个/最后一个可用项。仅当指向已渲染选项时才写入 aria-activedescendant。',
    setHighlightedIndex: '设置活动选项（如筛选后）。',
    getItemId:
      '`index` 处选项的 id；aria-activedescendant = isOpen && highlightedIndex >= 0 && highlightedIndex < selectableItems.length ? getItemId(highlightedIndex) : undefined（空列表安全）。',
    onTriggerClick: '按压控件切换列表。',
    onKeyDown:
      '控件 keydown：ArrowDown/Up 打开或移动；Enter（无搜索时含 Space）选中或打开；Escape / Tab 关闭；Home / End / PageUp / PageDown 跳转。为光标保留 Home / End 的可编辑控件：不要传入它们。',
    onItemSelect: '按压选中，然后关闭。',
    onItemMouseEnter: '悬停激活选项；不滚动、不移焦点。',
    getFieldProps:
      'input props：role=combobox、aria-expanded、aria-autocomplete=list、仅在 listbox 渲染时的 aria-controls（isOpen + 有选项）、仅在选项激活时的 aria-activedescendant、按键处理器。自己的 onKeyDown 传这里（可按元素标注类型）：在 Hook 之后运行，除非 Hook 认领了该键。',
    getListboxProps:
      'listbox props（id、role、按压保持字段焦点）；isOpen + 有选项时可渲染在任意位置（含页面文档流）；用 aria-label / aria-labelledby 命名。',
    getOptionProps:
      '`index` 处选项 props：id、role、活动项上的 aria-selected、aria-disabled、指针移动激活不移焦点、按压选中。',
  },
  usage: {
    description:
      '无头单选 combobox：活动选项 + 按键，焦点保持在控件上。渲染与 ARIA 接线由调用方完成。',
    bestPractices: [
      {
        guidance: true,
        description:
          '选项 id = getItemId(index)；仅打开且 highlightedIndex 指向已渲染选项时才设 aria-activedescendant。',
      },
      {
        guidance: true,
        description:
          '无搜索的输入即选：先运行 useTypeahead，返回 false 再落到这里。',
      },
      {
        guidance: true,
        description:
          '自有字段：展开各 getter，新查询时自行设置活动选项（第一个：Enter 选中；-1：Enter 仍归字段）。',
      },
      {
        guidance: true,
        description:
          '新查询时用 useAnnounce 播报结果数量（AST-075 DEC-2）；无结果时播报字段显示的文案。',
      },
      {
        guidance: false,
        description:
          '非选项控件（新建按钮、空态消息）不要放进 listbox；渲染在旁边。',
      },
      {
        guidance: false,
        description: '不要把 DOM 焦点移到选项上；用 aria-activedescendant。',
      },
    ],
    accessibility: [
      {
        name: 'Focus stays in the field',
        category: 'Semantics',
        requirement: 'AST-075 FR1',
        description:
          '移动活动选项不移焦点；aria-activedescendant 指名它，无活动项时不携带。',
      },
      {
        name: 'Expanded state follows the list',
        category: 'Semantics',
        requirement: 'AST-075 FR2',
        description:
          'listbox 渲染 -> aria-expanded=true + aria-controls；否则 false 且不引用。',
      },
      {
        name: 'Roles',
        category: 'Semantics',
        requirement: 'AST-075 FR3',
        description:
          '字段 = combobox + aria-autocomplete=list。选项组成的 listbox，活动项 aria-selected=true。字段与列表的命名由你提供。',
      },
      {
        name: 'Keys',
        category: 'Keyboard',
        requirement: 'AST-075 FR4',
        description:
          '显示时：ArrowDown/Up 移动（循环），Enter 选中活动项并拦下字段 Enter，Escape（任意修饰键）隐藏且同一次按压不关闭外层对话框/弹出层。隐藏时：有选项则 ArrowDown 显示。打开但无选项仍响应 Escape（关闭列表）：打开期间渲染空态消息。Home / End / 其他组合键（Shift+Enter）等均到达字段。',
      },
      {
        name: 'Input method',
        category: 'Keyboard',
        requirement: 'AST-075 FR5',
        description: 'IME 组字期间任何键都不移动/选中/隐藏。',
      },
      {
        name: 'Pointer',
        category: 'Semantics',
        requirement: 'AST-075 FR6',
        description:
          '指针移到选项上激活且不移焦点；按压选中，字段保持焦点。',
      },
      {
        name: 'Result count',
        category: 'Content',
        requirement: 'AST-075 FR7',
        description:
          '由你负责：组合 useAnnounce（DEC-2），每个新查询礼貌播报一次数量或无选项；无选项 = 字段显示的文案。',
      },
    ],
  },
};
