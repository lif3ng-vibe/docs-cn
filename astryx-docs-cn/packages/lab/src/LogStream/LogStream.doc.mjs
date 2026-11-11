// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'LogStream',
  displayName: 'Log Stream',
  group: 'LogStream',
  category: 'Content',
  keywords: ['log', '日志', 'stream', '流', 'terminal', '终端', 'console', '控制台', 'output', '输出', 'logs', 'tail', '实时跟踪', 'LogStream'],

  usage: {
    description:
      '实验性流式日志查看器：等宽网格行（时间戳 | 级别 | 来源 | 消息），级别强调色源自令牌，每行可展开详情面板，支持跟随滚动的实时跟踪和 "Jump to latest" 入口，还有始终深色的 terminal 变体。默认变体中，警告和错误标签使用其在普通表面上的状态前景角色。追加的行经 @starting-style 淡入。实时播报跟随固定状态：role="log" 区域仅在跟随尾部时为 aria-live="polite"，未跟随时为 aria-live="off"，繁忙的流不会淹没辅助技术。',
  },

  props: [
    {
      name: 'entries',
      type: 'LogEntry[]',
      description: '要渲染的日志条目对象数组。',
      required: true,
    },
    {
      name: 'variant',
      type: "'default' | 'terminal'",
      description: "视觉变体样式：'default' 使用主题表面背景，'terminal' 使用固定深色背景。",
      default: "'default'",
    },
    {
      name: 'isFollowing',
      type: 'boolean',
      description: '受控的跟随固定状态，用于自动滚动到最新条目。',
    },
    {
      name: 'onFollowChange',
      type: '(following: boolean) => void',
      description: '跟随固定状态变化时触发的回调。',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: '垂直滚动前的容器最大高度。',
    },
    {
      name: 'hasTimestamps',
      type: 'boolean',
      description: '显示或隐藏时间戳列。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: '日志区域的无障碍标签。',
      default: "'Log stream'",
    },
    {
      name: 'renderEntry',
      type: '(entry: LogEntry) => ReactNode',
      description: '替换单行布局的自定义渲染函数。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。',
    },
  ],
};
