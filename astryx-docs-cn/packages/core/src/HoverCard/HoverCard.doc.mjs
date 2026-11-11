// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'HoverCard',
  displayName: 'Hover Card',
  group: 'HoverCard',
  category: 'Overlay',
  keywords: [
    'hovercard',
    'hover card',
    'popover',
    'tooltip',
    'preview card',
    'flyout',
    'overlay',
    'hover popup',
    '悬停卡片',
    '悬浮卡片',
    '弹出层',
    '工具提示',
    '预览卡片',
  ],
  playground: {
    defaults: {
      content: {
        __element: 'Text',
        props: {type: 'body'},
        children: '悬停时显示的更多详情。',
      },
      children: {
        __element: 'Link',
        props: {href: '#'},
        children: '悬停查看详情',
      },
    },
  },
  theming: {
    targets: [{className: 'astryx-hover-card'}],
    vars: [
      {
        name: '--_hovercard-radius',
        description: '悬浮卡片的圆角',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_hovercard-radius']}],
  },
  components: [
    {
      name: 'HoverCard',
      displayName: 'Hover Card',
      description:
        '悬浮卡片显示的组件包装器，在悬停或聚焦时触发更丰富、更大的浮层。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '触发元素。文本子元素（字符串或数字，或围绕表达式书写的文本，例如 `Edited {when}`）会被包裹在可聚焦的内联 span 中；`false`、`null` 等空位会被忽略。传入元素时，HoverCard 连接第一个元素，因此该元素无需接受 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '悬浮卡片内容。',
          required: true,
          slotElements: [
            {
              __element: 'Text',
              props: {type: 'body'},
              children: 'Content text',
            },
          ],
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            '相对于锚点元素的位置。逻辑值：start/end 根据弹出层自身继承的方向解析（纯 CSS 下的 RTL 镜像）。',
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
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
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
            '在没有悬停的触摸设备上，轻点的行为。auto：轻点即打开，除非触发元素本身会执行操作（按钮、链接、表单控件），此时轻点归该控件所有；设置了 aria-disabled 的控件不执行操作，因此轻点它会显示其原因。tap：始终轻点打开。none：触摸永不打开。轻点打开的卡片可通过点击卡片外部关闭。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '悬浮卡片弹出层的无障碍名称。提供时，弹出层以具名的 role="dialog" 暴露；省略时，回退为 role="group"（group 可以合法地没有名称）。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '悬浮卡片可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description:
            '在文本触发元素上显示虚线下划线。auto：当 children 是文本（字符串和数字，例如 `Edited {when}`，忽略 `false`、`null` 等空位）时显示。对元素触发器无效，元素保留自身样式。',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description:
            '是否在挂载时显示悬浮卡片。仍然可以关闭。',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            '受控的打开状态。true 保持卡片打开。false 使悬停和焦点都无法打开卡片。受控卡片响应 Escape 时调用 onOpenChange(false) 而不关闭；将 isOpen 设为 false 时关闭，此时卡片内的焦点返回触发元素。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '卡片表面（带有 hover-card 主题目标的元素）的 StyleX 样式。',
        },
        {
          name: 'className',
          type: 'string',
          description:
            '添加到卡片表面的类名，与 hover-card 目标类名并列。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '卡片表面的内联样式。',
        },
      ],
    },
  ],
  usage: {
    description:
      '当用户悬停或聚焦触发元素时，HoverCard 显示附加信息。用于个人资料卡、链接摘要或行内释义等需要更多上下文而无需跳转的场景。',
    bestPractices: [
      {
        guidance: true,
        description:
          '内容保持补充性质；悬浮卡片应在不阻碍主流程的前提下增强理解。',
      },
      {
        guidance: true,
        description:
          '为文本触发元素提供虚线下划线，让用户知道该元素可悬停。',
      },
      {
        guidance: true,
        description:
          '需要对时机或位置做更多控制时，使用 Hook API（useHoverCard）。',
      },
      {
        guidance: true,
        description:
          'touchTrigger 保持 auto：在别无操作的触发元素上轻点即打开卡片，在会执行操作的触发元素上不干扰。',
      },
      {
        guidance: false,
        description:
          '不要把关键操作或必需信息放进悬浮卡片；只出现在悬停时的内容可能被用户错过。',
      },
      {
        guidance: false,
        description:
          '简单的 Tooltip 或 Popover 够用时不要用悬浮卡片。',
      },
      {
        guidance: false,
        description:
          '用户必须交互的内容不要用 HoverCard；光标离开它就消失。',
      },
      {
        guidance: false,
        description:
          '不要把触发元素放进 SVG <foreignObject>。在 Chromium 中它不能作为 CSS 锚点，卡片会在视口角落打开。应把触发元素渲染在覆盖 SVG 节点的 HTML 层中，SVG 只保留形状、边和标签。',
      },
      {
        guidance: true,
        description:
          'HoverCard 尽量放在块级上下文中，而不是直接放在 <p>、标题或链接内。必要时可通过纠正性 portal 支持这些位置，但 DOM 与 Tab 顺序可能不同。',
      },
    ],
    anatomy: [
      {
        name: 'Trigger',
        required: true,
        description:
          '在悬停或聚焦时打开悬浮卡片的元素：按钮、链接或行内文本。',
      },
      {
        name: 'Card',
        required: true,
        description:
          '锚定于触发元素、承载预览内容的浮层。',
      },
      {
        name: 'Body',
        required: true,
        description:
          '主内容区：个人资料、链接摘要或任何富内容。',
      },
      {
        name: 'Actions',
        required: false,
        description:
          '卡片内用于后续操作（如关注或发消息）的可选按钮。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'HoverCard',
  displayName: 'Hover Card',
  theming: {
    targets: [{className: 'astryx-hover-card'}],
    vars: [
      {
        name: '--_hovercard-radius',
        description: 'Border radius of the hover card',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_hovercard-radius']}],
  },
  components: [
    {
      name: 'HoverCard',
      displayName: 'Hover Card',
      description:
        '悬浮卡片显示的组件包装器，在悬停或聚焦时触发更丰富、更大的浮层。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '触发元素。文本子元素（字符串或数字，或围绕表达式书写的文本，例如 `Edited {when}`）会被包裹在可聚焦的内联 span 中；`false`、`null` 等空位会被忽略。传入元素时，HoverCard 连接第一个元素，因此该元素无需接受 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '悬浮卡片内容。',
          required: true,
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            '相对于锚点元素的位置。逻辑值：start/end 根据弹出层自身继承的方向解析（RTL 镜像）。',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '沿放置轴的对齐方式。逻辑值：start/end 根据弹出层自身继承的方向解析（RTL 镜像）。',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: '显示延迟（毫秒）。',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: '隐藏延迟（毫秒）。',
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
            '在没有悬停的触摸设备上，轻点的行为。auto：轻点即打开，除非触发元素本身会执行操作（按钮、链接、表单控件），此时轻点归该控件所有；设置了 aria-disabled 的控件不执行操作，因此轻点它会显示其原因。tap：始终轻点打开。none：触摸永不打开。轻点打开的卡片可通过点击卡片外部关闭。',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '启用或禁用悬停和聚焦触发器。',
          default: 'true',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '悬浮卡片弹出层的无障碍名称。提供时，弹出层以具名的 role="dialog" 暴露；省略时，回退为 role="group"（group 可以合法地没有名称）。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            '悬浮卡片可见性变化时触发的回调。显示时传入 true，隐藏时传入 false。',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description:
            '在文本触发元素上显示虚线下划线。auto：当 children 是文本（字符串和数字，例如 `Edited {when}`，忽略 `false`、`null` 等空位）时显示。对元素触发器无效，元素保留自身样式。',
          default: "'auto'",
        },
        {
          name: 'isDefaultOpen',
          type: 'boolean',
          description: '是否在挂载时显示悬浮卡片。仍然可以关闭。',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            '受控的打开状态。true 保持卡片打开。false 使悬停和焦点都无法打开卡片。受控卡片响应 Escape 时调用 onOpenChange(false) 而不关闭；将 isOpen 设为 false 时关闭，此时卡片内的焦点返回触发元素。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '卡片表面（带有 hover-card 主题目标的元素）的 StyleX 样式。',
        },
        {
          name: 'className',
          type: 'string',
          description: '添加到卡片表面的类名，与 hover-card 目标类名并列。',
        },
        {
          name: 'style',
          type: 'CSSProperties',
          description: '卡片表面的内联样式。',
        },
      ],
    },
  ],
  usage: {
    description:
      'HoverCard shows additional information when the user hovers or focuses a trigger element. Use it for profile cards, link summaries, or inline definitions where the user needs more context without navigating away.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep content supplementary; hover cards should enhance understanding without blocking the primary workflow.',
      },
      {
        guidance: true,
        description:
          'Provide a dashed underline on text triggers so users know the element is hoverable.',
      },
      {
        guidance: true,
        description:
          'Use the hook API (useHoverCard) when you need more control over timing or placement.',
      },
      {
        guidance: true,
        description:
          'Leave touchTrigger on auto so a tap opens the card on triggers that do nothing else, and stays out of the way on triggers that perform an action.',
      },
      {
        guidance: false,
        description:
          'Place critical actions or required information inside a hover card; users may miss content that only appears on hover.',
      },
      {
        guidance: false,
        description:
          'Use a hover card when a simple Tooltip or Popover would suffice.',
      },
      {
        guidance: false,
        description:
          'Use a HoverCard for content the user must interact with; it disappears when the cursor leaves.',
      },
      {
        guidance: false,
        description:
          'Put the trigger inside SVG <foreignObject>. In Chromium it cannot be a CSS anchor, so the card opens at the viewport corner. Render the trigger in an HTML layer positioned over the SVG node instead, and keep the SVG for shapes, edges and labels.',
      },
      {
        guidance: true,
        description:
          'Prefer placing HoverCard in a block context rather than directly in a <p>, heading, or link. Those placements are supported when necessary through a corrective portal, but the DOM and tab order may differ.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '由悬停/聚焦触发的浮层，在锚定触发元素的位置显示富交互内容。',
  usage: {
    description:
      'HoverCard 在悬停/聚焦时显示附加信息。用于个人资料卡、链接摘要、行内释义。',
    bestPractices: [
      {
        guidance: true,
        description:
          '内容保持补充性质；悬浮卡片应在不阻碍主流程的前提下增强理解。',
      },
      {
        guidance: true,
        description:
          '为文本触发元素提供虚线下划线，让用户知道该元素可悬停。',
      },
      {
        guidance: true,
        description:
          '需要对时机或位置做更多控制时，使用 Hook API（useHoverCard）。',
      },
      {
        guidance: true,
        description:
          'touchTrigger 保持 auto：在别无操作的触发元素上轻点即打开卡片，在会执行操作的触发元素上不干扰。',
      },
      {
        guidance: false,
        description:
          '不要把关键操作或必需信息放进悬浮卡片；只出现在悬停时的内容可能被用户错过。',
      },
      {
        guidance: false,
        description:
          '简单的 Tooltip 或 Popover 够用时不要用悬浮卡片。',
      },
      {
        guidance: false,
        description:
          '用户必须交互的内容不要用 HoverCard；光标离开它就消失。',
      },
      {
        guidance: false,
        description:
          '不要把触发元素放进 SVG <foreignObject>：Chromium 无法锚定到它，卡片会在视口角落打开。请使用覆盖在 SVG 节点之上的 HTML 触发元素。',
      },
      {
        guidance: true,
        description:
          '优先使用块级上下文，而不是直接放在 <p>、标题或链接内。必要时可通过纠正性 portal 实现，但 DOM/Tab 顺序可能不同。',
      },
    ],
  },
  components: [
    {
      name: 'HoverCard',
      displayName: 'Hover Card',
      description:
        '悬浮卡片浮层的组件包装器；悬停/聚焦时触发的更丰富浮层。',
      propDescriptions: {
        children:
          '触发元素。文本子元素（字符串/数字，含 `Edited {when}`；忽略 false/null 等空位）会被包进可聚焦的内联 span。传入元素时连接第一个元素（无需 ref）。',
        content: '悬浮卡片内容。',
        placement:
          '相对于锚点元素的位置。逻辑值：start/end 跟随弹出层继承的方向（RTL 镜像）。',
        alignment:
          '沿放置轴的对齐方式。逻辑值：start/end 跟随弹出层继承的方向（RTL 镜像）。',
        delay: '显示延迟（毫秒）。',
        hideDelay: '隐藏延迟（毫秒）。',
        focusTrigger: '控制焦点事件何时触发悬浮卡片。',
        touchTrigger:
          '无悬停时的轻点行为。auto = 轻点即打开，除非触发元素会执行操作（按钮/链接/控件；aria-disabled 控件不执行操作）；tap = 始终打开；none = 触摸永不打开。轻点打开的卡片在点击外部时关闭。',
        isEnabled: '启用/禁用悬停 + 聚焦触发器。',
        label:
          '弹出层的无障碍名称。有 label：具名 role="dialog"；没有：role="group"。',
        onOpenChange:
          '可见性变化时的回调；true=显示，false=隐藏。',
        hasHoverIndication:
          '文本触发元素上的虚线下划线。auto = 文本子元素（字符串/数字，忽略空位）；对元素触发器无效。',
        isDefaultOpen: '挂载时显示悬浮卡片。仍可关闭。',
        isOpen:
          '受控打开状态。true 保持打开；false 抵挡悬停和焦点保持关闭。Escape 调用 onOpenChange(false) 但不关闭；设为 false 时，卡片内焦点返回触发元素。',
        xstyle: '卡片表面（hover-card 目标）的 StyleX 样式。',
        className: '添加到卡片表面的类名。',
        style: '卡片表面的内联样式。',
      },
    },
  ],
};
