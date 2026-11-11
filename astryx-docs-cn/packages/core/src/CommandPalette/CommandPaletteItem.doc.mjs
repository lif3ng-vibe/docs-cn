// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteItem',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Item',
  isHiddenFromOverview: true,
  description:
    '命令面板结果列表中的一个选项。CommandPalette 上下文提供选择、高亮、标识与关闭行为。',
  usage: {
    description:
      'CommandPaletteItem 用于 CommandPaletteList 或 CommandPaletteGroup 内的单个非交互结果行。组合键盘模型由 CommandPalette 负责；独立使用的条目只暴露其显式视觉状态与指针激活。',
    bestPractices: [
      {
        guidance: true,
        description:
          '每个 value 在结果列表内保持唯一，使高亮、active-descendant 标识与选择解析到同一项。',
      },
      {
        guidance: true,
        description:
          '在 CommandPalette 内，每个条目是 WAI-ARIA combobox 模式 listbox 弹层中的一个选项：键盘焦点留在查询字段，方向键经 aria-activedescendant 移动高亮，Enter 选中高亮项。',
      },
      {
        guidance: false,
        description:
          '不要在条目内嵌套按钮、链接或其他交互控件。选项语义使后代元素仅作展示，请使用图标、描述、快捷键提示等非交互内容，并激活选项本身。',
      },
      {
        guidance: false,
        description:
          '不要把 isHighlighted 当作选中。高亮是当前键盘结果；isSelected 代表已选定的值。',
      },
    ],
    anatomy: [
      {
        name: 'Item',
        required: true,
        description:
          '承载选择、禁用、条目标识、交互与主题状态的选项根元素。',
      },
      {
        name: 'Content',
        required: true,
        description:
          '调用方提供的非交互标签与辅助展示内容。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-command-palette-item',
        states: ['highlighted', 'selected', 'disabled'],
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        '用于条目标识、高亮查找与选择的唯一值。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '非交互的条目内容，如标签、图标、描述或键盘快捷键。',
      required: true,
    },
    {
      name: 'onSelect',
      type: '(value: string) => void',
      description:
        '该条目经指针激活后调用。CommandPalette 中的键盘选择通过 CommandPalette 的 onValueChange 上报。',
    },
    {
      name: 'isHighlighted',
      type: 'boolean',
      description:
        '该条目是否为当前键盘结果。在 CommandPalette 内省略时从上下文派生。',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description:
        '该条目在 picker 模式下是否代表已选值。在 CommandPalette 内省略时从 CommandPalette 的值派生。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '条目是否不可用并抑制指针激活。',
      default: 'false',
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
      value: 'go-home',
      children: '前往仪表板',
    },
  },
};

export const docsZh = {
  name: 'CommandPaletteItem',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Item',
  description:
    '命令面板结果列表中的一个选项。CommandPalette 上下文提供选择、高亮、标识和关闭行为。',
  propDescriptions: {
    value: '用于条目标识、高亮查找和选择的唯一值。',
    children: '非交互式条目内容，例如标签、图标、描述或键盘快捷键。',
    onSelect:
      '通过指针激活此条目后调用。CommandPalette 中的键盘选择通过根组件的 onValueChange 报告。',
    isHighlighted:
      '此条目是否为当前键盘结果。在 CommandPalette 内省略时从上下文派生。',
    isSelected:
      '此条目是否代表选择器模式中的已选值。在 CommandPalette 内省略时从面板的值派生。',
    isDisabled: '条目是否不可用并禁止指针激活。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteItem',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Item',
  description:
    '单个结果选项；选择、高亮、标识与关闭由上下文负责',
  propDescriptions: {
    value: '用于标识、高亮查找与选择的唯一值',
    children: '非交互标签与辅助内容',
    onSelect:
      '指针激活后调用；palette 键盘选择经根组件 onValueChange 上报',
    isHighlighted: '当前键盘结果；省略时从上下文派生',
    isSelected:
      'picker 模式的已选值；省略时从 palette 值派生',
    isDisabled: '不可用；抑制指针激活',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
  },
};
