// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DialogHeader',
  subComponentOf: 'Dialog',
  displayName: 'Dialog Header',
  isHiddenFromOverview: true,
  description: '对话框头部，含标题、可选副标题、关闭按钮以及首尾内容插槽。',
  usage: {
    description: '使用 DialogHeader 为对话框提供带标签的标题区和可选的关闭控件。',
    anatomy: [
      {name: 'Header row', required: true, description: '排列标题区、可选的首尾内容与关闭控件。'},
      {name: 'Start content', required: false, description: '包装可选的首部内容。'},
      {name: 'Title block', required: true, description: '组合标题和可选副标题。'},
      {name: 'End content', required: false, description: '组合可选尾部内容与可选关闭控件。'},
      {name: 'Close icon', required: false, description: '关闭按钮内的关闭图标。'},
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: '对话框标题，渲染在可聚焦的 h2 中（打开时获得焦点；除非 Dialog 已显式设置 aria-label/aria-labelledby，其文本内容经 aria-labelledby 为对话框命名）。请使用非空、非交互的行内内容。',
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description: '标题下方的副标题。可包含链接等行内内容；避免使用块级元素。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '关闭按钮的回调（省略时不显示按钮）。',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: '标题之前的内容（例如返回按钮）。',
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
      description: '标题之后、关闭按钮之前的内容。',
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
      name: 'endContentEdgeCompensation',
      type: "'inline' | 'block' | 'all'",
      description: '选择尾部内容插槽的补偿轴；省略时保留关闭操作的自动补偿。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description: '在底部边缘添加边框线。',
      default: 'true',
    },
  ],
  playground: {
    defaults: {
      title: '删除文件？',
      subtitle: '此操作无法撤销。',
      hasDivider: true,
    },
  },
  theming: {
    targets: [
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-start-content'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-end-content'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
  },
  examples: [
    {
      label: '基础用法',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';

<DialogHeader title="Delete file?" subtitle="This action cannot be undone." />;
`,
    },
    {
      label: '带关闭按钮',
      code: `
import {useState} from 'react';
import {DialogHeader} from '@astryxdesign/core/Dialog';

function Header() {
  const [, setIsOpen] = useState(true);

  // Passing onOpenChange renders a close button that calls it with false.
  return <DialogHeader title="Settings" onOpenChange={setIsOpen} />;
}
`,
    },
    {
      label: '副标题含链接',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Link} from '@astryxdesign/core/Link';

<DialogHeader
  title="Share conversation"
  subtitle={
    <>
      Anyone with the link can view it. Review the{' '}
      <Link href="#sharing-policy">sharing policy</Link> first.
    </>
  }
/>;
`,
    },
    {
      label: '带首尾内容',
      code: `
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';

<DialogHeader
  title="Notifications"
  startContent={<Icon icon="chevronLeft" size="sm" />}
  endContent={<Badge label="3" />}
/>;
`,
    },
  ],
};

export const docsZh = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: '对话框头部，包含标题、可选副标题、关闭按钮以及首尾内容插槽。',
  usage: {
    description: '使用 DialogHeader 为对话框提供带标签的标题区和可选的关闭控件。',
    anatomy: [
      {name: 'Header row', required: true, description: '排列标题区、可选的首尾内容和关闭控件。'},
      {name: 'Start content', required: false, description: '包装可选的首部内容。'},
      {name: 'Title block', required: true, description: '组合标题和可选副标题。'},
      {name: 'End content', required: false, description: '组合可选尾部内容和可选关闭控件。'},
      {name: 'Close icon', required: false, description: '关闭按钮内的关闭图标。'},
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: '对话框标题，渲染在可聚焦的 h2 中（打开时获得焦点，其文本内容通过 aria-labelledby 为对话框命名）。请使用非空、非交互的行内内容。',
    },
    {
      name: 'subtitle',
      type: 'ReactNode',
      description: '标题下方的副标题，可包含链接等行内内容；避免使用块级元素。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description: '关闭按钮的回调（省略时不显示按钮）。',
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
      description: '在底部边缘添加分隔线。',
      default: 'true',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-dialog-header'},
      {className: 'astryx-dialog-header-start-content'},
      {className: 'astryx-dialog-header-title-block'},
      {className: 'astryx-dialog-header-end-content'},
      {className: 'astryx-dialog-header-close-icon'},
    ],
  },
};

export const docsDense = {
  name: 'DialogHeader',
  isHiddenFromOverview: true,
  displayName: 'Dialog Header',
  description: '对话框头部：标题、可选副标题、关闭按钮、首尾内容插槽',
  usage: {
    description: '带标签的对话框标题区 + 可选关闭控件',
    anatomy: [
      {name: 'Header row', required: true, description: '排列标题区、可选首尾内容与关闭控件'},
      {name: 'Start content', required: false, description: '包装可选首部内容'},
      {name: 'Title block', required: true, description: '组合标题 + 可选副标题'},
      {name: 'End content', required: false, description: '组合可选尾部内容 + 可选关闭控件'},
      {name: 'Close icon', required: false, description: '关闭按钮内的关闭图标'},
    ],
  },
  propDescriptions: {
    title: '可聚焦 h2 内的对话框标题（打开时聚焦；文本内容经 aria-labelledby 为对话框命名）；行内、非交互、非空',
    subtitle: '标题下方副标题；可含行内内容（如 Link），不用块级元素',
    onOpenChange: '关闭按钮回调（省略=无按钮）',
    startContent: '标题之前的内容（如返回按钮）',
    endContent: '标题之后、关闭按钮之前的内容',
    endContentEdgeCompensation:
      '尾部内容插槽补偿轴：inline | block | all；省略=关闭操作自动补偿',
    hasDivider: '底部边框线',
  },
};
