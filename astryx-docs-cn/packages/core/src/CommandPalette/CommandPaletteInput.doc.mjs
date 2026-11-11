// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteInput',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Input',
  isHiddenFromOverview: true,
  description:
    '搜索输入插槽。挂载时自动聚焦。在 CommandPalette 内使用时连接到命令面板上下文。',
  usage: {
    description:
      '将 CommandPaletteInput 用于 CommandPalette 内的弹出式命令查询；没有结果弹层时，也可作为独立搜索字段使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '当"搜索命令"不能描述可搜索的内容时，传入简洁的 label 来说明；占位文本绝不是字段的名称。',
      },
      {
        guidance: true,
        description:
          '尾部边缘的简短辅助控件或快捷键提示，使用 endContent 承载。',
      },
      {
        guidance: false,
        description:
          '不要覆盖 combobox 角色或弹层状态。连接到 CommandPalette 时，这些语义由 CommandPaletteInput 负责。',
      },
    ],
    anatomy: [
      {
        name: 'Input',
        required: true,
        description:
          '围绕搜索符号、查询字段与尾部内容的行内布局。',
      },
      {
        name: 'Search glyph',
        required: true,
        description: '查询字段之前的装饰性搜索图标。',
      },
      {
        name: 'Query field',
        required: true,
        description:
          '原生文本字段。独立且无弹层属性时为 searchbox；提供了弹层关系或存在 CommandPalette 上下文时为 combobox。',
      },
      {
        name: 'Loading spinner',
        required: false,
        description:
          '搜索进行中在尾部内容之前显示的延迟等待指示器。',
      },
      {
        name: 'Trailing content',
        required: false,
        description:
          '调用方提供的辅助内容，如清除控件或快捷键提示。',
      },
    ],
  },
  theming: {
    targets: [{className: 'astryx-command-palette-input'}],
  },
  props: [
    {
      name: 'placeholder',
      type: 'string',
      description: '输入框的占位文本。',
      default: "'Search…'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '查询字段的无障碍标签，供屏幕阅读器朗读。默认为本地化的"Search commands"；占位文本不会用作名称。',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description:
        '挂载时自动聚焦输入框。位于内联命令面板内时自动禁用。',
      default: 'true',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '渲染在输入框末尾的内容，位于加载指示器之后。用于清除按钮或键盘快捷键提示。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'value',
      type: 'string',
      description:
        '搜索值。在 CommandPalette 内省略时从上下文读取。',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description:
        '搜索值变化时调用。在 CommandPalette 内省略时写入上下文。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  playground: {
    defaults: {
      placeholder: '搜索命令、文件或操作...',
      hasAutoFocus: false,
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteInput',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Input',
  description:
    '搜索输入插槽。挂载时自动聚焦。在 CommandPalette 内使用时连接到上下文。',
  propDescriptions: {
    placeholder: '输入框的占位文本。',
    label:
      '查询字段的无障碍标签，供屏幕阅读器朗读。默认为翻译后的 "Search commands"；占位文本不会用作名称。',
    hasAutoFocus: '挂载时自动聚焦输入框。内联命令面板中自动禁用。',
    endContent: '渲染在输入框末尾的内容，位于加载指示器之后。',
    value: '搜索值。在 CommandPalette 内省略时从上下文读取。',
    onValueChange: '搜索值变化时调用。在 CommandPalette 内省略时写入上下文。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteInput',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Input',
  description:
    '搜索输入；挂载时自动聚焦；CommandPalette 内连接上下文',
  propDescriptions: {
    placeholder: '输入框占位文本',
    label:
      '查询字段的无障碍标签；默认 "Search commands"，绝不是占位文本',
    hasAutoFocus: '挂载时自动聚焦；内联模式自动禁用',
    endContent: '加载指示器之后的尾部内容',
    value: '搜索值；palette 内省略时读上下文',
    onValueChange:
      '变化时调用；palette 内省略时写上下文',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
  },
};
