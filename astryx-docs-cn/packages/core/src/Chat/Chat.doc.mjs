// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Chat',
  displayName: 'Chat',
  group: 'Chat',
  category: 'Chat',
  // ChatPastedTextToken is an internal helper (not exported from index.ts).
  // Hide it from the component listing so it doesn't surface as an undocumented entry.
  hiddenComponents: ['ChatPastedTextToken'],
  keywords: ['chat', '消息', '气泡', '会话', 'ai', '助手', '线程', 'system-message', '编写器', '提及', '触发器', 'typeahead', '标记', '命令式', 'tokenized-text'],
  theming: {
    targets: [
      {className: 'astryx-chat-layout', visualProps: ['density']},
      {className: 'astryx-chat-composer', visualProps: ['density']},
      {className: 'astryx-chat-composer-input'},
      {className: 'astryx-chat-composer-drawer', visualProps: ['collapsed']},
      {className: 'astryx-chat-message', visualProps: ['sender', 'density']},
      {
        className: 'astryx-chat-message-bubble',
        visualProps: ['sender', 'variant', 'density'],
      },
      {className: 'astryx-chat-message-list', visualProps: ['density']},
      {className: 'astryx-chat-system-message', visualProps: ['variant']},
      {className: 'astryx-chat-message-metadata'},
      {className: 'astryx-chat-send-button'},
      {className: 'astryx-chat-dictation-button'},
      {className: 'astryx-chat-layout-scroll-button'},
      {className: 'astryx-chat-tokenized-text'},
      {className: 'astryx-chat-tool-calls'},
      {className: 'astryx-trigger-menu'},
    ],
    vars: [
      {name: '--_chat-composer-radius', description: '编写器主体的圆角。内部元素按同心方式推导自己的圆角。', default: 'var(--radius-chat)', private: true},
      {name: '--_chat-composer-padding', description: '编写器主体的内边距。用于同心圆角计算。', default: 'var(--spacing-3)', private: true},
      {name: '--_chat-avatar-offset', description: '消息头像的顶部偏移：消息中的气泡显示名称时为名称行间距，否则为 0px。每条消息根据自己的内容设置。不是主题定制杠杆。', default: '0px', private: true},
      {name: '--_button-radius', description: '编写器内按钮的同心圆角。', default: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))', private: true, derived: true, formula: 'max(var(--radius-element), calc(var(--_chat-composer-radius) - var(--_chat-composer-padding)))'},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_chat-composer-radius']},
      {property: 'padding', vars: ['--_chat-composer-padding']},
    ],
  },
  components: [
    {name: 'ChatMessageList'},
    {name: 'ChatMessage'},
    {name: 'ChatMessageBubble'},
    {name: 'ChatMessageMetadata'},
    {name: 'ChatSystemMessage'},
    {name: 'ChatComposer'},
    {name: 'ChatComposerInput'},
    {name: 'ChatComposerDrawer'},
    {name: 'ChatSendButton'},
    {name: 'ChatToolCalls'},
    {name: 'ChatTokenizedText'},
    {name: 'ChatComposerTokenElement'},
    {name: 'ChatLayout'},
    {name: 'ChatLayoutScrollButton'},
  ],
  usage: {
    description: 'Chat 是一组用于构建 AI 和人工聊天体验的可组合基础组件。组合 ChatLayout、ChatMessageList、ChatMessage、气泡、系统消息、工具调用、标记文本和 ChatComposer，可构建完整对话，而无需重新实现发送者感知布局、密度、滚动或编写器行为。',
    bestPractices: [
      { guidance: true, description: '使用 MessageList > Message > Bubble 组合来获得一致的发送者感知样式和密度。' },
      { guidance: true, description: '设置 density 属性来全局控制间距：compact 用于侧边栏，balanced 用于大多数视图，spacious 用于长篇阅读。单条消息可覆盖。' },
      { guidance: true, description: '当顶层行相互独立（如 LLM 工具事件或流式块）且列表间距需要与 density 分开调校时，使用 gap。' },
      { guidance: true, description: '当同一发送者发送多条连续消息时，使用气泡的 group 属性（first、middle、last）来视觉上连接相关消息。' },
      { guidance: true, description: '使用 ChatSystemMessage 的 variant="divider" 作为日期分隔线，使用 default 作为加入、离开或话题切换等内联状态通知。' },
      { guidance: true, description: '将 name 放在第一个气泡上，metadata 放在最后一个气泡上，使其与气泡的内边距对齐。' },
      { guidance: true, description: '将自定义消息内容（卡片、附件、引用）包裹在 ghost 变体的气泡中，使其与气泡文本列对齐；需要占满消息列宽度而非默认气泡宽度上限时设置 width="100%"。' },
      { guidance: true, description: '提供 emptyState 属性，让新用户看到开始对话的提示，而不是空白屏幕。' },
      { guidance: true, description: '使用 ghost 气泡变体显示代码块或 Markdown 等富内容的 AI 风格回复，无需可见边界。' },
      { guidance: false, description: '不要将 ChatSystemMessage 用于发送者内容，它没有头像、对齐或气泡。请使用带有发送者角色的 ChatMessage。' },
      { guidance: false, description: '不要在系统消息中放置冗长或多行内容，保持一句简短的话。如需更多内容，请使用气泡或卡片。' },
      { guidance: false, description: '不要将 ChatMessage 嵌套在另一个 ChatMessage 内，每条消息都是独立的 article 元素，有自己的发送者上下文。' },
      { guidance: false, description: '不要直接在消息列表上应用固定高度，将其包裹在有尺寸的容器中，让列表以 flex: 1 填充。' },
      { guidance: false, description: '不要在同一发送者的消息中混用 filled 和 ghost 气泡变体，每一侧选择一种样式并保持一致。' },
      { guidance: false, description: '不要同时在气泡和消息包装器上放置 metadata 或 name，根据内容是否有气泡边界来选择其一。' },
],
    anatomy: [
      { name: 'Message area', required: true, description: '消息的可滚动区域。在 flex 纵列中渲染 children（通常为 ChatMessageList），列表较短时内容靠底。' },
      { name: 'Frosted glass dock', required: true, description: '底部带背景模糊层的 sticky 或 fixed 容器，容纳滚动按钮与编写器。' },
      { name: 'Scroll-to-bottom button', required: false, description: '用户向上滚动或有新消息时出现。默认为 ChatLayoutScrollButton；传 null 隐藏，或传自定义元素覆盖。' },
      { name: 'Composer', required: true, description: '发送消息的输入区域，通常为 ChatComposer。停靠在毛玻璃层底部。' },
      { name: 'Empty state', required: false, description: '没有消息时显示的居中占位。用 EmptyState 保持一致观感。' },
      { name: 'Avatar', required: false, description: '渲染在消息旁边的发送者头像，通常为 size="md" 的 Avatar。系统消息不显示。' },
      { name: 'Name', required: false, description: '消息正文上方的发送者名称。使用气泡时放在气泡上，裸内容则放在消息包装器上。' },
      { name: 'Content', required: true, description: '消息正文：一个或多个 ChatMessageBubble 元素，或图片、工具调用等任意自由 ReactNode。非气泡内容包进 ghost 气泡以与气泡文本列对齐。' },
      { name: 'Metadata', required: false, description: '消息下方的时间戳、送达状态与页脚操作。放在最后一个气泡或消息包装器上。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Chat 是一组用于构建 AI 和人工聊天体验的可组合基础组件。组合 ChatLayout、ChatMessageList、ChatMessage、气泡、系统消息、工具调用、标记文本和 ChatComposer，可构建完整对话，而无需重新实现发送者感知布局、密度、滚动或编写器行为。',
    bestPractices: [
      { guidance: true, description: '使用 MessageList > Message > Bubble 组合来获得一致的发送者感知样式和密度。' },
      { guidance: true, description: '设置 density 属性来全局控制间距：compact 用于侧边栏，balanced 用于大多数视图，spacious 用于长篇阅读。' },
      { guidance: true, description: '当同一发送者发送多条连续消息时，使用气泡的 group 属性（first、middle、last）来视觉上连接相关消息。' },
      { guidance: true, description: '使用 ChatSystemMessage 的 variant="divider" 作为日期分隔线，使用 default 作为内联状态通知。' },
      { guidance: true, description: '将 name 放在第一个气泡上，metadata 放在最后一个气泡上，使其与气泡的内边距对齐。' },
      { guidance: true, description: '将自定义消息内容（卡片、附件、引用）包裹在 ghost 变体的气泡中，使其与气泡文本列对齐；需要占满消息列宽度时设置 width="100%"。' },
      { guidance: true, description: '提供 emptyState 属性，让新用户看到开始对话的提示，而不是空白屏幕。' },
      { guidance: true, description: '使用 ghost 气泡变体显示代码块或 Markdown 等富内容，无需可见边界。' },
      { guidance: false, description: '不要将 ChatSystemMessage 用于发送者内容，它没有头像、对齐或气泡。请使用带有发送者角色的 ChatMessage。' },
      { guidance: false, description: '不要在系统消息中放置冗长或多行内容，保持一句简短的话。如需更多内容，请使用气泡或卡片。' },
      { guidance: false, description: '不要将 ChatMessage 嵌套在另一个 ChatMessage 内，每条消息都是独立的 article 元素。' },
      { guidance: false, description: '不要直接在消息列表上应用固定高度，将其包裹在有尺寸的容器中，让列表以 flex: 1 填充。' },
      { guidance: false, description: '不要在同一发送者的消息中混用 filled 和 ghost 气泡变体，每一侧选择一种样式并保持一致。' },
      { guidance: false, description: '不要同时在气泡和消息包装器上放置 metadata 或 name，根据内容是否有气泡边界来选择。' },
    ],
    anatomy: [
      { name: 'Message area', required: true, description: '消息的可滚动区域。在 flex 纵列中渲染 children（通常为 ChatMessageList），列表较短时内容靠底。' },
      { name: 'Frosted glass dock', required: true, description: '底部带背景模糊层的 sticky 或 fixed 容器，容纳滚动按钮与编写器。' },
      { name: 'Scroll-to-bottom button', required: false, description: '用户向上滚动或有新消息时出现。默认为 ChatLayoutScrollButton；传 null 隐藏，或传自定义元素覆盖。' },
      { name: 'Composer', required: true, description: '发送消息的输入区域，通常为 ChatComposer。停靠在毛玻璃层底部。' },
      { name: 'Empty state', required: false, description: '没有消息时显示的居中占位。用 EmptyState 保持一致观感。' },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'AI 聊天组件。布局（MessageList>Message>Bubble+SystemMessage）+ 编写器（带插槽的外壳、带触发菜单的 ContentEditable 输入、标记、消息历史、附件）',
  usage: {
    description: 'Chat 家族：布局 + 消息列表 + 发送者消息 + 气泡 + 系统消息 + 工具调用 + 标记文本 + 编写器，构建完整会话 UI。',
    bestPractices: [
      { guidance: true, description: '用 MessageList > Message > Bubble 获得发送者感知样式。' },
      { guidance: true, description: 'density prop 控制全局间距：compact 侧边栏，balanced 默认，spacious 阅读。' },
      { guidance: true, description: 'gap 将顶层行间距与 density 分开调校，用于独立的 LLM/工具事件行。' },
      { guidance: true, description: '同一发送者连续消息用气泡的 group prop（first/middle/last）；收紧圆角。' },
      { guidance: true, description: 'SystemMessage：divider 变体作日期分隔，default 作状态通知。' },
      { guidance: true, description: 'name 放首个气泡，metadata 放末个气泡；与气泡内边距对齐。' },
      { guidance: true, description: 'ghost 气泡包裹自定义内容（卡片/附件）；width="100%" 占满消息列（默认上限 max(80%,280px)）。' },
      { guidance: true, description: '提供 emptyState，让新用户看到提示而非白屏。' },
      { guidance: true, description: '代码/Markdown 等富 AI 内容用 ghost 气泡变体，无可见边界。' },
      { guidance: false, description: 'SystemMessage 不要用于发送者内容：无头像/对齐/气泡。用 ChatMessage。' },
      { guidance: false, description: '系统消息不要冗长/多行：保持一句短话。' },
      { guidance: false, description: '不要把 ChatMessage 嵌进另一个：每个都是独立 article。' },
      { guidance: false, description: '不要直接给消息列表固定高度：包进有尺寸的容器，用 flex: 1 填充。' },
      { guidance: false, description: '不要在同一发送者的消息中混用 filled 与 ghost 变体：每侧一种样式。' },
      { guidance: false, description: '不要在气泡和包装器上都放 metadata/name：二选一。' },
],
  },
};
