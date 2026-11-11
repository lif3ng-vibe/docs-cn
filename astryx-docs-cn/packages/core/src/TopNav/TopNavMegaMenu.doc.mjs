// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TopNavMegaMenu',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu',
  description: '悬停时显示全宽超级菜单面板的导航项。使用 items 与 featured prop 的插槽式 API。TopNavMegaMenuItem 在桌面与移动抽屉两种模式下自行渲染。经渲染模式上下文支持内联折叠抽屉。',
  // The panel anchors to the nearest <nav>; wrap the preview in a TopNav so
  // it opens below the bar instead of pinning to the viewport corner (#4905).
  playground: {
    wrapper: {component: 'TopNav'},
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
      type: 'ReactNode',
      description: '菜单项插槽：通常为 TopNavMegaMenuItem 组件，也接受任意 ReactNode。',
      slotElements: [
        {
          __element: 'TopNavItem',
          props: {
            label: 'Item',
            href: '#',
          },
        },
      ],
    },
    {
      name: 'featured',
      type: 'ReactNode',
      description: '精选内容插槽：桌面端渲染在右侧面板，移动抽屉中渲染在菜单项下方。',
      slotElements: [
        {
          __element: 'Card',
          props: {
            padding: 4,
          },
          children: 'Featured content',
        },
      ],
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
      default: '250',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '超级菜单打开或关闭时触发的回调。用于协调外层样式。',
    },
  ],
};

export const docsZh = {
  name: 'TopNavMegaMenu',
  displayName: 'Top Nav Mega Menu',
  description: '导航项，在悬停时显示全宽超级菜单面板。使用插槽 API（items 和 featured）。TopNavMegaMenuItem 在桌面和移动抽屉模式中自行渲染。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '触发按钮的可见标签。',
      required: true,
    },
    {
      name: 'items',
      type: 'ReactNode',
      description: '菜单项插槽，通常为 TopNavMegaMenuItem 组件，但接受任何 ReactNode。',
    },
    {
      name: 'featured',
      type: 'ReactNode',
      description: '特色内容插槽，桌面端显示在右侧面板，移动抽屉中显示在项目下方。',
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
      default: '250',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: '超级菜单打开或关闭时触发的回调。用于协调包装器样式。',
    },
  ],
};

export const docsDense = {
  name: 'TopNavMegaMenu',
  displayName: 'Top Nav Mega Menu',
  description: '悬停显示全宽超级菜单面板的导航项。items+featured ReactNode 的插槽式 API。移动抽屉内联折叠。',
  propDescriptions: {
    label: '触发按钮的可见标签。',
    items: '菜单项插槽：通常 TopNavMegaMenuItem，接受任意 ReactNode。',
    featured: '精选内容插槽：桌面右侧面板，抽屉中在菜单项下方。',
    delay: '悬停显示延迟 (毫秒)。',
    hideDelay: '鼠标离开后隐藏延迟 (毫秒)。',
    onOpenChange: '开/关时触发。用于协调外层样式。',
  },
};
