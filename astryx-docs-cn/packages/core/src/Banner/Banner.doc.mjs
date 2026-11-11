// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Banner',
  displayName: 'Banner',
  category: 'Feedback & Status',
  keywords: ["banner","警告","通知","提示","公告","状态","消息","信息","警示","错误","成功","toast"],
  usage: {
    description:
      'Banner 在页面或区块顶部显示持久消息。用于表单错误、系统更新、维护公告，或需要用户看到并处理前的成功确认。',
    bestPractices: [
      {guidance: true, description: '选择与消息匹配的状态：info 用于更新，warning 用于警示，error 用于问题，success 用于确认。'},
      {guidance: true, description: '页面内容内使用 card 容器；横跨整页的全宽消息使用 section 容器。'},
      {guidance: true, description: 'info 与 success 横幅可关闭。error 横幅保持可见，直到用户解决问题。'},
      {guidance: true, description: '标题要短且易扫读："Payment failed"，而不是 "There was a problem processing your most recent payment"。'},
      {guidance: false, description: '不要用 Banner 展示会自行消失的短消息；应改用 Toast。'},
      {guidance: false, description: '不要堆叠多个相同状态的横幅；把相关消息合并为一条横幅。'},
      {guidance: true, description: '当用户需要内容才能处理消息时（如校验失败的字段列表），设置 collapsible={false}。细节长到会淹没横幅本身消息时，保留默认折叠开关。'},
      {guidance: true, description: 'Banner 的 status 仅控制颜色和图标，不创建实时区域。异步结果应在实际的状态转换处理函数中调用 useAnnounce 播报。仅当消息紧急、用户必须立即处理时才传入 role="alert"：Banner 会把它放在标题和描述上，因此控件、endContent 和补充内容不会作为警报的一部分被朗读。不要再用 useAnnounce 重复播报同一条消息。'},
      {guidance: false, description: '不要只靠状态颜色或图标传达含义；在标题文本中说明状态，因为对屏幕阅读器而言图标只是装饰。'},
    ],
    anatomy: [
      {name: 'Banner frame', required: true, description: '将状态表面与可选内容表面组合在一起的外框。承载整个横幅的层级（elevation）；对带层级的 card 横幅，还承载勾勒其轮廓的圆角。'},
      {name: 'Status surface', required: true, description: '主着色表面。传达状态，并包含图标、标题、描述、操作与控件。'},
      {name: 'Icon', required: true, description: '根据状态（info、warning、error、success）自动设置。'},
      {name: 'Title', required: true, description: '主消息。始终必填。'},
      {name: 'Description', required: false, description: '标题下方的补充细节。'},
      {name: 'Action button', required: false, description: '供用户处理消息的按钮，如 "Review" 或 "Retry"。'},
      {name: 'Dismiss button', required: false, description: '让用户关闭横幅。通过设置 isDismissable 启用。'},
      {name: 'Content surface', required: false, description: '状态表面下方承载额外细节的次级表面，如错误列表。默认位于展开/折叠开关之后；设置 collapsible={false} 可使其始终可见。'},
    ],
  },

  examples: [
    {
      label: '在状态转换处理函数中播报异步结果',
      code: `import {useState} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {useAnnounce} from '@astryxdesign/core/hooks';

function SaveSettings() {
  const announce = useAnnounce();
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  async function handleSave() {
    try {
      await saveSettings();
      setResult('success');
      announce('Settings saved');
    } catch {
      setResult('error');
      announce('Settings could not be saved');
    }
  }

  return (
    <>
      <Button label="Save settings" onClick={handleSave} />
      {result != null ? (
        <Banner
          status={result}
          title={result === 'success' ? 'Settings saved' : 'Save failed'}
        />
      ) : null}
    </>
  );
}`,
    },
  ],

  props: [
    {
      name: 'status',
      type: "'info' | 'warning' | 'error' | 'success'",
      description: '状态类型，控制图标和颜色。',
      required: true,
    },
    {
      name: 'title',
      type: 'ReactNode',
      description: '显示在头部的标题文本或 ReactNode。',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: '渲染在头部标题下方的描述文本。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: '覆盖默认的状态图标。',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDismissable',
      type: 'boolean',
      description: '横幅是否可被用户关闭。',
      default: 'false',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        '点击关闭按钮时调用；无论是否提供此回调，横幅都会自动隐藏。',
    },
    {
      name: 'dismissLabel',
      type: 'string',
      description:
        '关闭按钮的无障碍名称和可见工具提示（请传入已翻译的字符串）。字符串标题默认生成 "Dismiss <title>"，让堆叠的横幅可区分；标题为 ReactNode 时请设置此项。',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        '渲染在头部区域末端对齐的操作内容。头部过窄容纳不下两者时，会换行到文本下方自成一行。',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'container',
      type: "'card' | 'section'",
      description:
        '容器类型：card 带圆角；section 全宽无圆角，适用于页面级场景。',
      default: "'card'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        '静止阴影深度。用于悬浮于内容之上的浮动横幅；`none` 为默认内联横幅。`card` 容器的横幅会让阴影随圆角变化。',
      default: "'none'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '渲染在彩色头部下方卡片背景区域的内容。默认位于展开/折叠开关之后，除非设置 `collapsible={false}`。',
    },
    {
      name: 'collapsible',
      type: 'boolean | {defaultIsOpen?: boolean; isOpen?: boolean; onOpenChange?: (isOpen: boolean) => void}',
      description:
        '内容区域（children）是否位于头部的展开/折叠开关之后。默认开启，且初始为折叠状态。`false` 表示退出：内容始终可见且没有开关。`{defaultIsOpen: true}` 表示初始展开；`{isOpen, onOpenChange}` 为受控模式。与 Collapsible 使用同一套 CollapsibleConfig。',
      default: 'true',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],

  playground: {
    defaults: {
      title: '系统维护已排期',
      description: '平台将于周日 PST 凌晨 2–4 点短暂不可用。',
      status: 'info',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-banner-frame', visualProps: ['container', 'elevation']},
      {className: 'astryx-banner', visualProps: ['container', 'status']},
      {className: 'astryx-banner-icon', visualProps: ['status']},
      {className: 'astryx-banner-description'},
      {className: 'astryx-banner-content', visualProps: ['container', 'status']},
    ],
    vars: [
      {name: '--_banner-radius', description: 'card 容器的圆角（头部、内容区域与带层级根元素轮廓）', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_banner-radius']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docsZh = {
  name: 'Banner',
  displayName: 'Banner',
  usage: {
    description:
      'Banner 在页面或区块顶部显示持久消息。用于表单错误、系统更新、维护公告，或需要用户看到并处理前的成功确认。',
    bestPractices: [
      {guidance: true, description: '选择与消息匹配的状态：info 用于更新，warning 用于警示，error 用于问题，success 用于确认。'},
      {guidance: true, description: '页面内容内使用 card 容器；横跨整页的全宽消息使用 section 容器。'},
      {guidance: true, description: 'info 与 success 横幅可关闭。error 横幅保持可见，直到用户解决问题。'},
      {guidance: true, description: '标题要短且易扫读："Payment failed"，而不是 "There was a problem processing your most recent payment"。'},
      {guidance: false, description: '不要用 Banner 展示会自行消失的短消息；应改用 Toast。'},
      {guidance: false, description: '不要堆叠多个相同状态的横幅；把相关消息合并为一条横幅。'},
      {guidance: true, description: 'Banner 的 status 仅控制颜色和图标，不创建实时区域。异步结果应在实际的状态转换处理函数中调用 useAnnounce。仅当消息紧急、用户必须立即处理时才传入 role="alert"：Banner 会把它放在标题和描述上，因此控件、endContent 和补充内容不会作为警报的一部分被朗读。不要再用 useAnnounce 重复播报同一条消息。'},
      {guidance: false, description: '不要只依赖 status 的颜色或图标传达含义；请在标题文本中明确说明状态，因为屏幕阅读器会忽略这个装饰性图标。'},
    ],
    anatomy: [
      {name: 'Banner frame', required: true, description: '将状态表面与可选内容表面组合在一起的外框。承载整个横幅的层级（elevation）；对带层级的 card 横幅，还承载勾勒其轮廓的圆角。'},
      {name: 'Status surface', required: true, description: '主着色表面。传达状态，并包含图标、标题、描述、操作与控件。'},
      {name: 'Icon', required: true, description: '根据状态（info、warning、error、success）自动设置。'},
      {name: 'Title', required: true, description: '主消息。始终必填。'},
      {name: 'Description', required: false, description: '标题下方的补充细节。'},
      {name: 'Action button', required: false, description: '供用户处理消息的按钮，如 "Review" 或 "Retry"。'},
      {name: 'Dismiss button', required: false, description: '让用户关闭横幅。通过设置 isDismissable 启用。'},
      {name: 'Content surface', required: false, description: '状态表面下方承载额外细节的次级表面，如错误列表。默认位于展开/折叠开关之后；设置 collapsible={false} 可使其始终可见。'},
    ],
  },
  props: [
    {name: 'status', type: "'info' | 'warning' | 'error' | 'success'", description: '状态类型，控制图标和颜色。', required: true},
    {name: 'title', type: 'ReactNode', description: '显示在头部的标题文本或 ReactNode。', required: true},
    {name: 'description', type: 'ReactNode', description: '渲染在头部标题下方的描述文本。'},
    {name: 'icon', type: 'ReactNode', description: '覆盖默认的状态图标。'},
    {name: 'isDismissable', type: 'boolean', description: '横幅是否可被用户关闭。', default: 'false'},
    {name: 'onDismiss', type: '() => void', description: '点击关闭按钮时调用；无论是否提供此回调，横幅都会自动隐藏。'},
    {name: 'dismissLabel', type: 'string', description: '关闭按钮的无障碍名称和可见工具提示（请传入已翻译的字符串）。字符串标题默认生成“关闭 <标题>”；富文本标题请设置此属性。'},
    {name: 'endContent', type: 'ReactNode', description: '渲染在头部区域末端对齐的操作内容，通常是按钮或链接。头部过窄时会整体换行到文本下方，自成一行。'},
    {name: 'container', type: "'card' | 'section'", description: '视觉变体：card 带圆角；section 无圆角全宽，适用于页面级场景。', default: "'card'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: '静止阴影深度。用于悬浮于内容之上的浮动横幅；none 为默认内联横幅。', default: "'none'"},
    {name: 'children', type: 'ReactNode', description: '渲染在彩色头部下方卡片背景区域的内容。默认位于展开/折叠开关之后，除非设置 collapsible={false}。'},
    {name: 'collapsible', type: 'boolean | {defaultIsOpen?: boolean; isOpen?: boolean; onOpenChange?: (isOpen: boolean) => void}', description: '内容区域（children）是否位于头部的展开/折叠开关之后。默认开启，且初始为折叠状态。false 表示关闭：内容始终可见且没有开关。{defaultIsOpen: true} 表示初始展开；{isOpen, onOpenChange} 为受控模式。与 Collapsible 使用同一套 CollapsibleConfig。', default: 'true'},
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局自定义的 StyleX 样式（外边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-banner-frame',
        visualProps: [
          'container',
          'elevation',
        ],
      },
      {
        className: 'astryx-banner',
        visualProps: [
          'container',
          'status',
        ],
      },
      {
        className: 'astryx-banner-icon',
        visualProps: [
          'status',
        ],
      },
      {
        className: 'astryx-banner-description',
      },
      {
        className: 'astryx-banner-content',
        visualProps: [
          'container',
          'status',
        ],
      },
    ],
    vars: [
      {name: '--_banner-radius', description: 'card 容器的圆角（头部、内容区域与带层级根元素轮廓）', default: 'var(--radius-container)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_banner-radius']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: '错误、更新、警告或确认的持久消息',
  usage: {
    description:
      'Banner 在页面或区块顶部显示持久消息。用于表单错误、系统更新、维护公告或成功确认。',
    bestPractices: [
      {guidance: true, description: '状态匹配消息：info 更新，warning 警示，error 问题，success 确认。'},
      {guidance: true, description: '内联内容用 card 容器，全宽页面级消息用 section 容器。'},
      {guidance: true, description: 'info/success 可关闭；error 横幅保留到问题解决。'},
      {guidance: true, description: '标题要短："Payment failed"，而非 "There was a problem processing your payment"。'},
      {guidance: false, description: '不要用于自动消失的消息；改用 Toast。'},
      {guidance: false, description: '不要堆叠同状态横幅；合并为一条。'},
      {guidance: true, description: 'status 只控制颜色 + 图标；Banner 默认非实时区域。异步结果在转换处理函数中用 useAnnounce 播报。role="alert" 仅用于紧急消息；它落在标题 + 描述上，不含控件或内容。两者不可并用。'},
      {guidance: false, description: '不要只靠状态颜色或图标；在标题文本中说明状态，因为图标对屏幕阅读器只是装饰。'},
    ],
    anatomy: [
      {name: 'Banner frame', required: true, description: '组合状态与可选内容表面的外框；负责整条横幅的层级及带层级 card 的轮廓。'},
      {name: 'Status surface', required: true, description: '传达状态并包含消息与控件的主着色表面。'},
      {name: 'Icon', required: true, description: '由状态自动设置。'},
      {name: 'Title', required: true, description: '主消息文本。'},
      {name: 'Description', required: false, description: '标题下方的细节。'},
      {name: 'Action button', required: false, description: '行动号召按钮，如 Review 或 Retry。'},
      {name: 'Dismiss button', required: false, description: '通过 isDismissable 启用的关闭按钮。'},
      {name: 'Content surface', required: false, description: '次级细节表面；默认在开关之后，除非设置 collapsible={false}。'},
    ],
  },
  propDescriptions: {
    status: '控制图标 + 颜色',
    title: '头部的标题文本/ReactNode',
    description: '头部标题下方的文本',
    icon: '覆盖默认状态图标',
    isDismissable: '用户可关闭横幅',
    onDismiss: '关闭回调；无论是否提供横幅都会自行隐藏',
    dismissLabel:
      '关闭按钮的无障碍名称 + 可见工具提示；默认为 "Dismiss <title>"',
    endContent: '头部末端对齐的操作内容，通常为按钮/链接；头部过窄时换行自成一行',
    container: 'card=带圆角；section=全宽无圆角，页面级使用',
    elevation: '静止阴影深度：none|low|med|high；浮动横幅可调高',
    children: '彩色头部下方卡片背景区域的内容；默认在开关之后，除非 collapsible={false}',
    collapsible: 'children 位于头部开关之后；默认 true=折叠。false=始终可见、无开关。{defaultIsOpen:true}=初始展开，{isOpen,onOpenChange}=受控',
    xstyle: '通过 stylex.create() 自定义 StyleX 布局',
  },
};
