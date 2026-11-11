// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'AvatarStatusDot',
  subComponentOf: 'Avatar',
  displayName: 'Avatar Status Dot',
  isHiddenFromOverview: true,
  description:
    '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。每个变体将颜色与独特形状（实心、圆环、横杠）配对，确保状态不仅靠颜色传达（WCAG 1.4.1）。',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description:
        '语义变体，颜色与形状配对：success = 绿色实心点，neutral = 灰色圆环，error = 带横杠的红色点。',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '描述状态的无障碍标签。在 Avatar 内会被合成进头像自身的无障碍名称（如 "Jane Doe, Online"）——Avatar 根元素为 role="img"，会裁剪子元素语义，因此合成名称是辅助技术获知状态的途径。独立使用时状态点直接以 role="img" 暴露该标签。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '居中显示在状态点内的图标（tiny 尺寸时隐藏）。渲染的图标会替换内置形状标记，请为每个状态使用不同的图标。',
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
  ],
};

export const docsZh = {
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description:
    '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。每个变体将颜色与独特形状（实心、圆环、横杠）配对，确保状态不仅靠颜色传达（WCAG 1.4.1）。',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description:
        '语义变体，颜色与形状配对：success = 绿色实心点，neutral = 灰色圆环，error = 带横杠的红色点。',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '描述状态的无障碍标签。在 Avatar 内会被合成进头像自身的无障碍名称（如 "Jane Doe, Online"）——Avatar 根元素为 role="img"，会裁剪子元素语义，因此合成名称是辅助技术获知状态的途径。独立使用时状态点直接以 role="img" 暴露该标签。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '居中显示在状态点内的图标（tiny 尺寸时隐藏）。渲染的图标会替换内置形状标记，请为每个状态使用不同的图标。',
    },
  ],
};

export const docsDense = {
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description:
    '尺寸感知状态点，从上下文读取头像尺寸并等比缩放；变体按 WCAG 1.4.1 将颜色与形状（实心/圆环/横杠）配对',
  propDescriptions: {
    variant:
      '颜色 + 形状变体：success 实心，neutral 圆环，error 横杠',
    label:
      '无障碍状态标签；合成进 Avatar 无障碍名称（"Jane Doe, Online"）；独立使用时直接以 role="img" 暴露',
    icon: '居中显示在点内的图标（tiny 尺寸隐藏）；替换内置形状标记，不同状态应使用不同图标',
  },
};
