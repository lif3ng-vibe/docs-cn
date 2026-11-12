// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'working-with-ai',
  title: '与 AI 协作',
  category: 'guide',
  description:
    '如何配置 AI 编码工具，让它生成正确的组件代码。',
  keywords: ['claude', 'cursor', 'codex', 'copilot', '智能体', 'mcp'],

  sections: [
    {
      title: '概览',
      content: [
        {
          type: 'prose',
          text: '本设计系统为 AI 而建：命名一致、prop 模式可预测，还有一个把结构化文档直接喂进 AI 上下文窗口的 CLI。但模型仍需要正确的上下文，否则会退回通用 React 模式或凭空发明 prop。',
        },
        {
          type: 'prose',
          text: 'CLI 内置了一套智能体（agent）文档系统，可为你选用的 AI 工具生成上下文文件。一条命令就能配齐 AI 编写正确组件代码所需的一切。',
        },
      ],
    },
    {
      id: 'quick-start',
      title: '配置智能体文档',
      content: [
        {
          type: 'prose',
          text: '告诉你的 AI 安装 CLI 并自我配置：',
        },
        {
          type: 'code',
          lang: 'text',
          label: '把这段粘贴给你的 AI',
          code: 'Install @astryxdesign/cli and run `astryx init --features agents` to set up your Astryx context. Read the generated file.',
        },
        {
          type: 'prose',
          text: "就这样。`init --features agents` 命令从已安装项目生成 AI 需要的一切（组件索引、行为规则、CLI 参考以及来自已配置集成的包指引）。依赖升级之后，`{@command upgrade --from <old version>}` 会报告过期区块，加 `--apply` 即刷新。",
        },
        {
          type: 'prose',
          text: "默认情况下，指令写入项目根目录的 `AGENTS.md`（大多数智能体都读的工具无关标准）；项目根指最近的、其 `package.json` 声明了 Astryx 包的文件夹，否则是最近的任何带 `package.json` 的文件夹。搜索在仓库根处停止。在主目录，或其中项目之外的设置文件夹里，init 不写智能体文档：主目录下所有以点开头的文件夹（`~/.claude`、`~/.gemini`、`~/.codex`）都是设置文件夹，这种文件夹本身永远不算项目，即使有 `package.json`；其下自带 `package.json` 的项目（如智能体工作树）照常配置。当项目已有 `CLAUDE.md` 或 `.claude/CLAUDE.md` 时，Claude Code 会跳过 `AGENTS.md`，因此 init 也会把内容写进该文件——即使它导入了 `AGENTS.md`：Claude Code 在子文件夹发起的会话里不会跟随那个导入。两个文件都存在时，根 `CLAUDE.md` 拿到副本，`.claude/CLAUDE.md` 中的副本会被移除；除非项目忽略 `CLAUDE.md`，此时项目提交的 `.claude/CLAUDE.md` 保留一份副本。Gemini CLI 只读 `GEMINI.md`，所以 init 会在那里加一行对 `AGENTS.md` 的导入，除非 `GEMINI.md` 已经导入它。`upgrade` 保持各副本同步。Astryx 标记之间的区块属于 Astryx：无论项目的忽略规则或生成的标记怎么说，init 与 `upgrade` 都会写入、刷新并移除它，且绝不改动它周围的文字。要改为针对特定工具的文件：",
        },
        {
          type: 'code',
          lang: 'bash',
          label: '手动选项',
          code: `{@command init --features agents --agent claude}    # CLAUDE.md if present, else .claude/CLAUDE.md
{@command init --features agents --agent cursor}    # .cursorrules if present, else AGENTS.md
{@command init --features agents --agent codex}     # AGENTS.md (Copilot, Codex, etc.)
{@command init --features agents --agent hermes}    # .hermes.md or HERMES.md if present, else AGENTS.md
{@command init --features agents --agent muse}      # AGENTS.md (Muse)
{@command init --features agents --agent all}       # every agent file present except GEMINI.md, else AGENTS.md and .claude/CLAUDE.md`,
        },
        {
          type: 'prose',
          text: "使用 `--agent all` 时，`GEMINI.md` 保留那行对 `AGENTS.md` 的导入。使用 `--agent claude` 或 `--agent all`（与默认相同）时，一旦 `CLAUDE.md` 拿到指令，`.claude/CLAUDE.md` 就不再有，已有的副本会被移除；除非项目忽略 `CLAUDE.md`：全新克隆没有它，因此项目提交的 `.claude/CLAUDE.md` 无论 `--agent claude` 还是 `--agent all` 都会拿到一份副本。`init --remove-agents` 会在项目根及运行所在文件夹移除它们。",
        },
        {
          type: 'prose',
          text: "对于在单个项目之外工作的智能体，你的全局安装保留一份简短的 Astryx 技能 `~/.agents/skills/astryx/SKILL.md`，链接进智能体工具读取的技能文件夹（如 `~/.claude/skills/astryx`）。它告诉智能体 Astryx 的存在与使用时机；`{@command init --user}` 现在就写入，加 `--remove-agents` 则关闭。项目之内，智能体遵循该项目自己的智能体文档。见 {@link generic:computer-agent-guide}。",
        },
      ],
    },
    {
      title: '生成什么',
      content: [
        {
          type: 'prose',
          text: '生成的上下文教你的 AI 在写任何 UI 代码之前走三步工作流：',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            '`{@command build "<idea>"}`：获取起步用的页面模板（始终一个：最接近的匹配，或应用外壳）、另外两个模板，以及缺失部分所需的区块与组件',
            '`{@command template <name> <path>}`：把该模板脚手架进项目，保留其框架与间距，替换其内容',
            '`{@command component <Name>}`：阅读所用每个组件的 prop 与示例',
          ],
        },
        {
          type: 'prose',
          text: "它还包含防止常见错误的规则（每个页面都从模板起步、不用裸 div、不用 style={{}}、用令牌而非魔法值）、CLI 速查表，以及配置清单声明 `agentDocs` 时的带包标签集成指引。配置完成后，你不应再需要在这些约定上手工纠正 AI；智能体文档会在系统层面处理。",
        },
      ],
    },
    {
      title: 'Cursor 配置',
      content: [
        {
          type: 'prose',
          text: 'Cursor 从 `.cursor/rules/` 读取项目规则。要让 Astryx 上下文独占一条规则，就写在那里。给一个相对项目根的路径，例如 `.cursor/rules/astryx.mdc`；绝对路径会被拒绝。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '安装为 Cursor 项目规则',
          code: `{@command init --features agents --agent-docs-path .cursor/rules/astryx.mdc}`,
        },
        {
          type: 'prose',
          text: '重复运行同一命令只会重写 Astryx 区块，因此你在其上方添加的 frontmatter（如 `alwaysApply: true`）会保留。',
        },
      ],
    },
    {
      title: '检查你的配置',
      content: [
        {
          type: 'prose',
          text: "在编写任何组件代码之前，把这段粘贴给你的 AI。如果它答不上这些问题，它就知道要先安装智能体文档。",
        },
        {
          type: 'code',
          lang: 'text',
          label: '把这段粘贴给你的 AI',
          code: `Before writing any Astryx code, check your knowledge:

1. What is the correct import path for Button?
2. How do you make a Dialog non-dismissible?
3. What prop does Selector use for its items?

If you don't know all three, run \`astryx init --features agents\` to generate agent docs, then read the generated file.`,
        },
      ],
    },
    {
      title: 'astryx 模式',
      content: [
        {
          type: 'prose',
          text: 'AI 智能体常用错误路径调用 CLI（例如 node_modules/@astryxdesign/cli/bin/docs.mjs 而不是 astryx.mjs），导致静默失败。加一个带正确路径的 npm 脚本别名可彻底消除。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'package.json',
          code: `"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs"
}`,
        },
        {
          type: 'prose',
          text: '有了这个别名，智能体运行 `npm run astryx -- component --list`，不再猜测二进制路径。`--` 分隔符是 npm 向脚本传标志的标准约定。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '可靠的 CLI 调用',
          code: `npm run astryx -- component --list
npm run astryx -- component Dialog --dense
npm run astryx -- docs styling --full --detail brief
npm run astryx -- docs tokens --dense`,
        },
      ],
    },
    {
      id: 'the-dense-flag',
      title: '更短的输出：--detail 与 --dense',
      content: [
        {
          type: 'prose',
          text: '想读得更短，加 `--detail brief`（每节一行）或 `--detail compact`。`--dense` 在文档备有短版文本时换用它。把 CLI 输出粘贴进 ChatGPT 或 Claude 这类网页 AI 工具时用它们。',
        },
        {
          type: 'code',
          lang: 'bash',
          label: '适合粘贴进 AI 对话的短输出',
          code: `{@command docs styling --full --detail brief}
{@command component Dialog --detail compact}
{@command docs principles --dense}`,
        },
      ],
    },
    {
      title: 'MCP 服务器',
      content: [
        {
          type: 'prose',
          text: 'Astryx 附带一个 Model Context Protocol（MCP）服务器，任何兼容 MCP 的 AI 工具都能连接。AI 无需手动粘贴 CLI 输出，可以直接查询 Astryx 设计系统：搜索组件、阅读完整文档、按需拉取代码示例。',
        },
        {
          type: 'prose',
          text: 'MCP 服务器暴露两个工具：search(query) 用于发现组件、文档主题与模板；get(name) 用于获取含 prop、用法与示例的完整文档。',
        },
        {
          type: 'prose',
          text: '把服务器加进你的 MCP 配置文件。该条目是一个远程 HTTP 服务器，具体形态因客户端而异，请选用你所运行工具的片段。无法识别的 transport 条目会被跳过并给一条警告而非报错，表现为一个连得上却不暴露任何工具的服务器。',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'Claude Code (.mcp.json)',
          code: `{
  "mcpServers": {
    "astryx": {
      "type": "http",
      "url": "https://astryx.atmeta.com/mcp"
    }
  }
}`,
        },
        {
          type: 'prose',
          text: 'Claude Code 也可以从终端直接写入该条目：',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `claude mcp add --transport http astryx https://astryx.atmeta.com/mcp`,
        },
        {
          type: 'code',
          lang: 'json',
          label: 'Cline（cline_mcp_settings.json）——type 为 streamableHttp',
          code: `{
  "mcpServers": {
    "astryx": {
      "type": "streamableHttp",
      "url": "https://astryx.atmeta.com/mcp"
    }
  }
}`,
        },
        {
          type: 'code',
          lang: 'json',
          label:
            'Cursor（.cursor/mcp.json）——远程服务器不带 type 字段',
          code: `{
  "mcpServers": {
    "astryx": {
      "url": "https://astryx.atmeta.com/mcp"
    }
  }
}`,
        },
        {
          type: 'prose',
          text: 'Claude Desktop 是个例外：claude_desktop_config.json 只放本地 stdio 服务器，因此远程服务器要通过 Settings、Connectors、Add custom connector 添加，粘贴上面的 URL。',
        },
        {
          type: 'prose',
          text: '连接后，你的 AI 工具可以用自然语言搜索组件（如 "dropdown menu"、"success message"），无需任何手动 CLI 调用即可获取完整文档。服务器使用与组件文档相同的关键词索引，因此组件文档更新时，搜索质量会自动提升。',
        },
      ],
    },
    {
      id: 'global-mode',
      title: '全局模式下',
      content: [
        {
          type: 'prose',
          text: "全局模式下：你的全局安装会在主目录保留一份 Astryx 技能，链接进智能体工具读取的文件夹，让任何项目之外的智能体知道 Astryx 在场；项目之内，项目自己的智能体文档优先。见 {@link namespace:global} 与 {@link generic:computer-agent-guide}。",
        },
      ],
    },
  ],
};
