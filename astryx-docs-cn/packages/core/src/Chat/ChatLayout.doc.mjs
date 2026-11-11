// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatLayout',
  subComponentOf: 'Chat',
  displayName: 'Chat Layout',
  description: '完整聊天界面的布局外壳。消息在页面正常流中流动，编写器通过毛玻璃底座固定在底部。设置 density（compact/balanced/spacious）控制间距、消息最大宽度与模糊层尺寸。内置自动滚动、"New messages" 滚动到底部按钮，以及编写器后方的毛玻璃模糊层。默认布局根是滚动容器；传 scrollRef 将滚动委托给父元素或文档 body。在可视视口因软键盘收缩的环境中，编写器停在键盘上方，停留在最新消息的对话保持不变。在 Android 版 Chrome 中编写器随 Gboard 的滑动同步移动。在 iOS 版 Safari（浏览器和主屏幕应用）与 Android 版 Firefox 中，浏览器上报键盘后编写器移到键盘上方。触摸屏顶层页面中，进入编写器文本的每种方式（轻点、键盘上一项/下一项按钮、Tab、输入框的 focus()）都能聚焦它且不滚动页面；鼠标或 iframe 内则沿用浏览器自身聚焦行为。页面设置 interactive-widget=resizes-content 时，Android 版 Chrome 自行为键盘缩小页面，编写器停在键盘上方而不移动（参见浏览器支持指南）。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '消息内容：通常为 ChatMessageList。在页面自然流动并随容器滚动。',
      required: true,
    },
    {
      name: 'composer',
      type: 'ReactNode',
      description: '编写器元素：通常为 ChatComposer。通过毛玻璃底座固定在底部。',
      required: true,
      slotElements: [
        {
          __element: 'TextInput',
          props: {
            label: '输入',
            placeholder: '在此输入...',
          },
        },
      ],
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description: 'children 为空时显示的内容。在消息区内垂直居中。',
      slotElements: [
        {
          __element: 'EmptyState',
          props: {
            title: '暂无项目',
            description: '没有可显示的内容。',
          },
        },
      ],
    },
    {
      name: 'scrollButton',
      type: 'ReactNode | null',
      description: '渲染在编写器上方的滚动到底部按钮。默认为带自动滚动集成的 ChatLayoutScrollButton。传 null 隐藏。',
    },
    {
      name: 'scrollRef',
      type: 'React.RefObject<HTMLElement | null>',
      description: '外部滚动容器 ref。提供时，自动滚动与滚动到底部以此元素为目标而非布局根。聊天嵌入页面且由父元素或文档 body 滚动时使用。',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '视觉密度：控制底座内边距、消息区最大宽度与行内内边距、以及毛玻璃模糊层高度。',
      default: "'balanced'",
    },
  ],
  usage: {
    description: 'ChatLayout 是全页聊天界面的布局外壳。消息在页面正常流中渲染，编写器通过毛玻璃模糊层停靠在底部。设置 density prop 控制间距，默认 balanced。用它包裹 ChatMessageList 与 ChatComposer，即可获得内置自动滚动和滚动到底部按钮的完整聊天体验。',
    bestPractices: [
      {
        guidance: true,
        description: 'children 传 ChatMessageList、composer prop 传 ChatComposer，构成完整聊天界面。',
      },
      {
        guidance: true,
        description: '提供 emptyState，让新会话显示提示而非空白屏幕。',
      },
      {
        guidance: true,
        description: '聊天嵌入页面且由父元素处理滚动时使用 scrollRef。',
      },
      {
        guidance: true,
        description: '全页 ChatLayout 的容器高度用 100dvh 而非 100vh：手机浏览器工具栏收起时 100vh 是隐藏工具栏后的视口，编写器会起始在屏幕边缘之下。',
      },
      {
        guidance: true,
        description: 'Markdown 正文保持 680px 行宽，代码块与表格横跨消息列。要让回复有统一右边界，给其 Markdown 传 contentWidth="100%"。',
      },
      {
        guidance: false,
        description: '不要在布局上设固定高度；让它以 flex: 1 填满容器。',
      },
      {
        guidance: false,
        description: '不要在同一滚动容器渲染多个 ChatLayout；每个都期望独占自己的滚动上下文。',
      },
    ],
    anatomy: [
      {
        name: 'Message area',
        required: true,
        description: '消息的可滚动区域。在 flex 纵列中渲染 children（通常为 ChatMessageList），列表较短时内容靠底。',
      },
      {
        name: 'Frosted glass dock',
        required: true,
        description: '底部带背景模糊层的 sticky 或 fixed 容器，容纳滚动按钮与编写器。软键盘弹起时它停在键盘上方，消息区获得在其上方滚动的空间。',
      },
      {
        name: 'Scroll-to-bottom button',
        required: false,
        description: '用户向上滚动或有新消息时出现。默认为 ChatLayoutScrollButton；传 null 隐藏，或传自定义元素覆盖。',
      },
      {
        name: 'Composer',
        required: true,
        description: '发送消息的输入区域，通常为 ChatComposer。停靠在毛玻璃层底部。触摸屏顶层页面中，其包裹层（不含滚动按钮）是无名称的 group。键盘 Done 结束输入后焦点停留在该 group（非 Tab 停靠点），下次轻点或 Tab 从编写器开始。仅在键盘输入后才显示焦点环。鼠标或 iframe 内包裹层为普通容器。',
      },
      {
        name: 'Empty state',
        required: false,
        description: '没有消息时显示的居中占位。用 EmptyState 保持一致观感。',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description: '完整聊天界面的布局外壳。消息在页面中自然流动，编写器固定在底部，带有毛玻璃效果。通过 density 属性控制密度。在可视视口会随软键盘缩小的浏览器中，编写器停在键盘上方，停留在最新消息的对话保持在最新消息。在 Android 上的 Chrome 中，编写器随 Gboard 的滑动同步移动。在 iOS 上的 Safari（浏览器中和添加到主屏幕的网页应用）和 Android 上的 Firefox 中，编写器会在浏览器报告键盘后移到键盘上方。在触摸屏上的顶层页面中，进入编写器文本的每种方式（轻点、键盘的上一项和下一项按钮、Tab、输入框的 focus()）都会聚焦它而不滚动页面；使用鼠标或在 iframe 中时沿用浏览器自身的聚焦行为。如果页面设置了 interactive-widget=resizes-content，Android 上的 Chrome 会自行为键盘缩小页面，编写器停在键盘上方而不移动（参见浏览器支持指南）。',
  propDescriptions: {
    children: '消息内容，通常是 ChatMessageList。在页面中自然流动。',
    composer: '编写器元素，通常是 ChatComposer。固定在底部，带有毛玻璃底座。',
    emptyState: '子元素为空时显示的内容。',
    scrollButton: '编写器上方的滚动到底部按钮。默认使用 ChatLayoutScrollButton。传入 null 隐藏。',
    scrollRef: '外部滚动容器引用。提供时，自动滚动和滚动到底部将目标指向此元素。',
    density: '视觉密度：控制底座内边距、消息区最大宽度和毛玻璃层高度。',
  },
};

export const docsDense = {
  name: 'ChatLayout',
  displayName: 'Chat Layout',
  description: '全聊天布局外壳；消息在页面流中，编写器以毛玻璃底座固定在底部；density prop（默认 balanced）；scrollRef 委托给父元素/body；Android 版 Chrome（Gboard）编写器随软键盘同步移动；iOS 版 Safari 与 Android 版 Firefox 在上报后移到键盘上方（Chrome 配 interactive-widget=resizes-content：页面缩放不移动）；对话停在最新消息，触摸屏顶层页面每条聚焦路径（轻点、上/下一项、Tab、focus()）均不滚动页面，Done 后焦点停在编写器 group（无名称、仅键盘输入后显示焦点环、非 Tab 停靠点）；鼠标或 iframe 内：普通包裹层，浏览器聚焦',
  usage: {
    bestPractices: [
      {guidance: true, description: 'children 传 ChatMessageList、composer 传 ChatComposer 构成完整聊天。'},
      {guidance: true, description: '提供 emptyState，让新会话显示提示而非白屏。'},
      {guidance: true, description: '聊天嵌入页面且由父元素处理滚动时使用 scrollRef。'},
      {guidance: true, description: '全页：容器用 100dvh 而非 100vh（100vh = 手机工具栏隐藏后的视口；编写器起始在屏幕边缘下）'},
      {guidance: true, description: 'Markdown 正文保持 680px 行宽；代码/表格横跨列。统一右边界：给 Markdown 传 contentWidth="100%"。'},
      {guidance: false, description: '不要给布局设固定高度；让它以 flex: 1 填满容器。'},
      {guidance: false, description: '不要在同一滚动容器渲染多个 ChatLayout；每个都期望独占滚动上下文。'},
    ],
  },
  propDescriptions: {
    children: '消息内容；通常为 ChatMessageList',
    composer: '编写器元素；通常为 ChatComposer；毛玻璃固定底部',
    emptyState: 'children 为空时的内容',
    scrollButton: '滚动到底部按钮；默认 ChatLayoutScrollButton；传 null 隐藏',
    scrollRef: '外部滚动容器 ref；目标指向父元素/body 而非布局根',
    density: '视觉密度；底座内边距、消息最大宽度、模糊层高度',
  },
};
