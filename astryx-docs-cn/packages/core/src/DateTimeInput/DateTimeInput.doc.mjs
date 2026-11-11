// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  group: 'DateInput',
  category: 'Form Controls',
  keywords: [
    '日期时间选择',
    '日期时间',
    '日期选择器',
    '时间选择器',
    '日历',
    '排期',
    '活动',
    '截止时间',
    '时间戳',
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
        '禁用输入框与选择器。字段保持可聚焦并暴露 `aria-disabled`；输入与打开被阻止。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释输入框为何禁用。配合 isDisabled 使用时，在悬停/键盘聚焦时显示 tooltip 并描述日期与时间字段（激活仍被阻止）。用它替代把禁用的 DateTimeInput 包进 Tooltip 的做法。',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description:
        '选中的日期时间，ISO 8601 格式（YYYY-MM-DDTHH:MM 或 YYYY-MM-DDTHH:MM:SS）。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateTimeString | undefined) => void',
      description: '选中日期时间变化时调用的回调。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: ISODateTimeString | undefined) => void | Promise<void>',
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
      type: 'ISODateTimeString',
      description:
        '可选择的最早日期时间。同时约束日期与时间选择。',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description:
        '可选择的最晚日期时间。同时约束日期与时间选择。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description:
        '用于禁用特定日期的自定义约束函数数组。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description:
        '在时间部分包含秒。即使 nativePicker 选择原生界面，也会保留 Astryx 时间字段，因为 iOS 没有秒滚轮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "小时显示格式。'12h' 使用区域设置的上午/下午用语；'24h' 使用 24 小时制。未设置时遵循 InternationalizationProvider 区域设置的小时制（en-US 为 12 小时制，en-GB 为 24 小时制）；用户自己的偏好可通过区域标签传入（如 'en-US-u-hc-h23'）。",
      default: "the locale's hour cycle",
    },
    {
      name: 'timeIncrement',
      type: '1 | 5 | 10 | 15 | 30',
      description:
        'Astryx 可输入时间字段中箭头键的分钟步长。非默认值会在 nativePicker 模式下保留 Astryx 时间字段，因为 iOS 将原生 step 视为验证规则而非选择器步长。Astryx 触摸面板使用滚轮，忽略此值。',
      default: '1',
    },
    {
      name: 'timeOptionInterval',
      type: '5 | 10 | 15 | 30 | 60',
      description:
        'Astryx 精细指针时间字段上预设时间组合框的分钟间隔。设置后即使 nativePicker 选择原生模式也保留该 Astryx 时间字段，因为 OS 选择器没有等价的预设列表。Astryx 触摸面板使用滚轮。',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '设有日期时间值时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '日期部分未选择日期时显示的占位文本。调用方提供的占位符会替代日历格式提示。',
      default: "'Select a date'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        '日期部分读写输入日期所用的历法，也是其弹层与底部选择器显示的历法。value、onChange、min 与 max 保持格里高利 ISO 日期时间。用户按当前 locale 在该历法中的写法输入日期，可使用任意十进制数字；只有输入完整时字段才会报告日期，并会指出该历法中不存在的日期。年份是该历法的年份，因此请为佛历和民国纪年字段设置 min 和 max，以发现误输入的公历年份。gregory、iso8601、buddhist、roc、japanese 之外的历法需要 Temporal（原生或应用加载的 polyfill）；缺失时字段显示格里高利日期。使用 gregory 或 iso8601 以外的历法时，原本显示原生控件的呈现会在精细指针上显示弹层、在粗指针上显示底部选择器，因为原生日期控件是格里高利历；底部选择器的日期面板显示该历法的月份、闰月与纪元年份。年号更替的年份按所显示月份的年号标注，如 2019 年 1 月为"平成31"、7 月为"令和元"。',
      default: "the InternationalizationProvider's calendar, else 'gregory'",
    },
    {
      name: 'timePlaceholder',
      type: 'string',
      description:
        '时间部分未选择时间时显示的占位文本。触摸设备上，这会显示在未选择时间的闭合时间段中。',
      default: "'Select a time'",
    },
    {
      name: 'timeLabel',
      type: 'string',
      description:
        '时间部分的无障碍标签。默认为"{label} time"，与字段标签关联且可本地化。',
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
      name: 'labelTooltip',
      type: 'string',
      description:
        '经标签末尾信息图标显示的 tooltip 文本。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        'Astryx 指针日历弹层中同时显示的月份数。原生日期控件与移动触摸面板会忽略此值；触摸面板的日期面板一次显示一个可滑动翻页的月份。',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'Astryx 日历中一周的第一天。数字（0 = 周日至 6 = 周六）或三字母日名。原生日期控件会忽略此值。',
      default: '0',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "由哪些表面绘制日期与时间选择器。'adaptive-native'（默认）在精细指针上使用 Astryx 文本字段与弹层、在粗指针上使用浏览器/OS 控件——并按段回退：hasSeconds、非默认 timeIncrement 或 timeOptionInterval 会保留 Astryx 时间字段，因为 iOS 无法忠实表达它们；'native' 始终使用两个浏览器/OS 控件且无回退；'adaptive-bottom-sheet' 在精细指针上用弹层、在粗指针上用 Astryx 协调底部面板；'popover' 与 'bottom-sheet' 在任何指针上强制使用对应 Astryx 表面。每个取值都会打开选择器；仅文本字段是 TimeInput 独有。numberOfMonths、weekStartsOn 或可见的 dateConstraints 行为重要时，请用非原生呈现。约束在提交时执行；min/max 作为提示转发。hourFormat 格式化闭合时间，OS 选择器遵循用户 locale。使用 gregory 或 iso8601 以外的历法时，'native' 与 'adaptive-native' 在精细指针上使用弹层、在粗指针上使用底部选择器，显式的 'native' 会在开发环境告警。",
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
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：即容纳带边框日期与时间段及其图标和末端控件的行，绝不是原生 input。controlClassName 与 controlStyle 为同一盒子提供 class 名与内联样式。取代根级 xstyle、className 与 style——本组件不接受这三者。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {
        className: 'astryx-date-time-input-date-segment',
        visualProps: ['size', 'status'],
      },
      {
        className: 'astryx-date-time-input-time-segment',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-date-time-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-time-input-clock-icon'},
      {className: 'astryx-date-time-input-time-listbox'},
      {className: 'astryx-date-time-input-time-option'},
    ],
  },
  usage: {
    description:
      'DateTimeInput 在一个字段中组合日期与时间选择。presentation="adaptive-native"（默认）下，鼠标/触控板设备使用 Astryx 文本字段与弹层，粗指针设备在同一双段字段中使用浏览器/OS 日期与时间控件。presentation="native" 在任何指针上都使用两个原生控件；presentation="adaptive-bottom-sheet" 保留 Astryx 自己的表面——精细指针用指针字段，粗指针用协调的日期/时间底部面板；"popover" 与 "bottom-sheet" 在任何指针上强制单一 Astryx 表面。可用宽度不小于 400px 时，闭合分段保持并排；低于 400px 时换行为全宽行，与视口宽度无关。适用于排期、活动创建、截止时间设置或任何需要特定日期时间的表单字段。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于日期输入，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateTimeInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '提供清晰的标签与描述，让用户明白需要什么日期时间。',
      },
      {
        guidance: true,
        description:
          '用 min 和 max 将可选日期时间限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '在佛历或民国纪年字段上设置 min 和 max，让误输入的公历年份报错，而不是变成数百年之外的日期。',
      },
      {
        guidance: true,
        description:
          '日期时间可选时使用 hasClear，让用户可以重置。',
      },
      {
        guidance: true,
        description:
          "保持 hourFormat 不设置，让字段遵循 InternationalizationProvider 区域设置的小时制（en-US 为 12 小时制，en-GB 或 de-DE 为 24 小时制）。仅当字段本身需要固定格式时才设置，并把用户自己的 12/24 小时偏好放在 provider 区域标签上（如 'en-US-u-hc-h23'），而不是逐字段设置。",
      },
      {
        guidance: false,
        description:
          '只需日期时不要用 DateTimeInput；请改用 DateInput。',
      },
      {
        guidance: false,
        description:
          '只需时间时不要用 DateTimeInput；请改用 TimeInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让字段用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateTimeInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          '输入框上方描述期望日期时间的文本。',
      },
      {
        name: 'Segment row',
        required: true,
        description:
          '无边框的布局行，容纳两个带边框的分段，容器狭窄时换行。',
      },
      {
        name: 'Date input',
        required: true,
        description:
          '精细指针 Astryx 表面下为带日历弹层的可输入日期字段；原生模式下为真实的 input type=date；presentation="adaptive-bottom-sheet" 且粗指针下为打开 Astryx 触摸面板的只读分段。',
      },
      {
        name: 'Calendar icon',
        required: true,
        description:
          '打开当前日期表面的按钮：平台选择器、Astryx 日历弹层或 Astryx 触摸面板。',
      },
      {
        name: 'Date picker',
        required: false,
        description:
          '原生模式下为浏览器/OS 选择器；精细指针下为 Astryx 月历弹层；presentation="adaptive-bottom-sheet" 且粗指针下为 Astryx 底部面板的日期页。',
      },
      {
        name: 'Time input',
        required: true,
        description:
          '默认分钟精度原生模式下为真实的 input type=time；需要秒、自定义步长或预设选项时为文本/组合框时间字段；presentation="adaptive-bottom-sheet" 且粗指针下为打开无障碍时间滚轮的只读分段。',
      },
      {
        name: 'Clock icon',
        required: true,
        description:
          '时间图标，在 Astryx 指针字段上作为前导标识，在原生与触摸面板时间段中作为选择器入口。',
      },
      {
        name: 'Time options popover',
        required: false,
        description:
          '按 timeOptionInterval 间隔排列的预设时间列表。设置该 prop 后，即使 nativePicker 选择原生控件也会保留 Astryx 文本/组合框时间字段；Astryx 触摸面板改用滚轮。',
      },
      {
        name: 'Time option',
        required: false,
        description:
          '可选时间选项弹层中的一个可选预设时间。',
      },
      {
        name: 'Clear button',
        required: false,
        description: '重置日期时间值的 × 按钮。',
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
  name: 'DateTimeInput',
  displayName: 'Date Time Input',
  usage: {
    description:
      'DateTimeInput combines date and time selection in one field. With presentation="adaptive-native" (the default), mouse/trackpad devices use Astryx typed fields and popovers, while coarse-pointer devices use browser/OS date and time controls in the same two-segment field. presentation="native" uses both native controls on every pointer; presentation="adaptive-bottom-sheet" keeps Astryx\'s own surfaces — pointer fields on fine pointers and the coordinated Date/Time bottom sheet on coarse pointers; "popover" and "bottom-sheet" force one Astryx surface on every pointer. The closed segments stay side by side when at least 400px is available and wrap into full-width rows below 400px, independent of viewport width. Use it for scheduling, event creation, deadline setting, or any form field that needs a specific datetime.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Base props such as ref, id, data-*, aria-*, and DOM event handlers go to the date input, the element that is focused and announced. A DOM handler runs after DateTimeInput's own handler for the same event and still receives events it handled (including ones it called preventDefault on), so it cannot cancel built-in behavior.",
      },
      {
        guidance: true,
        description:
          'Provide clear labels and descriptions so users understand what datetime is expected.',
      },
      {
        guidance: true,
        description:
          'Use min and max to restrict selectable datetimes to valid ranges.',
      },
      {
        guidance: true,
        description:
          'Set min and max on a Buddhist or Minguo calendar field, so a Gregorian year typed by mistake shows an error instead of a date centuries away.',
      },
      {
        guidance: true,
        description:
          'Use hasClear when the datetime is optional so the user can reset it.',
      },
      {
        guidance: true,
        description:
          "Leave hourFormat unset so the field follows the InternationalizationProvider locale's hour cycle (12-hour in en-US, 24-hour in en-GB or de-DE). Set it only when the field itself needs a fixed format, and carry a person's own 12/24-hour preference on the provider locale (e.g. 'en-US-u-hc-h23') rather than on each field.",
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a date is needed; use DateInput instead.',
      },
      {
        guidance: false,
        description:
          'Use DateTimeInput when only a time is needed; use TimeInput instead.',
      },
      {
        guidance: false,
        description:
          'Hide the label without surrounding context that makes the field purpose obvious.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled DateTimeInput in Tooltip to explain why it is disabled. Use the disabledMessage prop instead, which ties the reason to the field.',
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
        '禁用输入框和选择器。字段仍可聚焦并暴露 `aria-disabled`，但不能输入或打开选择器。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框为何被禁用。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示提示，并描述日期和时间字段（仍阻止输入和激活）。请使用此属性，而不是用 Tooltip 包裹已禁用的 DateTimeInput。',
    },
    {
      name: 'value',
      type: 'ISODateTimeString',
      description: '选中的日期时间，ISO 8601 格式。',
    },
    {
      name: 'onChange',
      type: '(value: ISODateTimeString | undefined) => void',
      description: '选中日期时间变更时调用的回调。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(value: ISODateTimeString | undefined) => void | Promise<void>',
      description:
        '在 onChange 之后触发的异步操作。通过 useTransition 驱动乐观更新。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '输入框是否处于加载状态。禁用交互并显示加载指示器。',
      default: 'false',
    },
    {
      name: 'min',
      type: 'ISODateTimeString',
      description: '可选择的最早日期时间。同时约束日期和时间选择。',
    },
    {
      name: 'max',
      type: 'ISODateTimeString',
      description: '可选择的最晚日期时间。同时约束日期和时间选择。',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: '自定义约束函数数组，用于禁用特定日期。',
    },
    {
      name: 'hasSeconds',
      type: 'boolean',
      description:
        '在时间部分包含秒。即使 nativePicker 选择原生界面，也会保留 Astryx 时间字段，因为 iOS 没有秒滚轮。',
      default: 'false',
    },
    {
      name: 'hourFormat',
      type: "'12h' | '24h'",
      description:
        "控制显示格式。'12h' 使用区域设置的上午/下午用语；'24h' 使用 24 小时制。未设置时遵循 InternationalizationProvider 区域设置的小时制（en-US 为 12 小时制，en-GB 为 24 小时制）；用户自己的偏好可通过区域标签传入（例如 'en-US-u-hc-h23'）。",
      default: '区域设置的小时制',
    },
    {
      name: 'timeIncrement',
      type: '1 | 5 | 10 | 15 | 30',
      description:
        'Astryx 可输入时间字段中箭头键的分钟步长。非默认值会在 nativePicker 模式下保留 Astryx 时间字段，因为 iOS 将原生 step 视为验证规则，而不是选择器步长。Astryx 触摸面板使用滚轮。',
      default: '1',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: '当有值时显示清除按钮。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '日期部分未选择日期时显示的占位符文本。调用方提供的占位符会替代日历格式提示。',
      default: "'Select a date'",
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        '日期部分读写输入日期所用的历法，也是其弹出日历和底部面板显示的历法。value、onChange、min 和 max 始终为公历 ISO 日期时间。用户按当前语言区域在该历法中的写法输入日期，可使用任意十进制数字；只有输入完整时字段才会报告日期，并会指出该历法中不存在的日期。年份是该历法的年份，因此请为佛历和民国纪年字段设置 min 和 max，以发现误输入的公历年份。gregory、iso8601、buddhist、roc 和 japanese 以外的历法需要 Temporal（原生或由应用加载的 polyfill）；没有 Temporal 时字段显示公历日期。使用 gregory 或 iso8601 以外的历法时，原本显示原生控件的呈现会在精细指针上显示弹出层、在粗指针上显示底部面板，因为原生日期控件只显示公历；底部面板的日期页显示该历法的月份、闰月和带纪元的年份。年号更替的年份按所显示月份的年号标注，如 2019 年 1 月为“平成31”，7 月为“令和元”。',
      default: "InternationalizationProvider 的历法，否则为 'gregory'",
    },
    {
      name: 'timePlaceholder',
      type: 'string',
      description:
        '时间部分未选择时间时显示的占位符文本。在触摸设备上，这会显示在未选择时间的闭合时间段中。',
      default: "'Select a time'",
    },
    {
      name: 'timeLabel',
      type: 'string',
      description:
        '时间部分的无障碍标签。默认为“{label} time”，与字段标签关联且可本地化。',
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
      name: 'labelTooltip',
      type: 'string',
      description: '通过标签末尾的信息图标显示的提示文本。',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description:
        'Astryx 指针日历弹出层中同时显示的月份数量。原生日期控件和移动触摸面板会忽略此属性；触摸面板的日期部分一次显示一个可滑动月份。',
      default: '1',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'Astryx 日历中每周的起始日。可为数字（0=周日……6=周六）或三字母星期缩写。原生日期控件会忽略此属性。',
      default: '0',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'",
      description:
        "选择由哪些界面绘制日期和时间选择器。'adaptive-native'（默认）在精细指针上使用 Astryx 文本字段与弹出层、在粗指针上使用浏览器/操作系统控件，并按段回退：hasSeconds、非默认 timeIncrement 或 timeOptionInterval 会保留 Astryx 时间字段；'native' 始终使用两个原生控件且不回退；'adaptive-bottom-sheet' 在精细指针上用弹出层、在粗指针上用 Astryx 协调底部面板；'popover' 与 'bottom-sheet' 在任何指针上强制使用对应 Astryx 界面。每个值都会打开选择器；仅文本字段的呈现只属于 TimeInput。需要 numberOfMonths、weekStartsOn 或可见 dateConstraints 行为时请使用非原生呈现。约束会在提交时执行，min/max 作为提示传给原生控件。hourFormat 格式化关闭状态的时间，而操作系统选择器遵循用户区域设置。使用 gregory 或 iso8601 以外的历法时，'native' 与 'adaptive-native' 在精细指针上使用弹出层、在粗指针上使用底部面板，显式的 'native' 会在开发环境中发出警告。",
      default: "'adaptive-native'",
    },
    {
      name: 'nativePicker',
      type: "'touch' | 'always' | 'never'",
      description:
        "已弃用：请使用 presentation（'touch'='adaptive-native'、'always'='native'、'never'='adaptive-bottom-sheet'）。仍按已发布行为工作；同时设置时以 presentation 为准。使用 gregory 或 iso8601 以外的历法时，'touch' 与 'always' 在精细指针上使用弹出层、在粗指针上使用底部面板。",
      default: "'touch'",
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于包含标签、控件和状态的 Field 容器的 StyleX 样式；containerClassName 与 containerStyle 以类名和内联样式作用于同一容器。没有 Field 容器时（InputGroup 内或 horizontal-labels FormLayout 中）不生效，并在开发环境发出警告。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '作用于可见控件框（容纳带边框的日期与时间分段及其图标和末端控件的行，而非原生 input）的 StyleX 样式；controlClassName 与 controlStyle 以类名和内联样式作用于同一元素。本组件不接受根级 xstyle、className 和 style。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-date-time-input',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
      {
        className: 'astryx-date-time-input-date-segment',
        visualProps: ['size', 'status'],
      },
      {
        className: 'astryx-date-time-input-time-segment',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-date-time-input-toggle-icon', states: ['state']},
      {className: 'astryx-date-time-input-clock-icon'},
      {className: 'astryx-date-time-input-time-listbox'},
      {className: 'astryx-date-time-input-time-option'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '日期+时间组合选择器，含日历弹层与时间输入',
  usage: {
    description:
      'DateTimeInput 组合日期与时间选择。presentation="adaptive-native"（默认）在粗指针上用浏览器/OS 日期+时间控件、精细指针上用 Astryx 指针字段；"native" 到处都用两个原生控件；"adaptive-bottom-sheet" 在粗指针上用 Astryx 协调底部面板、精细指针上用指针字段；"popover"/"bottom-sheet" 到处强制单一 Astryx 表面。可用宽度不小于 400px 时闭合分段并排，低于 400px 换行。',
    bestPractices: [
      {
        guidance: true,
        description:
          'ref、id、data-*、aria-* 等基础 props 与 DOM 事件处理函数作用于日期输入，即被聚焦与播报的元素。同一事件的 DOM 处理函数在 DateTimeInput 自身处理之后运行，且仍能收到其已处理的事件（包括其调用过 preventDefault 的事件），因此无法取消内建行为。',
      },
      {
        guidance: true,
        description:
          '提供清晰标签+描述，让用户明白需要什么日期时间。',
      },
      {
        guidance: true,
        description:
          '用 min 和 max 将可选日期时间限制在有效范围内。',
      },
      {
        guidance: true,
        description:
          '在佛历或民国纪年字段上设置 min 和 max，让误输入的公历年份报错，而不是变成数百年之外的日期。',
      },
      {
        guidance: true,
        description:
          '日期时间可选时使用 hasClear，让用户可以重置。',
      },
      {
        guidance: true,
        description:
          "保持 hourFormat 不设置，让字段遵循 InternationalizationProvider 区域设置的小时制（en-US 为 12 小时制，en-GB 或 de-DE 为 24 小时制）。仅当字段本身需要固定格式时才设置，并把用户自己的 12/24 小时偏好放在 provider 区域标签上（如 'en-US-u-hc-h23'），而不是逐字段设置。",
      },
      {
        guidance: false,
        description:
          '只需日期时不要用 DateTimeInput；请改用 DateInput。',
      },
      {
        guidance: false,
        description:
          '只需时间时不要用 DateTimeInput；请改用 TimeInput。',
      },
      {
        guidance: false,
        description:
          '周围上下文不足以让字段用途一目了然时，不要隐藏标签。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 DateTimeInput 包进 Tooltip 来解释禁用原因。请改用 disabledMessage prop，它把原因与字段绑定。',
      },
    ],
  },
  propDescriptions: {
    label: '标签文本',
    isLabelHidden: '视觉隐藏标签',
    description: '标签下方辅助文本',
    isOptional: '显示"(可选)"指示器',
    isRequired: '标记字段必填',
    isDisabled: '禁用输入框+选择器',
    disabledMessage:
      '禁用时悬停/聚焦 tooltip 显示的原因；描述日期与时间字段',
    value: '选中日期时间 ISO 8601',
    onChange: '日期时间变化回调',
    changeAction: 'onChange 后异步操作；驱动乐观 UI',
    isLoading: '加载状态；禁用交互，显示加载指示器',
    min: '最早可选日期时间（ISO）',
    max: '最晚可选日期时间（ISO）',
    dateConstraints: '禁用特定日期的自定义约束函数',
    hasSeconds:
      '包含秒；保留 Astryx 时间字段，因为 iOS 原生选择器没有秒滚轮',
    hourFormat:
      "显示格式。'12h' 使用区域设置上午/下午用语；'24h' 用 24 小时制。未设置遵循 provider 区域设置小时制（-u-hc- 标签携带用户偏好）",
    timeIncrement:
      'Astryx 文本字段的分钟步长；非默认值在原生模式下保留 Astryx 时间字段，因为 iOS 原生 step 仅用于校验',
    timeOptionInterval:
      '预设时间组合框间隔；设置后保留 Astryx 时间字段，因为原生选择器无等价列表',
    hasClear: '有日期时间值时显示清除按钮',
    placeholder: '日期部分空值时的占位文本',
    calendar:
      '输入与已提交日期文本、弹层和底部面板日期页所用历法（月份、闰月、纪元年份；年号更替年份跟随所显示月份，如 2019 年 1 月平成31、7 月令和元）（默认取 provider，否则 gregory）；值保持格里高利 ISO；年份属该历法，佛历/民国字段须设 min/max；非格里高利对齐历法需要 Temporal（原生或应用加载 polyfill），否则显示格里高利；非 gregory/iso8601 绝不显示原生控件：精细指针弹层 / 粗指针底部面板',
    timePlaceholder:
      '时间部分空值时的占位文本；触摸设备显示在闭合时间段中',
    timeLabel:
      '时间输入的无障碍标签；默认"{label} time"',
    size: '输入控件尺寸',
    status: 'error/warning/success 状态 + 消息',
    labelTooltip: '经标签末尾信息图标显示的 tooltip',
    numberOfMonths:
      'Astryx 指针日历同时显示的月份数；原生日期控件与移动触摸面板忽略',
    weekStartsOn:
      'Astryx 日历中一周的第一天（0=周日，或日名如 "mon"）；原生日期控件忽略',
    presentation:
      "日期+时间表面：'adaptive-native'（默认）= 精细指针 Astryx 弹层 / 粗指针浏览器/OS，按段回退（秒/timeIncrement/timeOptionInterval）；'native' = 始终浏览器/OS、无回退；'adaptive-bottom-sheet' = 精细指针弹层 / 粗指针协调底部面板；'popover'/'bottom-sheet' 强制 Astryx。每个取值都打开选择器（无仅文本取值；那是 TimeInput 专属）。非 gregory/iso8601 历法：native + adaptive-native 变为精细指针弹层 / 粗指针底部面板；显式 'native' 开发环境告警。",
    nativePicker:
      "已弃用，改用 presentation：'touch'='adaptive-native'、'always'='native'、'never'='adaptive-bottom-sheet'。仍按发布行为工作，但非 gregory/iso8601 历法绝不显示原生控件；同时设置时 presentation 优先。",
    containerXstyle:
      'Field 盒（标签+控件+状态）；另有 containerClassName/containerStyle。InputGroup 或 horizontal-labels FormLayout 中无效',
    controlXstyle:
      '可视控件框 = 容纳日期与时间分段的行，绝不是原生 input；另有 controlClassName/controlStyle。不接受根级 xstyle/className/style',
  },
};
