// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChartGrid',
  displayName: 'Chart Grid',
  group: 'Charts',
  category: 'Data Visualization',
  isHiddenFromOverview: true,
  keywords: ['图表', 'chart', '网格', 'grid', '辅助线', 'guides', '坐标轴', 'axis', '刻度', 'ticks', '数据可视化', 'data visualization'],

  usage: {
    description:
      'ChartGrid 基于父级 Chart 持有的比例尺绘制水平与垂直辅助线。请放在 Chart 的 grid 插槽中使用，使辅助线与图表共用绘图区尺寸和刻度值。',
    bestPractices: [
      {
        guidance: true,
        description:
          '当读者需要在辅助线旁看到带数值的标签时，将 ChartGrid 与 ChartAxis 搭配使用。',
      },
      {
        guidance: true,
        description:
          '水平辅助线用于数值对比；仅当垂直辅助线能帮助读者对齐分类或连续 x 值时才添加。',
      },
      {
        guidance: false,
        description:
          '不要把网格线当作传达数值或差异的唯一方式。请将有意义的图表信息保留在标签、标记和父级 Chart 的替代形式中。',
      },
      {
        guidance: false,
        description:
          '不要指望 tickCount 能稀疏化分类分段中心。它只对连续比例尺请求密度；分类垂直辅助线每个分段只渲染一条。',
      },
    ],
    accessibility: [
      {
        name: '图表替代形式',
        category: 'Content',
        criterion: '1.1.1 非文本内容',
        requirement: '在父级 Chart 上为必需',
        states: ['全部'],
        description:
          '可访问图像名称与受支持的小数据集表格由 Chart 负责。网格线是对该图表级替代形式的补充，而非取代。',
      },
      {
        name: '纯视觉辅助线',
        category: 'Color contrast',
        criterion: '1.4.11 非文本对比度',
        requirement: '不得单独承载信息',
        states: ['水平', '垂直', '组合'],
        description:
          '网格线是辅助性向导。请保留可见的标签、标记或其他合格线索，使理解不单靠网格。',
      },
    ],
    anatomy: [
      {
        name: '网格线',
        required: false,
        description:
          '位于连续 y 刻度处的水平线，以及位于 x 刻度或分类分段中心处的垂直线。',
      },
    ],
  },

  props: [
    {
      name: 'horizontal',
      type: 'boolean',
      description:
        '是否在连续 y 刻度（零除外）处绘制水平辅助线。',
      default: 'true',
    },
    {
      name: 'vertical',
      type: 'boolean',
      description:
        '是否在连续 x 刻度或分类分段中心处绘制垂直辅助线。',
      default: 'false',
    },
    {
      name: 'tickCount',
      type: 'number',
      description:
        '向连续比例尺请求的近似辅助线数量。它不会稀疏化分类分段中心。',
      default: '5',
    },
  ],

  examples: [
    {
      label: '水平辅助线',
      code: `import {Chart, ChartGrid, bar} from '@astryxdesign/charts';

<Chart
  data={monthlyRevenue}
  xKey="month"
  series={[bar('revenue')]}
  grid={<ChartGrid />}
/>;`,
    },
    {
      label: '水平与垂直辅助线',
      code: `<Chart
  data={monthlyRevenue}
  xKey="month"
  series={[bar('revenue')]}
  grid={<ChartGrid horizontal vertical tickCount={6} />}
/>;`,
    },
  ],
};
