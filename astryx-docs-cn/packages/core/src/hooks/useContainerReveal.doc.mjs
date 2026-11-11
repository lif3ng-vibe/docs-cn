// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useContainerReveal',
  displayName: 'useContainerReveal',
  keywords: ['reveal', 'hover', 'focus', 'container', 'row', 'actions', 'overlay', 'conceal', 'hidden', 'show', '悬停显现', '行操作'],
  params: [
    {
      name: 'options',
      type: 'UseContainerRevealOptions',
      description: '显现容器的配置对象。可选。',
      required: false,
    },
    {
      name: 'options.isEnabled',
      type: 'boolean',
      description: '为 false 时 hook 不生效：容器得不到样式、内容 getter 返回空样式，内容始终显示。每次渲染都会读取，组件可在挂载后翻转它 (如 revealOn === "hover")。',
      default: 'true',
      required: false,
    },
  ],
  returns: [
    {
      name: 'getContainerProps',
      type: '(options?: ContainerRevealOptions) => {className?: string; style?: CSSProperties}',
      description: '展开到由悬停/focus-within 驱动显现的容器上。接受 hoverDelay (显现开始前指针需停留的毫秒数：类似 Tooltip 与 HoverCard delay 的悬停意图闸门，扫过列表的光标不会点亮沿途的行) 与 forceState ("active" | "inactive"，调用方持有触发状态时用它钉住：动效闸门、滚动，或菜单打开的行)。"inactive" 仍会让位于键盘焦点与粗指针。',
    },
    {
      name: 'getContentRevealProps',
      type: '(options?: ContentRevealOptions) => {className?: string; style?: CSSProperties}',
      description: '展开到每个显现/隐藏的子元素上。接受 isRevealInverted (悬停时隐藏而非显现)、isLayoutPreserved (隐藏期间保留布局盒，仅透明度变化，避免布局位移) 与 forceVisibility ("shown" | "hidden"，无论容器状态如何钉住该元素的外观)。"hidden" 让位于焦点。',
    },
  ],
  usage: {
    description:
      '无头悬停/焦点显现原语。给容器一个作用域限定的触发器，在容器被悬停或获得键盘焦点时显现 (或隐藏) 其内部内容：经典的“行操作悬停出现”模式。纯 CSS 实现：React 中没有悬停状态，悬停绝不触发重渲染。调用方无需为显现本身编写 StyleX；hook 分发容器与内容样式，嵌套容器遮蔽祖先容器，嵌套容器间绝不互相泄漏悬停/焦点。构造即无障碍：显现内容静息时以 position 与 opacity 视觉隐藏 (绝不用 display:none)，保持挂载、保留 Tab 顺序、可被辅助技术播报；:focus-within 时显现让键盘用户 Tab 进入即见；触摸设备上保持可见 (粗指针上绝不被悬停门槛挡住)；遵循 prefers-reduced-motion。',
    bestPractices: [
      { guidance: true, description: '解构 getContainerProps 与 getContentRevealProps；getContainerProps() 展开到容器 (经 mergeProps 与你自己的 stylex.props 合并)，getContentRevealProps() 展开到要显现的内容。' },
      { guidance: true, description: '用于次级功能：悬停显现的行操作 (列表/表格行的编辑/复制/删除)、卡片或媒体块上的覆盖控件 (如 Thumbnail 的删除按钮)。' },
      { guidance: true, description: '消费方 prop 决定悬停显现还是始终显示时，用 isEnabled 门控；它随时可能变化。' },
      { guidance: true, description: '绝对定位或覆盖内容传 isLayoutPreserved，保留其盒子、出现时避免布局位移。' },
      { guidance: true, description: '长列表的行设置 hoverDelay (100-250ms)，光标横穿列表不会点亮沿途每一行；键盘与触摸仍立即显现。' },
      { guidance: true, description: '交互的归属不是指针时 (拖拽、滚动或动效闸门、打开的行菜单) 用 forceState；单个元素需要无视容器时用 forceVisibility。' },
      { guidance: false, description: '不要绕过 API 直调 hook 的私有自定义属性 (--_reveal-opacity 等) 来抑制显现；用 forceState / forceVisibility，它们在重命名后仍有效。' },
      { guidance: false, description: '不要用它隐藏必须始终可发现的内容；关键操作保持可见，不要藏在悬停之后。' },
    ],
  },
  relatedComponents: ['Thumbnail'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '无头悬停/焦点显现原语。给容器作用域限定的触发器，悬停/键盘焦点时显现 (或隐藏) 内部内容：“行操作悬停出现”模式。纯 CSS：React 无悬停状态，悬停不重渲染。调用方无需写 StyleX；hook 分发容器 + 内容样式；嵌套容器遮蔽祖先，绝不互相泄漏悬停/焦点。无障碍：显现内容静息时经 position + opacity 视觉隐藏 (绝不用 display:none)，保持挂载 + Tab 顺序 + 可播报；:focus-within 显现，触摸可见，遵循 prefers-reduced-motion。',
  paramDescriptions: {
    options: '显现容器配置。可选。',
    'options.isEnabled': '为 false 时 hook 不生效：无容器样式、内容 getter 返回空样式、内容始终显示。每次渲染读取，挂载后可翻转。',
  },
  returnDescriptions: {
    getContainerProps: '展开到由悬停/focus-within 驱动显现的容器。接受 hoverDelay (显现前指针停留毫秒数：类似 Tooltip / HoverCard delay 的悬停意图闸门) + forceState ("active" | "inactive"，调用方持有触发态时钉住)。"inactive" 让位于键盘焦点 + 粗指针。',
    getContentRevealProps: '展开到每个显现/隐藏子元素。接受 isRevealInverted (悬停时隐藏)、isLayoutPreserved (隐藏期保留布局盒) + forceVisibility ("shown" | "hidden"，无视容器钉住该元素)。"hidden" 让位于焦点。',
  },
  usage: {
    description:
      '无头悬停/焦点显现原语。给容器作用域限定的触发器，悬停/键盘焦点时显现 (或隐藏) 内部内容：“行操作悬停出现”模式。纯 CSS：React 无悬停状态，悬停不重渲染。调用方无需写 StyleX；hook 分发容器 + 内容样式；嵌套容器遮蔽祖先，绝不互相泄漏悬停/焦点。无障碍：显现内容静息时经 position + opacity 视觉隐藏 (绝不用 display:none)，保持挂载 + Tab 顺序 + 可播报；:focus-within 显现，触摸可见，遵循 prefers-reduced-motion。',
    bestPractices: [
      { guidance: true, description: '解构 getContainerProps + getContentRevealProps；getContainerProps() 展开到容器 (经 mergeProps 与你的 stylex.props 合并) + getContentRevealProps() 展开到内容。' },
      { guidance: true, description: '用于次级功能：悬停显现的行操作 (列表/表格行的编辑/复制/删除) + 卡片/媒体块覆盖控件 (如 Thumbnail 删除按钮)。' },
      { guidance: true, description: '消费方 prop 决定悬停显现还是始终显示时用 isEnabled 门控；随时可变。' },
      { guidance: true, description: '绝对定位/覆盖内容传 isLayoutPreserved，保留盒子 + 避免布局位移。' },
      { guidance: true, description: '长列表行设 hoverDelay (100-250ms)，光标横穿不点亮沿途行；键盘 + 触摸仍立即显现。' },
      { guidance: true, description: '交互归属非指针时 (拖拽、滚动/动效闸门、打开的行菜单) 用 forceState；单元素要无视容器用 forceVisibility。' },
      { guidance: false, description: '别绕过 API 直调私有自定义属性 (--_reveal-opacity 等) 抑制显现；用 forceState / forceVisibility。' },
      { guidance: false, description: '别用它隐藏必须始终可发现的内容；关键操作保持可见，不藏在悬停后。' },
    ],
  },
};
