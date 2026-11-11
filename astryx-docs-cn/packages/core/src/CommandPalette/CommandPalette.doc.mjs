// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Dialog',
    required: true,
    description: '承载命令面板的模态表面。',
  },
  {
    name: 'Input',
    required: true,
    description:
      '包含查询字段及其辅助视觉的搜索区域。',
  },
  {
    name: 'Search glyph',
    required: true,
    description: '默认 Input 中由 Icon 渲染的搜索符号。',
  },
  {
    name: 'Query field',
    required: true,
    description: '用于输入搜索查询的原生文本字段。',
  },
  {
    name: 'Loading spinner',
    required: false,
    description:
      '搜索等待期间默认 Input 中显示的加载指示器。',
  },
  {
    name: 'List',
    required: true,
    description:
      '可滚动的结果容器：存在可选结果时为 listbox，否则以普通内容呈现 Empty 状态。',
  },
  {
    name: 'Item',
    required: false,
    description: 'List 内渲染的可选命令结果。',
  },
  {
    name: 'Group',
    required: false,
    description: '共享同一标题的可选 Item 集合。',
  },
  {
    name: 'Group heading',
    required: false,
    description: '为 Group 渲染的可见标题。',
  },
  {
    name: 'Empty',
    required: false,
    description: '当前结果集为空时显示的消息。',
  },
  {
    name: 'Footer',
    required: false,
    description:
      '页脚区域，用于默认键盘指引或调用方提供的内容。',
  },
  {
    name: 'Keyboard shortcut',
    required: false,
    description:
      '默认 Footer 指引中由 Kbd 渲染的按键徽标。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CommandPalette',
  displayName: 'Command Palette',
  group: 'CommandPalette',
  category: 'Overlay',
  keywords: [
    '命令',
    'spotlight',
    '启动器',
    'omnibox',
    '快速搜索',
    '面板',
    'finder',
    '搜索',
    '模态',
    '对话框',
    '导航',
    '命令菜单',
    'cmdk',
  ],
  description:
    '根组件。管理打开状态、搜索、键盘导航与组合插槽。',
  // Intentionally a contained isInline preview, not playground.overlay: the
  // component stays visible on load and knobs stay live, whereas a real
  // showModal() overlay makes the page inert — see ComponentPlaygroundConfig.overlay
  // in docs-types.ts (#3657).
  playground: {
    defaults: {
      isOpen: true,
      isInline: true,
      onOpenChange: undefined,
    },
  },
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      description: '命令面板对话框是否可见。',
      required: true,
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '面板可见性变化时调用。',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '经 search(query) 与 bootstrap() 提供条目的搜索源。静态列表用 createStaticSource。',
      required: true,
    },
    {
      name: 'input',
      type: 'ReactNode',
      description:
        '输入插槽。默认为行为标准的 CommandPaletteInput。',
      default: '<CommandPaletteInput />',
      slotElements: [
        {
          __element: 'TextInput',
          props: {
            label: 'Input',
            placeholder: 'Type here...',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        '页脚插槽。默认为显示键盘提示的 CommandPaletteFooter。',
      default: '<CommandPaletteFooter />',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '页脚内容',
        },
      ],
    },
    {
      name: 'renderItem',
      type: '(item: T, isSelected: boolean) => ReactNode',
      description:
        '逐项渲染函数，用于非交互的展示内容，如标签、图标、描述与快捷键提示。不要在选项内返回按钮或链接。按 auxiliaryData.group 的自动分组保持不变。省略时渲染 label 文本。',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description: '搜索查询无结果时显示的内容。',
      default: "'No results'",
    },
    {
      name: 'emptyBootstrapText',
      type: 'ReactNode',
      description:
        '没有搜索查询且 bootstrap() 未返回内容时显示的内容。',
      default: "'Type to search'",
    },
    {
      name: 'value',
      type: 'string',
      description: 'picker 模式下的受控选中值。',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'picker 模式下选中值变化时调用。',
    },
    {
      name: 'label',
      type: 'string',
      description: '命令面板对话框的无障碍标签。',
      default: "'Command palette'",
    },
    {
      name: 'width',
      type: 'number | string',
      description: '对话框宽度。',
      default: '640',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: '对话框最大高度。',
      default: '480',
    },
    {
      name: 'isInline',
      type: 'boolean',
      description:
        '以内联方式渲染命令面板内容，无模态行为。自动禁用输入框自动聚焦与初始高亮项自动滚动。仅供文档预览与展示使用。',
      default: 'false',
    },
  ],
  components: [
    {name: 'CommandPaletteInput'},
    {name: 'CommandPaletteList'},
    {name: 'CommandPaletteItem'},
    {name: 'CommandPaletteGroup'},
    {name: 'CommandPaletteFooter'},
    {name: 'CommandPaletteEmpty'},
  ],
  theming: {
    targets: [
      {className: 'astryx-command-palette-empty'},
      {className: 'astryx-command-palette-footer'},
      {className: 'astryx-command-palette-group'},
      {className: 'astryx-command-palette-group-heading'},
      {className: 'astryx-command-palette-input'},
      {
        className: 'astryx-command-palette-item',
        states: ['highlighted', 'selected', 'disabled'],
      },
      {className: 'astryx-command-palette-list'},
    ],
  },
  usage: {
    anatomy,
    description:
      'CommandPalette 是可搜索的对话框，用于快速访问命令、导航与操作。以 SearchSource 驱动过滤与选择，作为键盘启动器使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供带 bootstrap 结果的 searchSource，让用户在输入前就能看到有用选项。',
      },
      {
        guidance: true,
        description:
          '在条目上使用 auxiliaryData.group，自动把结果组织成带标题的分区。',
      },
      {
        guidance: true,
        description:
          '同一产品界面可能出现多个命令面板时，提供具体的 label。',
      },
      {
        guidance: true,
        description:
          '保持 renderItem 内容非交互；每行渲染即一个选项，因此按钮与链接不能嵌套其中。',
      },
      {
        guidance: false,
        description:
          '不要拦截查询字段的键盘事件而不保留进行中的 IME 组合与原生 Home/End 光标移动。',
      },
      {
        guidance: false,
        description:
          '简单下拉或菜单不要用 CommandPalette；内联选择用 Menu 或 Selector。',
      },
      {
        guidance: false,
        description:
          '不要添加过多分组或条目；精选结果以保持面板快速、可扫读。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    anatomy,
    description:
      'CommandPalette is a searchable dialog for quick access to commands, navigation, and actions. Use it as a keyboard-driven launcher powered by SearchSource for filtering and selection.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a searchSource with bootstrap results so users see useful options before typing.',
      },
      {
        guidance: true,
        description:
          'Use auxiliaryData.group on items to automatically organize results into labeled sections.',
      },
      {
        guidance: true,
        description:
          'Provide a specific label when more than one command palette can appear in the same product surface.',
      },
      {
        guidance: true,
        description:
          'Keep renderItem content non-interactive; each rendered row is one option, so buttons and links cannot be nested inside it.',
      },
      {
        guidance: false,
        description:
          'Intercept query-field keyboard events without preserving active IME composition and native Home/End caret movement.',
      },
      {
        guidance: false,
        description:
          'Use CommandPalette for simple dropdowns or menus; use Menu or Selector for inline selections.',
      },
      {
        guidance: false,
        description:
          'Add too many groups or items; curate results to keep the palette fast and scannable.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'searchSource 驱动的命令面板对话框；过滤、键盘导航、分组、选择；与 Typeahead 共用 SearchSource 接口',
  usage: {
    anatomy,
    description:
      'CommandPalette 是可搜索的对话框，用于快速访问命令、导航与操作。以 SearchSource 驱动过滤与选择，作为键盘启动器使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '提供带 bootstrap 结果的 searchSource，让用户在输入前就能看到有用选项。',
      },
      {
        guidance: true,
        description:
          '在条目上使用 auxiliaryData.group，自动把结果组织成带标题的分区。',
      },
      {
        guidance: true,
        description:
          '同一产品界面可能出现多个命令面板时，提供具体的 label。',
      },
      {
        guidance: true,
        description:
          '保持 renderItem 内容非交互；每行渲染即一个选项，因此按钮与链接不能嵌套其中。',
      },
      {
        guidance: false,
        description:
          '不要拦截查询字段的键盘事件而不保留进行中的 IME 组合与原生 Home/End 光标移动。',
      },
      {
        guidance: false,
        description:
          '简单下拉或菜单不要用 CommandPalette；内联选择用 Menu 或 Selector。',
      },
      {
        guidance: false,
        description:
          '不要添加过多分组或条目；精选结果以保持面板快速、可扫读。',
      },
    ],
  },
};
