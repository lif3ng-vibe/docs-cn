// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatEmojiPicker',
  subComponentOf: 'Chat',
  group: 'Chat',
  category: 'Chat',
  displayName: 'Chat Emoji Picker',
  description: '包裹触发按钮的弹出层表情网格：短名过滤输入框叠在 8 列网格上，方向键在网格内漫游移动焦点。选中表情会调用 onSelect 并关闭弹出层，焦点回到触发元素。内置小型默认表情集，可通过 emojis 覆盖。',
  props: [
    {
      name: 'onSelect',
      type: '(emoji: string) => void',
      description: '以所选表情字符调用；选中后弹出层自行关闭。',
      required: true,
    },
    {
      name: 'emojis',
      type: 'readonly {emoji: string; name: string}[]',
      description: '网格中渲染的表情选项，每行 8 个。name 驱动过滤与无障碍标签。',
      default: 'DEFAULT_CHAT_EMOJIS',
    },
    {
      name: 'label',
      type: 'string',
      description: '弹出层对话框的无障碍标签。',
      default: "'Pick an emoji'",
    },
    {
      name: 'searchLabel',
      type: 'string',
      description: '过滤输入框的占位符与隐藏标签。',
      default: "'Search emoji'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: '触发元素，必须包含一个按钮；弹出层会自动接线点击处理器与 ARIA。',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'ChatEmojiPicker',
  displayName: 'Chat Emoji Picker',
  description: '包裹触发按钮的弹出层表情网格：短名过滤输入框 + 8 列网格，方向键在网格内移动焦点。选中表情会调用 onSelect 并关闭弹出层，焦点回到触发元素。内置小型默认表情集，可通过 emojis 覆盖。',
  propDescriptions: {
    onSelect: '以选中的表情字符调用；弹出层随后自动关闭。',
    emojis: '网格渲染的表情选项，每行 8 个。name 用于过滤和无障碍标签。',
    label: '弹出层对话框的无障碍标签。',
    searchLabel: '过滤输入框的占位符和隐藏标签。',
    children: '触发元素，必须包含一个按钮。',
  },
};

export const docsDense = {
  name: 'ChatEmojiPicker',
  displayName: 'Chat Emoji Picker',
  description: '触发按钮上的弹出层表情网格；短名过滤 + 8 列方向键导航；onSelect 关闭弹出层并恢复焦点；DEFAULT_CHAT_EMOJIS 可覆盖',
  propDescriptions: {
    onSelect: '(emoji)=>void；关闭弹出层',
    emojis: '{emoji,name}[] 网格选项，每行 8 个；name 驱动过滤与 aria',
    label: '弹出层对话框 aria 标签',
    searchLabel: '过滤输入框占位符 + 隐藏标签',
    children: '包含按钮的触发元素',
  },
};
