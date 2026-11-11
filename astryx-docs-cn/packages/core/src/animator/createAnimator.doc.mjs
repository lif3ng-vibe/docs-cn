// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'createAnimator',
  displayName: 'createAnimator',
  // A factory documented as a hook: listed with the utilities, beside its
  // hook, not as a tile in the components gallery.
  group: 'Utilities',
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
    'vanilla',
    'factory',
    '动画',
    '弹簧',
    '动效',
  ],
  params: [
    {
      name: 'element',
      type: 'HTMLElement',
      description:
        '要动画的元素。animator 会写入它的 `translate`、`scale`、`rotate` 与 `opacity`，移动期间为它们写入内联 `will-change` (与已有的合并，最后一次运动 500 ms 后还原)；仅此而已，布局与样式照常编写。每个元素只用一个 animator：同一元素上两个会互相覆盖。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'animate',
      type: '(target: {x?, y?, scale?, rotate?, opacity?}, options?: {velocity?}) => Promise<void>',
      description:
        '以 Astryx 组件所用的状态变化动效，把给定通道从它们在屏幕上的当前值弹簧运动到 `target`，到达时 resolve (或被后续调用接管时立即 resolve)。`x` 与 `y` 单位为 px，`scale` 以元素原始尺寸为 1，`rotate` 单位为度，`opacity` 从 0 到 1。传入 `velocity` (单位/秒，如拖拽释放速度) 可带着它起始；不传时通道保持其在屏幕上的速度，因此中断运动不会跳变。',
    },
    {
      name: 'decay',
      type: '(velocity: {x?, y?, scale?, rotate?, opacity?}) => Promise<void>',
      description:
        '让给定通道以各自单位/秒的释放速度滑行减速，如同滚动视图的动量衰减，停止时 resolve (任一通道被后续调用接管时立即 resolve)；opacity 在 0 或 1 处停止。距离由速度决定：用它把东西甩出去，然后移除或重置。',
    },
    {
      name: 'set',
      type: '(values: {x?, y?, scale?, rotate?, opacity?}) => void',
      description:
        '立即把给定通道置为这些值并结束其运动：用它逐帧跟随手指。',
    },
    {
      name: 'get',
      type: '() => {x, y, scale, rotate, opacity}',
      description: '此刻每个通道在屏幕上的值。',
    },
    {
      name: 'getVelocity',
      type: '() => {x, y, scale, rotate, opacity}',
      description:
        '此刻每个通道在屏幕上的速度，单位/秒。',
    },
    {
      name: 'stop',
      type: '() => void',
      description: '让每个通道停在屏幕上的当前位置。',
    },
    {
      name: 'destroy',
      type: '() => void',
      description:
        '停止所有运动并释放元素；元素保留其当前显示值。移除元素或不再对其动画时调用。',
    },
  ],
  usage: {
    description:
      '以 Astryx 自家组件所用的动效为单个元素制作动画，无需 React。`animate` 以状态变化动效把元素弹簧到新值，`decay` 以释放的滚动视图动量甩出元素，`set` 直接移动它——卡片因此可以跟随手指、回弹、被甩走。React 中请用 `useAnimator` Hook。要在条目变化时为区域布局做动画，用 `useAnimatedLayout`；组件已内置的动画 (如 sheet 的档位或轮播的吸附) 请用组件自身的 prop。',
    bestPractices: [
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
        guidance: true,
        description:
          '移除被动画退场的元素前先 `await` promise，元素消失后调用 `destroy`。',
      },
      {
        guidance: false,
        description:
          '运动期间不要从布局读取元素位置：无论运动在哪里运行，`get` 给出的都是屏幕上的值。',
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
  relatedHooks: ['useAnimator', 'useAnimatedLayout'],
  importPath: '@astryxdesign/core',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '以 Astryx 动效为单个元素 (x、y、scale、rotate、opacity) 做动画，无需 React。',
  paramDescriptions: {
    element: '要动画的元素；每元素一个 animator。',
  },
  returnDescriptions: {
    animate:
      '(target, {velocity?}) => Promise<void>；以状态变化动效弹簧运动。',
    decay:
      '({x?, y?, scale?, rotate?, opacity?}) => Promise<void>；从释放速度滑行减速。',
    set: '(values) => void；跳变并结束运动。',
    get: '() => 屏幕上各通道的值。',
    getVelocity: '() => 屏幕上各通道的速度。',
    stop: '() => void；原地停止。',
    destroy: '() => void；释放元素。',
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
        description: '运动中途别读布局取位置；用 get。',
      },
    ],
  },
};
