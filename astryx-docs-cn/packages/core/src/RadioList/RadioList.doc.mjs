// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'RadioList',
  displayName: 'Radio List',
  group: 'Radio',
  category: 'Form Controls',
  keywords: [
    'RadioList',
    'radio',
    'RadioGroup',
    '单选列表',
    '单选按钮',
    '单选组',
    '选项列表',
    '单选',
    '互斥选择',
  ],
  theming: {
    targets: [
      {className: 'astryx-radio-list', visualProps: ['orientation', 'size']},
      {
        className: 'astryx-radio-list-item',
        visualProps: ['size'],
        states: ['selected', 'disabled'],
      },
      {
        className: 'astryx-radio-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-indicator-dot', visualProps: ['size']},
    ],
  },
  description:
    '单选组容器，与字段集成以提供标签、描述与状态。',
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '单选组的标签文本（为无障碍而始终渲染）。',
      required: true,
    },
    {
      name: 'value',
      type: 'string',
      description: '当前选中的值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '选中值变化时触发的回调。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'RadioListItem 元素。',
      slotElements: [
        {
          __element: 'RadioListItem',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
      required: true,
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
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'orientation',
      type: "'vertical' | 'horizontal'",
      description: '单选项的布局方向。',
      default: "'vertical'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用全部单选项。',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '单选输入共享的 HTML name 属性，便于表单提交。省略时仍会用唯一的内部 name 对单选钮分组。',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释组为何被禁用。作用于整组禁用状态（isDisabled），而非单个选项。与 isDisabled 同用时，会在悬停/键盘聚焦时显示工具提示，并通过 aria-disabled 保持单选钮可聚焦（选择仍被阻止）。请用此 prop 代替把禁用的 RadioList 包进 Tooltip——禁用控件会吞掉外部 Tooltip 所需的悬停事件。',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '单选组是否必填。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选（与 isRequired 互斥）。',
      default: 'false',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: '状态指示器（{ type, message }）。',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '单选控件的尺寸。',
      default: "'md'",
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
        '字段宽度（数字 = 像素，字符串原样使用，如 "100%"）。作用于整个字段（标签、控件与状态），使其保持对齐。',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '字段容器（标签、控件与状态整体）的 StyleX 样式。在 InputGroup 内无效（请改为设置 InputGroup 样式），在 `horizontal-labels` FormLayout 中也无效。不接受根级 `xstyle`、`className` 与 `style`。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        '字段容器的类名。定位目标与 `containerXstyle` 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        '字段容器的内联样式。定位目标与 `containerXstyle` 相同。',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        '可视化控件盒的 StyleX 样式：即绘制边框与背景、容纳图标和尾部控件的元素。绝不作用于原生 input。',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: '可视化控件盒的类名。',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: '可视化控件盒的内联样式。',
    },
  ],
  components: [{name: 'RadioListItem'}],
  usage: {
    accessibility: [
      {
        name: 'Radio circle',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Selected'],
        description:
          '圆形边缘（未选中）与填充（选中）必须与背后表面保持至少 3:1 的对比度。对于 Hover 与 Pointer down 状态，应在着色与按压叠加层应用后测量最终颜色。',
      },
    ],
    description:
      '一组同一时间只能选中一项的选项。所有选项同时可见，便于比较各选项。适用于用户需要从少量选项中挑选其一的场景。',
    bestPractices: [
      {
        guidance: true,
        description: '保持选项数量少：通常 2 到 7 个。',
      },
      {
        guidance: true,
        description: '使用清晰、简洁的标签，让每个选项一眼可辨。',
      },
      {
        guidance: true,
        description:
          '存在合理默认值时预选默认项；除非该选择可留空，否则不要让组保持空选。',
      },
      {
        guidance: false,
        description: '不要在需要多选时使用；请改用 CheckboxList。',
      },
      {
        guidance: false,
        description: '不要用于长列表；请改用 Selector 以获得更好的可发现性。',
      },
      {
        guidance: false,
        description: '不要在超过 4 个选项时使用水平布局；换行会很别扭。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 RadioList 包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
    anatomy: [
      {
        name: 'Header',
        required: false,
        description: '单选列表上方的可选标题。',
      },
      {
        name: 'Children',
        required: true,
        description: '渲染为可选选项的单选列表项。',
      },
      {
        name: 'Label/Value',
        required: true,
        description: '每个单选项的文本标签与关联值。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'A group of options where only one can be selected at a time. All options are visible at once, making it easy to compare choices. Use it when users need to pick one option from a small set.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the number of options small: typically 2 to 7 choices.',
      },
      {
        guidance: true,
        description:
          'Use clear, concise labels that differentiate each option at a glance.',
      },
      {
        guidance: true,
        description:
          "Pre-select a default option when there's a sensible default; don't leave the group empty unless the choice is optional.",
      },
      {
        guidance: false,
        description:
          'Use when multiple selections are needed; use CheckboxList instead.',
      },
      {
        guidance: false,
        description:
          'Use for long lists; use Selector for better discoverability.',
      },
      {
        guidance: false,
        description:
          'Use horizontal layout with more than 4 options; it wraps awkwardly.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled RadioList in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Header',
        required: false,
        description: 'Optional heading above the radio list.',
      },
      {
        name: 'Children',
        required: true,
        description: 'The radio list items rendered as selectable options.',
      },
      {
        name: 'Label/Value',
        required: true,
        description: 'The text label and associated value for each radio item.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '用于从选项列表中单选的单选组组件。',
  usage: {
    description:
      '一组同一时间只能选中一项的选项。所有选项同时可见，便于比较各选项。适用于用户需要从少量选项中挑选其一的场景。',
    bestPractices: [
      {
        guidance: true,
        description: '保持选项数量少：通常 2 到 7 个。',
      },
      {
        guidance: true,
        description: '使用清晰、简洁的标签，让每个选项一眼可辨。',
      },
      {
        guidance: true,
        description:
          '存在合理默认值时预选默认项；除非该选择可留空，否则不要让组保持空选。',
      },
      {
        guidance: false,
        description: '不要在需要多选时使用；请改用 CheckboxList。',
      },
      {
        guidance: false,
        description: '不要用于长列表；请改用 Selector 以获得更好的可发现性。',
      },
      {
        guidance: false,
        description: '不要在超过 4 个选项时使用水平布局；换行会很别扭。',
      },
      {
        guidance: false,
        description:
          '不要把禁用的 RadioList 包进 Tooltip 来解释禁用原因；禁用控件会吞掉包装层所需的悬停事件。请改用 disabledMessage prop。',
      },
    ],
    anatomy: [
      {
        name: 'Header',
        required: false,
        description: '单选列表上方的可选标题。',
      },
      {
        name: 'Children',
        required: true,
        description: '渲染为可选选项的单选列表项。',
      },
      {
        name: 'Label/Value',
        required: true,
        description: '每个单选项的文本标签与关联值。',
      },
    ],
  },
};
