// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'useTableRowsVirtualization',
  subComponentOf: 'Table',
  displayName: 'useTableRowsVirtualization',
  description:
    '返回一个不透明的能力对象，用于对固定高度的扁平行 Table 做虚拟窗口化。将该能力传给 Table.virtualization，并把完整数据、列、显式稳定 idKey 和 plugins 保留在 Table 上。尺寸为正的有限 CSS 像素。受支持的行使用单行内容；显式换行、任意自定义渲染器、非扁平行或无效标识改用普通完整渲染。窗口化使用 Table 自有的滚动包装器；调用方提供的 scrollWrapper 会以诊断性的完整渲染回退。已挂载的行保留原生表格语义和全表位置；未挂载的行不承诺可被屏幕阅读器发现。',
  props: [
    {
      name: 'rowHeight',
      type: 'number',
      required: true,
      description:
        '表体行距的总高度（CSS 像素），包含既有的密度内边距和折叠边框。必须在不缩小文字和受支持控件的前提下容纳它们。',
    },
    {
      name: 'viewportHeight',
      type: 'number',
      required: true,
      description:
        '有界的、Table 自有的视口高度（CSS 像素）。表头和边框装饰由 Table 自行计算。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '仅几何参数的固定高度扁平行窗口化，供 Table.virtualization 显式启用。完整数据和稳定 idKey 保留在 Table 上。尺寸为正的有限 CSS 像素；不支持的内容、几何、标识或调用方 scrollWrapper 回退为完整渲染。保留已挂载行的原生语义，不承诺未挂载行的可发现性。',
  propDescriptions: {
    rowHeight:
      '表体行距总高度，含密度内边距和边框；文字和受支持控件必须放得下。',
    viewportHeight:
      '有界的 Table 自有视口高度；表头和边框装饰由 Table 自行计算。',
  },
};
