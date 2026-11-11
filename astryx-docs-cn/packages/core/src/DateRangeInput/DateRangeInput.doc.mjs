// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateRangeInput',
  displayName: 'Date Range Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    '日期范围选择',
    '日期范围',
    '范围',
    '日历',
    '筛选',
    '分析',
    '时段',
    '排期',
  ],
  props: [
    {name: 'label', type: 'string', description: '标签文本。', required: true},
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的辅助文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '显示"(可选)"指示器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '将字段标记为必填。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用触发器与选择器。触发器保持可聚焦并暴露 `aria-disabled`；打开被阻止。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释输入框为何禁用。配合 isDisabled 使用时，在悬停/键盘聚焦时显示 tooltip 并描述触发器（激活仍被阻止）。用它替代把禁用的 DateRangeInput 包进 Tooltip 的做法。',
    },
    {
      name: 'value',
      type: 'DateRange | null',
      description:
        '选中的日期范围或 null。从 `@astryxdesign/core/DateRangeInput` 导入 `DateRange` 类型；其结构为 `{start: ISODateString, end: ISODateString}`。不要自行重新声明 DateRange 类型；使用导出的类型以保证 TypeScript 结构匹配。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: DateRange | null) => void',
      description:
        '范围变化时的回调。清除时以 null 调用。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: DateRange | null) => void | Promise<void>',
      description:
        'onChange 之后触发的异步操作。经 useTransition 驱动乐观 UI 更新。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '输入框是否处于加载状态。禁用交互并显示加载指示器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description:
        '最小可选日期。`ISODateString` 为模板字面量类型（`\\`${number}${number}${number}${number}-${number}${number}-${number}${number}\\``）。请传入字符串字面量（如 "2026-01-28"），不要传运行时字符串变量。动态计算值时从 `@astryxdesign/core/Calendar` 导入，或使用 `as ISODateString`。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description:
        '最大可选日期。与 `min` 相同的模板字面量类型：使用 YYYY-MM-DD 字符串字面量或以 `as ISODateString` 断言。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '用于禁用特定日期的自定义约束函数。',
    },
    {
      name: 'maxRangeSpan',
      type: 'number',
      description:
        '选中范围可跨的最大天数，含两个端点（`7` = 7 天窗口，start + 6）。选定开始日期后，超出该距离的日期会被禁用，范围因此不会超过上限。相对开始日期的滚动窗口；固定日历边界请用 `min`/`max`。仅约束选择；绝不改写已宽于上限的 `value`（用 `status` 标注这种情况）。',
    },
    {
      name: 'minRangeSpan',
      type: 'number',
      description:
        '选中范围必须跨的最小天数，含两个端点（`2` 禁止单日范围）。选定开始日期后，比这更近的日期会被禁用。再次点击开始日期时，允许则提交单日范围，最小值更长时取消进行中的选择。默认 1（允许开始与结束同日）。',
    },
    {
      name: 'presets',
      type: 'Array<DateRangePreset>',
      description:
        '以快速选择选项形式显示在日历旁的预设范围，放不下时显示在日历上方。预设的任一端点违反 min、max 或 dateConstraints，或其跨度违反 minRangeSpan 或 maxRangeSpan 时禁用。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '选中范围时显示清除按钮。',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选范围时的占位文本。',
      default: "'Select date range'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '触发器尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '错误、警告或成功状态的状态指示器。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对输入框的摆放方式。attached 直接叠放在输入框下方（边框式处理）；detached 作为独立元素带间距悬浮在下方；tooltip 隐藏消息框，改为在状态图标的 tooltip 中呈现。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '经标签末尾信息图标显示的 tooltip 文本。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '日历显示的月份数。',
      default: '2',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        '日历中一周的第一天。数字（0 = 周日至 6 = 周六）或三字母日名。',
      default: '0',
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        '触发器文本与弹层日历显示的历法，如 persian、hebrew 或 buddhist。value、onChange、min、max 与 presets 保持格里高利 ISO 日期。该字段没有类型化入口。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 Temporal（原生或应用加载的 polyfill）；缺失时字段显示格里高利日期并在开发环境告警。Chinese 与 Dangi 历法的月首来自运行时的 Temporal；服务端渲染时，请在服务端与浏览器加载同一 Temporal 实现。',
      default: "the InternationalizationProvider's calendar, else 'gregory'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段的宽度（数字 = 像素，字符串按原样使用，如 "100%"）。同时设定整个字段（标签、控件与状态）的宽度，使其保持对齐。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '标签、控件与状态外层 Field 盒的 StyleX 样式。containerClassName 与 containerStyle 为同一盒子提供 class 名与内联样式。不渲染 Field 盒的场景无效（开发环境告警）：InputGroup 内（应样式化组本身）与 horizontal-labels FormLayout 中。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：即承载文本、图标与末端控件的带边框元素，绝不是原生 input。controlClassName 与 controlStyle 为同一盒子提供 class 名与内联样式。取代根级 xstyle、className 与 style——本组件不接受这三者。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-range-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {className: 'astryx-date-range-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-range-input-presets'},
      {
        className: 'astryx-date-range-input-preset',
        states: ['selected', 'disabled'],
      },
    ],
  },
  usage: {
    description:
      'DateRangeInput 让用户在双月日历弹层中选择开始与结束日期。适用于按时间段筛选数据、报表生成、分析仪表板与预订流程。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于范围触发器，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateRangeInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '用 presets 提供常见范围（如"最近 7 天"）加速选择。',
      },
      {
        guidance: true,
        description:
          '用 min/max 将可选日期限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '保持 hasClear 开启（默认），让用户可以重置筛选。',
      },
      {
        guidance: true,
        description:
          '提供清晰的标签与描述，让用户明白该范围控制什么。',
      },
      {
        guidance: false,
        description:
          '只需单个日期时不要用 DateRangeInput；请改用 DateInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateRangeInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          '触发器上方描述期望日期范围的文本。',
      },
      {
        name: 'Field surface',
        required: true,
        description:
          '包含日历开关、范围触发器与末端控件的带边框控件。',
      },
      {
        name: 'Trigger button',
        required: true,
        description:
          '显示格式化范围或占位文本的按钮。点击打开弹层。',
      },
      {
        name: 'Calendar icon',
        required: true,
        description: '同样可打开弹层的尾随图标。',
      },
      {
        name: 'Calendar popover',
        required: true,
        description:
          '支持范围选择与悬停预览的双月日历网格。',
      },
      {
        name: 'Preset sidebar',
        required: false,
        description:
          '日历旁的预设范围选项列表，放不下时位于日历上方。',
      },
      {
        name: 'Preset button',
        required: false,
        description:
          '单个预设范围的快速选择操作，反映当前与禁用状态。',
      },
      {
        name: 'Clear button',
        required: false,
        description: '将范围重置为 null 的 × 按钮。',
      },
      {
        name: 'Status message',
        required: false,
        description: '触发器下方的错误、警告或成功消息。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带双月日历弹层与预设范围的日期范围选择器',
  usage: {
    description:
      'DateRangeInput 让用户在双月日历中选择起止日期。用于筛选、报表、分析与预订。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于范围触发器，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateRangeInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '用 presets 提供常见范围（如"最近 7 天"）加速选择。',
      },
      {
        guidance: true,
        description:
          '用 min/max 将可选日期限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '保持 hasClear 开启（默认），让用户可以重置筛选。',
      },
      {
        guidance: true,
        description:
          '提供清晰标签+描述，让用户明白该范围控制什么。',
      },
      {
        guidance: false,
        description:
          '只需单个日期时不要用 DateRangeInput；请改用 DateInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateRangeInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
  },
  propDescriptions: {
    label: '标签文本',
    isLabelHidden: '视觉隐藏标签',
    description: '标签下方辅助文本',
    isOptional: '显示"(可选)"指示器',
    isRequired: '标记字段必填',
    isDisabled: '禁用触发器+选择器',
    disabledMessage:
      '禁用时悬停/聚焦 tooltip 显示的原因；描述触发器',
    value:
      '选中范围 {start, end} 或 null；从 @astryxdesign/core/DateRangeInput 导入 DateRange 类型（不要重新声明）',
    onChange: '范围变化回调；清除时为 null',
    min: '最小可选日期：ISODateString 模板字面量类型（YYYY-MM-DD）；用字符串字面量或 `as ISODateString` 断言',
    max: '最大可选日期：ISODateString 模板字面量类型（YYYY-MM-DD）；用字符串字面量或 `as ISODateString` 断言',
    dateConstraints: '禁用日期的自定义约束函数',
    maxRangeSpan:
      '范围可跨的最大天数，含两端点（7 = 7 天窗口）；自选定开始起限制窗口。仅约束选择；不改写过宽的 value',
    minRangeSpan:
      '范围必须跨的最小天数，含两端点（2 禁止单日）；重复点击开始日期在允许时提交单日，否则取消；默认 1',
    presets:
      '预设范围作为快速选择选项；端点或跨度违反相应约束时禁用',
    hasClear: '有范围时显示清除按钮（默认 true）',
    placeholder: '空值时的占位文本',
    size: '触发器尺寸',
    status: 'error/warning/success 状态',
    statusVariant:
      '状态消息摆放：attached 叠放于输入框下方；detached 带间距悬浮于下方；tooltip 隐藏消息框、改在状态图标上显示。',
    labelTooltip: '经标签末尾信息图标显示的 tooltip',
    numberOfMonths: '日历月份数（默认 2）',
    calendar:
      "触发器文本+弹层日历的历法（默认取 provider，否则 'gregory'）；值与预设保持格里高利 ISO；无类型化入口；非格里高利对齐历法需要 Temporal（原生或应用加载 polyfill），否则显示格里高利",
    weekStartsOn:
      '日历中一周的第一天（0=周日，或日名如 "mon"）',
    changeAction:
      'onChange 后触发的异步操作；经 useTransition 驱动乐观 UI 更新',
    isLoading: '加载状态；禁用交互 + 显示加载指示器',
    containerXstyle:
      'Field 盒（标签+控件+状态）；另有 containerClassName/containerStyle。InputGroup 或 horizontal-labels FormLayout 中无效',
    controlXstyle:
      '可视控件框（边框/背景/图标），绝不是原生 input；另有 controlClassName/controlStyle。不接受根级 xstyle/className/style',
  },
};
