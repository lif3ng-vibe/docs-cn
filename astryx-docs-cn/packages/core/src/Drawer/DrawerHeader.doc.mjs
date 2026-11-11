// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DrawerHeader.doc.mjs
 * @input DrawerHeader props, anatomy, theming targets, and examples
 * @output Consumer documentation for DrawerHeader, a sub-component of Drawer
 * @position CLI and docsite metadata for the Drawer header; runnable docsite demos live in packages/cli/assets/templates/blocks/components/DrawerHeader
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DrawerHeader',
  subComponentOf: 'Drawer',
  displayName: 'Drawer Header',
  // Keeps the registry route DrawerHeader had as a canary-only Lab component.
  registry: {aliases: ['lab/drawer-header']},
  isHiddenFromOverview: true,
  description:
    '抽屉头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽；API 与 DialogHeader 相同。',
  usage: {
    description:
      '像 Dialog 中的 DialogHeader 一样，把 DrawerHeader 放在 Drawer 内 Layout 的 header 插槽，提供标题行；传入 onOpenChange 时显示关闭按钮。Layout 让页眉对齐抽屉的内边距，而不是重复缩进。Drawer 本身不渲染关闭按钮。与 DialogHeader 不同，它不会在打开时获得焦点（Drawer 使用 data-autofocus），也不为抽屉命名（由 Drawer 的 label 命名）。',
    anatomy: [
      {
        name: 'Header row',
        required: true,
        description:
          '排列标题区、可选的首尾内容和关闭控件。',
      },
      {
        name: 'Start content',
        required: false,
        description: '包装可选的首部内容。',
      },
      {
        name: 'Title block',
        required: true,
        description: '组合标题和可选副标题。',
      },
      {
        name: 'End content',
        required: false,
        description:
          '组合可选尾部内容和可选关闭控件。',
      },
      {
        name: 'Close icon',
        required: false,
        description: '关闭按钮内的关闭图标。',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        '抽屉标题，渲染为 h2。请使用非交互的行内内容。它不为抽屉命名；请为 Drawer 传入 label。',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description:
        '标题下方的副标题，可包含链接等行内内容；避免使用块级元素。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        '关闭按钮的回调，以 false 调用（省略时不显示按钮）。传入 Drawer 自己的 onOpenChange。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '标题之前的内容（例如返回按钮）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '标题之后、关闭按钮之前的内容。',
    },
    {
      name: 'endContentEdgeCompensation',
      type: "'inline' | 'block' | 'all'",
      description:
        '选择尾部内容插槽的补偿轴；省略时保留关闭操作的自动补偿。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '在底部边缘添加分隔线。默认取父级 Layout 的 defaultHasDividers。',
    },
  ],
  playground: {
    defaults: {
      title: 'Host details',
      subtitle: 'web-prod-04',
      hasDivider: true,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-drawer-header'},
      {className: 'astryx-drawer-header-start-content'},
      {className: 'astryx-drawer-header-title-block'},
      {className: 'astryx-drawer-header-end-content'},
      {className: 'astryx-drawer-header-close-icon'},
    ],
  },
  examples: [
    {
      label: '带关闭按钮',
      code: `
import {useState} from 'react';
import {Drawer, DrawerHeader} from '@astryxdesign/core/Drawer';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';

function Inspector() {
  const [isOpen, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return (
    <Drawer isOpen={isOpen} onOpenChange={setIsOpen} label="Details">
      <Layout
        header={<DrawerHeader title="Details" onOpenChange={setIsOpen} />}
        content={<LayoutContent>Content</LayoutContent>}
      />
    </Drawer>
  );
}
`,
    },
    {
      label: '带副标题与尾部内容',
      code: `
import {DrawerHeader} from '@astryxdesign/core/Drawer';
import {Badge} from '@astryxdesign/core/Badge';

<DrawerHeader
  title="web-prod-04"
  subtitle="us-east-1"
  endContent={<Badge label="Healthy" />}
/>;
`,
    },
  ],
};

export const docsZh = {
  name: 'DrawerHeader',
  isHiddenFromOverview: true,
  displayName: 'Drawer Header',
  description:
    '抽屉头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽；API 与 DialogHeader 相同。',
  usage: {
    description:
      '像 Dialog 中的 DialogHeader 一样，把 DrawerHeader 放在 Drawer 内 Layout 的 header 插槽，提供标题行；传入 onOpenChange 时显示关闭按钮。Layout 让页眉对齐抽屉的内边距，而不是重复缩进。Drawer 本身不渲染关闭按钮。与 DialogHeader 不同，它不会在打开时获得焦点（Drawer 使用 data-autofocus），也不为抽屉命名（由 Drawer 的 label 命名）。',
    anatomy: [
      {
        name: 'Header row',
        required: true,
        description: '排列标题区、可选的首尾内容和关闭控件。',
      },
      {
        name: 'Start content',
        required: false,
        description: '包装可选的首部内容。',
      },
      {
        name: 'Title block',
        required: true,
        description: '组合标题和可选副标题。',
      },
      {
        name: 'End content',
        required: false,
        description: '组合可选尾部内容和可选关闭控件。',
      },
      {
        name: 'Close icon',
        required: false,
        description: '关闭按钮内的关闭图标。',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        '抽屉标题，渲染为 h2。请使用非交互的行内内容。它不为抽屉命名；请为 Drawer 传入 label。',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description: '标题下方的副标题，可包含链接等行内内容；避免使用块级元素。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        '关闭按钮的回调，以 false 调用（省略时不显示按钮）。传入 Drawer 自己的 onOpenChange。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '标题之前的内容（例如返回按钮）。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: '标题之后、关闭按钮之前的内容。',
    },
    {
      name: 'endContentEdgeCompensation',
      type: "'inline' | 'block' | 'all'",
      description: '选择尾部内容插槽的补偿轴；省略时保留关闭操作的自动补偿。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '在底部边缘添加分隔线。默认取父级 Layout 的 defaultHasDividers。',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-drawer-header'},
      {className: 'astryx-drawer-header-start-content'},
      {className: 'astryx-drawer-header-title-block'},
      {className: 'astryx-drawer-header-end-content'},
      {className: 'astryx-drawer-header-close-icon'},
    ],
  },
};

export const docsDense = {
  name: 'DrawerHeader',
  isHiddenFromOverview: true,
  displayName: 'Drawer Header',
  description:
    '抽屉头部：含标题、可选副标题、关闭按钮、首尾内容插槽；API 与 DialogHeader 相同',
  usage: {
    description:
      'Drawer 内 Layout 的 header 插槽，如 Dialog 中的 DialogHeader；传入 onOpenChange 才有关闭按钮（Drawer 无内建关闭按钮）；打开时不获焦（Drawer 用 data-autofocus）；不为抽屉命名（由 Drawer 的 label 命名）',
    anatomy: [
      {
        name: 'Header row',
        required: true,
        description:
          '排列标题区、可选的首尾内容、关闭控件',
      },
      {
        name: 'Start content',
        required: false,
        description: '包装可选的首部内容',
      },
      {
        name: 'Title block',
        required: true,
        description: '组合标题 + 可选副标题',
      },
      {
        name: 'End content',
        required: false,
        description:
          '组合可选尾部内容 + 可选关闭控件',
      },
      {
        name: 'Close icon',
        required: false,
        description: '关闭按钮内的关闭图标',
      },
    ],
  },
  propDescriptions: {
    title:
      '抽屉标题节点，渲染为 h2；行内、非交互；不为抽屉命名',
    subtitle:
      '标题下方的副标题节点；可为行内内容（如 Link），不要用块级元素',
    onOpenChange:
      '关闭按钮回调，以 false 调用（省略 = 无按钮）；传 Drawer 的 onOpenChange',
    startContent: '标题之前的内容（如返回按钮）',
    endContent: '标题之后、关闭按钮之前的内容',
    endContentEdgeCompensation:
      '尾部内容插槽的补偿轴：inline | block | all；省略 = 关闭操作自动补偿',
    hasDivider: '底部边框线；默认取父级 Layout 的 defaultHasDividers',
  },
};
