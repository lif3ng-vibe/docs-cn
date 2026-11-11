// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ToggleButtonGroup',
  subComponentOf: 'ToggleButton',
  displayName: 'Toggle Button Group',
  keywords: [
    'togglegroup',
    'buttontogglegroup',
    '切换按钮组',
    '按钮组',
    '单选',
    '多选',
  ],
  description: '将切换按钮分组，实现互斥（单选）或多选行为。通过 type 上的判别联合实现类型安全的 value/onChange。触摸呈现下按压会像菜单一样跟踪：按住一个切换按钮并滑过其他按钮，高亮随之移动。只有松开时所在的按钮会切换，在组外松开则不切换任何按钮。用手指时，每个切换按钮的触控目标向 44 px 扩展，最多扩展到与相邻按钮间距的一半，按钮本身不变大。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'ToggleButton 子元素。为每个成员提供 value；组持有按压状态，并忽略成员自身的 isPressed、onPressedChange 与 pressedChangeAction prop。成员激活会调用组的 onChange，但不会启动成员的 Action 过渡。',
      required: true,
      slotElements: [
        {
          __element: 'ToggleButton',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
    },
    {
      name: 'label',
      type: 'string',
      description: '分组的无障碍标签 (aria-label)。',
      required: true,
    },
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: '选择模式。single 只允许一个激活按钮，multiple 允许多个。',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'string | null | string[]',
      description: '当前选中的值。类型取决于选择模式。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string | null | string[]) => void',
      description: '选择变化时调用。',
      required: true,
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: '按钮组的布局方向。',
      default: "'horizontal'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '组内按钮的默认尺寸。单个按钮可覆盖。',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '组内所有按钮是否禁用。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式 (外边距、定位、尺寸)。必须是 stylex.create() 的值。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: '供自动化测试框架使用的测试选择器。',
    },
  ],
};

export const docsZh = {
  name: 'ToggleButtonGroup',
  displayName: 'Toggle Button Group',
  description: '将切换按钮分组，支持单选或多选行为。通过 type 判别联合类型实现类型安全。在触摸呈现下（主要指针为粗指针时），按下时分组像菜单一样跟踪按压：按下一个切换按钮并滑过其他按钮，高亮随之移动。只有松开时所在的按钮会切换，在分组外松开则不切换任何按钮。使用手指时，每个按钮的触控目标向 44 px 扩展，最多到与相邻按钮间距的一半，按钮本身不变大。',
  propDescriptions: {
    children: 'ToggleButton 子元素；每个成员都需要 value。分组控制按下状态，并忽略成员的 isPressed、onPressedChange 和 pressedChangeAction。激活成员只调用分组的 onChange，不启动成员的 Action 过渡。',
    label: '分组的无障碍标签 (aria-label)。',
    type: '选择模式。single 允许单个激活，multiple 允许多个。',
    value: '当前选中的值。类型取决于选择模式。',
    onChange: '选择变更时的回调。',
    orientation: '按钮组的布局方向。',
    size: '分组内按钮的默认尺寸。单个按钮可覆盖。',
    isDisabled: '分组内所有按钮是否禁用。',
    xstyle: 'StyleX 样式，用于布局自定义。必须是 stylex.create() 的值。',
    "data-testid": '自动化测试的选择器。',
  },
};

export const docsDense = {
  name: 'ToggleButtonGroup',
  displayName: 'Toggle Button Group',
  description: '切换按钮分组：支持互斥/多选；type 判别联合；触摸下按压可像菜单一样滑过各切换按钮，松开时所在者才切换；鼠标按压保持原生行为；手指触控目标向 44 px 扩展，最多到相邻间距一半',
  propDescriptions: {
    children: 'ToggleButton 子元素；每个成员都需 value。按压状态由组持有；成员的 isPressed/onPressedChange/pressedChangeAction 被忽略。选择走组的 onChange，无成员 Action 过渡。',
    label: '无障碍标签 (aria-label)',
    type: '选择模式：single 或 multiple',
    value: '选中值；类型取决于模式',
    onChange: '选择变化回调',
    orientation: '布局方向',
    size: '默认按钮尺寸；单个按钮可覆盖',
    isDisabled: '所有按钮禁用',
    xstyle: 'StyleX 布局样式；必须是 stylex.create() 的值',
    "data-testid": '测试选择器',
  },
};
