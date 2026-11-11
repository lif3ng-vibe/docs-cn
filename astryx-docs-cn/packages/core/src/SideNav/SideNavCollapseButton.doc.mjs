// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SideNavCollapseButton',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Collapse Button',
  isHiddenFromOverview: true,
  description: '侧边栏折叠切换按钮。放置在 SideNav 内部（自动读取上下文）或外部（向两者传入同一个受控 collapsible 配置）。默认渲染为仅图标的 ghost 按钮。',
  playground: {
    defaults: {
      collapsible: {
        isCollapsed: false,
        onCollapsedChange: undefined,
      },
    },
  },
  props: [
    {
      name: 'collapsible',
      type: '{isCollapsed: boolean, onCollapsedChange: (isCollapsed: boolean) => void, defaultIsCollapsed?: boolean, hasButton?: boolean, buttonLabel?: string}',
      description: '与 SideNav 相同的受控 collapsible 配置，包含其全部键。仅在按钮渲染在侧边栏外部、折叠上下文无法到达时需要。',
    },
    {
      name: 'handleRef',
      type: 'RefObject<SideNavImperativeCollapseHandle | null>',
      description: '已弃用。来自 SideNav 的命令式折叠句柄；请改传 collapsible。',
    },
    {
      name: 'label',
      type: 'string',
      description: '自定义按钮标签。提供时渲染为带箭头的文本按钮。省略时渲染为仅图标按钮。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: "按钮尺寸。默认使用容器级联的尺寸（SideNav 页脚内为 'sm'），无容器时为 'md'。当按钮位于已设定尺寸的容器之外且需要与相邻元素保持一致时显式设置。",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '自定义按钮内容。覆盖默认的箭头图标和标签。',
    },
  ],
};

export const docsZh = {
  name: 'SideNavCollapseButton',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Collapse Button',
  description: '侧边栏折叠切换按钮。放置在 SideNav 内部（自动读取上下文）或外部（向两者传入同一个受控 collapsible 配置）。默认渲染为仅图标的 ghost 按钮。',
  props: [
    {
      name: 'collapsible',
      type: '{isCollapsed: boolean, onCollapsedChange: (isCollapsed: boolean) => void, defaultIsCollapsed?: boolean, hasButton?: boolean, buttonLabel?: string}',
      description: '与 SideNav 相同的受控 collapsible 配置，包含其全部键。仅在按钮渲染在侧边栏外部、无法读取折叠上下文时需要。',
    },
    {
      name: 'handleRef',
      type: 'RefObject<SideNavImperativeCollapseHandle | null>',
      description: '已废弃。来自 SideNav 的命令式折叠句柄；请改用 collapsible。',
    },
    {
      name: 'label',
      type: 'string',
      description: '自定义按钮标签。提供时渲染为带箭头的文本按钮。省略时渲染为仅图标按钮。',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: "按钮尺寸。默认使用容器级联的尺寸（SideNav 页脚内为 'sm'），无容器时为 'md'。当按钮位于已设定尺寸的容器之外且需要与相邻元素保持一致时显式设置。",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '自定义按钮内容。覆盖默认的箭头图标和标签。',
    },
  ],
};

export const docsDense = {
  name: 'SideNavCollapseButton',
  isHiddenFromOverview: true,
  displayName: 'Side Nav Collapse Button',
  description: '侧边栏折叠切换按钮。放置在 SideNav 内部（读取上下文）或外部（向两者传入同一个受控 collapsible 配置）。默认为仅图标的 ghost 按钮。',
  propDescriptions: {
    collapsible: '受控 collapsible 配置，与 SideNav 拿到的是同一对象，允许全部键。仅在按钮渲染在侧边栏外部时需要。',
    handleRef: '已弃用。请改传 collapsible。',
    label: '自定义标签。提供时为带箭头的文本按钮，省略时为仅图标按钮。',
    size: "按钮尺寸。继承自容器（SideNav 页脚内为 'sm'），否则为 'md'。",
    children: '自定义内容。覆盖默认的箭头图标 + 标签。',
  },
};
