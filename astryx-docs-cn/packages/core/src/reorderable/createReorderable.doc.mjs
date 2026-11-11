// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'createReorderable',
  displayName: 'createReorderable',
  // A factory documented as a hook: listed with the utilities, as useLayer
  // is, not as a tile in the components gallery.
  group: 'Utilities',
  keywords: [
    'reorder',
    '重排',
    'reorderable',
    'drag',
    '拖动',
    'sort',
    '排序',
    'list',
    'handle',
    '把手',
    'grip',
    'move',
    '移动',
    'UIKit',
    'UITableView',
    'touch',
    'keyboard',
    '键盘',
  ],
  params: [
    {
      name: 'onReorder',
      type: '(move: {key: Key; to: number}) => void',
      description:
        "每次已确认的移动（一次放下，或重排模式中的每次移动）时调用一次，携带被移动项的键及其在集合完整顺序中移动后的索引。通过按新顺序渲染项来应用它。被取消的移动不调用任何东西。调用的是最新给出的函数，因此该对象可以在每次渲染时重建。",
      required: true,
    },
    {
      name: 'isReorderable',
      type: '(key: Key) => boolean',
      description:
        '该键对应的项是否可以移动。被它拒绝的项不显示把手且无法拿起；位于集合两端的这样的项还会约束其他项，任何东西都不能放到它之外，键盘移动进入它也会被拒绝。不提供它时所有项都可移动。',
    },
  ],
  returns: [
    {
      name: 'reorderable',
      type: 'Reorderable',
      description:
        "集合的重排行为：作为 `List` 的 `reorderable` prop 传入，并在每个 `ListItem` 上设置 `itemKey`。每个集合创建一次（用 useMemo）；每次渲染重建也能工作。它唯一的方法 `start(key)` 从你自己的 UI（上下文菜单中的移动项、工具栏按钮）进入该项的重排模式：焦点移到它的把手，与激活把手相同；不能移动或未挂载的键不做任何事并在开发环境告警。一个对象可服务多个集合，各自独立重排；此时 `start` 使用最后挂载的那个。",
    },
  ],
  usage: {
    description:
      "让集合的行可以重排。在触屏上，手指在行的把手上静止片刻即可拿起（在把手上甩动仍是滚动）：该行留在原位并变暗，其副本跟随手指移动，一条强调线标记落点；其他行保持不动，页面在边缘附近滚动，松手时各行重新排列。主指针为 coarse 时，触控笔在把手上静止片刻像手指一样拿起该行。鼠标（或主指针为 fine 时的触控笔）立即以同样方式拖动把手，各行无动画就位；取消的拖动会让一切立即复原。没有拖动时，把手为其行切换重排模式（点击、Space 或 Enter）：每个方向键立即把行移动一格，Escape 或再次激活结束该模式并保留移动；屏幕阅读器会听到每次移动及该行的位置与相邻行，提示以按钮形式显示移动与完成，仅供点按。重排代码随该函数一起交付：未传 prop 的集合不加载任何重排代码。",
    bestPractices: [
      {
        guidance: true,
        description:
          '为每行提供来自数据的稳定键（字符串或数字）（`itemKey={item.id}`），并在同一任务中通过按新顺序渲染项来应用每次移动。',
      },
      {
        guidance: true,
        description:
          '对必须保持原位的行（如固定的首行）使用 `isReorderable`。',
      },
      {
        guidance: true,
        description:
          "也从自有 UI 提供重排模式，例如在行的上下文菜单中调用 `reorderable.start(item.id)`。",
      },
      {
        guidance: false,
        description:
          "不要用 React 的 `key` 作为重排键，也不要用基于索引的键：一次移动会改变其后每个索引。",
      },
    ],
  },
  relatedComponents: ['List'],
  importPath: '@astryxdesign/core',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    "集合的重排行为，供 List 的 reorderable prop 使用；每行 ListItem 设置 itemKey。",
  paramDescriptions: {
    onReorder:
      '({key, to})，每次已确认的移动调用一次；to 为移动后的索引。',
    isReorderable:
      '(key) => boolean；被拒绝的行没有把手，且位于两端时会约束放下位置。',
  },
  returnDescriptions: {
    reorderable:
      "作为 List 的 reorderable prop 传入；start(key) 从自有 UI 进入重排模式。",
  },
  usage: {
    description:
      'UIKit 编辑模式重排：按住再拖动（手指；主指针 coarse 时的触控笔），立即拖动（鼠标；主指针 fine 时的触控笔）；无拖动时把手切换重排模式（点击、Space、Enter），方向键移动，Escape 结束。',
    bestPractices: [
      {
        guidance: true,
        description: 'itemKey 用稳定的数据键；立即应用移动。',
      },
      {
        guidance: false,
        description: "不要用 React key 或索引作重排键。",
      },
    ],
  },
};
