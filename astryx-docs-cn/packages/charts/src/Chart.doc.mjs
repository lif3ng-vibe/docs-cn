// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Chart',
  displayName: 'Chart',
  group: 'Charts',
  category: 'Data Visualization',
  keywords: [
    '图表',
    'chart',
    'graph',
    'plot',
    '可视化',
    'visualization',
    '条形图',
    'bar chart',
    '折线图',
    'line chart',
    '数据',
    'data',
  ],

  usage: {
    description:
      'Chart 基于共享的响应式 x 与 y 比例尺排布一个或多个标记定义。适用于组合 Astryx 图表标记、坐标轴、网格、图例、tooltip 与自定义交互层的数据可视化场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          '为图表提供一个简明的 title，说明所度量的内容；再用 subtitle 补充解读所需的对比对象、时间范围或其他背景信息。',
      },
      {
        guidance: true,
        description:
          '为 Chart 与直接组合使用的 ChartTooltip 传入同一个 series 数组，确保标签、颜色与解析出的数据点保持一致。',
      },
      {
        guidance: false,
        description:
          '不要仅靠颜色区分系列或传达状态。应将颜色与标签、标记形状、直接标注或其他可见线索配合使用。',
      },
      {
        guidance: false,
        description:
          '不要在多个 Chart 实例间复用同一个标记定义对象。标记定义目前携带每个图表各自的布局元数据，只能使用一次。',
      },
    ],
    accessibility: [
      {
        name: '可访问的图表名称',
        category: 'Semantics',
        criterion: '1.1.1 非文本内容',
        requirement: '必需',
        states: ['全部'],
        description:
          '当产品内有具体名称时请提供 title。缺省时，Chart 会根据主系列标签与 xKey 推导一个本地化名称。',
      },
      {
        name: '小数据集表格',
        category: 'Content',
        criterion: '1.1.1 非文本内容',
        requirement: '对受支持的小型数据集为必需',
        states: ['1–100 行 × 系列单元格'],
        description:
          'Chart 会将小型数据集镜像为一张视觉上隐藏的表格。更大的数据集请在其附近提供等价的摘要或数据视图，因为内置表格是有意省略的。',
      },
      {
        name: '有意义的图表图形',
        category: 'Color contrast',
        criterion: '1.4.11 非文本对比度',
        requirement: '图形承载信息时为 3:1',
        states: ['浅色', '深色', '受支持的主题'],
        description:
          '度量有意义的标记与状态指示器在其渲染背景上的对比度。装饰性网格线不要求达到非文本阈值。',
      },
      {
        name: 'tooltip 信息',
        category: 'Keyboard',
        criterion: '2.1.1 键盘与 2.5.1 指针手势',
        requirement: '仅作补充',
        states: ['已启用 tooltip'],
        description:
          '不要让仅悬停可见的 tooltip 内容成为获取重要数值的唯一途径。请保留隐藏表格或其他等价的数据视图。',
      },
    ],
    anatomy: [
      {
        name: '标题区',
        required: false,
        description:
          '绘图区上方可选的可见标题及配套副标题。',
      },
      {
        name: '绘图区',
        required: true,
        description:
          '包含裁剪后系列标记的响应式 SVG 坐标空间。',
      },
      {
        name: '网格与坐标轴',
        required: false,
        description:
          '由调用方提供的 ChartGrid 与 ChartAxis 元素，与绘图区共用比例尺。',
      },
      {
        name: '图例',
        required: false,
        description:
          '推导或调用方提供的系列标签与色板，可置于绘图区的上方、下方、起点或末尾。',
      },
      {
        name: 'tooltip 与交互',
        required: false,
        description:
          '由指针驱动的覆盖层，消费图表交互流。',
      },
      {
        name: '数据表格',
        required: false,
        description:
          '为小型数据集渲染的视觉隐藏表格替代形式。',
      },
    ],
  },

  props: [
    {
      name: 'data',
      type: 'Record<string, unknown>[]',
      description:
        '要可视化的数据行。每行可包含 x 字段以及一个或多个系列字段。',
      required: true,
    },
    {
      name: 'xKey',
      type: 'string',
      description: '从每条数据行读取的字段名，用于共享的 x 比例尺。',
      required: true,
    },
    {
      name: 'series',
      type: 'SeriesDef[]',
      description:
        '由 bar()、line()、area()、dot() 等辅助函数创建的标记定义。每个 Chart 都要构建一个新数组。',
      required: true,
    },
    {
      name: 'height',
      type: 'number',
      description: '图表高度（CSS 像素）。',
      default: '300',
    },
    {
      name: 'margin',
      type: 'Partial<ChartMargin>',
      description:
        '绘图区内边距覆盖值（CSS 像素），对应上、右、下、左。',
      default: '{top: 24, right: 24, bottom: 32, left: 48}',
    },
    {
      name: 'yBaseline',
      type: "'auto' | 'zero' | 'data'",
      description:
        '省略 yDomain 时 Chart 如何推导 y 值域：感知标记的零线与留白、围绕零对称，或紧贴数据范围。',
      default: "'auto'",
    },
    {
      name: 'yDomain',
      type: '[number, number]',
      description:
        '显式 y 值域。设置后将优先于 yBaseline、自动留白与比例尺美化逻辑。',
    },
    {
      name: 'xDomain',
      type: '[number, number]',
      description:
        '数值比例尺的显式 x 值域，包括空的数据流窗口。分类型比例尺会忽略它。',
    },
    {
      name: 'grid',
      type: 'ReactNode',
      description:
        '渲染在系列背后的网格内容，通常为 ChartGrid。',
      slotElements: [{__element: 'ChartGrid', props: {horizontal: true}}],
    },
    {
      name: 'axes',
      type: 'ReactNode',
      description:
        '在系列之后渲染的坐标轴内容，通常为一个或多个 ChartAxis 元素。',
      slotElements: [
        {__element: 'ChartAxis', props: {position: 'bottom'}},
        {__element: 'ChartAxis', props: {position: 'left'}},
      ],
    },
    {
      name: 'legend',
      type: 'boolean | ChartLegendProps',
      description:
        '设为 true 使用推导出的底部图例，或传入 items、position 与 alignment。',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: "boolean | Omit<ChartTooltipProps, 'series'>",
      description:
        '设为 true 使用分组的指针 tooltip，或传入 render 与展示相关选项。',
      default: 'false',
    },
    {
      name: 'interactions',
      type: 'ReactNode',
      description:
        '渲染在指针捕获层之上的交互覆盖层。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '在内置 tooltip 之后渲染的额外 SVG 内容，用于高级组合。',
    },
    {
      name: 'title',
      type: 'string',
      description:
        '图表图像的可见标题与可访问名称。省略时会推导一个本地化回退名称。',
    },
    {
      name: 'subtitle',
      type: 'string',
      description:
        '可见的辅助说明文本，同时作为图表图像的描述。',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: '转发到图表根容器的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这类内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '追加到图表根容器的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '在组件样式之后合并到图表根容器的内联样式。',
    },
  ],

  examples: [
    {
      label: '条形与趋势线',
      code: `import {Chart, ChartAxis, ChartGrid, bar, line} from '@astryxdesign/charts';

const series = [
  bar('revenue', {label: 'Revenue'}),
  line('trend', {label: 'Trend'}),
];

<Chart
  data={monthlyRevenue}
  xKey="month"
  series={series}
  title="Monthly revenue"
  grid={<ChartGrid horizontal />}
  axes={
    <>
      <ChartAxis position="bottom" />
      <ChartAxis position="left" />
    </>
  }
  legend
  tooltip
/>;`,
    },
    {
      label: '稳定的数值窗口',
      code: `<Chart
  data={streamedValues}
  xKey="timestamp"
  series={[line('value')]}
  xDomain={[windowStart, windowEnd]}
  yDomain={[0, 100]}
  title="Live utilization"
/>;`,
    },
  ],
};
