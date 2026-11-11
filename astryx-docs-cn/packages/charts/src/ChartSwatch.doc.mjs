// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChartSwatch',
  displayName: 'Chart Swatch',
  group: 'Charts',
  category: 'Data Visualization',
  isHiddenFromOverview: true,
  keywords: [
    '图表',
    'chart',
    '色板',
    'swatch',
    '系列',
    'series',
    '图例',
    'legend',
    'tooltip',
    '数据可视化',
    'data visualization',
  ],

  usage: {
    description:
      'ChartSwatch 渲染将图表系列颜色与其可见标签配对的小型装饰性标记。条形系列使用方块，其他系列（包括 line、dot、area 标记）使用短线。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将每个色板放在能命名对应系列的可见文本旁边。ChartSwatch 是装饰性的，对辅助技术保持隐藏。',
      },
      {
        guidance: true,
        description:
          '条形系列使用方块变体，其他标记类型使用短线变体，使图例与 tooltip 同绘出的标记一致呼应。',
      },
      {
        guidance: false,
        description:
          '不要把 ChartSwatch 当作系列的可访问名称或数据替代形式。其周围的图例、tooltip 或图表必须提供该信息。',
      },
      {
        guidance: false,
        description:
          '当多个同形系列需要跨图表匹配时，不要仅依赖任意颜色。请对完整图表及其标签做整体验证。',
      },
    ],
    accessibility: [
      {
        name: '装饰性标记',
        category: 'Semantics',
        criterion: '1.1.1 非文本内容',
        requirement: '内建',
        states: ['全部'],
        description:
          '色板对辅助技术保持隐藏。请将其与提供可访问含义的可见系列文本配对。',
      },
      {
        name: '系列区分',
        category: 'Color contrast',
        criterion: '1.4.1 颜色的使用；1.4.11 非文本对比度',
        requirement: '需要使用方验证',
        states: ['全部'],
        description:
          '选择颜色，必要时辅以额外的标签或标记区分，使其在渲染的图表表面上保持可理解。',
      },
    ],
    anatomy: [
      {
        name: '系列色板',
        required: true,
        description:
          '以调用方自有的系列颜色绘制的装饰性方块或短线。',
      },
    ],
  },

  playground: {
    defaults: {
      color: '#3b82f6',
      variant: 'square',
    },
  },

  props: [
    {
      name: 'color',
      type: 'string',
      description:
        '用于绘制色板的 CSS 颜色。调色板选择与渲染表面上的对比度由调用方负责。',
      required: true,
    },
    {
      name: 'variant',
      type: "'square' | 'line'",
      description:
        '标记形状：条形系列使用 square，其他系列类型使用 line。',
      default: "'square'",
    },
  ],

  examples: [
    {
      label: '条形系列色板',
      code: `import {ChartSwatch} from '@astryxdesign/charts';

<ChartSwatch color="#3b82f6" variant="square" />;`,
    },
    {
      label: '由系列驱动的色板',
      code: `import {
  ChartSwatch,
  swatchVariantForType,
} from '@astryxdesign/charts';

<ChartSwatch
  color={series.color}
  variant={swatchVariantForType(series.type)}
/>;`,
    },
  ],
};
