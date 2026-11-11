// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteFooter',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Footer',
  isHiddenFromOverview: true,
  description:
    '带键盘指引的页脚。CommandPalette 自动渲染默认的方向键、Enter 与 Escape 提示。',
  usage: {
    description:
      'CommandPalette 会自动渲染 CommandPaletteFooter。仅当需要替换默认指引时，才向 footer 插槽传入 CommandPaletteFooter。',
    anatomy: [
      {
        name: 'Footer',
        required: true,
        description:
          '呈现默认指引或调用方页脚内容的辅助区域。',
      },
      {
        name: 'Keyboard shortcut',
        required: false,
        description:
          '用于导航、选择与关闭的默认 Kbd 徽标。',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '自定义页脚内容。省略时通过 Kbd 渲染默认键盘提示。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-command-palette-footer'}],
  },
};

export const docsZh = {
  name: 'CommandPaletteFooter',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Footer',
  description:
    '显示键盘导航提示的页脚。未提供子元素时渲染默认方向键/Enter/Escape 提示。',
  propDescriptions: {
    children: '自定义页脚内容。省略时通过 Kbd 渲染默认键盘提示。',
    xstyle: 'StyleX 布局自定义样式。必须是 stylex.create() 的值。',
  },
};

export const docsDense = {
  name: 'CommandPaletteFooter',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Footer',
  description: '带键盘提示的页脚；默认经 Kbd 渲染方向键/Enter/Escape 提示',
  propDescriptions: {
    children: '自定义内容；默认渲染键盘提示',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值',
  },
};
