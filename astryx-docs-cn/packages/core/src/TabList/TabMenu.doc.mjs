// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TabMenu',
  subComponentOf: 'TabList',
  displayName: 'Tab Menu',
  isHiddenFromOverview: true,
  description: '溢出菜单触发器，打开包含额外标签选项的下拉菜单，将选中选项的标签显示为触发器文本。宿主属性和 DOM 事件处理器（id、aria-*、data-*、拖放）传递给触发按钮，而不是弹出菜单或选项。按钮保留自己的角色、Tab 停靠点及菜单展开属性。',
  // TabMenu requires TabList context; wrap it so the preview doesn't throw.
  // The wrapper value matches none of the options, so the trigger shows its
  // own label (the idle overflow state).
  playground: {
    defaults: {
      label: '更多',
      options: [
        {value: 'settings', label: '设置'},
        {value: 'integrations', label: '集成'},
        {value: 'billing', label: '账单'},
      ],
    },
    wrapper: {component: 'TabList', props: {value: 'overview'}},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发器按钮的标签（无选项选中时显示）以及下拉菜单标题分隔线的文本。',
      required: true,
    },
    {
      name: 'options',
      type: 'TabMenuOption[]',
      description: '在下拉菜单中渲染的菜单选项数组。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'TabMenu',
  isHiddenFromOverview: true,
  displayName: 'Tab Menu',
  description: '溢出菜单触发器，打开包含额外标签选项的下拉菜单，将选中选项的标签显示为触发器文本。宿主属性和 DOM 事件处理器（id、aria-*、data-*、拖放）传递给触发按钮，而不是弹出菜单或选项。按钮保留自己的角色、Tab 停靠点及菜单展开属性。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发器按钮的标签（无选项选中时显示）以及下拉菜单标题分隔线的文本。',
      required: true,
    },
    {
      name: 'options',
      type: 'TabMenuOption[]',
      description: '在下拉菜单中渲染的菜单选项数组。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'TabMenu',
  isHiddenFromOverview: true,
  displayName: 'Tab Menu',
  description:
    '溢出菜单触发器；显示选中选项的标签。宿主属性/DOM 处理器传递给触发按钮，而不是弹出菜单/选项；角色、Tab 停靠点与展开属性仍归按钮所有。',
  propDescriptions: {
    label: '触发器文本（无选项选中时显示）+ 下拉菜单标题。',
    options: '在下拉菜单中渲染的菜单选项数组。',
  },
};
