// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Button',
  displayName: 'Button',
  group: 'Button',
  category: 'Action',

  keywords: ["button","按钮","cta","提交","操作","加载","主要","次要","幽灵","破坏性","危险"],

  usage: {
    description:
      '点击按钮触发操作。用于表单提交、确认、导航，或任何需要明确行动号召的交互。',
    bestPractices: [
      {guidance: true, description: 'primary 只留给视图中最重要的一处操作；其余按强调程度用 secondary 或 ghost。'},
      {guidance: true, description: '标签描述动作（"保存更改"、"删除账号"、"发送邀请"），不要用 "确定" 或 "点这里" 这类含糊标签。'},
      {guidance: true, description: '耗时操作（如保存或提交）要显示加载状态，让用户知道正在处理。'},
      {guidance: true, description: '纯图标按钮务必提供 label，屏幕阅读器才能播报按钮功能；同时为视觉用户加 tooltip。'},
      {guidance: true, description: '专门的纯图标按钮请用 \'@astryxdesign/core/IconButton\' 的 IconButton；它是独立组件，不从 \'@astryxdesign/core/Button\' 导出。'},
      {guidance: false, description: '不要在同一视图放多个 primary 按钮；会削弱视觉层级。'},
      {guidance: false, description: '删除数据等不可逆操作不要不加确认就用 destructive 变体。'},
      {guidance: false, description: '不要用按钮做导航。只是跳转到另一页面时用链接；按钮用于保存、删除、提交等动作。'},
      {guidance: false, description: '不要重定义 Button 的 `::before`（经 `xstyle` 或 `className` 规则）并指望它在触摸按压期间保持：在粗指针主输入下，按压进行或淡出时 Button 会把按压效果绘制在该伪元素上（`z-index: -1`，opacity 带动画），此刻你的样式会混入按压层。静止时 Button 不在该处添加任何东西。请改为样式化子元素。'},
    ],
    accessibility: [
      {
        name: 'Text label',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['静止', '悬停', '按下'],
        description:
          '每种状态下按钮文本与按钮背景的对比度至少 4.5:1。悬停与按下时，测量叠加层应用后的最终背景。',
      },
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['仅图标', '加载中'],
        description:
          '代替文本的图标与按钮背景对比度至少 3:1；旋转的加载弧线同样须达 3:1。可见标签旁的图标无需单独检查。',
      },
      {
        name: 'Badge text',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['静止', '悬停', '按下'],
        description:
          '按钮内徽章文本与 Badge 背景的对比度至少 4.5:1。在页面与表面背景上检查静止、悬停、按下三种状态下的全部 14 种内置 Badge 颜色——每种模式覆盖 336 个组合。自定义 endContent 需单独检查。',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '需要时 3:1',
        states: ['静止'],
        description:
          '只有当用户需要靠边缘辨认控件时，按钮边界才需要 3:1 对比度。纯文本按钮可以依靠其标签。',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['聚焦可见'],
        description:
          '焦点轮廓与按钮周围区域的对比度至少 3:1。每种样式都要检查。destructive 按钮使用红色轮廓。',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: '不要求',
        states: ['禁用'],
        description:
          '禁用控件无需满足这些对比度要求。',
      },
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '强化标签含义的前置图标，如删除按钮上的垃圾桶图标。'},
      {name: 'Label', required: true, description: '描述动作的可见文本，也用作无障碍名称。'},
      {name: 'End content', required: false, description: '标签之后的尾部徽章或图标，如通知计数或下拉箭头。'},
      {name: 'Spinner', required: false, description: '加载期间替换图标，表明操作正在进行。'},
    ],
  },

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '无障碍标签；默认渲染为可见文本，isIconOnly 为 true 时用作 aria-label。',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: '视觉样式变体。',
      default: "'secondary'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: '尺寸变体。',
      default: "'md'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        '浮动按钮（如 FAB）的静止阴影深度。`none` 为默认扁平按钮；`low`/`med`/`high` 对应阴影令牌刻度。在 ButtonGroup 内忽略，层级由分组统一管理。',
      default: "'none'",
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML 按钮类型属性。',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: '表单提交的 HTML name 属性。',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: '表单提交的 HTML value 属性。',
    },
    {
      name: 'form',
      type: 'string',
      description: '通过 ID 将按钮与表单元素关联。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '显示加载指示器并阻止重复激活，同时保持可聚焦（aria-busy + aria-disabled，而非原生 disabled，操作中途不会丢失键盘焦点）。通过实时区域播报 "Loading"。',
      default: 'false',
    },
    {
      name: 'isInterruptible',
      type: 'boolean',
      description: 'clickAction 进行中时按钮仍可点击：spinner 与 aria-busy 照常显示，但按钮未被禁用、操作也不去重，再次点击会生效并以新操作中断进行中的操作。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用按钮。使用 aria-disabled 代替原生 disabled，按钮保持可聚焦。',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '渲染在标签文本之前的图标元素。未显式指定尺寸的 Astryx Icon 在 sm/md 按钮中默认为 sm，在 lg 按钮中默认为 md。',
      slotElements: [{__element: 'Icon', props: {icon: 'check'}}],
    },
    {
      name: 'isIconOnly',
      type: 'boolean',
      description:
        '为 true 时渲染为正方形纯图标按钮，label 用作 aria-label。必须提供 icon。提示：专门的纯图标按钮组件请改用 \'@astryxdesign/core/IconButton\' 的 IconButton。',
      default: 'false',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        "按钮宽度。数字按像素处理，字符串按原样使用（如 '100%' 表示全宽按钮）。默认按内容自适应宽度，不会超出容器；行宽不足时标签以省略号截断；纯图标按钮保持正方形。",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '可选的可见文本覆盖。提供时显示它而非 label，但 label 仍然必填（它提供无障碍名称）。多数情况只用 label 即可：<Button label="Save" />。',
    },
    {
      name: 'endContent',
      type: 'ReactElement<IconProps> | ReactElement<BadgeProps>',
      description:
        '渲染在标签之后的尾部图标或徽章。isIconOnly 为 true 时忽略。颜色继承自按钮变体。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'tooltip',
      type: 'string',
      description: '悬停时显示的提示文本。',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        '标准点击处理函数（从 ButtonHTMLAttributes 透传）。',
    },
    {
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description:
        '异步点击处理函数。返回的 Promise 处于 pending 时显示加载状态。',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '提供时按钮渲染为链接元素（<a> 或自定义链接组件）。目标地址遵循 Link `href` prop 所述的共享导航规则。',
    },
    {
      name: 'as',
      type: 'ComponentType',
      description:
        '提供 href 时使用的自定义链接组件（如 Next.js Link）。',
    },
    {
      name: 'target',
      type: 'string',
      description: '渲染为链接时的 HTML target 属性（如 "_blank"）。',
    },
    {
      name: 'rel',
      type: 'string',
      description: '渲染为链接时的 HTML rel 属性（如 "noopener noreferrer"）。',
    },
  ],
  examples: [
    {
      label: '窄行中的操作',
      code: `
import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {StackItem} from '@astryxdesign/core/Stack';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';

// On a phone (or any card narrower than its actions), a labelled Button
// shrinks with its row and truncates its label with an ellipsis instead of
// overflowing or being clipped by the card. The full label stays the
// accessible name. Icon-only buttons keep their square size.
function ReviewersCard() {
  const [emails, setEmails] = useState('');
  return (
    <Card maxWidth={560}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3} maxLines={1}>
              Design review
            </Heading>
          </StackItem>
          <Button label="Request review from the design team" size="sm" />
          <IconButton
            label="More review options"
            icon={<Icon icon="moreHorizontal" />}
            variant="ghost"
            size="sm"
          />
        </HStack>
        <TextInput
          label="Reviewer emails"
          placeholder="name@example.com"
          value={emails}
          onChange={setEmails}
        />
        {/* In a 320px form footer the long primary action truncates.
            StackItem size="static" keeps the short Cancel label whole. */}
        <HStack gap={2} hAlign="end">
          <StackItem size="static">
            <Button label="Cancel" variant="secondary" />
          </StackItem>
          <Button label="Send invitations to all 12 reviewers" variant="primary" />
        </HStack>
      </VStack>
    </Card>
  );
}
`,
    },
  ],
  playground: {
    defaults: {
      label: '点击我',
      variant: 'primary',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-button', visualProps: ['size', 'variant', 'elevation']},
    ],
    vars: [
      {name: '--_button-radius', description: '圆角半径', default: 'var(--radius-element)', private: true},
      {name: '--button-focus-offset', description: '焦点环轮廓偏移', default: 'var(--focus-outline-offset)'},
      {name: '--button-icon-only-aspect', description: '纯图标按钮的宽高比', default: '1 / 1'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_button-radius']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Button',
  displayName: 'Button',
  usage: {
    description:
      '点击按钮触发操作。用于表单提交、确认、导航，或任何需要明确行动号召的交互。',
    bestPractices: [
      {guidance: true, description: 'primary 只留给视图中最重要的一处操作；其余按强调程度用 secondary 或 ghost。'},
      {guidance: true, description: '标签描述动作（"保存更改"、"删除账号"、"发送邀请"），不要用 "确定" 或 "点这里" 这类含糊标签。'},
      {guidance: true, description: '耗时操作（如保存或提交）要显示加载状态，让用户知道正在处理。'},
      {guidance: true, description: '纯图标按钮务必提供 label，屏幕阅读器才能播报按钮功能；同时为视觉用户加 tooltip。'},
      {guidance: false, description: '不要在同一视图放多个 primary 按钮；会削弱视觉层级。'},
      {guidance: false, description: '删除数据等不可逆操作不要不加确认就用 destructive 变体。'},
      {guidance: false, description: '不要用按钮做导航。只是跳转到另一页面时用链接；按钮用于保存、删除、提交等动作。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '强化标签含义的前置图标，如删除按钮上的垃圾桶图标。'},
      {name: 'Label', required: true, description: '描述动作的可见文本，也用作无障碍名称。'},
      {name: 'End content', required: false, description: '标签之后的尾部徽章或图标，如通知计数或下拉箭头。'},
      {name: 'Spinner', required: false, description: '加载期间替换图标，表明操作正在进行。'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: '无障碍标签；纯图标按钮时用作 aria-label。', required: true},
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: '视觉样式变体。',
      default: "'secondary'",
    },
    {name: 'size', type: "'sm' | 'md' | 'lg'", description: '尺寸变体。', default: "'md'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '浮动按钮（如 FAB）的静止阴影深度。`none` 为默认扁平按钮；在 ButtonGroup 内忽略。', default: "'none'"},
    {name: 'type', type: "'button' | 'submit' | 'reset'", description: 'HTML 按钮类型属性。', default: "'button'"},
    {name: 'name', type: 'string', description: '表单提交的 HTML name 属性。'},
    {name: 'value', type: 'string | number | readonly string[]', description: '表单提交的 HTML value 属性。'},
    {name: 'form', type: 'string', description: '通过 ID 将按钮与表单元素关联。'},
    {name: 'isLoading', type: 'boolean', description: '显示加载旋转器并禁用交互。通过实时区域播报"Loading"。', default: 'false'},
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '禁用按钮。使用 aria-disabled 代替原生 disabled 以保持可聚焦。',
      default: 'false',
    },
    {name: 'icon', type: 'ReactNode', description: '图标元素。未显式指定尺寸的 Astryx Icon 在 sm/md 按钮中默认为 sm，在 lg 按钮中默认为 md。仅提供 icon 而不提供 children 时，按钮渲染为正方形的纯图标按钮。'},
    {name: 'width', type: 'SizeValue', description: "按钮宽度。数字按像素处理，字符串按原样使用（如 '100%' 表示全宽按钮）。默认按内容自适应宽度，不会超出容器；行宽不足时标签以省略号截断；纯图标按钮保持正方形。"},
    {name: 'children', type: 'ReactNode', description: '可选的可见内容覆盖；label 仍然是必需的（用于无障碍名称）。大多数情况使用 <Button label="Save" />。'},
    {
      name: 'endContent',
      type: 'ReactElement<IconProps> | ReactElement<BadgeProps>',
      description:
        '标签后方渲染的尾部图标或徽章。仅接受 <Icon> 或 <Badge>。纯图标按钮时忽略。颜色继承自按钮变体。',
    },
    {name: 'tooltip', type: 'string', description: '悬停时显示的提示文本。'},
    {name: 'onClick', type: '(e: MouseEvent) => void', description: '标准点击处理函数（从 ButtonHTMLAttributes 透传）。'},
    {
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: '异步点击处理函数。返回的 Promise 处于 pending 状态时显示加载状态。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-button',
        visualProps: [
          'size',
          'variant',
          'elevation',
        ],
      },
    ],
    vars: [
      {name: '--_button-radius', description: '圆角半径', default: 'var(--radius-element)', private: true},
      {name: '--button-focus-offset', description: '焦点环轮廓偏移', default: 'var(--focus-outline-offset)'},
      {name: '--button-icon-only-aspect', description: '纯图标按钮的宽高比', default: '1 / 1'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_button-radius']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '操作触发按钮：4 种变体、3 种尺寸、加载状态',
  usage: {
    description:
      '点击按钮触发操作。用于表单提交、确认、导航，或任何需要明确行动号召的交互。',
    bestPractices: [
      {guidance: true, description: 'primary 留给唯一最重要操作；其余用 secondary 或 ghost。'},
      {guidance: true, description: '标签描述动作："保存更改"，而非 "确定" 或 "点这里"。'},
      {guidance: true, description: '异步操作显示加载状态，让用户知道正在处理。'},
      {guidance: true, description: '纯图标按钮需要 label 供屏幕阅读器、tooltip 供视觉用户。'},
      {guidance: true, description: '专门的纯图标按钮用 @astryxdesign/core/IconButton 的 IconButton；独立组件，不从 @astryxdesign/core/Button 导出。'},
      {guidance: false, description: '不要一视图多个 primary 按钮；削弱层级。'},
      {guidance: false, description: '不可逆操作不要不加确认就用 destructive。'},
      {guidance: false, description: '不要用按钮导航；只是跳页请用链接。'},
      {guidance: false, description: '不要把 xstyle 或 className 用在 ::before 上：粗指针主输入下按压进行或淡出时它是触摸按压层（z-index -1，opacity 带动画）；静止时为空。'},
    ],
  },
  propDescriptions: {
    label: '无障碍标签；默认为可见文本，isIconOnly 时为 aria-label',
    variant: '视觉样式变体',
    size: '尺寸变体',
    elevation: '浮动按钮/FAB 的静止阴影深度：none|low|med|high；ButtonGroup 内忽略',
    type: 'HTML 按钮类型；默认 "button"',
    name: '表单提交的 HTML name',
    displayName: '表单提交的 HTML name',
    value: '表单提交的 HTML value',
    form: '通过 ID 关联表单元素',
    isLoading: '显示加载指示器，阻止重复激活但保持可聚焦（aria-disabled，非原生 disabled）；经实时区域播报',
    icon: '渲染在标签文本前的图标元素；未定尺寸的 Astryx Icon 在 sm/md 按钮默认 sm，lg 按钮默认 md',
    isIconOnly: '为 true 时渲染正方形纯图标按钮；label 变为 aria-label',
    width: "按钮宽度。数字=像素，字符串=原样（如 '100%' 全宽）。默认内容宽、以容器为上限；窄行中标签以省略号截断；纯图标保持正方形。",
    children: '可选的可见内容覆盖；无障碍起见 label 仍必填。优先 <Button label="Save" /> 而非 children',
    endContent: '标签后的尾部图标/徽章；isIconOnly 时忽略；颜色继承',
    tooltip: '悬停提示',
    onClick: '标准点击处理函数；先于 clickAction 触发',
    clickAction: '异步点击处理函数；Promise pending 期间显示加载',
    isDisabled: '禁用按钮；用 aria-disabled 而非原生 disabled',
  },
};
