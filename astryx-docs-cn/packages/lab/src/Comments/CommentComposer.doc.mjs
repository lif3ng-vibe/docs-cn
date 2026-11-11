// Copyright (c) Meta Platforms, Inc. and affiliates.

// @ts-check

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CommentComposer',
  displayName: 'Comment Composer',
  group: 'Comments',
  category: 'Chat',
  keywords: ['comment box', '评论框', 'comment input', '评论输入', 'reply box', '回复框', 'composer'],
  description:
    '评论撰写器（composer）：一个可长到五行的输入框，支持输入联想触发器与粘贴/拖放的图片，下方是附件、表情按钮和 Post。受控：草稿由你的应用持有。',
  usage: {
    description:
      '评论撰写器用于编写新评论。用在评论起始于 Comments 面板之外的场景，例如针对文本选区的边距新评论。Comments 和 CommentThread 用它处理新评论、回复与编辑。',
    anatomy: [
      {
        name: 'Quoted passage',
        required: false,
        description:
          '新行内评论所附着的段落，以弱化卡片显示在输入框上方。',
      },
      {
        name: 'Input',
        required: true,
        description:
          '随文本增长至五行。Enter 发布；Shift+Enter 换行。',
      },
      {
        name: 'Footer',
        required: true,
        description:
          '附加图片（经 `onUploadImages`）、添加表情、你的 `controls`，最后是 Post。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '评论发布成功后清空草稿；发布失败时保留草稿：用 `error` 配合 `onRetry` 展示。',
      },
      {
        guidance: true,
        description:
          '当占位符本身语义含糊时，用 `label` 按上下文命名输入框，例如“回复 Maya Chen”。',
      },
      {
        guidance: false,
        description:
          '发布期间禁用撰写器。应传 `isSubmitting`：输入框保持焦点，Post 仍可聚焦但拒绝二次按下。',
      },
      {
        guidance: false,
        description:
          '把长说明放进占位符。它随用户输入消失；指引应放在周围文本中。',
      },
    ],
  },
  props: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description: '草稿，受控。',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      required: true,
      description:
        '用户输入、选择表情或上传图片时以新草稿调用。',
    },
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      required: true,
      description:
        '由 Enter 或 Post 触发发布草稿。空草稿不会发布。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        '占位符；未设置 `label` 时兼作输入框的无障碍名称。默认为本地化的 "Write a comment…"。',
    },
    {
      name: 'label',
      type: 'string',
      description: '输入框的无障碍名称。',
    },
    {
      name: 'isSubmitting',
      type: 'boolean',
      default: 'false',
      description:
        '发布进行中冻结附件与表情按钮，并让 Post 拒绝二次按下。撰写器呈现忙碌状态。',
    },
    {
      name: 'error',
      type: 'string',
      description: '在撰写器上方显示错误 Banner。',
    },
    {
      name: 'onRetry',
      type: '() => void',
      description: '在 `error` Banner 中添加 Retry。',
    },
    {
      name: 'anchor',
      type: 'CommentAnchor',
      description:
        '新行内评论所附着的段落，引用显示在输入框上方。',
    },
    {
      name: 'onAnchorDismiss',
      type: '() => void',
      description:
        '为引用段落添加“移除引用文本”；被调用时清空 `anchor`。',
    },
    {
      name: 'highlightColor',
      type: "'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      default: "'yellow'",
      description:
        '你的应用高亮段落所用的调色板颜色；引用以其绘制分隔线。',
    },
    {
      name: 'onUploadImages',
      type: '(files: readonly File[]) => CommentUploadedImage[] | Promise<CommentUploadedImage[]>',
      description:
        '上传附加、粘贴或拖放的图片，并以 Markdown 追加到草稿。会添加附件按钮。',
    },
    {
      name: 'triggers',
      type: 'readonly ChatComposerTrigger[]',
      description: '输入联想触发器，例如 `@` 人员搜索。',
    },
    {
      name: 'agentCommands',
      type: 'readonly CommentAgentCommand[]',
      description: '评论可指名的智能体（agent）：输入 `/` 会列出它们。',
    },
    {
      name: 'hasEmojiPicker',
      type: 'boolean',
      default: 'true',
      description: '是否显示添加表情按钮。',
    },
    {
      name: 'controls',
      type: 'ReactNode',
      description: '附件与表情按钮之后由产品拥有的控件。',
    },
  ],
  examples: [
    {
      label: '新评论',
      code: `import {useState} from 'react';
import {CommentComposer} from '@astryxdesign/lab';

export default function Example() {
  const [draft, setDraft] = useState('');
  return (
    <CommentComposer
      value={draft}
      onChange={setDraft}
      onSubmit={body => {
        post(body);
        setDraft('');
      }}
    />
  );
}`,
    },
  ],
};
