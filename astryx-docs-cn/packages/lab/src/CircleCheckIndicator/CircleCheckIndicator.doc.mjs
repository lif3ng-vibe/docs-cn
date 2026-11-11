// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CircleCheckIndicator',
  displayName: 'Circle Check Indicator',
  category: 'Form Controls',
  keywords: [
    'indicator',
    '指示器',
    'checkbox',
    '复选框',
    'circle',
    '圆圈',
    'check',
    'multiselect',
    '多选',
    'selection',
    '选择',
    'edit mode',
    '编辑模式',
    'ios',
    'mark',
    '标记',
  ],
  description:
    'iOS 的多选标记：空心圆、带对勾的实心圆，或表示部分选中状态的带横线实心圆。属于复选框家族的指示器：通过 defineTheme({indicators}) 将其映射到 `checkbox`，所有 CheckboxInput 和 CheckboxList 都会绘制它。仅作装饰（aria-hidden）；输入、角色、无障碍名称、焦点和键盘行为由所属控件负责。颜色在任何指针交互下都按主题时长渐变，开启减弱动效（Reduce Motion）时立即切换。',
  props: [
    {
      name: 'state',
      type: "'unchecked' | 'checked' | 'indeterminate'",
      description:
        '要绘制的状态。未选中时是一个空心圆环，而不是什么都不画。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        '控件尺寸。圆圈按 UIKit 的直径绘制：sm 为 18px，md 为 21.8px，居中于宿主 20px 或 24px 的槽位。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '绘制禁用外观。仅影响视觉；禁用语义由所属控件负责。',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '绘制在圆内、替代标记的内容，例如 CheckboxInput 在变更进行中传入的加载 Spinner。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-circle-check-indicator',
        visualProps: ['size', 'checked', 'disabled'],
      },
      {className: 'astryx-circle-check-indicator-check', visualProps: ['size']},
      {className: 'astryx-circle-check-indicator-dash', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      '用在 iOS 显示选择圆圈的地方：编辑模式下的列表行，以及产品风格遵循 iOS 的多选集合。在主题中将其映射到 `checkbox` 可一次替换所有复选框，也可以在自行布局的行中直接渲染。',
    bestPractices: [
      {
        guidance: true,
        description:
          '用 defineTheme({indicators: {checkbox: CircleCheckIndicator}}) 映射，使 CheckboxInput 和 CheckboxList 保留其语义和焦点环。',
      },
      {
        guidance: true,
        description:
          '只在面向 iOS 的主题中映射它。它在所有平台上都绘制圆圈，而 Android 用方形框表示多选。',
      },
      {
        guidance: true,
        description:
          '在旁边保留可见标签；圆圈仅作装饰，不会播报任何内容。',
      },
      {
        guidance: false,
        description:
          '用于单选；单选按钮或所选行上的对勾表达的是“其中之一”。',
      },
      {
        guidance: false,
        description:
          '为它添加角色、标签或 Tab 停靠点；这些由所属控件负责。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'CircleCheckIndicator',
  displayName: 'Circle Check Indicator',
  description:
    'iOS 的多选标记：空心圆、带对勾的实心圆，或表示部分选中的带横线实心圆。属于复选框家族的指示器：通过 defineTheme({indicators}) 映射到 `checkbox` 后，所有 CheckboxInput 和 CheckboxList 都会绘制它。仅作装饰（aria-hidden）；输入、角色、无障碍名称、焦点和键盘行为由所属控件负责。颜色在任何指针下都按主题时长渐变，开启减弱动态效果时立即切换。',
  props: [
    {
      name: 'state',
      type: "'unchecked' | 'checked' | 'indeterminate'",
      description: '要绘制的状态。未选中时是一个空心圆环，而不是什么都不画。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description:
        '控件尺寸。圆圈按 UIKit 的直径绘制：sm 为 18px，md 为 21.8px，居中于宿主 20px 或 24px 的位置。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '绘制禁用外观。仅影响视觉；禁用语义由所属控件负责。',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '绘制在圆内、替代标记的内容，例如 CheckboxInput 在变更进行中传入的加载 Spinner。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-circle-check-indicator',
        visualProps: ['size', 'checked', 'disabled'],
      },
      {className: 'astryx-circle-check-indicator-check', visualProps: ['size']},
      {className: 'astryx-circle-check-indicator-dash', visualProps: ['size']},
    ],
  },
  usage: {
    description:
      '用在 iOS 显示选择圆圈的地方：编辑模式下的列表行，以及遵循 iOS 的多选集合。在主题中将其映射到 `checkbox` 可一次替换所有复选框，也可以在自行布局的行中直接渲染。',
    bestPractices: [
      {
        guidance: true,
        description:
          '使用 defineTheme({indicators: {checkbox: CircleCheckIndicator}}) 映射，使 CheckboxInput 和 CheckboxList 保留其语义和焦点环。',
      },
      {
        guidance: true,
        description:
          '只在面向 iOS 的主题中映射它。它在所有平台上都绘制圆圈，而 Android 用方形复选框表示多选。',
      },
      {
        guidance: true,
        description: '在旁边保留可见标签；圆圈仅作装饰，不会被朗读。',
      },
      {
        guidance: false,
        description: '用于单选；单选按钮或所选行上的对勾表示“其中之一”。',
      },
      {
        guidance: false,
        description: '为其添加角色、标签或 Tab 停靠点；这些属于所属控件。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'iOS 多选圆圈：空心圆环 / 实心圆 + 对勾 / 实心圆 + 横线。复选框家族指示器；通过 defineTheme({indicators}) 映射到 `checkbox`。',
  usage: {
    description:
      '用于 iOS 风格选择圆圈：编辑模式列表行与多选集合。在主题中映射到 `checkbox`，或在自行布局的行中渲染。',
    bestPractices: [
      {
        guidance: true,
        description:
          '通过 defineTheme({indicators: {checkbox: CircleCheckIndicator}}) 映射；宿主保留语义 + 焦点环。',
      },
      {
        guidance: true,
        description: '保留可见标签；圆圈仅作装饰。',
      },
      {
        guidance: false,
        description:
          '用于单选（改用 radio 或行内对勾）。',
      },
      {
        guidance: false,
        description:
          '添加 role、label 或 tabIndex；所属控件已具备。',
      },
    ],
  },
  propDescriptions: {
    state:
      "'unchecked'（空心圆环）| 'checked'（对勾）| 'indeterminate'（横线）。",
    size: "'sm' 18px 圆 | 'md' 21.8px 圆（位于 20px 或 24px 槽位）。",
    isDisabled: '仅禁用外观；语义由所属控件负责。',
    children: '绘制在圆内替代标记的内容（如 Spinner）。',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 值。',
  },
};
