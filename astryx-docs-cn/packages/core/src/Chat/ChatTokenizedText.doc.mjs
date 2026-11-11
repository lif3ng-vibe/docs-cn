// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatTokenizedText',
  subComponentOf: 'Chat',
  displayName: 'Chat Tokenized Text',
  isHiddenFromOverview: true,
  description:
    '渲染文本字符串，并将其中的 token 模式替换为内联 token 内容。把消息正文包裹在 ChatMessageBubble 内，即可将原始的 @提及、#标签或 /命令转换为样式化内容。当没有非空 token 匹配或根本未提供 token 时，文本按原样渲染，因此可以对每条消息无条件使用 ChatTokenizedText。',
  props: [
    {
      name: 'children',
      type: 'string',
      description:
        '包含序列化 token 值的纯文本消息。与 token 值匹配的模式会被替换为内联 token 内容。',
      required: true,
    },
    {
      name: 'tokens',
      type: 'ChatComposerToken[]',
      description:
        'token 定义，与输入组件使用相同类型。每个非空值都按字面匹配。空值会被忽略。结构化 token 渲染 Badge，自定义 token 渲染调用方内容。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        '根文本包裹层的 StyleX 样式。必须是 stylex.create() 的值：不能是 style={{}} 这样的内联样式对象。',
    },
  ],
  theming: {
    targets: [{className: 'astryx-chat-tokenized-text'}],
  },
  usage: {
    description:
      '当存储的纯文本包含应以内联 Badge 或调用方渲染的 token 内容呈现的序列化 token 值时，在聊天消息内使用 ChatTokenizedText。未匹配的文本按原样保留，空 token 值会被忽略，因此渲染总能完成。',
    bestPractices: [
      {
        guidance: true,
        description:
          '输入组件插入与消息渲染复用同一套 token 定义，使序列化值与可见标签保持一致。',
      },
      {
        guidance: true,
        description:
          '使用非空且稳定的序列化值，确保每个定义都能对应真实的消息文本。',
      },
      {
        guidance: false,
        description:
          '不要用 token 标签替代周围的消息文本；完整消息在阅读顺序下必须仍可理解。',
      },
      {
        guidance: false,
        description:
          '不要把组件自带的交互或无障碍行为放进自定义 token 渲染器；自定义 token 内容仍归调用方所有。',
      },
    ],
    anatomy: [
      {
        name: 'Tokenized text',
        required: true,
        description:
          '保留未匹配文本并承载 chat-tokenized-text 主题目标的内联根元素。',
      },
      {
        name: 'Rendered token',
        required: false,
        description:
          '结构化 token 由 Badge 渲染、自定义 token 由调用方渲染的内联 token 内容。',
      },
    ],
  },
};

export const docsZh = {
  name: 'ChatTokenizedText',
  isHiddenFromOverview: true,
  displayName: 'Chat Tokenized Text',
  description:
    '渲染带有标记模式的文本，将匹配的模式替换为内联标记内容。在 ChatMessageBubble 内使用，将 @提及、#标签或 /命令显示为样式化内容。没有非空匹配标记时以纯文本渲染。',
  propDescriptions: {
    children:
      '包含序列化标记值的纯文本消息。匹配标记值的模式将被替换为内联标记内容。',
    tokens:
      '标记定义，与输入组件使用相同类型。空值会被忽略；其他值按调用者提供的顺序进行匹配。',
    xstyle: '用于根文本包装器的额外 StyleX 样式。',
  },
  theming: {
    targets: [{className: 'astryx-chat-tokenized-text'}],
  },
};

export const docsDense = {
  name: 'ChatTokenizedText',
  isHiddenFromOverview: true,
  displayName: 'Chat Tokenized Text',
  description:
    '渲染文本，将字面 token 值替换为内联内容；空值忽略',
  usage: {
    description:
      '用于含序列化 token 值的已存储聊天文本；未匹配文本保留原样。',
    bestPractices: [
      {
        guidance: true,
        description: '展示时复用输入组件的 token 定义。',
      },
      {
        guidance: true,
        description: '使用稳定且非空的序列化值。',
      },
      {
        guidance: false,
        description:
          '不要用 token 标签替代周围消息的含义。',
      },
      {
        guidance: false,
        description:
          '不要把组件自带行为移入自定义 token 渲染器。',
      },
    ],
  },
  propDescriptions: {
    children:
      '含序列化 token 值的纯文本消息；匹配模式变为内联内容',
    tokens:
      'token 定义；字面值按调用方顺序匹配；空值忽略',
    xstyle: '根包裹层的额外 StyleX 样式',
  },
};
