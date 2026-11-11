// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Timestamp.doc.mjs
 * @input Timestamp public props, theming targets, and usage patterns
 * @output Consumer documentation for formatted times and hover/keyboard details
 * @position Timestamp documentation consumed by the CLI and doc site
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Timestamp',
  displayName: 'Timestamp',
  category: 'Content',
  keywords: [
    'date',
    'time',
    'datetime',
    '相对时间',
    '多久之前',
    'clock',
    '格式化',
    'duration',
    'relativetime',
  ],
  playground: {
    // `value` is required but has no semantic default, so the properties-tab
    // preview fell back to the literal string "value" — which
    // `new Date("value")` rejects, crashing the preview with "Invalid time
    // value". Seed a valid ISO 8601 date so the interactive preview renders.
    defaults: {
      value: '2026-02-19T17:00:00Z',
    },
  },
  props: [
    {
      name: 'value',
      type: 'string | number',
      description:
        '要显示的日期/时间。接受 Unix 时间戳（秒）或 ISO 8601 字符串。',
      required: true,
    },
    {
      name: 'format',
      type: "'relative' | 'relative_short' | 'auto' | 'date' | 'date_long' | 'date_weekday' | 'date_time' | 'time' | 'system_date' | 'system_date_time' | 'system_time' | 'unix_seconds'",
      description:
        "显示格式。'relative' 使用 locale 原生的长相对时间措辞（英文为 '2 hours ago'），'relative_short' 使用其窄式模式（英文为 '2h ago'）用于紧凑界面，'date' 显示 'Mar 21, 2025'，'date_long' 显示 'March 21, 2025'，'date_weekday' 显示 'Wed, Mar 21, 2025'，'date_time' 显示 'Mar 21, 2025, 2:51 PM'，'time' 显示 '2:51 PM'，'system_*' 变体使用 ISO 风格格式，'unix_seconds' 显示自纪元起的整秒 Unix 时间（绝对值、与时区无关），'auto' 根据时间远近从 relative 切换到 date_time。绝对格式从不读取当前时间。'relative'、'relative_short' 和 'auto' 仅在客户端读取它：服务端渲染或静态预渲染显示带标注的 UTC 完整日期时间，客户端在水合后切换为该格式的正常输出。带日期的格式（'date'、'date_long'、'date_weekday'、'date_time'，以及悬停卡片和无障碍名称中的完整日期）使用 InternationalizationProvider 的历法，如 calendar=\"persian\"；'time'、相对格式、'system_*' 和 'unix_seconds' 不受影响。",
      default: "'auto'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        "绝对格式渲染所用的 IANA 时区，如 'UTC' 或 'America/Los_Angeles'。省略（或传 'local'）表示查看者自己的时区。显式时区在服务端和客户端渲染一致，因此是不带水合不匹配地显示绝对时间的方法；相对格式的可见文本忽略它，而已配置的 tooltipEntries 行仍遵循它。未知标识符在开发环境警告一次并回退到查看者时区。",
    },
    {
      name: 'autoThreshold',
      type: 'number',
      description:
        "'auto' 格式从 relative 切换到 date_time 的阈值秒数。",
      default: '604800',
    },
    {
      name: 'hasTooltip',
      type: 'boolean',
      description:
        '悬停或键盘聚焦时是否显示包含完整日期/时间的可复制悬停卡片。适用于相对时间戳，以及配置 tooltipEntries 后的任何格式。',
      default: 'true',
    },
    {
      name: 'tooltipEntries',
      type: 'ReadonlyArray<{timezoneID?: string; format?: TimestampTooltipFormat; label?: string; isCopyable?: boolean}>',
      description:
        "悬停时要显示的行，让同一时刻可以同时以多个时区和/或多种格式阅读（并可选复制）。每项一行，按给定顺序。没有 timezoneID 的条目在设置了 Timestamp timezoneID 时遵循它，否则用查看者时区；'local' 始终表示查看者时区；format 默认为完整绝对样式，也接受 'full' 以及所有非相对的 TimestampFormat。行默认只读，除非设置 isCopyable（默认 false）；可复制行在专用的尾部操作列中显示复制按钮以保持对齐，且该列仅在某行可复制时出现。没有条目时卡片显示一行默认的完整绝对时间，可复制。配置条目也会把该面板附加到绝对格式上，否则绝对格式没有面板。",
    },
    {
      name: 'isTimezoneShown',
      type: 'boolean',
      description:
        "是否在可见文本后附加时区缩写。适用于 date_time 和 time 格式；system_* 格式保持机器可读，从不携带。用 tooltipEntries 控制工具提示的时区。",
      default: 'false',
    },
    {
      name: 'isLive',
      type: 'boolean',
      description:
        '相对时间是否实时更新（如 "2 min ago" → "3 min ago"）。',
      default: 'false',
    },
    {
      name: 'type',
      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
      description:
        '来自 Text 的语义化文本类型。决定字号、字重和行高。',
      default: "'supporting'",
    },
    {
      name: 'size',
      type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
      description: '显式字号覆盖。覆盖 type 决定的字号。',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description: '文本颜色。',
      default: "'secondary'",
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description: '字重覆盖。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-timestamp', visualProps: ['type', 'color', 'format']},
      {className: 'astryx-timestamp-copy-button'},
    ],
    componentIcons: [
      {
        slot: 'timestamp-copy',
        description: '悬停卡片行上的复制按钮图标。',
        fallback: '`copy`; `check` while copied',
        state: [
          {
            name: 'copied',
            type: 'boolean',
            description:
              '复制成功后显示已复制反馈期间为 true。',
          },
        ],
        whenNull:
          '隐藏该图形符号。按钮保留其尺寸、名称、工具提示和复制操作。',
      },
    ],
  },
  usage: {
    description:
      'Timestamp 把日期或时间值格式化为人类可读的文本。用于显示某事物的创建、更新或计划时间；要求新近感选 relative，要求精确选 absolute，或用 auto 让组件自行决定。',
    bestPractices: [
      {
        guidance: true,
        description:
          '在信息流和列表中使用 auto 格式，让近期条目自动显示 "2 hours ago"，较早条目自动显示完整日期。',
      },
      {
        guidance: true,
        description:
          '同一列表或表格内保持格式一致；在同一列混用相对和绝对时间戳会干扰扫读。',
      },
      {
        guidance: true,
        description:
          '当受众跨越多个时区（如全球团队日历或审计日志）时启用 isTimezoneShown。',
      },
      {
        guidance: true,
        description:
          "当读者需要对比时区时使用 tooltipEntries，例如事故日志中读者的时间与事件的原始时区都很重要。",
      },
      {
        guidance: true,
        description:
          '当绝对时间必须对每个查看者和在服务端都一致时传入 timezoneID，例如事故日志时间戳或任何服务端渲染的内容；否则服务端标记取决于服务器时区。',
      },
      {
        guidance: true,
        description:
          '工具提示显示多个时区时为每个条目加标签；裸缩写不总是可识别（东京会渲染为 "GMT+9"，而不是 "JST"）。',
      },
      {
        guidance: true,
        description:
          '活跃的仪表板或实时信息流使用 isLive，让相对时间无需刷新页面也能保持准确。',
      },
      {
        guidance: true,
        description:
          '读者需要获取精确值时使用 tooltipEntries：事故日志或部署记录中有人要把 UTC 时间或 Unix 秒粘贴到别处；配置条目会把悬停变成可复制到剪贴板的行。',
      },
      {
        guidance: false,
        description:
          "不要向用户显示原始 Unix 时间戳或 ISO 字符串；始终通过 Timestamp 获得人类可读的格式。",
      },
      {
        guidance: false,
        description:
          '面向用户的界面避免使用 system_date 或 system_time 格式；它们面向开发者工具、日志和机器可读场景。',
      },
      {
        guidance: false,
        description:
          '不要在相对时间戳上禁用悬停卡片；用户看到 "3 hours ago" 时预期悬停可查看完整日期。',
      },
      {
        guidance: false,
        description:
          "不要把很多时区堆进一张卡片；它最宽 300px，长的带标签行会换行。两三条最易读。",
      },
      {
        guidance: false,
        description:
          '不要把 "EST" 这类固定偏移缩写作为 timezoneID；它是有效标识符但从不遵守夏令时，一年中有一半时间会差一小时。请用区域 id "America/New_York"。',
      },
    ],
    anatomy: [
      {
        name: 'Formatted text',
        required: true,
        description:
          '渲染出的日期、时间或相对标签，如 "2 hours ago" 或 "Mar 21, 2025"。',
      },
      {
        name: 'Hover card',
        required: false,
        description:
          '可复制的悬停卡片：显示为相对时间时展示完整绝对日期时间，否则展示经 tooltipEntries 配置的行。其默认单行携带完整绝对时间。',
      },
      {
        name: 'Hover card row',
        required: false,
        description:
          '卡片的一行：以一个时区和一种格式渲染的时刻，旁边可选带标签。行通过 isCopyable 启用复制按钮。',
      },
      {
        name: 'Copy button',
        required: true,
        description:
          '悬停卡片中逐行复制到剪贴板的按钮；复制该行格式化后的值。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  propDescriptions: {
    value:
      '\u8981\u663e\u793a\u7684\u65e5\u671f/\u65f6\u95f4\u3002\u63a5\u53d7 Unix \u65f6\u95f4\u6233\uff08\u79d2\uff09\u6216 ISO 8601 \u5b57\u7b26\u4e32\u3002',
    format:
      "\u663e\u793a\u683c\u5f0f\u3002'relative' \u663e\u793a '2\u5c0f\u65f6\u524d'\uff0c'date' \u663e\u793a\u65e5\u671f\uff0c'date_long' \u663e\u793a\u957f\u6708\u4efd\u65e5\u671f\uff0c'date_weekday' \u663e\u793a\u661f\u671f+\u65e5\u671f\uff0c'auto' \u6839\u636e\u65f6\u95f4\u8fdc\u8fd1\u81ea\u52a8\u5207\u6362\u3002\u5e26\u65e5\u671f\u7684\u683c\u5f0f\uff08'date'\u3001'date_long'\u3001'date_weekday'\u3001'date_time'\uff0c\u4ee5\u53ca\u60ac\u505c\u5361\u7247\u548c\u65e0\u969c\u788d\u540d\u79f0\u4e2d\u7684\u5b8c\u6574\u65e5\u671f\uff09\u4f7f\u7528 InternationalizationProvider \u7684\u5386\u6cd5\uff08\u5982 calendar=\"persian\"\uff09\uff1b'time'\u3001\u76f8\u5bf9\u683c\u5f0f\u3001'system_*' \u548c 'unix_seconds' \u4e0d\u53d8\u3002",
    autoThreshold:
      'auto \u683c\u5f0f\u4ece\u76f8\u5bf9\u65f6\u95f4\u5207\u6362\u5230 date_time \u7684\u9608\u503c\u79d2\u6570\u3002',
    hasTooltip:
      '\u60ac\u505c\u6216\u952e\u76d8\u805a\u7126\u65f6\u662f\u5426\u663e\u793a\u5305\u542b\u5b8c\u6574\u65e5\u671f/\u65f6\u95f4\u7684\u53ef\u590d\u5236\u60ac\u505c\u5361\u7247\uff08\u76f8\u5bf9\u65f6\u95f4\u6a21\u5f0f\uff0c\u6216\u914d\u7f6e tooltipEntries \u7684\u4efb\u610f\u683c\u5f0f\uff09\u3002',
    tooltipEntries:
      "\u60ac\u505c\u65f6\u8981\u663e\u793a\u7684\u884c\uff0c\u7528\u4e8e\u540c\u65f6\u5c55\u793a\u591a\u4e2a\u65f6\u533a\u548c/\u6216\u591a\u79cd\u683c\u5f0f\u3002\u6bcf\u9879\u4e3a\u4e00\u884c\uff0c\u6309\u987a\u5e8f\u6e32\u67d3\uff1b\u7701\u7565 timezoneID \u8868\u793a\u6cbf\u7528 Timestamp \u7684 timezoneID\uff08\u672a\u8bbe\u7f6e\u65f6\u4e3a\u67e5\u770b\u8005\u672c\u5730\u65f6\u533a\uff09\uff0c\u4f20\u5165 'local' \u5219\u59cb\u7ec8\u8868\u793a\u67e5\u770b\u8005\u672c\u5730\u65f6\u533a\u3002\u60ac\u505c\u9762\u677f\u59cb\u7ec8\u662f\u53ef\u9010\u884c\u590d\u5236\u5230\u526a\u8d34\u677f\u7684\u4ea4\u4e92\u5f0f\u5361\u7247\uff0c\u8fd9\u4e9b\u914d\u7f6e\u9879\u81ea\u5b9a\u4e49\u5176\u884c\uff1b\u672a\u914d\u7f6e\u65f6\u5361\u7247\u663e\u793a\u4e00\u884c\u9ed8\u8ba4\u7684\u5b8c\u6574\u7edd\u5bf9\u65f6\u95f4\u3002\u914d\u7f6e\u540e\u7edd\u5bf9\u65f6\u95f4\u683c\u5f0f\u4e5f\u4f1a\u56e0\u6b64\u83b7\u5f97\u60ac\u505c\u9762\u677f\u3002",
    isTimezoneShown:
      '\u662f\u5426\u5728\u53ef\u89c1\u6587\u672c\u540e\u9644\u52a0\u65f6\u533a\u7f29\u5199\uff08\u4ec5 date_time \u548c time\uff1bsystem_* \u683c\u5f0f\u4e0d\u9644\u52a0\uff09\u3002',
    isLive:
      '\u76f8\u5bf9\u65f6\u95f4\u662f\u5426\u5b9e\u65f6\u66f4\u65b0\u3002',
    type: '\u6765\u81ea Text \u7684\u8bed\u4e49\u6587\u672c\u7c7b\u578b\u3002',
    size: '\u663e\u5f0f\u5b57\u4f53\u5927\u5c0f\u8986\u76d6\u3002',
    color: '\u6587\u5b57\u989c\u8272\u3002',
    weight: '\u5b57\u4f53\u7c97\u7ec6\u8986\u76d6\u3002',
  },
  usage: {
    description:
      'Timestamp formats a date or time value into human-readable text. Use it to show when something was created, updated, or is scheduled; picking relative for recency, absolute for precision, or auto to let the component decide.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the auto format in feeds and lists so recent items show "2 hours ago" and older items show the full date automatically.',
      },
      {
        guidance: true,
        description:
          'Keep formatting consistent within the same list or table; mixing relative and absolute timestamps in the same column confuses scanning.',
      },
      {
        guidance: true,
        description:
          'Enable isTimezoneShown when the audience spans multiple time zones, like a global team calendar or audit log.',
      },
      {
        guidance: true,
        description:
          "Use tooltipEntries when readers must compare zones, such as an incident log where the reader's time and the event's origin zone both matter.",
      },
      {
        guidance: true,
        description:
          'Pass timezoneID when an absolute time must read the same for every viewer and on the server, like an incident log timestamp or anything server-rendered; without it the server markup depends on the server zone.',
      },
      {
        guidance: true,
        description:
          'Label every entry once a tooltip shows more than one zone; a bare abbreviation is not always recognizable (Tokyo renders as "GMT+9", not "JST").',
      },
      {
        guidance: true,
        description:
          'Use isLive for active dashboards or real-time feeds so the relative time stays accurate without a page refresh.',
      },
      {
        guidance: true,
        description:
          'Reach for tooltipEntries when readers need to grab an exact value: an incident log or deploy record where someone pastes the UTC time or Unix seconds elsewhere; configuring entries turns the hover into copy-to-clipboard rows.',
      },
      {
        guidance: false,
        description:
          "Don't display raw Unix timestamps or ISO strings to users; always pass them through Timestamp to get a human-readable format.",
      },
      {
        guidance: false,
        description:
          'Avoid system_date or system_time formats in user-facing UI; they are meant for developer tools, logs, and machine-readable contexts.',
      },
      {
        guidance: false,
        description:
          'Don\'t disable the hover card on relative timestamps; users expect to hover for the full date when they see "3 hours ago".',
      },
      {
        guidance: false,
        description:
          "Don't stack many zones into one card; it is capped at 300px wide and long labelled lines wrap. Two or three entries read well.",
      },
      {
        guidance: false,
        description:
          'Don\'t pass a fixed-offset abbreviation like "EST" as timezoneID; it is a valid identifier but never observes daylight saving, so it reads an hour wrong for half the year. Use the region id, "America/New_York".',
      },
    ],
    anatomy: [
      {
        name: 'Formatted text',
        required: true,
        description:
          'The rendered date, time, or relative label like "2 hours ago" or "Mar 21, 2025".',
      },
      {
        name: 'Hover card',
        required: false,
        description:
          'A copyable hover card showing the full absolute date and time when the display is relative, or the rows configured via tooltipEntries. Its default single row carries the full absolute time.',
      },
      {
        name: 'Hover card row',
        required: false,
        description:
          'One row of the card: an optional label beside the instant rendered in one time zone and format. Rows opt into a copy button via isCopyable.',
      },
      {
        name: 'Copy button',
        required: true,
        description:
          "Per-row copy-to-clipboard button in the hover card; copies that row's formatted value.",
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '格式化时间戳，带 relative/absolute/auto 模式、实时更新、时区显示，以及可复制的多时区悬停卡片（默认单行完整时间，经 tooltipEntries 自定义）',
  usage: {
    description:
      'Timestamp 把日期或时间格式化为可读文本。用于创建日期、更新时间或计划；要求新近感用 relative，要求精确用 absolute，auto 自动切换。',
    bestPractices: [
      {
        guidance: true,
        description:
          '信息流和列表用 auto 格式；近期显示相对时间，较早显示 date_time。',
      },
      {
        guidance: true,
        description:
          '同一列表或表格列内保持格式一致。',
      },
      {
        guidance: true,
        description: '多时区受众用 isTimezoneShown。',
      },
      {
        guidance: true,
        description:
          '读者时间与事件时区都重要时用 tooltipEntries 对比时区。',
      },
      {
        guidance: true,
        description:
          '工具提示显示多个时区时为每个条目加标签；裸缩写不总可识别（东京渲染为 "GMT+9"，而非 "JST"）。',
      },
      {
        guidance: true,
        description: '仪表板用 isLive 让相对时间保持最新。',
      },
      {
        guidance: true,
        description:
          '读者需要获取精确值时用 tooltipEntries：事故日志或部署记录中有人要粘贴 UTC 时间或 Unix 秒；条目把悬停变成可复制到剪贴板的行。',
      },
      {
        guidance: false,
        description:
          "不要显示原始 Unix 时间戳或 ISO 字符串；始终用 Timestamp。",
      },
      {
        guidance: false,
        description:
          '面向用户的界面避免 system_* 格式；它们面向开发工具和日志。',
      },
      {
        guidance: false,
        description:
          "不要在相对时间戳上禁用悬停卡片；用户预期悬停可见完整日期。",
      },
      {
        guidance: false,
        description:
          "不要在一张卡片堆多个时区；上限 300px，长标签会换行。两三条最易读。",
      },
      {
        guidance: false,
        description:
          '不要把 "EST" 这类固定偏移 id 用作 timezoneID；它们不遵守夏令时。请用 "America/New_York" 这类区域 id。',
      },
    ],
  },
  propDescriptions: {
    value: 'Unix 秒数或 ISO 字符串的日期/时间',
    format:
      "显示模式：'relative'（locale 原生长措辞）、'relative_short'（locale 原生窄措辞）、'auto'、'date'、'date_long'、'date_weekday'、'date_time'、'time'、'system_date'、'system_date_time'、'system_time'、'unix_seconds'；带日期的格式使用 provider 历法，system_* 与 time 不使用",
    autoThreshold: 'auto 从 relative 切换到 date_time 的阈值秒数',
    hasTooltip:
      '悬停或键盘聚焦时显示可复制的完整时间悬停卡片（relative 模式，或配置 tooltipEntries 的任何格式）',
    tooltipEntries:
      "跨时区/格式的悬停行：[{timezoneID?, format?, label?}]；没有 timezoneID 的条目在设置了 Timestamp timezoneID 时遵循它，否则用查看者时区（'local' 始终表示查看者时区），format 默认 'full'；悬停面板始终是可复制到剪贴板的卡片，这些配置自定义其行（默认单行完整时间），配置条目也会在绝对格式上启用卡片",
    isTimezoneShown:
      '在可见文本后附加时区缩写（仅 date_time 和 time）',
    isLive: '实时更新相对时间',
    type: 'Text 语义化类型',
    size: '字号覆盖',
    color: '文本颜色',
    weight: '字重覆盖',
  },
};
