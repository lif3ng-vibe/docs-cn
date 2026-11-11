// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'FileInput',
  displayName: 'File Input',
  category: 'Form Controls',
  keywords: ["fileinput","file","upload","drag","drop","dropzone","attachment","browse","文件上传","拖放","附件","文件选择"],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '文件输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'value',
      type: 'File | File[] | null',
      description: '当前选中的文件。受控组件。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(files: File | File[] | null) => void',
      description: '文件选择或移除时触发的回调。',
      required: true,
    },
    {
      name: 'changeAction',
      type: '(files: File | File[] | null) => Promise<void>',
      description:
        '异步 change action（React 19 transitions 模式）。用于选择文件后立即上传。',
    },
    {
      name: 'accept',
      type: 'string',
      description:
        '接受的文件类型。使用 HTML accept 属性格式（如 "image/*"、".pdf,.doc"）。',
    },
    {
      name: 'isMultiple',
      type: 'boolean',
      description: '是否可选多个文件。为 true 时 value 和 onChange 使用 File[] 而不是 File。',
      default: 'false',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: '最大文件大小（字节）。超出的文件会被拒绝并显示错误状态。',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: '最大文件数（仅在 isMultiple 为 true 时适用）。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏标签，同时保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '在标签旁显示 "可选" 指示器。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '在标签旁显示 "必填" 指示器，并为触发器添加仅供屏幕阅读器的 "必填" 描述（辅助技术无法可靠播报触发器上的 aria-required）。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入框，阻止交互并使元素变暗。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持触发器可聚焦（打开文件选择器仍被阻止）。请使用此属性，而不是用 Tooltip 包裹已禁用的 FileInput；禁用的控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '将输入框置于加载状态，显示加载指示器并设置 aria-busy。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择文件时显示的占位符文本。',
      default: '"Choose file" or "Choose files"',
    },
    {
      name: 'mode',
      type: "'input' | 'dropzone'",
      description: "视觉模式。'input' 为紧凑内联样式；'dropzone' 为支持拖放的较大区域。",
      default: "'input'",
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description:
        '校验状态：应用彩色边框。提供 message 时在输入框下方显示浮动消息。error 类型还会设置 aria-invalid。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。dropzone 模式不支持 attached：请使用 detached 或 tooltip。从下一个次版本起，dropzone 会将 attached 解析为 detached，并以其为默认值。',
      default: "'attached'",
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '显示在标签末尾信息图标中的工具提示文本。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串原样使用，如 "100%"）。它决定整个字段（标签、控件和状态）的尺寸，使其保持对齐。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内（请改为设置 InputGroup 的样式）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框和背景并包含图标与尾部控件的元素，绝非原生输入元素。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-file-input', visualProps: ['mode', 'status']},
      {className: 'astryx-file-input-icon', visualProps: ['mode']},
    ],
  },
  usage: {
    description:
      'FileInput 提供文件上传，可选支持拖放。用于单个或多个文件选择，内建文件类型、大小和数量校验。配合校验状态提供上传反馈。',
    bestPractices: [
      {guidance: true, description: '务必指定 accept prop，引导用户选择有效的文件类型。'},
      {guidance: true, description: '使用 maxSize 和 maxFiles 防止过大的上传；组件会自动处理校验和错误展示。'},
      {guidance: true, description: '添加 description 说明限制，如文件大小上限或接受的格式。'},
      {guidance: true, description: '需要乐观 UI 的即时上传工作流，使用 changeAction。'},
      {guidance: false, description: '不要用 FileInput 做目录或文件夹上传；v1 不支持。'},
      {guidance: false, description: '不要仅因空间紧张就避开 dropzone 模式；拖放是文件上传的预期交互。'},
      {guidance: false, description: '不要用 Tooltip 包裹已禁用的 FileInput 来解释禁用原因；禁用的控件会吞掉包装器所需的悬停事件。请改用 disabledMessage prop。'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: '标识字段的文本。即使视觉隐藏，出于无障碍也始终渲染。'},
      {name: 'Description', required: false, description: '标签与拖放区之间的帮助文本，说明接受的格式或大小限制。'},
      {name: 'Drop zone', required: true, description: '用于文件选择的可点击区域。dropzone 模式下还接受拖入的文件。'},
      {name: 'Upload icon', required: false, description: '拖放区中提示上传动作的上传托盘图标。'},
      {name: 'Placeholder', required: false, description: '未选择文件时显示的提示文本。'},
      {name: 'File name display', required: false, description: '显示所选文件的名称。'},
      {name: 'Clear button', required: false, description: '移除所选文件并把焦点还给文件选择触发器的关闭按钮。'},
      {name: 'Spinner', required: false, description: '异步上传动作期间出现的加载指示器。'},
      {name: 'Status message', required: false, description: '带消息的校验反馈，显示 error、warning 或 success。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'FileInput',
  displayName: 'File Input',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '文件输入框的无障碍标签。',
      required: true,
    },
    {
      name: 'value',
      type: 'File | File[] | null',
      description: '当前选中的文件。受控组件。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(files: File | File[] | null) => void',
      description: '文件选择或移除时触发的回调。',
      required: true,
    },
    {
      name: 'accept',
      type: 'string',
      description: '接受的文件类型。使用 HTML accept 属性格式。',
    },
    {
      name: 'isMultiple',
      type: 'boolean',
      description: '是否可以选择多个文件。',
      default: 'false',
    },
    {
      name: 'maxSize',
      type: 'number',
      description: '最大文件大小（字节）。超过此限制的文件将被拒绝。',
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: '最大文件数（仅在 isMultiple 为 true 时适用）。',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉上隐藏标签，保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签和输入框之间的描述文本。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用输入框，阻止交互并使元素变暗。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '说明输入框被禁用的原因。与 isDisabled 一起使用时，在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持触发器可聚焦（打开文件选择器仍被阻止）。请使用此属性，而不是用 Tooltip 包裹已禁用的 FileInput。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '加载状态，显示旋转器并设置 aria-busy。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '未选择文件时显示的占位符文本。',
    },
    {
      name: 'mode',
      type: "'input' | 'dropzone'",
      description: "视觉模式。'input' 为紧凑内联样式；'dropzone' 为支持拖放的较大区域。",
      default: "'input'",
    },
    {
      name: 'status',
      type: "{type: 'error' | 'warning' | 'success', message?: string}",
      description: '验证状态。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        '状态消息相对于输入框的放置方式。attached 直接叠加在输入框下方（带边框处理）；detached 作为独立元素浮于下方并留有间距；tooltip 隐藏消息框，并在状态图标上以提示气泡形式显示。dropzone 模式不支持 attached：请使用 detached 或 tooltip。从下一个次版本起，dropzone 会将 attached 解析为 detached，并以其为默认值。',
      default: "'attached'",
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件和状态整体）的 StyleX 样式。在 InputGroup 内（请改为设置 InputGroup 的样式）或 `horizontal-labels` FormLayout 中无效。不接受根级 `xstyle`、`className` 和 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: '字段容器的内联样式，作用目标同 `containerXstyle`。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视控件框的 StyleX 样式：绘制边框和背景并包含图标与尾部控件的元素，而非原生输入元素。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视控件框的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视控件框的内联样式。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-file-input', visualProps: ['mode', 'status']},
      {className: 'astryx-file-input-icon', visualProps: ['mode']},
    ],
  },
  usage: {
    description:
      'FileInput provides file upload with optional drag-and-drop support. Use it for single or multiple file selection with built-in validation for file type, size, and count. Pair with validation status for upload feedback.',
    bestPractices: [
      {guidance: true, description: 'Always specify an accept prop to guide users toward valid file types.'},
      {guidance: true, description: 'Use maxSize and maxFiles to prevent oversized uploads.'},
      {guidance: true, description: 'Add a description to communicate constraints.'},
      {guidance: false, description: "Don't use FileInput for directory uploads."},
      {guidance: false, description: "Don't use mode='input' unless space is constrained; dropzone mode provides a better experience."},
      {guidance: false, description: "Don't wrap a disabled FileInput in Tooltip to explain the disabled state; use the disabledMessage prop instead."},
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'Text identifying the field.'},
      {name: 'Drop zone', required: true, description: 'Clickable area for file selection.'},
      {name: 'Placeholder', required: false, description: 'Hint text when no files selected.'},
      {name: 'File name display', required: false, description: 'Shows selected file names.'},
      {name: 'Clear button', required: false, description: 'Removes selected files.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '文件输入组件，带 input/dropzone 模式、校验、label、description、status。',
  usage: {
    description:
      'FileInput 提供文件上传，可选支持拖放。用于单个或多个文件选择，内建文件类型、大小和数量校验。',
    bestPractices: [
      {guidance: true, description: '务必指定 accept prop，引导用户选择有效的文件类型。'},
      {guidance: true, description: '使用 maxSize 和 maxFiles 防止过大的上传。'},
      {guidance: true, description: '添加 description 说明限制。'},
      {guidance: true, description: '需要乐观 UI 的即时上传工作流，使用 changeAction。'},
      {guidance: false, description: '不要用 FileInput 做目录上传。'},
      {guidance: false, description: "空间不紧张就不要用 mode='input'；dropzone 模式体验更好。"},
      {guidance: false, description: '不要用 Tooltip 包裹已禁用的 FileInput 来解释禁用状态；请改用 disabledMessage prop。'},
    ],
    anatomy: [
      {name: 'Label', required: true, description: '标识字段的文本。'},
      {name: 'Drop zone', required: true, description: '用于文件选择的可点击区域。'},
      {name: 'Placeholder', required: false, description: '未选择文件时的提示文本。'},
      {name: 'File name display', required: false, description: '显示所选文件的名称。'},
      {name: 'Clear button', required: false, description: '移除所选文件。'},
    ],
  },
  propDescriptions: {
    containerXstyle: '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
    containerClassName: '字段容器的类名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle: '可视控件框（边框、背景、图标）的 StyleX 样式；不是原生输入元素。',
    controlClassName: '可视控件框的类名。',
    controlStyle: '可视控件框的内联样式。',
    label: '文件输入框的无障碍标签。',
    value: '当前选中的文件。受控。',
    onChange: '文件选择或移除时触发。',
    changeAction: 'onChange 之后的异步 action。用于即时上传。',
    accept: '接受的文件类型（HTML accept 格式）。',
    isMultiple: '允许多选文件。',
    maxSize: '最大文件大小（字节）。拒绝超限文件。',
    maxFiles: '最大文件数（仅 isMultiple）。',
    isLabelHidden: '视觉隐藏标签；保留屏幕阅读器访问。',
    description: 'label 与输入框之间的描述文本。',
    isOptional: '显示 "可选" 指示器。',
    isRequired: '显示 "必填" 指示器 + 仅供屏幕阅读器的触发器描述。',
    isDisabled: '禁用输入框，阻止交互。',
    disabledMessage:
      '说明输入框被禁用的原因。与 isDisabled 一起用时，在悬停/聚焦时显示工具提示 + 通过 aria-disabled 保持触发器可聚焦（打开选择器仍被阻止）。用它代替 Tooltip 包裹。',
    isLoading: '加载状态，带加载指示器 + aria-busy。',
    placeholder: '未选择文件时的占位符。',
    mode: "视觉模式：'input'（紧凑）或 'dropzone'（拖放）。",
    status: '校验状态；彩色边框。消息浮动于下方。',
    statusVariant: '状态消息的放置方式：attached 叠放于输入框下方；detached 带间距浮于下方；tooltip 隐藏消息框并在状态图标上显示。dropzone：不支持 attached；用 detached 或 tooltip（下个次版本起 detached 为默认）。',
    labelTooltip: '标签末尾信息图标中的工具提示。',
  },
};
