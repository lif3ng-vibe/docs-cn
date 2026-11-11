// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatMessageBubble',
  subComponentOf: 'Chat',
  displayName: 'Chat Message Bubble',
  isHiddenFromOverview: true,
  description:
    '聊天"气泡"的样式化内容容器。从父级 ChatMessage 上下文读取发送者，自动设置背景样式。标准消息用 filled；内容需要对齐但不需要可见边界时用 ghost。支持与气泡内边距对齐的 name/metadata 插槽，并可通过 group prop 为同一发送者的连续消息做多气泡分组。',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: '气泡内容：文本、Markdown 或任意 ReactNode。',
      required: true,
    },
    {
      name: 'variant',
      type: "'filled' | 'ghost'",
      description:
        "视觉变体。'filled' 渲染发送者颜色背景（默认）。'ghost' 渲染透明背景但保留内边距以对齐。",
      default: "'filled'",
    },
    {
      name: 'name',
      type: 'ReactNode',
      description:
        '渲染在气泡上方的发送者名称，与气泡文本内边距对齐。用于消息中的第一个气泡。不渲染的标量值（null、undefined、布尔值和空字符串）会省略对齐容器；数字 0 仍保持对齐。若首个内容是原始内容（无气泡），请改用 ChatMessage 的 `name` prop。',
    },
    {
      name: 'metadata',
      type: 'ReactNode',
      description:
        '渲染在气泡下方的元数据内容，与气泡文本内边距对齐。用于消息中的最后一个气泡。不渲染的标量值（null、undefined、布尔值和空字符串）会省略对齐容器；数字 0 仍保持对齐。若末尾内容是原始内容（无气泡），请改用 ChatMessage 的 `metadata` prop。',
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
      name: 'group',
      type: "'first' | 'middle' | 'last'",
      description:
        '在多气泡组中的位置。控制发送者一侧圆角的缩减。独立气泡保持未设置（完整圆角）。',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        '气泡的宽度（数字 = 像素，字符串 = 按原样使用）。设置后替代默认的 max(80%, 280px) 宽度上限。与 variant="ghost" 组合，可让自定义内容（如 artifact 卡片、附件）占满整个消息列。',
    },
  ],
};

export const docsZh = {
  name: 'ChatMessageBubble',
  isHiddenFromOverview: true,
  displayName: 'Chat Message Bubble',
  description:
    '样式化的气泡容器，从父上下文读取发送者信息进行自动样式化。支持 name/metadata 插槽、多气泡分组和透明变体。',
  propDescriptions: {
    children: '气泡内容：文本、Markdown 或任何 ReactNode。',
    variant:
      "视觉变体。'filled' 渲染发送者颜色背景，'ghost' 渲染透明背景但保持填充对齐。",
    name: '气泡上方渲染的发送者名称，与气泡文本内边距对齐。null、undefined、布尔值和空字符串会省略对齐容器；数字 0 仍保持对齐。用于消息中的第一个气泡。',
    metadata:
      '气泡下方渲染的元数据内容，与气泡文本内边距对齐。null、undefined、布尔值和空字符串会省略对齐容器；数字 0 仍保持对齐。用于消息中的最后一个气泡。',
    group: '多气泡组中的位置。控制发送者侧的圆角缩减。',
    width:
      '气泡宽度（数字 = 像素，字符串 = 按原样使用）。设置后替代默认的 max(80%, 280px) 宽度上限；与 ghost 变体组合可让自定义内容占满消息列宽度。',
  },
};

export const docsDense = {
  name: 'ChatMessageBubble',
  isHiddenFromOverview: true,
  displayName: 'Chat Message Bubble',
  description:
    '样式化气泡容器；从上下文读取发送者；支持 name/metadata 插槽、group 圆角、ghost 变体',
  propDescriptions: {
    children: '气泡内容：文本、Markdown、任意 ReactNode',
    variant: 'filled（发送者背景）或 ghost（透明，保留内边距）',
    name: '气泡上方的发送者名称；不渲染的标量值省略；数字 0 保持对齐',
    displayName: '气泡上方的发送者名称，与气泡内边距对齐',
    metadata:
      '气泡下方的元数据；不渲染的标量值省略；数字 0 保持对齐',
    group: '多气泡组中的位置；控制圆角缩减',
    width:
      '气泡宽度（数字=px，字符串=原样）；替代默认 max(80%,280px) 上限；ghost+width="100%" 占满消息列',
  },
};
