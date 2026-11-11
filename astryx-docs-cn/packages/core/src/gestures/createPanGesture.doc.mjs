// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'createPanGesture',
  displayName: 'createPanGesture',
  // A factory documented as a hook: listed with the utilities, beside its
  // hook, not as a tile in the components gallery.
  group: 'Utilities',
  keywords: [
    'pan',
    'drag',
    'gesture',
    'touch',
    'swipe',
    'translation',
    'velocity',
    'pointer',
    'vanilla',
    'factory',
    '拖拽',
    '手势',
    '平移',
  ],
  params: [
    {
      name: 'element',
      type: 'Element',
      description:
        '要拖拽的元素。pan 只会在其上写入其轴所需的 `touch-action`，别无其他；它自身不移动任何东西。',
      required: true,
    },
    {
      name: 'options',
      type: 'PanGestureOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.axis',
      type: "'x' | 'y'",
      description:
        '把拖拽限制到单轴。另一轴上的拖拽不上报，所有值的该分量读作 0，因此跨该轴的滚动仍归页面。省略则上报双轴；在元素上起始的手指滚动会改为移动元素而非页面。触控板滚动仍滚动页面。',
      required: false,
    },
    {
      name: 'options.onPan',
      type: '(event: PanGestureEvent) => void',
      description:
        '拖拽开始、变化、在释放时结束或被取消时，以 `{state, translation, velocity}` 调用。`state` 为 \'began\'、\'changed\'、\'ended\' 或 \'cancelled\'。`translation` 是自拖拽开始起的位移 (px)，不含拖拽启动所需行程，跟随它的元素因此不会跳变。`velocity` 单位 px/s；\'ended\' 时为释放速度 (手指抬起前静止则为 0)，\'cancelled\' 时为 0。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'destroy',
      type: '() => void',
      description:
        '移除 pan 添加的所有监听器及其 `touch-action`。进行中的拖拽会被取消：`onPan` 收到 `cancelled`。',
    },
  ],
  usage: {
    description:
      '以值的形式上报元素上的拖拽，无需 React，适用于产品自行移动的表面：跟随手指的卡片、被把手拉动的抽屉。手指、鼠标与触控笔都能驱动。起始于可选中文本的鼠标或触控笔拖拽会选中该文本，pan 不上报任何值。给这些文本设置 `user-select: none`。拖拽像 `UIPanGestureRecognizer` 一样在 UIKit 的 10 pt 处认领触摸，因此点按仍是点按，按压或长按绝不会被上报为 pan。React 中请用 `usePanGesture` Hook。组件已提供该行为的地方改用其 prop：BottomSheet 的 `snapPoints`、Carousel 的 `hasSnap`。示例在 usePanGesture 页面：同一个可拖拽盒子，分别用 Hook 与 createPanGesture 各实现一次。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 `translation` 加到拖拽开始时元素所在的位置来移动它，让元素从拖拽认领那一刻起就跟手。',
      },
      {
        guidance: true,
        description:
          '`ended` 时把 `velocity` 交给稳定元素的动画，让轻扫以释放时的速度继续。',
      },
      {
        guidance: true,
        description:
          '元素离开页面时调用 `destroy`，避免监听器比元素活得更久。',
      },
      {
        guidance: false,
        description:
          '不要在每个 `changed` 事件读布局来定位元素；`translation` 已说明手指位置。',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        criterion: '2.5.7 Dragging Movements',
        description:
          '拖拽没有自己的键盘或辅助技术路径：拖拽完成的任何事都需要另一种途径完成，如按钮、方向键或菜单。',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          'pan 自身不移动任何东西，减弱动效作用于由它驱动的运动：用户要求减弱动效时，稳定或甩动直接到位、不再有移动过程。',
      },
    ],
  },
  relatedHooks: ['usePanGesture'],
  importPath: '@astryxdesign/core',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '以值 ({state, translation, velocity}) 上报元素拖拽，无需 React；手指、鼠标、触控笔皆可驱动，但可选中文本上的鼠标/触控笔拖拽会改为选中文本 (给文本设 user-select: none)。返回 {destroy}。',
  paramDescriptions: {
    element: '要拖拽的元素；pan 只写其 touch-action。',
    options: '配置对象。',
    'options.axis':
      "'x' | 'y'：限单轴；另一轴不上报、读 0。",
    'options.onPan':
      "({state, translation, velocity})：state 为 'began' | 'changed' | 'ended' | 'cancelled'；translation 为拖拽开始起的 px 位移 (不跳变)；velocity 单位 px/s，'ended' 时为释放速度，'cancelled' 时为 0。",
  },
  returnDescriptions: {
    destroy:
      '() => void；移除所有监听器与 touch-action，取消进行中的拖拽。',
  },
  usage: {
    description:
      '以值上报拖拽、无需 React，用于自行移动的表面。10 pt 认领。无自有键盘路径 (WCAG 2.5.7)；减弱动效作用于你驱动的动画。优先组件 prop (BottomSheet snapPoints、Carousel hasSnap)；React 用 usePanGesture。',
    bestPractices: [
      {
        guidance: true,
        description:
          '从 translation + began 时的偏移出发移动，让元素从认领起就跟手。',
      },
      {
        guidance: true,
        description: '把 ended 速度交给稳定动画。',
      },
      {
        guidance: true,
        description: '元素离开页面时调用 destroy。',
      },
      {
        guidance: false,
        description: '别在每次 changed 读布局；用 translation。',
      },
    ],
  },
};
