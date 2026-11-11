// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useCalendarNavigation',
  displayName: 'useCalendarNavigation',
  group: 'Calendar',
  keywords: [
    'calendar',
    '导航',
    '月份',
    'navigateMonth',
    'monthYearLabel',
    'pendingFocus',
    'clearPendingFocus',
    '键盘导航',
    '上个月',
    '下个月',
  ],
  params: [
    {
      name: 'options',
      type: 'UseCalendarNavigationOptions',
      description: '可见月份、历法系统与导航回调的配置。',
      required: true,
    },
    {
      name: 'options.initialValue',
      type: 'ISODateString',
      description:
        '非受控时用于确定起始焦点月份的初始 ISO 日期字符串（YYYY-MM-DD）。',
      required: false,
    },
    {
      name: 'options.focusDate',
      type: 'ISODateString',
      description:
        '受控的 ISO 日期字符串（YYYY-MM-DD），决定当前显示的月份。与 onFocusDateChange 组成受控对。',
      required: false,
    },
    {
      name: 'options.onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description:
        '用户导航改变可见焦点月份时调用的回调。与 focusDate 组成受控对。',
      required: false,
    },
    {
      name: 'options.numberOfMonths',
      type: '1 | 2',
      description:
        '同时显示的连续月份数（1 或 2）。默认为 1。',
      default: '1',
      required: false,
    },
    {
      name: 'options.calendar',
      type: 'CalendarSystem',
      description:
        "Hook 步进与格式化月份所用的历法系统（如 'gregory'、'persian'、'hebrew'）。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 Temporal。绝不读取 provider 的日历。默认为 'gregory'。",
      default: "'gregory'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'baseMonth',
      type: 'PlainDate',
      description: '主焦点月份的公历首日。',
    },
    {
      name: 'visibleMonths',
      type: 'PlainDate[]',
      description: '当前每个可见月份公历首日的 PlainDate 对象数组。',
    },
    {
      name: 'visibleCalendarMonths',
      type: '{year: number; month: number}[]',
      description:
        '活动历法系统中每个可见月份的年月对数组，兼容 useCalendarDays 的 options。',
    },
    {
      name: 'monthYearLabel',
      type: 'string',
      description:
        '可见月份或月份范围的格式化本地化表头标签（如 "June 2026"）。',
    },
    {
      name: 'navigateMonth',
      type: '(delta: number, focusedDate?: ISODateString, offset?: number) => void',
      description:
        '将可见月份前移（+1）或后移（-1）。传入 focusedDate 时，用 offset（默认 7）计算跨月边界后目标日期上的 pendingFocus。',
    },
    {
      name: 'pendingFocus',
      type: 'ISODateString | null',
      description:
        '月份导航步骤后要聚焦的目标 ISO 日期；无待处理的跨月键盘焦点时为 null。',
    },
    {
      name: 'clearPendingFocus',
      type: '() => void',
      description:
        '目标日期单元获得键盘焦点后清除 pendingFocus。',
    },
  ],
  usage: {
    description:
      '管理日历组件的可见月份状态与翻页。提供上/下月步进、本地化月份-年份表头字符串，以及待处理焦点跟踪，让键盘方向键导航顺畅地把焦点跨越月份边界移入相邻月份。组合自定义日历表头、翻页控件或双月可订日期拾取器时可直接使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 navigateMonth(-1) 与 navigateMonth(1) 接到上一个/下一个图标按钮上实现翻月。',
      },
      {
        guidance: true,
        description:
          '向 navigateMonth 传 focusedDate 与 offset（如水平方向键为 1、垂直方向键为 7），让 pendingFocus 在月份切换后把键盘焦点引到正确的日期单元。',
      },
      {
        guidance: false,
        description:
          '不要手动硬编码月份-年份表头字符串；monthYearLabel 会按活动 locale 与历法系统自动格式化。',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useCalendarDays', 'useCalendarConstraints'],
  importPath: '@astryxdesign/core/Calendar',
  category: 'utilities',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '管理可见月份翻页、上/下月步进、本地化月份-年份标签与待处理的跨月键盘焦点。',
  paramDescriptions: {
    options: '日历导航配置。',
    'options.initialValue': '非受控导航的起始 ISO 日期。',
    'options.focusDate': '受控可见月份的 ISO 日期。',
    'options.onFocusDateChange': '可见月份变化时的回调。',
    'options.numberOfMonths': '可见月份数（1 或 2）。',
    'options.calendar': '步进与标注所用历法系统；默认 gregory。',
  },
  returnDescriptions: {
    baseMonth: '焦点月份首日的 PlainDate。',
    visibleMonths: '各可见月份首日 PlainDate 对象数组。',
    visibleCalendarMonths: '活动历法系统的年/月对，供 useCalendarDays 使用。',
    monthYearLabel: '本地化月份-年份表头字符串。',
    navigateMonth: '按 delta 步进可见月份；传入 focusedDate 时设置 pendingFocus。',
    pendingFocus: '跨月边界后要聚焦的目标 ISO 日期。',
    clearPendingFocus: '清除待处理焦点状态。',
  },
  usage: {
    description:
      '为日历视图提供可见月份翻页、本地化表头标签与待处理焦点跟踪。',
    bestPractices: [
      {
        guidance: true,
        description: '把 navigateMonth(-1) 与 navigateMonth(1) 接到上一个/下一个按钮。',
      },
      {
        guidance: true,
        description: '键盘导航时向 navigateMonth 提供 focusedDate 与 offset。',
      },
      {
        guidance: false,
        description: '不要手动格式化月份-年份标签而不用 monthYearLabel。',
      },
    ],
  },
};
