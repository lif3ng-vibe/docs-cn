// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatReasoning',
  displayName: 'Chat Reasoning',
  group: 'Chat',
  category: 'Chat',
  keywords: ['reasoning', '推理', 'thinking', '思考', 'thought', '思维链', 'chain-of-thought', 'chat', '聊天', 'llm', 'ai'],

  usage: {
    description:
      '用于展示模型推理过程或思维链（chain-of-thought）细节的紧凑可折叠容器。折叠时显示单行摘要，展开后呈现完整推理文本。',
  },

  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '推理内容字符串或自定义 ReactNode。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '触发行中显示的标题标签。',
      default: "'Thinking'",
    },
    {
      name: 'duration',
      type: 'string',
      description: '标签旁显示的时长字符串（如 "12s"）。',
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: '推理内容是否正在流式输出。显示流动微光动效。',
      default: 'false',
    },
    {
      name: 'isExpanded',
      type: 'boolean',
      description: '受控的展开状态。',
    },
    {
      name: 'defaultIsExpanded',
      type: 'boolean',
      description: '非受控用法下的默认展开状态。',
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
      description: '用于布局定制的 StyleX 样式。',
    },
  ],
};
