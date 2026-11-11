// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'createDragToSnapPoints',
  displayName: 'createDragToSnapPoints',
  // A factory documented as a hook: listed with the utilities, beside its
  // hook, not as a tile in the components gallery.
  group: 'Utilities',
  keywords: [
    'drag',
    'snap',
    'snap points',
    'detents',
    'drawer',
    'flick',
    'swipe',
    'gesture',
    'vanilla',
    'factory',
    '拖拽',
    '吸附',
    '抽屉',
  ],
  params: [
    {
      name: 'element',
      type: 'HTMLElement',
      description:
        '拖拽移动的元素。它仅沿 `axis` 以平移方式移动，布局照常放在其静息位置即可。',
      required: true,
    },
    {
      name: 'options.axis',
      type: "'x' | 'y'",
      description: '元素移动所沿的轴。',
      required: true,
    },
    {
      name: 'options.snapPoints',
      type: 'number[]',
      description:
        '沿 `axis` 相对元素静息位置的 px 偏移，如 `[0, 240, 480]`，使用前会排序 (`onSettle` 与 `settleTo` 按该顺序计数)；空列表让拖拽不做任何事。与 BottomSheet 的 `snapPoints` 不同，它们不是视口的比例分数。',
      required: true,
    },
    {
      name: 'options.flickThreshold',
      type: 'number',
      description:
        '快于此速度 (px/s) 的释放会沿其方向带往下一个吸附点。默认值是为 UIKit sheet 实测的轻扫速度。',
      default: '1008',
      required: false,
    },
    {
      name: 'options.onSettle',
      type: '(index: number) => void',
      description:
        '元素在拖拽或 `settleTo` 后稳定到某吸附点时，以该点索引调用。被新拖拽打断的稳定不触发调用。',
      required: true,
    },
  ],
  returns: [
    {
      name: 'settleTo',
      type: '(index: number) => void',
      description:
        '不经拖拽把元素稳定到 `index` 处的吸附点，随后调用 `onSettle`。把它接到按键和按钮上：这就是键盘路径。越界的索引不做任何事，开发模式下警告。',
    },
    {
      name: 'destroy',
      type: '() => void',
      description:
        '移除所有监听器并让元素停在原地。移除元素时调用。',
    },
  ],
  usage: {
    description:
      '让拖拽沿单轴移动元素，并在手指抬起时把它稳定到吸附点上，如同 iOS sheet 稳定到其档位：停在距当前位置最近的吸附点，快速轻扫后停在方向上的下一个，手指回移时回到起点。稳定过程延续释放时的速度。底部抽屉请用 BottomSheet 的 `snapPoints`；滚动横排请用 Carousel 的 `hasSnap`。React 中请用 `useDragToSnapPoints` Hook。',
    bestPractices: [
      {
        guidance: true,
        description:
          '不经拖拽也要能到达同样位置：调用 `settleTo` 的按钮或按键。',
      },
      {
        guidance: true,
        description:
          '吸附点保持少而分散，让释放能明确选中一个。',
      },
      {
        guidance: false,
        description:
          '不要用它做 sheet 或轮播：它们自身的 prop 已按用户预期的方式稳定。',
      },
    ],
    accessibility: [
      {
        name: 'Keyboard and assistive technology',
        category: 'Keyboard',
        description:
          '拖拽只是入口之一，绝不能是唯一入口。为每个吸附点提供键盘与屏幕阅读器可及的控件 (如展开/收起按钮)，并从那里调用 `settleTo`。位置改变元素所展示的内容时，播报该变化。',
      },
      {
        name: 'Reduce Motion',
        category: 'Content',
        criterion: '2.3.3 Animation from Interactions',
        description:
          '用户要求减弱动效时，触摸拖拽后的稳定变为向吸附点的短暂交叉淡化，主指针为粗指针的设备 (如平板) 上所有稳定同样如此；其他设备上鼠标或触控笔拖拽后立即落位。`settleTo` 在此类设备上淡化，主指针为细指针时立即落位。手指按住期间元素仍跟随手指。',
      },
    ],
  },
  relatedComponents: ['BottomSheet', 'Carousel'],
  relatedHooks: ['useDragToSnapPoints', 'createPanGesture', 'createAnimator'],
  importPath: '@astryxdesign/core',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '在释放时把元素稳定到吸附点 (px 偏移) 的拖拽，无需 React。',
  paramDescriptions: {
    element: '拖拽移动的元素。',
    'options.axis': "'x' 或 'y'。",
    'options.snapPoints': '相对静息位置的升序 px 偏移。',
    'options.flickThreshold':
      '释放带往下一个吸附点的 px/s 阈值；1008。',
    'options.onSettle': '稳定后调用 (index)。',
  },
  returnDescriptions: {
    settleTo: '(index) 不经拖拽稳定：键盘路径。',
    destroy: '() 移除所有监听器。',
  },
  usage: {
    description:
      '最近吸附点、轻扫后的下一个、回移回起点；稳定延续释放速度。sheet 与轮播：用它们自身的 prop。',
    bestPractices: [
      {guidance: true, description: '把 settleTo 接到按钮与按键上。'},
      {guidance: false, description: '不要用它重造 sheet 或轮播。'},
    ],
  },
};
