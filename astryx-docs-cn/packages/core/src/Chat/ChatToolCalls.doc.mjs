// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatToolCalls',
  displayName: 'Chat Tool Calls',
  group: 'Chat',
  category: 'Chat',

  keywords: ['工具', '函数', '调用', '执行', 'LLM', '智能体', 'bash', 'edit', 'read', 'search', '状态', '运行中', '错误', '完成', 'diff', '统计'],

  usage: {
    description:
      'ChatToolCalls 用于展示 LLM 响应中的工具或函数调用。传入调用数组，其余交给组件处理：单个调用内联渲染，多个调用折叠为摘要并在表层显示最新调用。凡是 AI 智能体（agent）展示其执行动作的地方都可以使用。',
    bestPractices: [
      {guidance: true, description: '每次调用都带上 target 字符串，让用户看到工具作用于什么：文件路径、shell 命令或搜索查询。'},
      {guidance: true, description: '已完成的调用显示 duration，让用户判断哪些工具慢，并理解响应为何耗时。'},
      {guidance: true, description: '当自动计数无法说明调用代表什么时，提供 group 标签。'},
      {guidance: true, description: '对产生输出的调用提供带代码块的 resultDetail（edit 用 diff、shell 命令用终端输出），让用户可以内联查看结果。'},
      {guidance: true, description: '流式输出时为每个调用项设置唯一 key，让 React 可以对新增项做动画而不重新挂载已完成的行。'},
      {guidance: false, description: '不要省略 status 字段。缺省时调用按 complete 处理，这对仍在运行或已失败的调用具有误导性。'},
      {guidance: false, description: '不要在聊天消息上下文之外展示工具调用；它们被设计为嵌入助手消息内部，而非独立 UI。'},
      {guidance: false, description: '不要为单个调用套自定义包装；组件会根据数组长度自动处理单调用与分组布局。'},
    ],
    anatomy: [
      {name: 'Status icon', required: true, description: '带主题的语义化成功/错误图标；调用处于 pending 或 running 时显示加载指示器。'},
      {name: 'Tool name', required: true, description: '以等宽字体显示的函数或工具名：bash、edit、read、web_search 等。'},
      {name: 'Node badge', required: false, description: '中性胶囊徽标，显示运行工具的沙箱或环境，如 cli:remote-server 或 workspace。'},
      {name: 'Target label', required: false, description: '显示在工具名之后的操作对象（文件路径、命令或搜索查询）。'},
      {name: 'Diff stats', required: false, description: 'edit 操作的绿色新增与红色删除计数，内联显示在 target 之后。'},
      {name: 'Duration', required: false, description: '已完成的调用在尾部显示的执行时长。'},
      {name: 'Group header', required: false, description: '带调用次数的扳手图标，存在多个调用时显示。点击可在摘要与完整列表间切换。'},
    ],
  },

  playground: {
    defaults: {
      calls: [
        {name: 'read_file', status: 'complete', target: 'Button.tsx', duration: '120ms'},
        {name: 'run_tests', status: 'complete', target: 'yarn test', duration: '1.2s', additions: 12, deletions: 3},
      ],
    },
  },

  props: [
    {
      name: 'calls',
      type: 'ChatToolCallItem[]',
      description:
        "工具调用数据数组。每项包含 name、status、target、duration、node、additions、deletions、stats、errorMessage、resultDetail、key 和 data。status 取值为 'pending'、'running'、'complete' 或 'error'（默认 'complete'）。",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        '展开分组时显示的自定义摘要标签。省略时使用本地化的调用次数文案。',
    },
    {
      name: 'isExpanded',
      type: 'boolean',
      description: '分组的受控展开状态。',
    },
    {
      name: 'defaultIsExpanded',
      type: 'boolean',
      description:
        '非受控时的默认展开状态。',
      default: 'false',
    },
    {
      name: 'onExpandedChange',
      type: '(isExpanded: boolean) => void',
      description: '展开状态变化时触发的回调。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '用于布局定制的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，不能是 style={{}} 这样的内联样式对象。',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'ChatToolCalls displays tool or function call invocations from an LLM response. Pass an array of calls and the component handles the rest: a single call renders inline, while multiple calls collapse into a summary with the latest call visible at the surface. Use it anywhere an AI agent shows what actions it took.',
    bestPractices: [
      {guidance: true, description: 'Include a target string on every call so the user can see what the tool acted on: a file path, a shell command, or a search query.'},
      {guidance: true, description: 'Show a duration on completed calls so users can judge which tools are slow and understand why a response took time.'},
      {guidance: true, description: 'Provide a group label when the automatic count does not explain what the calls represent.'},
      {guidance: true, description: 'Provide resultDetail with a code block for calls that produce output (diffs for edits, terminal output for shell commands) so users can inspect results inline.'},
      {guidance: true, description: 'Set a unique key on each call item when streaming so React can animate additions without re-mounting completed rows.'},
      {guidance: false, description: "Don't omit the status field. Without it the call defaults to complete, which is misleading for calls that are still running or have failed."},
      {guidance: false, description: "Don't display tool calls outside a chat message context; they are designed to sit inside an assistant message, not as standalone UI."},
      {guidance: false, description: "Don't use custom wrappers around individual calls; the component handles single vs. grouped layout automatically based on the array length."},
    ],
  },
  propDescriptions: {
    calls: '工具调用数据数组。每项包含 name、status、target、duration、node、additions、deletions、stats、resultDetail。',
    label: '组的自定义摘要标签。省略时从数量自动生成。',
    isExpanded: '受控展开状态。',
    defaultIsExpanded: '默认展开状态（非受控）。',
    onExpandedChange: '展开状态变更时的回调。',
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description: 'LLM 响应的工具/函数调用展示；单个=内联，多个=可折叠摘要且最新调用在表层',
  usage: {
    description:
      '展示 LLM 响应的工具/函数调用。单个调用内联渲染；多个调用折叠为摘要。用于助手消息内部。',
    bestPractices: [
      {guidance: true, description: '每次调用都带 target：文件路径、命令或搜索查询。'},
      {guidance: true, description: '已完成的调用显示 duration，让用户了解耗时。'},
      {guidance: true, description: '仅靠计数含义不明时提供 group 标签。'},
      {guidance: true, description: '产生输出的调用提供带代码块的 resultDetail。'},
      {guidance: true, description: '流式时为每个调用项设置唯一 key，保证动画稳定。'},
      {guidance: false, description: '不要省略 status；默认 complete，对运行中/失败的调用有误导。'},
      {guidance: false, description: '不要在聊天消息上下文之外展示；为助手消息设计。'},
      {guidance: false, description: '不要包装单个调用；组件自动处理单调用/分组布局。'},
    ],
  },
  propDescriptions: {
    calls: '工具调用数据数组；name+status+target+duration+node+additions+deletions+resultDetail',
    label: '自定义摘要标签；省略时按次数自动生成',
    isExpanded: '受控展开状态',
    defaultIsExpanded: '默认展开状态（非受控）',
    onExpandedChange: '展开状态变化回调',
  },
};
