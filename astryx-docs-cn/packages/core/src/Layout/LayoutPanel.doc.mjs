// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutPanel',
  subComponentOf: 'Layout',
  displayName: 'Layout Panel',
  isHiddenFromOverview: true,
  description: '用于导航、设置或检查器面板的侧边栏。',
  playground: {
    defaults: {
      children: '面板内容',
      hasDivider: true,
      width: 200,
    },
    wrapper: {
      component: 'Layout',
      slotProp: 'start',
      props: {
        content: {
          __element: 'LayoutContent',
          props: {},
          children: '主内容区域',
        },
      },
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面板内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '朝向内容一侧边缘的分隔线：在 start 插槽中位于行内结束边，在 end 插槽中位于行内起始边。不设置此项且未设置 padding 时，面板与内容共用一个间距。Layout 的 defaultHasDividers 不适用。旁边是自带分隔线的 ResizeHandle 时，请保持为 false。',
      default: 'false',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '每条边的内部内边距，使用间距刻度。取代自动内缩以及与内容共用的间距。0 为通栏。',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description: '启用可滚动溢出。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '地标元素的无障碍标签。区域滚动时，它也为滚动区域命名；未提供时使用已翻译的 "Content"。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        '面板宽度。数字按像素处理，字符串原样使用。提供 resizable 时忽略，宽度由 hook 控制。放在接收 useResizable 区域 props 的 ResizeHandle 旁、以 width={region.size} 渲染时，区域折叠期间面板为 inert，折叠时面板内的焦点移到手柄上。',
    },
    {
      name: 'resizable',
      type: 'ResizableRegion | ResizableProps',
      description:
        "useResizable() 的返回值或其 props。提供时面板宽度由 hook 驱动，应在面板旁放置 ResizeHandle。其中携带区域的轴向（'horizontal' | 'vertical'），必须与相邻 ResizeHandle 的 direction 一致。使用 hook 自身的值时，面板从朝向其 ResizeHandle 的边缘滑动关闭与打开；手动构造的对象不会滑动。两种情况下，折叠时面板内的焦点都会移到其 ResizeHandle 上，折叠期间面板为 inert。",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到面板元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: '用于导航、设置或检查器面板的侧边栏。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '面板内容。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '朝向内容一侧边缘的分隔线：在 start 插槽中位于行内结束边，在 end 插槽中位于行内起始边。不设置此项且未设置 padding 时，面板与内容共用一个间距。Layout 的 defaultHasDividers 不适用。旁边的 ResizeHandle 自带分隔线时，请保持为 false。',
      default: 'false',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '使用间距比例设置四边的内边距，替换自动内边距以及与内容共用的间距。0 表示全出血。',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description: '启用可滚动溢出。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '地标元素的无障碍标签。区域滚动时，它也为滚动区域命名；未提供时使用已翻译的“Content”（内容）。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        '面板宽度。数字按像素处理，字符串按原样使用。提供 resizable 时忽略，宽度由 hook 控制。放在接收 useResizable 区域 props 的 ResizeHandle 旁边、以 width={region.size} 渲染时，区域折叠期间面板为 inert，折叠时面板内的焦点移到手柄上。',
    },
    {
      name: 'resizable',
      type: 'ResizableRegion | ResizableProps',
      description:
        "useResizable() 的返回值或其 props。提供时面板宽度由 hook 驱动，应在面板旁放置 ResizeHandle。其中携带区域的轴向（'horizontal' | 'vertical'），必须与相邻 ResizeHandle 的 direction 一致。使用 hook 自身返回的值时，面板从朝向其 ResizeHandle 的边缘滑动关闭和打开；手动构造的对象不会滑动。两种情况下，折叠时面板内的焦点都会移到其 ResizeHandle 上，折叠期间面板为 inert。",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到面板元素的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'LayoutPanel',
  isHiddenFromOverview: true,
  displayName: 'Layout Panel',
  description: '用于导航、设置与检查器面板的侧边栏。',
  propDescriptions: {
    children: '面板内容。',
    hasDivider:
      '朝向内容一侧边缘的分隔线（start 插槽：行内结束边；end 插槽：行内起始边）；不设置此项或 padding 时，面板与内容共用一个间距。Layout 的 defaultHasDividers 不适用。旁边是自带分隔线的 ResizeHandle 时设为 false。',
    padding:
      '每条边的内边距；取代自动内缩与共用间距。0 为通栏。',
    isScrollable: '启用可滚动溢出。',
    label:
      '地标元素的无障碍标签；区域滚动时也为该区域命名（默认 "Content"）。',
    role: 'ARIA 地标角色。',
    width:
      '面板宽度。数字=像素，字符串原样。提供 resizable 时忽略，宽度由 hook 控制。在接收区域 props 的 ResizeHandle 旁以 width={region.size} 渲染：折叠期间为 inert；折叠时内部焦点移到手柄。',
    resizable:
      'useResizable() 的返回值或其 props。宽度由 hook 驱动；在面板旁放置 ResizeHandle。hook 的值会滑动，手动构造的不会。折叠时内部焦点移到手柄；折叠期间为 inert。',
    ref: '转发到面板元素的 ref。',
  },
};
