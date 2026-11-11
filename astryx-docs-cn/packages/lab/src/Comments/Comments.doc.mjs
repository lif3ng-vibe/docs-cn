// Copyright (c) Meta Platforms, Inc. and affiliates.

// @ts-check

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Comments',
  displayName: 'Comments',
  group: 'Comments',
  category: 'Chat',
  keywords: [
    'discussion',
    '讨论',
    'comments',
    '评论',
    'comment thread',
    '评论线程',
    'threads',
    '线程',
    'replies',
    '回复',
    'reactions',
    '表情回应',
    'activity',
    '动态',
    'timeline',
    '时间线',
    'inline comments',
    '行内评论',
    'annotations',
    '批注',
    'review',
    '评审',
    'conversation',
    '对话',
  ],
  description:
    '单个条目上的评论：带一级回复的评论线程、表情回应、编辑历史、受控的输入中与已读元数据、行内评论引用，以及按时间排序的活动事件，并配有新评论输入框。受控：数据与每次变更都由你的应用持有；面板负责呈现、选中与焦点。',
  usage: {
    description:
      'Comments 面板展示关于文档、任务或记录的对话：其评论线程与动态，并配有新评论输入框。可作填充定高容器的侧边面板或区块，也可按内容高度嵌入卡片或弹出层。单线程用 CommentThread 渲染，独立输入框用 CommentComposer。',
    anatomy: [
      {
        name: 'Thread',
        required: true,
        description:
          'section 父级上是描边 Card，card 父级上是带 1px 分隔线的贴边 Section。选中它展开线程：正文不再截断、回复显示、回复输入框打开，指针按压时焦点进入输入框。',
      },
      {
        name: 'Avatar',
        required: true,
        description:
          '28×28 的图片或首字母：人用圆形，智能体（agent）用圆角方形。线程展开时一条 2px 头像栏分段连接各头像。',
      },
      {
        name: 'Header',
        required: true,
        description:
          '一个头像的高度：姓名、相对时间、Edited（打开编辑历史）和 Resolved。指针或焦点停在线程上时显示 Mark as resolved 或 Reopen、Add reaction、Reply、Copy link 和更多菜单（Edit、Delete）；空间不足时折叠进更多菜单。',
      },
      {
        name: 'Quoted passage',
        required: false,
        description:
          '行内评论将其引用段落呈现为斜体引用块，分隔线取高亮色。被编辑移除的段落保留中性分隔线和 Outdated 徽标。',
      },
      {
        name: 'Body',
        required: true,
        description:
          'Markdown，线程展开前截断为三行。图片在 Lightbox 中打开。仍在撰写中的评论显示其进度。',
      },
      {
        name: 'Reactions',
        required: false,
        description:
          '每种表情回应一个切换按钮，查看者回应过的呈按压态；其提示列出回应者。',
      },
      {
        name: 'Replies',
        required: false,
        description:
          '一级回复，藏在 View replies 之后。宿主标记的未读回复会在不选中线程、不移动焦点、不打开回复输入框的情况下露出。回复某条回复会发布到线程。',
      },
      {
        name: 'Live state',
        required: false,
        description:
          '受控的输入中状态显示在展开线程的末尾：脉动圆点在头像列，标签在评论文本行。受控的 `seenBy` 元数据可供评论渲染回调使用，但没有默认呈现。',
      },
      {
        name: 'Activity event',
        required: false,
        description:
          '状态变更或其他事件的时间线行，按时间与线程交错排列。',
      },
      {
        name: 'Composer',
        required: false,
        description:
          '停靠在底部（或顶部）的两行 CommentComposer：输入框在附件、表情按钮和 Post 之上。',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          '保持数据受控：每次回调后更新 `comments`。返回 Promise，让面板显示等待状态；Promise 被拒绝时显示带 Retry 的错误。',
      },
      {
        guidance: true,
        description:
          '匹配所在表面：给面板容器确定的高度；在卡片或弹出层内使用 `layout="embedded"`；card 父级上设置 `container="card"`，避免卡片嵌套。',
      },
      {
        guidance: true,
        description:
          '行内评论的锚定逻辑放在你的应用中：为每个线程传 `anchor`，段落不再能解析时标记 `orphaned`，并让 `selectedThreadId` 与你高亮的段落保持同步。',
      },
      {
        guidance: true,
        description:
          '实时状态保持受控且与传输无关：把协作层映射到 `typingUsers` 和 `seenBy`，用 `onComposerDraftChange` 发布本地动态。`seenBy` 默认隐藏，除非评论渲染回调展示它。瞬态动态的去抖与过期由你的应用处理。',
      },
      {
        guidance: false,
        description:
          '在渲染插槽中做数据获取、鉴权或埋点。应保留在你的应用中，把结果作为数据传入。',
      },
      {
        guidance: false,
        description:
          '以为 `selectedThreadId` 会移动焦点或打开输入框。它只是展开并滚动到受控线程，不打断查看者；只有查看者的 Reply 操作才会打开回复输入框。',
      },
    ],
    accessibility: [
      {
        name: 'Comment list',
        category: 'Semantics',
        description:
          '线程位于一个以区域命名的 log 中，例如 "Threads in Launch plan"，屏幕阅读器会礼貌地听到新评论。每条评论是一篇以作者命名的 article，评论加载期间区域报告 busy。',
      },
      {
        name: 'Live updates',
        category: 'Content',
        criterion: '4.1.3 Status Messages',
        description:
          '输入中是礼貌型状态消息，圆点动效在减弱动效下安全。`seenBy` 元数据没有默认呈现，也不引入额外的实时区域。',
      },
      {
        name: 'Thread toggle',
        category: 'Keyboard',
        criterion: '2.1.1 Keyboard',
        description:
          '每个线程有一个切换按钮（WAI-ARIA Button 模式，带 aria-pressed），名称为 "Thread by" 加作者。Enter 或空格展开或收起它并保持焦点在其上；在线程上按压指针则展开它并把焦点放进回复输入框。切换按钮持有焦点时整个表面显示系统焦点环。',
      },
      {
        name: 'Replies and actions',
        category: 'Keyboard',
        description:
          'View replies 是带 aria-expanded 和 aria-controls 的展开按钮（WAI-ARIA Disclosure 模式）。更多菜单遵循 Menu Button 模式；编辑保存或取消、删除对话框关闭时，焦点回到它。',
      },
      {
        name: 'Focus after changes',
        category: 'Keyboard',
        criterion: '2.4.3 Focus Order',
        description:
          '焦点从不掉落到页面。删除后焦点移到下一个线程；删除的是回复则移到所在线程。Load earlier comments 保持焦点在自己身上，加载失败时移到替换它的 Retry。面板挂载时已选中的线程展开但不夺取焦点。',
      },
      {
        name: 'Busy actions',
        category: 'Keyboard',
        description:
          '请求进行中 Post 与表情回应保持可聚焦并拒绝二次按下，因此焦点不会在请求中途掉落到页面。',
      },
      {
        name: 'Errors',
        category: 'Content',
        criterion: '4.1.3 Status Messages',
        description:
          '失败显示在出错处旁边的错误 Banner 中，操作可重试时附带 Retry。Banner 自身不带 live 角色：其失败通过共享播报通道坚定地播报一次，除非它位于聊天记录内、由记录负责播报。撰写中评论的进度标签遵循同一规则，以礼貌方式播报。编辑历史对话框通过对话框内的 alert 区域播报其失败。删除失败会随着确认对话框文本变化被坚定地播报一次。',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-comments',
        visualProps: ['layout', 'density', 'container'],
      },
      {
        className: 'astryx-comment-thread',
        visualProps: ['container'],
      },
      {
        className: 'astryx-comment-composer',
      },
    ],
  },
  components: [
    {
      name: 'Comments',
      displayName: 'Comments',
      description:
        '按时间排序的评论线程与活动事件，配有新评论输入框以及线程打开的各对话框。',
      props: [
        {
          name: 'comments',
          type: 'readonly CommentThreadData[]',
          required: true,
          description:
            '线程数据：每个线程的首条评论，携带 `replies`（一级）、`reactions`、临时的 `typingUsers`、隐藏的每评论 `seenBy` 元数据、行内评论的 `anchor`、`isResolved`、`status`、`progress`，以及每评论权限。`seenBy` 仍可供评论渲染回调使用。与 `events` 一起按时间顺序显示。',
        },
        {
          name: 'events',
          type: 'readonly CommentActivityEvent[]',
          description:
            '条目上的活动，按 `createdAt` 与线程交错排列为紧凑的时间线行。',
        },
        {
          name: 'currentUser',
          type: 'CommentUser',
          description:
            '查看者：本人的评论会获得 Edit 和 Delete，其头像位于回复输入框旁。鉴权留在你的应用。',
        },
        {
          name: 'mode',
          type: "'interactive' | 'non-editable' | 'read-only'",
          default: "'interactive'",
          description:
            '`interactive` 启用所有被允许的操作；`non-editable` 保留创建、回复和回应，移除编辑与删除；`read-only` 移除一切会更改数据的控件。',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Comments 区域的无障碍名称。默认为本地化的 "Comments"。',
        },
        {
          name: 'composerPosition',
          type: "'top' | 'bottom' | 'none'",
          default: "'bottom'",
          description: '新评论输入框渲染的位置。',
        },
        {
          name: 'density',
          type: "'compact' | 'balanced'",
          default: "'balanced'",
          description: '线程之间及列表周围的间距。',
        },
        {
          name: 'container',
          type: "'section' | 'card'",
          default: "'section'",
          description:
            '父级表面。`section` 把每个线程渲染为描边 Card；`card` 渲染以分隔线为界的 Section，相邻分隔线重叠为单条线。',
        },
        {
          name: 'layout',
          type: "'pane' | 'embedded'",
          default: "'pane'",
          description:
            '`pane` 填满容器并滚动，输入框停靠。`embedded` 在宿主表面内取内容高度：无滚动区域或停靠，card 父级上也不绘制外框线。',
        },
        {
          name: 'composerPlaceholder',
          type: 'string',
          description:
            '新评论输入框的占位符。默认为本地化的 "Write a comment…"，回复为 "Reply to <name>…"；自定义值同时替换两者。',
        },
        {
          name: 'selectedThreadId',
          type: 'string | null',
          description:
            '展开的线程（受控），供需要把线程与文档同步的宿主使用。宿主选中的线程会展开正文和回复并滚动进入视野，但不移动焦点、不打开回复输入框。',
        },
        {
          name: 'onSelectedThreadChange',
          type: '(threadId: string | null) => void',
          description:
            '查看者展开某线程或收起当前线程时调用。',
        },
        {
          name: 'composerAnchor',
          type: 'CommentAnchor',
          description:
            '新评论将要附着的段落，引用显示在输入框中。面板在屏期间到达的锚点会把焦点移到输入框。',
        },
        {
          name: 'onComposerAnchorDismiss',
          type: '() => void',
          description:
            '为输入框的引用添加“移除引用文本”；被调用时清空 `composerAnchor`。',
        },
        {
          name: 'composerControls',
          type: 'ReactNode',
          description:
            '新评论输入框页脚中由产品拥有的控件，位于附件与表情按钮之后。',
        },
        {
          name: 'highlightColor',
          type: "'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
          default: "'yellow'",
          description:
            '你的应用高亮段落所用的调色板颜色。引用以对应的 `--color-border-<color>` 令牌绘制分隔线。',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          default: 'false',
          description:
            '显示评论形状的占位符，并将区域报告为 busy。',
        },
        {
          name: 'loadError',
          type: 'string',
          description:
            '在线程上方显示错误 Banner，用于加载失败的评论。',
        },
        {
          name: 'onRetryLoad',
          type: '() => void | Promise<void>',
          description:
            '在 `loadError` Banner 中添加 Retry；返回 Promise 会让 Retry 保持忙碌直至落定。',
        },
        {
          name: 'hasOlderComments',
          type: 'boolean',
          default: 'false',
          description: '在线程上方显示 Load earlier comments。',
        },
        {
          name: 'isLoadingOlder',
          type: 'boolean',
          default: 'false',
          description:
            '应用拉取上一页期间让 Load earlier comments 保持忙碌。`onLoadOlder` 返回的 Promise 会自动做到这一点。',
        },
        {
          name: 'onLoadOlder',
          type: '() => void | Promise<void>',
          description:
            '加载上一页：将其前插到 `comments`。被拒绝的 Promise 会显示错误 Banner，其 Retry 替代该按钮。',
        },
        {
          name: 'isSubmitting',
          type: 'boolean',
          default: 'false',
          description:
            '宿主控制的输入框等待状态。Promise 回调也自带内置等待状态。',
        },
        {
          name: 'onComposerDraftChange',
          type: '(value: string, context: CommentComposerContext) => void',
          description:
            '报告 Comments 内部持有的草稿：新评论、回复和编辑。包含程序化预填内容，并在提交、取消或切换目标后报告空值。按 `context` 分发每次更新；输入去抖与过期由你的应用处理。',
        },
        {
          name: 'composerError',
          type: 'string',
          description:
            '宿主控制的错误，显示在新评论输入框上方。被拒绝的 `onSubmit` 会显示自己的带 Retry 错误。',
        },
        {
          name: 'reactionOptions',
          type: 'readonly CommentReactionOption[]',
          default: 'DEFAULT_COMMENT_REACTIONS',
          description:
            'Add reaction 提供的表情回应：默认为 Like、Love、Haha、Wow、Sad 和 Celebrate，以查看者的语言命名。自定义选项请提供 `description` 来命名。',
        },
        {
          name: 'onSubmit',
          type: '(content: string, parentCommentId?: string) => void | Promise<void>',
          description:
            '发布评论或回复。回复的父级始终是线程的首条评论。被拒绝的 Promise 会恢复草稿并显示带 Retry 的错误。',
        },
        {
          name: 'onSaveEdit',
          type: '(commentId: string, content: string) => void | Promise<void>',
          description:
            '为查看者自己的评论添加 Edit，并保存新的 Markdown。被拒绝的 Promise 显示带 Retry 的错误 Banner。',
        },
        {
          name: 'onDelete',
          type: '(commentId: string) => void | Promise<void>',
          description:
            '为查看者自己的评论添加 Delete，先在对话框中确认。被拒绝的 Promise 让对话框带着错误保持打开。',
        },
        {
          name: 'onRetryComment',
          type: '(commentId: string) => void | Promise<void>',
          description: '为 `status` 为 `error` 的评论添加 Retry。',
        },
        {
          name: 'onReact',
          type: '(commentId: string, reactionKey: string, option?: CommentReactionOption) => void | Promise<void>',
          description: '按稳定的键切换查看者的表情回应。',
        },
        {
          name: 'onResolveThread',
          type: '(commentId: string) => void | Promise<void>',
          description:
            '为未解决的线程添加 Mark as resolved。调用成功后设置 `isResolved`，并在不该显示的地方过滤已解决线程。',
        },
        {
          name: 'onReopenThread',
          type: '(commentId: string) => void | Promise<void>',
          description:
            '为已解决的线程添加 Reopen。调用成功后清空 `isResolved`。',
        },
        {
          name: 'loadVersions',
          type: '(commentId: string) => Promise<readonly CommentVersion[]>',
          description:
            '加载评论的编辑历史，最新的在前。数据已加载时 `previousVersions` 可直接使用。',
        },
        {
          name: 'onUploadImages',
          type: '(files: readonly File[], context: CommentComposerContext) => CommentUploadedImage[] | Promise<CommentUploadedImage[]>',
          description:
            '上传在输入框中附加、粘贴或拖入的图片，并以 Markdown 图片追加。你的服务端负责鉴权查看者并校验文件。',
        },
        {
          name: 'composerTriggers',
          type: 'readonly ChatComposerTrigger[]',
          description:
            '所有输入框的输入联想触发器，例如 `@` 人员搜索，其令牌由你的 Markdown 插件渲染。',
        },
        {
          name: 'agentCommands',
          type: 'readonly CommentAgentCommand[]',
          description:
            '评论可指名的智能体（agent）：输入 `/` 会列出它们，发布后的评论把命令显示为该智能体的芯片。智能体由你的应用运行。',
        },
        {
          name: 'markdownPlugins',
          type: 'readonly MarkdownPluginEntry[]',
          description:
            '评论正文的块级 Markdown 插件，例如你自己实体的嵌入卡片。',
        },
        {
          name: 'markdownInlinePlugins',
          type: 'readonly MarkdownInlinePlugin[]',
          description:
            '评论正文的行内 Markdown 插件，例如你的触发器插入的提及。',
        },
        {
          name: 'getReplyMention',
          type: '(author: CommentUser) => string | undefined',
          description:
            '回复某条回复时，以你的提及格式用其作者的提及预填。',
        },
        {
          name: 'hasEmojiPicker',
          type: 'boolean',
          default: 'true',
          description: '输入框是否提供表情选择器。',
        },
        {
          name: 'emptyState',
          type: 'ReactNode',
          description: '替换默认的暂无评论状态。',
        },
        {
          name: 'renderAnchor',
          type: '(comment: CommentThreadData, defaultAnchor: ReactNode) => ReactNode',
          description:
            '替换线程的引用段落，例如链接回文档。',
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
          name: 'renderEvent',
          type: '(event: CommentActivityEvent) => ReactNode',
          description: '替换活动事件的时间线行。',
        },
        {
          name: 'renderAdditionalActions',
          type: '(comment: CommentData) => ReactNode',
          description:
            '向评论标题栏添加产品操作，位于内置操作之后。',
        },
        {
          name: 'renderComposer',
          type: '(props: CommentComposerRenderProps) => ReactNode',
          description:
            '替换所有输入框的输入区域，面板仍保留草稿、等待、错误与上下文状态。你的输入框自行处理焦点与键盘。',
        },
      ],
    },
    {name: 'CommentThread'},
    {name: 'CommentComposer'},
  ],
  playground: {
    defaults: {
      comments: [
        {
          id: 'preview-root',
          author: {id: 'avery', name: 'Avery Kim'},
          body: '最终状态已可评审。',
          createdAt: '2026-09-30T19:00:00Z',
          reactions: [
            {
              key: 'like',
              label: '👍',
              count: 2,
              reactedByViewer: true,
            },
          ],
          replies: [
            {
              id: 'preview-reply',
              author: {id: 'maya', name: 'Maya Chen'},
              body: '评审了空状态与错误状态。',
              createdAt: '2026-09-30T19:10:00Z',
            },
          ],
        },
      ],
      events: [
        {
          id: 'preview-event',
          label: '状态变更为 Ready for review',
          createdAt: '2026-09-30T19:15:00Z',
        },
      ],
      currentUser: {id: 'avery', name: 'Avery Kim'},
      mode: 'read-only',
      density: 'compact',
      container: 'section',
    },
  },
  examples: [
    {
      label: '评论面板',
      code: `import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Layout';
import {Comments} from '@astryxdesign/lab';

const viewer = {id: 'avery', name: 'Avery Kim'};

export default function Example() {
  const [comments, setComments] = useState([
    {
      id: 'root',
      author: {id: 'maya', name: 'Maya Chen'},
      body: 'Can you review the rollout plan before Friday?',
      createdAt: '2026-09-30T19:00:00Z',
    },
  ]);
  const post = (body, parentId) => {
    const comment = {
      id: 'comment-' + Date.now(),
      author: viewer,
      body,
      createdAt: new Date().toISOString(),
    };
    setComments(current =>
      parentId == null
        ? [...current, comment]
        : current.map(root =>
            root.id === parentId
              ? {...root, replies: [...(root.replies ?? []), comment]}
              : root,
          ),
    );
  };
  return (
    <VStack width={560} height={420}>
      <Comments
        comments={comments}
        currentUser={viewer}
        density="compact"
        onSubmit={post}
      />
    </VStack>
  );
}`,
    },
    {
      label: '卡片内嵌',
      code: `import {Card} from '@astryxdesign/core/Card';
import {Comments} from '@astryxdesign/lab';

<Card padding={0} width={360} height={440}>
  <Comments
    comments={comments}
    currentUser={viewer}
    container="card"
    density="compact"
    onSubmit={post}
  />
</Card>`,
    },
    {
      label: '行内评论',
      code: `import {Comments} from '@astryxdesign/lab';

<Comments
  comments={[
    {
      id: 'inline',
      author: {id: 'maya', name: 'Maya Chen'},
      body: 'Should this say three days?',
      createdAt: '2026-09-30T19:00:00Z',
      anchor: {quote: 'The final cohort completes rollout in two days.'},
    },
  ]}
  currentUser={viewer}
  selectedThreadId={selectedThreadId}
  onSelectedThreadChange={setSelectedThreadId}
  composerAnchor={selection}
  onComposerAnchorDismiss={() => setSelection(undefined)}
  onSubmit={post}
/>`,
    },
    {
      label: '实时协作状态',
      code: `import {Comments} from '@astryxdesign/lab';

<Comments
  comments={comments.map(thread => ({
    ...thread,
    typingUsers: typingUsersByThread[thread.id] ?? [],
    seenBy: seenByComment[thread.id] ?? [],
    replies: thread.replies?.map(reply => ({
      ...reply,
      seenBy: seenByComment[reply.id] ?? [],
    })),
  }))}
  currentUser={viewer}
  onSubmit={post}
  onComposerDraftChange={(value, context) =>
    publishTyping({context, isTyping: value.trim() !== ''})
  }
/>`,
    },
    {
      label: '已解决线程',
      code: `import {Comments} from '@astryxdesign/lab';

<Comments
  comments={showResolved ? comments : comments.filter(c => !c.isResolved)}
  currentUser={viewer}
  onSubmit={post}
  onResolveThread={id => setResolved(id, true)}
  onReopenThread={id => setResolved(id, false)}
/>`,
    },
  ],
};
