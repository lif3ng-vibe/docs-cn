// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Step',
  subComponentOf: 'Stepper',
  displayName: 'Step',
  group: 'Stepper',
  category: 'Navigation',
  isHiddenFromOverview: true,
  description:
    "Stepper 内的单个步骤。渲染一段进度条、一个指示器以及带可选描述的标签。进度（已完成/进行中/未开始）由父 Stepper 的 activeStep 与本步骤的 step 索引推导。",
  props: [
    {
      name: 'step',
      type: 'number',
      description:
        '本步骤的从零开始索引。用于相对于父级 activeStep 推导进度（已完成/进行中/未开始）。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '步骤标签文本。当步骤比标签窄时保持单行并省略显示，使一行水平步骤保持等高、其下的进度轨道保持平直。完整字符串仍会作为步骤的一部分被读出，因此标签被截断不会损失无障碍名称——但短标签在窄布局下表现更好。',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        '显示在标签下方的可选描述，用于补充上下文。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '渲染在标签和描述下方的内容。在垂直 Stepper 中适合放表单字段或详细的步骤内容。在紧凑水平 Stepper 中，内容会随展开的步骤细节一起隐藏，但保持挂载以保留本地状态。',
    },
    {
      name: 'status',
      type: "'accent' | 'success' | 'warning' | 'error'",
      description:
        '步骤的语义颜色。只控制颜色并映射到 Astryx 全局语义 token。不设置时使用由进度推导的默认着色。',
    },
    {
      name: 'indicator',
      type: "'auto' | 'number' | 'none' | ReactNode",
      description:
        "步骤指示器显示什么。'auto' 在完成前显示数字、完成后显示对勾；'number' 始终显示数字徽章；'none' 隐藏指示器；也可传任意 ReactNode（如 Icon）实现完全自定义。",
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
      default: "'auto'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用交互，并使步骤指示器与标签变暗。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '将步骤标记为可选，在标签后附加 Optional 标识。',
      default: 'false',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '渲染在标签行末尾的尾部内容。',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description:
        '控制步骤的垂直内边距。不设置时回退到 Stepper 层级的 density。',
    },
  ],
  // A Step reads its progress from the parent Stepper's context and throws
  // without one, so the preview needs a real Stepper around it. Without this
  // block Step inherits Stepper's playground, which renders it bare and hands
  // it the parent's `activeStep`. The wrapper is vertical because that is the
  // orientation where one step shows its whole anatomy — indicator, label, and
  // description stacked — and `step` matches the wrapper's `activeStep` so the
  // preview opens on the current step rather than an inert upcoming one.
  playground: {
    wrapper: {
      component: 'Stepper',
      props: {activeStep: 1, orientation: 'vertical'},
    },
    defaults: {
      step: 1,
      label: '账单地址',
      description: '用于发票与税务',
    },
  },
};
