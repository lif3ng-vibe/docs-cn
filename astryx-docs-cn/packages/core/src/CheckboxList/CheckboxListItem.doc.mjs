// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CheckboxListItem',
  subComponentOf: 'CheckboxList',
  displayName: 'Checkbox List Item',
  isHiddenFromOverview: true,
  description:
    '带标签、描述与尾部内容插槽的单个复选框项。可用于 collection 模式（位于带 value 数组的 CheckboxList 内）或独立模式（位于 List 内，或位于不带 value 的 CheckboxList 内，例如"全选"项）。在触摸屏（主指针为粗指针）上，可切换的行是一个整体按压目标：触摸标签、描述或框体本身，会在行与其复选框上同时显示按下状态。主指针为精细指针时，框体保留自己的按下效果。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '选项的主文本标签。富内容标签可包含链接或按钮，它们保留自身行为且不会切换该项。ReactNode 标签会以其可见文本为复选框命名；仅当可见文本缺失时才传 aria-label，否则覆盖值必须包含全部可见标签文字。',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '复选框的纯文本无障碍名称，替换由 label 推导出的名称。作用于复选框控件。富标签没有可见文本时使用；否则该值必须保留全部可见标签文字。',
    },
    {
      name: 'value',
      type: 'string',
      description:
        '标识键。父级 CheckboxList 带 value 数组时必填；缺失时该项会抛出错误。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '标签下方的次要内容。字符串或 ReactNode。通过 aria-describedby 作为复选框的无障碍描述暴露，辅助技术因此能识别它是该选择的说明。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '渲染在标签区域之后的内容。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        '起始与结束内容相对标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（复选框）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '该单个项是否禁用。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '该项是否加载中。在复选框内显示加载指示器并阻止该项的交互。collection 模式下，父级 changeAction 等待期间，被切换项也会自动显示此状态。',
      default: 'false',
    },
    {
      name: 'isChecked',
      type: "boolean | 'indeterminate'",
      description:
        '独立模式下的直接选中状态：位于 List 内，或位于不带 value 的 CheckboxList 内（例如"全选"项）。父级 CheckboxList 带 value 数组时忽略。',
    },
    {
      name: 'onCheck',
      type: '(checked: boolean) => void',
      description:
        '独立模式下的直接勾选处理函数：位于 List 内，或位于不带 value 的 CheckboxList 内。父级 CheckboxList 带 value 数组时忽略，由该列表的 onChange 接收变更。',
    },
  ],
  examples: [
    {
      label: '带覆盖 aria-label 的富内容标签',
      code: `<CheckboxListItem
  label={<span>Pro plan <Badge label="Recommended" /></span>}
  aria-label="Pro plan Recommended option"
  value="pro"
/>`,
    },
  ],
};

export const docsZh = {
  name: 'CheckboxListItem',
  isHiddenFromOverview: true,
  displayName: 'Checkbox List Item',
  description:
    '单个复选框选项，包含标签、描述和尾部内容插槽。可在集合模式（位于带 value 数组的 CheckboxList 内）或独立模式（位于 List 内，或位于不带 value 的 CheckboxList 内，例如“全选”选项）下使用。在触摸屏上，可切换的行是一个整体的按压目标：手指按在标签、描述或复选框本身上，行与其复选框会一起显示按下状态。主指针为精细指针时，复选框保留自己的按下效果。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '选项的主标签。富内容标签可包含链接或按钮，它们保留自身行为且不会切换该选项。ReactNode 标签会以其可见文本为复选框命名；仅当可见文本缺失时使用 aria-label，否则覆盖值必须保留全部可见文字。',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        '复选框的纯文本无障碍名称，会替换由 label 推导出的名称。仅当富标签没有可见文本时才完全替代；否则必须保留全部可见文字。',
    },
    {
      name: 'value',
      type: 'string',
      description:
        '标识键。当父级 CheckboxList 带有 value 数组时为必填；缺少时该选项会抛出错误。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '标签下方的辅助内容。可为字符串或 ReactNode。会通过 aria-describedby 作为复选框的无障碍描述暴露，便于辅助技术识别它是该选项的说明。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签区域后渲染的内容。',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        '起始和结束内容相对于标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（复选框）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '是否禁用此单个选项。',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        '此选项是否处于加载状态。在复选框内显示加载旋转器并阻止该选项的交互。在集合模式下，当父级 changeAction 处于待定状态时，被切换的选项会自动显示此状态。',
      default: 'false',
    },
    {
      name: 'isChecked',
      type: "boolean | 'indeterminate'",
      description:
        '独立模式下的直接选中状态：位于 List 内，或位于不带 value 的 CheckboxList 内（例如“全选”选项）。当父级 CheckboxList 带有 value 数组时忽略。',
    },
    {
      name: 'onCheck',
      type: '(checked: boolean) => void',
      description:
        '独立模式下的直接选中处理函数：位于 List 内，或位于不带 value 的 CheckboxList 内。当父级 CheckboxList 带有 value 数组时忽略，改由该列表的 onChange 接收变更。',
    },
  ],
};

export const docsDense = {
  name: 'CheckboxListItem',
  isHiddenFromOverview: true,
  displayName: 'Checkbox List Item',
  description:
    '带标签、描述与尾部内容插槽的单个复选框项。带 value 的 CheckboxList 内为 collection 模式；List 内或不带 value 的 CheckboxList 内为独立模式。触摸屏上可切换行作为整体按压（含框体）；精细主指针下框体保留自己的按下效果。',
  propDescriptions: {
    align:
      "起始/结束内容对齐，传递给 Item：'center'（默认）、'start' 或 'first-line'（与标签第一行对齐）。",
    label:
      '主标签。字符串或 ReactNode；嵌套控件保留自身行为。ReactNode 以可见文本为复选框命名。',
    'aria-label':
      '复选框纯文本名称，替换由 label 推导的名称。可见文本缺失时使用；否则保留全部可见标签文字。',
    value:
      '标识键。父级 CheckboxList 带 value 数组时必填（缺失则抛错）。',
    description:
      '标签下方次要内容。字符串或 ReactNode。经 aria-describedby 暴露为复选框的无障碍描述。',
    endContent: '渲染在标签区域后的内容。',
    isDisabled: '该单个项是否禁用。',
    isLoading:
      '项加载中：复选框内加载指示器 + 阻止交互。父级 changeAction 等待期间被切换项自动设置。',
    isChecked:
      '独立模式的直接选中状态（List 内或不带 value 的 CheckboxList 内）。父级带 value 数组时忽略。',
    onCheck:
      '独立模式的直接勾选处理（List 内或不带 value 的 CheckboxList 内）。父级带 value 数组时忽略，由其 onChange 接收变更。',
  },
};
