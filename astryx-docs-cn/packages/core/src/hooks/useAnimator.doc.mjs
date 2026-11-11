// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useAnimator',
  displayName: 'useAnimator',
  keywords: [
    'animate',
    'animation',
    'animator',
    'spring',
    'decay',
    'momentum',
    'fling',
    'motion',
    'transform',
    'opacity',
    'drag',
    'card',
    '动画',
    '弹簧',
  ],
  params: [
    {
      name: 'ref',
      type: 'RefObject<HTMLElement | null>',
      description:
        '要动画的那一个元素的 ref，即你传给元素本身的同一个 ref：其他 hook (如手势 hook) 也可以接它，让拖拽与动画共享一个元素。每次渲染后 animator 跟随其背后的元素。元素卸载时运动停止、值回到静息，因此重新挂载从静息开始，替换它的节点同样如此。元素挂载前及卸载期间，一切调用无效果，`animate` 与 `decay` 立即 resolve。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'animator',
      type: 'AnimatorHandle',
      description:
        '元素的 animator，每次渲染都是同一个对象：`animate(target, {velocity?})` 以 Astryx 组件所用的状态变化动效把通道弹簧到目标，`decay(velocity)` 从释放速度滑行减速，`set(values)` 跳变，`get()` 与 `getVelocity()` 读取，`stop()` 停止。通道为 `x` 与 `y` (px)、`scale` (元素原始尺寸为 1)、`rotate` (度) 与 `opacity` (0 到 1)。`animate` 与 `decay` 返回运动结束时 resolve 的 promise。调用它绝不会触发组件重渲染。ref 挂接前的调用无效果并立即 resolve。',
    },
  ],
  usage: {
    description:
      '以 Astryx 自家组件所用的动效为单个元素做动画。调 `animator.animate` 以状态变化动效把元素弹簧到新值，`animator.decay` 以释放的滚动视图动量甩出元素，`animator.set` 直接移动它——卡片因此可以跟随手指、回弹、被甩走。要在条目变化时为区域布局做动画，用 `useAnimatedLayout`；组件已内置的动画 (如 sheet 的档位或轮播的吸附) 请用组件自身的 prop。React 外请用 `createAnimator`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '从事件处理器与 effect 中调用 animator：它活在渲染之外，动画绝不触发组件重渲染。',
      },
      {
        guidance: true,
        description:
          '每个跟随拖拽的 `animate` 都以释放速度起始，让元素延续被甩出的状态。',
      },
      {
        guidance: true,
        description:
          '动画呈现的每个状态也要有不靠动画即可到达的途径：调用同样代码的按键、按钮或菜单项。',
      },
      {
        guidance: false,
        description:
          '不要把动画值存进 React state；需要时用 `animator.get()` 读取。',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        description:
          'animator 移动元素，但不提供操作途径。动画所代表的每个操作都要有键盘与屏幕阅读器可及的控件 (如丢弃卡片的按钮)，并让它调用 `animate`——减弱动效下会原地淡入。`decay` 只用于用户亲手做出的甩动：减弱动效保留滑行动量，因为那是该甩动的延续。焦点保持在仍留在屏幕上的元素：甩走元素前先移走焦点。',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          '用户要求减弱动效时，每个调用都有为其规划的呈现。触摸屏上移动或缩放变为短暂的 opacity 交叉淡化：元素在原处淡出、在落点淡入。鼠标下立即落位。`x` 与 `y` 的 decay 保留动量，因为是用户甩动的延续；`scale`、`rotate` 或 `opacity` 的 decay 按移动规划。没有选项可关闭此行为。',
      },
    ],
  },
  relatedHooks: ['useAnimatedLayout'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '以 Astryx 动效为 ref 背后的元素 (x、y、scale、rotate、opacity) 做动画；返回 animator。',
  paramDescriptions: {
    ref: '元素 ref；与手势 hook 共享它即可对同一元素既拖拽又动画。',
  },
  returnDescriptions: {
    animator:
      'animate(target, {velocity?})、decay(velocity)、set、get、getVelocity、stop；对象稳定，绝不触发重渲染。',
  },
  usage: {
    description:
      '`animate` 弹簧、`decay` 甩动、`set` 跟随手指。减弱动效：触摸下交叉淡化，鼠标下立即落位；decay 保留动量。',
    bestPractices: [
      {
        guidance: true,
        description: '拖拽后给 animate 传入释放速度。',
      },
      {
        guidance: false,
        description: '动画值别存 state；用 animator.get() 读取。',
      },
    ],
  },
};
