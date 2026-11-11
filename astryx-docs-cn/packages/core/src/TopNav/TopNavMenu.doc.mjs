// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNavMenu',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Menu',
  description: '悬停触发弹出菜单的导航项，菜单项内容丰富，包含图标、标题与可选描述。',
  playground: {
    defaults: {
      label: 'Products',
      items: [
        {title: 'Analytics', description: 'Usage metrics and trends', href: '#'},
        {title: 'Automation', description: 'Workflows and rules', href: '#'},
        {title: 'Billing', href: '#'},
      ],
    },
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发按钮的可见标签。',
      required: true,
    },
    {
      name: 'items',
      type: 'TopNavMenuItemData[]',
      description: '在悬停弹出框中显示的菜单项。菜单项的 href 值遵循 Link 所述的共享导航规则；被拒绝的目标保持可见、不发生导航。',
      required: true,
    },
    {
      name: 'delay',
      type: 'number',
      description: '悬停后显示菜单前的延迟 (毫秒)。',
      default: '150',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description: '鼠标离开后隐藏菜单前的延迟 (毫秒)。',
      default: '200',
    },
  ],
};

export const docsZh = {
  name: 'TopNavMenu',
  displayName: 'Top Nav Menu',
  description: '导航项，在悬停时显示弹出菜单，包含带图标、标题和可选描述的丰富菜单项。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发按钮的可见标签。',
      required: true,
    },
    {
      name: 'items',
      type: 'TopNavMenuItemData[]',
      description: '在悬停弹出框中显示的菜单项。',
      required: true,
    },
    {
      name: 'delay',
      type: 'number',
      description: '悬停时显示菜单前的延迟（毫秒）。',
      default: '150',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description: '鼠标离开后隐藏菜单的延迟（毫秒）。',
      default: '200',
    },
  ],
};

export const docsDense = {
  name: 'TopNavMenu',
  displayName: 'Top Nav Menu',
  description: '悬停触发弹出菜单的导航项，菜单项含图标、标题与可选描述。',
  propDescriptions: {
    label: '触发按钮的可见标签。',
    items: '悬停弹出框中的菜单项。href 遵循 Link 导航规则；被拒绝的目标不导航。',
    delay: '悬停显示延迟 (毫秒)。',
    hideDelay: '鼠标离开后隐藏延迟 (毫秒)。',
  },
};
