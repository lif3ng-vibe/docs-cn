// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LayoutContent',
  subComponentOf: 'Layout',
  displayName: 'Layout Content',
  isHiddenFromOverview: true,
  description: '可滚动的主内容区域。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        '内部内边距，使用间距刻度。覆盖布局容器的默认内边距。',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        '启用可滚动溢出。contentWidth 为可参与算术计算的值时，滚动视口延伸到每一条开放边缘，同时由上下文感知的内边距保持子内容对齐。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '地标元素的无障碍标签。区域滚动时，它也为滚动区域命名；未提供时使用已翻译的 "Content"。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到内容区域元素的 ref。',
    },
  ],
};

export const docsZh = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: '可滚动的主内容区域。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '内容。',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '使用间距比例的内边距。覆盖布局容器的默认内边距。',
    },
    {
      name: 'isScrollable',
      type: 'boolean',
      description:
        '启用可滚动溢出。设置可参与算术计算的 contentWidth 时，滚动区域会延伸到所有未被面板占用的边缘，同时根据上下文调整内边距以保持子内容对齐。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description:
        '地标元素的无障碍标签。区域滚动时，它也为滚动区域命名；未提供时使用已翻译的“Content”（内容）。',
    },
    {
      name: 'role',
      type: 'AriaRole',
      description: 'ARIA 地标角色。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到内容区域元素的 ref。',
    },
  ],
};

export const docsDense = {
  name: 'LayoutContent',
  isHiddenFromOverview: true,
  displayName: 'Layout Content',
  description: '可滚动的主内容区域。',
  propDescriptions: {
    children: '内容。',
    padding: '基于间距刻度的内边距。覆盖布局容器默认值。',
    isScrollable:
      '启用可滚动溢出。contentWidth 为可参与算术计算的值时，滚动视口延伸到开放边缘，同时由上下文感知的内边距保持子内容对齐。',
    label:
      '地标元素的无障碍标签；区域滚动时也为该区域命名（默认 "Content"）。',
    role: 'ARIA 地标角色。',
    ref: '转发到内容区域元素的 ref。',
  },
};
