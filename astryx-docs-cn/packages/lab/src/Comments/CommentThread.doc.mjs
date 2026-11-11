// Copyright (c) Meta Platforms, Inc. and affiliates.

// @ts-check

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CommentThread',
  displayName: 'Comment Thread',
  group: 'Comments',
  category: 'Chat',
  keywords: [
    'comment',
    '评论',
    'comment thread',
    '评论线程',
    'thread',
    '线程',
    'replies',
    '回复',
    'margin comment',
    '边距评论',
    'annotation',
    '批注',
  ],
  description:
    '单独呈现的一个评论线程：首条评论、一级回复、表情回应、编辑历史、受控的输入中与已读元数据，以及回复输入框。适用于文档旁的边注、高亮下方的弹出层，或任何只显示单个线程的界面。',
  usage: {
    description:
      '评论线程展示一段对话：首条评论及其下的回复。用在只显示单个线程的界面，例如文档旁的边注卡片或从高亮处打开的弹出层。要显示多个线程并提供新评论输入框，请使用 Comments。',
    anatomy: [
      {
        name: 'Surface',
        required: true,
        description:
          '页面上的描边 Card，或卡片、弹出层内不带外框线的 Section。在其任意位置按压即可展开线程；一个视觉隐藏的切换控件承载其名称与焦点。',
      },
      {
        name: 'Quoted passage',
        required: false,
        description:
          '行内评论所讨论的段落，呈现为以高亮色描边的斜体引用块；段落被编辑移除后显示 Outdated 徽标。',
      },
      {
        name: 'First comment',
        required: true,
        description:
          '头像、标题栏（姓名、时间、Edited、Resolved 以及悬停或聚焦时显示的操作）、截断为三行的 Markdown 正文（线程展开后完整显示），以及表情回应。',
      },
      {
        name: 'Replies',
        required: false,
        description:
          'View replies 之后的一级回复，线程展开时通过头像栏与首条评论相连。宿主标记的未读回复会在不选中线程、不移动焦点、不打开回复输入框的情况下露出。',
      },
      {
        name: 'Live state',
        required: false,
        description:
          '受控的输入中状态在线程展开时跟随对话：脉动圆点显示在头像列，标签显示在评论文本行。受控的 `seenBy` 元数据仍可供评论渲染回调使用，但没有默认呈现。',
      },
      {
        name: 'Reply composer',
        required: false,
        description:
          '随线程一起打开的 CommentComposer，位于查看者头像旁。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '放在卡片或弹出层中时，设置 `container="card"` 并去掉卡片的内边距：线程自带内边距，且不绘制外框线。',
      },
      {
        guidance: true,
        description:
          '当线程从其他位置打开（例如文档中的高亮）时，控制 `isSelected`。受控选中会展开正文和回复，但不会移动焦点或打开回复输入框。',
      },
      {
        guidance: true,
        description:
          '在覆盖文档的 Popover 中，传入 `onDismiss`，并在宿主 Popover 上设置 `hasLightDismiss={false}` 和 `hasEscapeDismiss={false}`。这样在线程外按下或按 Escape 会关闭线程；但若回复或编辑中有未保存的文字，第一次只会抖动线程并保留草稿。',
      },
      {
        guidance: true,
        description:
          '将协作状态映射到 `typingUsers` 和 `seenBy`，再通过 `onComposerDraftChange` 发布本地的回复和编辑动态。`seenBy` 默认不显示，除非评论渲染回调展示它。线程从不建立连接，也不会让参与者过期。',
      },
      {
        guidance: false,
        description:
          '把多个 CommentThread 与输入框堆叠成讨论区。请使用 Comments，它一次只展开一个线程，并按动态排序线程。',
      },
      {
        guidance: false,
        description:
          '用自己的按钮或链接包裹线程来打开它。线程本身已是一个切换控件；再加一个控件会嵌套交互元素。',
      },
      {
        guidance: false,
        description:
          '传入 `onDismiss` 时仍保留宿主 Popover 的轻触关闭。浏览器会在线程保留草稿之前关闭 Popover。',
      },
    ],
    accessibility: [
      {
        name: 'Escape',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          '传入 `onDismiss` 后，只有当线程内没有打开的图层时，Escape 才会关闭线程。打开的表情选择器、菜单或对话框会先关闭，每次 Escape 只关闭一层。',
      },
      {
        name: 'Unsaved draft warning',
        category: 'Semantics',
        criterion: '4.1.3 Status Messages',
        description:
          '当关闭会丢弃未保存的回复或编辑时，线程保持打开，焦点回到草稿，礼貌型实时区域会说明草稿尚未保存、再次关闭将丢弃它。抖动从来不是唯一的提示。',
      },
      {
        name: 'Reduced motion',
        criterion: '2.3.3 Animation from Interactions',
        description:
          '在 `prefers-reduced-motion: reduce` 下线程不会抖动。焦点移动和播报仍会标记被保留的草稿。',
      },
    ],
  },
  props: [
    {
      name: 'comment',
      type: 'CommentThreadData',
      required: true,
      description:
        '线程数据：首条评论，携带其回复、表情回应、可选锚点、临时的 `typingUsers`，以及每条评论的 `seenBy` 元数据。`seenBy` 默认不渲染，但评论渲染回调可以使用。',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description:
        '线程是否展开（受控）：正文不再截断并显示回复。省略时由线程自行管理选中。宿主控制的选中从不移动焦点或打开回复输入框；查看者的回复操作才会。',
    },
    {
      name: 'onSelectedChange',
      type: '(isSelected: boolean) => void',
      description: '查看者展开或收起线程时调用。',
    },
    {
      name: 'onDismiss',
      type: '() => void',
      description:
        '把锚定宿主的轻触关闭交给线程处理。在线程外按下，或线程内没有图层处理的 Escape，都会调用它。若回复或编辑中有未保存的文字，第一次请求改为抖动线程、把焦点移回草稿并播报；紧接着的下一次请求才会关闭，输入或在线程内按下会重新启用提示。请在宿主 Popover 上同时设置 `hasLightDismiss={false}` 和 `hasEscapeDismiss={false}`。省略时线程不会关闭任何东西。',
    },
    {
      name: 'currentUser',
      type: 'CommentUser',
      description: '查看者，用于本人评论的操作和回复头像。',
    },
    {
      name: 'mode',
      type: "'interactive' | 'non-editable' | 'read-only'",
      default: "'interactive'",
      description: '显示哪些操作，与 Comments 相同。',
    },
    {
      name: 'container',
      type: "'section' | 'card'",
      default: "'section'",
      description:
        '父级表面：页面上的描边 Card，或卡片、弹出层中不带外框线的 Section。',
    },
    {
      name: 'onSubmit',
      type: '(content: string, parentCommentId?: string) => void | Promise<void>',
      description:
        '发布回复，父级始终是线程的首条评论。被拒绝的 Promise 会恢复草稿，并显示带 Retry 的错误。',
    },
    {
      name: 'onComposerDraftChange',
      type: '(value: string, context: CommentComposerContext) => void',
      description:
        '报告线程内部管理的回复和编辑草稿，包括预填内容，以及提交、取消或切换目标后的空值。请按 `context` 分发更新，并在应用中自行控制传输时机。',
    },
    {
      name: 'onSaveEdit',
      type: '(commentId: string, content: string) => void | Promise<void>',
      description:
        '为查看者自己的评论添加 Edit，并保存新的 Markdown。',
    },
    {
      name: 'onDelete',
      type: '(commentId: string) => void | Promise<void>',
      description:
        '为查看者自己的评论添加 Delete，先在对话框中确认。',
    },
    {
      name: 'onReact',
      type: '(commentId: string, reactionKey: string, option?: CommentReactionOption) => void | Promise<void>',
      description: '按稳定的键切换查看者的表情回应。',
    },
    {
      name: 'onRetryComment',
      type: '(commentId: string) => void | Promise<void>',
      description: '为 `status` 为 `error` 的评论添加 Retry。',
    },
    {
      name: 'onResolveThread',
      type: '(commentId: string) => void | Promise<void>',
      description: '为未解决的线程添加 Mark as resolved。',
    },
    {
      name: 'onReopenThread',
      type: '(commentId: string) => void | Promise<void>',
      description: '为已解决的线程添加 Reopen。',
    },
    {
      name: 'loadVersions',
      type: '(commentId: string) => Promise<readonly CommentVersion[]>',
      description: '加载评论的编辑历史，最新的在前。',
    },
    {
      name: 'onUploadImages',
      type: '(files: readonly File[], context: CommentComposerContext) => CommentUploadedImage[] | Promise<CommentUploadedImage[]>',
      description:
        '上传在回复输入框中附加、粘贴或拖入的图片，并以 Markdown 图片追加。',
    },
    {
      name: 'isSubmitting',
      type: 'boolean',
      default: 'false',
      description: '宿主控制的回复输入框等待状态。',
    },
    {
      name: 'composerPlaceholder',
      type: 'string',
      description:
        '回复输入框的占位符。默认为本地化的 "Reply to <name>…"。',
    },
    {
      name: 'highlightColor',
      type: "'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      default: "'yellow'",
      description:
        '你的应用高亮该线程所引用段落所用的调色板颜色。',
    },
    {
      name: 'reactionOptions',
      type: 'readonly CommentReactionOption[]',
      default: 'DEFAULT_COMMENT_REACTIONS',
      description: 'Add reaction 提供的表情回应选项。',
    },
    {
      name: 'agentCommands',
      type: 'readonly CommentAgentCommand[]',
      description: '回复可通过 `/` 命令指名的智能体（agent）。',
    },
    {
      name: 'composerTriggers',
      type: 'readonly ChatComposerTrigger[]',
      description:
        '回复输入框的输入联想触发器，例如 `@` 人员搜索。',
    },
    {
      name: 'markdownPlugins',
      type: 'readonly MarkdownPluginEntry[]',
      description: '评论正文的块级 Markdown 插件。',
    },
    {
      name: 'markdownInlinePlugins',
      type: 'readonly MarkdownInlinePlugin[]',
      description:
        '评论正文的行内 Markdown 插件，例如提及。',
    },
    {
      name: 'getReplyMention',
      type: '(author: CommentUser) => string | undefined',
      description: '回复某条回复时，用提及其作者的内容预填。',
    },
    {
      name: 'hasEmojiPicker',
      type: 'boolean',
      default: 'true',
      description: '回复输入框是否提供表情选择器。',
    },
    {
      name: 'renderAnchor',
      type: '(comment: CommentThreadData, defaultAnchor: ReactNode) => ReactNode',
      description: '替换线程的引用段落。',
    },
    {
      name: 'renderBody',
      type: '(comment: CommentData) => ReactNode',
      description: '替换评论的 Markdown 正文。',
    },
    {
      name: 'renderVersionBody',
      type: '(version: CommentVersion) => ReactNode',
      description: '替换编辑历史中某个版本的正文。',
    },
    {
      name: 'renderAdditionalActions',
      type: '(comment: CommentData) => ReactNode',
      description: '向评论标题栏添加产品操作。',
    },
    {
      name: 'renderComposer',
      type: '(props: CommentComposerRenderProps) => ReactNode',
      description:
        '替换回复输入框的输入区域，线程仍保留其草稿和状态。',
    },
  ],
  examples: [
    {
      label: '边注评论',
      code: `import {Card} from '@astryxdesign/core/Card';
import {CommentThread} from '@astryxdesign/lab';

<Card padding={0} width={320}>
  <CommentThread
    comment={{
      id: 'margin',
      author: {id: 'maya', name: 'Maya Chen'},
      body: 'Should this say three days? The dry run adds one.',
      createdAt: '2026-09-30T19:00:00Z',
      anchor: {quote: 'The final cohort completes rollout in two days.'},
    }}
    currentUser={{id: 'avery', name: 'Avery Kim'}}
    container="card"
    onSubmit={(body, parentId) => postReply(parentId, body)}
  />
</Card>`,
    },
    {
      label: '保留未保存草稿的弹出层',
      code: `import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Popover} from '@astryxdesign/core/Popover';
import {CommentThread} from '@astryxdesign/lab';

function CommentPopover({thread, viewer}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      hasLightDismiss={false}
      hasEscapeDismiss={false}
      label="Comment"
      padding={0}
      width={340}
      content={
        <CommentThread
          comment={thread}
          currentUser={viewer}
          container="card"
          isSelected
          onSubmit={(body, parentId) => postReply(parentId, body)}
          onDismiss={() => setIsOpen(false)}
        />
      }>
      <Button label="1 comment" variant="secondary" />
    </Popover>
  );
}`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  description:
    '单独呈现的一个评论线程：首条评论、一级回复、表情回应、编辑历史、受控的输入中与已读元数据，以及回复输入框。适用于文档旁的边注、高亮下方的弹出层，或任何只显示单个线程的界面。',
  usage: {
    description:
      '评论线程展示一段对话：首条评论及其下的回复。用于只显示单个线程的界面，例如文档旁的边注卡片，或从高亮处打开的弹出层。要显示多个线程并提供新评论输入框，请使用 Comments。',
    bestPractices: [
      {
        guidance: true,
        description:
          '放在卡片或弹出层中时，设置 `container="card"` 并去掉卡片的内边距：线程自带内边距，且不绘制外框线。',
      },
      {
        guidance: true,
        description:
          '当线程从其他位置打开（例如文档中的高亮）时，控制 `isSelected`。受控选中会展开正文和回复，但不会移动焦点或打开回复输入框。',
      },
      {
        guidance: true,
        description:
          '在覆盖文档的 Popover 中，传入 `onDismiss`，并在宿主 Popover 上设置 `hasLightDismiss={false}` 和 `hasEscapeDismiss={false}`。这样在线程外按下或按 Escape 会关闭线程；但若回复或编辑中有未保存的文字，第一次只会抖动线程并保留草稿。',
      },
      {
        guidance: true,
        description:
          '将协作状态映射到 `typingUsers` 和 `seenBy`，再通过 `onComposerDraftChange` 发布本地的回复和编辑动态。`seenBy` 默认不显示，除非评论渲染回调展示它。线程从不建立连接，也不会让参与者过期。',
      },
      {
        guidance: false,
        description:
          '把多个 CommentThread 与输入框堆叠成讨论区。请使用 Comments，它一次只展开一个线程，并按动态排序线程。',
      },
      {
        guidance: false,
        description:
          '用自己的按钮或链接包裹线程来打开它。线程本身已是一个切换控件；再加一个控件会嵌套交互元素。',
      },
      {
        guidance: false,
        description:
          '传入 `onDismiss` 时仍保留宿主 Popover 的轻触关闭。浏览器会在线程保留草稿之前关闭 Popover。',
      },
    ],
    accessibility: [
      {
        name: 'Escape',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          '传入 `onDismiss` 后，只有当线程内没有打开的图层时，Escape 才会关闭线程。打开的表情选择器、菜单或对话框会先关闭，每次 Escape 只关闭一层。',
      },
      {
        name: '未保存草稿提示',
        category: 'Semantics',
        criterion: '4.1.3 Status Messages',
        description:
          '当关闭会丢弃未保存的回复或编辑时，线程保持打开，焦点回到草稿，礼貌型实时区域会说明草稿尚未保存，再次关闭将丢弃它。抖动从来不是唯一的提示。',
      },
      {
        name: '减少动态效果',
        criterion: '2.3.3 Animation from Interactions',
        description:
          '在 `prefers-reduced-motion: reduce` 下线程不会抖动。焦点移动和播报仍会提示草稿已保留。',
      },
    ],
  },
  propDescriptions: {
    comment:
      '线程：首条评论，携带其回复、表情回应、可选锚点、临时的 `typingUsers`，以及每条评论的 `seenBy` 元数据。`seenBy` 默认不渲染，但评论渲染回调可以使用。',
    isSelected:
      '线程是否展开（受控）：正文不截断并显示回复。省略时由线程自行管理选中。宿主控制的选中从不移动焦点或打开回复输入框；查看者点击“回复”才会。',
    onSelectedChange: '查看者展开或收起线程时调用。',
    onDismiss:
      '把锚定宿主的轻触关闭交给线程处理。在线程外按下，或线程内没有图层处理的 Escape，都会调用它。若回复或编辑中有未保存的文字，第一次请求改为抖动线程、把焦点移回草稿并播报；紧接着的下一次请求才会关闭，输入或在线程内按下会重新启用提示。请在宿主 Popover 上同时设置 `hasLightDismiss={false}` 和 `hasEscapeDismiss={false}`。省略时线程不会关闭任何东西。',
    currentUser: '查看者，用于本人评论的操作和回复头像。',
    mode: '显示哪些操作，与 Comments 相同。',
    container:
      '父级界面：页面上的描边 Card，或卡片、弹出层中不带外框线的 Section。',
    onSubmit:
      '发布回复，父级始终是线程的首条评论。被拒绝的 Promise 会恢复草稿，并显示带“重试”的错误。',
    onComposerDraftChange:
      '报告线程内部管理的回复和编辑草稿，包括预填内容，以及提交、取消或切换目标后的空值。请按 `context` 分发更新，并在应用中自行控制传输时机。',
    onSaveEdit: '为查看者自己的评论添加“编辑”，并保存新的 Markdown。',
    onDelete: '为查看者自己的评论添加“删除”，先在对话框中确认。',
    onReact: '按稳定的键切换查看者的表情回应。',
    onRetryComment: '为 `status` 为 `error` 的评论添加“重试”。',
    onResolveThread: '为未解决的线程添加“标记为已解决”。',
    onReopenThread: '为已解决的线程添加“重新打开”。',
    loadVersions: '加载评论的编辑历史，最新的在前。',
    onUploadImages:
      '上传在回复输入框中附加、粘贴或拖入的图片，并以 Markdown 图片追加。',
    isSubmitting: '宿主控制的回复输入框等待状态。',
    composerPlaceholder: '回复输入框的占位文字。默认为本地化的“回复 <name>…”。',
    highlightColor: '应用中高亮该线程所引用段落的调色板颜色。',
    reactionOptions: '“添加表情回应”提供的选项。',
    agentCommands: '回复可以通过 `/` 命令呼叫的智能体。',
    composerTriggers: '回复输入框的联想触发器，例如 `@` 人员搜索。',
    markdownPlugins: '评论正文的块级 Markdown 插件。',
    markdownInlinePlugins: '评论正文的行内 Markdown 插件，例如提及。',
    getReplyMention: '回复某条回复时，用提及其作者的内容预填。',
    hasEmojiPicker: '回复输入框是否提供表情选择器。',
    renderAnchor: '替换线程引用的段落。',
    renderBody: '替换评论的 Markdown 正文。',
    renderVersionBody: '替换编辑历史中某个版本的正文。',
    renderAdditionalActions: '向评论标题栏添加产品操作。',
    renderComposer: '替换回复输入框的输入区域，线程仍保留其草稿和状态。',
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    '单独呈现的一个评论线程：首条评论、一级回复、表情回应、编辑历史、受控的输入中/已读元数据、回复输入框。适用于边注评论、高亮弹出层、任何单线程表面。',
  usage: {
    description:
      '一段对话：首条评论加回复。用于边注卡片或高亮弹出层。多个线程加新评论输入框：用 Comments。',
    bestPractices: [
      {
        guidance: true,
        description:
          '卡片或弹出层中：`container="card"`、卡片 padding 0。线程自带内边距，不绘制外框线。',
      },
      {
        guidance: true,
        description:
          '从其他位置打开（文档高亮）时控制 `isSelected`。展开正文和回复，但不移动焦点、不打开输入框。',
      },
      {
        guidance: true,
        description:
          '覆盖文档的 Popover 中：传 `onDismiss`，宿主上设 `hasLightDismiss={false}` 和 `hasEscapeDismiss={false}`。外部按压或 Escape 关闭；对未保存回复/编辑的第一次请求会抖动并保留草稿。',
      },
      {
        guidance: true,
        description:
          '把协作状态映射到 `typingUsers`/`seenBy`；经 `onComposerDraftChange` 发布本地草稿。`seenBy` 默认隐藏，渲染回调可显示。不建连接、不让参与者过期。',
      },
      {
        guidance: false,
        description:
          '把 CommentThread 加输入框堆叠成讨论区。用 Comments。',
      },
      {
        guidance: false,
        description:
          '用自己的按钮/链接包裹线程。它本身已是一个切换控件。',
      },
      {
        guidance: false,
        description:
          '传 `onDismiss` 时保留宿主 Popover 的轻触关闭。浏览器会在线程保留草稿之前关闭它。',
      },
    ],
    accessibility: [
      {
        name: 'Escape',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          '有 `onDismiss` 时，Escape 仅在无内层打开时关闭线程。选择器、菜单或对话框先关闭，每次 Escape 关一层。',
      },
      {
        name: 'Unsaved draft warning',
        category: 'Semantics',
        criterion: '4.1.3 Status Messages',
        description:
          '对未保存回复/编辑的关闭会保持线程打开、焦点回到草稿并礼貌播报。抖动从不是唯一信号。',
      },
      {
        name: 'Reduced motion',
        criterion: '2.3.3 Animation from Interactions',
        description:
          '`prefers-reduced-motion: reduce` 下不抖动；焦点与播报保留。',
      },
    ],
  },
  propDescriptions: {
    comment:
      '线程：首条评论及其回复、表情回应、可选锚点、临时 `typingUsers`、每条评论的 `seenBy`（默认不渲染）。',
    isSelected:
      '受控展开状态。省略则非受控。从不移动焦点或打开输入框。',
    onSelectedChange: '查看者展开或收起了线程。',
    onDismiss:
      '线程接管锚定宿主的轻触关闭：外部按压或未处理的 Escape 调用它。对未保存回复/编辑，第一次请求抖动、焦点回草稿、播报；紧接着的下一次才关闭。输入或线程内按压会重新布防。与宿主 `hasLightDismiss={false}`、`hasEscapeDismiss={false}` 配对使用。',
    currentUser: '查看者：本人评论操作、回复头像。',
    mode: '显示哪些操作，与 Comments 相同。',
    container:
      '父级表面：页面上的描边 Card，或卡片/弹出层中无框线的 Section。',
    onSubmit:
      '发布回复；父级始终是首条评论。拒绝时恢复草稿并显示 Retry。',
    onComposerDraftChange:
      '报告回复/编辑草稿、预填内容，以及提交、取消或切换目标后的空值。按 `context` 分发。',
    onSaveEdit: '为本人评论添加 Edit；保存新 Markdown。',
    onDelete: '为本人评论添加 Delete，先在对话框确认。',
    onReact: '按稳定键切换查看者的表情回应。',
    onRetryComment: '为 `status: error` 的评论添加 Retry。',
    onResolveThread: '为未解决的线程添加 Mark as resolved。',
    onReopenThread: '为已解决的线程添加 Reopen。',
    loadVersions: '加载编辑历史，最新在前。',
    onUploadImages: '上传输入框图片；追加 Markdown 图片。',
    isSubmitting: '宿主控制的回复输入框等待状态。',
    composerPlaceholder:
      '回复占位符。默认：本地化的 "Reply to <name>…"。',
    highlightColor: '段落高亮的调色板颜色。',
    reactionOptions: 'Add reaction 提供的表情回应。',
    agentCommands: '回复可用 `/` 指名的智能体（agent）。',
    composerTriggers: '回复输入联想触发器，如 `@` 人员搜索。',
    markdownPlugins: '正文的块级 Markdown 插件。',
    markdownInlinePlugins: '正文的行内 Markdown 插件，如提及。',
    getReplyMention: '回复某条回复时用作者提及预填。',
    hasEmojiPicker: '回复输入框是否提供表情选择器。',
    renderAnchor: '替换引用段落。',
    renderBody: '替换评论的 Markdown 正文。',
    renderVersionBody: '替换历史版本的正文。',
    renderAdditionalActions: '向评论标题栏添加产品操作。',
    renderComposer: '替换回复输入；线程保留草稿与状态。',
  },
};
