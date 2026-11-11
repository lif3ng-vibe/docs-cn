// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'FieldLabel',
  subComponentOf: 'Field',
  displayName: 'Field Label',
  isHiddenFromOverview: true,
  description:
    '独立标签组，可标记单个控件或调用方命名的控件组，并支持说明文本、可选/必填指示器、图标和工具提示。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本，始终为无障碍渲染。',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: '此标签关联的输入框 ID。',
      required: true,
    },
    {
      name: 'labelID',
      type: 'string',
      description:
        '应用到标签元素本身的 ID。`isGroupLabel` 为 true 时用于 `aria-labelledby`。',
    },
    {
      name: 'isGroupLabel',
      type: 'boolean',
      description:
        '渲染可命名控件组的 span，而不是关联单个控件的原生 label。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏标签和说明，同时为辅助技术保留两者。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '为关联控件使用禁用状态的标签样式。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        '显示本地化的可选指示器，除非与 FormLayout 的默认可选性一致。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        '显示本地化的必填指示器，除非与 FormLayout 的默认可选性一致。',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description:
        '标签文本前的图标或已渲染的图标内容。语义名称见 `astryx docs icons`。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '标签后信息按钮的帮助文本，按钮名为 "About {label}"。悬停和键盘聚焦时预览；点按、点击、Enter 或 Space 会打开它，且永远不会聚焦或切换所关联的控件。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '显示在标签下方的说明内容，与控件的无障碍名称保持分离。',
    },
    {
      name: 'descriptionID',
      type: 'string',
      description:
        '应用到说明内容的 ID，供调用方连接 `aria-describedby`。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLLabelElement>',
      description:
        '转发到标签元素的 ref。控件组模式当前渲染 span。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '在基础和状态样式之后应用到标签元素的 StyleX 样式。',
    },
    {
      name: 'className',
      type: 'string',
      description: '追加到标签元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        '在 StyleX 内联样式之后应用到标签元素的内联样式。',
    },
  ],
};

export const docsZh = {
  name: 'FieldLabel',
  isHiddenFromOverview: true,
  displayName: 'Field Label',
  description:
    '独立标签组，可标记单个控件或调用方命名的控件组，并支持说明文本、可选/必填指示器、图标和工具提示。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '标签文本，始终为辅助技术保留。',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: '此标签关联的输入框 ID。',
      required: true,
    },
    {
      name: 'labelID',
      type: 'string',
      description:
        '应用到标签元素本身的 ID。isGroupLabel 为 true 时用于 aria-labelledby。',
    },
    {
      name: 'isGroupLabel',
      type: 'boolean',
      description:
        '渲染用于命名控件组的 span，而不是关联单个控件的原生 label。',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '视觉隐藏标签和说明，同时为辅助技术保留。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '使用关联控件的禁用标签样式。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '当其不匹配 FormLayout 默认值时显示本地化的可选指示器。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '当其不匹配 FormLayout 默认值时显示本地化的必填指示器。',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description: '标签文本前的图标或已渲染图标内容。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '标签后信息图标的工具提示文本。悬停即可显示；在触摸屏上点按图标即可打开，不会聚焦字段或切换控件；用鼠标点击图标则与点击标签其他部分一样激活控件。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '标签下方的说明内容，与控件的无障碍名称保持分离。',
    },
    {
      name: 'descriptionID',
      type: 'string',
      description: '应用到说明内容的 ID，供调用方连接 aria-describedby。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLLabelElement>',
      description: '转发到标签元素的 ref。控件组模式当前渲染 span。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '在基础和状态样式之后应用到标签元素的 StyleX 样式。',
    },
    {
      name: 'className',
      type: 'string',
      description: '追加到标签元素的 CSS 类名。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '在 StyleX 内联样式之后应用到标签元素的内联样式。',
    },
  ],
};

export const docsDense = {
  name: 'FieldLabel',
  isHiddenFromOverview: true,
  displayName: 'Field Label',
  description:
    '面向单个控件或调用方命名控件组的标签组；支持说明文本、可选性、图标、工具提示',
  propDescriptions: {
    label: '标签文本。',
    inputID: '关联控件的 ID。',
    labelID: '标签元素的 ID，供调用方连接 aria-labelledby。',
    isGroupLabel: '渲染组标签 span 而非原生 label。',
    isLabelHidden: '视觉隐藏标签和说明。',
    isDisabled: '使用禁用状态的标签样式。',
    isOptional: '显示本地化的可选例外指示器。',
    isRequired: '显示本地化的必填例外指示器。',
    labelIcon: '标签文本前的图标类型或已渲染图标内容。',
    labelTooltip: '标签后信息按钮的帮助文本。',
    description: '无障碍名称之外的说明内容。',
    descriptionID: '供调用方连接 aria-describedby 的 ID。',
    ref: '转发到标签元素的 ref；组模式渲染 span。',
    xstyle: '标签元素的 StyleX 样式。',
    className: '标签元素的 CSS 类名。',
    style: '标签元素的内联样式。',
  },
};
