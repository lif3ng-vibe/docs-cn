// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DropdownMenuRadioGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Group',
  isHiddenFromOverview: true,
  description:
    '由 DropdownMenuRadioItem 子项组成的受控、有名称的单选组（menuitemradio 的 role="group"）。该组负责值传递、关闭策略、根元素组合和菜单项间距；父 DropdownMenu 负责键盘导航。',
  usage: {
    description:
      '当多个命令代表同一个互斥选择时，在组合模式的 DropdownMenu 内使用 DropdownMenuRadioGroup。把 value 放在调用方状态中，提供简明的无障碍名称，并将每个选项渲染为 DropdownMenuRadioItem。',
    bestPractices: [
      {
        guidance: true,
        description:
          '保持 value 受控并在 onChange 中更新，让勾选状态跟随调用方数据。',
      },
      {
        guidance: true,
        description:
          '即使 aria-labelledby 指向可见文本，也要提供简明的 label；label 仍然必需，并作为 aria-label 后备。',
      },
      {
        guidance: true,
        description:
          '只有当菜单必须保持打开以展示另一次选择或就地结果时，才设置 hasCloseOnSelect=false。',
      },
      {
        guidance: false,
        description:
          '不要把按钮、链接、复选框或任意菜单行放进单选组。',
      },
      {
        guidance: false,
        description:
          '不要添加第二套按键处理器或漫游焦点模型；键盘导航由 DropdownMenu 负责。',
      },
    ],
    anatomy: [
      {
        name: 'Group',
        required: true,
        description:
          '持有无障碍名称、受控选择上下文、关闭策略、根元素输入和项间距的 role="group" 根元素。',
      },
      {
        name: 'Radio items',
        required: true,
        description:
          'DropdownMenuRadioItem 子项；每个子项持有自己的 menuitemradio 角色、勾选状态、内容和指示器外观。',
      },
    ],
  },
  playground: {
    wrapper: {
      component: 'DropdownMenu',
      // Open on first load so the radio choices are visible without a click;
      // the preview bridges `onOpenChange` back so selecting still closes the
      // menu and the trigger reopens it.
      props: {
        button: {label: 'Sort'},
        presentation: 'popover',
        isMenuOpen: true,
      },
    },
    defaults: {
      value: 'newest',
      label: 'Sort by',
      children: [
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'newest', label: 'Newest'},
        },
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'oldest', label: 'Oldest'},
        },
      ],
    },
  },
  props: [
    {
      name: 'value',
      type: 'string | undefined',
      description:
        '组中当前选中的值。尚无选中项时传 undefined。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '所选值变化时触发的回调。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '组的无障碍名称，作为 aria-label 应用，屏幕阅读器会把这组单选项播报为一个命名集合，如 "Sort by"。即使 aria-labelledby（通过基础属性）指向可见文本，label 仍然必需；可见引用会成为计算名称，label 则作为后备。',
      required: true,
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'true',
      description:
        '选择某值是否关闭菜单。单选项默认选择后关闭（单选提交）。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到 role="group" 根元素的 ref。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '组成该组的 DropdownMenuRadioItem。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'DropdownMenuRadioGroup',
  displayName: 'Dropdown Menu Radio Group',
  description:
    'DropdownMenu 中由调用方控制且有名称的单选组（menuitemradio 的 role="group"）。该组负责值传递、关闭策略、根元素组合和菜单项间距；父 DropdownMenu 负责键盘导航。',
  propDescriptions: {
    value: '组中当前选中的值。尚无选中项时传 undefined。',
    onChange: '所选值变化时触发的回调。',
    label:
      '组的无障碍名称，作为 aria-label 应用。即使 aria-labelledby（通过基础属性）指向可见文本，label 仍然必需并作为后备名称。',
    hasCloseOnSelect: '选择某值是否关闭菜单。默认关闭。',
    ref: '转发到 role="group" 根元素的 ref。',
    children: '组成该组的 DropdownMenuRadioItem。',
  },
};

export const docsDense = {
  name: 'DropdownMenuRadioGroup',
  displayName: 'Dropdown Menu Radio Group',
  description:
    '受控且有名称的 menuitemradio 组；负责值传递、关闭策略、根元素输入和项间距',
  propDescriptions: {
    value: '选中的值（undefined = 未选）',
    onChange: '所选值变化时触发',
    label: '组的无障碍名称（作为 aria-label 应用）；必填',
    hasCloseOnSelect: '选择时关闭菜单（默认 true）',
    ref: '转发到 role="group" 根元素',
    children: '组成该组的 DropdownMenuRadioItem',
  },
};
