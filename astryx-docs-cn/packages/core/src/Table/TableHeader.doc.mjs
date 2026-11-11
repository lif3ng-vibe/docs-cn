// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'TableHeader',
  subComponentOf: 'Table',
  displayName: 'Table Header',
  isHiddenFromOverview: true,
  description:
    'children 模式下的 <thead> 包装器。承载表头行，其单元格为 TableHeaderCell。行必须位于分节内：<table> 不能直接包含 <tr>，因为 HTML 解析器在解析服务端渲染的标记时会插入隐式 <tbody>，而 React 在客户端渲染时不会，导致水合时两棵树不匹配。数据驱动的 data={...} 模式在提供了 columns 时会自行渲染该元素；children 模式下则由你自己提供。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '<thead> 中的各行。',
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
    targets: [{className: 'astryx-table-header'}],
  },
};

export const docsDense = {
  name: 'TableHeader',
  isHiddenFromOverview: true,
  displayName: 'Table Header',
  description: 'children 模式下的 <thead> 包装器；承载表头行',
  propDescriptions: {
    children: '<thead> 中的各行。',
    xstyle: '用于布局自定义的 StyleX 样式',
  },
};
