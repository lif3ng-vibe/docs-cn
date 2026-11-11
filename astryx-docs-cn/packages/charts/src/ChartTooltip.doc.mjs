// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChartTooltip',
  displayName: 'Chart Tooltip',
  group: 'Charts',
  category: 'Data Visualization',
  isHiddenFromOverview: true,
  keywords: [
    '图表',
    'chart',
    'tooltip',
    '悬停',
    'hover',
    '系列',
    'series',
    '十字线',
    'crosshair',
    '数据可视化',
    'data visualization',
  ],

  usage: {
    description:
      'ChartTooltip 显示距指针最近的图表位置的分组数值。标准集成使用 Chart 的 tooltip prop 或其配置对象；需要显式的子元素组合时仍可直接组合使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 tooltip 内容视为补充性的指针细节。请为父级 Chart 提供可访问名称，并保留其等价的数据表格或其他完整数据视图。',
      },
      {
        guidance: true,
        description:
          '直接组合 ChartTooltip 时，传入与 Chart 相同的系列定义，使行、色板与悬停圆点同绘出的标记保持对齐。',
      },
      {
        guidance: false,
        description:
          '不要把理解图表所需的信息只放在 tooltip 里。当前交互由指针驱动，不建立焦点触发器或 aria-describedby 关联。',
      },
      {
        guidance: false,
        description:
          '不要在自定义 tooltip 主体内渲染交互控件。该表面仅用于展示，不接受指针输入。',
      },
    ],
    accessibility: [
      {
        name: '补充细节',
        category: 'Content',
        criterion: '1.1.1 非文本内容',
        requirement: '在父级 Chart 上为必需',
        states: ['全部'],
        description:
          'tooltip 是对父级 Chart 的补充。它不取代 Chart 的可访问名称、隐藏数据表格、摘要或其他等价数据视图。',
      },
      {
        name: 'tooltip 语义',
        category: 'Semantics',
        criterion: '1.3.1 信息与关系',
        requirement: '内建，但存在已记录的限制',
        states: ['悬停时'],
        description:
          '可见卡片使用 role tooltip。Chart 目前不提供可聚焦的数据点触发器或 aria-describedby 关联，因此必需信息必须在这一纯指针表面之外仍然可用。',
      },
    ],
    anatomy: [
      {
        name: '层宿主',
        required: true,
        description:
          '挂载在图表最近 HTML 容器之下的层宿主，使嵌套的 Theme 与 MediaTheme 作用域得以继承。Popover API 可用时使用浏览器顶层（top layer），否则通过 Layer 的降级回退保持卡片可见。',
      },
      {
        name: 'tooltip 卡片',
        required: true,
        description:
          '包含当前 x 值与各系列数值的非交互表面。',
      },
      {
        name: '系列行',
        required: false,
        description:
          '多系列图表中的装饰性色板、可见标签与数值。',
      },
      {
        name: '悬停指示器',
        required: false,
        description:
          '分段比例尺上条形系列的分段高亮，其余情况为垂直十字线。',
      },
      {
        name: '悬停圆点',
        required: false,
        description:
          '悬停数据索引处每个符合条件的非条形系列的点标记。',
      },
    ],
  },

  props: [
    {
      name: 'series',
      type: 'readonly SeriesDef[]',
      description:
        '用于推导 tooltip 行与悬停圆点的系列定义。Chart 会通过其 tooltip prop 自动提供；直接组合时应传入与 Chart 相同的数组。',
      default: '[]',
    },
    {
      name: 'render',
      type: '(xValue: unknown, seriesValues: TooltipSeriesValue[]) => ReactNode',
      description:
        '替换默认卡片主体。返回 null 可隐藏卡片，同时保留已启用的悬停指示器与圆点。',
      default: '默认的分组数值内容',
    },
    {
      name: 'hoverIndicator',
      type: 'boolean',
      description:
        '在分段比例尺上为条形系列显示分段高亮，其他系列显示垂直十字线。',
      default: 'true',
    },
    {
      name: 'showHoverDots',
      type: 'boolean',
      description:
        '在悬停索引处为每个符合条件的非条形系列显示点标记。',
      default: 'true',
    },
    {
      name: 'placement',
      type: "'auto' | 'right' | 'left' | 'top'",
      description:
        '从内置的定位算法中选择一个。当前实现基于悬停 x 坐标与绘图区顶部定位；定位是否应改为在两轴上均相对数据点，尚未定论。自定义渲染器自行负责内容尺寸。',
      default: "'auto'",
    },
  ],

  examples: [
    {
      label: '生成的图表 tooltip',
      code: `import {Chart, bar, line} from '@astryxdesign/charts';

<Chart
  data={monthlyRevenue}
  xKey="month"
  series={[
    bar('revenue', {label: 'Revenue'}),
    line('forecast', {label: 'Forecast'}),
  ]}
  tooltip
/>;`,
    },
    {
      label: '直接组合',
      code: `import {Chart, ChartTooltip, line} from '@astryxdesign/charts';

const series = [line('revenue', {label: 'Revenue'})];

<Chart data={monthlyRevenue} xKey="month" series={series}>
  <ChartTooltip
    series={series}
    placement="top"
    showHoverDots={false}
  />
</Chart>;`,
    },
  ],
};
