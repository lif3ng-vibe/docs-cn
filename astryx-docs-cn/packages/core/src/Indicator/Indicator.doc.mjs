// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Indicator',
  displayName: 'Indicator',
  group: 'Indicator',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  keywords: [
    'indicator',
    'checkbox',
    'radio',
    'control',
    'selection',
    'mark',
    'tick',
    'themeable',
    'swap',
    '指示器',
    '选中标记',
  ],
  description:
    '装饰性控件视觉：选中项上的标记、复选框绘制的方框、单选绘制的圆圈。由 Selector、CheckboxInput、RadioList 和菜单选择行渲染。通过 defineTheme({indicators}) 按名称替换一个，所有绘制它的组件都会跟随。',
  components: [
    {
      name: 'CheckboxIndicator',
      displayName: 'Checkbox Indicator',
      description:
        '复选框视觉：带勾选标记或半选中横条的方框。装饰性（aria-hidden）；所属控件保留 input、role、无障碍名称、焦点和键盘行为。',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked' | 'indeterminate'",
          description:
            '绘制哪种状态。指示器在每个状态下都会绘制：未选中方框是空方框，而不是什么都不画。',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: '控件尺寸：20px 或 24px。',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '所属控件是否禁用。纯视觉；真实禁用语义由所属控件保留。',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '当浅层的 `isRenderable(children)` 检查接受该值时，在边框外观内渲染它以替代状态标记。该辅助函数排除 `null`、`undefined`、布尔值和空字符串；React 元素和容器即使其后代什么都不渲染也会走替换路径。CheckboxInput 以 `children={isBusy && <Spinner/>}` 传入加载中的 Spinner，因此替换实现应使用同一辅助函数而不是判空检查。',
        },
      ],
    },
    {
      name: 'CheckIndicator',
      displayName: 'Check Indicator',
      description:
        '选中项上的标记：默认为勾选标记，未选中时什么都不画，因此 listbox 不会在每行旁边显示空方框。想改变"选中"的样子就替换这个指示器：把它映射为 RadioIndicator，所有单选标记都会变成单选视觉，包括未选中行的空圆圈。与复选框、单选视觉不同，它不渲染自己的边框外观（它本身就是图形），因此宿主的主题目标会落在与 astryx-icon 相同的元素上。',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked'",
          description:
            '绘制哪种状态。默认在未选中时什么都不画；替换实现可以在两种状态下都绘制。',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: '控件尺寸，与其他指示器一致。',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '所属行是否禁用。纯视觉；真实禁用语义由所属控件保留。',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '在所有状态下替代标记渲染：宿主显示等待中的 Spinner 时，无论该行是否选中都会透传。',
        },
      ],
      playground: {
        defaults: {state: 'checked'},
      },
    },
    {
      name: 'RadioIndicator',
      displayName: 'Radio Indicator',
      description:
        '单选视觉：选中时为带实心内点的圆圈。两种状态都绘制；未选中的单选是空圆圈，这正是它能在选择槽位中顶替勾选标记的原因。',
      props: [
        {
          name: 'state',
          type: "'unchecked' | 'checked'",
          description:
            '绘制哪种状态。Radio 属于 singleSelection 家族，没有部分选中状态。',
          required: true,
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: '控件尺寸：20px 或 24px。',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description:
            '所属控件是否禁用。纯视觉；真实禁用语义由所属控件保留。',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '在边框外观内替代状态标记渲染。',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-checkbox-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-checkbox-indicator-check', visualProps: ['size']},
      {className: 'astryx-checkbox-indicator-dash', visualProps: ['size']},
      {
        className: 'astryx-radio-indicator',
        visualProps: ['size'],
        states: ['checked', 'disabled'],
      },
      {className: 'astryx-radio-indicator-dot', visualProps: ['size']},
    ],
  },
  examples: [
    {
      label: '重新设置指示器样式（常用路径）',
      code: `// Indicators render the same stable class targets wherever they appear, so
// one component override reaches the form control, the menu row, and any
// selection slot themed to use it. No indicator-specific API needed.
defineTheme({
  name: 'brand',
  components: {
    'checkbox-indicator': {
      base: {borderRadius: 'var(--radius-full)', borderWidth: '2px'},
      checked: {
        backgroundColor: 'var(--color-accent)',
        borderColor: 'var(--color-accent)',
      },
      'checked+disabled': {backgroundColor: 'var(--color-background-muted)'},
    },
    'radio-indicator': {base: {borderWidth: '2px'}},
    'radio-indicator-dot': {base: {borderRadius: '2px'}},
  },
});`,
    },
    {
      label: '用自定义组件替换指示器',
      code: `// When the shape itself is wrong, hand the theme a component. It receives
// {state, size, isDisabled, children} and nothing else.
//
// Use theme tokens, never raw values — run \`astryx docs tokens\` for the
// full set. Color: --color-accent, --color-on-accent, --color-border,
// --color-border-emphasized, --color-background-surface,
// --color-background-muted. Radius: --radius-inner, --radius-full.
// Border width: --border-width.
import {isRenderable} from '@astryxdesign/core/utils';

function BrandCheckbox({state, size = 'md', isDisabled, children}) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size === 'sm' ? 20 : 24,
        height: size === 'sm' ? 20 : 24,
        borderRadius: 'var(--radius-inner)',
        border: 'var(--border-width) solid var(--color-border-emphasized)',
        color: 'var(--color-accent)',
        opacity: isDisabled ? 0.5 : 1,
      }}>
      {/* children first: the owner passes a loading Spinner through it.
          isRenderable, NOT \`children ??\` — a host writes
          children={isBusy && <Spinner/>}, and \`false\` is neither null nor
          caught by ??, so a nullish check takes the children branch, renders
          nothing in it, and deletes your mark on every chosen row. */}
      {isRenderable(children)
        ? children
        : state === 'checked' && <StarGlyph />}
    </span>
  );
}

defineTheme({name: 'brand', indicators: {checkbox: BrandCheckbox}});`,
    },
    {
      label: '单选场景使用单选视觉',
      code: `// Replacement is by NAME, so one entry reaches every component that draws
// that indicator. Here every option in a Selector listbox draws a radio —
// including the unselected ones, which a check mark cannot do.
import {RadioIndicator} from '@astryxdesign/core/Indicator';

defineTheme({name: 'brand', indicators: {check: RadioIndicator}});`,
    },
  ],
  usage: {
    description:
      '指示器是由 CheckboxInput、RadioList 和菜单选择行共享的组件化选择视觉。它们是装饰性的：所属控件保留 input、role、无障碍名称、焦点和键盘行为，指示器只负责把状态变成图形。正是这种拆分让它们可主题化：通过类目标重设样式，或整体替换组件。',
    bestPractices: [
      {
        guidance: true,
        description:
          "优先使用规范的 `components['checkbox-indicator']` 覆盖。替换组件是更重的路径，留给形状本身不对的情况。",
      },
      {
        guidance: true,
        description:
          '替换内容的分支要与官方一致，用 `isRenderable(children)`，而不是 `children != null` 或 `children ?? mark`。该辅助函数刻意只做浅层判断：排除 nullish 值、布尔值和空字符串，而 React 元素和容器即使后代什么都不渲染也走替换路径。所属控件传入 `children={isBusy && <Spinner/>}`，因此判空检查会在该值为 `false` 时删掉状态标记（#4893）。',
      },
      {
        guidance: true,
        description:
          '替换实现必须设置 aria-hidden。role 和无障碍名称由所属控件提供；可见的指示器会被播报两次。',
      },
      {
        guidance: true,
        description:
          '替换实现中的所有颜色、圆角和边框宽度都使用主题令牌。完整清单运行 `astryx docs tokens` 查看。',
      },
      {
        guidance: true,
        description:
          "渲染单个根元素，并让它保留你希望焦点环跟随的 border-radius。真实 input 在视觉上隐藏的控件无法在 input 上显示焦点，因此所属控件会在聚焦时把标准焦点环画到指示器元素本身上（useIndicatorFocusRing），`outline` 会取该元素的圆角。替换实现无需配合也不会遗漏：焦点环永不缺失（WCAG 2.4.7），只有根元素自身没有圆角时形状才可能不对。不要自己画焦点环；所属控件已经画了。",
      },
      {
        guidance: false,
        description:
          "不要把悬停或按压状态作为 prop 传入。交互状态通过所属控件的 CSS 祖先 marker 到达指示器，悬停行会自动着色，无需任何 prop。",
      },
      {
        guidance: false,
        description:
          "不要以为只有选中时才挂载。宿主无条件渲染指示器并在每个状态下传入 `state`；这正是替换实现能在默认什么都不画的地方作画的原因（未选中行的单选空圆圈）。某种状态下画不画是指示器自己的决定，宿主不会替它做。",
      },
    ],
    anatomy: [
      {
        name: 'Chrome (checkbox, radio)',
        required: true,
        description:
          'CheckboxIndicator 和 RadioIndicator 在每个状态下持续渲染的方框或圆圈。CheckIndicator 本身就是状态标记，刻意不带边框外观。',
      },
      {
        name: 'State mark',
        required: false,
        description:
          '在边框外观内为当前状态显示的勾选标记、半选中横条或单选圆点。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '装饰性选择视觉：选中项标记、复选框方框、单选圆圈。由 Selector/CheckboxInput/RadioList/菜单行渲染。通过 defineTheme({indicators}) 按名称替换，所有绘制它的组件都会跟随。',
  usage: {
    description:
      '由 CheckboxInput、RadioList 和菜单行共享的组件化选择视觉。装饰性：所属控件保留 input/role/名称/焦点/键盘；指示器把状态变成图形。这种拆分使其可主题化：通过类目标改样式或替换组件。',
    bestPractices: [
      {
        guidance: true,
        description:
          "优先使用规范的 `components['checkbox-indicator']` 覆盖。替换组件是更重的路径，留给形状本身不对的情况。",
      },
      {
        guidance: true,
        description:
          '替换内容分支与官方一致：用 `isRenderable(children)`，不是 `children != null` 或 `children ?? mark`。该辅助函数是浅层判断：排除 nullish、布尔值和空字符串，React 元素和容器即使后代不渲染也走替换路径。所属控件传入 `children={isBusy && <Spinner/>}`，判空检查会在值为 `false` 时删掉状态标记（#4893）。',
      },
      {
        guidance: true,
        description:
          '替换实现必须设置 aria-hidden。role 和无障碍名称由所属控件提供；可见指示器会被播报两次。',
      },
      {
        guidance: true,
        description:
          '替换实现中的所有颜色、圆角和边框宽度都使用主题令牌。完整清单运行 `astryx docs tokens` 查看。',
      },
      {
        guidance: true,
        description:
          '渲染单个根元素并保留焦点环应跟随的 border-radius。所属控件在聚焦时把标准环画到指示器上（useIndicatorFocusRing），outline 取其圆角；焦点环永不缺失（WCAG 2.4.7），只有根元素缺圆角时形状才可能不对。不要自己画焦点环。',
      },
      {
        guidance: false,
        description:
          "不要把悬停或按压状态作为 prop 传入。交互状态通过所属控件的 CSS 祖先 marker 到达指示器。",
      },
      {
        guidance: false,
        description:
          "不要以为只有选中时才挂载。宿主无条件渲染指示器并在每个状态下传入 `state`；这正是替换实现能在默认什么都不画的地方作画的原因（未选中行的单选空圆圈）。",
      },
    ],
  },
  components: [
    {
      name: 'CheckboxIndicator',
      displayName: 'Checkbox Indicator',
      description:
        '复选框视觉：带勾选标记或半选中横条的方框。装饰性（aria-hidden）；所属控件保留 input/role/名称/焦点/键盘。',
      propDescriptions: {
        state:
          '绘制哪种状态。指示器在每个状态下都会绘制：未选中是空方框，不是什么都不画。',
        size: '控件尺寸：20px 或 24px。',
        isDisabled:
          '所属控件是否禁用。纯视觉；真实禁用语义由所属控件保留。',
        children:
          '在边框外观内替代状态标记渲染。change action 进行期间 CheckboxInput 会透传加载中的 Spinner，因此替换实现必须在 children 存在时渲染它，否则会丢失忙碌视觉。',
      },
    },
    {
      name: 'CheckIndicator',
      displayName: 'Check Indicator',
      description:
        '选中项标记：默认为勾选标记，未选中时不画。把它映射为 RadioIndicator 可让单选标记获得单选视觉。不渲染自己的边框外观（它本身就是图形），主题目标会落在与 astryx-icon 相同的元素上。',
      propDescriptions: {
        state:
          '绘制哪种状态。默认未选中时不画；替换实现可两种状态都画。',
        size: '控件尺寸，与其他指示器一致。',
        isDisabled:
          '所属行是否禁用。纯视觉；真实禁用语义由所属控件保留。',
        children:
          '在所有状态下替代标记渲染；宿主显示等待中的 Spinner 时，无论是否选中都会透传。',
      },
    },
    {
      name: 'RadioIndicator',
      displayName: 'Radio Indicator',
      description:
        '单选视觉：选中时为带实心内点的圆圈。两种状态都绘制；未选中的单选是空圆圈，这正是它能在选择槽位中顶替勾选标记的原因。',
      propDescriptions: {
        state:
          '绘制哪种状态。Radio 属于 singleSelection 家族，没有部分选中状态。',
        size: '控件尺寸：20px 或 24px。',
        isDisabled:
          '所属控件是否禁用。纯视觉；真实禁用语义由所属控件保留。',
        children: '在边框外观内替代状态标记渲染。',
      },
    },
  ],
};
