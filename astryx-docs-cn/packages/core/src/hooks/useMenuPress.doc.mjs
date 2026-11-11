// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useMenuPress',
  displayName: 'useMenuPress',
  keywords: [
    'menu',
    '菜单',
    'press',
    '按压',
    'release',
    'touch',
    'finger',
    'drag',
    'highlight',
    '高亮',
    'pointer',
    'gesture',
    '手势',
    'listbox',
    'macos',
    'ios',
  ],
  params: [
    {
      name: 'options',
      type: 'UseMenuPressOptions',
      description: '配置对象。',
      required: true,
    },
    {
      name: 'options.menuRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '菜单或列表框根元素——按压从中选择行的表面。',
      required: true,
    },
    {
      name: 'options.itemSelector',
      type: 'string',
      description:
        '匹配可用（ENABLED）行的选择器。指针悬停在菜单内的其他元素上（分隔线、标题、禁用行）不会产生高亮。',
      required: true,
    },
    {
      name: 'options.triggerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '打开菜单的控件，用于按压可能从那里开始的场景。',
    },
    {
      name: 'options.onTriggerPress',
      type: '(pointerType: MenuPressPointerType) => boolean',
      description:
        '鼠标按下了触发器，或手指在其上停留了长按时长：在按住的指针下方打开菜单并返回是否已打开。当按压实际是关闭已打开的菜单时返回 false。',
    },
    {
      name: 'options.onHighlight',
      type: '(row: HTMLElement | null) => void',
      description:
        '移动高亮；null 清除高亮。默认行为是以 preventScroll 把 DOM 焦点移到该行，没有行时移到菜单根元素；指针按压之后该焦点不匹配 :focus-visible。通过 aria-activedescendant 高亮的选择器应自行提供。',
    },
    {
      name: 'options.onActivate',
      type: '(row: HTMLElement, release: PointerEvent) => void',
      description:
        '对释放位置下的行执行操作。默认在该行上派发一个携带释放按键与修饰键的 click。',
    },
    {
      name: 'options.onDismiss',
      type: '() => void',
      description:
        '鼠标（MOUSE）在菜单外释放且没有触发任何操作：关闭菜单。手指在菜单外释放会让菜单保持打开，因此此时不会调用。',
    },
    {
      name: 'options.getScroller',
      type: '() => HTMLElement | null',
      description:
        '当被跟踪的指针停留在其顶/底边缘附近时执行滚动的元素。默认在菜单根元素溢出时使用它。',
    },
    {
      name: 'options.longPressDelayMs',
      type: 'number',
      description:
        '手指需在触发器上停留多久，菜单才会在其下方打开。',
      default: '500',
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: '按压模型是否生效。',
      default: 'true',
    },
  ],
  returns: [
    {
      name: 'menuProps',
      type: '{onPointerDown; "data-astryx-menu-press": ""}',
      description:
        '展开到菜单根元素上。认领在其内部开始的按压，并把根元素标记为携带按压模型。',
    },
    {
      name: 'triggerProps',
      type: '{onPointerDown; onContextMenu}',
      description:
        '展开到触发器上：鼠标按下立即打开菜单；手指停留满时长则在手指仍按住时打开。',
    },
    {
      name: 'isTriggerClickFromPress',
      type: '() => boolean',
      description:
        '到达触发器的 click 是否属于刚才按压它的手势。该按压已经打开或关闭了菜单，因此这个 click 既不能切换也不能重新打开。',
    },
    {
      name: 'cancel',
      type: '() => void',
      description:
        '在不触发任何操作的情况下结束进行中的手势，用于菜单在手势期间被关闭的场合。',
    },
  ],
  usage: {
    description:
      'macOS 与 iOS 菜单的按压模型，适用于任何指针：释放时指针下的行即被激活，按住期间高亮跟随指针移动；鼠标按下即打开菜单并可直接拖入，手指在触发器上停留满时长则在手指仍按住时打开。指针按 pointerId 在 document 层级跟踪，因此手指即使滑离落下的那行也仍被跟随；浏览器在触摸结束时报到触摸起点那行的 click 会被吞掉，以免重复激活。DropdownMenu、ContextMenu、DropdownMenuSubMenu、Selector 与菜单底部工作表（bottom sheet）已内置该模型；只有构建自己的菜单式表面时才需要直接使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '只为可用（ENABLED）行传选择器，这样指针下的禁用行或分隔线会清除高亮而不是点亮。',
      },
      {
        guidance: true,
        description:
          '在菜单中让默认高亮移动焦点；只为必须把焦点保持在 combobox 上、通过 aria-activedescendant 高亮的列表框提供 onHighlight。',
      },
      {
        guidance: true,
        description:
          '在菜单根元素上声明 touch-action：行能放下时用 pinch-zoom，可滚动时用 pan-y pinch-zoom，这样由浏览器——而不是 hook——判断手指何时在滚动，双指捏合仍能缩放页面。',
      },
      {
        guidance: false,
        description:
          '不要同时在行的 pointerdown 或 pointerup 处理器里执行操作；hook 已对释放位置下的行激活，第二条路径会导致重复执行。',
      },
      {
        guidance: false,
        description:
          '不要把 detail 为 0 的行 click 当作键盘激活；hook 派发的指针激活同样是 detail 0。请用 isMenuPressActivation() 区分两者。',
      },
    ],
  },
  relatedComponents: ['DropdownMenu', 'ContextMenu', 'Selector'],
  relatedHooks: ['useListFocus', 'useTypeahead', 'useLongPress'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '适用于任何指针的 macOS/iOS 菜单按压模型：释放位置下的行被激活，高亮跟随按住的指针，鼠标按下即打开并可直接拖入，手指按满时长则在按住状态下打开。document 层级 pointerId 跟踪；浏览器触摸后的杂散 click 被吞掉。DropdownMenu / ContextMenu / DropdownMenuSubMenu / Selector / 菜单底部工作表已内置。',
  paramDescriptions: {
    options: '配置。',
    'options.menuRef': '菜单/列表框根元素。',
    'options.itemSelector': '可用（ENABLED）行的选择器；其他元素清除高亮。',
    'options.triggerRef': '打开菜单的控件。',
    'options.onTriggerPress':
      '鼠标按下/手指按满时长于触发器：打开，返回是否已打开（false = 该按压关闭了菜单）。',
    'options.onHighlight':
      '移动高亮（null 清除）；默认 = 以 preventScroll 聚焦（指针按压后不匹配 :focus-visible），没有行时聚焦菜单根元素。',
    'options.onActivate':
      '对释放位置下的行执行操作；默认 = 派发携带释放按键 + 修饰键的 click。',
    'options.onDismiss': '鼠标在菜单外释放：关闭。手指：从不调用。',
    'options.getScroller':
      '跟踪期间用于边缘自动滚动的元素；默认 = 溢出时的菜单根元素。',
    'options.longPressDelayMs': '打开前手指需停留的时长（毫秒）。',
    'options.isEnabled': 'false = 不生效。',
  },
  returnDescriptions: {
    menuProps: '展开到菜单根元素（认领按压并标记根元素）。',
    triggerProps: '展开到触发器（按压打开、手指按满时长打开）。',
    isTriggerClickFromPress:
      'true = 触发器 click 属于已经打开/关闭菜单的那次按压；应忽略。',
    cancel: '不触发任何操作地结束手势。',
  },
  usage: {
    description:
      '释放决定激活；高亮跟随指针；鼠标按下即开；手指按满时长打开。仅在构建自己的菜单式表面时直接使用。',
    bestPractices: [
      {
        guidance: true,
        description: 'itemSelector 只匹配可用（ENABLED）行。',
      },
      {
        guidance: true,
        description:
          '菜单中用默认焦点高亮；onHighlight 只用于 aria-activedescendant 列表框。',
      },
      {
        guidance: true,
        description:
          '根元素上声明 touch-action：行能放下时用 pinch-zoom，可滚动时用 pan-y pinch-zoom。',
      },
      {
        guidance: false,
        description:
          '不要同时在行的 pointerdown / pointerup 里执行操作；hook 已在释放时激活。',
      },
      {
        guidance: false,
        description:
          '不要把 detail-0 的行 click 当作键盘激活；hook 派发的也是 detail 0——请用 isMenuPressActivation()。',
      },
    ],
  },
};
