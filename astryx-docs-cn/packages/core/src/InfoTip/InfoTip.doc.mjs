// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Trigger button',
    required: true,
    description:
      '由 `label` 命名的小圆形原生按钮，可预览并固定帮助内容。',
  },
  {
    name: 'Info icon',
    required: true,
    description:
      '图标注册表中 `size` 尺寸的 `info` 图稿；主题可以替换。',
  },
  {
    name: 'Help surface',
    required: true,
    description:
      '帮助显示期间展示 `content` 的工具提示表面。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'InfoTip',
  displayName: 'Info Tip',
  // Keeps the registry route InfoTip had as a canary-only Lab component.
  registry: {aliases: ['lab/info-tip']},
  category: 'Feedback & Status',
  keywords: [
    'info',
    'tooltip',
    'help',
    'hint',
    'affordance',
    'icon',
    'label',
    'field',
    'metric',
    'definition',
    '信息提示',
    '帮助',
  ],
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        '工具提示中显示的内容。通常为简短的非交互文本。与 Tooltip 的 content 属性一致。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '触发按钮的无障碍名称。默认为翻译后的 "More information"。',
      default: "'More information'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        '信息图标的尺寸（12px、16px、20px、24px）。与 Icon 尺寸一一对应。',
      default: "'sm'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  usage: {
    anatomy,
    description:
      '揭示帮助信息的信息图标：一个小 "i" 按钮。悬停和键盘聚焦时预览帮助，点击、轻点、Enter 或 Space 会将其固定打开，直到 Escape、再次按下、点击外部或焦点离开。放在标签、数值和指标旁，用于权限说明、指标定义和字段帮助。相比在 Tooltip 里手动组合 Icon，它的价值在于预先接好的无障碍触发器：带 aria-label 的真实按钮、Tab 可达、悬停/聚焦/轻点都会显示工具提示、Escape 可关闭。它遵循 toggletip 模式：帮助固定期间按钮报告 `aria-expanded="true"`，固定时屏幕阅读器播报一次帮助内容。',
    bestPractices: [
      {
        guidance: true,
        description:
          '工具提示内容保持简短、平实、非交互；链接和按钮请用 Popover 或 HoverCard。',
      },
      {
        guidance: true,
        description:
          '"More information" 太笼统时覆盖 label，如 "关于此指标"。',
      },
      {
        guidance: true,
        description:
          '触屏上依赖 InfoTip 而不是手搓信息按钮：按下即固定帮助，因此轻点、点击、Enter 或 Space 都会固定工具提示（即使触发器是按钮），点击外部关闭。',
      },
      {
        guidance: false,
        description:
          '不要为信息提示手动在 Tooltip 里组合 Icon；裸 Icon 是 aria-hidden 且不可聚焦，键盘和屏幕阅读器用户永远看不到它。',
      },
      {
        guidance: false,
        description:
          '不要用 InfoTip 承载用户完成任务必须看到的信息；这类文本请直接内联放置。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'InfoTip',
  displayName: 'Info Tip',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        '工具提示中显示的内容。通常为简短的非交互文本。与 Tooltip 的 content 属性一致。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '触发按钮的无障碍名称。默认为翻译后的“More information”。',
      default: "'More information'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        '信息图标的尺寸（12px、16px、20px、24px）。与 Icon 尺寸一一对应。',
      default: "'sm'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是内联样式对象如 style={{}}。',
    },
  ],
  usage: {
    anatomy,
    description:
      'An info icon that reveals help: a small "i" button. Hover and keyboard focus preview the help, and a click, tap, Enter, or Space pins it open until Escape, a second press, a press outside, or focus leaving. Use it next to labels, values, and metrics for permission notes, metric definitions, and field help.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep tooltip content concise, plain, and non-interactive; use Popover or HoverCard for links and buttons.',
      },
      {
        guidance: true,
        description:
          'Override label when "More information" is too generic, e.g. "About this metric".',
      },
      {
        guidance: true,
        description:
          'Rely on InfoTip rather than a hand-rolled info button on touch: it pins its help on a press, so a tap, a click, Enter, or Space pins the tooltip even though the trigger is a button, and a tap outside dismisses it.',
      },
      {
        guidance: false,
        description:
          'Hand-compose Icon inside Tooltip for info affordances; the bare Icon is aria-hidden and unfocusable, so keyboard and screen-reader users never see it.',
      },
      {
        guidance: false,
        description:
          'Use InfoTip for essential information users must see to complete a task; put that text inline instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '行内信息图标帮助提示：预接好工具提示的无障碍 "i" 按钮触发器。',
  usage: {
    description:
      '一个小 "i" 按钮：悬停和键盘聚焦预览帮助；点击、轻点、Enter 或 Space 固定打开。放在标签、数值和指标旁，用于权限说明、指标定义和字段帮助。预接好的无障碍触发器：真实按钮、aria-label、Tab 可达、悬停/聚焦/轻点均显示工具提示、Escape 关闭。toggletip 模式：固定期间 aria-expanded="true"；固定时帮助播报一次。',
    bestPractices: [
      {
        guidance: true,
        description:
          '工具提示内容保持简短、平实、非交互；链接和按钮请用 Popover 或 HoverCard。',
      },
      {
        guidance: true,
        description:
          '"More information" 太笼统时覆盖 label，如 "关于此指标"。',
      },
      {
        guidance: true,
        description:
          '触屏上依赖 InfoTip 而不是手搓信息按钮：按下即固定帮助，因此轻点、点击、Enter 或 Space 都会固定工具提示（即使触发器是按钮），点击外部关闭。',
      },
      {
        guidance: false,
        description:
          '不要为信息提示手动在 Tooltip 里组合 Icon；裸 Icon 是 aria-hidden 且不可聚焦。',
      },
      {
        guidance: false,
        description:
          '不要用 InfoTip 承载用户完成任务必须看到的信息；这类文本请直接内联放置。',
      },
    ],
  },
  propDescriptions: {
    content:
      '工具提示内容。简短的非交互文本。与 Tooltip 的 content prop 一致。',
    label:
      "触发按钮的无障碍名称。默认：翻译后的 'More information'。",
    size: '信息图标尺寸（12/16/20/24px）。与 Icon 尺寸一一对应。',
  },
};
