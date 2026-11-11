// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChartAxis',
  displayName: 'Chart Axis',
  group: 'Charts',
  category: 'Data Visualization',
  isHiddenFromOverview: true,
  keywords: ['图表', 'chart', '坐标轴', 'axis', '刻度', 'ticks', '标签', 'labels', '比例尺', 'scale', '数据可视化', 'data visualization'],

  usage: {
    description:
      'ChartAxis 基于父级 Chart 持有的比例尺渲染刻度标签，以及可选的边线与刻度线。请放在 Chart 的 axes 插槽中使用，对应绘图区的上、右、下、左物理边缘。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 ChartAxis 放在 Chart 内部使用，使其标签、刻度与边线同标记共用同一套比例尺和绘图区尺寸。',
      },
      {
        guidance: true,
        description:
          '需要产品特定的单位或本地化格式时使用 tickFormat；密集的分类标签需要有界呈现时使用 maxTicks 或 truncate。',
      },
      {
        guidance: false,
        description:
          '不要把坐标轴标签或指针 tooltip 当作获取重要数值的唯一途径。请为 Chart 提供可访问名称，并保留等价的数据视图或摘要。',
      },
      {
        guidance: false,
        description:
          '不要在显示刻度标记的同时隐藏边线。showTicks 有意让边线保持可见，使每个标记都有可依附的边缘。',
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
          '可访问图像名称与受支持的小数据集表格由 Chart 负责。刻度标签是对该图表级替代形式的补充，而非取代。',
      },
      {
        name: '标签文本完整性',
        category: 'Content',
        criterion: 'Unicode 字素簇',
        requirement: '设置 truncate 时为必需',
        states: ['截断的标签'],
        description:
          '截断会保持 emoji、组合 emoji 序列、旗帜与组合附加符号完整，然后再追加省略号。',
      },
    ],
    anatomy: [
      {
        name: '坐标轴边线',
        required: false,
        description:
          '沿所选绘图区边缘的线条。默认仅在底部边缘显示，且只要显示刻度标记就会显示。',
      },
      {
        name: '刻度标记',
        required: false,
        description:
          '从每个保留的刻度位置向外延伸的短线。',
      },
      {
        name: '刻度标签',
        required: true,
        description:
          '位于所选绘图区边缘外侧的格式化比例尺值或分类。',
      },
    ],
  },

  props: [
    {
      name: 'position',
      type: "'top' | 'right' | 'bottom' | 'left'",
      description: '渲染坐标轴的绘图区物理边缘。',
      required: true,
    },
    {
      name: 'tickCount',
      type: 'number',
      description:
        '连续比例尺的近似刻度数量，最终值由 d3 决定。',
      default: '5',
    },
    {
      name: 'maxTicks',
      type: 'number',
      description:
        '显示标签的最大数量。当生成的集合更大时，会均匀跳过部分标签。',
    },
    {
      name: 'tickFormat',
      type: '(value: unknown) => string',
      description:
        '格式化每个保留的刻度。省略时，连续比例尺使用 d3 格式化，分段比例尺使用其分类字符串。',
    },
    {
      name: 'truncate',
      type: 'number',
      description:
        '追加省略号前保留的最大内容字符数。用户感知字符保持完整。',
    },
    {
      name: 'animated',
      type: 'boolean',
      description:
        '刻度位置与可见性变化是否使用内置过渡。',
      default: 'true',
    },
    {
      name: 'showAxisLine',
      type: 'boolean',
      description:
        '是否绘制边线。刻度标记会强制开启边线，使其保持有依附的边缘。',
      default: 'true for bottom; false for top, right, and left',
    },
    {
      name: 'showTicks',
      type: 'boolean',
      description: '是否在每个保留的刻度处向外绘制标记。',
      default: 'false',
    },
  ],

  examples: [
    {
      label: '底部与左侧坐标轴',
      code: `import {Chart, ChartAxis, ChartGrid, bar} from '@astryxdesign/charts';

<Chart
  data={monthlyRevenue}
  xKey="month"
  series={[bar('revenue')]}
  grid={<ChartGrid horizontal />}
  axes={
    <>
      <ChartAxis position="bottom" />
      <ChartAxis position="left" tickFormat={value => String(value)} />
    </>
  }
/>;`,
    },
    {
      label: '密集的分类标签',
      code: `<ChartAxis
  position="bottom"
  maxTicks={8}
  truncate={12}
  showTicks
/>;`,
    },
  ],
};
