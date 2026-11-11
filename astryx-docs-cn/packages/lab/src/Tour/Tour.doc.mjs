// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Tour',
  displayName: 'Tour',
  category: 'Feedback & Status',
  keywords: ['tour', 'nux', 'onboarding', '引导', 'walkthrough', '分步演示', 'product tour', '产品导览', 'coachmark', '教练标记', 'spotlight', '聚光高亮', 'guide', '指南', 'feature step', '功能步骤', 'step', '步骤', 'Tour'],
  description:
    '引导式产品导览（NUX / onboarding）。Tour 是一个控制器，带领用户按顺序浏览一系列锚定在页面元素上的聚光提示框。它自身不渲染任何外观；它拥有活动步骤状态，并与声明式嵌套的 TourStep 子组件共享（步骤顺序跟随子组件）。实验性：先在 lab 落地（meta/astryx#4239）。',
  components: [
    {
      name: 'Tour',
      displayName: 'Tour',
      description:
        '引导导览的控制器。在其 TourStep 子组件间协调活动步骤，提供 advance / retreat / complete / dismiss，并可选地将活动步骤周围的页面调暗（聚光镂空）。经 isActive 受控：“该用户是否看过导览？”由使用方掌控。',
      props: [
        {
          name: 'isActive',
          type: 'boolean',
          description:
            '导览是否正在运行。为 false 时不渲染任何内容，导览重置到第一步，因此下次激活时干净地重新开始。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '导览步骤：TourStep 元素。步骤顺序跟随此处的排列；只有活动步骤渲染其提示框。',
          slotElements: [{__element: 'TourStep', props: {heading: 'Step'}, children: 'Step body'}],
        },
        {
          name: 'onDismiss',
          type: '(source: TourDismissSource) => void',
          description:
            "每次退出时以原因调用（'backdrop' | 'escape' | 'close' | 'skip' | 'complete'）。使用方在响应中将 isActive 置为 false，并可按来源分支，区分成功完成与提前退出。",
          required: true,
        },
        {
          name: 'hasBackdrop',
          type: 'boolean',
          description:
            '以聚光镂空方式调暗活动步骤周围的页面：目标保持明亮，其余部分变暗。用于要求专注的模态式步骤；仅圈出目标的轻量教练标记则保持关闭。',
          default: 'false',
        },
        {
          name: 'isStepCountShown',
          type: 'boolean',
          description: '在每个步骤中显示步骤计数（“2 of 5”）。',
          default: 'false',
        },
      ],
    },
    {
      name: 'TourStep',
      displayName: 'Tour Step',
      description:
        '单个聚光步骤。以独立 overlay 绘制的圆环高亮目标元素（绝不重设目标样式），并渲染锚定其上的提示框（经核心 Popover），含标题、正文、可选步骤进度和 back / next / close 控件。挂载时向父级 Tour 注册，仅在活动时渲染其提示框。',
      props: [
        {
          name: 'targetRef',
          type: 'RefObject<HTMLElement>',
          description:
            '指向本步骤目标元素的 ref。提示框像 Popover 触发器一样锚定其上；必须是 <button> 或 [role="button"] 元素（Popover 的 anchorRef 契约）。',
          required: true,
        },
        {
          name: 'heading',
          type: 'ReactNode',
          description: '步骤标题。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '步骤正文内容。',
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description: '提示框位于目标的哪一侧。',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '提示框沿放置侧的对齐方式（如 placement="below" 时：start 在目标下方左对齐，center 居中，end 右对齐）。',
          default: "'start'",
        },
      ],
    },
  ],
  usage: {
    description:
      '用 Tour 介绍功能，或带用户走完 UI 的几个关键部分。由 TourStep 子组件组合而成，每个经 targetRef 指向一个元素；Tour 用 Next/Back 在步骤间前进，以 Done 结束。它是受控的：把 isActive 保存在你自己的状态里，并自行持久化“是否看过此导览”（组件只经 onDismiss 上报退出）。构建于现有 Popover/Layer 锚定与 overlay 令牌之上，而非定制的定位引擎。',
    bestPractices: [
      { guidance: true, description: '导览保持简短：几个高价值步骤。长导览会被跳过。' },
      { guidance: true, description: '自行持久化完成状态（来自 onDismiss），避免用户每次访问都看到同一导览。' },
      { guidance: true, description: '每步指向稳定可见的元素；在其步骤激活前确保目标在屏幕内。' },
      { guidance: false, description: '不要把必须看到的关键信息藏在导览步骤后；用户可能将其关闭；关键信息应内联呈现。' },
      { guidance: false, description: '不要用导览替代清晰的 UI；修复令人困惑的界面，而不是为其配音解说。' },
    ],
  },
};
