// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Handle',
    required: true,
    description: '拥有指针与键盘调整大小交互的可聚焦分隔条。',
  },
  {
    name: 'Grip pill',
    required: false,
    description:
      '默认可见的握把指示器；无论它位于何处，拖动它即可调整大小。可用自定义 handle 内容替换。',
  },
  {
    name: 'Grab zone',
    required: true,
    description:
      '以分隔线为中心的不可见放大指针区域。内联区域最多占据比它短的窗格的一半；覆盖式 handle 最多占据其窗格的一半。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Resizable',
  displayName: 'Resizable',
  group: 'Resizable',
  category: 'Layout',
  keywords: [
    'resize',
    'resizable',
    'split',
    'panel',
    '调整大小',
    '可调整大小',
    '分割',
    '拖拽',
    '分隔条',
    '分割线',
    'handle',
    'grip',
  ],
  usage: {
    anatomy,
    description:
      '基于 Hook 的可调面板系统。useResizable() 管理尺寸状态，' +
      'ResizeHandle 提供可交互的胶囊握把分隔条。' +
      '通过现有布局组件的 resizable prop 传入 Hook 的输出。',
    bestPractices: [
      {
        guidance: true,
        description:
          '当百分比需要恰好一个像素的下限或上限时，使用 percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)})。复用 Table 的 pixel() 辅助函数；数字、精确 Npx 与 pixel(value) 仍按像素处理。状态、持久化、回调、绘制与 ARIA 均保持为解析后的像素值。',
      },
      {
        guidance: true,
        description:
          '将 useResizable() 与现有 Astryx 布局组件配合使用。' +
          '把它的输出传给 LayoutPanel、ResizeHandle 或 SideNav 的 resizable prop；任何其他元素也可使用其尺寸。',
      },
      {
        guidance: true,
        description:
          '存在多个 handle 时，' +
          '为每个 ResizeHandle 提供无障碍标签（如 "Resize sidebar"、"Resize terminal"）。',
      },
      {
        guidance: false,
        description:
          '不要为调整大小而把面板包进额外的容器组件。' +
          'Hook 优先的架构可避免额外 DOM；请直接用在现有组件上。',
      },
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-resize-handle', visualProps: ['direction']},
      {className: 'astryx-resize-handle-pill'},
    ],
  },
  components: [
    {
      name: 'useResizable',
      displayName: 'useResizable',
      description:
        '为一个或多个面板区域管理调整大小状态的 Hook。' +
        '返回 size、isCollapsed、collapse/expand/resize 方法以及传给 handle 的 props。',
      examples: [
        {
          label: '结构化固定像素',
          code: `const resizable = useResizable({
  defaultSize: pixel(333),
  containerRef,
});`,
        },
        {
          label: '一次性结构化默认值',
          code: `import {useRef} from 'react';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {percent, pixel} from '@astryxdesign/core/Resizable/utils';

const containerRef = useRef<HTMLDivElement>(null);

const resizable = useResizable({
  defaultSize: percent(40, {min: pixel(333)}),
  containerRef,
});

<ResizeHandle direction="horizontal" resizable={resizable} />;`,
        },
        {
          label: '任意元素，由 Hook 决定尺寸',
          code: `'use client';

import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core/Card';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {Stack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';

const styles = stylex.create({
  // The hook's size as a dynamic style; the card keeps it in the row.
  preview: (width: number) => ({width, flexShrink: 0}),
});

export default function InvoicePreviewSplit() {
  const resizable = useResizable({defaultSize: 320, minSize: 240, maxSize: 480});
  return (
    <Stack direction="horizontal">
      <Card xstyle={styles.preview(resizable.size)}>
        <Text>Invoice INV-2041, $1,280.00, due Nov 18</Text>
      </Card>
      <ResizeHandle resizable={resizable} label="Resize invoice preview" />
      <Text>Line items, payments and notes for the selected invoice.</Text>
    </Stack>
  );
}`,
        },
        {
          label: '实时百分比下限',
          code: `const resizable = useResizable({
  defaultSize: 0,
  minSize: percent(40, {min: pixel(333)}),
  containerRef,
});`,
        },
        {
          label: '实时百分比上限',
          code: `const resizable = useResizable({
  defaultSize: 500,
  maxSize: percent(10, {max: pixel(400)}),
  containerRef,
});`,
        },
      ],
      props: [
        {
          name: 'defaultSize',
          type: 'SizeValue | ResizableSize',
          description:
            '初始尺寸。数字、精确 Npx 与 pixel(value) 按像素处理；精确 N% 无附加像素边界；percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 恰好添加一个边界且只解析一次。',
          default: '250',
        },
        {
          name: 'minSize',
          type: 'ResizableSize',
          description:
            '实时最小值。数字、精确 Npx 与 pixel(value) 仍按像素处理；精确 N% 无附加像素边界；percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 恰好添加一个边界。',
          default: '50',
        },
        {
          name: 'maxSize',
          type: 'ResizableSize',
          description:
            '实时最大值。数字、精确 Npx 与 pixel(value) 仍按像素处理；精确 N% 无附加像素边界；percent(value, {min: pixel(value)}) 或 percent(value, {max: pixel(value)}) 恰好添加一个边界。',
          default: 'Infinity',
        },
        {
          name: 'collapsible',
          type: 'boolean',
          description: '区域是否可折叠到尺寸 0。',
          default: 'false',
        },
        {
          name: 'collapsedSize',
          type: 'number',
          description:
            '像素阈值：拖拽抬离或按键步进低于该值时折叠区域。',
          default: '40',
        },
        {
          name: 'snaps',
          type: 'number[]',
          description: '调整大小时吸附到的像素值。',
        },
        {
          name: 'shrinkOrder',
          type: 'number',
          description: '级联优先级：数字越小越先收缩。',
        },
        {
          name: 'autoSaveId',
          type: 'string',
          description: '将尺寸与折叠状态持久化到 localStorage 的键。',
        },
      ],
    },
    {
      name: 'ResizeHandle',
      displayName: 'Resize Handle',
      description:
        '面板间的可拖拽分隔条。胶囊握把设计：静止时不可见，' +
        '悬停时半透明（0.6 不透明度），拖拽时完全不透明（1.0）。支持键盘操作。',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description: '布局方向：决定光标与指示器的朝向。',
          default: "'horizontal'",
        },
        {
          name: 'isReversed',
          type: 'boolean',
          description:
            '反转拖拽方向。当 handle 控制末尾/右侧/底侧面板时使用。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'handle 是否可交互。',
          default: 'false',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description:
            '是否穿过 handle 显示通长 1px 分隔线。相邻面板背景相同时使用。',
          default: 'false',
        },
        {
          name: 'isAlwaysVisible',
          type: 'boolean',
          description:
            '静止时也显示胶囊握把，而非仅悬停时显示。可发现性重要时使用。',
          default: 'true',
        },
        {
          name: 'pillPlacement',
          type: "'start' | 'end' | 'center' | 'auto'",
          description:
            '胶囊握把位于分隔线的哪一侧。' +
            'auto = 内容侧（由 isReversed 推导），折叠时翻转。' +
            'start = 左/上，end = 右/下，center = 居中于分隔线。' +
            '它只移动握把，拖拽仍可将其带到任意位置；抓取区始终以分隔线为中心。',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description: '分隔条的无障碍标签。',
          default: "'Resize handle'",
        },
        {
          name: 'resizable',
          type: 'ResizableRegion | ResizableProps',
          description:
            "useResizable 的输出或其 props：将 handle 连接到面板。携带区域的轴向（'horizontal' | 'vertical'），必须与此 handle 的 direction 匹配。",
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '自定义 handle 内容。覆盖默认的握把 + 分隔线。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非 style={{}} 之类的内联样式对象。',
        },
      ],
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '基于 Hook 的可调面板系统。useResizable() 管理尺寸状态；ResizeHandle 提供可交互的胶囊握把分隔条。',
  usage: {
    anatomy,
    description:
      '基于 Hook 的可调面板系统。useResizable() 管理尺寸状态；ResizeHandle 提供可交互的胶囊握把分隔条。通过现有布局组件的 resizable prop 传入 Hook 输出。',
    bestPractices: [
      {
        guidance: true,
        description:
          '将 useResizable() 与现有 Astryx 布局组件配合使用。把它的输出传给 LayoutPanel、ResizeHandle 或 SideNav 的 resizable prop。',
      },
      {
        guidance: true,
        description:
          '存在多个 handle 时为每个 ResizeHandle 提供无障碍标签（如 "Resize sidebar"、"Resize terminal"）。',
      },
      {
        guidance: false,
        description:
          '不要为调整大小把面板包进额外容器组件。Hook 优先的架构可避免额外 DOM；请直接用在现有组件上。',
      },
    ],
  },
  components: [
    {
      name: 'useResizable',
      description:
        '为一个或多个面板区域管理调整大小状态的 Hook。返回 size、isCollapsed、collapse/expand/resize 方法以及传给 handle 的 props。',
      propDescriptions: {
        defaultSize:
          '初始像素值、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})；只解析一次',
        minSize:
          '实时最小值：像素、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})',
        maxSize:
          '实时最大值：像素、精确 N% 或 percent(value, {min: pixel(value)}) / percent(value, {max: pixel(value)})',
        collapsible: '区域是否可折叠到尺寸 0',
        collapsedSize: '拖拽抬离或按键步进触发折叠的像素阈值',
        snaps: '调整大小时吸附的像素值',
        shrinkOrder: '级联优先级：数字越小越先收缩',
        autoSaveId: '将尺寸与折叠状态持久化到 localStorage 的键',
      },
    },
    {
      name: 'ResizeHandle',
      description:
        '面板间的可拖拽分隔条。胶囊握把：静止时不可见，悬停时半透明（0.6 不透明度），拖拽时完全不透明（1.0）。支持键盘操作。',
      propDescriptions: {
        direction: '布局方向：决定光标与指示器朝向',
        isReversed:
          '反转拖拽方向。handle 控制末尾/右侧/底侧面板时使用',
        isDisabled: 'handle 是否可交互',
        hasDivider:
          '穿过 handle 显示通长 1px 分隔线。相邻面板背景相同时使用',
        isAlwaysVisible:
          '静止时也显示胶囊握把，而非仅悬停时。可发现性重要时使用',
        pillPlacement:
          '握把位于分隔线哪一侧。auto = 内容侧（由 isReversed 推导），折叠时翻转；start = 左/上，end = 右/下，center = 居中于分隔线。只移动握把（仍可拖拽）；抓取区保持在分隔线上',
        label: '分隔条的无障碍标签',
        resizable: 'useResizable 输出或其 props：将 handle 连接到面板',
      },
    },
  ],
};
