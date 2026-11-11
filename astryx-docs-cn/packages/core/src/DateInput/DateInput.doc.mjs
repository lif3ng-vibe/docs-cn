// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateInput',
  displayName: 'Date Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    '日期输入',
    '日期选择器',
    '日期字段',
    '日历',
    '日期选择',
    '日期录入',
    '日期挑选',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本。',
      required: true,
    },
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
      description: '在标签旁显示"(可选)"指示器。',
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
        '禁用输入框与日历。字段保持可聚焦并暴露 `aria-disabled`；输入与打开被阻止。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释输入框为何禁用。配合 isDisabled 使用时，在悬停/键盘聚焦时显示 tooltip（激活仍被阻止）。用它替代把禁用的 DateInput 包进 Tooltip 的做法。',
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: '选中的日期，YYYY-MM-DD 格式。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: '选中日期变化时调用的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description:
        'onChange 之后触发的异步操作。经 useTransition 驱动乐观 UI 更新。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '输入框是否处于加载状态。字段保持可聚焦并暴露 `aria-busy` 与加载指示器；加载结束前输入、选择与清除均被阻止。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '可选择的最早日期（YYYY-MM-DD）。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期（YYYY-MM-DD）。',
    },
    {
      name: 'dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description:
        '用于禁用特定日期的自定义约束函数数组。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '文本输入框中显示的占位文本。调用方提供的占位符会替代日历格式提示。',
      default: "'Select a date'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '错误、警告或成功状态的状态指示对象，附带消息。',
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
      description:
        '经标签末尾信息图标显示的 tooltip 文本。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        '设有日期值时显示清除（×）按钮。点击后清除值并将焦点返回输入框。',
      default: 'false',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        '日历弹层中同时显示的月份数。',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'Astryx 日历表面中一周的第一天。数字（0 = 周日至 6 = 周六）或三字母日名；原生选择器仍由浏览器/操作系统控制。',
      default: '0',
    },
    {
      name: 'format',
      type: "'date' | 'date_long' | 'date_weekday' | 'system_date' | ((value: ISODateString) => string)",
      description:
        "已提交日期值的显示方式。命名值复用 Timestamp 的格式词汇：'date' 显示 'Mar 21, 2026'，'date_long' 显示 'March 21, 2026'，'date_weekday' 显示 'Wed, Mar 21, 2026'，'system_date' 显示 '2026-03-21'。'date'、'date_long' 与 'date_weekday' 按字段历法书写日期；'system_date' 始终为格里高利 ISO 日期。函数接收 ISO 值并返回自定义字符串；字段无法读回的文本不能重新提交。仅作用于已提交的值，绝不影响正在输入的文本。",
      default: "'date_long'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        '文本字段读写日期所用的历法，也是其弹层与底部选择器显示的历法。value、onChange、min 与 max 保持格里高利 ISO 日期。用户按当前 locale 在该历法中的写法输入日期，可使用任意十进制数字；只有输入完整时字段才会报告日期，并会指出该历法中不存在的日期。年份是该历法的年份：佛历字段把 2026 读作佛历 2026 年，因此请为佛历和民国纪年字段设置 min 和 max，以发现误输入的公历年份。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 Temporal（原生或应用加载的 polyfill）；缺失时字段显示格里高利日期。使用 gregory 或 iso8601 以外的历法时，原本显示原生日期控件的呈现会在精细指针上显示弹层、在粗指针上显示底部选择器，因为原生控件是格里高利历；底部选择器显示该历法的月份、闰月与纪元年份。年号更替的年份按所显示月份的年号标注，如 2019 年 1 月为"平成31"、7 月为"令和元"。',
      default: "the InternationalizationProvider's calendar, else 'gregory'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "由哪个表面绘制日期选择器。'adaptive-native'（默认）在精细指针上使用 Astryx 日历弹层、在粗指针上使用浏览器/OS 选择器（input type=date），并在原生控件无法表达值时保留 Astryx 回退；'native' 始终使用浏览器/OS 选择器且无回退；'adaptive-bottom-sheet' 在精细指针上用弹层、在粗指针上用 Astryx 底部选择器；'popover' 与 'bottom-sheet' 在任何指针上强制使用对应 Astryx 表面。每个取值都会打开选择器；仅输入字段是 TimeInput 独有。需要 weekStartsOn、numberOfMonths 或 dateConstraints 的字段请用非原生呈现，原生选择器无法表达这些。使用 gregory 或 iso8601 以外的历法时，'native' 与 'adaptive-native' 在精细指针上使用弹层、在粗指针上使用底部选择器，显式的 'native' 会在开发环境告警。",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用：请使用 presentation（'touch' = 'adaptive-native'、'always' = 'native'、'never' = 'adaptive-bottom-sheet'）。仍按发布时行为工作；同时设置时 presentation 优先。使用 gregory 或 iso8601 以外的历法时，'touch' 与 'always' 在精细指针上使用弹层、在粗指针上使用底部选择器。",
      default: "'touch'",
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
      name: 'containerClassName',
      type: 'string',
      description:
        'Field 盒的 class 名。作用目标与 containerXstyle 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        'Field 盒的内联样式。作用目标与 containerXstyle 相同。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：即承载文本、图标与末端控件的带边框元素，绝不是原生 input。controlClassName 与 controlStyle 为同一盒子提供 class 名与内联样式。取代根级 xstyle、className 与 style——本组件不接受这三者。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description:
        '可视控件框的 class 名。作用目标与 controlXstyle 相同。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description:
        '可视控件框的内联样式。作用目标与 controlXstyle 相同。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {className: 'astryx-date-input-toggle-icon', states: ['state']},
    ],
  },
  usage: {
    description:
      'DateInput 让用户直接输入日期或从日历弹层中选择日期。适用于排期、截止日期、预订日期或任何需要特定日历日期的表单字段。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于日期输入框，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '提供清晰的标签与描述，让用户明白需要什么日期。',
      },
      {
        guidance: true,
        description:
          '用 min、max 与 dateConstraints 将可选日期限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '在佛历或民国纪年字段上设置 min 和 max，让误输入的公历年份报错，而不是变成数百年之外的日期。',
      },
      {
        guidance: true,
        description:
          '日期可选时使用 hasClear，让用户可以重置。',
      },
      {
        guidance: true,
        description:
          '日期触发服务端保存时，用 changeAction 展示加载状态。',
      },
      {
        guidance: true,
        description:
          '精细指针下该字段遵循 WAI-ARIA combobox 模式并配对话框弹层，与 APG date picker combobox 一致：ArrowDown 或 Alt+ArrowDown 打开日历，Escape 关闭并将焦点返回字段。',
      },
      {
        guidance: true,
        description:
          '添加简短静态前缀或后缀（如截止日期提示）时，将 DateInput 放入 InputGroup。',
      },
      {
        guidance: false,
        description:
          '不代表日历日期的自由文本不要用 DateInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让字段用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要只依赖日历；文本输入让用户直接键入日期，对已知日期更快。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description: '输入框上方描述期望日期的文本。',
      },
      {
        name: 'Text input',
        required: true,
        description:
          '用户可直接键入日期的字段，按当前 locale 在字段历法中的写法书写。',
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          '打开日历弹层以可视化选择日期的按钮。',
      },
      {
        name: 'Calendar popover',
        required: false,
        description:
          '点击图标或输入框、或在输入框中按 ArrowDown 时出现的月历网格。',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          '重置日期值的 × 按钮。hasClear 为 true 且已设日期时显示。',
      },
      {
        name: 'Status message',
        required: false,
        description: '输入框下方的错误、警告或成功消息。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'DateInput',
  displayName: 'Date Input',
  usage: {
    description:
      'DateInput lets the user type or pick a date from a calendar popover. Use it for scheduling, deadlines, booking dates, or any form field that needs a specific calendar date.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the date input, the element that is focused and announced. A DOM handler runs after DateInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what date is expected.',
      },
      {
        guidance: true,
        description:
          'Use min, max, and dateConstraints to restrict selectable dates to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Set min and max on a Buddhist or Minguo calendar field, so a Gregorian year typed by mistake shows an error instead of a date centuries away.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the date is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          'Show a loading state with changeAction when the date triggers a server-side save.',
      },
      {
        guidance: true,
        description:
          'On a fine pointer the field follows the WAI-ARIA combobox pattern with a dialog popup, as in the APG date picker combobox: ArrowDown or Alt+ArrowDown opens the calendar, and Escape closes it and returns focus to the field.',
      },
      {
        guidance: false,
        description:
          'Use a DateInput for free-form text that does not represent a calendar date.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Rely on the calendar alone; the text input lets users type dates directly, which is faster for known dates.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
      },
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '标签文本。', required: true},
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签。',
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
      description: '在标签旁显示"(optional)"指示器。',
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
        '禁用输入框和日历。输入框仍可聚焦并暴露 `aria-disabled`，但不能输入或打开日历。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框为何被禁用。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示提示（仍阻止输入和激活）。请使用此属性，而不是用 Tooltip 包裹已禁用的 DateInput。',
    },
    {
      name: 'value',
      type: 'ISODateString',
      description: '选中的日期，YYYY-MM-DD 格式。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateString | undefined) => void',
      description: '选中日期变更时调用的回调。',
    },
    {
      name: 'changeAction',
      type: '(value: ISODateString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '输入框是否处于加载状态。字段仍可聚焦，并通过 `aria-busy` 和加载指示器表示忙碌；加载结束前不能输入、选择或清除日期。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: '可选择的最早日期（YYYY-MM-DD）。',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: '可选择的最晚日期（YYYY-MM-DD）。',
    },
    {
      name: 'dateConstraints',
      type: 'ReadonlyArray<(date: Date) => boolean>',
      description: '自定义约束函数数组，用于禁用特定日期。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '文本输入框中显示的占位符文本。调用方提供的占位符会替代日历格式提示。',
      default: "'Select a date'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '输入控件的尺寸。',
      default: "'md'",
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '错误、警告或成功状态的状态指示对象，附带消息。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '通过标签末尾的信息图标显示的提示文本。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '有日期值时显示清除按钮。点击后清除日期。',
      default: 'false',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: '日历弹出层中同时显示的月份数量。',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'Astryx 日历表面中每周的起始日。可为数字（0=周日……6=周六）或三字母星期缩写；原生选择器仍由浏览器或操作系统控制。',
      default: '0',
    },
    {
      name: 'format',
      type: "'date' | 'date_long' | 'date_weekday' | 'system_date' | ((value: ISODateString) => string)",
      description:
        "已选日期的显示格式。命名值复用 Timestamp 的格式词汇：'date' 显示 'Mar 21, 2026'，'date_long' 显示 'March 21, 2026'，'date_weekday' 显示 'Wed, Mar 21, 2026'，'system_date' 显示 '2026-03-21'。'date'、'date_long' 与 'date_weekday' 按字段的历法书写日期；'system_date' 始终为公历 ISO 日期。函数接收 ISO 值并返回自定义字符串；字段无法读回的文本在编辑后不能重新提交。仅作用于已提交的值，不影响正在输入的文本。",
      default: "'date_long'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        '文本字段读写日期所用的历法，也是其弹出日历和底部选择器显示的历法。value、onChange、min 和 max 始终为公历 ISO 日期。用户按当前语言区域在该历法中的写法输入日期，可使用任意十进制数字；只有输入完整时字段才会报告日期，并会指出该历法中不存在的日期。年份是该历法的年份：佛历字段把 2026 读作佛历 2026 年，因此请为佛历和民国纪年字段设置 min 和 max，以发现误输入的公历年份。gregory、iso8601、buddhist、roc 和 japanese 以外的历法需要 Temporal（原生或由应用加载的 polyfill）；没有 Temporal 时字段显示公历日期。使用 gregory 或 iso8601 以外的历法时，原本显示原生日期控件的呈现会在精细指针上显示弹出层、在粗指针上显示底部选择器，因为原生控件只显示公历；底部选择器显示该历法的月份、闰月和带纪元的年份。年号更替的年份按所显示月份的年号标注，如 2019 年 1 月为“平成31”，7 月为“令和元”。',
      default: "InternationalizationProvider 的历法，否则为 'gregory'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "由哪个界面绘制日期选择器。'adaptive-native'（默认）在精细指针上使用 Astryx 日历弹出层、在粗指针上使用浏览器/操作系统选择器（input type=date），且原生控件无法表达值时保留 Astryx 回退；'native' 始终使用浏览器/操作系统选择器且不回退；'adaptive-bottom-sheet' 在精细指针上用弹出层、在粗指针上用 Astryx 底部选择器；'popover' 与 'bottom-sheet' 在任何指针上强制使用对应 Astryx 界面。每个值都会打开选择器；仅输入字段的呈现只属于 TimeInput。需要 weekStartsOn、numberOfMonths 或 dateConstraints 的字段应使用非原生呈现，原生选择器无法表达这些。使用 gregory 或 iso8601 以外的历法时，'native' 与 'adaptive-native' 在精细指针上使用弹出层、在粗指针上使用底部选择器，显式的 'native' 会在开发环境中发出警告。",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用：请使用 presentation（'touch'='adaptive-native'、'always'='native'、'never'='adaptive-bottom-sheet'）。仍按已发布行为工作；同时设置时以 presentation 为准。使用 gregory 或 iso8601 以外的历法时，'touch' 与 'always' 在精细指针上使用弹出层、在粗指针上使用底部选择器。",
      default: "'touch'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字按像素处理，字符串按原样使用，例如 “100%”）。统一调整标签、控件和状态消息的宽度。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于包含标签、控件和状态的 Field 容器的 StyleX 样式；containerClassName 与 containerStyle 以类名和内联样式作用于同一容器。没有 Field 容器时（InputGroup 内或 horizontal-labels FormLayout 中）不生效，并在开发环境发出警告。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: 'Field 容器的类名，作用目标同 containerXstyle。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: 'Field 容器的内联样式，作用目标同 containerXstyle。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '作用于可见控件框（带边框、包含文本、图标和末端控件的元素，而非原生 input）的 StyleX 样式；controlClassName 与 controlStyle 以类名和内联样式作用于同一元素。本组件不接受根级 xstyle、className 和 style。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可见控件框的类名，作用目标同 controlXstyle。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可见控件框的内联样式，作用目标同 controlXstyle。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {className: 'astryx-date-input-toggle-icon', states: ['state']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '带日历弹层的文本输入框，用于选择日期',
  usage: {
    description:
      'DateInput 让用户输入或从日历弹层选择日期。用于排期、截止日期、预订日期或任何需要日历日期的表单字段。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于日期输入框，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '提供清晰标签+描述，让用户明白需要什么日期。',
      },
      {
        guidance: true,
        description:
          '用 min、max 与 dateConstraints 将可选日期限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '在佛历或民国纪年字段上设置 min 和 max，让误输入的公历年份报错，而不是变成数百年之外的日期。',
      },
      {
        guidance: true,
        description:
          '日期可选时使用 hasClear，让用户可以重置。',
      },
      {
        guidance: true,
        description:
          '日期触发服务端保存时，用 changeAction 展示加载状态。',
      },
      {
        guidance: true,
        description:
          '精细指针下该字段遵循 WAI-ARIA combobox 模式并配对话框弹层，与 APG date picker combobox 一致：ArrowDown 或 Alt+ArrowDown 打开日历，Escape 关闭并将焦点返回字段。',
      },
      {
        guidance: true,
        description:
          '需要简短静态前缀/后缀（如截止日期提示）时放入 InputGroup。',
      },
      {
        guidance: false,
        description:
          '不代表日历日期的自由文本不要用 DateInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让字段用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要只依赖日历；文本输入让用户直接键入日期，对已知日期更快。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
  },
  propDescriptions: {
    label: '标签文本',
    isLabelHidden: '视觉隐藏标签',
    description: '标签下方辅助文本',
    isOptional: '显示"(可选)"指示器',
    isRequired: '标记字段必填',
    isDisabled: '禁用输入框+日历',
    disabledMessage:
      '禁用时悬停/聚焦 tooltip 显示的原因；描述字段可聚焦控件',
    value: '选中日期 YYYY-MM-DD',
    onChange: '日期变化回调',
    changeAction: 'onChange 后异步操作；驱动乐观 UI',
    isLoading:
      '加载状态；保持可聚焦并带 aria-busy + 加载指示器；阻止输入、选择、清除',
    min: '最早可选日期（YYYY-MM-DD）',
    max: '最晚可选日期（YYYY-MM-DD）',
    dateConstraints: '禁用特定日期的自定义约束函数',
    placeholder: '输入框占位文本',
    size: '输入控件尺寸',
    status: 'error/warning/success 状态 + 消息',
    statusVariant:
      '状态消息摆放：attached 叠放于输入框下方；detached 带间距悬浮于下方；tooltip 隐藏消息框、改在状态图标上显示。',
    labelTooltip: '经标签末尾信息图标显示的 tooltip',
    hasClear: '有日期时显示清除按钮；点击清除值。',
    numberOfMonths: '日历弹层同时显示的月份数',
    weekStartsOn:
      '日历中一周的第一天（0=周日，或日名如 "mon"）',
    format:
      "已提交值的显示：'date_long'（默认，March 21, 2026）、'date'（Mar 21, 2026）、'date_weekday'（Wed, Mar 21, 2026）、'system_date'（2026-03-21，始终格里高利 ISO）或 (iso)=>string；复用 Timestamp 词汇；命名格式按字段历法书写。仅限已提交值，不影响输入中。",
    calendar:
      '输入与已提交文本、弹层和底部选择器所用历法（月份、闰月、纪元年份；年号更替年份跟随所显示月份，如 2019 年 1 月平成31、7 月令和元）（默认取 provider，否则 gregory）；值保持格里高利 ISO；年份属该历法，佛历/民国字段须设 min/max；非格里高利对齐历法需要 Temporal（原生或应用加载 polyfill），否则显示格里高利；非 gregory/iso8601 绝不显示原生控件：精细指针弹层 / 粗指针底部选择器',
    presentation:
      "绘制选择器的表面：'adaptive-native'（默认）= 精细指针 Astryx 弹层、粗指针浏览器/OS 且保留 Astryx 回退；'native' = 始终浏览器/OS、无回退；'adaptive-bottom-sheet' = 精细指针弹层 / 粗指针 Astryx 底部选择器；'popover'/'bottom-sheet' 强制 Astryx。每个取值都打开选择器（无纯文本取值；那是 TimeInput 专属）。需要 weekStartsOn/numberOfMonths/dateConstraints 时用非原生。非 gregory/iso8601 历法：native + adaptive-native 变为精细指针弹层 / 粗指针底部选择器；显式 'native' 开发环境告警。",
    nativePicker:
      "已弃用，改用 presentation：'touch'='adaptive-native'、'always'='native'、'never'='adaptive-bottom-sheet'。仍按发布行为工作，但非 gregory/iso8601 历法绝不显示原生控件；同时设置时 presentation 优先。",
    containerXstyle:
      'Field 盒（标签+控件+状态）；另有 containerClassName/containerStyle。InputGroup 或 horizontal-labels FormLayout 中无效',
    containerClassName:
      'Field 盒的 class 名；作用目标同 containerXstyle',
    containerStyle:
      'Field 盒的内联样式；作用目标同 containerXstyle',
    controlXstyle:
      '可视控件框（边框/背景/图标），绝不是原生 input；另有 controlClassName/controlStyle。不接受根级 xstyle/className/style',
    controlClassName:
      '可视控件框的 class 名；作用目标同 controlXstyle',
    controlStyle:
      '可视控件框的内联样式；作用目标同 controlXstyle',
  },
};
