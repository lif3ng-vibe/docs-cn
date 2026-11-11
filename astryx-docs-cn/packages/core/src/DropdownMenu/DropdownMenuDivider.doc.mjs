// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuDivider',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Divider',
  isHiddenFromOverview: true,
  description:
    '在组合菜单中分隔行组的水平分隔线。渲染 role="separator"，因此永远不会成为方向键顺序中的停靠点。数据驱动的等价形式是 `items` 中的 `{type: "divider"}` 条目；两种模式渲染的都是这个组件，所以外观和主题完全一致。宿主属性和 DOM 处理器（id、data-*、aria-*）可以传到分隔符上；其 role 和 orientation 由组件自身掌管。',
  props: [
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '在菜单间距之后应用的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-divider'}],
  },
};

export const docsDense = {
  name: 'DropdownMenuDivider',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Divider',
  description:
    '组合菜单的分隔行；数据 API 中 {type: "divider"} 的组合式对应物；宿主属性可传入，role/orientation 由组件掌管',
  propDescriptions: {
    xstyle: '在菜单间距之后应用的 StyleX 样式',
  },
};
