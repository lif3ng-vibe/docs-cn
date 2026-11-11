// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChartLegend',
  displayName: 'Chart Legend',
  group: 'Charts',
  category: 'Data Visualization',
  isHiddenFromOverview: true,
  keywords: ['图表', 'chart', '图例', 'legend', '系列', 'series', 'key', '标签', 'label', '数据可视化', 'data visualization'],

  usage: {
    description:
      'ChartLegend 将系列标签与装饰性的标记形状色板配对。需要生成的图例时使用 Chart 的 legend 选项；当调用方已自持图例条目时，可直接渲染 ChartLegend。',
    bestPractices: [
      {
        guidance: true,
        description:
          '为每个条目提供一个简明的标签，能识别对应系列而不依赖颜色名称。',
      },
      {
        guidance: true,
        description:
          '垂直图例使用 start 或 end，可换行的水平图例使用 top 或 bottom。',
      },
      {
        guidance: false,
        description:
          '不要把图例当作图表唯一的文本替代形式。请为父级 Chart 提供可访问名称；当数据需要时，保留等价的数据视图或摘要。',
      },
      {
        guidance: false,
        description:
          '不要假设任意系列颜色在每个主题下都能保持可区分。请在实际渲染表面上对完整的图表与图例做整体验证。',
      },
    ],
    accessibility: [
      {
        name: '具名列表',
        category: 'Semantics',
        criterion: '1.3.1 信息与关系',
        requirement: '内建',
        states: ['非空'],
        description:
          '条目作为本地化 Chart 图例列表中的项渲染。每个可见标签提供系列名称，而色板对辅助技术保持隐藏。',
      },
      {
        name: '图表替代形式',
        category: 'Content',
        criterion: '1.1.1 非文本内容',
        requirement: '在父级 Chart 上为必需',
        states: ['全部'],
        description:
          '图例是对父级 Chart 的补充。它不取代 Chart 的可访问名称、数据表格、摘要或其他等价替代形式。',
      },
      {
        name: '系列区分',
        category: 'Color contrast',
        criterion: '1.4.1 颜色的使用；1.4.11 非文本对比度',
        requirement: '需要使用方验证',
        states: ['非空'],
        description:
          '调用方提供的系列颜色必须在渲染表面上保持可区分。当图表与图例之间需要匹配本身相同的标记时，不要仅依赖颜色。',
      },
    ],
    anatomy: [
      {
        name: '图例列表',
        required: true,
        description:
          '将图例条目分组归拢的可换行水平列表或堆叠垂直列表。',
      },
      {
        name: '图例条目',
        required: true,
        description: '一个系列标签与其装饰性色板的配对。',
      },
      {
        name: '系列色板',
        required: true,
        description:
          '以条目颜色绘制的装饰性方块（条形标记）或短线（其他标记类型）。',
      },
      {
        name: '系列标签',
        required: true,
        description: '命名系列的辅助文本。',
      },
    ],
  },

  props: [
    {
      name: 'items',
      type: 'LegendItem[]',
      description:
        '要渲染的系列条目。每个条目提供 label、color 和可选的标记类型。省略或空数组时不渲染任何内容。',
      default: '[]',
    },
    {
      name: 'position',
      type: "'top' | 'bottom' | 'start' | 'end'",
      description:
        'Chart 与图例方向共用的逻辑位置：top 和 bottom 为水平；start 和 end 为垂直。',
      default: "'bottom'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        'top 和 bottom 时，沿行内主轴分布整行；start 和 end 时，在垂直列表内水平对齐每个条目。',
      default: "'start'",
    },
  ],

  examples: [
    {
      label: '生成的图表图例',
      code: `import {Chart, bar, line} from '@astryxdesign/charts';

<Chart
  data={monthlyRevenue}
  xKey="month"
  series={[
    bar('revenue', {label: 'Revenue'}),
    line('forecast', {label: 'Forecast'}),
  ]}
  legend={{position: 'top', alignment: 'start'}}
/>;`,
    },
    {
      label: '独立图例',
      code: `import {ChartLegend} from '@astryxdesign/charts';

<ChartLegend
  items={[
    {label: 'Revenue', color: '#3b82f6', type: 'bar'},
    {label: 'Forecast', color: '#f59e0b', type: 'line'},
  ]}
  position="start"
  alignment="center"
/>;`,
    },
  ],
};
