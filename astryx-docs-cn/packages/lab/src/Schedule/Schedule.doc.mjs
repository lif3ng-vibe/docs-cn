// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Schedule',
  displayName: 'Schedule',
  group: 'Schedule',
  category: 'Content',

  usage: {
    description:
      'Schedule 是一个日历表面，把事件渲染为月网格、日或周时间网格，或按天分组的列表：布局来自你传入的 view 对象。它处理带时区的日期运算、区间之间的翻页和异步事件加载，并暴露头部插槽供插件填充导航控件。用它显示既有的日程；用 renderPopover 构建周、日或月视图，让人们在与视图管理的 popover 中打开事件详情。它没有事件选择、创建或编辑能力。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把渲染的日期保存在状态里并接到 onChangeDate。Schedule 从不自行推进日期，缺少该处理器时内置的上一页/今天/下一页控件会渲染但毫无动作。',
      },
      {
        guidance: true,
        description:
          '让视图匹配数据密度：月网格适合一眼看全局负载；开始和结束时间重要时用日或周时间网格；日程稀疏时用列表。',
      },
      {
        guidance: true,
        description:
          '把 Schedule 包在 InternationalizationProvider 中，选择其日期与时间标签使用的语言、数字和字段顺序；provider 的 calendar（如 calendar="persian"）会用另一种历法书写这些标签。Schedule 的日期值、网格和日期导航在任何历法与 locale 下都保持公历。',
      },
      {
        guidance: true,
        description:
          '给每个事件一个与 categories 条目匹配的类别字符串，使其颜色有意义且屏幕阅读器播报类别名。未匹配的名称仍会渲染，但总是蓝色。',
      },
      {
        guidance: false,
        description:
          '不要在用户需要挑选日期时使用 Schedule。它没有选择模型；请用 DateInput、DateRangeInput 或 Calendar。',
      },
      {
        guidance: false,
        description:
          '不要只靠事件颜色传达含义。只有十种颜色，类别集合较大时会重复；无障碍标签已播报标题、类别和时间。',
      },
      {
        guidance: true,
        description:
          '当页面已用自己的控件翻页区间时，把 date 留在你的状态里并传 plugins={[]}：Schedule 只渲染区间标题而不带自己的控件，你的控件调用与 onChangeDate 相同的 setter。',
      },
      {
        guidance: false,
        description:
          '若仍需要 Schedule 的上一页、今天和下一页控件，不要传缺少 useSchedulePaginationPlugin 的自定义 plugins 数组；自定义数组是替换默认集合，不是扩展它。',
      },
    ],
    anatomy: [
      {
        name: 'Header start slot',
        required: false,
        description:
          '头部起始区域，由插件填充。默认插件集合在此渲染上一页 / 今天 / 下一页按钮组。',
      },
      {
        name: 'Header title',
        required: true,
        description:
          '二级标题，命名屏幕上的区间，如 "May 2026"。同一段文字也是日程区域的无障碍名称。',
      },
      {
        name: 'Loading spinner',
        required: false,
        description:
          '异步事件加载器仍在进行时显示在标题旁，标签为 "Loading events"。',
      },
      {
        name: 'Header end slot',
        required: false,
        description:
          '头部末尾区域，默认为空。视图选择器插件在此渲染其菜单。',
      },
      {
        name: 'View body',
        required: true,
        description:
          '视图渲染的内容：月网格、带小时边距和全天行的日/周时间网格，或按天标题分组的列表。网格视图暴露 ARIA grid、columnheader 和 gridcell 角色并标记 aria-readonly。日/周时间网格在一个可键盘到达、以区间命名的区域内滚动；列滚动时其日头部、全天行和小时边距保持固定。全天行还容纳持续 24 小时或更长的限时事件，表现为横跨其各天的一个跨度。',
      },
      {
        name: 'Event',
        required: false,
        description:
          '每个事件一个胶囊（网格视图）或带色点的行（列表视图），按类别着色，过去的事件变暗。在日和周网格中，同一时间发生的事件并排共享一列；视图经 renderPopover 构建时，每个有内容的事件是一个打开视图 popover 的按钮。月网格中一周最多显示三层条目；繁忙的一天显示两个条目和一个 "+N more" 按钮，打开列出当天全部事件的 popover。月条目以标题开头；限时事件的开始时间仅在两者都放得下时跟随其后。月视图经 renderPopover 构建时，每个有内容的条目都是打开与其当天 "+N more" 相同 popover 的按钮，条目覆盖的后续每一天都会为屏幕阅读器命名其事件。',
      },
      {
        name: 'Current time line',
        required: false,
        description:
          '日或周时间网格中当前时间的一条线，仅出现在当天。每分钟更新一次，服务器渲染期间不存在。渲染区间包含今天时，网格每个区间首次打开时滚动到此线前一小时（钳制在网格内），之后保持滚动位置不变，直到翻到另一区间或切换视图。',
      },
    ],
  },

  props: [
    {
      name: 'view',
      type: 'ScheduleView<Options>',
      description:
        '拥有布局以及每页覆盖日期区间的 view 对象。用 createScheduleMonthlyView、createScheduleWeeklyView、createScheduleDayView 或 createScheduleListView 构建；每个工厂接受自己的选项（weekStartsOn、minHour/maxHour/hourHeight、days）。周、日和月工厂还接受 renderPopover(event)：返回事件的内容，视图就把该事件渲染为打开其管理的 popover 的按钮——视图共用一个 popover，以事件标题命名，带系统标准表面、内边距、Escape 与轻拂关闭以及焦点归还；返回 null 则事件保持只读。月视图中该 popover 也显示繁忙一天的事件列表，列表中的一行就地打开其事件。列表视图没有交互选项。',
      required: true,
    },
    {
      name: 'events',
      type: 'ReadonlyArray<CalendarEvent> | ((start: Instant, end: Instant) => Promise<ReadonlyArray<CalendarEvent>>)',
      description:
        '静态数组（过滤出与渲染区间重叠的事件并按开始时间排序），或以区间开始与结束的 epoch 毫秒调用的加载器。加载器进行中会挂起；头部显示加载指示，视图渲染为空。结果按加载器身份与区间缓存，因此保持加载器引用稳定（useCallback），否则每次重渲染都会重新请求。页面已持有事件时直接传数组；Schedule 无需加载器即可挑出各区间的 events。',
      required: true,
    },
    {
      name: 'categories',
      type: "ReadonlyArray<{label: string, color: 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'}>",
      description:
        '按 label === event.category 与每个事件匹配的类别定义。匹配结果提供事件的颜色以及无障碍标签中的类别名。类别没有对应条目的事件保留该名称但回退为蓝色；无类别的事件以蓝色播报为 "Event"。类别可以代表任何你按其着色的分组——事件种类、日历或团队；要按日历着色，就给每个日历一个条目。',
      default: '[]',
    },
    {
      name: 'date',
      type: 'Instant',
      description:
        '落在待渲染区间内任意位置的 Unix epoch 毫秒；视图把它扩展为完整的月、周、日或列表窗口。完全受控；Schedule 从不改变它，请与 onChangeDate 搭配。',
      required: true,
    },
    {
      name: 'focusDate',
      type: 'Instant',
      description:
        '标记被视为“今天”的日期的 Unix epoch 毫秒：月、周和日视图中该单元格获得 aria-current="date" 和高亮样式。列表视图忽略它。省略时在挂载时捕获一次，之后不再推进。',
      default: 'Date.now() at mount',
    },
    {
      name: 'onChangeDate',
      type: '(date: Instant) => void',
      description:
        '分页插件向后或向前翻页或按下 Today 时，以下一步要渲染的 epoch 毫秒调用。翻页保留一天中的时刻；Today 传入当前时刻。',
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        '用于所有日期计算和所有格式化标签的 IANA 时区 ID（如 "America/Los_Angeles"），改变时同一批事件会重新跨天分组。',
      default: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
    },
    {
      name: 'plugins',
      type: 'ReadonlyArray<SchedulePlugin>',
      description:
        '头部插件，按顺序应用；每个插件可以包裹或替换头部起始、中部和末尾内容。提供数组会替换默认分页控件；同时组合 useSchedulePaginationPlugin 和 useScheduleViewSelectorPlugin 可两者兼得。',
      default: 'defaultSchedulePlugins',
    },
    {
      name: 'headingLevel',
      type: '2 | 3 | 4 | 5 | 6',
      description:
        '日程内部子标题的标题级别（网格视图中的星期与日列头，列表视图中的天标题），让日程在周围页面大纲下正确嵌套。头部区间标题始终是二级标题。',
      default: '3',
    },
  ],
};
