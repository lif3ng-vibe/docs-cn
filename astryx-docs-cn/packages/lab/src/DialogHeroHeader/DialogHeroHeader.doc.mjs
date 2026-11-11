// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file DialogHeroHeader.doc.mjs
 * @input DialogHeroHeader props and Dialog composition
 * @output Consumer documentation for the canary-only hero header
 * @position Lab component documentation consumed by the CLI and docsite
 */

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DialogHeroHeader',
  displayName: 'Dialog Hero Header',
  import: '@astryxdesign/lab',
  group: 'DialogHeroHeader',
  category: 'Overlay',
  keywords: [
    '对话框',
    'dialog',
    'modal',
    '模态',
    '头部',
    'hero',
    '媒体',
    '图片',
    '插画',
    '引导',
    'onboarding',
    '营销',
    '精选',
    '关闭按钮',
    '标题',
    'DialogHeroHeader',
  ],
  description:
    'Dialog 的实验性 hero 风格头部，自 @astryxdesign/lab@canary 起可用：标题上方提供通栏媒体插槽，关闭按钮叠加在媒体之上。DialogHeader 的高强调姊妹组件，适用于精选、营销或引导类对话框。',
  props: [
    {
      name: 'title',
      type: 'string | ReactElement',
      description:
        'Dialog 的标题。字符串会被包进二级 Heading（与 DialogHeader 一致）；传入已设置样式的 Heading 元素可自定义呈现方式。除非 Dialog 已有显式标签，否则会通过 aria-labelledby 为父级 Dialog 提供无障碍标签。可见标题是默认的初始焦点目标；其他符合条件的后代自动聚焦请求优先。自定义 Heading 会在其自身元素上接收标签与焦点；若它设置了自身 id，请用 aria-labelledby 为 Dialog 命名。',
      required: true,
    },
    {
      name: 'media',
      type: 'ReactNode',
      description:
        '渲染在标题上方的通栏视觉内容（图片、插画或图标）。会延伸到对话框的内边距边缘；关闭按钮叠加在其尾部上角。请自行调整媒体尺寸（如 width 100%）以填满插槽。',
      required: true,
    },
    {
      name: 'mediaMode',
      type: "'light' | 'dark'",
      description:
        "媒体表面的明暗度。底层组合了 MediaTheme，叠加在媒体上的内容（关闭按钮）会采用对比度安全的反转令牌：'dark' 媒体使用浅色叠加内容，'light' 媒体使用深色。省略则沿用当前主题令牌。",
    },
    {
      name: 'isTitleHidden',
      type: 'boolean',
      description:
        '在视觉上隐藏标题行，同时保留其对屏幕阅读器可见，使对话框仍由标题命名。',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description:
        '放置在标题之前的内容（如图标），与标题同行显示。',
    },
    {
      name: 'maxLines',
      type: 'number',
      description:
        '标题截断并显示省略号前的最大行数。仅当 title 为字符串时生效（会自动包进 Heading）。',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => unknown',
      description:
        '关闭按钮的回调，点击关闭按钮时以 false 调用。未提供则不渲染关闭按钮。与 DialogHeader 的契约相同。',
    },
    {
      name: 'hasDivider',
      type: 'boolean',
      description:
        '在底边添加主题化边框。默认取父级 Layout 的 defaultHasDividers 上下文值。',
    },
  ],
  usage: {
    description:
      '像 DialogHeader 一样放入 Dialog 内 Layout 的 header 插槽。当对话框呈现精选、营销或引导场景，紧凑的 DialogHeader 不够醒目时使用。媒体自动延伸到对话框边缘，关闭按钮浮动在媒体的尾部上角。可见标题是默认的初始焦点目标；内联预览不会移动焦点。安装 @astryxdesign/lab@canary 和 @astryxdesign/core@canary，并导入两个包的 CSS。Lab API 可能在 canary 版本之间变化。',
    bestPractices: [
      {
        guidance: true,
        description:
          '让 mediaMode 与媒体的明暗匹配，保证叠加的关闭按钮清晰可读：深色图片需要 mediaMode="dark"。',
      },
      {
        guidance: true,
        description:
          '让媒体内容填满插槽（图片用 width 100%）；插槽本身只负责定位和延伸。',
      },
      {
        guidance: true,
        description:
          '操作按钮（CTA）放在 LayoutFooter；hero 头部不提供操作插槽。',
      },
      {
        guidance: true,
        description:
          '当媒体已经在视觉上传达信息时使用 isTitleHidden；标题仍会为屏幕阅读器命名对话框。',
      },
      {
        guidance: false,
        description: '不要用于常规确认或表单；请改用紧凑的 DialogHeader。',
      },
      {
        guidance: false,
        description:
          '不要传入没有空 alt 的装饰性媒体：纯装饰图片请使用 alt=""，让屏幕阅读器跳过。',
      },
    ],
  },
  examples: [
    {
      label: '引导对话框',
      code: `import {DialogHeroHeader} from '@astryxdesign/lab';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/lab/lab.css';

const [isOpen, setIsOpen] = useState(true);
<Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
  <Layout
    header={
      <DialogHeroHeader
        title="Welcome aboard"
        media={<img src={heroImage} alt="" width="100%" />}
        mediaMode="dark"
        onOpenChange={setIsOpen}
      />
    }
    content={<LayoutContent>Get started in three steps.</LayoutContent>}
    footer={
      <LayoutFooter hasDivider>
        <Button label="Get started" variant="primary" />
      </LayoutFooter>
    }
  />
</Dialog>`,
    },
    {
      label: '隐藏标题（由媒体传达信息）',
      code: `<DialogHeroHeader
  title="Product tour"
  media={<AnnouncementIllustration />}
  isTitleHidden
  onOpenChange={setIsOpen}
/>`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      '像 DialogHeader 一样放入 Dialog 内 Layout 的 header 插槽。当对话框呈现精选、营销或引导场景，紧凑的 DialogHeader 不够醒目时使用。媒体自动延伸到对话框边缘，关闭按钮浮动在媒体的尾部上角。可见标题是默认的初始焦点目标；内联预览不会移动焦点。安装 @astryxdesign/lab@canary 和 @astryxdesign/core@canary，并导入两个包的 CSS。Lab API 可能在 canary 版本之间变化。',
    bestPractices: [
      {
        guidance: true,
        description:
          '让 mediaMode 与媒体的明暗匹配，保证浮动关闭按钮清晰可读：深色图片需要 mediaMode="dark"。',
      },
      {
        guidance: true,
        description:
          '让媒体内容填满插槽（图片用 width 100%）；插槽本身只负责定位和延伸。',
      },
      {
        guidance: true,
        description:
          '操作按钮（CTA）放在 LayoutFooter；hero 头部不提供操作插槽。',
      },
      {
        guidance: true,
        description:
          '当媒体已经在视觉上传达信息时使用 isTitleHidden；标题仍会为屏幕阅读器命名对话框。',
      },
      {
        guidance: false,
        description: '用于常规确认或表单；请改用紧凑的 DialogHeader。',
      },
      {
        guidance: false,
        description:
          '装饰性媒体缺少空 alt；纯装饰图片请使用 alt="" 让屏幕阅读器跳过。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '仅 canary 的 lab hero Dialog 头部：通栏媒体插槽 + 标题，关闭按钮叠加在媒体上（经 mediaMode 使用 MediaTheme）',
  usage: {
    description:
      'DialogHeader 的高强调姊妹组件，适用于精选/营销/引导对话框。放入 Layout 的 header 插槽；媒体延伸到对话框边缘；标题为对话框命名；可见标题是默认初始焦点目标。从 @astryxdesign/lab 导入并加载 core + lab CSS；两个包均安装 @canary 版本。',
    bestPractices: [
      {
        guidance: true,
        description:
          '让 mediaMode 匹配媒体明暗度，保证关闭按钮对比度。',
      },
      {
        guidance: true,
        description: '调整媒体尺寸填满插槽（width 100%）。',
      },
      {guidance: true, description: 'CTA 放在 LayoutFooter。'},
      {
        guidance: true,
        description:
          '媒体已传达信息时使用 isTitleHidden；屏幕阅读器名称保留。',
      },
      {
        guidance: false,
        description: '不要用于常规确认/表单；请改用 DialogHeader。',
      },
    ],
  },
};
