// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTablePagination',
  subComponentOf: 'Table',
  displayName: 'useTablePagination',
  description: '面向 Table 的无头（headless）分页插件。以 config 对象调用：`useTablePagination({ page, onPageChange, totalItems })`。返回一个 TablePlugin，传给 `<Table plugins={{ pagination: paginationPlugin }} />`。',
  usage: {
    description: '以包含页码状态和回调的 config 对象调用 useTablePagination。将返回的插件通过 plugins prop 传给 Table。',
  },
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。',
      required: true,
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: '页码变化时调用。',
      required: true,
    },
    {
      name: 'totalItems',
      type: 'number',
      description: '所有页的条目总数。用于计算总页数。',
    },
    {
      name: 'totalPages',
      type: 'number',
      description: '总页数。当你知道页数而不知道条目数时使用。',
    },
    {
      name: 'hasMore',
      type: 'boolean',
      description: '是否还有更多页。用于总数未知的游标分页。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页条目数。',
      default: '10',
    },
    {
      name: 'onPageSizeChange',
      type: '(pageSize: number) => void',
      description: '用户更改每页条目数时调用。与 pageSizeOptions 一起提供时显示每页条目数下拉框。',
    },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      description: '可选的每页条目数选项。提供时显示每页条目数选择器。',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description: '分页控件的视觉变体。',
      default: "'pages'",
    },
    {
      name: 'position',
      type: "'below' | 'above' | 'both' | 'none'",
      description: '分页控件相对于表格的渲染位置。',
      default: "'below'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: '分页控件的水平对齐方式。',
      default: "'center'",
    },
    {
      name: 'label',
      type: 'string',
      description: "分页 nav 地标的无障碍名称。position='both' 时两个 nav 会获得不同的名称（label 加 '(top)' 和 '(bottom)' 后缀），使同类型地标保持唯一（axe landmark-unique）。",
      default: "'Table pagination'",
    },
  ],
};

export const docsZh = {
  name: 'useTablePagination',
  displayName: 'useTablePagination',
  description: '无头分页插件。支持客户端切片、服务器端分页和游标分页。自动渲染 Pagination 控件。',
  props: [
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。',
      required: true,
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: '页面更改时调用。',
      required: true,
    },
    {
      name: 'totalItems',
      type: 'number',
      description: '所有页面的总项目数。用于计算总页数。',
    },
    {
      name: 'pageSize',
      type: 'number',
      description: '每页项目数。',
      default: '10',
    },
    {
      name: 'variant',
      type: "'pages' | 'count' | 'compact' | 'dots' | 'none'",
      description: '分页控件的视觉变体。',
      default: "'pages'",
    },
    {
      name: 'position',
      type: "'below' | 'above' | 'both' | 'none'",
      description: '分页控件相对于表格的渲染位置。',
      default: "'below'",
    },
  ],
};

export const docsDense = {
  name: 'useTablePagination',
  displayName: 'useTablePagination',
  description: '无头（headless）分页插件。支持客户端切片、服务端分页或游标分页。自动在表格上方/下方/两者渲染 Pagination。',
  propDescriptions: {
    page: '当前页码（从 1 开始）。',
    onPageChange: '页码变化时调用。',
    totalItems: '所有页的条目总数。',
    pageSize: '每页条目数。默认 10。',
    variant: "分页变体：'pages'|'count'|'compact'|'dots'|'none'。",
    position: "渲染位置：'below'|'above'|'both'|'none'。",
    label: "nav 地标的无障碍名称；position='both' 时输出 '<label> (top)' / '<label> (bottom)'。",
  },
};
