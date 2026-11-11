// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatTypingIndicator',
  subComponentOf: 'Chat',
  group: 'Chat',
  category: 'Chat',
  displayName: 'Chat Typing Indicator',
  description: '带本地化、语法感知标签的三点跳动输入提示：“Ana is typing...”、"Ana and Ben are typing..." 或 "Ana and 2 others are typing..."。圆点以 stylex.keyframes 交错延迟跳动，prefers-reduced-motion 下禁用。每个新标签通过共享播报通道（useAnnounce）礼貌播报一次；位于聊天记录内时改由记录播报。指示器本身不带 live 角色，因此可按条件挂载，不会被跳过或重复播报。',
  props: [
    {
      name: 'names',
      type: 'string[]',
      description: '正在输入的人名。一个名字渲染 "is typing"，两个渲染双名，更多折叠为 "and N others"。语句取自 i18n 词表，人名由 Intl.ListFormat 拼接，因此措辞与连接词跟随当前 locale。省略或为空时仅渲染动画圆点。',
    },
  ],
};

export const docsZh = {
  name: 'ChatTypingIndicator',
  displayName: 'Chat Typing Indicator',
  description: '带语法感知标签的三点跳动输入提示：“Ana is typing...”、"Ana and Ben are typing..." 或 "Ana and 2 others are typing..."。圆点用 stylex.keyframes 交错跳动，prefers-reduced-motion 下禁用。每个新标签通过共享播报通道（useAnnounce）礼貌播报一次；位于聊天记录（role="log"）内时由记录负责播报。指示器本身不带 live 角色，因此可按条件挂载，既不会被跳过，也不会重复播报。',
  propDescriptions: {
    names: '正在输入的人名。一个名字渲染 "is typing"，两个渲染双名，更多折叠为 "and N others"。语句取自 i18n 词条，人名由 Intl.ListFormat 按当前语言拼接，因此措辞与连接词随语言而变。省略或为空时仅渲染动画圆点。',
  },
};

export const docsDense = {
  name: 'ChatTypingIndicator',
  displayName: 'Chat Typing Indicator',
  description: '三点跳动输入提示；标签语法按 1/2/N 个名字；减弱动效安全的 keyframes；通过 useAnnounce（polite）播报每个新标签一次，或交给外层 role=log；元素本身不带 live 角色；names 为空时仅显示圆点',
  propDescriptions: {
    names:
      "string[]；1='X is typing'，2='X and Y'，3+='X and N others'；短语取自 i18n 词表，人名由 Intl.ListFormat 拼接；空=仅圆点",
  },
};
