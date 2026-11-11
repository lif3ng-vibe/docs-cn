// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Control',
    required: true,
    description: '容纳互斥分段选项的容器。',
  },
  {
    name: 'Segment',
    required: true,
    description: '控件内的单个选项。',
  },
  {
    name: 'Label',
    required: false,
    description: '标签未隐藏时标识分段的可见文本。',
  },
  {
    name: 'Icon',
    required: false,
    description: '分段内显示的可选调用方图标。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'SegmentedControl',
  displayName: 'Segmented Control',
  group: 'SegmentedControl',
  category: 'Action',
  keywords: ['radio', 'tabs', 'toggle', '分段控件', '切换', '按钮组', 'pill', '开关', 'segment', '互斥选择'],
  playground: {
    defaults: {
      value: 'option-1',
    },
  },
  examples: [
    {
      label: '在窄卡片中',
      code: `
import {useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

const SUMMARY = {
  overview: '4 projects, 2 due this week.',
  activity: '18 updates since Monday.',
  members: '12 members, 3 pending invites.',
  billing: 'Next invoice on October 1.',
};

// Inside a VStack the default hug layout keeps its content width; it does not
// stretch to the card. When the card is narrower than the control (a 320px
// phone column), the control caps at the card width and each label truncates
// with an ellipsis instead of running past the card edge. The full label stays
// each segment's accessible name. Keep labels short for phone widths.
function WorkspaceCard() {
  const [view, setView] = useState('overview');
  return (
    <Card maxWidth={480}>
      <VStack gap={3}>
        <Heading level={3}>Team workspace</Heading>
        <SegmentedControl label="Workspace view" value={view} onChange={setView}>
          <SegmentedControlItem value="overview" label="Overview" />
          <SegmentedControlItem value="activity" label="Activity" />
          <SegmentedControlItem value="members" label="Members" />
          <SegmentedControlItem value="billing" label="Billing" />
        </SegmentedControl>
        <Text color="secondary">{SUMMARY[view]}</Text>
      </VStack>
    </Card>
  );
}
`,
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-segmented-control', visualProps: ['size']},
      {className: 'astryx-segmented-control-item', visualProps: ['size'], states: ['selected', 'disabled']},
    ],
    vars: [
      {name: '--_segmented-control-radius', description: '分段控件的圆角', default: 'var(--radius-element)', private: true},
      {name: '--_segmented-control-padding', description: '分段控件的内部内边距', default: 'var(--spacing-0-5)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_segmented-control-radius']},
      {property: 'padding', vars: ['--_segmented-control-padding']},
    ],
  },
  description: '容器包装器，向 SegmentedControlItem 子元素提供上下文（value、onChange、size、isDisabled）。',
  props: [
    {
      name: 'value',
      type: 'string',
      description: '当前选中的值（受控）。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '选中某个分段时触发的回调。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '单选组的无障碍标签（用作 aria-label，绝不视觉渲染）。',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '控件的尺寸变体。',
      default: "'md'",
    },
    {
      name: 'layout',
      type: "'hug' | 'fill'",
      description: '布局模式。hug（默认）让分段按内容取宽，上限为容器宽度（过窄时分段标签省略显示）；fill 让各分段等分拉伸以填满容器。',
      default: "'hug'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '整个控件是否禁用。选中的分段保留 Tab 停留点并播报为禁用（aria-disabled），且无法选中任何项。',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        '解释控件为何被禁用。作用于整组禁用状态（isDisabled），而非单个分段。与 isDisabled 同用时，会在悬停/键盘聚焦时显示工具提示，且原因会描述到每个分段（选择仍被阻止）。请用此 prop 代替把禁用的 SegmentedControl 包进 Tooltip，让原因直接挂在控件本身上。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'SegmentedControlItem 子元素。',
      slotElements: [
        {
          __element: 'SegmentedControlItem',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
  components: [
    {name: 'SegmentedControlItem'},
  ],
  usage: {
    anatomy,
    description:
      '一个让用户从少量互斥选项中做单选的分段按钮组。当所有选项应同时可见、且选中控制的是值或模式而非页面导航时，使用 SegmentedControl。在触控设备（粗主指针）上用手指操作时，无论由轻点、方向键还是新值触发，选中态都会滑动到新分段；在减弱动效（Reduce Motion）下没有任何位移：旧选中淡出、新选中淡入。此时拖动选中分段会带着选中态一起移动，选中标签的颜色随之跟随；松开手指时选中手指下的分段（在控件外松开则不选中任何项）；轻点通过浏览器的 click 选中；按住的分段显示共享的按压叠加层，不会有任何抬升或变暗。使用鼠标或触控笔时，包括点击在内的每次变化都按主题时长与缓动滑动，拖动选中分段的表现与手指一致。',
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Selected'],
        description:
          '每个标签与其分段背景的对比度至少 4.5:1。按屏幕上的实际呈现检查未选中、Hover、Pointer down 与选中颜色。对于 Hover 与 Pointer down，应在叠加层应用后测量最终背景。轨道是半透明的，因此标签对比度取决于控件背后的背景。请在控件所处的每种背景上检查标签，包括自定义页面颜色。',
      },
      {
        name: 'Essential icon',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Icon only'],
        description:
          '分段没有可见标签时，其图标与分段背景的对比度至少 3:1。可见标签旁的图标无需单独检查。',
      },
      {
        name: 'Selected state indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if relied upon',
        states: ['Selected'],
        description:
          '只有当用户需要靠选中背景区分选中与未选中时，选中背景才须达到 3:1。标签颜色与字重也会显示选中态。',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if needed',
        states: ['Rest'],
        description:
          '当用户需要靠控件边缘或分段边框看清选项时，其对比度至少 3:1。',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Focus visible'],
        description:
          '焦点环与分段周围区域的对比度至少 3:1。请在轨道和选中背景上检查。',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: 'Not required',
        states: ['Disabled'],
        description:
          '禁用控件无需满足这些对比度要求。',
      },
    ],
    bestPractices: [
      {guidance: true, description: '用于在 2–5 个互斥视图或模式之间切换，且所有选项应同时可见。'},
      {guidance: true, description: '为控件提供描述性标签，确保屏幕阅读器可访问该组。'},
      {guidance: false, description: '不要用于页面级导航；请改用 TabList。TabList 是导航组件，而 SegmentedControl 是始终恰好有一个选中项的输入控件。'},
      {guidance: false, description: '不要用于简单的开/关状态；请改用 ToggleButton。ToggleButton 可独立开关，而 SegmentedControl 强制从一组中单选。'},
      {guidance: false, description: '不要把禁用的 SegmentedControl 包进 Tooltip 来解释禁用原因；那样原因既不挂在控件上也不挂在分段上。请改用 disabledMessage prop。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    anatomy,
    description:
      'A segmented button group that allows users to make a single selection from a small set of mutually exclusive options. Use SegmentedControl when all options should be visible at once and the selection controls a value or mode, not page navigation. Under a finger, on a touch device (a coarse primary pointer), the selection slides to the new segment, whether a tap, an arrow key or a new value moved it; with Reduce Motion nothing travels: the old selection fades out as the new one fades in. There, dragging the selected segment carries the selection along with the selected label’s colour following it, and the segment under the finger is chosen when it lets go (letting go outside the control selects nothing); a tap selects through the browser’s click; a pressed segment shows the shared pressed overlay, and nothing lifts or dims. With a mouse or a pen every change, a click included, slides on the theme’s duration and easing, and dragging the selected segment carries it as a finger does.',
    bestPractices: [
      {guidance: true, description: 'Use for switching between 2–5 mutually exclusive views or modes where all options should be visible.'},
      {guidance: true, description: 'Provide a descriptive label for the control to ensure the group is accessible to screen readers.'},
      {guidance: false, description: 'Use for page-level navigation; use TabList instead. TabList is a navigation component, while SegmentedControl is an input that always has exactly one selected option.'},
      {guidance: false, description: 'Use for simple on/off states; use ToggleButton instead. ToggleButton can be toggled on or off independently, while SegmentedControl enforces a single selection from a group.'},
      {guidance: false, description: 'Wrap a disabled SegmentedControl in Tooltip to explain why it is disabled; the reason is then not attached to the control or its segments. Use the disabledMessage prop instead.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    anatomy,
    description:
      '一个让用户从少量互斥选项中做单选的分段按钮组。当所有选项应同时可见、且选中控制的是值或模式而非页面导航时，使用 SegmentedControl。触控设备（粗主指针）上用手指操作时，无论由轻点、方向键还是新值触发，选中态都会滑动到新分段；减弱动效（Reduce Motion）下没有任何位移：旧选中淡出、新选中淡入。此时拖动选中分段会带着选中态一起移动，选中标签的颜色随之跟随；松开手指时选中手指下的分段（在控件外松开则不选中任何项）；轻点通过浏览器的 click 选中；按住的分段显示共享的按压叠加层，不会有任何抬升或变暗。鼠标或触控笔下，包括点击在内的每次变化都按主题时长与缓动滑动，拖动选中分段的表现与手指一致。',
    bestPractices: [
      {guidance: true, description: '用于在 2–5 个互斥视图或模式之间切换，且所有选项应同时可见。'},
      {guidance: true, description: '为控件提供描述性标签，确保屏幕阅读器可访问该组。'},
      {guidance: false, description: '不要用于页面级导航；请改用 TabList。TabList 是导航组件，而 SegmentedControl 是始终恰好有一个选中项的输入控件。'},
      {guidance: false, description: '不要用于简单的开/关状态；请改用 ToggleButton。ToggleButton 可独立开关，而 SegmentedControl 强制从一组中单选。'},
      {guidance: false, description: '不要把禁用的 SegmentedControl 包进 Tooltip 来解释禁用原因；那样原因既不挂在控件上也不挂在分段上。请改用 disabledMessage prop。'},
    ],
  },
  propDescriptions: {
    value: '当前选中值（受控）',
    onChange: '选中分段时的回调',
    label: '单选组的 aria-label（绝不渲染）',
    size: '尺寸变体',
    layout: 'hug（默认）按内容取宽、以容器为上限；fill 等分拉伸',
    isDisabled: '禁用整个控件',
    children: 'SegmentedControlItem 子元素',
    xstyle: '容器的附加 StyleX 样式',
  },
};
