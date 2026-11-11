// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Field',
  displayName: 'Field',
  group: 'Field',
  category: 'Form Controls',
  keywords: ["field","formfield","formgroup","formcontrol","label","input","required","optional","helpertext","hint","表单字段","标签","必填","可选","提示"],
  playground: {
    defaults: {
      label: 'Email address',
      inputID: 'email-input',
      description: '适用于控件本身未内置字段结构的场景。',
      descriptionID: 'email-help',
      children: {
        __element: 'input',
        props: {
          id: 'email-input',
          'aria-describedby': 'email-help',
          placeholder: 'you@example.com',
          type: 'email',
        },
      },
    },
  },
  theming: {
    targets: [
      {className: 'astryx-field', visualProps: ['layout']},
      {className: 'astryx-field-label'},
      {className: 'astryx-field-status', visualProps: ['type', 'variant']},
      {
        className: 'astryx-input-status-icon',
        visualProps: ['size', 'status'],
      },
      {className: 'astryx-input-clear-button'},
      {className: 'astryx-input-clear-icon'},
    ],
    vars: [
      {name: '--_field-radius', description: '输入字段的圆角', default: 'var(--radius-element)', private: true},
      {name: '--_field-status-overlap', description: '附着式 FieldStatus 延伸到控件下半部分之后的距离。按渲染后的控件尺寸设置。', default: 'calc(var(--size-element-md) / 2)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_field-radius']},
    ],
  },
  description: '面向自定义控件的低层表单字段包装器，提供 label、description 以及可选/必填指示器。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '字段的标签文本（出于无障碍始终渲染）。',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: '输入元素的 ID（用作 label 的 htmlFor 属性）。',
      required: true,
    },
    {
      name: 'labelID',
      type: 'string',
      description: '应用到 label 元素自身的 ID，用于分组无障碍。',
    },
    {
      name: 'isGroupLabel',
      type: 'boolean',
      description: '为控件组（radiogroup、复选列表）将 label 渲染为 span。',
      default: 'false',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '要渲染的输入框或控件。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '在视觉上隐藏标签（屏幕阅读器仍可访问）。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '关联的输入框是否禁用。禁用样式会传播到标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签与输入框之间的描述文本。',
    },
    {
      name: 'descriptionID',
      type: 'string',
      description: '描述元素的 ID（用于输入框上的 aria-describedby）。',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选（与 isRequired 互斥）。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '字段是否必填（与 isOptional 互斥）。',
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description: '显示在标签文本前的图标。有效的语义名称见 `astryx docs icons`。',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        '标签后信息按钮的帮助文本，按钮名为 "About {label}"。悬停和键盘聚焦时预览；点按、点击、Enter 或 Space 会打开它，且永远不会聚焦或切换所关联的控件。',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string, messageID?: string}",
      description: '带类型和可选消息的状态指示器。设置 message 时显示彩色状态框。messageID 用于在输入框上接 aria-describedby。',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description: '状态反馈的放置方式。attached 会叠放在符合条件的不透明、带边框、固定高度控件上；detached 在自定义或无边框控件下方渲染消息；tooltip 把可见提示留给被包裹的输入框，在不显示 FieldStatus 框的情况下播报消息。',
      default: "'attached'",
    },
    {
      name: 'width',
      type: 'SizeValue',
      description: '字段宽度（数字 = 像素，字符串原样使用，如 "100%"）。它决定整个字段（标签、控件和状态）的尺寸，使其保持对齐。请优先使用它而不是通过 xstyle/className/style 设置宽度——那只会设定内部控件盒的尺寸。没有宽度时，所在行可能把整个字段收缩到控件自然宽度以下，因此筛选栏会收缩而不是溢出。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: '转发到根元素的 ref。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description: '附加到根元素的 CSS 类名（一个或多个）。StyleX 去重请优先用 xstyle。',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: '应用到根元素的内联样式。优先级高于 StyleX 内联样式。',
    },
  ],
  components: [
    {name: 'FieldLabel'},
    {name: 'FieldStatus'},
  ],
  usage: {
    description: 'Field 是面向自定义、原生或第三方控件的低层包装器，用于那些尚未提供字段 label、description 和状态 UI 的控件。需要为自己的控件套上 Field 外壳时使用它；如果 TextInput、Typeahead、Select 等带样式的 Astryx 输入组件已暴露 label、description 和校验 prop，则直接使用它们。',
    bestPractices: [
      { guidance: true, description: '用它包裹需要标签、帮助文本、可选/必填指示器或校验状态的自定义控件、原生输入框或第三方组件。' },
      { guidance: true, description: '出于无障碍始终提供 label，即使通过 isLabelHidden 在视觉上隐藏。' },
      { guidance: true, description: '使用 inputID 和 descriptionID，通过 htmlFor 和 aria-describedby 把 label 和 description 关联到内部控件。' },
      { guidance: false, description: '不要在 TextInput、Typeahead、Select、DateInput、TextArea 等带样式的输入组件外再套 Field；这些组件已自行渲染 Field 外壳。' },
      { guidance: true, description: '仅当被包裹控件不透明、带边框且固定高度时使用 attached 状态；自定义、高、半透明或无边框控件请用 detached。' },
      { guidance: false, description: '不要在同一个字段上同时设置 isOptional 和 isRequired。' },
      { guidance: false, description: '不要在隐藏标签的同时不为用户提供理解字段用途的其他途径。' },
    ],
    anatomy: [
      {name: 'Container', required: true, description: '字段根盒，持有布局、宽度以及标签、控件、状态的局部堆叠。'},
      {name: 'Label', required: true, description: '标识字段的文本。出于无障碍始终渲染，可在视觉上隐藏。'},
      {name: 'Ordinary description', required: false, description: '普通字段布局中标签下方的帮助文本。'},
      {name: 'Horizontal-label description', required: false, description: 'FormLayout 采用水平标签时控件列中的帮助文本。'},
      {name: 'Control slot', required: true, description: '尚未自带字段外壳的自定义、原生或第三方控件。'},
      {name: 'Status message', required: false, description: '带消息的内联校验反馈，显示 error、warning 或 success。'},
      {name: 'Input status icon', required: false, description: 'Field 组合的输入控件共用的状态指示。'},
      {name: 'Input clear button', required: false, description: 'Field 组合的输入控件共用的清除操作。'},
      {name: 'Input clear icon', required: false, description: '共用输入清除操作内的图标。'},
      {name: 'Optional/Required indicator', required: false, description: '标签旁的徽章，显示字段可选还是必填。'},
      {name: 'Label tooltip trigger', required: false, description: '标签旁打开说明内容的信息图标。'},
      {name: 'Label tooltip surface', required: false, description: '由 Layer 承载的标签工具说明内容。'},
    ],
  },
  examples: [
    {
      label: '筛选栏',
      code: `
import {useState} from 'react';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {StackItem} from '@astryxdesign/core/Stack';
import {TextInput} from '@astryxdesign/core/TextInput';

// Every Field-based input (TextInput, Selector, DateInput, ...) can be shrunk
// by its row, so a filter bar never pushes the page sideways. Let the row wrap
// so that on a phone the search box keeps a full line and the selectors move
// below it; on wider screens everything stays on one line, with the search box
// taking the free space.
function OrdersFilterBar() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Awaiting fulfillment');
  const [region, setRegion] = useState('All regions');
  const [sort, setSort] = useState('Newest first');
  return (
    <HStack gap={2} wrap="wrap" vAlign="center">
      <StackItem size="fill">
        <TextInput
          label="Search orders"
          isLabelHidden
          placeholder="Search by order or customer"
          startIcon={<Icon icon="search" />}
          value={query}
          onChange={setQuery}
        />
      </StackItem>
      <Selector
        label="Status"
        isLabelHidden
        options={['All statuses', 'Awaiting fulfillment', 'Shipped', 'Delivered', 'Returned']}
        value={status}
        onChange={setStatus}
      />
      <Selector
        label="Region"
        isLabelHidden
        options={['All regions', 'North America', 'Europe', 'Asia Pacific']}
        value={region}
        onChange={setRegion}
      />
      <Selector
        label="Sort"
        isLabelHidden
        options={['Newest first', 'Oldest first', 'Highest total']}
        value={sort}
        onChange={setSort}
      />
    </HStack>
  );
}
`,
    },
    {
      label: '包裹自定义控件',
      code: `
function CustomSliderField() {
  return (
    <Field
      label="Confidence"
      inputID="confidence-slider"
      description="Choose how strict the review should be."
      descriptionID="confidence-help"
      status={{type: 'success', message: 'Recommended default'}}
      statusVariant="detached">
      <input
        id="confidence-slider"
        type="range"
        min={0}
        max={100}
        defaultValue={60}
        aria-describedby="confidence-help"
      />
    </Field>
  );
}
`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Field is a low-level wrapper for custom, native, or third-party controls that do not already provide field label, description, and status UI. Use it when you need the Field shell around a control you own; use styled Astryx inputs like TextInput, Typeahead, and Select directly when they already expose label, description, and validation props.',
    bestPractices: [
      { guidance: true, description: 'Wrap custom controls, native inputs, or third-party widgets that need labeling, helper text, optional/required indicators, or validation status.' },
      { guidance: true, description: 'Always provide a label for accessibility, even if visually hidden with isLabelHidden.' },
      { guidance: true, description: 'Use inputID and descriptionID to connect the label and description to the inner control with htmlFor and aria-describedby.' },
      { guidance: false, description: 'Nest Field around styled inputs such as TextInput, Typeahead, Select, DateInput, or TextArea; those components already render their own Field shell.' },
      { guidance: true, description: 'Use attached status only when the wrapped control is opaque, bordered, and fixed-height; use detached for custom, tall, translucent, or non-bordered controls.' },
      { guidance: false, description: 'Set both isOptional and isRequired on the same field.' },
      { guidance: false, description: 'Hide the label without providing an alternative way for the user to understand the field purpose.' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '面向需要 label/description/status 的自定义控件的低层字段外壳。',
  usage: {
    description: 'Field 为缺少字段 UI 的自定义/原生/第三方控件套壳。TextInput、Typeahead、Select、DateInput、TextArea 已暴露 label/description/status prop 时直接使用。',
    bestPractices: [
      { guidance: true, description: '包裹需要标签、帮助文本、可选/必填指示器或校验状态的自定义控件/组件。' },
      { guidance: true, description: '始终提供 label；仅当语境足够清晰时才在视觉上隐藏。' },
      { guidance: true, description: '把 inputID/descriptionID 接到内部控件的 htmlFor 和 aria-describedby 上。' },
      { guidance: false, description: '不要在带样式输入组件外再套 Field；会重复渲染标签和状态 UI。' },
      { guidance: true, description: 'attached 状态仅用于不透明、带边框、固定高度的控件；自定义、高、半透明或无边框控件用 detached。' },
      { guidance: false, description: '不要在同一个字段上同时设置 isOptional 和 isRequired。' },
      { guidance: false, description: '不要在隐藏标签的同时不为用户保留理解字段用途的方式。' },
    ],
  },
};
