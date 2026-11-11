// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentAnatomyElement[]} */
const anatomy = [
  {
    name: 'Outline',
    required: true,
    description:
      '承载同页标题链接与指示器的导航容器。',
  },
  {
    name: 'Heading link',
    required: true,
    description:
      '单个标题的锚点，按层级缩进并在激活时标记。',
  },
  {
    name: 'Label',
    required: true,
    description: '显示在标题链接内的标题文本。',
  },
  {
    name: 'Indicator track',
    required: true,
    description: '位于激活指示器背后的着色竖线。',
  },
  {
    name: 'Active indicator',
    required: true,
    description:
      '定位于当前激活标题链接旁边的滑动条。',
  },
];

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
  category: 'Navigation',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'heading navigation',
    'scroll spy',
    'documentation',
    'anchors',
    'sliding indicator',
    '大纲',
    '目录',
    '标题导航',
    '滚动监听',
  ],
  playground: {
    defaults: {
      items: [
        {id: 'overview', label: '概览', level: 2},
        {id: 'installation', label: '安装', level: 2},
        {id: 'configuration', label: '配置', level: 3},
        {id: 'api-reference', label: 'API 参考', level: 2},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-outline', visualProps: ['density']},
      {className: 'astryx-outline-indicator'},
      {
        className: 'astryx-outline-item',
        visualProps: ['level'],
        states: ['active'],
      },
    ],
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        '带滑动指示器轨道的文档大纲导航。把扁平标题列表渲染为锚点链接，支持密度变体，非受控时带滚动监听激活状态。',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            '有序标题项。每项含 id、label 与 level（1-6）。id 应与目标标题元素的 id 一致。',
          required: true,
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            '当前激活的标题 id。提供此 prop 后激活状态变为受控，并禁用内置滚动监听。',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description:
            '激活项因内置滚动监听或大纲链接点击而变化时调用。',
        },
        {
          name: 'label',
          type: 'string',
          description: 'nav 地标的无障碍标签。',
          default: "'Table of contents'",
        },
        {
          name: 'density',
          type: "'default' | 'compact'",
          description:
            "控制项内边距的密度变体。紧凑 UI 用 'compact'，标准间距用 'default'。",
          default: "'default'",
        },
        {
          name: 'onNavigateStart',
          type: '(id: string) => void',
          description:
            '导航开始时（滚动开始前）以项 id 调用。与 onNavigateEnd 搭配可在目标标题上实现到达效果（闪烁、描边、脉冲）。',
        },
        {
          name: 'onNavigateEnd',
          type: '(id: string) => void',
          description:
            '导航落定时以项 id 调用——平滑滚动停止时，或减弱动效使其变为瞬时跳转时。每次 onNavigateStart 恰好对应一次触发，包括用户中途打断滚动的情况，因此"导航中"状态绝不会泄漏。',
        },
        {
          name: 'offset',
          type: 'number',
          description:
            '覆盖滚动根顶部的固定顶栏高度（px）。以相同量位移激活线与滚动落点，使标题被激活的位置正是导航到它时的停留位置——落在顶栏下方，而非被顶栏遮住。它与每个标题自身的 scroll-margin-top 叠加（先顶栏，再其下方的留白），而非取代它。没有元素覆盖内容时保持 0，交给 scroll-margin-top 处理。',
          default: '0',
        },
        {
          name: 'scrollContainerRef',
          type: 'React.RefObject<HTMLElement | null>',
          description:
            '要跟踪的滚动容器，替代自动探测最近的可滚动祖先。当内容在分栏、弹窗或仪表板面板内滚动而非视口时使用。',
        },
        {
          name: 'hasScrollOnClick',
          type: 'boolean',
          description:
            '激活项时是否平滑滚动到它。设为 false 以自行接管滚动（虚拟化内容、路由）：Outline 仍更新激活项、hash 与导航回调，但不执行滚动。',
          default: 'true',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局定制的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],
      examples: [
        {
          label: '基础',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

const items = [
  {id: 'overview', label: 'Overview', level: 2},
  {id: 'installation', label: 'Installation', level: 2},
  {id: 'theming', label: 'Theming', level: 2},
  {id: 'tokens', label: 'Tokens', level: 3},
  {id: 'accessibility', label: 'Accessibility', level: 2},
];

// Uncontrolled: built-in scroll-spy tracks the topmost visible heading.
<Outline items={items} />;
`,
        },
        {
          label: '紧凑（density="compact"）',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

// Dense sidebars use the compact variant; the sliding indicator
// automatically matches the shorter item height.
<Outline items={items} density="compact" />;
`,
        },
        {
          label: '受控的激活分区',
          code: `
import {useState} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function ControlledOutline() {
  const [activeId, setActiveId] = useState('overview');

  // Providing activeId disables built-in scroll-spy; you own the active state.
  return (
    <Outline
      items={items}
      activeId={activeId}
      onActiveIdChange={setActiveId}
    />
  );
}
`,
        },
        {
          label: '从 markdown 生成条目',
          code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {createMarkdownHeadingLinks} from '@astryxdesign/core/Markdown/plugins';
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';

const markdownRootId = 'guide';
const plugins = [
  createMarkdownHeadingLinks({headingIdPrefix: markdownRootId}),
];

function MarkdownOutline({markdown, isStreaming}) {
  // Pass the same plugin entry and finality to Markdown and Outline. Nested
  // headings consume the shared depth-first sequence, while Outline continues
  // to return root headings only.
  const items = useOutlineFromMarkdown(markdown, {
    plugins,
    isFinal: !isStreaming,
  });
  return (
    <>
      <Markdown id={markdownRootId} plugins={plugins}>{markdown}</Markdown>
      <Outline items={items} />
    </>
  );
}
`,
        },
        {
          label: '限定滚动容器（分栏、弹窗、面板）',
          code: `
import {useRef} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function PanelDocs() {
  const scrollContainerRef = useRef(null);

  // Without scrollContainerRef the outline auto-detects the nearest scrollable
  // ancestor, which is the viewport here - so the highlight would never move.
  return (
    <div style={{display: 'flex'}}>
      <div ref={scrollContainerRef} style={{overflowY: 'auto', height: 480}}>
        <h2 id="overview">Overview</h2>
        {/* ...content... */}
      </div>
      <Outline items={items} scrollContainerRef={scrollContainerRef} offset={64} />
    </div>
  );
}
`,
        },
        {
          label: '导航回调（到达时闪烁标题）',
          code: `
import {useState} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function FlashOnArrival() {
  const [flashId, setFlashId] = useState(null);

  // onNavigateEnd fires once the smooth scroll settles - and once per
  // onNavigateStart even if the user scrolls away mid-jump, so this never
  // gets stuck.
  return (
    <Outline
      items={items}
      onNavigateStart={() => setFlashId(null)}
      onNavigateEnd={id => setFlashId(id)}
    />
  );
}
`,
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      '文档页、帮助中心、wiki 与长设置页的目录侧边栏。用于单页内导航，而非应用路由。带滑动指示器轨道，会动画到激活标题。每个链接都在正常 Tab 顺序中，Enter/Space 激活。',
    bestPractices: [
      {
        guidance: true,
        description:
          '传入扁平有序的标题列表，让 level 控制缩进。',
      },
      {
        guidance: true,
        description:
          '自定义滚动逻辑管理激活分区时，使用 activeId。',
      },
      {
        guidance: true,
        description:
          '垂直空间紧张的密集侧边栏使用 density="compact"。',
      },
      {
        guidance: true,
        description:
          '标题由内容生成时，使用 useOutlineFromMarkdown 或 useOutlineFromDOM。需要可链接的 Markdown 标题时，把同一个 createMarkdownHeadingLinks() 条目传给 Markdown 与 Outline；多个根时在该插件上配置 headingIdPrefix。',
      },
      {
        guidance: true,
        description:
          '内容在分栏、弹窗或面板内而非视口滚动时，传入 scrollContainerRef。',
      },
      {
        guidance: true,
        description:
          '把 offset 设为覆盖内容的固定顶栏高度，使标题落在顶栏下方而非被其遮住。',
      },
      {
        guidance: false,
        description:
          '不要用 Outline 做应用导航——路由请用 SideNav 或 TopNav。',
      },
      {
        guidance: false,
        description:
          '不要用 Outline 做可展开层级——节点需要展开折叠时请用 TreeList。',
      },
      {
        guidance: false,
        description:
          '不要把 onNavigateEnd 当作"已到达"——用户打断滚动时它也会触发。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
  theming: {
    targets: [
      {className: 'astryx-outline', visualProps: ['density']},
      {className: 'astryx-outline-indicator'},
      {
        className: 'astryx-outline-item',
        visualProps: ['level'],
        states: ['active'],
      },
    ],
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        '文档大纲导航，带有滑动指示器轨道。将扁平标题列表渲染为锚点链接，支持密度变体和非受控模式下的滚动监听。',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            '有序标题项。每项包含 id、label 和 level (1-6)。id 应匹配目标标题元素的 id。',
          required: true,
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            '当前激活的标题 id。提供后组件进入受控模式，并禁用内置滚动监听。',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description: '当内置滚动监听或点击大纲链接改变激活项时调用。',
        },
        {
          name: 'label',
          type: 'string',
          description: 'nav 地标的无障碍标签。',
          default: "'Table of contents'",
        },
        {
          name: 'density',
          type: "'default' | 'compact'",
          description:
            "控制项目内边距的密度变体。'compact' 用于紧凑界面，'default' 为标准间距。",
          default: "'default'",
        },
        {
          name: 'onNavigateStart',
          type: '(id: string) => void',
          description:
            '导航开始时（滚动前）调用，传入项目 id。与 onNavigateEnd 搭配可在目标标题上实现到达效果（闪烁、描边、脉冲）。',
        },
        {
          name: 'onNavigateEnd',
          type: '(id: string) => void',
          description:
            '导航结束时调用（平滑滚动停止，或减弱动效将其变为瞬时跳转）。每次 onNavigateStart 必定对应一次调用，包括用户中途手动滚动打断的情况，因此“导航中”状态不会泄漏。',
        },
        {
          name: 'offset',
          type: 'number',
          description:
            '覆盖滚动根顶部的固定顶栏高度（px）。同时位移激活线与滚动落点，因此标题被激活的位置正是点击后停留的位置——落在顶栏下方，而非被顶栏遮住。它与每个标题自身的 scroll-margin-top 叠加（先顶栏，再留白），而非取代它。若没有元素覆盖内容，保持 0，交给 scroll-margin-top 处理。',
          default: '0',
        },
        {
          name: 'scrollContainerRef',
          type: 'React.RefObject<HTMLElement | null>',
          description:
            '要跟踪的滚动容器，替代自动探测最近的可滚动祖先。当内容在分栏、弹窗或面板中滚动而非视口时使用。',
        },
        {
          name: 'hasScrollOnClick',
          type: 'boolean',
          description:
            '激活项目时是否平滑滚动。设为 false 可自行接管滚动（虚拟列表、路由）：Outline 仍会更新激活项、hash 和导航回调，但不执行滚动。',
          default: 'true',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
        },
      ],
    },
  ],
  usage: {
    anatomy,
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass a flat ordered list of headings and let level control indentation.',
      },
      {
        guidance: true,
        description:
          'Use activeId when custom scroll logic owns the active section.',
      },
      {
        guidance: true,
        description:
          'Use density="compact" in dense sidebars where vertical space is tight.',
      },
      {
        guidance: true,
        description:
          'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content. For linkable Markdown headings, pass the same createMarkdownHeadingLinks() entry to Markdown and Outline; configure headingIdPrefix on that plugin for multiple roots.',
      },
      {
        guidance: false,
        description:
          'Use Outline for application navigation - use SideNav or TopNav for routes.',
      },
      {
        guidance: false,
        description:
          'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '带滑动指示器轨道的文档大纲/目录导航。扁平 items 数组 {id,label,level}；锚点链接；密度变体（default/compact）；非受控时按滚动位置监听（越过静止线的最后一个标题 = offset + 其自身 scroll-margin-top；首项在顶部，末项在底部）；用 activeId 受控；点击平滑滚动并把激活项钉住，直到下一次手动滚动。每个链接是 Tab 停留点；Enter/Space 激活；无方向键/Home/End 移动。onNavigateStart/onNavigateEnd 在滚动前后触发。滚动范围经 offset / scrollContainerRef / hasScrollOnClick 控制。',
  usage: {
    anatomy,
    description:
      '文档页、帮助中心、wiki 与长设置页的目录侧边栏。用于单页内导航，而非应用路由。',
    bestPractices: [
      {
        guidance: true,
        description:
          '传入扁平有序的标题列表，让 level 控制缩进。',
      },
      {
        guidance: true,
        description:
          '自定义滚动逻辑管理激活分区时，使用 activeId。',
      },
      {
        guidance: true,
        description:
          '垂直空间紧张的密集侧边栏使用 density="compact"。',
      },
      {
        guidance: true,
        description:
          '标题由内容生成时，使用 useOutlineFromMarkdown 或 useOutlineFromDOM。需要可链接的 Markdown 标题时，把同一个 createMarkdownHeadingLinks() 条目传给 Markdown 与 Outline；多个根时在该插件上配置 headingIdPrefix。',
      },
      {
        guidance: true,
        description:
          '内容在分栏、弹窗或面板内而非视口滚动时，传入 scrollContainerRef。',
      },
      {
        guidance: true,
        description:
          '把 offset 设为覆盖内容的固定顶栏高度，使标题落在顶栏下方而非被其遮住。',
      },
      {
        guidance: false,
        description:
          '不要用 Outline 做应用导航——路由请用 SideNav 或 TopNav。',
      },
      {
        guidance: false,
        description:
          '不要用 Outline 做可展开层级——节点需要展开折叠时请用 TreeList。',
      },
      {
        guidance: false,
        description:
          '不要把 onNavigateEnd 当作"已到达"——用户打断滚动时它也会触发。',
      },
    ],
  },
  propDescriptions: {
    items:
      '有序 OutlineItem[]：{id,label,level}。id 应匹配目标标题的 DOM id。',
    activeId: '受控的激活标题 id。禁用内置滚动监听。',
    onActiveIdChange: '激活 id 因滚动监听或点击而变化时调用。',
    label: 'nav 的无障碍标签。默认：Table of contents。',
    density:
      "密度变体：'default'（标准）或 'compact'。默认：'default'。",
    onNavigateStart:
      '导航开始时（滚动前）以 id 调用。',
    onNavigateEnd:
      '滚动落定时以 id 调用。每次 onNavigateStart 恰好触发一次，包括用户打断的情况。',
    offset:
      '覆盖滚动根的固定顶栏高度（px）。同时位移激活线与滚动落点，使标题激活的位置正是导航落点。与每个标题的 scroll-margin-top 叠加（不取代）。默认：0。',
    scrollContainerRef:
      '要跟踪的滚动容器 RefObject，替代最近的可滚动祖先。用于分栏、弹窗、面板。',
    hasScrollOnClick:
      '激活项时是否平滑滚动。false = 自行接管滚动；激活 id、hash 与回调仍更新。默认：true。',
    xstyle: '布局用的 StyleX 样式。必须是 stylex.create() 值。',
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        '带滑动指示器的文档大纲导航。渲染标题锚点，带密度变体、正常 Tab 顺序的链接、导航回调，以及非受控时的滚动监听激活状态。',
      propDescriptions: {
        items:
          '有序 OutlineItem[]：{id,label,level}。id 应匹配目标标题的 DOM id。',
        activeId: '受控的激活标题 id。禁用内置滚动监听。',
        onActiveIdChange:
          '激活 id 因滚动监听或点击而变化时调用。',
        label: 'nav 的无障碍标签。默认：Table of contents。',
        density: "密度变体：'default' | 'compact'。默认：'default'。",
        onNavigateStart:
          '导航开始时（滚动前）以 id 调用。',
        onNavigateEnd:
          '滚动落定时以 id 调用。每次 onNavigateStart 恰好触发一次，包括用户打断的情况。',
        offset:
          '覆盖滚动根的固定顶栏高度（px）。同时位移激活线与滚动落点。与 scroll-margin-top 叠加。默认：0。',
        scrollContainerRef:
          '要跟踪的滚动容器 RefObject，替代最近的可滚动祖先。',
        hasScrollOnClick:
          '激活项时是否平滑滚动。默认：true。',
        xstyle: '布局用的 StyleX 样式。必须是 stylex.create() 值。',
      },
    },
  ],
};
