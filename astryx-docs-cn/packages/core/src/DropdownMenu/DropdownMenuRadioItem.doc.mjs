// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Item',
  isHiddenFromOverview: true,
  description:
    'DropdownMenuRadioGroup 中的单个选项（role="menuitemradio"）。必须在 DropdownMenuRadioGroup 内使用。',
  playground: {
    defaults: {
      value: 'option-1',
      label: 'Option 1',
    },
    wrapper: {
      component: 'DropdownMenuRadioGroup',
      props: {
        value: 'option-1',
        label: 'Radio group',
      },
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description:
        "该项在组内代表的值。组的 value 与之匹配以确定勾选状态。",
    },
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description: '标识该选项的主标签文本。',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '显示在标签下方的次要描述文本。',
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        '显示在标签前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        '该单选项自身是否禁用。禁用项仍以禁用状态（aria-disabled）留在无障碍树中，方向键和 typeahead 仍可到达它，方便键盘用户发现；指针高亮会跳过它，选择被阻止。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签和描述之后渲染的内容，如徽章或元数据。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        '转发到行根元素（携带 role="menuitemradio" 的元素）的 ref。用以元素为键的 observer 或 overlay 注册该行。',
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuRadioItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Item',
  description:
    'DropdownMenuRadioGroup 中的单个选项（role="menuitemradio"）。必须在 DropdownMenuRadioGroup 内使用。',
  propDescriptions: {
    value: '该项在组内代表的值。组的 value 与之匹配以确定勾选状态。',
    label: '标识该选项的主标签文本。',
    description: '显示在标签下方的次要描述文本。',
    icon: '显示在标签前的图标。',
    isDisabled: '该单选项是否禁用。',
    endContent: '在标签和描述之后渲染的内容。',
    ref: '转发到行根元素（带 role="menuitemradio" 的元素）的 ref。',
  },
};

export const docsDense = {
  name: 'DropdownMenuRadioItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Radio Item',
  description: 'DropdownMenuRadioGroup 中的单个选项（menuitemradio）',
  propDescriptions: {
    value: '该项在组内的值（与组 value 匹配）',
    label: '主标签文本',
    description: '标签下方的次要文本',
    icon: '标签前的图标',
    isDisabled:
      '禁用（aria-disabled）；方向键/typeahead 可到达、可聚焦、不响应选择',
    endContent: 'label+description 之后的内容',
    ref: '转发到行根元素（携带 role="menuitemradio" 的元素）',
  },
};
