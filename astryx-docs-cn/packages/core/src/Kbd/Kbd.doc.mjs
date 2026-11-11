// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Shortcut',
    required: true,
    description:
      '呈现完整键盘快捷键及其无障碍名称的组。',
  },
  {
    name: 'Key badge',
    required: true,
    description:
      '为快捷键中每个按键渲染一枚绘制的键帽。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentBestPractice[]} */
const bestPractices = [
  {
    guidance: true,
    description:
      '把快捷键放在它触发的操作附近：工具提示、菜单项或行内说明中。',
  },
  {
    guidance: true,
    description:
      '用 mod 而不是 ctrl 或 cmd；它会自动适应用户的平台。',
  },
  {
    guidance: true,
    description:
      '让 Kbd 命名快捷键：屏幕阅读器会把按键作为词语读出，如 "Command + K"。Kbd 会忽略传入的 aria-label；要从可见文本命名，请用 aria-labelledby。',
  },
  {
    guidance: false,
    description:
      '不要把 Kbd 作为发现某个操作的唯一途径；快捷键应补充可见控件，而不是取代它们。',
  },
  {
    guidance: false,
    description:
      '不要指望 Kbd 处理按键。它只展示按键；在你的代码中自行监听快捷键。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Kbd',
  displayName: 'Kbd',
  category: 'Content',
  keywords: [
    'kbd',
    'keyboard',
    'shortcut',
    'hotkey',
    'keybinding',
    'keystroke',
    'keycombo',
    'modifier',
    'accelerator',
    '快捷键',
    '热键',
    '按键',
  ],
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        '键盘快捷键字符串。使用 "+" 分隔各按键。特殊按键：mod（Apple 平台上为 ⌘，其他平台为 Ctrl）、ctrl、alt 和 shift（Apple 平台上为符号，其他平台为 Ctrl、Alt、Shift 文字）、meta（Apple 平台上为 ⌘，其他平台及水合前为 Win）、enter、backspace、escape、tab、up、down、left、right、plus。别名：esc 等同于 escape，return 等同于 enter。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS 类名。建议优先使用 xstyle 进行样式设置，className 用于与非 StyleX 系统的集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。建议优先使用 xstyle 进行样式设置，内联样式会绕过 StyleX 优化。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLSpanElement>',
      description: '转发到快捷键组元素的 ref。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-kbd'}],
  },
  usage: {
    anatomy,
    description:
      '把键盘快捷键渲染为带样式的键帽。在工具提示、菜单和帮助文本中用 Kbd 展示按键组合。',
    bestPractices,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Kbd',
  displayName: 'Kbd',
  props: [
    {
      name: 'keys',
      type: 'string',
      description:
        '键盘快捷键字符串。使用 "+" 分隔各按键。特殊按键：mod（Apple 平台上为 ⌘，其他平台为 Ctrl）、ctrl、alt 和 shift（Apple 平台上为符号，其他平台为 Ctrl、Alt、Shift 文字）、meta（Apple 平台上为 ⌘，其他平台及水合前为 Win）、enter、backspace、escape、tab、up、down、left、right、plus。别名：esc 等同于 escape，return 等同于 enter。',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，这不能是 style={{}} 这样的内联样式对象。',
    },
    {
      name: 'className',
      type: 'string',
      description:
        '根元素的 CSS 类名。建议优先使用 xstyle 进行样式设置，className 用于与非 StyleX 系统的集成。',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        '根元素的内联样式。建议优先使用 xstyle 进行样式设置，内联样式会绕过 StyleX 优化。',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLSpanElement>',
      description: '转发到快捷键组元素的 ref。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-kbd'}],
  },
  usage: {
    anatomy,
    description:
      'Renders a keyboard shortcut as styled key badges. Use Kbd in tooltips, menus, and help text to show key combinations.',
    bestPractices,
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '把键盘快捷键渲染为带样式的键帽。用于工具提示、菜单 + 帮助文本展示按键组合。',
  usage: {
    anatomy,
    description:
      '把键盘快捷键渲染为带样式的键帽。在工具提示、菜单和帮助文本中用 Kbd 展示按键组合。',
    bestPractices,
  },
  propDescriptions: {
    keys: '快捷键字符串。"+" 分隔按键。特殊键：mod（Apple 平台为 ⌘，其他为 Ctrl）、ctrl、alt、shift（Apple 平台为符号，其他为文字）、meta（Apple 平台为 ⌘，其他平台及水合前为 Win）、enter、backspace、escape、tab、up、down、left、right、plus。别名：esc = escape，return = enter。',
    xstyle:
      '布局自定义用 StyleX 样式。必须是 stylex.create() 的值。',
    className:
      '根元素 CSS 类名。优先用 xstyle；className 用于非 StyleX 集成。',
    style:
      '根元素内联样式。优先用 xstyle；内联样式绕过 StyleX 优化。',
    ref: '转发到快捷键组元素的 ref。',
  },
};
