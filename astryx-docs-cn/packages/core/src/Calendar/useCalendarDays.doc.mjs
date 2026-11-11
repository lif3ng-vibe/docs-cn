// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCalendarDays',
  displayName: 'useCalendarDays',
  group: 'Calendar',
  keywords: [
    'calendar',
    '月',
    '网格',
    '周',
    '日',
    '星期名称',
    '周起始日',
    '日期选择器',
  ],
  params: [
    {
      name: 'options',
      type: 'UseCalendarDaysOptions',
      description: '要排布的月份及其排布方式。',
      required: true,
    },
    {
      name: 'options.year',
      type: 'number',
      description:
        '要排布月份的年份，按 options.calendar 的编号。',
      required: true,
    },
    {
      name: 'options.month',
      type: 'number',
      description:
        '月份在 options.calendar 年中的位置，从 1 起。公历中 1 为一月、12 为十二月；其他历法按 Temporal.PlainDate 的方式编号月份，因此希伯来闰年为 1 到 13。',
      required: true,
    },
    {
      name: 'options.weekStartsOn',
      type: 'DayOfWeek',
      description:
        '每周第一天，0（周日）到 6（周六）。它决定网格与 dayNames 的第一列。',
      default: '0',
      required: false,
    },
    {
      name: 'options.hasVariableRowCount',
      type: 'boolean',
      description:
        '按月份需要使用周行数，而非固定 6 行网格。公历月份为 4 到 6 行；科普特与埃塞俄比亚历法的短暂第十三月为 1 或 2 行。',
      default: 'false',
      required: false,
    },
    {
      name: 'options.calendar',
      type: 'CalendarSystem',
      description:
        '为年份、月份与每天的 dayNumber 编号的历法系统。每天的公历日期与 iso 保持不变。Hook 不会读取 InternationalizationProvider 的日历。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 Temporal；缺失时 Hook 使用公历编号并在开发环境警告一次。',
      default: "'gregory'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'days',
      type: 'CalendarDay[]',
      description:
        '按顺序的每个网格单元，包括填充首尾周的上月与下月日期。每天含 date（PlainDate）、iso（YYYY-MM-DD）、isOutside（月外日期为 true）与 dayNumber（在该历法月中的日序）。',
    },
    {
      name: 'weeks',
      type: 'CalendarDay[][]',
      description: '同一批日期按每行 7 天分组。',
    },
    {
      name: 'dayNames',
      type: 'string[]',
      description:
        '当前 locale（来自 InternationalizationProvider）的星期表头名称，从 weekStartsOn 开始。所有名称都放得下时用缩写，否则用 locale 的窄名。',
    },
    {
      name: 'totalCells',
      type: 'number',
      description:
        '网格单元数：固定网格为 42，否则为行数乘以 7。',
    },
  ],
  usage: {
    description:
      '构建一个月的日期网格：包括填充首尾周的上月与下月日期在内的所有展示日期，按周分组，并附带从 weekStartsOn 开始的本地化星期表头名称。这是 Calendar 所用的布局，可用于自定义月视图，如紧凑的可订日期网格或迷你日历。只返回数据：渲染、选择、键盘导航与网格的无障碍语义由调用方负责。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 dayNames 渲染为表头行，让表头与网格一起遵循 weekStartsOn 和 locale。',
      },
      {
        guidance: true,
        description:
          '对 isOutside 的日期做不同样式（如变暗），让填充日读起来属于上月或下月。',
      },
      {
        guidance: false,
        description:
          '不要用它构建供人选择的日期选择器；应使用 Calendar，它提供选择、键盘导航与网格语义。',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useLocale'],
  importPath: '@astryxdesign/core/Calendar',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '构建一个月的日期网格：包括上月/下月填充日在内的所有日期，按周分组，附从 weekStartsOn 开始的本地化星期名称。Calendar 的布局，用于自定义月视图。只给数据：渲染、选择、键盘导航与无障碍语义由调用方负责。',
  paramDescriptions: {
    options: '要排布的月份及方式。',
    'options.year': '月份年份，按 options.calendar 编号。',
    'options.month':
      '月份在 options.calendar 年中的位置，从 1 起（gregory 1 = 一月；希伯来闰年 1-13）。',
    'options.weekStartsOn':
      '每周第一天，0（周日）到 6（周六）；决定网格与 dayNames 首列。',
    'options.hasVariableRowCount':
      '按需使用周行数（公历 4-6，科普特/埃塞俄比亚第十三月 1-2），而非固定 6 行。',
    'options.calendar':
      "为年、月、dayNumber 编号的历法系统；默认 'gregory'。日期保持公历；忽略 provider 日历。非公历系历法需要 Temporal。",
  },
  returnDescriptions: {
    days: '按序的全部网格单元，含填充日；每项有 date（PlainDate）、iso、isOutside、dayNumber（历法月的日序）。',
    weeks: '日期按每行 7 天分组。',
    dayNames:
      '从 weekStartsOn 开始的 locale 星期表头名称；都放得下用缩写，否则用窄名。',
    totalCells: '单元数：固定网格 42，否则行数 × 7。',
  },
  usage: {
    description:
      '月日期网格（填充日、周、从 weekStartsOn 开始的本地化星期名称）。Calendar 的布局，用于自定义月视图。只给数据；渲染、选择、键盘导航与无障碍语义由调用方负责。',
    bestPractices: [
      {
        guidance: true,
        description:
          'dayNames 渲染为表头行，使其遵循 weekStartsOn + locale。',
      },
      {
        guidance: true,
        description: 'isOutside 日期做不同样式（如变暗）。',
      },
      {
        guidance: false,
        description: '不要用它构建可选日期选择器；用 Calendar。',
      },
    ],
  },
};
