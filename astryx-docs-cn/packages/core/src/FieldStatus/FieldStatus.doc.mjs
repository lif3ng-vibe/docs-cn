// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Message box',
    required: true,
    description: '承载校验反馈的绘制容器。',
  },
  {
    name: 'Detached icon',
    required: false,
    description: '仅 detached 变体显示的前置状态图标。',
  },
  {
    name: 'Message text',
    required: true,
    description: '描述校验状态的文本。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'FieldStatus',
  displayName: 'Field Status',
  group: 'Field',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  description:
    '表单字段校验反馈的状态消息组件。消息通过持久 live region 播报给屏幕阅读器（错误为 assertive，其余为 polite），因此条件挂载是安全的。',
  theming: {
    targets: [
      {className: 'astryx-field-status', visualProps: ['type', 'variant']},
      {className: 'astryx-field-status-icon', visualProps: ['type']},
    ],
  },
  props: [
    {
      name: 'type',
      type: "'error' | 'warning' | 'success'",
      description: '状态类型。',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: '状态消息文本。',
      required: true,
    },
    {
      name: 'id',
      type: 'string',
      description: '用于 aria-describedby 关联的 ID。',
    },
    {
      name: 'variant',
      type: "'attached' | 'detached'",
      description:
        '视觉变体：attached 叠放在输入框上，detached 浮于下方。',
      default: "'attached'",
    },
  ],
  usage: {
    description:
      'FieldStatus 为字段及类字段控件渲染校验反馈。自定义控件需要与 Field 相同的 error、warning 或 success 呈现时，可直接使用它。',
    bestPractices: [
      {
        guidance: true,
        description:
          '消息属于该输入框时，在带边框输入框下方使用 attached 状态。',
      },
      {
        guidance: true,
        description:
          '复选框、开关以及叠放会显得别扭的自定义控件，使用 detached 状态。',
      },
      {
        guidance: false,
        description:
          '不要用 FieldStatus 做通用提醒或页面级通知；请改用 Banner 或 Toast。',
      },
      {
        guidance: true,
        description:
          "字段状态的播报时机是它首次出现以及消息或类型变化时；重复提交带着相同错误失败时不会再次播报。这种重复提交且错误未变的情况下，由表单用 useAnnounce 播报一次，例如 announce(`${errors.length} errors. ${errors[0]}`, 'assertive')，并把焦点移到第一个无效字段。首次提交失败时各字段会自行播报错误，表单不再额外播报。",
      },
    ],
    anatomy,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '面向字段/自定义控件的校验反馈消息。支持 error、warning、success 以及 attached/detached 变体。通过持久 live region 播报（错误为 assertive，其余为 polite）。',
  usage: {
    bestPractices: [
      {
        guidance: true,
        description:
          '消息属于该输入框时，在带边框输入框下方使用 attached 状态。',
      },
      {
        guidance: true,
        description:
          '复选框、开关以及叠放显得别扭的自定义控件，使用 detached 状态。',
      },
      {
        guidance: false,
        description:
          '不要用 FieldStatus 做通用提醒或页面级通知；请改用 Banner 或 Toast。',
      },
      {
        guidance: true,
        description:
          '状态仅在出现以及消息/类型变化时播报。重复提交且错误未变时，由表单通过 useAnnounce 播报一次（错误数 + 第一个错误），并聚焦第一个无效字段。',
      },
    ],
    anatomy,
  },
  propDescriptions: {
    type: 'error/warning/success 状态色调',
    message: '可见的校验反馈文本',
    id: '用于 aria-describedby 关联的 id',
    variant: 'attached 叠放于输入框上；detached 浮于下方',
  },
};
