// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Tab',
  subComponentOf: 'TabList',
  displayName: 'Tab',
  isHiddenFromOverview: true,
  description:
    '单个标签项，渲染为按钮或锚点链接，具有选中状态样式和可选图标。',
  // Tab requires TabList context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'tab-1', label: '标签'},
    wrapper: {component: 'TabList', props: {value: 'tab-1'}},
  },
  examples: [
    {
      label: '用一条色带贯穿整个标签下划线',
      code: `import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {appTheme} from './theme';

// Without a nested Theme, the selected indicator spans the tab's content and
// stops at its inline padding. An editor-style strip can run it edge to edge by restyling
// the tab-indicator target in a nested Theme. Only this strip changes: every
// other TabList keeps the app theme's indicator. insetInline is not a
// guaranteed property of the tab-indicator target, so treat this override as
// best effort across releases.
const fullWidthIndicatorTheme = defineTheme({
  name: 'full-width-tab-indicator',
  extends: appTheme,
  components: {
    'tab-indicator': {
      base: {insetInline: '0'},
    },
  },
});

// An open-files bar switches views, so it uses TabList's navigation pattern
// (no role="tablist"). The nested Theme takes the app's color mode.
function EditorTabs() {
  const {mode} = useTheme();
  return (
    <Theme theme={fullWidthIndicatorTheme} mode={mode}>
      <TabList value="app" onChange={() => {}} aria-label="Open files" size="sm" hasDivider>
        <Tab value="app" label="App.tsx" />
        <Tab value="styles" label="styles.css" />
      </TabList>
    </Theme>
  );
}`,
    },
    {
      label: '用帮助文本说明标签',
      code: `import {useRef, useState} from 'react';
import {Icon} from '@astryxdesign/core/Icon';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// The tab is one button, so its help text is a Tooltip anchored on the Tab
// through its ref, not a second button inside it. The tooltip describes the
// tab itself. Render it after the TabList: the strip holds only tabs. The
// info glyph in endContent is decorative.
function SettingsTabs() {
  const [value, setValue] = useState('general');
  const generalRef = useRef(null);
  return (
    <>
      <TabList value={value} onChange={setValue} role="tablist" aria-label="Settings">
        <Tab
          ref={generalRef}
          value="general"
          label="General"
          panelId="panel-general"
          endContent={<Icon icon="info" size="sm" />}
        />
        <Tab value="advanced" label="Advanced" panelId="panel-advanced" />
      </TabList>
      <Tooltip
        content="Name, language, and time zone for this workspace."
        anchorRef={generalRef}
      />
      <div id="panel-general" role="tabpanel" hidden={value !== 'general'}>
        …
      </div>
      <div id="panel-advanced" role="tabpanel" hidden={value !== 'advanced'}>
        …
      </div>
    </>
  );
}`,
    },
  ],
  props: [
    {
      name: 'value',
      type: 'string',
      description:
        '此标签的唯一值，与 TabListContext.value 进行匹配。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '此标签的无障碍标签。默认作为可见文本使用；当 isLabelHidden 为 true 时用作 aria-label。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '是否在视觉上隐藏标签。为 true 时，仅显示图标和 endContent，并将 label 用作无障碍 aria-label。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description:
        '要导航到的 URL；提供时，标签渲染为锚点元素。在显式给定 role="tablist" 的 TabList 中被忽略。',
    },
    {
      name: 'panelId',
      type: 'string',
      description:
        '此标签所控面板的 id，在 TabList 采用 tabs 模式时接为 aria-controls。把同一 id 放在面板元素上。导航模式下无效，并会给出开发警告。',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description:
        '链接标签中替代 <a> 渲染的自定义组件。覆盖 LinkProvider 的默认值。仅在提供 href 时生效。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '标签未选中时显示的图标元素。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'selectedIcon',
      type: 'ReactNode',
      description:
        '标签选中时显示的图标元素；未提供时回退到 icon。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'checkCircle',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签文本之后渲染的内容，例如徽章计数或状态点。标签本身是一个按钮，因此 endContent 只能放非交互内容：不能放按钮、链接、InfoTip 或其他可聚焦控件。要说明一个标签，请通过 ref 把 Tooltip 锚定在 Tab 上，把它渲染在 TabList 之后，并在这里放一个装饰性的信息 Icon。',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值：而非 style={{}} 之类的内联样式对象。',
    },
  ],
};

export const docsZh = {
  name: 'Tab',
  isHiddenFromOverview: true,
  displayName: 'Tab',
  description: '单个标签项，渲染为按钮或锚点链接，具有选中状态样式和可选图标。',
  props: [
    {
      name: 'value',
      type: 'string',
      description: '此标签的唯一值，与 TabListContext.value 进行匹配。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '此标签的无障碍标签。默认作为可见文本使用；当 isLabelHidden 为 true 时用作 aria-label。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        '是否在视觉上隐藏标签。为 true 时，仅显示图标和 endContent，并将 label 用作无障碍 aria-label。',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: '要导航到的 URL；提供时，标签渲染为锚点元素。',
    },
    {
      name: 'panelId',
      type: 'string',
      description:
        'Id of the panel this tab controls, wired up as aria-controls where the TabList speaks the tabs pattern. Put the same id on the panel element. No effect under the navigation pattern, and a development warning says so.',
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description:
        '用于替代 <a> 渲染链接标签的自定义组件。覆盖 LinkProvider 的默认值。仅在提供 href 时生效。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '标签未选中时显示的图标元素。',
    },
    {
      name: 'selectedIcon',
      type: 'ReactNode',
      description: '标签选中时显示的图标元素；未提供时回退到 icon。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '在标签文本之后渲染的内容，例如徽章计数或状态点。标签本身是一个按钮，因此 endContent 只能放非交互内容：不能放按钮、链接、InfoTip 或其他可聚焦控件。要说明一个标签，请通过 ref 把 Tooltip 锚定在 Tab 上，把它渲染在 TabList 之后，并在这里放一个装饰性的信息 Icon。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX 样式，用于布局自定义（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
};

export const docsDense = {
  name: 'Tab',
  isHiddenFromOverview: true,
  displayName: 'Tab',
  description:
    '单个标签项；渲染为按钮或锚点，带选中状态样式 + 可选图标。',
  propDescriptions: {
    value: '与 TabListContext.value 匹配的唯一值。',
    label:
      '无障碍标签；默认可见，isLabelHidden 时用作 aria-label。',
    isLabelHidden:
      '为纯图标标签在视觉上隐藏标签；label 改用作 aria-label。',
    href: 'URL；提供时渲染为 <a>。',
    as: '覆盖 LinkProvider 的自定义链接组件；仅在有 href 时生效。',
    icon: '未选中时显示的图标。',
    selectedIcon: '选中时显示的图标；回退到 icon。',
    endContent:
      '标签后的非交互内容（徽章、状态点）。不放可聚焦控件：说明标签请用锚定在 Tab 上的 Tooltip（anchorRef、渲染在 TabList 之后）+ 这里的装饰性信息 Icon。',
    xstyle:
      '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值，而非内联样式。',
  },
};
