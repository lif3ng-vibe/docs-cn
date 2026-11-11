// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ChatComposerInput',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Input',
  isHiddenFromOverview: true,
  description:
    '聊天编写器的富文本输入。支持触发菜单（输入 @ 或 / 打开 typeahead）、内联标记徽章、ArrowUp/Down 消息历史回溯、粘贴/拖放文件处理，并在 iOS 上将字体大小保持至少 16px 以避免输入缩放。当需要普通文本区域以外的功能时，传入 ChatComposer 的 input 插槽。',
  usage: {
    description:
      '草稿需要触发菜单、内联标记、历史回溯、听写插入或文件录入时，把 ChatComposerInput 传入 ChatComposer 的 input 插槽。',
    bestPractices: [
      {
        guidance: true,
        description:
          '编程式插入文本或标记用 handleRef；插入的文本与手输走同一 onChange 管线。',
      },
      {
        guidance: true,
        description:
          '粘贴或拖放到编辑器上的文件用 onFiles 接收；文件校验与上传进度放在产品层。',
      },
      {
        guidance: false,
        description:
          '普通提及或命令不要用自定义标记渲染；结构化徽章形式让标记保持可预测、可主题定制。',
      },
    ],
    anatomy: [
      {
        name: 'Input root',
        required: true,
        description:
          '转发根 ref 与 BaseProps 样式接缝的主题化容器。',
      },
      {
        name: 'Editable surface',
        required: true,
        description:
          '带标签的 contenteditable 文本框或组合框，负责文本、选区、键盘、粘贴与拖放行为。',
      },
      {
        name: 'Placeholder',
        required: false,
        description:
          '仅在序列化草稿为空时显示的视觉引导。',
      },
      {
        name: 'Trigger menu',
        required: false,
        description:
          '配置的触发器激活期间渲染的建议弹层。',
      },
      {
        name: 'Inline token',
        required: false,
        description:
          '带稳定序列化值的不可编辑徽章或自定义渲染。',
      },
    ],
  },
  props: [
    {
      name: 'handleRef',
      type: 'React.Ref<ChatComposerInputHandle>',
      description:
        '命令式句柄，用于编程式控制：insertToken、expandToken、insertText、focus 和 getValue。',
    },
    {
      name: 'value',
      type: 'string',
      description:
        '受控输入值。与 onChange 配对实现双向绑定。',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description:
        '输入值变更时调用。序列化字符串包含标记占位符。',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: '输入为空时显示的占位文本。',
      default: "'输入消息...'",
    },
    {
      name: 'maxRows',
      type: 'number',
      description:
        '滚动前的最大可见行数。紧凑布局中使用较小值。',
      default: '8',
    },
    {
      name: 'triggers',
      type: 'ChatComposerTrigger[]',
      description:
        '菜单的触发定义。每个触发器指定字符（@ 或 /）、搜索源和返回要插入标记的 onSelect 处理器。建议包含空格（人名、话题）时设置 hasMultiWordQuery: true：查询将延伸到换行或约 64 个字符，而不是在第一个空格处结束。每个触发器的 emptySearchText（ReactNode）用于查询无匹配结果时的提示。',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        '异步搜索源的去抖动延迟，避免过多网络请求。',
      default: '150',
    },
    {
      name: 'hasHistory',
      type: 'boolean',
      description:
        '启用 ArrowUp/Down 回溯之前提交的消息。',
      default: 'true',
    },
    {
      name: 'label',
      type: 'string',
      description: '屏幕阅读器播报的无障碍标签。',
      default: "'消息输入'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        '禁用输入。在流式输出期间或前置条件未满足时使用。',
      default: 'false',
    },
    {
      name: 'onPaste',
      type: '(event, text) => boolean | void',
      description:
        '粘贴纯文本时调用。自行处理后返回 true；否则由 ChatComposerInput 插入文本或应用粘贴转标记行为。',
    },
    {
      name: 'pasteAsToken',
      type: 'UseChatPasteAsTokenReturn | false',
      description:
        '粘贴转标记行为。默认将超过 200 个字符的纯文本粘贴转为可展开标记；传入 false 可始终内联粘贴，或传入 useChatPasteAsToken() 结果来自定义转换。',
    },
    {
      name: 'onFiles',
      type: '(files: File[]) => void',
      description:
        '粘贴或拖放文件到输入时调用。用于处理附件。',
    },
    {
      name: 'onSubmit',
      type: '(value: string) => void',
      description:
        '用户不按 Shift 按 Enter 时调用。序列化值包含标记占位符。',
    },
    {
      name: 'onKeyDown',
      type: '(event) => void',
      description:
        '在内置 Enter/历史处理之前（在打开的触发菜单之后）调用的按键处理器。平台特定按键的接缝：调用 event.preventDefault() 可抑制默认提交（例如触控键盘上插入换行），或自行处理事件以添加行为（例如 Cmd/Ctrl+Enter 提交）。始终尊重输入法组字状态——组字过程中 Enter 永不提交。',
    },
    {
      name: 'enterKeyHint',
      type: "'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'",
      description:
        '触屏键盘回车键上显示的内容（原生 enterkeyhint）。Enter 会发送消息，因此默认为 send，iOS 显示"发送"键。当 onKeyDown 让触屏键盘上的 Enter 插入换行时，传入 enter 让按键恢复为回车。',
      default: "'send'",
    },
  ],
};

export const docsZh = {
  name: 'ChatComposerInput',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Input',
  description:
    '聊天编写器的富文本输入。支持触发菜单（输入 @ 或 / 打开 typeahead）、内联标记徽章、ArrowUp/Down 消息历史回溯、粘贴/拖放文件处理，并在 iOS 上将字体大小保持至少 16px 以避免输入缩放。当需要普通文本区域以外的功能时，传入 ChatComposer 的 input 插槽。',
  propDescriptions: {
    handleRef:
      '命令式句柄，用于编程式控制：insertToken、expandToken、insertText、focus 和 getValue。',
    value: '受控输入值。与 onChange 配对实现双向绑定。',
    onChange: '输入值变更时调用。序列化字符串包含标记占位符。',
    placeholder: '输入为空时显示的占位文本。',
    maxRows: '滚动前的最大可见行数。紧凑布局中使用较小值。',
    triggers:
      '菜单的触发定义。每个触发器指定字符（@ 或 /）、搜索源和返回要插入标记的 onSelect 处理器。每个触发器的 emptySearchText（ReactNode）用于查询无匹配结果时的提示。',
    debounceMs: '异步搜索源的去抖动延迟，避免过多网络请求。',
    hasHistory: '启用 ArrowUp/Down 回溯之前提交的消息。',
    label: '屏幕阅读器播报的无障碍标签。',
    isDisabled: '禁用输入。在流式输出期间或前置条件未满足时使用。',
    onPaste:
      '粘贴纯文本时调用。自行处理后返回 true；否则由 ChatComposerInput 插入文本或应用粘贴转标记行为。',
    pasteAsToken:
      '粘贴转标记行为。默认将超过 200 个字符的纯文本粘贴转为可展开标记；传入 false 可始终内联粘贴，或传入 useChatPasteAsToken() 结果来自定义转换。',
    onFiles: '粘贴或拖放文件到输入时调用。用于处理附件。',
    onSubmit: '用户不按 Shift 按 Enter 时调用。序列化值包含标记占位符。',
    onKeyDown:
      '在内置 Enter/历史处理之前（在打开的触发菜单之后）调用的按键处理器。平台特定按键的接缝：调用 event.preventDefault() 可抑制默认提交（例如触控键盘上插入换行），或自行处理事件以添加行为（例如 Cmd/Ctrl+Enter 提交）。始终尊重输入法组字状态——组字过程中 Enter 永不提交。',
    enterKeyHint:
      '触屏键盘回车键上显示的内容（原生 enterkeyhint）。Enter 会发送消息，因此默认为 send，iOS 显示“发送”键。当 onKeyDown 让触屏键盘上的 Enter 插入换行时，传入 enter 让按键恢复为回车。',
  },
};

export const docsDense = {
  name: 'ChatComposerInput',
  isHiddenFromOverview: true,
  displayName: 'Chat Composer Input',
  description:
    '编写器的富文本输入；触发菜单（@/命令）、内联标记、消息历史、粘贴/拖放文件、iOS 16px 字号下限防缩放。需要超出纯 textarea 的能力时放进 ChatComposer 的 input 插槽。',
  propDescriptions: {
    handleRef:
      '命令式句柄（insertToken/expandToken/insertText/focus/getValue）',
    value: '受控值；与 onChange 配对双向绑定',
    onChange:
      '值变更回调；序列化字符串包含标记占位符',
    placeholder: '空值时的占位文本',
    maxRows: '滚动前最大可见行数；紧凑布局用较小值',
    triggers:
      'typeahead 触发定义；字符(@/)+搜索源+返回标记的 onSelect；emptySearchText（ReactNode）用于无匹配提示',
    debounceMs: '异步搜索去抖，避免过多请求',
    hasHistory: 'ArrowUp/Down 回溯之前提交的消息',
    label: '屏幕阅读器的无障碍标签',
    isDisabled: '禁用；流式生成中或前置条件未满足时使用',
    onPaste:
      '纯文本粘贴回调；自行处理后返回 true，否则运行内置标记/纯文本插入',
    pasteAsToken:
      '粘贴转标记行为；默认超过 200 字符生效，false 仅内联，或自定义 useChatPasteAsToken() 结果',
    onFiles: '文件粘贴/拖放回调；用于附件',
    onSubmit:
      '不按 Shift 的 Enter 回调；序列化值包含标记占位符',
    onKeyDown:
      '在内置 Enter/历史处理之前的按键回调（在触发菜单之后）；preventDefault() 抑制默认提交（触屏换行），或自行处理事件加行为（Cmd/Ctrl+Enter）。始终尊重输入法组字',
    enterKeyHint:
      '触屏键盘回车键标签（enterkeyhint）；Enter 发送消息故默认 send；onKeyDown 让 Enter 变换行时传 enter',
  },
};
