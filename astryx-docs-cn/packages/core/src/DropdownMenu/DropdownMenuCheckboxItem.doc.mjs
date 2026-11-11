// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Checkable row',
    required: true,
    description:
      'menuitemcheckbox 根元素，持有无障碍名称、勾选状态、焦点和激活行为。',
  },
  {
    name: 'Label/content',
    required: true,
    description:
      '由 Item 排布的调用方内容：必填的 label，加上可选的 description、icon 和尾部内容。',
  },
  {
    name: 'Checkbox marker',
    required: true,
    description:
      '装饰性的共用 Indicator 外观，用于可视化勾选与禁用状态，不引入第二个控件。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuCheckboxItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Checkbox Item',
  isHiddenFromOverview: true,
  description:
    '可勾选的菜单项（role="menuitemcheckbox"），用于切换独立的布尔值。用于 DropdownMenu 中的开关选项；单选请使用 DropdownMenuRadioGroup。',
  usage: {
    anatomy,
    description:
      'DropdownMenu 内可独立勾选的选项。行本身承载 menuitemcheckbox 语义，共用 Indicator 提供装饰性的复选外观。',
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: '标识该项的主标签文本。',
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
      name: 'value',
      type: 'boolean',
      description:
        '该项是否被勾选。受控，与 onChange 搭配使用。',
    },
    {
      name: 'onChange',
      type: '(checked: boolean) => void',
      description:
        '切换该项时以下一个勾选状态触发的回调。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        '该项是否禁用。禁用项仍以禁用状态（aria-disabled）留在无障碍树中，方向键和 typeahead 仍可到达它，方便键盘用户发现；指针高亮会跳过它，激活被阻止。',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'false',
      description:
        '切换该项是否关闭菜单。复选项默认保持菜单打开，以便一次会话中切换多个选项。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        '转发到行根元素（携带 role="menuitemcheckbox" 的元素）的 ref。用以元素为键的 observer 或 overlay 注册该行。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签和描述之后渲染的内容，如快捷键提示或徽章。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size'],
      },
    ],
  },
};

export const docsZh = {
  name: 'DropdownMenuCheckboxItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Checkbox Item',
  description:
    '可勾选的菜单项（role="menuitemcheckbox"），用于切换独立的布尔值。用于 DropdownMenu 中的开关选项；单选请使用 DropdownMenuRadioGroup。',
  propDescriptions: {
    label: '标识该项的主标签文本。',
    description: '显示在标签下方的次要描述文本。',
    icon: '显示在标签前的图标。',
    value: '该项是否被勾选。受控，与 onChange 搭配使用。',
    onChange: '切换该项时以下一个勾选状态触发的回调。',
    isDisabled: '该项是否禁用。',
    hasCloseOnSelect: '切换该项是否关闭菜单。默认保持打开。',
    ref: '转发到行根元素（带 role="menuitemcheckbox" 的元素）的 ref。',
    endContent: '在标签和描述之后渲染的内容。',
  },
};

export const docsDense = {
  name: 'DropdownMenuCheckboxItem',
  isHiddenFromOverview: true,
  displayName: 'Dropdown Menu Checkbox Item',
  description:
    '可勾选菜单项（menuitemcheckbox）；切换独立布尔值',
  propDescriptions: {
    label: '主标签文本',
    description: '标签下方的次要文本',
    icon: '标签前的图标',
    value: '勾选状态（受控，配 onChange）',
    onChange: '切换时以下一个勾选状态触发',
    isDisabled:
      '禁用（aria-disabled）；方向键/typeahead 可到达、可聚焦、不响应激活',
    hasCloseOnSelect: '切换时关闭菜单（默认 false，保持打开）',
    ref: '转发到行根元素（携带 role="menuitemcheckbox" 的元素）',
    endContent: 'label+description 之后的内容',
  },
};
