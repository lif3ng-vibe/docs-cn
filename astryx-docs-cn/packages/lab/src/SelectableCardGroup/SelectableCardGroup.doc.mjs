// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'SelectableCardGroup',
  displayName: 'Selectable Card Group',
  category: 'Form Controls',
  keywords: [
    'card',
    '卡片',
    'selectable',
    '可选',
    'group',
    '组',
    'radio',
    '单选',
    'radiogroup',
    'checkbox',
    '复选框',
    'single choice',
    'multiple choice',
    '多选',
    'plan picker',
    '套餐选择',
    'selection',
    '选择',
    'SelectableCardGroup',
  ],
  description:
    '一组可选卡片，语义与其选择方式一致。单选（默认）是一个单选按钮组：卡片是共享同一 name 的原生单选按钮，因此整组只占一个 Tab 停靠点，方向键移动并选中，屏幕阅读器会读出位置（“2 of 3”）。多选是一个带名称的复选框组。每个 SelectableCardGroupItem 都是一个 SelectableCard，其输入、name 和选中状态由组提供。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '组的可见标签和无障碍名称。',
      required: true,
    },
    {
      name: 'selectionMode',
      type: "'single' | 'multiple'",
      description:
        '`single`：单选按钮组，一个值。`multiple`：复选框组，任意多个值。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'string | null | ReadonlyArray<string>',
      description:
        '选中的值（`single`，未选择时为 `null`）或值列表（`multiple`）。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void | (value: string[]) => void',
      description:
        '以选中的值（`single`）或新的值列表（`multiple`）调用。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签；它仍为组命名。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签下方的辅助文字，并与组关联。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '提交组的值时使用的名称。单选按钮按自动生成的名称分组。默认自动生成。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用所有卡片；它们仍可聚焦，并播报禁用状态。',
      default: 'false',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description:
        '`horizontal` 将卡片按行换行排列；`vertical` 纵向堆叠。',
      default: "'horizontal'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'SelectableCardGroupItem 卡片。每张卡片接受一个 `value`，以及除 isSelected 和 onChange 之外的 SelectableCard prop。',
      required: true,
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于标签、描述和卡片外层 Field 容器的 StyleX 样式（外边距、定位、尺寸）。该组由 Field 组成，因此不接受根级 xstyle、className 或 style。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        'Field 容器的类名，作用范围与 containerXstyle 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        'Field 容器的内联样式，作用范围与 containerXstyle 相同。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-selectable-card-group',
        visualProps: ['orientation', 'selectionMode'],
      },
    ],
  },
  usage: {
    description:
      '用于在少数以卡片呈现的丰富选项中做选择：套餐、外观、布局。单选为用户提供他们预期的单选按钮组键盘操作和位置播报；当可以同时开启多张卡片时，使用 `multiple`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '为每张卡片提供一个说明其选项的 `label`；它就是屏幕阅读器读出的单选按钮或复选框名称。',
      },
      {
        guidance: true,
        description:
          '当产品有合理的默认值时，让单选从一个值开始，这样 Tab 停靠点会落在它上面。',
      },
      {
        guidance: false,
        description:
          '不要在卡片内放置按钮或链接；整张卡片都是单选按钮或复选框的目标。',
      },
      {
        guidance: false,
        description:
          '不要用于导航或操作；这些场景请使用 ClickableCard。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'SelectableCardGroup',
  displayName: 'Selectable Card Group',
  description:
    '一组可选卡片，语义与其选择方式一致。单选（默认）是一个单选按钮组：卡片是共享同一 name 的原生单选按钮，因此整组只占一个 Tab 停靠点，方向键移动并选中，读屏软件会读出位置（“第 2 项，共 3 项”）。多选是一个带名称的复选框组。每个 SelectableCardGroupItem 都是一个 SelectableCard，其输入类型、name 和选中状态由组提供。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '组的可见标签和无障碍名称。',
      required: true,
    },
    {
      name: 'selectionMode',
      type: "'single' | 'multiple'",
      description:
        '`single`：单选按钮组，一个值。`multiple`：复选框组，任意多个值。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'string | null | ReadonlyArray<string>',
      description:
        '选中的值（`single`，未选择时为 `null`）或值列表（`multiple`）。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void | (value: string[]) => void',
      description: '以选中的值（`single`）或新的值列表（`multiple`）调用。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签；它仍为组命名。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '标签下方的辅助文字，并与组关联。',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        '提交组的值时使用的名称。单选按钮按自动生成的名称分组。默认自动生成。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用所有卡片；它们仍可聚焦，并读出禁用状态。',
      default: 'false',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '`horizontal` 将卡片按行换行排列；`vertical` 纵向堆叠。',
      default: "'horizontal'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'SelectableCardGroupItem 卡片。每张卡片接受一个 `value`，以及除 isSelected 和 onChange 之外的 SelectableCard 属性。',
      required: true,
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        '作用于标签、描述和卡片外层 Field 容器的 StyleX 样式（外边距、定位、尺寸）。该组由 Field 组成，因此不接受根级 xstyle、className 或 style。',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description: 'Field 容器的类名，作用范围与 containerXstyle 相同。',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description: 'Field 容器的内联样式，作用范围与 containerXstyle 相同。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-selectable-card-group',
        visualProps: ['orientation', 'selectionMode'],
      },
    ],
  },
  usage: {
    description:
      '用于在少数以卡片呈现的丰富选项中做选择：套餐、外观、布局。单选为用户提供他们预期的单选按钮组键盘操作和位置播报；当可以同时开启多张卡片时，使用 `multiple`。',
    bestPractices: [
      {
        guidance: true,
        description:
          '为每张卡片提供一个说明其选项的 `label`；它就是读屏软件读出的单选按钮或复选框名称。',
      },
      {
        guidance: true,
        description:
          '当产品有合理的默认值时，让单选从一个值开始，这样 Tab 停靠点会落在它上面。',
      },
      {
        guidance: false,
        description:
          '在卡片内放置按钮或链接；整张卡片都是单选按钮或复选框的目标。',
      },
      {
        guidance: false,
        description: '用于导航或操作；这些场景请使用 ClickableCard。',
      },
    ],
  },
};
