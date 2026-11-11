// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Elapsed time',
    required: true,
    description:
      '包含标准化已用时长的语义化 time 元素。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Timer',
  displayName: 'Timer',
  category: 'Content',
  keywords: [
    'timer',
    'elapsed',
    'duration',
    'seconds',
    'minutes',
    'hours',
    '秒表',
    '等待',
    'loading',
    '处理中',
  ],
  props: [
    {
      name: 'startTime',
      type: 'number',
      description:
        '被计量操作开始时的 Unix 毫秒时间。省略则从本 Timer 挂载时开始。',
    },
    {
      name: 'format',
      type: "'elapsed' | 'clock'",
      description:
        '标准化的时长表示。elapsed 使用紧凑单位并在一小时后略去秒；clock 使用 m:ss 或 h:mm:ss。',
      default: "'elapsed'",
    },
    {
      name: 'type',
      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
      description:
        '语义化文本类型。排版行为与 Timestamp 相同。',
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
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'Text 包装器的 StyleX 样式。必须是 stylex.create() 的值。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Text 包装器的 CSS 类名。样式建议用 xstyle。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Text 包装器的内联样式。样式建议用 xstyle。',
    },
  ],
  examples: [
    {
      label: '已用时长',
      code: '<Timer />',
    },
    {
      label: '秒表时钟',
      code: '<Timer format="clock" />',
    },
    {
      label: '在挂载前开始的操作',
      code: '<Timer startTime={operationStartedAt} />',
    },
    {
      label: '匹配周围文本',
      code: `<Text>
  Processing for <Timer type="inherit" color="inherit" />
</Text>`,
    },
    {
      label: '醒目的已用时间',
      code: '<Timer type="body" size="lg" color="primary" weight="semibold" />',
    },
  ],
  theming: {
    targets: [{className: 'astryx-timer'}],
  },
  usage: {
    anatomy,
    description:
      '为进行中的工作显示标准化的已用时长，而不用在每个 tick 都调度 React 渲染。elapsed 格式在一小时内按秒更新，一小时后按分钟更新；clock 格式保持秒级精确。',
    bestPractices: [
      {
        guidance: true,
        description:
          '对可能跨秒、分钟或小时的紧凑时长文本使用 elapsed。',
      },
      {
        guidance: true,
        description:
          '对小时后秒数仍有意义的秒表式界面使用 clock。',
      },
      {
        guidance: true,
        description:
          '当操作在 Timer 挂载前就已开始时传入 startTime，使显示反映完整的等待时长。',
      },
      {
        guidance: false,
        description:
          '不要用 Timer 表示日期、时区或相对日历用语；请改用 Timestamp。',
      },
      {
        guidance: false,
        description:
          '除非每个 tick 都播报一次适合特定任务，否则不要添加 aria-live。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '标准化已用时长或秒表时长，采用源自时钟的、不触发渲染的 DOM 更新。',
  propDescriptions: {
    startTime:
      '操作开始的 Unix 毫秒时间；省略则从 Timer 挂载起计',
    format: 'elapsed 紧凑单位或 clock 秒表记法',
    type: '语义化文本类型；与 Timestamp 一样默认 supporting',
    size: '显式字号覆盖',
    color: '文本颜色；与 Timestamp 一样默认 secondary',
    weight: '字重覆盖',
    xstyle: 'Text 包装器的 StyleX 样式',
    className: 'Text 包装器的 CSS 类',
    style: 'Text 包装器的内联样式',
  },
  usage: {
    anatomy,
    description:
      '当周期性 React 渲染会带来可避免的开销时，用于进行中操作的已用时间。',
    bestPractices: [
      {
        guidance: true,
        description:
          '紧凑时长用 elapsed，秒表 UI 用 clock。',
      },
      {
        guidance: true,
        description: '挂载前开始的工作传入 startTime。',
      },
      {
        guidance: false,
        description: '日期和相对日历用语请用 Timestamp。',
      },
    ],
  },
};
