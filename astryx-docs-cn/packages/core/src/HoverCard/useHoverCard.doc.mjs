// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useHoverCard',
  displayName: 'useHoverCard',
  group: 'HoverCard',
  keywords: [
    'hovercard',
    'hover',
    'preview',
    'card',
    'tooltip',
    'popup',
    'floating',
    'anchor',
    '悬停卡片',
    '悬浮卡片',
    '预览',
  ],
  params: [
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        '相对于触发元素的位置。逻辑值：start/end 根据弹出层自身继承的方向解析（纯 CSS 下的 RTL 镜像）。',
      default: "'above'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        '沿放置轴的对齐方式。逻辑值：start/end 根据弹出层自身继承的方向解析（纯 CSS 下的 RTL 镜像）。',
      default: "'center'",
    },
    {
      name: 'delay',
      type: 'number',
      description:
        '悬停后显示悬浮卡片前的延迟（毫秒）。',
      default: '300',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description:
        '鼠标或焦点离开后隐藏前的延迟（毫秒）。',
      default: '200',
    },
    {
      name: 'focusTrigger',
      type: "'auto' | 'always' | 'never'",
      description:
        '焦点何时打开悬浮卡片。auto 在触发元素自身获得焦点，或焦点落在当时可聚焦的触发元素内部时打开，因此方向键到达漫游 tabindex 成员时也会打开。',
      default: "'auto'",
    },
    {
      name: 'touchTrigger',
      type: "'auto' | 'tap' | 'none'",
      description:
        '在没有悬停的触摸设备上，轻点的行为。auto 轻点即打开，除非触发元素自身会执行操作（aria-disabled 控件不执行操作）；tap 始终打开；none 触摸永不打开。',
      default: "'auto'",
    },
    {
      name: 'isEnabled',
      type: 'boolean',
      description: '悬停和聚焦触发器是否启用。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '悬浮卡片弹出层的无障碍名称。提供时，弹出层以具名的 role="dialog" 暴露；省略时，回退为 role="group"（group 可以合法地没有名称）。',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        '受控打开状态。true 强制显示，false 强制隐藏，undefined 交由悬停/聚焦管理可见性。',
    },
    {
      name: 'isDefaultOpen',
      type: 'boolean',
      description: '是否在挂载时显示悬浮卡片。',
      default: 'false',
    },
    {
      name: 'onShow',
      type: '() => void',
      description: '悬浮卡片变为可见时触发的回调。',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: '悬浮卡片隐藏时触发的回调。',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement>',
      description:
        '组合 ref，在同一个触发元素上同时设置定位与交互。',
    },
    {
      name: 'positionRef',
      type: 'RefCallback<HTMLElement>',
      description:
        '定位锚点元素的 ref。定位与交互分属不同元素时使用。',
    },
    {
      name: 'interactionRef',
      type: 'RefCallback<HTMLElement>',
      description:
        '悬停/聚焦交互元素的 ref。与 positionRef 搭配用于分离式触发模式。',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: '用于高级定位场景的 CSS anchor 名称。',
    },
    {
      name: 'describedBy',
      type: 'string',
      description: '组合进触发元素 aria-describedby 的 ID。',
    },
    {
      name: 'renderHoverCard',
      type: "(children: ReactNode, props?: Omit<ContextRenderProps, 'positioning'>) => ReactNode",
      description:
        '渲染锚定定位悬浮卡片内容的渲染函数。不含定位退出选项：悬浮卡片始终由 placement/alignment 决定位置。',
    },
    {
      name: 'show',
      type: '() => void',
      description: '立即以命令式显示悬浮卡片。',
    },
    {
      name: 'hide',
      type: '() => void',
      description: '立即以命令式隐藏悬浮卡片。',
    },
  ],
  usage: {
    description:
      '用于悬停触发悬浮卡片的无头（headless）Hook。构建于 useLayer 之上，提供悬停/聚焦意图检测、可配置延迟、安全的悬停行为和无障碍的 aria-describedby 关联。需要对触发元素或渲染内容完全掌控时，用它实现悬停富预览。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于富内容预览，如用户资料、实体摘要和链接预览。',
      },
      {
        guidance: true,
        description:
          '标准触发元素-内容组合优先用 HoverCard 组件；自定义触发模式用 Hook。',
      },
      {
        guidance: false,
        description:
          '不要用于简单文本提示；请改用 Tooltip 或 useTooltip。',
      },
    ],
  },
  relatedComponents: ['HoverCard', 'Tooltip', 'Popover'],
  relatedHooks: ['useLayer', 'useTooltip', 'usePopover'],
  importPath: '@astryxdesign/core/HoverCard',
  category: 'interaction',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    '无头悬停触发悬浮卡片。构建于 useLayer 之上，带悬停/聚焦意图、延迟、安全悬停行为、aria-describedby。需要对触发/内容渲染完全掌控时用于富预览。',
  paramDescriptions: {
    placement:
      '相对于触发元素的位置。逻辑值：start/end 跟随弹出层继承的方向（RTL 镜像）。',
    alignment:
      '沿放置轴的对齐方式。逻辑值：start/end 跟随弹出层继承的方向（RTL 镜像）。',
    delay: '显示延迟（毫秒）。',
    hideDelay: '鼠标/焦点离开后的隐藏延迟（毫秒）。',
    focusTrigger:
      '焦点何时打开悬浮卡片；auto = 焦点落在触发元素上，或落在聚焦到达时可聚焦的触发元素内部。',
    touchTrigger:
      '无悬停时的轻点行为；auto = 轻点打开除非触发元素执行操作，tap = 始终，none = 永不。',
    isEnabled: '悬停/聚焦触发器是否启用。',
    label:
      '弹出层的无障碍名称。有 label：具名 role="dialog"；没有：role="group"。',
    isOpen:
      '受控打开状态：true 强制显示，false 强制隐藏，undefined 不托管。',
    isDefaultOpen: '挂载时显示。',
    onShow: '悬浮卡片变为可见时触发。',
    onHide: '悬浮卡片隐藏时触发。',
  },
  returnDescriptions: {
    ref: '定位 + 交互的组合 ref。',
    positionRef: '定位锚点 ref。',
    interactionRef: '悬停/聚焦交互 ref。',
    anchorId: 'CSS anchor 名称。',
    describedBy: '用于 aria-describedby 的 ID。',
    renderHoverCard: '渲染锚定定位的悬浮卡片内容。',
    show: '立即显示。',
    hide: '立即隐藏。',
  },
  usage: {
    description:
      '无头悬停触发悬浮卡片。构建于 useLayer 之上，带悬停/聚焦意图、延迟、安全悬停行为、aria-describedby。需要对触发/内容渲染完全掌控时用于富预览。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用于富预览：资料、实体摘要、链接预览。',
      },
      {
        guidance: true,
        description:
          '标准触发元素-内容组合优先用 HoverCard；自定义触发模式用 Hook。',
      },
      {
        guidance: false,
        description:
          '不要用于简单文本提示：请改用 Tooltip / useTooltip。',
      },
    ],
  },
};
