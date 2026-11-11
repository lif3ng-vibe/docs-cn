// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatUnreadDivider',
  subComponentOf: 'Chat',
  group: 'Chat',
  category: 'Chat',
  displayName: 'Chat Unread Divider',
  description: '错误色横线加末尾标签，标记聊天线程中未读消息的起点。渲染为带无障碍标签的 aria separator。不同于 ChatSystemMessage 的 divider 变体，后者用于中性的日期分隔。',
  props: [
    {
      name: 'label',
      type: 'string',
      description: '分隔线末尾显示的标签，同时用作无障碍名称（“New messages below”）。',
      default: "'New'",
    },
  ],
};

export const docsZh = {
  name: 'ChatUnreadDivider',
  displayName: 'Chat Unread Divider',
  description: '错误色横线加末尾标签，标记聊天线程中未读消息的起点。渲染为带无障碍标签的 aria separator。与 ChatSystemMessage 的 divider 变体不同，后者用于中性的日期分隔。',
  propDescriptions: {
    label: '横线末尾显示的标签，同时用于无障碍名称。',
  },
};

export const docsDense = {
  name: 'ChatUnreadDivider',
  displayName: 'Chat Unread Divider',
  description: '错误色横线 + 末尾标签标记首个未读消息；aria separator；中性日期分隔请用 ChatSystemMessage divider',
  propDescriptions: {
    label: "末尾标签 + aria 名称；默认 'New'",
  },
};
