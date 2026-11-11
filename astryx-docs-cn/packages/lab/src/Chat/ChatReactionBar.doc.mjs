// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatReactionBar',
  subComponentOf: 'Chat',
  group: 'Chat',
  category: 'Chat',
  displayName: 'Chat Reaction Bar',
  description: '聊天消息下方的表情回应胶囊行。每个胶囊显示一个表情和数量；当前用户自己的回应带强调色和 aria-pressed。提供 onAdd 会渲染末尾的添加回应按钮，点击打开 ChatEmojiPicker 弹出层。',
  props: [
    {
      name: 'reactions',
      type: '{emoji: string; count: number; isSelected?: boolean; label?: string}[]',
      description: '要渲染的回应列表，按显示顺序排列。isSelected 标记当前用户自己的回应（强调色 + aria-pressed）。label 是人类可读的描述，如 "Ana and Dana reacted with 🎉"，用作胶囊的提示与无障碍标签。',
      required: true,
    },
    {
      name: 'onToggle',
      type: '(emoji: string) => void',
      description: '用户开启或关闭某个回应时以该胶囊的表情调用。',
    },
    {
      name: 'onAdd',
      type: '(emoji: string) => void',
      description: '用户从表情选择器添加回应时以所选表情调用。仅在提供时渲染末尾的添加回应按钮。',
    },
    {
      name: 'emojis',
      type: 'readonly ChatEmojiOption[]',
      description: '添加回应选择器的表情选项，默认 DEFAULT_CHAT_EMOJIS。',
    },
    {
      name: 'addLabel',
      type: 'string',
      description: '添加回应按钮与选择器对话框的无障碍标签。',
      default: "'Add reaction'",
    },
    {
      name: 'label',
      type: 'string',
      description: '回应组的无障碍标签。',
      default: "'Reactions'",
    },
  ],
};

export const docsZh = {
  name: 'ChatReactionBar',
  displayName: 'Chat Reaction Bar',
  description: '聊天消息下方的表情回应胶囊行。每个胶囊显示表情和数量；当前用户自己的回应带有强调色和 aria-pressed。提供 onAdd 会渲染末尾的添加回应按钮，打开 ChatEmojiPicker 弹出层。',
  propDescriptions: {
    reactions: '按显示顺序渲染的回应列表。isSelected 标记当前用户自己的回应（强调色 + aria-pressed）。label 是人类可读的描述，用作胶囊的提示与无障碍标签。',
    onToggle: '用户切换回应时以该表情调用。',
    onAdd: '用户从表情选择器添加回应时以所选表情调用。仅在提供时渲染末尾的添加按钮。',
    emojis: '添加回应选择器的表情选项，默认 DEFAULT_CHAT_EMOJIS。',
    addLabel: '添加回应按钮与选择器对话框的无障碍标签。',
    label: '回应组的无障碍标签。',
  },
};

export const docsDense = {
  name: 'ChatReactionBar',
  displayName: 'Chat Reaction Bar',
  description: '消息下方的表情回应胶囊行；自己的回应带强调色与 aria-pressed；onAdd 渲染末尾添加按钮并打开 ChatEmojiPicker 弹出层',
  propDescriptions: {
    reactions: '{emoji,count,isSelected?,label?}[]；label 兼作提示与 aria 标签',
    onToggle: '点击胶囊时 (emoji)=>void',
    onAdd: '来自选择器的 (emoji)=>void；启用添加按钮',
    emojis: '选择器选项覆盖；默认 DEFAULT_CHAT_EMOJIS',
    addLabel: '添加按钮 + 选择器对话框标签',
    label: '组 aria 标签',
  },
};
