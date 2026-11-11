// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Table',
    required: true,
    description:
      '把表格区段、行与单元格组织在一起的语义化 table 元素。',
  },
  {
    name: 'Scroll region',
    required: true,
    description:
      '列溢出时水平滚动的外层区域。固定高度虚拟化还会启用块向滚动；任一适用轴溢出时，该区域进入键盘 Tab 序。',
  },
  {
    name: 'Header section',
    required: false,
    description:
      '存在数据驱动列时自动生成、或在 children 模式下由 TableHeader 提供的列标题区段。',
  },
  {
    name: 'Column header cell',
    required: false,
    description:
      '标识某一列的单元格，可包含排序或批量选择控件。',
  },
  {
    name: 'Sort control',
    required: false,
    description:
      '包裹可排序列标签并切换该列排序方向的按钮。',
  },
  {
    name: 'Sort indicator glyph',
    required: false,
    description: 'Sort 控件内由 Icon 渲染的方向符号。',
  },
  {
    name: 'Sort priority',
    required: false,
    description:
      '多列排序激活时，已排序列显示的序号。',
  },
  {
    name: 'Selection control',
    required: false,
    description:
      '由选择插件在表头与可选行中渲染的 CheckboxInput。',
  },
  {
    name: 'Body section',
    required: true,
    description:
      '承载数据行或当前空态的区段；数据驱动模式会自动渲染。',
  },
  {
    name: 'Row',
    required: false,
    description:
      '在标准表头、表体或表脚行中组织单元格的可复用 TableRow。',
  },
  {
    name: 'Cell',
    required: false,
    description:
      '在标准表体或表脚行中承载数值或调用方内容的 TableCell。',
  },
  {
    name: 'Default empty state',
    required: false,
    description:
      '数据数组为空时显示的紧凑 EmptyState，除非被替换或禁用。',
  },
  {
    name: 'Expansion control',
    required: false,
    description:
      '位于行首单元格、展开或收起一个可展开行的按钮。',
  },
  {
    name: 'Expansion glyph',
    required: false,
    description:
      '展开控件内由 Icon 渲染的方向符号。',
  },
  {
    name: 'Expanded detail panel',
    required: false,
    description:
      '在展开行下方渲染的详情行与跨列单元格，包裹调用方内容。',
  },
  {
    name: 'Footer section',
    required: false,
    description:
      'children 模式下由 TableFooter 提供的可选汇总或合计区段。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Table',
  displayName: 'Table',
  group: 'Table',
  category: 'Table & List',
  keywords: [
    'table',
    'datatable',
    'datagrid',
    '表格',
    '数据表格',
    '排序',
    '虚拟滚动',
    '列',
    '行',
    '选择',
    '固定列',
  ],
  playground: {
    defaults: {
      data: [
        {name: '陈明', role: '工程师', status: '在职'},
        {name: '林芳', role: '设计师', status: '在职'},
        {name: '王强', role: '产品经理', status: '离开'},
      ],
      columns: [
        {key: 'name', header: '姓名'},
        {key: 'role', header: '职位'},
        {key: 'status', header: '状态'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-table'},
      {className: 'astryx-table-scroll-wrapper'},
      {className: 'astryx-table-header'},
      {className: 'astryx-table-body'},
      {className: 'astryx-table-footer'},
      {className: 'astryx-table-row'},
      {className: 'astryx-table-cell', visualProps: ['density']},
      {className: 'astryx-table-header-cell', visualProps: ['density']},
    ],
    componentIcons: [
      {
        slot: 'table-sort-indicator',
        description:
          '可排序列标签旁的排序方向符号（`useTableSortable`）。',
        fallback:
          '`arrowUp` 升序；`arrowDown` 降序；`arrowsUpDown` 未排序',
        state: [
          {
            name: 'direction',
            type: "'ascending' | 'descending' | 'none'",
            description:
              '该列的排序方向；未排序时为 `none`。',
          },
        ],
        whenNull:
          '隐藏该符号。Sort 控件保留标签及点击与键盘排序；列头保留 `aria-sort`。',
      },
      {
        slot: 'table-row-expand',
        description:
          '行展开切换按钮中的符号（`useTableRowExpansion`）。行展开时切换按钮会把符号旋转四分之一圈，并在从右到左布局中镜像，因此请映射一个指向行内末侧的符号。',
        fallback: '`chevronRight`，展开时旋转',
        state: [
          {
            name: 'expanded',
            type: 'boolean',
            description: '行的详情面板打开时为 true。',
          },
        ],
        whenNull:
          '隐藏该符号。切换按钮保留尺寸、"Expand row" 或 "Collapse row" 名称、`aria-expanded` 及点击与键盘切换。',
      },
    ],
  },
  description:
    '带样式的数据驱动表格，支持密度、分隔线、悬停高亮、斑马纹行与命名插件。T 必须继承 Record<string, unknown>。',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description:
        '渲染为行的数据条目数组。T 必须继承 Record<string, unknown>（自定义类型用 `interface MyRow extends Record<string, unknown>`）。',
    },
    {
      name: 'columns',
      type: 'TableColumn<T>[]',
      description:
        '列定义：每列含 {key, header, width?, align?, renderCell?}。`header` 字段设置列标题文本。省略时列会从数据对象键自动生成。`width` 字段类型为 `ColumnWidth`（不是数字）；使用从 `@astryxdesign/core/Table` 导入的 `proportional(n)` 或 `pixel(n)` 辅助函数。省略 `width` 时各列均分剩余空间，并有 60px 的紧凑可读下限。要给某一列不同的下限，设置 `width: proportional(1, {minWidth: 80})`；其 `minWidth` 替换该列的 60px 下限。例如：`width: pixel(120)` 为 120px 固定宽，`width: proportional(1)` 为默认最小 120px 的弹性列。',
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string | number)',
      description:
        '规范行标识：属性名会把有效字符串与有限数字投影为字符串；函数则保留 string/number 类型。可选；旧表格回退到索引。虚拟化需要显式、唯一且有效的键。',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '控制单元格内边距与字号的行密度。',
      default: "'balanced'",
    },
    {
      name: 'dividers',
      type: "'rows' | 'columns' | 'grid' | 'none'",
      description: '单元格之间渲染的分隔线样式。',
      default: "'rows'",
    },
    {
      name: 'isStriped',
      type: 'boolean',
      description: '为偶数行应用背景色。',
      default: 'false',
    },
    {
      name: 'hasHover',
      type: 'boolean',
      description:
        '在指针设备上为行应用悬停高亮背景。',
      default: 'false',
    },
    {
      name: 'verticalAlign',
      type: "'middle' | 'top' | 'bottom'",
      description:
        '表体行单元格的垂直对齐。控制 `<td>` 元素上的 `vertical-align`。',
      default: "'middle'",
    },
    {
      name: 'textOverflow',
      type: "'wrap' | 'truncate'",
      description:
        "表体单元格文本超出列宽时的行为。'wrap' 让文本换行、行变高；'truncate' 以省略号截断（默认渲染的单元格截断时悬停显示工具提示）。表头单元格始终截断。",
      default: "'wrap'",
    },
    {
      name: 'virtualization',
      type: 'TableVirtualizationCapability',
      description:
        '来自 useTableRowsVirtualization({rowHeight, viewportHeight}) 的纯几何能力，两者均为正的有限 CSS 像素。需传入完整扁平数据与显式 idKey。默认文本会截断；自定义渲染器、换行、结构性插件、不兼容的偏移、无效标识或无法表示的几何都会改用完整渲染。逻辑行位置包含表头。',
    },
    {
      name: 'plugins',
      type: 'Record<string, TablePlugin<T>>',
      description:
        '通过 transform 管道扩展表格行为的命名插件。内部转换为有序数组。',
    },
    {
      name: 'rowIndexStart',
      type: 'number',
      description:
        '首个渲染表体行的 ARIA 行索引（从 1 开始）。行序号是无障碍关注点，与任何可见索引列无关，因此设置它（或 rowCount）会让表格在表体行上输出 aria-rowindex、在表格上输出 aria-rowcount。分页/窗口视图请传首个可见行的偏移（如 (page - 1) * pageSize + 1），让 aria-rowindex 反映在全量数据中的位置。仅数据驱动模式。',
      default: '1',
    },
    {
      name: 'rowCount',
      type: 'number',
      description:
        '所有分页/窗口的表体行总数，用于 aria-rowcount，让辅助技术能针对全量数据播报 "row X of Y"。省略但设置了 rowIndexStart 时（总数未知的窗口视图），按 ARIA 未知数量约定把 aria-rowcount 设为 -1。仅数据驱动模式。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'children 模式：不用数据驱动渲染，而是用 TableHeader / TableBody / TableFooter（各自容纳 TableRow 与 TableCell）自行组装表格。children 会直接传给 <table>，区段由你提供。直接放进 Table 的 TableRow 会输出 <table><tr>——这是无效 HTML 且会在 hydration 时不匹配（解析器为服务端标记插入隐式 <tbody>，React 在客户端不会）。数据驱动模式会自动渲染区段。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
  components: [
    {name: 'TableHeader'},
    {name: 'TableBody'},
    {name: 'TableFooter'},
    {name: 'TableRow'},
    {name: 'TableCell'},
    {name: 'TableHeaderCell'},
    {name: 'useTableSelection'},
    {name: 'useTableSelectionState'},
    {name: 'TableSelectionToolbar'},
    {name: 'useTableSortable'},
    {name: 'useTableTreeData'},
    {name: 'useTableTreeState'},
    {name: 'useTablePagination'},
    {name: 'useTableColumnSettings'},
    {name: 'useTableFiltering'},
    {name: 'useTableFilterState'},
  ],
  usage: {
    description:
      'Table 以一致的行列维度展示结构化数据。通过可组合的插件系统支持富单元格内容、排序、选择、分页与列管理。结构统一的数据集用 Table；更简单或不一致的数据请考虑列表或卡片布局。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用密度与分隔线变体匹配数据的信息密度和扫读需求。',
      },
      {
        guidance: true,
        description:
          '通过 renderCell 用 Badge、StatusDot、Avatar 等 Astryx 组件组合富单元格内容。',
      },
      {
        guidance: true,
        description:
          'children 模式下，把每一行放进 TableHeader、TableBody 或 TableFooter。<table> 不能直接包含 <tr>：HTML 解析器会为服务端标记插入隐式 <tbody>，React 在客户端不会，因此未包裹的行会在 hydration 时不匹配。',
      },
      {
        guidance: true,
        description:
          '省略 width 得到均分弹性列并带 60px 紧凑可读下限。用 proportional(1, {minWidth}) 给单列自定义下限，用 proportional(n) 加权列宽，用 pixel() 固定宽度；各列下限之和放不下时，Table 滚动区域启用。',
      },
      {
        guidance: true,
        description:
          '在 React Server Component 中使用数据驱动 API：proportional()、pixel() 与不带函数 prop 的列定义都是服务端安全的。使用 renderCell（或任何函数 prop）的列需要把表格包进 "use client" 组件，因为函数无法跨服务端-客户端边界。',
      },
      {
        guidance: false,
        description:
          '列不一致的数据不要用表格；异构内容请用列表或卡片布局。',
      },
      {
        guidance: false,
        description:
          '不要一次启用所有插件；只添加用例所需的功能，保持界面聚焦。',
      },
      {
        guidance: false,
        description:
          '文本较多的列需要更多空间时，不要依赖省略 width 的 60px 下限；请为该列设置 proportional(1, {minWidth})。',
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use density and divider variants to match the information density and scanning needs of your data.',
      },
      {
        guidance: true,
        description:
          'Compose rich cell content with Astryx components like Badge, StatusDot, and Avatar via renderCell.',
      },
      {
        guidance: false,
        description:
          'Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.',
      },
      {
        guidance: false,
        description:
          'Enable every plugin at once. Add only the features your use case requires to keep the interface focused.',
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '数据驱动表格，经 renderCell 呈现富单元格内容。用 Badge、StatusDot、Text、Avatar 与布局原语组合单元格。BaseTable 提供无样式的结构核心与可组合插件管道。',
  usage: {
    description:
      'Table 以一致的行列维度展示结构化数据。通过可组合的插件系统支持富单元格内容、排序、选择、分页与列管理。结构统一的数据集用 Table；更简单或不一致的数据请考虑列表或卡片布局。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用密度与分隔线变体匹配数据的信息密度和扫读需求。',
      },
      {
        guidance: true,
        description:
          '通过 renderCell 用 Badge、StatusDot、Avatar 等 Astryx 组件组合富单元格内容。',
      },
      {
        guidance: true,
        description:
          'children 模式：把行包进 TableHeader/TableBody/TableFooter。<table> 不能直接放 <tr>；解析器为 SSR 标记添加隐式 <tbody>，React 在客户端不会，未包裹的行会在 hydration 时不匹配。',
      },
      {
        guidance: true,
        description:
          '省略 width = 均分弹性 + 60px 紧凑可读下限。单列下限：proportional(1, {minWidth})。加权：proportional(n)。固定：pixel()。下限之和放不下时表格滚动。',
      },
      {
        guidance: true,
        description:
          '数据驱动 API 对 RSC 安全：proportional()、pixel() 与不带函数 prop 的列定义可在 Server Component 中使用。renderCell（任何函数 prop）需要 "use client" 包装。',
      },
      {
        guidance: false,
        description:
          '列不一致的数据不要用表格；异构内容请用列表或卡片布局。',
      },
      {
        guidance: false,
        description:
          '不要一次启用所有插件；只添加用例所需的功能，保持界面聚焦。',
      },
      {
        guidance: false,
        description:
          '文本较多的列不要依赖 60px 下限；请为它设置 proportional(1, {minWidth})。',
      },
    ],
    anatomy,
  },
};
