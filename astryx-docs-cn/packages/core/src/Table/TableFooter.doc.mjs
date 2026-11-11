// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TableFooter',
  subComponentOf: 'Table',
  displayName: 'Table Footer',
  isHiddenFromOverview: true,
  description:
    'children 模式下的 <tfoot> 包装器。在表体下方承载汇总或合计行。行必须位于分节内：<table> 不能直接包含 <tr>，因为 HTML 解析器在解析服务端渲染的标记时会插入隐式 <tbody>，而 React 在客户端渲染时不会，导致水合时两棵树不匹配。仅限 children 模式：数据驱动的 data={...} 路径只渲染表头和表体，从不渲染表脚。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '<tfoot> 中的各行。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-table-footer'}],
  },
};

export const docsDense = {
  name: 'TableFooter',
  isHiddenFromOverview: true,
  displayName: 'Table Footer',
  description: 'children 模式下的 <tfoot> 包装器；承载汇总行',
  propDescriptions: {
    children: '<tfoot> 中的各行。',
    xstyle: '用于布局自定义的 StyleX 样式',
  },
};
