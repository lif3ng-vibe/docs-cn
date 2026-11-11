// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TableBody',
  subComponentOf: 'Table',
  displayName: 'Table Body',
  isHiddenFromOverview: true,
  description:
    'children 模式下的 <tbody> 包装器，承载数据行。行必须位于某个区段内：<table> 不能直接包含 <tr>——HTML 解析器解析服务端渲染的标记时会插入一个隐式 <tbody>，而 React 在客户端渲染时不会，因此直接写进 Table 的行会在 hydration 时不匹配。数据驱动的 data={...} 模式会自行渲染该元素；children 模式下则由你提供。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '<tbody> 中的行。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-table-body'}],
  },
};

export const docsDense = {
  name: 'TableBody',
  isHiddenFromOverview: true,
  displayName: 'Table Body',
  description: 'children 模式下的 <tbody> 包装器；承载数据行；children 模式不会自动补一个',
  propDescriptions: {
    children: '<tbody> 中的行。',
    xstyle: '用于布局自定义的 StyleX 样式',
  },
};
