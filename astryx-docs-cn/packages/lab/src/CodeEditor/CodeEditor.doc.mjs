// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CodeEditor',
  displayName: 'Code Editor',
  group: 'CodeEditor',
  category: 'Form Controls',
  keywords: ['code', '代码', 'editor', '编辑器', 'syntax', '语法', 'highlight', '高亮', 'input', 'textarea'],

  usage: {
    description:
      '基于 CSS Custom Highlight API 实现实时语法高亮的可编辑代码组件。支持行号、只读状态、占位文本与自定义分词器（tokenizer）。',
  },

  props: [
    {
      name: 'value',
      type: 'string',
      description: '编辑器的受控字符串值。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: '代码内容变化时触发的回调。',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: '可编辑区域的无障碍标签（aria-label）。',
      required: true,
    },
    {
      name: 'language',
      type: 'string',
      description: '用于语法高亮的编程语言。',
      default: "'plaintext'",
    },
    {
      name: 'hasLineNumbers',
      type: 'boolean',
      description: '在左侧显示行号边距。',
      default: 'false',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: '以只读状态渲染编辑器。',
      default: 'false',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'value 为空时显示的占位文本。',
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: '触发内部滚动前的容器最大高度。',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '代码文本的字号变体。',
      default: "'md'",
    },
    {
      name: 'tokenizer',
      type: '(code: string, language: string) => TokenLine[]',
      description: '覆盖默认语言解析的自定义分词器（tokenizer）函数。',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: '用于布局定制的 StyleX 样式。',
    },
  ],
};
