// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessage',
  subComponentOf: 'Chat',
  displayName: 'Chat Message',
  description:
    '发送者上下文包装器：根据发送者角色处理头像、名称、元数据与对齐方式。',
  playground: {
    defaults: {
      sender: 'assistant',
      children: {
        __element: 'ChatMessageBubble',
        children: '这是你要的摘要。',
      },
      avatar: {__element: 'Avatar', props: {name: 'Astra', size: 'sm'}},
    },
    wrapper: {component: 'Stack', props: {width: 480}},
  },
  props: [
    {
      name: 'sender',
      type: "'user' | 'assistant' | 'system'",
      description: '消息由谁发送：控制对齐方式与布局。',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        '自由内容：气泡、资源列表、工具调用、图片。自定义（非气泡）子内容会与消息边缘齐平渲染；可将其包裹在 ghost 变体的 ChatMessageBubble 中，使其与气泡文本列对齐。',
      required: true,
      slotElements: [
        {
          __element: 'ChatMessageBubble',
          children: '消息文本',
        },
      ],
    },
    {
      name: 'avatar',
      type: 'ReactNode',
      description:
        '渲染在消息旁的头像元素，通常为 Avatar。`null`、布尔值和空字符串不会创建插槽；其他不渲染任何内容的值会使插槽折叠。',
      slotElements: [
        {
          __element: 'Avatar',
          props: {
            name: 'User',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'name',
      type: 'ReactNode',
      description:
        '渲染在消息正文上方的发送者名称，同时作为消息的标签。`null`、布尔值和空字符串不会创建插槽，其他不渲染任何内容的值也会使插槽折叠；两种情况下消息都会以回退的发送者称谓标注。当第一个子元素是原始内容（而非气泡）时使用。若第一个子元素是气泡，请改用气泡的 `name` prop。',
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description:
        '渲染在消息正文下方的元数据。`null`、布尔值和空字符串不会创建插槽；其他不渲染任何内容的值会使插槽折叠。当最后一个子元素是原始内容（而非气泡）时使用。若最后一个子元素是气泡，请改用气泡的 `metadata` prop。',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: '元数据',
        },
      ],
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: '视觉密度。未设置时从列表上下文继承。',
      default: "'balanced'",
    },
  ],
};

export const docsZh = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description:
    '发送者上下文包装器，根据发送者角色处理头像、名称、元数据和对齐方式。',
  propDescriptions: {
    sender: '消息发送者，控制对齐和布局。',
    children:
      '自由内容：气泡、资源列表、工具调用、图片。非气泡的自定义子内容默认与消息边缘齐平，可用 ghost 变体的 ChatMessageBubble 包裹使其与气泡文本列对齐。',
    avatar:
      '消息旁边渲染的头像元素。通常是 Avatar。`null`、布尔值和空字符串不会创建槽位；其他不渲染任何内容的值会让槽位折叠。',
    name: '消息正文上方渲染的发送者名称，并作为消息的标签。`null`、布尔值和空字符串不会创建槽位，其他不渲染任何内容的值会让槽位折叠；两种情况都改用本地化发送者标签。当第一个子元素不是气泡时使用。',
    metadata:
      '消息正文下方渲染的元数据。`null`、布尔值和空字符串不会创建槽位；其他不渲染任何内容的值会让槽位折叠。当最后一个子元素不是气泡时使用。',
    density: '视觉密度。未设置时从列表上下文继承。',
  },
};

export const docsDense = {
  name: 'ChatMessage',
  displayName: 'Chat Message',
  description:
    '发送者上下文包装器；按发送者角色处理头像+名称+元数据+对齐',
  propDescriptions: {
    sender: '发送者；控制对齐+布局',
    children:
      '自由内容：气泡、资源、工具调用、图片；非气泡内容用 ghost 气泡包裹以对齐气泡文本列',
    avatar:
      '消息旁的头像；null/布尔值/"" 不建插槽；不渲染内容的值折叠插槽',
    name: '正文上方的发送者名称；标注消息；null/布尔值/"" 不建插槽，不渲染内容的值折叠插槽；两种情况均回退为本地化发送者标签；第一个子元素为原始内容时使用',
    displayName:
      '正文上方的发送者名称；第一个子元素为原始内容（非气泡）时使用',
    metadata:
      '正文下方的元数据；null/布尔值/"" 不建插槽；不渲染内容的值折叠插槽；最后一个子元素为原始内容时使用',
    density: '视觉密度；未设置时从列表上下文继承',
  },
};
