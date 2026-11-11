// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessageList',
  subComponentOf: 'Chat',
  displayName: 'Chat Message List',
  isHiddenFromOverview: true,
  description: `展示型消息容器，提供密度上下文与无限滚动支持。提供带 aria-live="polite" 的 role="log" 以保障无障碍。列表未填满时，flex 占位块将消息推向底部；设置 align="top" 可让消息从顶部开始。`,
  playground: {
    defaults: {
      children: [
        {
          __element: 'ChatMessage',
          props: {sender: 'user'},
          children: {
            __element: 'ChatMessageBubble',
            children: '能帮我总结这份报告吗？',
          },
        },
        {
          __element: 'ChatMessage',
          props: {sender: 'assistant'},
          children: {
            __element: 'ChatMessageBubble',
            children: '当然可以。营收环比增长 12%，流失率环比持平。',
          },
        },
      ],
    },
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '消息元素：通常为 ChatMessage 或 ChatSystemMessage。',
      required: true,
      slotElements: [
        {
          __element: 'ChatMessage',
          props: {sender: 'user'},
          children: {
            __element: 'ChatMessageBubble',
            children: '消息文本',
          },
        },
      ],
    },
    {
      name: 'emptyState',
      type: 'ReactNode',
      description: '列表没有消息时显示的内容。',
      slotElements: [
        {
          __element: 'EmptyState',
          props: {
            title: 'No items',
            description: 'Nothing to show.',
          },
        },
      ],
    },
    {
      name: 'scrollToTopAction',
      type: '() => Promise<void>',
      description: '用户滚动到顶部时触发的异步操作。用于加载更早的消息。内部经 useTransition 包装：等待期间在顶部显示加载指示器。',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '视觉密度：通过上下文传递给子消息。',
      default: "'balanced'",
    },
    {
      name: 'gap',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description: '顶层消息行之间的间距。默认跟随所选密度；若 LLM 事件流等独立行需要不同于密度的间距，可覆盖此值。',
    },
    {
      name: 'align',
      type: "'top' | 'bottom'",
      description: "列表短于容器时的垂直对齐方式。'bottom' 用占位块填满空闲空间，让简短对话贴近输入区；'top' 省略占位块，消息从顶部开始。仅影响未填满的列表；溢出列表两种取值滚动行为一致，并保留自动滚动到底部。",
      default: "'bottom'",
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: '助手消息是否正在流式输出。将日志标记为 aria-busy，让屏幕阅读器等待并在完成后一次性播报完整消息，而不是每个 token 都重复播报部分文本。',
      default: 'false',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageList',
  isHiddenFromOverview: true,
  displayName: 'Chat Message List',
  description: '消息展示容器，支持密度上下文和无限滚动。自动滚动由 ChatLayout 管理。',
  propDescriptions: {
    children: '消息元素，通常是 ChatMessage 或 ChatSystemMessage。',
    emptyState: '列表无消息时显示的内容。',
    scrollToTopAction: '用户滚动到顶部时触发的异步操作。用于加载更早的消息。',
    density: '视觉密度，通过上下文传递给子消息。',
    gap: '顶层消息行之间的间距。默认跟随密度；当 LLM 事件流等独立行需要不同间距时可覆盖。',
    align: "列表内容不足一屏时的垂直对齐方式。'bottom' 用占位块填满剩余空间，让简短对话贴近输入框；'top' 省略占位块，让消息从顶部开始。仅影响未填满的列表，溢出后两种模式滚动一致，保持自动滚动到底部。",
    isStreaming: '是否有助手消息正在流式输出。标记日志为 aria-busy，让屏幕阅读器等待并在完成后一次性播报，而不是每个 token 都重复播报。',
  },
};

export const docsDense = {
  name: 'ChatMessageList',
  isHiddenFromOverview: true,
  displayName: 'Chat Message List',
  description: '展示型消息容器，含密度上下文+无限滚动；自动滚动由 ChatLayout 管理',
  propDescriptions: {
    children: '消息元素（ChatMessage 或 ChatSystemMessage）',
    emptyState: '无消息时的内容',
    scrollToTopAction: '滚动到顶部触发的异步操作；加载更早消息',
    density: '视觉密度；经上下文传给子元素',
    gap: '顶层行间距；默认跟随密度；LLM/工具等独立行可覆盖',
    align: "'top'|'bottom'（默认 bottom）；bottom 用占位块压低短列表，top 从顶部开始；溢出时两者滚动一致",
    isStreaming: '助手是否流式输出？标记日志 aria-busy，让屏幕阅读器完成后一次性播报完整消息',
  },
};
