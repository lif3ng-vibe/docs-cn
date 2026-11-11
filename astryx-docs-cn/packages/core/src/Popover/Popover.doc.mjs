// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Popover',
  displayName: 'Popover',
  group: 'Popover',
  category: 'Overlay',
  keywords: [
    'popover',
    'popup',
    'dropdown',
    'tooltip',
    'overlay',
    'flyout',
    'callout',
    'popper',
    'anchor',
    'floating',
    'bubble',
  ],
  components: [
    {
      name: 'Popover',
      displayName: 'Popover',
      description:
        '点击触发的浮层（popover），在锚定于触发元素的位置展示交互内容。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '触发元素。必须包含一个 <button> 或 [role="button"] 元素。',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            '兄弟模式下用作弹出框锚点的外部 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '在弹出框内显示的内容。',
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
            '相对触发器的位置放置。逻辑值：start/end 依据弹出层自身继承的方向解析，RTL 环境经纯 CSS 自动镜像。',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '沿放置轴的对齐方式。逻辑值：start/end 跟随弹出层自身继承的方向（RTL 镜像）。',
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: '受控模式下弹出框是否显示。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '弹出框可见性变化时触发的回调。',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '设为 false 时忽略触发器交互。',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description:
            '弹出框容器的宽度。弹出层仍限制在视口内、带对齐感知的安全区留白，之后长内容再滚动。',
          default: "'auto'",
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '弹出框表面的内边距，使用间距刻度（0、0.5、1、1.5、2、3、4、5、6、8、10），与 Card 和 Stack 的 padding prop 一致。内容自带边缘（如行列表或带分隔线的标题）时传 0 得到无内边距的表面，由内容自己设置内边距。内边距落在着色的弹出框目标上，因此该目标上的主题内边距会取代它。',
          default: '3',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '弹出框对话框的无障碍标签。没有标签的 sheet 以触发器的文本命名。',
        },
        {
          name: 'role',
          type: "'dialog' | 'none'",
          description:
            '弹出框包装器的 ARIA 角色。对话框式弹出框用 dialog；内容自带角色（如 menu 或 listbox）时用 none。',
          default: "'dialog'",
        },
        {
          name: 'isModal',
          type: 'boolean',
          description:
            '对话框式弹出框是否设置 aria-modal。仅在 role 为 dialog 时适用。',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description:
            '是否包含用于无障碍的隐藏关闭按钮。',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: '隐藏关闭按钮的标签。',
          default: "'Close popover'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description:
            '弹出框打开时是否把焦点移入其中。焦点进入内容中第一个真正的控件；没有此类控件的对话框回退到带标签的表面。生成的回退关闭控件保持隐藏，直到键盘导航到达。输入框自持焦点、行内展示或文档预览场景设为 false。',
          default: 'true',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description:
            '点击外部是否关闭弹出框。需要保持打开直到显式关闭的表面（如新手引导提示）设为 false。',
          default: 'true',
        },
        {
          name: 'hasEscapeDismiss',
          type: 'boolean',
          description:
            '按 Escape 是否关闭弹出框。仅与 hasLightDismiss={false} 同用时完全生效，因为原生 light dismiss 也在 Escape 时关闭。',
          default: 'true',
        },
        {
          name: 'presentation',
          type: "'popover' | 'bottom-sheet' | 'adaptive'",
          description:
            "承载内容的表面。'popover' 锚定在触发器上，'bottom-sheet' 以模态 BottomSheet 呈现（由 label 命名），'adaptive' 在紧凑触屏（主题视为紧凑的屏幕上的粗指针：宽度小于其 md 断点或高度小于 500 px，即任意方向的手机）上使用 BottomSheet，其余使用锚定弹出框。在 sheet 中，placement、alignment、width、role、isModal 与 hasAutoFocus 不生效，xstyle、className 和 style 作用于 sheet 的面板；sheet 始终支持点击外部关闭（点按外部或向下轻扫即关闭，无论 hasLightDismiss 如何），Escape 遵循 hasEscapeDismiss，回退关闭控件保持隐藏。表面在打开时选定，并保持到关闭。",
          default: "'popover'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局定制（边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
        },
      ],
    },
  ],
  examples: [
    {
      label: '行列表的无内边距表面',
      code: `<Popover
  label="Recent files"
  padding={0}
  content={
    <List>
      <ListItem label="Quarterly report.pdf" />
      <ListItem label="Roadmap.key" />
    </List>
  }>
  <Button label="Recent" variant="secondary" />
</Popover>`,
    },
    {
      label: '表单的宽松表面',
      code: `<Popover
  label="Save search"
  padding={4}
  content={<SaveSearchForm />}>
  <Button label="Save search" variant="secondary" />
</Popover>`,
    },
  ],
  playground: {
    defaults: {
      content: {
        __element: 'Text',
        props: {type: 'body'},
        children: '弹出框内容显示在这里。',
      },
      children: {
        __element: 'Button',
        props: {label: '打开弹出框', variant: 'secondary'},
      },
    },
  },
  theming: {
    targets: [
      // Canonical broad target for the painted Popover surface.
      {className: 'astryx-popover'},
    ],
    vars: [
      {
        name: '--_popover-radius',
        description: '弹出框表面的圆角',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_popover-radius']}],
  },
  usage: {
    description:
      '点击触发的覆盖层，锚定在按钮或触发元素上。用于次要操作、行内确认，或不值得整个对话框的补充信息。悬停预览用 HoverCard，简短帮助文本用 Tooltip。在手指下（主指针为粗指针）时，它像原生 popover 一样呈现：从触发器中长出、又缩回触发器，走主题的动效令牌；减弱动效时仅在 200 ms 内交叉淡入淡出，只动透明度。',
    bestPractices: [
      {
        guidance: true,
        description:
          '弹出框内容聚焦在单一任务或一条信息上。',
      },
      {
        guidance: true,
        description:
          '提供清楚的关闭方式：点击外部，或显式的关闭按钮。',
      },
      {
        guidance: true,
        description:
          '经规范的弹出框目标为主题定制着色表面。',
      },
      {
        guidance: false,
        description:
          '不要在弹出框内再嵌套弹出框；会产生混乱的焦点与导航。',
      },
      {
        guidance: false,
        description:
          '不要只凭输入复杂程度决定呈现方式；要评估任务的焦点、空间与交互需求。',
      },
      {
        guidance: false,
        description:
          '不要只凭需要滚动就断定 Popover 是错的组件；有界的 Popover 可以滚动，同时聚焦的锚定交互仍然合适。',
      },
    ],
    anatomy: [
      {
        name: 'Trigger element',
        required: true,
        description:
          '锚定并切换弹出层的调用方提供或外部引用的控件。',
      },
      {
        name: 'Popover surface',
        required: true,
        description:
          '由 Popover 经规范弹出框目标拥有和主题定制的着色表面。',
      },
      {
        name: 'Touch sheet',
        required: false,
        description:
          '在 presentation="bottom-sheet" 或紧凑触屏上的 "adaptive" 时，承载同一内容、取代弹出框表面的 BottomSheet 表面；经底部面板目标主题定制。',
      },
      {
        name: 'Popover content',
        required: true,
        description: '渲染在表面内的调用方内容。',
      },
      {
        name: 'Fallback close control',
        required: false,
        description:
          '启用时由 usePopover 追加的键盘可达关闭功能。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Popover',
  displayName: 'Popover',
  components: [
    {
      name: 'Popover',
      displayName: 'Popover',
      description: '一个点击触发的弹出框，用于显示锚定到触发元素的交互式内容。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '触发元素。必须包含一个 <button> 或 [role="button"] 元素。',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description: '在兄弟模式下用作弹出框锚点的外部 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '在弹出框内显示的内容。',
          required: true,
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description:
            '相对于触发器的位置放置方式。逻辑值：start/end 根据弹出层自身继承的方向解析，RTL 环境通过纯 CSS 自动镜像。',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: "'start' | 'center' | 'end'",
          description:
            '沿放置轴的对齐方式。逻辑值：start/end 跟随弹出层自身继承的方向（RTL 镜像）。',
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: '在受控模式下弹出框是否显示。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '弹出框可见性变化时触发的回调。',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '设为 false 时，忽略触发器交互。',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description:
            '弹出框容器的宽度。弹出层仍会限制在视口和安全区域留白内，长内容再滚动。',
          default: "'auto'",
        },
        {
          name: 'padding',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description:
            '弹出框表面的内边距，使用间距刻度（0、0.5、1、1.5、2、3、4、5、6、8、10），与 Card 和 Stack 的 padding 属性一致。当内容自行管理边缘（如行列表或带分隔线的标题）时传入 0 使表面无内边距，并由内容自行设置内边距。',
          default: '3',
        },
        {
          name: 'label',
          type: 'string',
          description:
            '弹出框对话框的无障碍标签。没有标签的底部面板以触发器的文本命名。',
        },
        {
          name: 'role',
          type: "'dialog' | 'none'",
          description:
            '弹出框包装器的 ARIA 角色。对话框式弹出框使用 dialog；当内容提供自己的角色（如 menu 或 listbox）时使用 none。',
          default: "'dialog'",
        },
        {
          name: 'isModal',
          type: 'boolean',
          description:
            '对话框式弹出框是否设置 aria-modal。仅在 role 为 dialog 时适用。',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: '是否包含用于无障碍访问的隐藏关闭按钮。',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: '隐藏关闭按钮的标签。',
          default: "'Close popover'",
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description:
            '弹出框打开时是否将焦点移入其中。优先聚焦调用方内容中的第一个控件；若对话框没有此类控件，则聚焦带标签的表面。生成的关闭按钮仅在键盘导航到达时显示。',
          default: 'true',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description:
            '点击外部是否关闭弹出框。需要显式关闭的界面（如新手引导提示）设为 false。',
          default: 'true',
        },
        {
          name: 'hasEscapeDismiss',
          type: 'boolean',
          description:
            '按 Escape 是否关闭弹出框。仅在 hasLightDismiss={false} 时生效，因为原生 light dismiss 行为同样响应 Escape。',
          default: 'true',
        },
        {
          name: 'presentation',
          type: "'popover' | 'bottom-sheet' | 'adaptive'",
          description:
            "承载内容的界面。'popover' 锚定在触发器上，'bottom-sheet' 以模态 BottomSheet 呈现（由 label 命名），'adaptive' 在紧凑触屏（粗指针，且屏幕按主题定义为紧凑：宽度小于其 md 断点或高度小于 500 px，即任意方向的手机）上使用 BottomSheet，在其他设备上使用锚定的弹出框。在底部面板中，placement、alignment、width、role、isModal 和 hasAutoFocus 不生效，xstyle、className 和 style 作用于面板；底部面板始终支持轻触关闭（点按面板外部或向下轻扫即可关闭，不受 hasLightDismiss 影响），Escape 遵循 hasEscapeDismiss，后备关闭按钮保持隐藏。界面在打开时选定，并保持到关闭。",
          default: "'popover'",
        },
      ],
    },
  ],
  theming: {
    targets: [
      // Canonical broad target for the painted Popover surface.
      {className: 'astryx-popover'},
    ],
    vars: [
      {
        name: '--_popover-radius',
        description: 'Border radius of the popover surface',
        default: 'var(--radius-container)',
        private: true,
      },
    ],
    derived: [{property: 'borderRadius', vars: ['--_popover-radius']}],
  },
  usage: {
    description:
      'A click-triggered overlay anchored to a button or trigger element. Use it for secondary actions, inline confirmations, or supplementary information that does not warrant a full dialog. For hover previews use HoverCard, for brief helper text use Tooltip. Under a finger (a coarse primary pointer), it is presented like a native popover: it grows out of its trigger and shrinks back into it on the theme\u2019s motion tokens; with reduced motion it cross-fades, opacity only, in 200 ms or less.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep popover content focused on a single task or piece of information.',
      },
      {
        guidance: true,
        description:
          'Provide a clear way to close: either by clicking outside or with an explicit close button.',
      },
      {
        guidance: true,
        description:
          'Theme the painted surface through the canonical popover target.',
      },
      {
        guidance: false,
        description:
          'Nest popovers inside other popovers; it creates confusing focus and navigation.',
      },
      {
        guidance: false,
        description:
          "Assume input complexity alone determines the presentation; evaluate the task's focus, space, and interaction requirements.",
      },
      {
        guidance: false,
        description:
          'Assume scrolling alone means Popover is the wrong component; a bounded Popover may scroll while a focused anchored interaction remains appropriate.',
      },
    ],
    anatomy: [
      {
        name: 'Trigger element',
        required: true,
        description:
          'Caller-supplied or externally referenced control that anchors and toggles the popover.',
      },
      {
        name: 'Popover surface',
        required: true,
        description:
          'Painted surface owned and themed by Popover through the canonical popover target.',
      },
      {
        name: 'Touch sheet',
        required: false,
        description:
          'BottomSheet surface that holds the same content in place of the popover surface for presentation="bottom-sheet", or "adaptive" on a compact touch screen; themed through the bottom-sheet target.',
      },
      {
        name: 'Popover content',
        required: true,
        description: 'Caller-supplied content rendered inside the surface.',
      },
      {
        name: 'Fallback close control',
        required: false,
        description:
          'Keyboard-reachable close affordance appended by usePopover when enabled.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '点击触发的弹出框，显示锚定到触发元素的交互式内容；实现 button+dialog 的 ARIA 模式。',
  usage: {
    description:
      '点击触发的覆盖层，锚定在按钮或触发元素上。用于次要操作、行内确认，或不值得整个对话框的补充信息。悬停预览用 HoverCard，简短帮助文本用 Tooltip。在手指下（主指针为粗指针）时，它像原生 popover 一样呈现：从触发器中长出、又缩回触发器，走主题的动效令牌；减弱动效时仅在 200 ms 内交叉淡入淡出，只动透明度。',
    bestPractices: [
      {
        guidance: true,
        description:
          '弹出框内容聚焦在单一任务或一条信息上。',
      },
      {
        guidance: true,
        description:
          '提供清楚的关闭方式：点击外部，或显式的关闭按钮。',
      },
      {
        guidance: true,
        description:
          '经规范的弹出框目标为主题定制着色表面。',
      },
      {
        guidance: false,
        description:
          '不要在弹出框内再嵌套弹出框；会产生混乱的焦点与导航。',
      },
      {
        guidance: false,
        description:
          '不要只凭输入复杂程度决定呈现方式；要评估任务的焦点、空间与交互需求。',
      },
      {
        guidance: false,
        description:
          '不要只凭需要滚动就断定 Popover 是错的组件；有界的 Popover 可以滚动，同时聚焦的锚定交互仍然合适。',
      },
    ],
    anatomy: [
      {
        name: 'Trigger element',
        required: true,
        description:
          '锚定并切换弹出层的调用方提供或外部引用的控件。',
      },
      {
        name: 'Popover surface',
        required: true,
        description:
          '由 Popover 经规范弹出框目标拥有和主题定制的着色表面。',
      },
      {
        name: 'Touch sheet',
        required: false,
        description:
          '在 presentation="bottom-sheet" 或紧凑触屏上的 "adaptive" 时，承载同一内容、取代弹出框表面的 BottomSheet 表面；经底部面板目标主题定制。',
      },
      {
        name: 'Popover content',
        required: true,
        description: '渲染在表面内的调用方内容。',
      },
      {
        name: 'Fallback close control',
        required: false,
        description:
          '启用时由 usePopover 追加的键盘可达关闭功能。',
      },
    ],
  },
  components: [
    {
      name: 'Popover',
      displayName: 'Popover',
      description:
        '点击触发的弹出框，显示锚定到触发元素的交互式内容。',
      propDescriptions: {
        children:
          '触发元素。必须包含 <button> 或 [role="button"] 元素。',
        anchorRef: '兄弟模式下弹出框锚点的外部 ref。',
        content: '在弹出框内显示的内容。',
        placement:
          '相对触发器的位置。逻辑值：start/end 依据弹出层继承的方向解析（RTL 镜像）。',
        alignment:
          '沿放置轴的对齐。逻辑值：start/end 跟随弹出层继承的方向（RTL 镜像）。',
        isOpen: '受控模式下弹出框是否显示。',
        onOpenChange: '弹出框可见性变化时触发的回调。',
        isEnabled: '设为 false 时忽略触发器交互。',
        width:
          '弹出框容器宽度；先限制在对齐感知的视口/安全区留白内，长内容再滚动。',
        label: '弹出框对话框的无障碍标签。',
        hasCloseButton:
          '是否包含用于无障碍的隐藏关闭按钮。',
        closeButtonLabel: '隐藏关闭按钮的标签。',
        hasAutoFocus:
          '打开时把焦点移入真正的弹出框内容，带标签表面回退；生成的关闭控件保持隐藏，直到键盘到达。',
        hasLightDismiss:
          '点击外部关闭；显式关闭的表面（引导提示）设为 false。',
        hasEscapeDismiss:
          'Escape 关闭；仅在 hasLightDismiss=false 时完全生效。',
        presentation:
          "表面：'popover'（锚定）、'bottom-sheet'（模态 BottomSheet）或 'adaptive'（紧凑屏幕上的粗指针用 BottomSheet，其余用弹出框）；打开时选定，保持到关闭。",
      },
    },
  ],
};
