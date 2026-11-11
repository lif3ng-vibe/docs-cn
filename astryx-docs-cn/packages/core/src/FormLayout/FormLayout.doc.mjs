// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'FormLayout',
  displayName: 'Form Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: [
    'formlayout',
    'form',
    'fieldset',
    'formgroup',
    'formcontainer',
    'fields',
    'vertical',
    'horizontal',
    '表单布局',
    '表单',
    '字段',
    '垂直',
    '水平',
  ],
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        '控制字段排列方式。vertical 从上到下堆叠；horizontal 为每个字段使用一个 1fr 网格轨道，并按逻辑行内方向排列；horizontal-labels 使用 CSS Grid，将标签放在输入框的行内起始侧（当视口宽度 <=480px 时折叠为垂直布局）。',
      default: "'vertical'",
    },
    {
      name: 'defaultOptionality',
      type: "'optional' | 'required'",
      description:
        '表单视为默认的状态，因此仅例外字段显示可选/必填指示器。设为 "optional" 时，仅标记 isRequired 的字段显示指示器；设为 "required" 时，仅标记 isOptional 的字段显示。与默认一致的字段不显示任何内容。设为 "required" 时，未标记的字段仍会暴露 aria-required，使屏幕阅读器与视觉默认一致——仅作用于 aria-required，不改变原生 required 属性。CheckboxInput、Switch 和 CheckboxList 例外：未勾选的复选框、关闭的开关或空的复选框组本身就是一个回答，因此默认值不会赋予它们必填状态。CheckboxInput 或 Switch 只有通过自身的 isRequired 才会成为必填。不设置则保持当前逐字段行为。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '要排列的表单字段。接受 Astryx 输入组件（TextInput、Selector 等）和 Field 包装的自定义控件。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-form-layout', visualProps: ['direction']}],
  },
  usage: {
    description:
      '一种以一致间距和方向排列表单字段的布局容器。FormLayout 只管字段放哪里，不管状态或提交；这些请用原生 <form> 包裹——<form> 没有 Astryx 替代物，保持原生元素即可。支持 vertical（默认）、horizontal 和 horizontal-labels 方向，并可通过嵌套混合使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '大多数表单将字段垂直堆叠；自上而下最容易扫读。',
      },
      {
        guidance: true,
        description:
          '当字段天然成对时（如名字 + 姓氏，或城市 + 州/省 + 邮编），把水平 FormLayout 嵌套在垂直布局内。',
      },
      {
        guidance: true,
        description:
          '设置页中标签位于输入框旁的场景，使用 horizontal-labels。',
      },
      {
        guidance: false,
        description:
          '不要用 FormLayout 管理表单状态或提交；它只负责布局。这些请用原生 <form> 包裹处理。',
      },
      {
        guidance: false,
        description:
          '不要在水平布局中并排放置无关字段；只把属于一组的字段放在一起。',
      },
      {
        guidance: false,
        description:
          '不要把 horizontal-labels 嵌套进另一个 FormLayout；它使用 CSS Grid，必须是最外层容器。',
      },
    ],
    anatomy: [
      {
        name: 'Layout container',
        required: true,
        description:
          '持有字段排列、间距、方向和表单级可选性。',
      },
      {
        name: 'Form title',
        required: false,
        description: '描述表单用途的标题。',
      },
      {
        name: 'Fields',
        required: true,
        description: '带标签的输入组件，用于收集用户数据。',
      },
      {
        name: 'Footer',
        required: false,
        description: '包含确认按钮，如提交或取消。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'FormLayout',
  displayName: 'Form Layout',
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        '控制字段排列方式。vertical 从上到下堆叠；horizontal 为每个字段使用一个 1fr 网格轨道，并按逻辑行内方向排列；horizontal-labels 使用 CSS Grid，将标签放在输入框的行内起始侧（当视口宽度 <=480px 时折叠为垂直布局）。',
      default: "'vertical'",
    },
    {
      name: 'defaultOptionality',
      type: "'optional' | 'required'",
      description:
        '表单视为默认的状态，因此仅例外字段显示可选/必填指示器。设为 "optional" 时，仅标记 isRequired 的字段显示指示器；设为 "required" 时，仅标记 isOptional 的字段显示。与默认一致的字段不显示任何内容。设为 "required" 时，未标记的字段仍会暴露 aria-required，使屏幕阅读器与视觉默认一致——仅作用于 aria-required，不改变原生 required 属性。CheckboxInput、Switch 和 CheckboxList 例外：未勾选的复选框、关闭的开关或空的复选框组本身就是一个回答，因此默认值不会赋予它们必填状态。CheckboxInput 或 Switch 只有通过自身的 isRequired 才会成为必填。不设置则保持当前逐字段行为。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '要排列的表单字段。接受 Astryx 输入组件（TextInput、Selector 等）和 Field 包装的自定义控件。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义（外边距、定位、尺寸）的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-form-layout', visualProps: ['direction']}],
  },
  usage: {
    description:
      'A layout container that arranges form fields with consistent spacing and direction. FormLayout handles where fields go, not state or submission. Wrap it in a native <form> for that; <form> has no Astryx replacement, so it stays a plain element. Supports vertical (default), horizontal, and horizontal-labels directions, and can be nested to mix them.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Stack fields vertically for most forms. It's the easiest to scan top to bottom.",
      },
      {
        guidance: true,
        description:
          'Nest a horizontal FormLayout inside a vertical one when fields naturally pair up, like First Name + Last Name or City + State + ZIP.',
      },
      {
        guidance: true,
        description:
          'Use horizontal-labels for settings pages where labels sit beside their inputs.',
      },
      {
        guidance: false,
        description:
          "Use FormLayout for form state or submission. It's just layout. Wrap it in a native <form> for that.",
      },
      {
        guidance: false,
        description:
          'Put unrelated fields side by side in a horizontal layout. Save it for fields that belong together.',
      },
      {
        guidance: false,
        description:
          'Nest horizontal-labels inside another FormLayout. It uses CSS Grid and needs to be the outermost container.',
      },
    ],
    anatomy: [
      {
        name: 'Layout container',
        required: true,
        description:
          'Owns field arrangement, spacing, direction, and form-level optionality.',
      },
      {
        name: 'Form title',
        required: false,
        description: 'Heading that describes the purpose of the form.',
      },
      {
        name: 'Fields',
        required: true,
        description: 'Input components with labels for collecting user data.',
      },
      {
        name: 'Footer',
        required: false,
        description: 'Contains confirmation buttons such as Submit or Cancel.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '以一致间距和方向排列表单字段的布局容器。',
  usage: {
    description:
      '一种以一致间距和方向排列表单字段的布局容器。FormLayout 只管字段放哪里，不管状态或提交；这些请用原生 <form> 包裹——<form> 没有 Astryx 替代物，保持原生元素即可。支持 vertical（默认）、horizontal 和 horizontal-labels 方向，并可通过嵌套混合使用。',
    bestPractices: [
      {
        guidance: true,
        description:
          '大多数表单将字段垂直堆叠；自上而下最容易扫读。',
      },
      {
        guidance: true,
        description:
          '当字段天然成对时（如名字 + 姓氏，或城市 + 州/省 + 邮编），把水平 FormLayout 嵌套在垂直布局内。',
      },
      {
        guidance: true,
        description:
          '设置页中标签位于输入框旁的场景，使用 horizontal-labels。',
      },
      {
        guidance: false,
        description:
          '不要用 FormLayout 管理表单状态或提交；它只负责布局。这些请用原生 <form> 包裹处理。',
      },
      {
        guidance: false,
        description:
          '不要在水平布局中并排放置无关字段；只把属于一组的字段放在一起。',
      },
      {
        guidance: false,
        description:
          '不要把 horizontal-labels 嵌套进另一个 FormLayout；它使用 CSS Grid，必须是最外层容器。',
      },
    ],
    anatomy: [
      {
        name: 'Layout container',
        required: true,
        description:
          '持有字段排列、间距、方向和表单级可选性。',
      },
      {
        name: 'Form title',
        required: false,
        description: '描述表单用途的标题。',
      },
      {
        name: 'Fields',
        required: true,
        description: '带标签的输入组件，用于收集用户数据。',
      },
      {
        name: 'Footer',
        required: false,
        description: '包含确认按钮，如提交或取消。',
      },
    ],
  },
  propDescriptions: {
    direction:
      '字段排列方式。vertical 从上到下堆叠；horizontal 按逻辑行内顺序为每个字段使用一个 1fr 网格轨道；horizontal-labels 把标签放在行内起始侧，视口 <=480px 时折叠。',
    defaultOptionality:
      '表单视为默认的状态，仅例外字段被标记。"optional" → 仅 isRequired 字段显示指示器；"required" → 仅 isOptional 字段显示。"required" 下未标记字段还暴露 aria-required（仅 aria，不设原生 required），CheckboxInput、Switch 和 CheckboxList 例外——它们不从默认值获得必填状态（CheckboxInput 和 Switch 仅通过自身 isRequired 成为必填）。不设置 = 逐字段行为。',
    children:
      '要排列的表单字段。接受 Astryx 输入组件 + Field 包装的自定义控件。',
    xstyle:
      '布局自定义用 StyleX 样式。必须是 stylex.create() 的值。',
  },
};
