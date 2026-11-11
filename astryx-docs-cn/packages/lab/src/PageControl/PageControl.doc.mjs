// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'PageControl',
  displayName: 'Page Control',
  category: 'Navigation',
  keywords: [
    'page control',
    '页面指示器',
    'page indicator',
    'pager dots',
    '圆点',
    'dots',
    'carousel dots',
    '轮播圆点',
    'onboarding',
    '引导',
    'paging',
    '翻页',
    'PageControl',
  ],
  description:
    '翻页视图下方的一排页面指示器，如同 iOS：每页一个圆点，当前页高亮。在当前圆点任一侧轻点或单击可朝该方向移动一页，用手指滑过或用鼠标拖过圆点则直接连续跳到指针下的页面。在手指下（任何触摸设备，iOS 与 Android 一致），超过十页时该排圆点是一个窗口，边缘圆点缩小以示还有更多，按住手指会在圆点后方显示托盘；鼠标则将长排裁剪到控件范围内。实验性：先在 lab 落地。',
  props: [
    {
      name: 'totalPages',
      type: 'number',
      description: '页数。',
      required: true,
    },
    {
      name: 'page',
      type: 'number',
      description: '当前页码（从 1 开始）。页 1 是第一页。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(page: number) => void',
      description:
        '以请求的页码（从 1 开始）调用，请求可来自轻点、单击、连续滑动、方向键、Home、End 或辅助技术；连续滑动时指针下页面每变化一次就调用一次，因此快速掠过可能跳过某页。请同步更新翻页视图和 page。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '为辅助技术命名控件。默认为本地化的 "Page indicators"。',
    },
    {
      name: 'hidesForSinglePage',
      type: 'boolean',
      description: '只有一页时不渲染任何内容。',
      default: 'false',
    },
  ],
  usage: {
    description:
      '把 PageControl 放在翻页视图（如带 `hasSnap` 的 Carousel 或引导屏）下方，显示共有多少页以及当前显示哪一页。让它的 page 与视图双向保持同步。',
    bestPractices: [
      {
        guidance: true,
        description:
          '与支持滑动翻页的视图搭配：控件是次要的移动方式，也是查看当前位置的主要方式。',
      },
      {
        guidance: true,
        description:
          '页数保持在一眼可数的范围；超过十页，该排保持固定宽度，显示其中一窗，并随页面变化滚动。',
      },
      {
        guidance: false,
        description:
          '不要用于长结果列表（用 Pagination）或在视图间选择（用 SegmentedControl 或 TabList）。',
      },
    ],
  },
};
