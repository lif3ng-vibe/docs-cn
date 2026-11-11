// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SideNavSection',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Section',
  isHiddenFromOverview: true,
  description: '分组，支持可选的标题、副标题和尾部内容。',
  playground: {
    defaults: {
      title: '工作区',
      children: [
        {__element: 'SideNavItem', props: {label: '仪表盘', isSelected: true}},
        {__element: 'SideNavItem', props: {label: '项目'}},
        {__element: 'SideNavItem', props: {label: '设置'}},
      ],
    },
  },
  props: [
    {
      name: 'title',
      type: 'string',
      description: '分组标题。',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'string',
      description: '分组副标题。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '分组项目。',
      slotElements: [
        {
          __element: 'SideNavItem',
          props: {
            label: 'Item',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '分组头部的右侧内容。',
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
      name: 'isHeaderHidden',
      type: 'boolean',
      description: '在视觉上隐藏分组头部，同时保持屏幕阅读器可访问。',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
};

export const docsZh = {
  name: 'SideNavSection',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Section',
  description: '分组，支持可选的标题、副标题和尾部内容。',
  props: [
    {
      name: 'title',
      type: 'string',
      description: '分组标题。',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'string',
      description: '分组副标题。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '分组项目。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '分组头部的右侧内容。',
    },
    {
      name: 'isHeaderHidden',
      type: 'boolean',
      description: '视觉上隐藏分组头部，同时保持屏幕阅读器可访问。',
      default: 'false',
    },
  ],
};

export const docsDense = {
  name: 'SideNavSection',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Section',
  description: '分组，带可选标题、副标题与尾部内容。',
  propDescriptions: {
    title: '分组标题。',
    subtitle: '分组副标题。',
    children: '分组项目。',
    endContent: '分组头部的右侧内容。',
    isHeaderHidden: '视觉上隐藏分组头部，同时保持屏幕阅读器可访问。',
    xstyle: '用于布局自定义的 StyleX 样式。',
  },
};
