// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CollapsibleGroup',
  subComponentOf: 'Collapsible',
  displayName: 'Collapsible Group',
  isHiddenFromOverview: true,
  description: '协调多个 Collapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。除非启用 dividers，否则不渲染包裹 DOM 元素。',
  props: [
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: '是否允许同时展开一个或多个项目。',
      default: "'single'",
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      description: '非受控用法下默认展开的项目。single 模式用字符串，multiple 模式用数组。',
    },
    {
      name: 'value',
      type: 'string | string[]',
      description: '受控的展开项目。',
    },
    {
      name: 'onChange',
      type: '(value: string | string[]) => void',
      description: '展开项目集合变化时调用的回调。',
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: '是否在组内项目之间绘制发丝分隔线。设置后组会渲染包裹 div，且项目默认取 balanced 密度。适合搭配裸 Collapsible 子项；Card 包裹的项目自带分隔。',
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: "控制组内项目触发器与内容块内边距的行密度。显示分隔线时默认 'balanced'；否则项目保持默认的无内边距外观。",
    },
    {
      name: 'chevronPosition',
      type: "'start' | 'end'",
      description: '组内直接 Collapsible 项目共享的逻辑箭头位置。`end` 为默认的尾随指示器；`start` 为前置展开箭头，收起时朝内容方向指（RTL 下镜像），展开时朝下。单个 Collapsible 仍可覆盖。',
      default: "'end'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '需要协调的 Collapsible 实例。',
      required: true,
      slotElements: [
        {
          __element: 'Collapsible',
          props: {
            trigger: 'Section',
          },
          children: '内容',
        },
      ],
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'hasDividers 渲染包裹层时转发到其上的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'hasDividers 渲染包裹层时其上的 StyleX 样式。必须是 stylex.create() 的值。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'hasDividers 渲染包裹层时其上的 CSS class 名。样式定制优先使用 xstyle。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'hasDividers 渲染包裹层时其上的内联样式。需要 StyleX 优化时优先使用 xstyle。',
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'hasDividers 渲染包裹层时转发到其上的测试选择器。',
    },
  ],
};

export const docsZh = {
  name: 'CollapsibleGroup',
  isHiddenFromOverview: true,
  displayName: 'Collapsible Group',
  description: '协调多个 Collapsible 实例，使同一时间只有一个（single 模式）或任意数量（multiple 模式）可以展开。除非启用 dividers，否则不渲染包裹 DOM 元素。',
  props: [
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: '是否允许同时展开一个或多个项目。',
      default: "'single'",
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      description: '非受控模式下默认展开的项目。single 模式使用字符串，multiple 模式使用数组。',
    },
    {
      name: 'value',
      type: 'string | string[]',
      description: '受控展开的项目。',
    },
    {
      name: 'onChange',
      type: '(value: string | string[]) => void',
      description: '展开项目集合变更时调用的回调。',
    },
    {
      name: 'hasDividers',
      type: 'boolean',
      description: "是否在组项目之间绘制细线分隔线。启用后组会渲染一个包裹 div，且项目默认使用 'balanced' 密度。适合搭配裸 Collapsible 子项使用；用 Card 包裹的项目自带视觉分隔。",
      default: 'false',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: "控制组内项目触发器和内容块内边距的行密度。显示分隔线时默认为 'balanced'；否则项目保持默认的无内边距外观。",
    },
    {
      name: 'chevronPosition',
      type: "'start' | 'end'",
      description: "组内直接 Collapsible 项目的逻辑箭头位置。`end` 是默认的尾随指示器；`start` 是前置展开箭头，折叠时指向内容（RTL 下镜像），展开时向下。单个 Collapsible 仍可覆盖此设置。",
      default: "'end'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '需要协调的 Collapsible 实例。',
      required: true,
    },
  ],
};

export const docsDense = {
  name: 'CollapsibleGroup',
  isHiddenFromOverview: true,
  displayName: 'Collapsible Group',
  description: '协调多个 Collapsible 实例；single 或 multiple 展开。未启用 dividers 时不渲染包裹 DOM。',
  propDescriptions: {
    type: '同时展开一个或多个项目',
    defaultValue: '默认展开项目（非受控）；single 用字符串，multiple 用数组',
    value: '受控展开项目',
    onChange: '展开项目变化回调',
    hasDividers: '项目间绘制发丝分隔线；启用包裹 div + balanced 密度；搭配裸 Collapsible 子项',
    density: "行内边距 'compact' | 'balanced' | 'spacious'；有分隔线时默认 'balanced'，否则无内边距",
    chevronPosition: "直接项目的逻辑箭头位置：'end'（默认尾随，下/上）| 'start'（前置，收起朝内容/展开朝下，RTL 镜像）；单项目 prop 优先",
    children: '需要协调的 Collapsible 实例',
  },
};
