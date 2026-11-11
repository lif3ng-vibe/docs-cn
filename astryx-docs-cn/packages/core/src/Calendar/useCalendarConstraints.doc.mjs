// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCalendarConstraints',
  displayName: 'useCalendarConstraints',
  group: 'Calendar',
  keywords: [
    'calendar',
    '约束',
    'isDateDisabled',
    'dateConstraints',
    'min',
    'max',
    'rangeSpan',
    'rangeAnchor',
    '禁用日期',
    '酒店预订',
  ],
  params: [
    {
      name: 'options',
      type: 'UseCalendarConstraintsOptions',
      description: '日期边界、跨度限制与自定义规则的配置。',
      required: true,
    },
    {
      name: 'options.min',
      type: 'ISODateString',
      description:
        'ISO 格式（YYYY-MM-DD）的最早可选日期。严格早于该日期的日期被禁用。',
      required: false,
    },
    {
      name: 'options.max',
      type: 'ISODateString',
      description:
        'ISO 格式（YYYY-MM-DD）的最晚可选日期。严格晚于该日期的日期被禁用。',
      required: false,
    },
    {
      name: 'options.dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description:
        '自定义日期约束谓词。接收原生 Date；任一返回 false 则该日期被禁用。',
      required: false,
    },
    {
      name: 'options.maxRangeSpan',
      type: 'number',
      description:
        '范围可跨越的最大天数，含两个端点（值为 7 表示允许 7 天窗口）。在设置 rangeAnchor 前不生效。',
      required: false,
    },
    {
      name: 'options.minRangeSpan',
      type: 'number',
      description:
        '范围必须跨越的最小天数，含两个端点。禁用会使范围短于 minRangeSpan 天的日期（rangeAnchor 本身除外——它保持可用，使禁止单日选择的拾取器必须拒绝在锚点上的第二次点击）。',
      required: false,
    },
    {
      name: 'options.rangeAnchor',
      type: 'PlainDate | null',
      description:
        '进行中范围的起始日期。跨度约束以该日期为基准。未在选择中时为 null。',
      required: false,
    },
  ],
  returns: [
    {
      name: 'isDateDisabled',
      type: '(date: PlainDate) => boolean',
      description:
        '谓词函数：PlainDate 超出 min/max 边界、距 rangeAnchor 近于 minRangeSpan 允许值（rangeAnchor 本身除外）、相对 rangeAnchor 超出 maxRangeSpan，或未通过任一 dateConstraints 谓词时返回 true。',
    },
    {
      name: 'minDate',
      type: 'PlainDate | null',
      description: '解析后的最小日期 PlainDate 对象；未提供 min 时为 null。',
    },
    {
      name: 'maxDate',
      type: 'PlainDate | null',
      description: '解析后的最大日期 PlainDate 对象；未提供 max 时为 null。',
    },
  ],
  usage: {
    description:
      '为日历视图与自定义范围拾取器提供日期约束校验。它把边界日期、以进行中范围起点为基准的跨度限制，以及自定义规则（如每周休息日或不可预订日期）组合成一个 isDateDisabled 谓词。Calendar 内部用它禁用日期按钮；构建定制排期界面或范围拾取器时可直接使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '仅在用户选定初始范围起点后传入 rangeAnchor，确保首次点击前所有可选起始日期保持可选。',
      },
      {
        guidance: true,
        description:
          '周期性或动态规则用 dateConstraints，如禁用休息的工作日、已过去的假期或售罄日期。',
      },
      {
        guidance: false,
        description:
          '不要在 dateConstraints 谓词内执行慢速网络调用或重计算，因为 isDateDisabled 会为网格中渲染的每一天同步求值。',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useCalendarDays', 'useCalendarNavigation'],
  importPath: '@astryxdesign/core/Calendar',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '提供日期约束校验：将 min/max 边界、相对 rangeAnchor 的跨度上限与自定义规则函数组合为 isDateDisabled。',
  paramDescriptions: {
    options: '日期约束配置。',
    'options.min': '最早可选 ISO 日期。',
    'options.max': '最晚可选 ISO 日期。',
    'options.dateConstraints': '谓词数组，对禁用日期返回 false。',
    'options.maxRangeSpan': '范围最大天数（含端点），以 rangeAnchor 为基准。',
    'options.minRangeSpan': '范围最小天数（含端点），以 rangeAnchor 为基准。',
    'options.rangeAnchor': '跨度约束使用的当前范围起点 PlainDate。',
  },
  returnDescriptions: {
    isDateDisabled: 'PlainDate 违反任一约束时返回 true 的函数。',
    minDate: '解析后的最小 PlainDate 或 null。',
    maxDate: '解析后的最大 PlainDate 或 null。',
  },
  usage: {
    description:
      '把边界、跨度与谓词组合为 isDateDisabled，供日历与日期拾取器布局使用。',
    bestPractices: [
      {
        guidance: true,
        description: '仅在正在选择范围终点时设置 rangeAnchor。',
      },
      {
        guidance: true,
        description: '周期性不可订日期或休息日用 dateConstraints。',
      },
      {
        guidance: false,
        description: '不要在 dateConstraints 内运行高开销计算。',
      },
    ],
  },
};
