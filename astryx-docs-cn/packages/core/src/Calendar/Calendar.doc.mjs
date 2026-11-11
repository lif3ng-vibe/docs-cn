// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Calendar',
  displayName: 'Calendar',
  category: 'Form Controls',
  keywords: [
    'calendar',
    '日期选择器',
    '日期选择',
    '范围选择器',
    '日期范围',
    '月视图',
    '日选择器',
  ],
  usage: {
    description:
      'Calendar 让用户从月份网格中选择日期或日期范围。用于预订流程、排期 UI、日期筛选，或任何用户需要看到周边日期以获取上下文的场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          '设置 min 和 max 限制选择窗口，如预订仅未来日期、报表仅本季度。',
      },
      {
        guidance: true,
        description:
          '用户需要选择起止日期（如行程或请假申请）时使用 range 模式。',
      },
      {
        guidance: true,
        description:
          '用 dateConstraints 禁用特定日期（如周末或节假日），并说明不可选的原因。',
      },
      {
        guidance: true,
        description:
          '用户经常选择跨月的日期时，并排显示两个月。',
      },
      {
        guidance: true,
        description:
          '自定义月视图用 @astryxdesign/core/Calendar 的 useCalendarNavigation 与 useCalendarDays。要显示其他历法，给两者传同一 calendar，并把 visibleCalendarMonths 喂给 useCalendarDays。Hook 默认 gregory，绝不读取 InternationalizationProvider 的日历。',
      },
      {
        guidance: false,
        description:
          '不要用日历选择久远的过去或未来日期（如出生日期）；开放式输入用文本框更快。',
      },
      {
        guidance: false,
        description:
          '不要不加说明地禁用大段日期；用户应理解日期不可选的原因。',
      },
    ],
    anatomy: [
      {
        name: 'Calendar root',
        required: true,
        description:
          '承载月份头部与日期网格的容器。',
      },
      {
        name: 'Month header',
        required: true,
        description:
          '月份名称与年份，带在月份间移动的导航箭头。dir="rtl" 时箭头自动镜像。',
      },
      {
        name: 'Day grid',
        required: true,
        description:
          '7 列日期网格，列头为星期名称。',
      },
      {
        name: 'Day button',
        required: true,
        description: '网格中的一天，即选择日期的控件。',
      },
      {
        name: 'Selected day',
        required: false,
        description:
          '当前选中日期，高亮显示。range 模式下为起止日期及其间的所有日期。',
      },
      {
        name: 'Today marker',
        required: false,
        description: '当前日期上的低调标识，用于定位。',
      },
    ],
  },
  props: [
    {
      name: 'mode',
      type: "'single' | 'range'",
      description: '选择模式。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'ISODateString | DateRange | null',
      description:
        '受控选中值。null 表示没有选中值；省略或传入 undefined 为非受控模式。',
    },
    {
      name: 'defaultValue',
      type: 'ISODateString | DateRange',
      description: '非受控默认值。',
    },
    {
      name: 'onChange',
      type: 'Function',
      description: '选择回调函数。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '显示的月份数量。',
      default: '1',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '可选择的最早日期。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数。',
    },
    {
      name: 'maxRangeSpan',
      type: 'number',
      description:
        '范围模式：范围最多可跨越的天数，含首尾两端（7 = 7 天窗口）。从选定起始日起限制窗口大小；未选起始日前每天保持可选。',
    },
    {
      name: 'minRangeSpan',
      type: 'number',
      description:
        '范围模式：范围最少需跨越的天数，含首尾两端（2 表示禁止单日范围）。再次点击开始日期时，若最小范围允许则提交单日范围；否则取消进行中的选择。默认为 1。',
    },
    {
      name: 'focusDate',
      type: 'ISODateString',
      description:
        '受控可见月份。未设置时，日历打开时显示已选日期所在月份；若无选中值，则显示今天，并将其限制在 min/max 范围内。',
    },
    {
      name: 'onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description: '导航回调函数。',
    },
    {
      name: 'handleRef',
      type: 'React.Ref<CalendarHandle>',
      description:
        '日历导航的命令式句柄，包括 navigateTo()。',
    },
    {
      name: 'hasOutsideDays',
      type: 'boolean',
      description: '显示相邻月份的日期。',
      default: 'true',
    },
    {
      name: 'hasWeekNumbers',
      type: 'boolean',
      description:
        '显示 ISO 8601 周数。在任何历法中都是 ISO 8601 周数。',
      default: 'false',
    },
    {
      name: 'hasVariableRowCount',
      type: 'boolean',
      description:
        '每个月只显示所需的行数。默认的固定 6 行网格使每个月高度相同；可变行数以固定高度换取更紧凑的网格。',
      default: 'false',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        '每周起始日。可为数字（0=周日）或三字母星期缩写（如 "mon"）。',
      default: '0',
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        "网格显示的历法，如 'persian'、'hebrew' 或 'islamic-umalqura'。它决定月份、月份名称以及按月和按年的导航。value、min、max、focusDate 和所有回调仍为公历 ISO 日期。gregory、iso8601、buddhist、roc 和 japanese 以外的历法需要 Temporal；运行环境没有 Temporal 时，请在服务端和浏览器中加载 polyfill（如 temporal-polyfill/full/global），否则网格显示公历月份。农历（chinese）和檀纪历（dangi）的月初取自运行环境的 Temporal，部分 polyfill 与原生 Temporal 有少数月份的月初相差一天；服务端渲染且需要两端标记一致时，请在两端使用同一种实现，例如 temporal-polyfill/full/shim 的 installImplementation()，它会替换原生 Temporal。",
      default: 'InternationalizationProvider 的历法，否则为 gregory',
    },
  ],
  examples: [
    {
      label: '波斯历中的自定义月视图',
      code: `import {Button} from '@astryxdesign/core/Button';
import {
  useCalendarDays,
  useCalendarNavigation,
} from '@astryxdesign/core/Calendar';

function PersianMonth() {
  const {monthYearLabel, visibleCalendarMonths, navigateMonth} =
    useCalendarNavigation({initialValue: '2026-10-30', calendar: 'persian'});
  // visibleCalendarMonths[0] is {year: 1405, month: 8}: Aban 1405.
  const {weeks} = useCalendarDays({
    ...visibleCalendarMonths[0],
    calendar: 'persian',
  });
  return (
    <section aria-label={monthYearLabel}>
      <Button label="Previous month" onClick={() => navigateMonth(-1)} />
      <Button label="Next month" onClick={() => navigateMonth(1)} />
      {weeks.map(week => (
        <div key={week[0].iso}>
          {week.map(day => (
            <span key={day.iso} data-date={day.iso}>
              {day.isOutside ? '' : day.dayNumber}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}`,
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-calendar', visualProps: ['mode']},
      {
        className: 'astryx-calendar-nav',
        visualProps: ['nav'],
        states: ['disabled'],
      },
      {
        className: 'astryx-calendar-day',
        states: ['selected', 'today', 'disabled', 'in-range', 'marker'],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Calendar',
  displayName: 'Calendar',
  usage: {
    description:
      'Calendar 让用户从月份网格中选择日期或日期范围。用于预订流程、排期 UI、日期筛选，或任何用户需要看到周边日期以获取上下文的场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          '设置 min 和 max 限制选择窗口，如预订仅未来日期、报表仅本季度。',
      },
      {
        guidance: true,
        description:
          '用户需要选择起止日期（如行程或请假申请）时使用 range 模式。',
      },
      {
        guidance: true,
        description:
          '用 dateConstraints 禁用特定日期（如周末或节假日），并说明不可选的原因。',
      },
      {
        guidance: true,
        description:
          '用户经常选择跨月的日期时，并排显示两个月。',
      },
      {
        guidance: true,
        description:
          '自定义月视图用 @astryxdesign/core/Calendar 的 useCalendarNavigation 与 useCalendarDays。要显示其他历法，给两者传同一 calendar，并把 visibleCalendarMonths 喂给 useCalendarDays。Hook 默认 gregory，绝不读取 InternationalizationProvider 的日历。',
      },
      {
        guidance: false,
        description:
          '不要用日历选择久远的过去或未来日期（如出生日期）；开放式输入用文本框更快。',
      },
      {
        guidance: false,
        description:
          '不要不加说明地禁用大段日期；用户应理解日期不可选的原因。',
      },
    ],
  },
  props: [
    {
      name: 'mode',
      type: "'single' | 'range'",
      description: '选择模式。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'ISODateString | DateRange | null',
      description:
        '受控选中值。null 表示没有选中值；省略或传入 undefined 为非受控模式。',
    },
    {
      name: 'defaultValue',
      type: 'ISODateString | DateRange',
      description: '非受控默认值。',
    },
    {name: 'onChange', type: 'Function', description: '选择回调函数。'},
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '显示的月份数量。',
      default: '1',
    },
    {name: 'min', type: 'ISODateString', description: '可选择的最早日期。'},
    {name: 'max', type: 'ISODateString', description: '可选择的最晚日期。'},
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数。',
    },
    {
      name: 'maxRangeSpan',
      type: 'number',
      description:
        '范围模式：范围最多可跨越的天数，含首尾两端（7 = 7 天窗口）。选定起始日后限制窗口大小。',
    },
    {
      name: 'minRangeSpan',
      type: 'number',
      description:
        '范围模式：范围最少需跨越的天数，含首尾两端（2 表示禁止单日范围）。再次点击开始日期时，若最小范围允许则提交单日范围；否则取消进行中的选择。默认为 1。',
    },
    {
      name: 'focusDate',
      type: 'ISODateString',
      description:
        '受控可见月份。未设置时，日历打开时显示已选日期所在月份；若无选中值，则显示今天，并将其限制在 min/max 范围内。',
    },
    {
      name: 'onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description: '导航回调函数。',
    },
    {
      name: 'handleRef',
      type: 'React.Ref<CalendarHandle>',
      description: '日历导航的命令式句柄，包括 navigateTo()。',
    },
    {
      name: 'hasOutsideDays',
      type: 'boolean',
      description: '显示相邻月份的日期。',
      default: 'true',
    },
    {
      name: 'hasWeekNumbers',
      type: 'boolean',
      description: '显示 ISO 8601 周数。在任何历法中都是 ISO 8601 周数。',
      default: 'false',
    },
    {
      name: 'hasVariableRowCount',
      type: 'boolean',
      description:
        '每个月只显示所需的行数。默认的固定 6 行网格使每个月高度相同；可变行数以固定高度换取更紧凑的网格。',
      default: 'false',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        '每周起始日。可为数字（0=周日）或三字母星期缩写（如 "mon"）。',
      default: '0',
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        "网格显示的历法，如 'persian'、'hebrew' 或 'islamic-umalqura'。它决定月份、月份名称以及按月和按年的导航。value、min、max、focusDate 和所有回调仍为公历 ISO 日期。gregory、iso8601、buddhist、roc 和 japanese 以外的历法需要 Temporal；运行环境没有 Temporal 时，请在服务端和浏览器中加载 polyfill（如 temporal-polyfill/full/global），否则网格显示公历月份。农历（chinese）和檀纪历（dangi）的月初取自运行环境的 Temporal，部分 polyfill 与原生 Temporal 有少数月份的月初相差一天；服务端渲染且需要两端标记一致时，请在两端使用同一种实现，例如 temporal-polyfill/full/shim 的 installImplementation()，它会替换原生 Temporal。",
      default: 'InternationalizationProvider 的历法，否则为 gregory',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-calendar',
        visualProps: ['mode'],
      },
      {
        className: 'astryx-calendar-nav',
        visualProps: ['nav'],
        states: ['disabled'],
      },
      {
        className: 'astryx-calendar-day',
        states: ['selected', 'today', 'disabled', 'in-range', 'marker'],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '选择日期或日期范围的月份网格',
  usage: {
    description:
      'Calendar 让用户从月份网格选择日期或日期范围。用于预订、排期、日期筛选。',
    bestPractices: [
      {
        guidance: true,
        description:
          '设 min/max 限制选择窗口：预订仅未来日期，报表仅本季度。',
      },
      {
        guidance: true,
        description:
          '用户选择起止日期时用 range 模式：行程、请假申请。',
      },
      {
        guidance: true,
        description:
          '用 dateConstraints 禁用特定日期（周末/节假日）；说明原因。',
      },
      {
        guidance: true,
        description:
          '用户常选跨月日期时并排显示两个月。',
      },
      {
        guidance: true,
        description:
          '自定义月视图：useCalendarNavigation + useCalendarDays；两者传同一 calendar，visibleCalendarMonths 喂给 useCalendarDays。默认 gregory；绝不读取 provider 日历。',
      },
      {
        guidance: false,
        description:
          '不要用于久远日期；文本框更快。',
      },
      {guidance: false, description: '不要禁用日期却不说明原因。'},
    ],
  },
  propDescriptions: {
    mode: '选择模式',
    value: '受控选中值',
    defaultValue: '非受控默认值',
    onChange: '选择回调',
    numberOfMonths: '显示月份数',
    min: '最早可选日期',
    max: '最晚可选日期',
    dateConstraints: '自定义约束函数',
    maxRangeSpan:
      '范围模式：范围最大天数（含两端）（7 = 7 天窗口）',
    minRangeSpan:
      '范围模式：范围最小天数（含两端）；重复点击开始日允许时提交单日，否则取消（默认 1）',
    focusDate:
      '受控可见月份（默认：选中日期，否则今天钳制在 min/max 内）',
    onFocusDateChange: '导航回调',
    handleRef: '命令式导航句柄',
    hasOutsideDays: '显示相邻月份日期',
    hasWeekNumbers: '显示 ISO 8601 周数（任何历法）',
    hasVariableRowCount:
      '每月只显示所需行数；以固定 6 行高度换紧凑网格',
    weekStartsOn: '每周起始日（0=周日，或名称如 "mon"）',
    calendar:
      '显示的历法系统（默认 provider 日历，否则 gregory）；值保持公历 ISO；非公历系历法需要 Temporal',
  },
};
