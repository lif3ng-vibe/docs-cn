// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ListItem',
  subComponentOf: 'List',
  displayName: 'List Item',
  isHiddenFromOverview: true,
  description:
    '带标签、描述、start/end 内容插槽与交互模式的列表项。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '主要内容。纯字符串会自动应用单行截断；ReactNode 按原样渲染，由子组件自行控制文本行为。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '标签下方的次要内容。纯字符串会自动应用单行截断；ReactNode 让子组件自行控制换行与多行截断行为。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description:
        '在标签区域之前渲染的内容（例如图标、头像）。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签区域之后渲染的内容（例如徽章、折叠箭头）。',
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
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理器；启用隐形按钮模式。',
    },
    {
      name: 'interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '指向嵌套控件（例如 startContent 中的复选框）的 ref，该控件承载此项的键盘访问与操作。行成为更大的点击/点按目标，把表面点击委托给它（useClickableContainer），且不渲染隐形按钮/锚点，因此行不会增加第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥；设置后二者被忽略。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '链接 URL；启用隐形锚点模式。目标遵循 Link `href` prop 所述的共享导航规则。',
    },
    {
      name: 'target',
      type: 'string',
      description:
        '链接的 target 属性，仅在提供 href 时适用。target="_blank" 会自动添加 noopener noreferrer。',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        'start 与 end 内容相对标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（状态点、图标）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态；在项上设置 aria-disabled。',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '选中状态；以 aria-current="true" 把该项标为当前项（列表项不能携带 aria-selected）。',
      default: 'false',
    },
    {
      name: 'itemKey',
      type: 'string | number',
      description: "行的 item 键，取自数据的字符串或数字（与 Table 的 idKey 返回的形状相同）。它是该行在列表动画布局（List animatedLayout）中的身份：传入句柄时，列表按它匹配各行，为插入、删除与移动添加动画；没有它的行立即变化。在可重排 List（List reorderable）中，它是 reorderable 对象的 onReorder 上报、isReorderable 询问的键；没有它的行没有重排手柄并保持原位。与 React 的 key 相互独立。",
    },
    {
      name: 'swipeActions',
      type: '{leading?: ItemSwipeAction[]; trailing?: ItemSwipeAction[]}',
      description:
        "触摸滑动操作，原样传递给 Item：横向拖动在每一侧揭示的操作，每项为 `{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`。参见 Item.swipeActions；List 会为此在行内轴上裁剪行。",
    },
    {
      name: 'swipeBehavior',
      type: "'reveal' | 'commit'",
      description:
        '滑动的行为，原样传递给 Item。参见 Item.swipeBehavior。',
      default: "'reveal'",
    },
  ],
};

export const docsZh = {
  name: 'ListItem',
  isHiddenFromOverview: true,
  displayName: 'List Item',
  description: '列表项，包含标签、描述、起始/结束内容插槽和交互模式。',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        '主要内容。纯字符串会自动应用单行截断；ReactNode 按原样渲染，由子组件自行控制文本行为。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        '标签下方的次要内容。纯字符串会自动应用单行截断；ReactNode 允许子组件自行控制换行和多行截断行为。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '在标签区域之前渲染的内容（如图标、头像）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '在标签区域之后渲染的内容（如徽章、箭头）。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: '点击处理函数；启用隐形按钮模式。',
    },
    {
      name: 'interactiveRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        '指向嵌套控件（如 startContent 中的复选框）的 ref，该控件承载项目的键盘访问和操作。行成为更大的点击/触摸目标，将表面点击委托给该控件（useClickableContainer），且不渲染不可见按钮/锚点，因此行不会增加第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥——设置后二者将被忽略。',
    },
    {
      name: 'href',
      type: 'string',
      description: '链接 URL；启用隐形锚点模式。',
    },
    {
      name: 'target',
      type: 'string',
      description:
        '链接 target 属性，仅在提供 href 时适用。target="_blank" 会自动添加 noopener noreferrer。',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        '起始和结束内容相对于标签的垂直对齐方式，原样传递给 Item。`first-line` 让小标记（状态点、图标）与换行标签的第一行保持水平。参见 Item.align。',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用状态；在项目上设置 aria-disabled。',
      default: 'false',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: '选中状态；在项目上设置 aria-current="true"，将其标为当前项（列表项不能使用 aria-selected）。',
      default: 'false',
    },
    {
      name: 'itemKey',
      type: 'string | number',
      description: '行的项目键，取自数据的字符串或数字（与 Table 的 idKey 返回的形状相同）。它是列表动画布局（List animatedLayout）中该行的身份：传入句柄时，列表按它匹配各行，为插入、删除和移动添加动画；没有项目键的行会立即变化。在可重新排序的 List（List reorderable）中，它是可重新排序对象的 onReorder 报告的键，也是 isReorderable 判断的键；没有项目键的行没有重新排序手柄，保持原位。与 React 的 key 相互独立。',
    },
    {
      name: 'swipeActions',
      type: '{leading?: ItemSwipeAction[]; trailing?: ItemSwipeAction[]}',
      description:
        "触摸滑动操作，原样传递给 Item：横向拖动在每一侧揭示的操作，每项为 `{id?, label, icon?, onActivate, isDisabled?, variant?: 'neutral' | 'accent' | 'destructive', hasRemoval?}`。参见 Item.swipeActions；List 会在行内轴上裁剪行。",
    },
    {
      name: 'swipeBehavior',
      type: "'reveal' | 'commit'",
      description: '滑动的行为，原样传递给 Item。参见 Item.swipeBehavior。',
      default: "'reveal'",
    },
  ],
};

export const docsDense = {
  name: 'ListItem',
  isHiddenFromOverview: true,
  displayName: 'List Item',
  description:
    '带标签、描述、start/end 内容插槽与交互模式的列表项。',
  propDescriptions: {
    align:
      "start/end 内容对齐方式，传给 Item：'center'（默认）、'start' 或 'first-line'（与标签第一行居中对齐）。",
    label:
      '主要内容。字符串自动截断；ReactNode 按原样渲染。',
    description: '标签下方的次要文本。',
    startContent: '标签区域之前的内容（例如图标、头像）。',
    endContent: '标签区域之后的内容（例如徽章、折叠箭头）。',
    onClick: '点击处理器；启用隐形按钮模式。',
    interactiveRef:
      '指向承载此项键盘访问/操作的嵌套控件的 ref；行把表面点击委托给它（useClickableContainer），无隐形按钮/锚点，无第二个 Tab 停留点（WCAG 4.1.2）。与 onClick/href 互斥。',
    href: '链接 URL；启用隐形锚点模式。遵循共享导航规则（见 Link href）。',
    target:
      '链接 target 属性，仅在提供 href 时适用。target="_blank" 自动添加 noopener noreferrer。',
    rel: '链接关系标记。target="_blank" 会合并 noopener noreferrer。',
    isDisabled: '禁用状态；设置 aria-disabled。',
    isSelected: '选中状态；设置 aria-current="true"。',
    itemKey: '该行在 List animatedLayout 中的身份，也是可重排 List 的 onReorder 上报的键；没有它的行立即变化且没有重排手柄。',
  },
};
