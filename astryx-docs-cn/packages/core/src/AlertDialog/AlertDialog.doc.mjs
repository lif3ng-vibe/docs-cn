// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AlertDialog',
  displayName: 'Alert Dialog',
  group: 'Dialog',
  category: 'Overlay',
  isHiddenFromOverview: true,
  keywords: [
    '警告',
    'alertdialog',
    '确认',
    '确认操作',
    '破坏性',
    '删除',
    '模态',
    '对话框',
    '命令式',
  ],
  usage: {
    description:
      'AlertDialog 在破坏性或不可逆操作发生之前要求用户确认。适用于删除内容、撤销访问权限、丢弃未保存更改等场景。\n\n它实现了 WAI-ARIA APG 的 [Alert Dialog 模式](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)：`role="alertdialog"`、通过 `aria-labelledby` 关联的标题、通过 `aria-describedby` 关联的后果说明；打开时焦点移入对话框，关闭时返回触发器；不支持点击外部关闭，按 Escape 即取消。\n\nAlertDialog 将其请求的宽度传递给 Dialog，由 Dialog 以令牌（token）边距将表面（surface）钳制在容器与动态视口范围内。通用 Dialog 的页脚应当允许换行，但 Dialog 不负责操作的语义与顺序，这由使用方的组合方式决定。AlertDialog 自己负责确认语义：宽度大于 640px 时操作按钮横向排列，且可能换到另一行；宽度等于或小于 640px 时，破坏性操作显示在取消按钮上方，两个按钮占满页脚宽度。按钮标签保持标准的单行行为。该断点取决于可用宽度，与指针或悬停能力无关。当纵向空间受限时，内容区可滚动。\n\n在所有指针类型下，两个操作都作为一个整体来跟踪，方式与 iOS 跟踪警告框操作一致：按下时指针下的操作立即高亮，高亮随指针从一个操作移动到另一个，抬起时执行其下方的操作；若在两个操作之外抬起，则不执行任何操作。键盘与辅助技术保留每个按钮的点击行为。\n\n如果希望展示警告框而不自行管理打开状态，可以使用 `useImperativeAlertDialog` Hook：调用 `alert.show(options)` 并在组件树中渲染 `alert.element`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '操作按钮标签要具体："删除项目" 优于 "确定" 或 "确认"。',
      },
      {
        guidance: true,
        description:
          '在 description 中说明将会发生什么，让用户在确认前了解后果。',
      },
      {
        guidance: true,
        description:
          '将取消按钮作为破坏性最低的焦点目标。在窄屏上，破坏性操作在视觉与结构上都位于取消按钮上方，但初始焦点仍落在取消按钮上。',
      },
      {
        guidance: true,
        description:
          '使用简明、具体的操作标签。宽度大于 640px 时，完整按钮可能换到另一行；宽度等于或小于 640px 时，破坏性操作显示在取消按钮上方，两个按钮占满页脚宽度。',
      },
      {
        guidance: false,
        description:
          '不要将 AlertDialog 用于非破坏性操作；此时应改用标准 Dialog。',
      },
      {
        guidance: false,
        description:
          '仅靠颜色传达危险；操作标签本身应说明将发生什么。',
      },
      {
        guidance: false,
        description:
          '在工作完成前就在 onAction 中关闭对话框；应通过 isActionLoading 保持打开，待操作结束后再调用 onOpenChange(false)。',
      },
    ],
    anatomy: [
      {
        name: 'Title',
        required: true,
        description:
          '所提出的问题。渲染为二级标题，并通过 aria-labelledby 关联对话框。',
      },
      {
        name: 'Description',
        required: true,
        description:
          '用户确认后将会发生什么。通过 aria-describedby 关联到对话框。',
      },
      {
        name: 'Cancel button',
        required: true,
        description:
          '不作任何操作直接关闭的幽灵按钮。接收初始焦点，按 Escape 效果相同。',
      },
      {
        name: 'Action button',
        required: true,
        description:
          '确认操作。默认为破坏性样式；设置 isActionLoading 时显示加载指示器。',
      },
      {
        name: 'Backdrop',
        required: true,
        description:
          '对话框背后的遮罩层，阻止页面交互。点击它不会关闭对话框。',
      },
      {
        name: 'Dialog surface',
        required: true,
        description:
          '承载标题、描述与按钮的模态面板。',
      },
    ],
  },
  // Intentionally a contained isInline preview, not playground.overlay: the
  // component stays visible on load and knobs stay live, whereas a real
  // showModal() overlay makes the page inert — see ComponentPlaygroundConfig.overlay
  // in docs-types.ts (#3657).
  playground: {
    defaults: {
      isOpen: true,
      isInline: true,
      onOpenChange: undefined,
      title: '删除该项？',
      description:
        '此操作无法撤销。该项及其所有数据将被永久删除。',
      actionLabel: '删除',
    },
  },
  description:
    '要求用户确认破坏性操作的模态对话框。',
  props: [
    {
      name: 'isOpen',
      type: 'boolean',
      required: true,
      description: '对话框是否打开。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      required: true,
      description: '可见性变化回调。',
    },
    {
      name: 'title',
      type: 'string',
      required: true,
      description: '对话框标题。通过 aria-labelledby 关联。',
    },
    {
      name: 'description',
      type: 'string',
      required: true,
      description: '后果说明。通过 aria-describedby 关联。',
    },
    {
      name: 'actionLabel',
      type: 'string',
      required: true,
      description: '操作按钮标签。',
    },
    {
      name: 'onAction',
      type: '() => unknown',
      required: true,
      description: '点击操作按钮时调用。不会自动关闭。',
    },
    {
      name: 'cancelLabel',
      type: 'string',
      default: "'Cancel'",
      description: '取消按钮标签。',
    },
    {
      name: 'actionVariant',
      type: 'ButtonVariant',
      default: "'destructive'",
      description: '操作按钮的变体。',
    },
    {
      name: 'isActionLoading',
      type: 'boolean',
      description: '在操作按钮上显示加载指示器。',
    },
    {
      name: 'width',
      type: 'number | string',
      default: '400',
      description:
        '请求的对话框宽度。Dialog 会保留这一期望宽度，并以令牌边距将其钳制在容器与动态视口范围内。',
    },
    {
      name: 'isInline',
      type: 'boolean',
      default: 'false',
      description:
        '以内联方式渲染警告框内容，不具备模态行为。仅供文档预览与展示（showcase）使用。由于不是模态，内联路径渲染 role="group" 而非 role="alertdialog"。',
    },
  ],
  components: [{name: 'useImperativeAlertDialog'}],
  theming: {
    targets: [{className: 'astryx-alert-dialog'}],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '在破坏性或不可逆操作发生之前进行确认（删除、撤销访问权限、丢弃未保存更改）。',
  usage: {
    description:
      'AlertDialog 在破坏性或不可逆操作发生前进行确认（删除、撤销访问权限、丢弃更改）。实现 WAI-ARIA APG Alert Dialog 模式（https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/）：role="alertdialog"、aria-labelledby 关联标题、aria-describedby 关联说明、打开时焦点移入对话框并在关闭时返回触发器、不支持点击外部关闭、按 Escape 取消。Dialog 保留请求宽度并以边距钳制在容器/动态视口内。通用 Dialog 页脚可换行，操作顺序由使用方决定。AlertDialog 负责确认操作的布局：宽度 >640px 时横向按钮可能换到另一行；宽度 <=640px 时破坏性操作显示在取消按钮上方且两按钮占满宽度，与指针/悬停能力无关。按钮标签保持单行。高度受限时内容区滚动。所有指针类型下两个操作作为一个整体跟踪，与 iOS 警告框一致（指针下的操作立即高亮、高亮随指针切换、抬起执行其下操作、两者之外抬起不执行任何操作）；键盘/辅助技术保留各按钮的点击。若要免管理打开状态地展示警告框，使用 useImperativeAlertDialog Hook：调用 alert.show(options) 并在组件树中渲染 alert.element。',
    bestPractices: [
      {
        guidance: true,
        description:
          '操作按钮标签要具体："删除项目" 优于 "确定"/"确认"。',
      },
      {
        guidance: true,
        description:
          '在 description 中说明后果，让用户确认前了解结果。',
      },
      {
        guidance: true,
        description:
          '取消按钮保持初始焦点：即使窄屏视觉/DOM 顺序将其排在破坏性操作之后，破坏性最低的选项仍是预选对象。',
      },
      {
        guidance: true,
        description:
          '操作标签要简明；宽度 >640px 时完整按钮可能换到另一行，宽度 <=640px 时破坏性操作显示在取消按钮上方且两按钮占满宽度，与指针类型无关。',
      },
      {
        guidance: false,
        description:
          '不要将 AlertDialog 用于非破坏性操作；应改用标准 Dialog。',
      },
      {
        guidance: false,
        description:
          '仅靠颜色传达危险；操作标签应说明将发生什么。',
      },
      {
        guidance: false,
        description:
          '不要在工作完成前就从 onAction 关闭；用 isActionLoading 保持打开，结束后调用 onOpenChange(false)。',
      },
    ],
  },
};
