// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Stat',
  displayName: 'Stat',
  category: 'Content',
  keywords: ['stat', 'kpi', '指标', 'metric', '数值', 'number', 'value', 'delta', '变化', 'trend', '趋势', 'dashboard', '仪表盘', 'statistic', '统计', 'measure', '度量', 'Stat'],
  props: [
    {
      name: 'label',
      type: 'string',
      description: '显示在数值上方的指标名称，例如 "Total requests"。',
      required: true,
    },
    {
      name: 'value',
      type: 'ReactNode',
      description:
        '大号显示的核心指标，使用等宽数字。请传入预先格式化的字符串，如 "1.2M"。',
      required: true,
    },
    {
      name: 'delta',
      type: "{value: string, direction: 'up' | 'down' | 'flat', sentiment?: 'positive' | 'negative' | 'neutral'}",
      description:
        '数值旁的变化指示：上升/下降/持平图标加彩色文本。sentiment 可覆盖默认的方向颜色映射（up=positive、down=negative、flat=neutral），用于错误率等反向指标。',
    },
    {
      name: 'description',
      type: 'string',
      description:
        '数值下方的弱化辅助说明，例如 "vs. previous 30 days"。',
    },
    {
      name: 'media',
      type: 'ReactNode',
      description:
        '渲染在文本内容下方的趋势插槽，例如迷你折线图。Stat 本身不渲染图表。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控制数值字号的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-stat', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      '用于仪表盘和汇总行的 KPI/指标展示：指标名、大号等宽数字数值、可选的带情感倾向的变化指示、辅助描述，以及放置迷你折线图的 media 插槽。在 Grid 中组合多个 Stat 构成 KPI 行。',
    bestPractices: [
      { guidance: true, description: 'value 和 delta 传入预先格式化的字符串（“1.2M”、“+12.4%”）；Stat 不做数字格式化。' },
      { guidance: true, description: '对下降才好的反向指标（如错误率或延迟），显式设置 `sentiment`。' },
      { guidance: true, description: '把 Stat 包在 Card 中，用 Grid columns={{minWidth: 240, max: 4}} 排布 KPI 行。' },
      { guidance: false, description: '不要在 media 插槽放全尺寸图表；它适合紧凑的迷你折线图或趋势符号。' },
      { guidance: false, description: '不要只靠 delta 颜色传达含义；方向符号和屏幕阅读器文本也承载含义。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Stat',
  displayName: 'Stat',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '显示在数值上方的指标名称，例如 "Total requests"。',
      required: true,
    },
    {
      name: 'value',
      type: 'ReactNode',
      description:
        '大号显示的核心指标，使用等宽数字。请传入预先格式化的字符串，如 "1.2M"。',
      required: true,
    },
    {
      name: 'delta',
      type: "{value: string, direction: 'up' | 'down' | 'flat', sentiment?: 'positive' | 'negative' | 'neutral'}",
      description:
        '数值旁的变化指示：上升/下降/持平图标加彩色文本。sentiment 可覆盖默认的方向颜色映射（up=positive、down=negative、flat=neutral），用于错误率等反向指标。',
    },
    {
      name: 'description',
      type: 'string',
      description: '数值下方的弱化辅助说明，例如 "vs. previous 30 days"。',
    },
    {
      name: 'media',
      type: 'ReactNode',
      description:
        '渲染在文本内容下方的趋势插槽，例如迷你折线图。Stat 本身不渲染图表。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控制数值字号的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-stat', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      'A KPI/metric display for dashboards and summary rows: metric name, large tabular-nums value, an optional sentiment-aware delta, a supporting description, and a media slot for a sparkline or mini chart. Compose several in a Grid for a KPI row.',
    bestPractices: [
      { guidance: true, description: 'Pass pre-formatted strings for value and delta ("1.2M", "+12.4%"); Stat does not format numbers.' },
      { guidance: true, description: 'Set `sentiment` explicitly for inverted metrics where down is good, like error rate or latency.' },
      { guidance: true, description: 'Wrap Stat in a Card and lay out KPI rows with Grid columns={{minWidth: 240, max: 4}}.' },
      { guidance: false, description: 'Put a full-size chart in the media slot; it is meant for compact sparklines or trend glyphs.' },
      { guidance: false, description: 'Rely on delta color alone to convey meaning; the direction glyph and screen-reader text carry it too.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'KPI/指标展示：标签、大号等宽数字数值、带情感倾向的变化指示和趋势媒体插槽。',
  usage: {
    description:
      '用于仪表盘和汇总行的 KPI/指标展示：指标名、大号等宽数字数值、可选的带情感倾向的变化指示、辅助描述，以及放置迷你折线图的 media 插槽。在 Grid 中组合多个 Stat 构成 KPI 行。',
    bestPractices: [
      { guidance: true, description: 'value 和 delta 传入预先格式化的字符串（“1.2M”、“+12.4%”）；Stat 不做数字格式化。' },
      { guidance: true, description: '对下降才好的反向指标（如错误率或延迟），显式设置 `sentiment`。' },
      { guidance: true, description: '把 Stat 包在 Card 中，用 Grid columns={{minWidth: 240, max: 4}} 排布 KPI 行。' },
      { guidance: false, description: '不要在 media 插槽放全尺寸图表；它适合紧凑的迷你折线图或趋势符号。' },
      { guidance: false, description: '不要只靠 delta 颜色传达含义；方向符号和屏幕阅读器文本也承载含义。' },
    ],
  },
  propDescriptions: {
    label: '数值上方的指标名称。',
    value: '预先格式化的核心指标；等宽数字。',
    delta: '方向符号 + 彩色变化文本；sentiment 覆盖方向颜色。',
    description: '数值下方的弱化辅助行。',
    media: '文本下方的趋势插槽（迷你折线图/小图表）。',
    size: "数值字号：'sm' | 'md' | 'lg'。",
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值。',
  },
};
