// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Badge',
  displayName: 'Badge',
  category: 'Feedback & Status',
  keywords: ["badge","标签","chip","标签文本","状态","指示器","计数","计数器","胶囊","通知","标记"],
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        '视觉样式变体。语义变体（neutral、info、success、warning、error）使用实色背景。非语义颜色变体使用浅色背景配彩色文字，用于分类与标记。',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description:
        '徽章文本内容。徽章为单行，高度至少与该行文本一致，因此随文本（更大的字号）增长；超过可用宽度的文本以省略号截断，不会溢出容器；字符串或数字标签还会设置为徽章的 title，悬停时可见完整文本。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '可选的前置图标。',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  playground: {
    defaults: {
      label: '徽章',
      variant: 'neutral',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      '徽章一眼突出状态或类别。请克制使用：仅当值表示明确状态（如 Active、Failed）或分组标签（如 Engineering、Design）时使用。大多数元数据（日期、时长、计数、描述）应为普通说明文本，而非徽章。',
    bestPractices: [
      {guidance: true, description: '每个状态徽章都会抢占注意力。只对用户需要关注或行动的状态打徽章：错误、警告、需要跟进的事项。若无需行动，普通文本即可。'},
      {guidance: true, description: 'success、warning、error 变体只用于需要关注的系统状态："Failed"、"Degraded"、"Action Required"。它们采用醒目的实色背景设计。'},
      {guidance: true, description: '颜色变体（blue、purple、teal 等）用于对条目分组或归类的类别标签：团队名、内容类型、优先级。'},
      {guidance: true, description: '标签保持一到两个词。更多细节放在周边文本中，而不是徽章里。'},
      {guidance: true, description: '图标有助于快速识别徽章类型时可以添加，但必须同时带文字标签。'},
      {guidance: false, description: '不要给每个健康/活跃/正常条目都加 "success" 徽章。若所有行都显示绿色 "Active" 徽章，就没有任何一个突出；徽章只增加噪音，不增加信息。只展示需要用户关注的状态（错误、警告、待处理操作）。'},
      {guidance: false, description: '不要用徽章承载元数据。时长（"6h window"）、计数（"12 trigger types"）、日期与描述不是状态或类别；应使用说明文本（type="supporting" 的 Text）。'},
      {guidance: false, description: '不要将语义状态变体（success、warning、error、info）用于类别或信息性内容。它们视觉上很醒目，只应表示系统状态。'},
      {guidance: false, description: '不要在表格或列表的每一行重复同一徽章。若同一值出现在大多数行中，它不增加信息；常见状态用普通文本，徽章留给例外情况。'},
      {guidance: false, description: '不要让徽章可点击；它们是只读指示器。用户需要操作时请用按钮或链接。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '可选的前置图标，帮助一眼识别徽章类型。'},
      {name: 'Label', required: true, description: '徽章内显示的文本或数字。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Badge',
  displayName: 'Badge',
  usage: {
    description:
      '徽章一眼突出状态或类别。请克制使用：仅当值表示明确状态（如 Active、Failed）或分组标签（如 Engineering、Design）时使用。大多数元数据（日期、时长、计数、描述）应为普通说明文本，而非徽章。',
    bestPractices: [
      {guidance: true, description: '每个状态徽章都会抢占注意力。只对用户需要关注或行动的状态打徽章：错误、警告、需要跟进的事项。若无需行动，普通文本即可。'},
      {guidance: true, description: 'success、warning、error 变体只用于需要关注的系统状态："Failed"、"Degraded"、"Action Required"。它们采用醒目的实色背景设计。'},
      {guidance: true, description: '颜色变体（blue、purple、teal 等）用于对条目分组或归类的类别标签：团队名、内容类型、优先级。'},
      {guidance: true, description: '标签保持一到两个词。更多细节放在周边文本中，而不是徽章里。'},
      {guidance: true, description: '图标有助于快速识别徽章类型时可以添加，但必须同时带文字标签。'},
      {guidance: false, description: '不要给每个健康/活跃/正常条目都加 "success" 徽章。若所有行都显示绿色 "Active" 徽章，就没有任何一个突出；徽章只增加噪音，不增加信息。只展示需要用户关注的状态（错误、警告、待处理操作）。'},
      {guidance: false, description: '不要用徽章承载元数据。时长（"6h window"）、计数（"12 trigger types"）、日期与描述不是状态或类别；应使用说明文本（type="supporting" 的 Text）。'},
      {guidance: false, description: '不要将语义状态变体（success、warning、error、info）用于类别或信息性内容。它们视觉上很醒目，只应表示系统状态。'},
      {guidance: false, description: '不要在表格或列表的每一行重复同一徽章。若同一值出现在大多数行中，它不增加信息；常见状态用普通文本，徽章留给例外情况。'},
      {guidance: false, description: '不要让徽章可点击；它们是只读指示器。用户需要操作时请用按钮或链接。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '可选的前置图标，帮助一眼识别徽章类型。'},
      {name: 'Label', required: true, description: '徽章内显示的文本或数字。'},
    ],
  },
  props: [
    {
      name: 'variant',
      type:
        "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description: '视觉样式变体。语义变体使用实色背景，非语义颜色变体使用浅色背景配彩色文字。',
      default: "'neutral'",
    },
    {name: 'label', type: 'ReactNode', required: true, description: '徽章文本内容。'},
    {name: 'icon', type: 'ReactNode', description: '可选的前置图标。'},
  ],
  theming: {
    targets: [
      {
        className: 'astryx-badge',
        visualProps: [
          'variant',
        ],
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '突出状态或类别标签，不用于一般元数据',
  usage: {
    description:
      'Badge 用于状态（Active、Failed）与类别标签（Engineering、Design）。不用于日期、时长、计数、描述等元数据；这些请用说明文本（Text type="supporting"）。',
    bestPractices: [
      {guidance: true, description: '每个徽章都会抢占注意力。只对用户需要行动的状态打徽章；无需跟进时用普通文本。'},
      {guidance: true, description: 'success/warning/error 只用于需要关注的系统状态（Failed、Degraded、Action Required）。它们视觉醒目：实色背景。'},
      {guidance: true, description: '颜色变体（blue、purple、teal）用于归类条目的类别标签：团队名、内容类型、优先级。'},
      {guidance: true, description: '标签保持一到两个词；更多细节放周边文本，不放徽章。'},
      {guidance: true, description: '图标有助于快速识别徽章类型时可以添加，但必须同时带文字标签。'},
      {guidance: false, description: '不要给每个健康/正常条目加 "success" 徽章。若大多数行都是绿色 "Active"，就没有突出的。默认状态不打徽章；只突出需要关注的例外。'},
      {guidance: false, description: '不要用徽章承载元数据。时长、计数、日期、描述 → 改用 type="supporting" 的 Text。'},
      {guidance: false, description: '不要将状态变体用于非状态信息。"6h window"、"12 types"、类别名都不是状态。'},
      {guidance: false, description: '不要在每一行重复醒目徽章。常见/默认状态用普通文本；徽章留给例外。'},
      {guidance: false, description: '不要让徽章可点击；它们是只读的。操作请用按钮或链接。'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: '可选的前置图标。'},
      {name: 'Label', required: true, description: '徽章内显示的文本或数字。'},
    ],
  },
  propDescriptions: {
    variant: '视觉样式变体',
    label: '徽章文本内容；过宽标签以省略号截断，完整文本在 title 中',
    icon: '可选的前置图标',
  },
};
