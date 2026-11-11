// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Link',
  displayName: 'Link',
  category: 'Action',
  keywords: ["link","anchor","href","hyperlink","链接","超链接","导航","url","外部链接","textlink","文本链接"],
  playground: {
    defaults: {
      href: '#',
      children: '了解更多',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-link', visualProps: ['color']},
    ],
  },
  components: [
    {
      name: 'Link',
      displayName: 'Link',
      description:
        '带变体、外部链接支持与多态渲染的样式化锚点链接。',
      props: [
        {
          name: 'as',
          type: 'LinkComponentType',
          description: '用于替代 <a> 渲染的自定义组件',
        },
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签（aria-label）。仅在子内容不是自描述文本时使用（例如纯图标链接）。文本链接请省略；链接文本本身就是无障碍名称。',
        },
        {
          name: 'href',
          type: 'string',
          description:
            '链接目标 URL。Astryx 接管的链接与可点击表面会在去除控制字符、修剪首尾空白并以大小写不敏感方式检查 scheme 之后，拦截 javascript:、vbscript: 与 data:text/html。同一规则覆盖原生锚点、自定义路由、Markdown 链接以及所有激活方式。相对路径、片段、协议相对 URL、HTTP(S)、mailto、tel、安全的自定义 scheme 与被接受的下载保持现有行为。被拒绝的目标会以惰性内容渲染，不会调用自定义路由器。没有绕过 prop；例外行为需要调用方在此保证之外自行定制渲染。图片与其他资源 URL 适用单独的策略。',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: '始终显示下划线',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用链接',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description:
            '在新标签页中打开，带外部图标与安全 rel 标记',
          default: 'false',
        },
        {
          name: 'newTabLabel',
          type: 'string',
          description:
            '告知屏幕阅读器外部链接将在新标签页打开的文本。可覆盖以本地化。',
          default: "'(opens in new tab)'",
        },
        {
          name: 'target',
          type: 'string',
          description:
            '链接文档的打开位置。target="_blank" 会自动添加 noopener noreferrer。',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
        },
        {
          name: 'download',
          type: 'string | boolean',
          description:
            '让浏览器下载链接的 URL。字符串值指定建议的文件名。',
        },
        {
          name: 'referrerPolicy',
          type: 'HTMLAttributeReferrerPolicy',
          description: '链接的 referrer 策略。',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: '点击事件处理器',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: '悬停时显示的工具提示文本',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: '应用基础字体大小',
          default: 'false',
        },
        {
          name: 'size',
          type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
          description: '显式字号覆盖，转发给 Text。',
        },
        {
          name: 'weight',
          type: "'normal' | 'medium' | 'semibold' | 'bold'",
          description: '字重覆盖，转发给 Text。',
        },
        {
          name: 'color',
          type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
          description: '文本颜色，转发给 Text。',
          default: "'accent'",
        },
        {
          name: 'display',
          type: "'inline' | 'block'",
          description: 'Text 的显示类型。',
          default: "'inline'",
        },
        {
          name: 'maxLines',
          type: 'number',
          description: '截断前的最大行数。',
          default: '0',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '链接内容',
          required: true,
        },
      ],    },
    {
      name: 'LinkProvider',
      isHiddenFromOverview: true,
      displayName: 'Link Provider',
      description:
        '为子树中所有 Astryx 链接渲染组件设置默认链接组件的 Provider。' +
        '包裹应用根节点，即可用框架路由器（Next.js Link、React Router Link 等）替换原生 <a> 元素。',
      props: [
        {
          name: 'component',
          type: 'LinkComponentType',
          description:
            '用于所有链接元素的组件。它在 Link `href` prop 所述的共享导航规则下接收通过校验的 `href` 与 `to` 值。支持的结构化目标（包括其 `protocol`）会在不改变对象同一性的前提下接受校验。任一提供的目标被拒绝时，Astryx 渲染惰性内容而不调用该组件；不会传入 undefined，也不会回退到另一个目标。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子树',
          required: true,
        },
      ],
    },
  ],
  usage: {
    accessibility: [
      {
        name: 'Link text',
        category: 'Color contrast',
        criterion: '1.4.3 Contrast (Minimum)',
        requirement: '4.5:1',
        states: ['Rest', 'Hover', 'Pointer down'],
        description:
          '链接文本与其背后背景的对比度至少要达到 4.5:1。Pointer down 状态需对照链接绘制在文字后方的按压覆盖层测量。',
      },
    ],
    description:
      '用于行内与独立文本导航的样式化锚点。支持外部链接、下划线变体、工具提示，以及用于路由集成的自定义链接组件。用于页面之间或前往外部 URL 的导航。',
    bestPractices: [
      { guidance: true, description: '撰写描述性强、简洁的链接文本，清楚传达目标去向。' },
      { guidance: true, description: '当链接出现在行内文本之外时设置 `isStandalone`，使其获得正确的基础字号。' },
      { guidance: true, description: '把 Link 放进 <Text maxLines> 中，让它随周围文本一起截断；在被钳制的 Text 内，链接随文本的行排布。' },
      { guidance: true, description: '仅当链接内容不是描述性文本时（例如纯图标链接）才设置 `label`。对文本链接，可见文本已是无障碍名称；再加 `label` 会为屏幕阅读器覆盖它，是有害的。' },
      { guidance: false, description: '不要用 Link 执行不导航的操作；请改用 Button。' },
      { guidance: false, description: '不要使用"点击这里"或"阅读更多"之类的泛化文本；应描述目标去向。' },
      { guidance: false, description: '不要在文本链接上设置 `label`；`aria-label` 会阻止辅助技术读出真实链接内容。' },
      { guidance: false, description: '不要给被钳制 Text 内的 Link 单独设置 `display` 或 `maxLines`，或把它渲染成按钮（有 `onClick` 无 `href`）却指望外层钳制把它截断；该 Link 会保持自己的盒子。' },
      { guidance: false, description: '不要把含块级内容的 Link（例如带图标的 HStack）放进被钳制的 Text；块级内容会破坏钳制。只钳制纯文本 Link，或把组合而成的 Link 放到钳制之外。' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: '链接的可见文本。'},
      {name: 'Right icon', required: false, description: '位于标签之后的图标，提示可执行操作。'},
      {name: 'Left icon', required: false, description: '位于标签之前的图标，表达含义。'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Link',
  displayName: 'Link',
  theming: {
    targets: [
      {className: 'astryx-link', visualProps: ['color']},
    ],
  },
  components: [
    {
      name: 'Link',
      displayName: 'Link',
      description:
        '带有变体、外部链接支持和多态渲染的样式化锚点链接。',
      props: [
        {
          name: 'as',
          type: 'LinkComponentType',
          description: '用于替代 <a> 渲染的自定义组件',
        },
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签（aria-label）。仅在子内容不是描述性文本时使用（如纯图标链接）。文本链接请省略此项。',
        },
        {
          name: 'href',
          type: 'string',
          description: '链接目标 URL',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: '始终显示下划线',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用链接',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: '在新标签页中打开，带外部图标和安全 rel 标记',
          default: 'false',
        },
        {
          name: 'newTabLabel',
          type: 'string',
          description: '向屏幕阅读器announce外部链接将在新标签页打开的文本。可覆盖以本地化。',
          default: "'(opens in new tab)'",
        },
        {
          name: 'target',
          type: 'string',
          description:
            '链接文档的打开位置。target="_blank" 会自动添加 noopener noreferrer。',
        },
        {
          name: 'rel',
          type: 'string',
          description:
            '链接关系标记。target="_blank" 会自动合并 noopener noreferrer。',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: '点击事件处理器',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: '悬停时显示的工具提示文本',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: '应用基础字体大小',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '链接内容',
          required: true,
        },
      ],
    },
    {
      name: 'LinkProvider',
      isHiddenFromOverview: true,
      displayName: 'Link Provider',
      description:
        '为子树中所有 Astryx 链接组件设置默认链接组件的 Provider。',
      props: [
        {
          name: 'component',
          type: 'LinkComponentType',
          description: '用于所有链接元素的组件',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子树',
          required: true,
        },
      ],
    },
  ],
  usage: {
    description:
      'A styled anchor for inline and standalone text navigation. Supports external links, underline variants, tooltips, and custom link components for router integration. Use it for navigating between pages or to external URLs.',
    bestPractices: [
      { guidance: true, description: 'Write descriptive, concise link text that clearly communicates the destination.' },
      { guidance: true, description: 'Set `isStandalone` when the link appears outside of inline text, so it receives proper base font sizing.' },
      { guidance: true, description: 'Put a Link inside a <Text maxLines> to truncate it with the surrounding text; inside a clamped Text the link flows in the text\'s lines.' },
      { guidance: true, description: 'Only set `label` when the link content is not descriptive text (e.g. an icon-only link). For text links, the visible text is already the accessible name; adding `label` overrides it for screen readers, which is harmful.' },
      { guidance: false, description: 'Use Link for actions that do not navigate; use a Button instead.' },
      { guidance: false, description: 'Use generic text like "click here" or "read more"; describe the destination.' },
      { guidance: false, description: 'Set `label` on text links; `aria-label` prevents assistive technology from reading the actual link content.' },
      { guidance: false, description: 'Give a Link inside a clamped Text its own `display` or `maxLines`, or render it as a button (`onClick` with no `href`), and expect the outer clamp to cut it; that Link keeps its own box.' },
      { guidance: false, description: 'Put a Link with block-level content, such as an HStack with an icon, inside a clamped Text; block content breaks the clamp. Clamp a text-only Link, or place the composed Link outside the clamp.' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: 'The visible text of the link.'},
      {name: 'Right icon', required: false, description: 'Icon placed after the label to indicate an action affordance.'},
      {name: 'Left icon', required: false, description: 'Icon placed before the label to represent meaning.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '样式化锚点链接，带多种变体 + 多态链接基础设施，可接入自定义链接组件（Next.js Link、React Router Link 等）。',
  usage: {
    description:
      '用于行内与独立文本导航的样式化锚点。支持外部链接、下划线变体、工具提示，以及用于路由集成的自定义链接组件。用于页面之间或前往外部 URL 的导航。',
    bestPractices: [
      { guidance: true, description: '撰写描述性强、简洁的链接文本，清楚传达目标去向。' },
      { guidance: true, description: '当链接出现在行内文本之外时设置 `isStandalone`，使其获得正确的基础字号。' },
      { guidance: true, description: '把 Link 放进 <Text maxLines> 中，让它随周围文本一起截断；在被钳制的 Text 内，链接随文本的行排布。' },
      { guidance: true, description: '仅当链接内容不是描述性文本时（例如纯图标链接）才设置 `label`。对文本链接，可见文本已是无障碍名称；再加 `label` 会为屏幕阅读器覆盖它，是有害的。' },
      { guidance: false, description: '不要用 Link 执行不导航的操作；请改用 Button。' },
      { guidance: false, description: '不要使用"点击这里"或"阅读更多"之类的泛化文本；应描述目标去向。' },
      { guidance: false, description: '不要在文本链接上设置 `label`；`aria-label` 会阻止辅助技术读出真实链接内容。' },
      { guidance: false, description: '不要给被钳制 Text 内的 Link 单独设置 `display` 或 `maxLines`，或把它渲染成按钮（有 `onClick` 无 `href`）却指望外层钳制把它截断；该 Link 会保持自己的盒子。' },
      { guidance: false, description: '不要把含块级内容的 Link（例如带图标的 HStack）放进被钳制的 Text；块级内容会破坏钳制。只钳制纯文本 Link，或把组合而成的 Link 放到钳制之外。' },
    ],
    anatomy: [
      {name: 'Label', required: true, description: '链接的可见文本。'},
      {name: 'Right icon', required: false, description: '位于标签之后的图标，提示可执行操作。'},
      {name: 'Left icon', required: false, description: '位于标签之前的图标，表达含义。'},
    ],
  },
  components: [
    {
      name: 'Link',
      displayName: 'Link',
      description:
        '带变体、外部链接支持与多态渲染的样式化锚点链接。',
      propDescriptions: {
        as: '用于替代 <a> 渲染的自定义组件',
        label: '无障碍标签（aria-label）。仅用于非文本内容，如纯图标链接。',
        href: '链接目标 URL。共享规则在 scheme 归一化后，于所有 Astryx 接管的导航路径上拦截 javascript:、vbscript:、data:text/html。普通 URL、片段、安全的自定义 scheme 与被接受的下载保持不变。被拒绝 => 惰性渲染，不调用自定义路由器。无绕过 prop；调用方自担的例外渲染不在保证范围内。图片/资源策略单独管理。',
        hasUnderline: '始终显示下划线',
        isDisabled: '禁用链接',
        isExternalLink: '在新标签页中打开，带外部图标与安全 rel 标记',
        newTabLabel: '告知屏幕阅读器外部链接在新标签页打开的文本',
        target:
          '链接文档的打开位置。target="_blank" 自动添加 noopener noreferrer。',
        rel: '链接关系标记。target="_blank" 会合并 noopener noreferrer。',
        onClick: '点击事件处理器',
        tooltip: '悬停时显示的工具提示文本',
        isStandalone: '应用基础字体大小',
        children: '链接内容',
      },
    },
    {
      name: 'LinkProvider',
      isHiddenFromOverview: true,
      displayName: 'Link Provider',
      description:
        '为子树中所有 Astryx 链接设置默认链接组件的 Provider。',
      propDescriptions: {
        component: '用于所有链接元素的组件。通过的 href/to 遵循 Link href 规则；校验结构化字段（含 protocol），并保持对象同一性。任一被拒绝 => 惰性内容，不调用路由器，无回退。',
        children: '子树',
      },
    },
  ],
};
