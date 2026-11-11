// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Input',
    required: true,
    description:
      '裸组合框输入框。可见的字段外框与无障碍名称由调用方提供。',
  },
  {
    name: 'Loading status',
    required: false,
    description:
      '异步数据源等待中显示在输入框旁的具名 Spinner，除非组合方接管了忙碌指示器位置。',
  },
  {
    name: 'Dropdown',
    required: false,
    description:
      '锚定定位的 listbox 表面，包含当前搜索或引导结果。',
  },
  {
    name: 'Empty state',
    required: false,
    description:
      '搜索完成但无结果时显示的禁用 listbox 选项。',
  },
  {
    name: 'Result group heading',
    required: false,
    description: '一组结果选项的可见标签。',
  },
  {
    name: 'Result row',
    required: false,
    description:
      '拥有高亮、选中、指针与键盘行为的选项包装。',
  },
  {
    name: 'Default item content',
    required: false,
    description:
      '渲染在结果行内的 TypeaheadItem 标签与可选辅助内容。',
  },
  {
    name: 'Caller-rendered item content',
    required: false,
    description:
      '通过 renderItem 或 item.element 提供的调用方内容，位于稳定的结果行内。',
  },
  {
    name: 'Selected result state',
    required: false,
    description:
      '结果匹配 value 时显示的选中行字重与尾部对勾。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'BaseTypeahead',
  subComponentOf: 'Typeahead',
  displayName: 'Base Typeahead',
  isHiddenFromOverview: true,
  description:
    '可组合的组合框引擎，提供裸输入框、搜索、键盘导航与带样式的结果下拉列表。它不渲染输入框包装、边框或已选值标记；Typeahead 与 Tokenizer 将其组合成标准字段。',
  usage: {
    anatomy,
    description:
      '可组合的组合框引擎，提供裸输入框、搜索、键盘导航与带样式的结果下拉列表。它不渲染输入框包装、边框或已选值标记；Typeahead 与 Tokenizer 将其组合成标准字段。',
    bestPractices: [
      {
        guidance: true,
        description:
          '标准字段请用 Typeahead 或 Tokenizer；它们为 BaseTypeahead 补上其有意省略的输入框外框与已选值渲染。',
      },
      {
        guidance: true,
        description:
          '自行提供可见标签或 aria-label 与自定义输入包装，让裸组合框拥有无障碍名称、焦点处理、边框与布局。',
      },
      {
        guidance: true,
        description:
          '传入指向自定义包装的 anchorRef，让下拉列表相对自定义输入外框定位，而非仅相对裸输入元素。',
      },
      {
        guidance: false,
        description:
          '不要指望输入框外框或已选值渲染。BaseTypeahead 是引擎；这些可见部分由调用方负责。',
      },
      {
        guidance: false,
        description:
          'Typeahead 或 Tokenizer 已够用时不要用 BaseTypeahead；额外的包装与样式工作只有真正定制组合才值得。',
      },
      {
        guidance: false,
        description:
          '不要把 Escape 当作取消数据源未决工作。它会隐藏当前弹层，但迟到的响应可能重新打开它。',
      },
    ],
  },
  props: [
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '提供搜索与引导方法的数据源。`search(query, context)` 可在返回前调用 `context.update(items)` 先展示已掌握的匹配项；其返回值即最终列表，同一查询在首个列表之后的每个列表都会把已展示的行保留在前、新行追加其后。',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: '当前选中项。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: '选择变化时调用。',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: '下拉列表项的自定义渲染函数。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框占位文本。',
      default: "'Search…'",
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '下拉列表显示的最大项目数。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        '视口钳制前请求的下拉菜单像素宽度。',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        '查询搜索源前的最小查询长度。低于该长度不发起搜索，菜单保持关闭。',
      default: '1',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        '查询无匹配结果时显示的内容。接受 ReactNode，因此可在无结果处放置链接或创建入口。会以礼貌性实时区域播报其渲染出的文本 (从 DOM 读取)；aria-hidden 的部分两处都不包含，不渲染任何文本的内容则不会播报。null 与 undefined 同样视为未提供，将回退到默认值；若要不渲染任何内容，请传入空字符串。',
      default: "'No results found'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否禁用。',
      default: 'false',
    },
    {
      name: 'isFocusableDisabled',
      type: 'boolean',
      description:
        '以 aria-disabled 与 readOnly 保持禁用输入框可聚焦，让调用方提供的禁用原因仍可被发现。它会阻止文本输入、打开结果与选择结果，对它生效前已打开的结果列表同样如此；Escape 或 Tab 仍可关闭。',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '触发搜索前的防抖延迟 (毫秒)。同步数据源，以及通过 `context.update` 先显示本地匹配、再自行延迟服务器请求的数据源，设置为 0。',
      default: '150',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '用于缩放下拉选项内边距的尺寸。',
      default: "'md'",
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '用于下拉定位的锚点元素 ref。未提供时使用输入框本身。',
    },
    {
      name: 'inputXStyle',
      type: 'StyleXStyles',
      description: '输入元素的附加 StyleX 样式。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '应用于输入框的标准 BaseProps StyleX 样式。必须是 stylex.create() 的值，不能是内联样式对象。',
    },
    {
      name: 'inputTabIndex',
      type: 'number',
      description:
        '原生 tabIndex 的旧式输入专用别名。提供时优先生效；未提供时保留原生 tabIndex。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
      description:
        '在内部键盘导航之前调用的附加 keydown 处理函数。调用 e.preventDefault() 可跳过内部处理。',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变化时触发的回调。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '下拉列表打开或关闭时的回调。',
    },
    {
      name: 'inputId',
      type: 'string',
      description:
        '原生 id 的旧式输入专用别名。提供时优先生效；未提供时保留原生 id。',
    },
    {
      name: 'ariaDescribedBy',
      type: 'string',
      description:
        '原生 aria-describedby 的旧式输入专用别名。提供时优先生效；未提供时保留原生属性。',
    },
    {
      name: 'ariaLabelledBy',
      type: 'string',
      description:
        '原生 aria-labelledby 的旧式输入专用别名。提供时优先生效；未提供时保留原生属性。',
    },
  ],
};

export const docsZh = {
  name: 'BaseTypeahead',
  isHiddenFromOverview: true,
  displayName: 'Base Typeahead',
  description:
    '可组合的组合框引擎，提供裸输入框、搜索、键盘导航和带样式的结果下拉列表。它不渲染输入框包装、边框或已选值标记；Typeahead 和 Tokenizer 将其组合成标准字段。',
  props: [
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        '提供搜索和引导方法的数据源。`search(query, context)` 可调用 `context.update(items)` 先显示已有的匹配项；返回值是最终列表，同一查询在第一个列表之后的每个列表都保留已显示的行，并只在其后追加新行。',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: '当前选中的项目。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: '选择变更时调用。',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: '下拉列表项的自定义渲染函数。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框占位文本。',
      default: "'Search…'",
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: '聚焦时在输入前显示引导结果。',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: '下拉列表显示的最大项目数。',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description: '视口限制前请求的下拉菜单像素宽度。',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        '查询搜索源前的最小查询长度。低于该长度不会发起搜索，菜单保持关闭。',
      default: '1',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        '查询无匹配结果时显示的内容。接受 ReactNode，因此可在无结果处放置链接或创建入口。会从 DOM 读取其渲染出的文本在礼貌性实时区域中播报；aria-hidden 的部分两处都不包含，不渲染任何文本的内容则不会播报。null 与 undefined 同样视为未提供，将回退到默认值；若要不渲染任何内容，请传入空字符串。',
      default: "'No results found'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '输入框是否被禁用。',
      default: 'false',
    },
    {
      name: 'isFocusableDisabled',
      type: 'boolean',
      description:
        '使用 aria-disabled 和只读状态保持禁用输入框可聚焦，以便访问调用方提供的禁用原因。它会阻止文本输入、打开结果列表和选择结果，在它生效前已打开的结果中也是如此；Escape 或 Tab 仍可关闭列表。',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: '挂载时自动聚焦输入框。',
      default: 'false',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '触发搜索前的防抖延迟（毫秒）。同步数据源，以及通过 `context.update` 显示本地匹配项并自行延迟服务器请求的数据源，设置为 0。',
      default: '150',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '用于调整下拉选项内边距的尺寸。',
      default: "'md'",
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description: '用于下拉列表定位的锚点元素引用。未提供时使用输入框本身。',
    },
    {
      name: 'inputXStyle',
      type: 'StyleXStyles',
      description: '输入元素的附加 StyleX 样式。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '应用于输入元素的标准 BaseProps StyleX 样式。',
    },
    {
      name: 'inputTabIndex',
      type: 'number',
      description:
        '原生 tabIndex 的旧输入专用别名。提供时优先；未提供时保留原生属性。',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
      description:
        '在内部键盘导航之前调用的附加 keydown 处理函数。调用 e.preventDefault() 可跳过内部处理。',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: '搜索查询文本变更时触发的回调。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '下拉列表打开或关闭时的回调。',
    },
    {
      name: 'inputId',
      type: 'string',
      description:
        '原生 id 的旧输入专用别名。提供时优先；未提供时保留原生属性。',
    },
    {
      name: 'ariaDescribedBy',
      type: 'string',
      description:
        '原生 aria-describedby 的旧输入专用别名。提供时优先；未提供时保留原生属性。',
    },
    {
      name: 'ariaLabelledBy',
      type: 'string',
      description:
        '原生 aria-labelledby 的旧输入专用别名。提供时优先；未提供时保留原生属性。',
    },
  ],
};

export const docsDense = {
  name: 'BaseTypeahead',
  isHiddenFromOverview: true,
  displayName: 'Base Typeahead',
  description:
    '可组合的组合框引擎：提供裸输入框与带样式的结果下拉。输入外框与已选值呈现由调用方负责。',
  usage: {
    bestPractices: [
      {
        guidance: true,
        description:
          '标准字段用 Typeahead 或 Tokenizer；它们补上 BaseTypeahead 省略的输入外框与已选值渲染。',
      },
      {
        guidance: true,
        description:
          '提供可见标签或 aria-label，外加带焦点处理、边框与布局的自定义包装。',
      },
      {
        guidance: true,
        description:
          '把 anchorRef 指向你的包装，让下拉相对输入外框定位而非裸输入。',
      },
      {
        guidance: false,
        description:
          '不要指望输入外框或已选值渲染；这些可见部分归调用方。',
      },
      {
        guidance: false,
        description:
          'Typeahead/Tokenizer 够用时别用 BaseTypeahead；额外工作只对定制组合值得。',
      },
      {
        guidance: false,
        description:
          '别把 Escape 当取消未决工作；它只隐藏弹层，迟到响应可能重开。',
      },
    ],
  },
  propDescriptions: {
    searchSource: '带搜索与引导方法的数据源。',
    value: '当前选中项。',
    onChange: '选择变化时触发。',
    renderItem: '自定义下拉项渲染。',
    placeholder: '输入框占位文本。',
    hasEntriesOnFocus: '聚焦时显示引导结果。',
    maxMenuItems: '下拉最大项目数。',
    menuWidth: '视口钳制前请求的像素宽度。',
    minQueryLength:
      '搜索前最小查询长度。低于该值菜单保持关闭。',
    emptySearchText: '查询无结果时的内容。ReactNode。',
    isDisabled: '输入框是否禁用。',
    isFocusableDisabled:
      '禁用输入框保持可聚焦；阻止输入、打开与选择，对已打开列表同样有效 (Escape/Tab 可关闭)。',
    hasAutoFocus: '挂载时自动聚焦。',
    debounceMs: '搜索防抖毫秒。同步设 0。',
    size: '下拉选项内边距尺寸。',
    anchorRef: '下拉定位锚点。默认为输入框。',
    inputXStyle: '输入框附加 StyleX 样式。',
    xstyle: '输入框的标准 BaseProps StyleX 样式。',
    inputTabIndex:
      '旧式 tabIndex 别名；提供别名时优先，否则透传原生 tabIndex。',
    onKeyDown:
      '内部导航前的 keydown。preventDefault() 跳过内部处理。',
    onChangeQuery: '查询文本变化时触发。',
    onOpenChange: '下拉开/关时触发。',
    inputId:
      '旧式 id 别名；提供别名时优先，否则透传原生 id。',
    ariaDescribedBy:
      '旧式 aria-describedby 别名；提供别名时优先，否则透传原生属性。',
    ariaLabelledBy:
      '旧式 aria-labelledby 别名；提供别名时优先，否则透传原生属性。',
  },
};
