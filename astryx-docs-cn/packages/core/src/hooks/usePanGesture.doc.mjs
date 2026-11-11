// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'usePanGesture',
  displayName: 'usePanGesture',
  keywords: [
    'pan',
    '拖动',
    'drag',
    'gesture',
    '手势',
    'touch',
    'swipe',
    '平移',
    'translation',
    'velocity',
    '速度',
    'pointer',
    'createPanGesture',
    'uikit',
  ],
  params: [
    {
      name: 'ref',
      type: 'RefObject<Element | null>',
      description:
        '要拖动的元素。hook 为 ref 背后的元素创建一个 pan，当 ref 移到其他节点或 `axis` 变化时创建新的，卸载时销毁；此时进行中的拖拽直接结束、不派发 `cancelled` 事件，因为 effect 从不调用 `onPan`。',
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
        '把拖动限制在单个轴上。另一轴上的拖动不会上报，且每个值的该分量恒为 0。省略则上报两个轴。',
      required: false,
    },
    {
      name: 'options.onPan',
      type: '(event: PanGestureEvent) => void',
      description:
        "拖动开始、变化、在释放时结束或被取消时以 `{state, translation, velocity}` 调用。`state` 为 'began'、'changed'、'ended' 或 'cancelled'。`translation` 是拖动开始以来的位移（像素）：拖动启动所需的前置行程不包含在内，因此跟随它的元素不会跳动。`velocity` 单位为像素/秒；'ended' 时为释放速度（手指静止后抬起则为 0），'cancelled' 时为 0。通过 ref 读取：每次渲染传新函数也不会重建任何东西。",
      required: true,
    },
  ],
  returns: [
    {
      name: 'void',
      type: 'void',
      description:
        '无返回：hook 不发放识别器。在无 React 的场景，`createPanGesture(element, options)` 接受相同选项并返回 `{destroy}`，它会移除自己添加的所有监听器并取消进行中的拖拽。',
    },
  ],
  usage: {
    description:
      '把元素上的拖动以数值形式上报，供产品自行移动的表面使用：跟随手指的卡片、由把手拖出的抽屉。手指、鼠标和触控笔都能驱动它。鼠标或触控笔在可选中文本上开始的拖动会选中文本，pan 不会上报任何内容。请给这类文本设置 `user-select: none`。拖动在 UIKit 的 10 pt 处认领触摸，与 `UIPanGestureRecognizer` 一致，因此点按仍是点按，按压或长按也绝不会上报为 pan。设置 `axis` 后，跨该轴、在元素上开始的滚动仍归页面；不设置时 pan 会认领任意方向的拖动，于是手指在元素上开始的滚动会移动元素而不是页面。触控板滚动仍会滚动页面。该 hook 是 `createPanGesture` 的薄封装，为无 React 的代码提供相同 API。拖动本身没有键盘或辅助技术路径：拖动完成的任何事都需要另一种途径完成，如按钮或方向键（WCAG 2.5.7）。pan 自身不移动任何东西，因此减弱动效（Reduce Motion）作用于你由它驱动的动效：在移动元素的动画中尊重用户的减弱动效设置。当组件已提供该行为时，改用其 prop：BottomSheet 的 `snapPoints`、Carousel 的 `hasSnap`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '把 `translation` 加到拖动开始时元素所在的位置来移动它，这样从拖动认领触摸那一刻起元素就跟随手指。',
      },
      {
        guidance: true,
        description:
          '在 `ended` 时把 `velocity` 交给让元素回稳的动画，这样甩动会以释放时的速度继续。',
      },
      {
        guidance: true,
        description:
          '为每个拖动提供经键盘与辅助技术完成同样事情的另一途径，如按钮、方向键或菜单。',
      },
      {
        guidance: true,
        description:
          "组件自身 prop 能胜任时就用它：工作表用 BottomSheet 的 `snapPoints`，翻页用 Carousel 的 `hasSnap`。",
      },
      {
        guidance: false,
        description:
          '不要把拖动偏移放在大型组件的 state 里：每个 `changed` 事件都会重渲染持有它的组件。',
      },
      {
        guidance: false,
        description:
          '不要用它识别点按或长按；`useLongPress` 与组件自身的按压处理负责这些。',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        criterion: '2.5.7 Dragging Movements',
        description:
          '拖动本身没有键盘或辅助技术路径：拖动完成的任何事都需要另一种途径完成，如按钮、方向键或菜单。',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          'pan 自身不移动任何东西，因此减弱动效作用于你由它驱动的动效：用户要求减弱动效时，回稳或抛掷直接到达终点、不经过行程。',
      },
    ],
  },
  relatedComponents: ['BottomSheet', 'Carousel'],
  relatedHooks: ['useLongPress', 'createPanGesture'],
  importPath: '@astryxdesign/core/hooks',
  category: 'motion & gestures',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '把拖动以数值形式上报（{state, translation, velocity}），供你自行移动的表面使用；手指、鼠标、触控笔都能驱动，但鼠标/触控笔在可选中文本上的拖动会变成选择（请给该文本 user-select: none）。在 UIKit 的 10 pt 处认领；点按、按压与长按绝不会成为 pan，设置 axis 后跨该轴的滚动仍归页面。createPanGesture(element, options) → {destroy} 的薄封装。自身没有键盘路径：为拖动提供替代途径（WCAG 2.5.7）。减弱动效：在你驱动的动画中遵守。合适时优先用 BottomSheet snapPoints / Carousel hasSnap。',
  paramDescriptions: {
    ref: '要拖动的元素；每个节点一个 pan，ref 移动时重建，卸载时销毁。',
    options: '配置对象。',
    'options.axis':
      "'x' | 'y'：限制在单轴；另一轴从不上报且恒为 0。",
    'options.onPan':
      "({state, translation, velocity})：state 为 'began' | 'changed' | 'ended' | 'cancelled'；translation 为拖动开始以来的像素位移（不含阈值行程，不跳动）；velocity 为像素/秒，'ended' 时为释放速度，'cancelled' 时为 0。通过 ref 读取。",
  },
  returnDescriptions: {
    void: '无（无识别器）。createPanGesture 返回 {destroy}：移除所有监听器并取消进行中的拖拽。',
  },
  usage: {
    description:
      '为卡片、抽屉把手或任何你自行移动的表面把拖动以上报数值呈现。createPanGesture 的薄封装。自身没有键盘路径（WCAG 2.5.7）；减弱动效作用于你驱动的动画。优先用组件 prop（BottomSheet snapPoints、Carousel hasSnap）。',
    bestPractices: [
      {
        guidance: true,
        description:
          '从 translation + began 时的偏移出发移动，元素从认领那一刻起就跟随手指。',
      },
      {
        guidance: true,
        description: '把 ended 时的速度交给回稳动画。',
      },
      {
        guidance: true,
        description:
          '为每个拖动提供键盘与辅助技术替代途径。',
      },
      {
        guidance: true,
        description: "组件自身 prop 能胜任时就用它。",
      },
      {
        guidance: false,
        description: '不要把拖动偏移放在大型组件的 state 里。',
      },
      {guidance: false, description: '不要用它识别点按或长按。'},
    ],
  },
};
