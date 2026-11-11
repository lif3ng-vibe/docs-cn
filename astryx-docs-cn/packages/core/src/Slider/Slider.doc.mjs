// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Label',
    required: true,
    description:
      '标识滑块所控数值设置的文本。',
  },
  {
    name: 'Description',
    required: false,
    description: '位于标签与滑块控件之间的辅助文本。',
  },
  {
    name: 'Slider',
    required: true,
    description:
      '控件行，包含轨道、单个或多个滑块以及可选的文本值。',
  },
  {
    name: 'Interactive control',
    required: true,
    description:
      '用于指针与键盘交互的表面，包含导轨、填充段、刻度与滑块。',
  },
  {
    name: 'Track',
    required: true,
    description: '表示可用数值范围的背景导轨。',
  },
  {
    name: 'Filled range',
    required: true,
    description:
      '强调色区段：从最小值到单一值，或介于两个范围值之间。',
  },
  {
    name: 'Tick mark',
    required: false,
    description: '通过 marks 集合提供的位置标记。',
  },
  {
    name: 'Mark label',
    required: false,
    description: '显示在刻度旁的可选文本。',
  },
  {
    name: 'Thumb',
    required: true,
    description:
      '可拖动的取值指示器；范围模式会渲染最小值与最大值两个滑块。',
  },
  {
    name: 'Value display',
    required: false,
    description:
      '当 valueDisplay 为 text 时，显示在滑块旁边的格式化当前值。',
  },
  {
    name: 'Value tooltip',
    required: false,
    description:
      '当 valueDisplay 为 tooltip 时，以工具提示形式显示的格式化当前值。',
  },
  {
    name: 'Status message',
    required: false,
    description: '滑块下方的错误、警告或成功消息。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Slider',
  displayName: 'Slider',
  category: 'Form Controls',
  keywords: [
    'slider',
    'range',
    '滑块',
    '滑动条',
    '轨道条',
    '拖动条',
    '旋钮',
    'thumb',
    'rangeslider',
  ],
  playground: {
    defaults: {
      label: '音量',
      value: 50,
      // Give the properties-tab preview a defined width so the track has room
      // to render and stays draggable/interactive (the slider track grows to
      // fill its container, which can collapse without an explicit width).
      width: 300,
    },
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本（始终渲染以保证无障碍）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        '当前值：单滑块模式为 `number`，范围模式为 `[number, number]`。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽过程中值变化时触发的回调。',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽结束时触发的回调。',
    },
    {
      name: 'min',
      type: 'number',
      description: '最小值。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: '步进增量。',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '滑块的方向。',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description:
        '自定义值格式化函数，用于显示与 `aria-valuetext`。',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: '当前值的显示方式。',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description:
        '在指定位置的刻度标记，可带标签。未填充区域的刻度使用轨道颜色；填充区域内的刻度（位于滑块处或其后方，或范围模式下两滑块之间）使用填充色。',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description:
        '范围模式下两个滑块之间的最小步数；防止滑块重叠。',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '滑块是否禁用。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '用于表单提交的 HTML name 属性。渲染携带当前值的隐藏输入（范围模式下为两个条目）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释滑块为何被禁用。配合 isDisabled 使用时，会在悬停或键盘聚焦时显示工具提示，并通过 aria-disabled 保持滑块可聚焦（值变更仍被阻止）。请使用该 prop 而不是把禁用的 Slider 包进 Tooltip——禁用控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否必填。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '渲染在标签下方的描述文本。',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        '用于校验反馈的状态指示器对象（`{ type, message }`）。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签旁信息图标的工具提示文本。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '字段宽度（数字 = 像素，字符串按原样使用，如 "100%"）。会设定整个字段（标签、控件与状态）的宽度，使其保持对齐。',
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
      description:
        '字段容器的类名，作用目标同 `containerXstyle`。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        '字段容器的内联样式，作用目标同 `containerXstyle`。',
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
      {
        className: 'astryx-slider',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
      {
        className: 'astryx-slider-control',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
      {className: 'astryx-slider-track', visualProps: ['orientation']},
      {
        className: 'astryx-slider-thumb',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    accessibility: [
      {
        name: 'Thumb',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          '滑块与轨道及其背后表面的对比度必须至少达到 3:1。按压（pointer down）覆盖整个拖拽过程：测量时需将按压遮罩计算在内。',
      },
    ],
    anatomy,
    description:
      '可拖动控件，用于在既定界限内选择数值或数值范围。支持单值与范围选择、刻度标记、自定义值格式化以及垂直方向。当用户需要探索连续区间（如音量、价格或百分比）时使用。在触屏设备上以手指操作时，它的跟踪行为与 UISlider 一致：只有滑块本身可被拖动，且触控目标大于滑块；值跟随手指的移动而不是跳到手指位置；松手后滑块继续惯性滑行，随后才触发 `onChangeEnd`；从轨道开始的滑动会滚动页面；点按轨道或刻度会在手指抬起时设定值（滑块随即弹到该处）。用鼠标拖动滑块时跟踪方式相同——任意方向经过同样的 10 px 后锁定拖动，没有抬起或惯性滑行；在轨道上按下鼠标会把滑块移到该处，且只有主键点击会产生按压。触控笔的拖动方式与手指相同，但仅沿轨道方向捕获拖动，松开即结束拖动、无惯性滑行。在滑块上滚动滚轮或触控板时，滚动会交给其下方可滚动的容器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '务必提供标签，即使仅在视觉上隐藏，也要让滑块对屏幕阅读器保持可访问。',
      },
      {
        guidance: true,
        description:
          '用有实际意义的单位格式化值，如 "$50" 或 "75%"，而非裸数字。',
      },
      {
        guidance: false,
        description:
          '不要用于精确的数值输入；请搭配文本输入框，或改用 NumberInput。',
      },
      {
        guidance: false,
        description:
          '不要把步长设得过大以致只剩少数几个可选位置；请改用 SegmentedControl 或单选按钮。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的滑块包进 Tooltip 来解释禁用原因；禁用控件会吞掉外层 Tooltip 所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Slider',
  displayName: 'Slider',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本（始终渲染以确保无障碍可访问性）。',
      required: true,
    },
    {
      name: 'value',
      type: 'number | [number, number]',
      description:
        '当前值——`number` 用于单滑块模式，`[number, number]` 用于范围模式。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽过程中值变更时触发的回调。',
    },
    {
      name: 'onChangeEnd',
      type: '(value: number) => void | (value: [number, number]) => void',
      description: '拖拽结束时触发的回调。',
    },
    {
      name: 'min',
      type: 'number',
      description: '最小值。',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: '最大值。',
      default: '100',
    },
    {
      name: 'step',
      type: 'number',
      description: '步进增量。',
      default: '1',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '滑块的方向。',
      default: "'horizontal'",
    },
    {
      name: 'formatValue',
      type: '(value: number) => string',
      description: '自定义值格式化函数，用于显示和 `aria-valuetext`。',
    },
    {
      name: 'valueDisplay',
      type: "'tooltip' | 'text' | 'none'",
      description: '当前值的显示方式。',
      default: "'tooltip'",
    },
    {
      name: 'marks',
      type: 'Array<{ value: number; label?: string }>',
      description:
        '在指定位置的刻度标记，带可选标签。未填充区域的标记使用轨道颜色；填充区域内的标记使用强调色。',
    },
    {
      name: 'minStepsBetweenThumbs',
      type: 'number',
      description: '范围模式下滑块之间的最小步数；防止滑块重叠。',
      default: '0',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用滑块。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '用于表单提交的 HTML name 属性。渲染携带当前值的隐藏输入（范围模式下为两个条目）。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the slider is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the thumb focusable via aria-disabled (value changes stay blocked). Use this instead of wrapping a disabled Slider in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否为可选。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否为必填。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否在视觉上隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签下方渲染的描述文本。',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '验证反馈的状态指示器对象（`{ type, message }`）。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: '标签旁信息图标的提示文本。',
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
      {
        className: 'astryx-slider',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
      {
        className: 'astryx-slider-control',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
      {className: 'astryx-slider-track', visualProps: ['orientation']},
      {
        className: 'astryx-slider-thumb',
        visualProps: ['orientation'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    anatomy,
    description:
      'A draggable control for selecting a numeric value or range within defined bounds. Supports single value and range selection, tick marks, custom value formatting, and vertical orientation. Use it when users need to explore a continuous range, such as volume, price, or percentage. Under a finger, on any touch device, it tracks as UISlider does: only the thumb takes a drag, through a target larger than it, the value follows the finger’s travel rather than jumping to it, a release coasts on before `onChangeEnd`, a swipe from the track scrolls the page, and a tap on the track or a mark sets the value when the finger lifts (the thumb springs there). A mouse drag on a thumb tracks the same way, past the same 10 px in any direction, with no lift or coast; a mouse press on the track moves the thumb there, and only a primary click presses. A pen drags as a finger does, claiming only along the track, and its drag ends at the release with no coast. A wheel or a trackpad scroll over the slider goes to whatever scrolls under it.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Always provide a label, even if visually hidden, so the slider is accessible to screen readers.',
      },
      {
        guidance: true,
        description:
          'Format values with meaningful units like "$50" or "75%" instead of raw numbers.',
      },
      {
        guidance: false,
        description:
          'Use for precise numeric entry; pair with a text input or use NumberInput instead.',
      },
      {
        guidance: false,
        description:
          'Set a step size so large that only a few positions are possible; use SegmentedControl or radio buttons instead.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled slider in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    anatomy,
    description:
      '可拖动控件，用于在既定界限内选择数值或数值范围。支持单值与范围选择、刻度标记、自定义值格式化以及垂直方向。当用户需要探索连续区间（如音量、价格或百分比）时使用。在触屏设备上以手指操作时，它的跟踪行为与 UISlider 一致：只有滑块本身可被拖动，且触控目标大于滑块；值跟随手指的移动而不是跳到手指位置；松手后滑块继续惯性滑行，随后才触发 `onChangeEnd`；从轨道开始的滑动会滚动页面；点按轨道或刻度会在手指抬起时设定值（滑块随即弹到该处）。用鼠标拖动滑块时跟踪方式相同——任意方向经过同样的 10 px 后锁定拖动，没有抬起或惯性滑行；在轨道上按下鼠标会把滑块移到该处，且只有主键点击会产生按压。触控笔的拖动方式与手指相同，但仅沿轨道方向捕获拖动，松开即结束拖动、无惯性滑行。在滑块上滚动滚轮或触控板时，滚动会交给其下方可滚动的容器。',
    bestPractices: [
      {
        guidance: true,
        description:
          '务必提供标签，即使仅在视觉上隐藏，也要让滑块对屏幕阅读器保持可访问。',
      },
      {
        guidance: true,
        description:
          '用有实际意义的单位格式化值，如 "$50" 或 "75%"，而非裸数字。',
      },
      {
        guidance: false,
        description:
          '不要用于精确的数值输入；请搭配文本输入框，或改用 NumberInput。',
      },
      {
        guidance: false,
        description:
          '不要把步长设得过大以致只剩少数几个可选位置；请改用 SegmentedControl 或单选按钮。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的滑块包进 Tooltip 来解释禁用原因；禁用控件会吞掉外层 Tooltip 所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
  },
  propDescriptions: {
    containerXstyle:
      '字段容器的 StyleX 样式；在 InputGroup 或 horizontal-labels FormLayout 中无效。不接受根级 xstyle/className/style。',
    containerClassName: '字段容器的类名。',
    containerStyle: '字段容器的内联样式。',
    controlXstyle:
      '可视控件框的 StyleX 样式（边框、背景、图标）；不是原生输入元素。',
    controlClassName: '可视控件框的类名。',
    controlStyle: '可视控件框的内联样式。',
    label: '标签文本（始终渲染以保证无障碍）。',
    value:
      '当前值；单滑块为 number，范围模式为 [number, number]。',
    onChange: '拖拽过程中值变化时触发。',
    onChangeEnd: '拖拽结束时触发。',
    min: '最小值。',
    max: '最大值。',
    step: '步进增量。',
    orientation: '滑块方向。',
    formatValue: '自定义值格式化函数，用于显示 + aria-valuetext。',
    valueDisplay: '当前值的显示方式。',
    marks:
      '指定位置的刻度标记，可带标签。未填充刻度使用轨道色；已填充刻度使用强调色。',
    minStepsBetweenThumbs:
      '范围模式下滑块间的最小步数；防止重叠。',
    isDisabled: '滑块是否禁用。',
    htmlName:
      'HTML name 属性；隐藏输入携带当前值（范围模式下为两个）。',
    isOptional: '字段是否可选。',
    isRequired: '字段是否必填。',
    isLabelHidden: '在视觉上隐藏标签。',
    description: '标签下方的描述文本。',
    status: '用于校验反馈的状态指示器（{type, message}）。',
    labelTooltip: '标签旁信息图标的工具提示文本。',
  },
};
