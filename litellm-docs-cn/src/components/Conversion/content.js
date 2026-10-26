// Shared copy for the conversion components: agent prompts, install commands,
// and sales links. CommonJS so plugins/llms.js can expand <AgentPrompt id="…"/>
// and <InstallBox variant="…"/> into the per-page markdown agents read.

const DOCS = 'https://docs.litellm.ai';

const SALES_URL = 'https://www.litellm.ai/enterprise#talk-to-sales';
const TRIAL_URL = 'https://www.litellm.ai/enterprise#trial';

// Adds attribution so the Webflow form and PostHog can tell which docs page
// sent the lead. The hash stays last so the page still scrolls to the form.
function withUtm(url, content) {
  const [base, hash] = url.split('#');
  const sep = base.includes('?') ? '&' : '?';
  const params = `utm_source=docs&utm_medium=cta${content ? `&utm_content=${encodeURIComponent(content)}` : ''}`;
  return `${base}${sep}${params}${hash ? `#${hash}` : ''}`;
}

const PROMPTS = {
  sdk: {
    title: '把 LiteLLM SDK 添加到这个项目',
    text: `帮我把 LiteLLM Python SDK 添加到这个项目。先阅读 ${DOCS}/llms.txt 和 ${DOCS}/docs/index.md，然后：
1. 识别项目的语言、包管理器与框架。本 SDK 只支持 Python。如果这不是 Python 项目，停下并告诉我改为运行 LiteLLM 网关、保留现有的 OpenAI SDK（${DOCS}/docs/proxy/docker_quick_start.md）。
2. 用项目自己的工具安装 litellm（uv add litellm、poetry add litellm，或固定在 requirements.txt 中）。
3. 把直接调用 OpenAI 或 Anthropic 客户端的地方替换为 litellm.completion 或 litellm.acompletion，模型保持不变，加上提供商前缀（openai/...、anthropic/...）。LiteLLM 返回 OpenAI 形状的响应，因此要把 Anthropic 风格的解析改为 choices[0].message.content。保持流式与工具调用可用。
4. 把提供商密钥的变量名加入 .env.example，并从环境变量读取。绝不把真实密钥写进文件。
5. 验证：跑一次真实补全并打印回复，然后运行现有测试。给我看 diff 和两份输出。`,
  },
  gateway: {
    title: '在本地运行 LiteLLM 网关',
    text: `帮我在本地运行 LiteLLM 网关。先阅读 ${DOCS}/docs/proxy/docker_quick_start.md，然后：
1. 确认 Docker Compose v2 已安装并正在运行，且端口 4000 空闲。
2. 新建 litellm-gateway 目录，下载 https://github.com/BerriAI/litellm/raw/main/docker/docker-compose.quickstart.yml，并创建 .env：LITELLM_MASTER_KEY 与 LITELLM_SALT_KEY 均为 "sk-" 加上 openssl rand -hex 32 的输出，POSTGRES_PASSWORD 设为 openssl rand -hex 24 的输出。把 .env 加入 .gitignore，绝不打印这些值。
3. 运行 docker compose -f docker-compose.quickstart.yml up -d，并轮询 http://localhost:4000/health/readiness，直到数据库显示已连接。
4. 问我要接入哪个提供商与模型，用 master key 通过 POST /model/new 添加，从我 shell 的环境变量读取提供商 API 密钥且不回显。
5. 验证：GET /v1/models 列出该模型，POST /v1/chat/completions 能返回回复。
6. 提示我打开 http://localhost:4000/ui，用 .env 中的 master key 以 admin 身份登录。`,
  },
  clients: {
    title: '把我的工具指向我的 LiteLLM 网关',
    text: `帮我把我的工具接到我的 LiteLLM 网关上。先阅读 ${DOCS}/docs/proxy/client_setup/overview.md，再读同一目录下的 claude_code.md 与 codex_cli.md。向我要网关 URL（默认 http://localhost:4000）和一个虚拟密钥。如果我只有 master key，就用 POST /key/generate 创建一个范围受限的密钥来代替。
1. 用该密钥调用 GET /v1/models。只有它返回的名称才是有效模型。
2. 我的应用：把现有 OpenAI SDK 指向 <url>/v1，或把 Anthropic SDK 指向 <url>，带上虚拟密钥，并把模型切换为网关中的模型名。
3. Claude Code：按 claude_code.md 设置 ANTHROPIC_BASE_URL 与 ANTHROPIC_AUTH_TOKEN。写入前先给我看改动。
4. Codex：按 codex_cli.md 在 ~/.codex/config.toml 中添加 litellm 提供商。写入前先给我看改动。
5. 验证：从每个工具各发一个请求，确认它出现在 <url>/ui 的 Logs 里。`,
  },
  'lens-claude-code': {
    title: '在 Lens 中配置 Claude Code 追踪',
    text: `把这台机器配置为把我的 Claude Code 会话发送到 LiteLLM Lens。先阅读 ${DOCS}/docs/proxy/lens/coding-agents.md 与 ${DOCS}/docs/proxy/lens/deployment.md。
1. 向我要 Lens > Traces > Set up tracing 中的完整 Traces 端点和一个 Agent 名称（默认 claude-code）。保留已有的 /lens-ingest 前缀，且只包含一次 /v1/traces。把结尾的 /v1/traces 替换为 /v1/logs 即得日志端点。从已有环境变量或终端隐藏输入中读取我的专用追踪密钥。绝不让我把密钥粘贴到对话里、打印它或提交到仓库。
2. 确认追踪已启用，且 Lens 服务能在 /v1/logs 接收 Claude 对话日志。如果需要升级，先向我说明再改我的本地设置。
3. 说明哪些会话内容会被发送到我的 Lens 服务。按指南配置 Claude 内置的 OTLP 追踪与日志导出器及内容开关，把它们合并进我用户级 ~/.claude/settings.json 的 env 对象，保留其他设置与资源属性。凭据只放在私有用户配置里。使用 lens.session.capture=true 和我选定的 gen_ai.agent.name。不要安装插件或辅助工具，不要改动我的 Claude 订阅/API 登录或模型端点，也不要启用可选的原始 API 请求体导出。
4. 提示我重启 Claude Code，然后完成一个用到工具的小提示词。在 Lens > Traces > Conversation 中以我选定的 Agent 名称核对新追踪，确认其中包含提示词、工具活动与助手回复。这些事件属于 Lens，而不是普通的请求 Logs 页面。如有内容缺失或导出报错，如实报告，不要声称配置成功。
5. 在隐藏凭据的前提下给我看配置改动，解释如何暂停遥测，并指出指南中描述的采集限制。`,
  },
  'lens-codex': {
    title: '在 Lens 中配置 Codex 追踪',
    text: `为我的本地 Codex 桌面版或 CLI 会话配置 LiteLLM Lens 追踪。先阅读 ${DOCS}/docs/proxy/lens/coding-agents.md 与 https://github.com/BerriAI/litellm-lens-codex-integration/blob/main/README.md。
1. 核对这台机器的操作系统与 Python 版本是否满足该集成当前的先决条件。如果不支持自动安装，请说明限制，不要编造安装步骤。
2. 向我要 Lens > Traces > Set up tracing 中的完整 Traces 端点和一个 Agent 名称。安装程序会在其 Lens ingestion URL 提示处接受该端点，并在存在时保留 /lens-ingest。按文档中的 Terminal 安装方式操作，让我能在隐藏输入中输入专用追踪密钥并确认开启记录。绝不让我把密钥粘贴到对话里、打印它或提交到仓库。
3. 按 README 的 From Terminal 说明安装或更新官方 BerriAI 集成。尽量复用已有安装，并保留我的 Codex 认证、模型配置与无关钩子。说明会记录哪些内容；只有新捕获的活动才会被导出。
4. 提示我开一个新的 Codex 对话，完成一个用到工具的小提示词。在 Lens > Traces > Conversation 中以我选定的 Agent 名称核对它的追踪，确认包含提示词、工具结果与助手回复。如果没出现，检查该集成的状态与待上传队列；仅完成安装并不能证明采集生效。
5. 在隐藏凭据的前提下给我看改动，解释如何用 lens-setup 暂停记录，并总结该集成的采集限制。`,
  },
  enterprise: {
    title: '在我的网关上评估 LiteLLM Enterprise',
    text: `帮我在我自己的 LiteLLM 网关上评估 LiteLLM Enterprise。先阅读 ${DOCS}/docs/enterprise.md 与 ${DOCS}/docs/learn/enterprise_quickstart.md，然后：
1. 检查是否已有网关在运行（GET <url>/health/readiness）。如果没有，先按 ${DOCS}/docs/proxy/docker_quick_start.md 搭一个。
2. 向我要试用许可证密钥，把它作为 LITELLM_LICENSE 加入网关的环境（Docker Compose 用 .env），不要打印它，然后重启网关。
3. 问我们用哪个身份提供商（Okta、Entra ID、Google 或其他 OIDC/SAML 提供商），并带我为它走一遍 ${DOCS}/docs/proxy/admin_ui_sso.md。每处配置改动写入前都先给我看。
4. 验证：通过 SSO 登录 <url>/ui，然后确认审计日志记录了一次管理员操作。
如果我还没有许可证，停下并指引我到 ${SALES_URL}。`,
  },
  mcp: {
    title: '把我的 MCP 服务器放到 LiteLLM 网关后面',
    text: `帮我把我的 MCP 工具改为经由 LiteLLM 网关提供服务。先阅读 ${DOCS}/docs/mcp.md 与 ${DOCS}/docs/mcp_control.md。向我要网关 URL、一个有管理员权限的密钥，以及我要添加哪些 MCP 服务器。
1. 按 mcp.md 描述的方式把每个 MCP 服务器添加到网关，服务器凭据一律放在环境变量里，绝不写进文件。
2. 按 mcp_control.md 限制哪些密钥与团队可以使用每个服务器。
3. 用一个虚拟密钥把一个客户端（Claude Code、Cursor 或我的应用）连到网关的 MCP 端点。写入前先给我看每处配置改动。
4. 验证：通过网关列出工具，并调用其中一个。`,
  },
  agents: {
    title: '让我的 A2A Agent 经由 LiteLLM 网关路由',
    text: `帮我把我的 A2A Agent 放到我的 LiteLLM 网关后面。先阅读 ${DOCS}/docs/a2a.md、${DOCS}/docs/a2a_agent_card.md 与 ${DOCS}/docs/a2a_agent_permissions.md。向我要网关 URL、一个有管理员权限的密钥，以及我要添加哪些 Agent。
1. 按 a2a.md 描述的方式把每个 Agent 注册到网关上。
2. 与我一起决定哪些团队与密钥可以调用每个 Agent，并按 a2a_agent_permissions.md 配置好。
3. 验证：用虚拟密钥通过网关调用一个 Agent，然后确认请求出现在 <url>/ui 的 Logs 里。`,
  },
  autorouter: {
    title: '试用 LiteLLM Auto Router',
    text: `帮我试用 LiteLLM Auto Router，它是 LiteLLM 网关的付费附加组件。先阅读 ${DOCS}/docs/auto_router/index.md，再读同一目录下的 setup.md 与 recommended_configurations.md。
1. 确认有网关在运行，并向我要它的 URL 和一个管理员密钥。
2. 针对我已有的模型，从 recommended_configurations.md 中推荐一个起始配置，并在改动前讲清权衡。
3. 按 setup.md 添加该 Router，每处配置改动写入前先给我看。
4. 验证：发送三个难度不同的请求，给我看每个请求由哪个模型回答、各花了多少钱。`,
  },
  observability: {
    title: '把我的网关日志发到我的可观测性工具',
    text: `帮我把 LiteLLM 网关的日志与花费发到我们的可观测性工具。先阅读 ${DOCS}/docs/proxy/logging.md。问我们用的是哪个工具（Langfuse、Datadog、OpenTelemetry 或其中列出的其他工具），以及网关 URL。
1. 按 logging.md 中该工具对应的章节操作。所有凭据一律放环境变量，绝不放配置文件，且每处改动写入前先给我看。
2. 如果改动需要，重启网关。
3. 验证：通过网关发一个请求，并给我看它在工具中出现在哪里。`,
  },
  liteadmin: {
    title: '用 LiteAdmin MCP 让这个 Agent 管理我的 LiteLLM 网关',
    text: `帮我连接 LiteAdmin MCP，让你可以管理我的 LiteLLM 网关。先阅读 ${DOCS}/docs/proxy/liteadmin_mcp.md，然后：
1. 向我要网关 URL 和一个属于 proxy_admin 角色用户的个人虚拟密钥。不要用 master key，且绝不打印该密钥。
2. 按指南对该客户端（Claude Code、Claude Desktop 或 Codex）的说明添加 LiteAdmin MCP 服务器。写入前先给我看改动。
3. 验证：通过 MCP 工具列出网关的模型与我的团队，然后停下问我需要改什么。`,
  },
  liteagents: {
    title: '在我的某个 Agent 上试用 LiteAgents',
    text: `帮我试用 LiteAgents，一个无需重写 Agent 即可切换 Agent 框架（harness）的预览版 SDK。先阅读 https://github.com/BerriAI/liteagents/blob/main/docs/getting-started.md 与 https://github.com/BerriAI/liteagents/blob/main/cookbook/recipes/10_harness_switch.py 中的 harness 切换示例，然后：
1. 在独立的虚拟环境中安装入门指南所指名的预览版本。
2. 问我要移植哪个 Agent、用哪个模型。如果我运行着 LiteLLM 网关，用从环境变量读取的虚拟密钥把模型指向它。
3. 把该 Agent 移植为 LiteAgents profile，保留它的工具与 MCP 连接，并运行一个任务。
4. 只把 harness 字段改为第二个框架，运行同一任务，并把两个结果并排给我看。`,
  },
};

const GATEWAY_COMPOSE = `curl -sSLO https://github.com/BerriAI/litellm/raw/main/docker/docker-compose.quickstart.yml
printf 'LITELLM_MASTER_KEY=sk-%s\\nLITELLM_SALT_KEY=sk-%s\\nPOSTGRES_PASSWORD=%s\\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)" "$(openssl rand -hex 24)" > .env
docker compose -f docker-compose.quickstart.yml up -d`;

// The one command per system shown in the Quick Start box. The gateway scripts
// live in the litellm repo: scripts/quickstart.sh and scripts/quickstart.ps1.
const QUICKSTART = {
  gateway: {
    mac: 'curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/quickstart.sh | sh',
    windows: 'irm https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/quickstart.ps1 | iex',
  },
  sdk: 'uv add litellm',
};

const GATEWAY_DOCKER_RUN = `docker run \\
  -e LITELLM_MASTER_KEY=sk-<paste-a-long-random-key> \\
  -e DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname> \\
  -e STORE_MODEL_IN_DB=True \\
  -p 4000:4000 \\
  docker.litellm.ai/berriai/litellm:main-stable`;

// One-click hosted deploys, offered to phone visitors who cannot run Docker.
const ONE_CLICK = [
  ['Railway', 'https://railway.com/deploy/RhvhdC?referralCode=7mRv9K&utm_medium=integration&utm_source=template&utm_campaign=generic', 'https://railway.com/button.svg'],
  ['Render', 'https://render.com/deploy?repo=https://github.com/BerriAI/litellm', 'https://render.com/images/deploy-to-render-button.svg'],
];

const INSTALLER = `curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install.sh | sh`;

const HELM = `helm install litellm oci://ghcr.io/berriai/litellm-helm -f values.yaml`;

// Install options per path. The first entry is the recommended command and is
// the only one shown up front; the rest sit under "Other ways to install",
// each with a line on when to pick it. Agent prompts are never mixed in here;
// they get their own <AgentPrompt> box.
const INSTALLS = {
  gateway: {
    title: '启动网关',
    what: '在端口 4000 上运行网关与一个 Postgres 数据库，管理界面位于 /ui。主密钥、盐密钥与数据库密码会自动生成到 .env 中。',
    options: [
      {
        id: 'compose',
        label: 'Docker Compose',
        code: GATEWAY_COMPOSE,
        more: '/docs/proxy/docker_quick_start',
      },
      {
        id: 'docker',
        label: 'docker run',
        when: '你已有一套现成的 Postgres 数据库可供接入。',
        code: GATEWAY_DOCKER_RUN,
        more: '/docs/proxy/deploy',
      },
      {
        id: 'helm',
        label: 'Helm',
        when: '你部署到 Kubernetes。请搭配部署指南中的 values.yaml 使用。',
        code: HELM,
        more: '/docs/proxy/deploy#deploy-with-helm',
      },
      {
        id: 'installer',
        label: '一行命令安装器',
        when: '你想在没有 Docker 的环境下把网关作为本地 CLI 运行（macOS 与 Linux）。它从配置文件启动、不依赖数据库，因此没有虚拟密钥与管理界面。',
        code: INSTALLER,
        more: 'https://github.com/BerriAI/litellm/blob/main/scripts/install.sh',
        moreLabel: '阅读脚本',
      },
    ],
  },
  sdk: {
    title: '安装 SDK',
    what: '把 litellm 包添加到你的 Python 项目（需要 Python 3.10 或更高版本）。',
    options: [
      {id: 'uv', label: 'uv', code: 'uv add litellm', more: '/docs/#quick-start'},
      {id: 'pip', label: 'pip', when: '你的项目使用 pip 与 requirements.txt。', code: 'pip install litellm'},
    ],
  },
};

const ENTERPRISE_HERO = {
  title: '让每个团队都用上 AI。谁在用什么、花了多少，尽在掌控。',
  text: 'LiteLLM Enterprise 在开源 AI 网关之上，提供单点登录、审计日志、分级管理员角色，以及来自开发团队自己的工程师支持。它运行在你自己的云环境里，提示词与响应都不会离开你的环境。',
};

// What each tier adds, top to bottom. Each tier includes everything below it.
const TIERS = [
  {
    id: 'enterprise',
    name: '企业版',
    how: '在网关上凭许可证密钥启用',
    plus: '包含 AI 网关的全部能力，另加',
    items: [
      ['SSO 与 SCIM', '/docs/proxy/admin_ui_sso'],
      ['审计日志', '/docs/proxy/multiple_admins'],
      ['组织与团队管理员', '/docs/proxy/access_control'],
      ['密钥管理器', '/docs/secret_managers/overview'],
      ['IP 白名单', '/docs/proxy/ip_address'],
      ['按团队的日志', '/docs/proxy/team_logging'],
      ['多区域部署', '/docs/proxy/multi_region'],
      ['支持 SLA', '#professional-support'],
    ],
  },
  {
    id: 'gateway',
    name: 'AI 网关',
    how: '开源，自托管',
    plus: '包含 SDK 的全部能力，另加',
    items: [
      ['虚拟密钥', '/docs/proxy/virtual_keys'],
      ['预算与速率限制', '/docs/proxy/users'],
      ['花费追踪', '/docs/proxy/cost_tracking'],
      ['Admin UI', '/docs/proxy/ui'],
      ['负载均衡', '/docs/proxy/load_balancing'],
      ['防护栏', '/docs/proxy/guardrails/quick_start'],
      ['MCP 网关', '/docs/mcp'],
      ['任意语言', '/docs/proxy/client_setup/overview'],
    ],
  },
  {
    id: 'sdk',
    name: 'Python SDK',
    how: '开源库',
    plus: '用于你的 Python 代码',
    items: [
      ['100+ 提供商', '/docs/providers'],
      ['OpenAI 格式', '/docs/completion/output'],
      ['Router 与回退机制', '/docs/routing'],
      ['单次调用成本', '/docs/completion/token_usage'],
      ['日志回调', '/docs/observability/callbacks'],
    ],
  },
];

// The docs home, below the path picker: one section per product, each told
// as the problem a reader has and the product that solves it, with one small
// visual that is real text (code, a table, or log lines) so agents can read
// it too. Model names come from docs-models.json like the rest of the docs.
const M = require('../../../docs-models.json');
const USE_CASES = [
  {
    id: 'sdk',
    product: 'Python SDK',
    problem: '用一个 Python 函数对接 100+ LLM 提供商。',
    solution:
      'completion() 函数对 OpenAI、Anthropic、Bedrock 以及 100+ 其他提供商使用同一套参数，结果始终以 OpenAI 格式返回。想换模型，只需替换一个字符串。SDK 还自带流式、重试、回退，以及每次调用的成本。',
    to: '/docs/',
    cta: '安装 SDK',
    prompt: 'sdk',
    // On the docs home the hero already installs and holds the prompt, so the
    // row points to what comes next
    links: [
      ['SDK 快速上手', '/docs/'],
      ['支持的提供商', '/docs/providers'],
    ],
    visual: {
      type: 'code',
      lang: 'python',
      code: `from litellm import completion

messages = [{"role": "user", "content": "Hello"}]

completion(model="openai/${M.openai_large}", messages=messages)
completion(model="anthropic/${M.anthropic}", messages=messages)`,
    },
  },
  {
    id: 'gateway',
    product: 'AI 网关',
    problem: '一个端点通连所有模型，并为每个团队配备密钥、预算与成本核算。',
    solution:
      '各种编程语言的应用都以 OpenAI 格式向网关发请求。每个应用或每个人都拿到一个带预算和速率限制的虚拟密钥。网关记录每个请求及其成本。你的提供商密钥始终留在网关里。',
    to: '/docs/proxy/docker_quick_start',
    cta: '启动网关',
    prompt: 'gateway',
    links: [
      ['网关快速上手', '/docs/proxy/docker_quick_start'],
      ['虚拟密钥与预算', '/docs/proxy/virtual_keys'],
    ],
    visual: {
      type: 'code',
      lang: 'bash',
      code: `curl http://localhost:4000/v1/chat/completions \\
  -H "Authorization: Bearer sk-<virtual-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${M.openai_large}",
       "messages": [{"role": "user", "content": "Hello"}]}'`,
    },
  },
  {
    id: 'enterprise',
    product: '企业版',
    problem: '为公司里所有团队提供单点登录、审计日志与管理员角色。',
    solution:
      '一个许可证密钥即可在同一网关上解锁企业版功能：SSO、SCIM、记录所有管理员操作的审计日志，以及每个团队各自的管理员。企业版还支持多区域部署，并有 LiteLLM 工程师为你的团队提供帮助。',
    to: '/docs/enterprise',
    cta: '联系销售',
    sales: true,
    visual: {
      type: 'lines',
      lines: [
        ['jane@acme.com 经 Okta', '创建了密钥', '团队：search'],
        ['raj@acme.com 经 Okta', '上调了预算', '团队：support'],
      ],
    },
  },
];

// After the SDK and gateway rows: what else runs on or with the gateway,
// in three themed pairs. Each card says what the product does, then shows
// it with one small text visual.
const CARD_GROUPS = [
  {title: '工具与 Agent', ids: ['mcp', 'agents']},
  {title: '模型与 Agent 框架', ids: ['autorouter', 'liteagents']},
  {title: '你的终端与你的 Agent', ids: ['tools', 'liteadmin']},
];

const PRODUCT_CARDS = [
  {
    id: 'mcp',
    product: 'MCP 网关',
    problem: '让所有 MCP 工具经由同一个端点可用。',
    text: 'MCP 服务器只需向网关添加一次，无需逐个接入每个应用。你可以选择哪些密钥与团队能使用每个服务器。',
    visual: {
      type: 'table',
      head: ['MCP 服务器', 'Search 团队', 'Support 团队'],
      rows: [
        ['GitHub', '允许', '无权限'],
        ['Jira', '允许', '允许'],
      ],
    },
    to: '/docs/mcp',
    prompt: 'mcp',
  },
  {
    id: 'agents',
    product: 'Agent 网关',
    problem: '让 Agent 之间的调用经由网关进行。',
    text: '把你的 A2A Agent 注册到网关上。此后每次调用这些 Agent 都会使用一个虚拟密钥，并连同成本一起记入你的日志。只有你选定的团队才能调用这些 Agent。',
    visual: {
      type: 'lines',
      lines: [
        ['POST /a2a/support-agent', 'search-team', '已记录'],
        ['POST /a2a/billing-agent', 'search-team', '不允许'],
      ],
    },
    to: '/docs/a2a',
    prompt: 'agents',
  },
  {
    id: 'autorouter',
    product: 'Auto Router（附加组件）',
    problem: '把每个请求发给能完成该任务、成本最低的模型。',
    text: '简单的提示词交给成本更低的模型，你的应用保持不变。',
    visual: {
      type: 'table',
      head: ['请求', '路由至'],
      rows: [
        ['修正这句话里的拼写错误', '一个小型廉价模型'],
        ['规划一次零停机迁移', '一个前沿模型'],
      ],
    },
    to: '/docs/auto_router/',
    prompt: 'autorouter',
  },
  {
    id: 'liteagents',
    product: 'LiteAgents（预览版）',
    problem: '换用不同的 Agent 框架（harness），保留你的 Agent 代码。',
    text: '只需替换一个参数，即可在 Deep Agents、Pydantic AI、Claude Agent SDK、Codex 与 OpenCode 之间切换，你的工具与 MCP 连接保持不变。',
    visual: {
      type: 'code',
      lang: 'python',
      code: `ProfileOptions(
    harness="deepagents",  # or "claude-sdk", "codex", "pydantic-ai"
    model="my-model",
)`,
    },
    to: 'https://docs.litellm.ai/blog/liteagents-sdk',
    prompt: 'liteagents',
  },
  {
    id: 'tools',
    product: 'lite CLI',
    problem: '让 Claude Code 与 Codex 通过你的网关运行。',
    text: 'lite CLI 登录你的网关，并经由它启动工具。任何人都无需使用提供商 API 密钥。预算、日志与防护栏对每个人分别生效。',
    visual: {
      type: 'code',
      lang: 'bash',
      code: `lite login    # sign in to your gateway
lite claude   # Claude Code, through the gateway`,
    },
    to: '/docs/proxy/management_cli',
    prompt: 'clients',
  },
  {
    id: 'liteadmin',
    product: 'LiteAdmin MCP',
    problem: '用对 Agent 下达的指令来管理网关。',
    text: '把 Claude 或 Codex 连到你的网关，然后让 Agent 去创建密钥、添加模型、管理团队与预算，或找出出错的请求。',
    visual: {
      type: 'chat',
      lines: [
        ['你', '为 search 团队创建一个月度预算 $200 的密钥。'],
        ['Claude', '完成。该密钥属于 search 团队，每月预算 $200。'],
      ],
    },
    to: '/docs/proxy/liteadmin_mcp',
    prompt: 'liteadmin',
  },
];

// Every product, as the system map on the docs home draws it. Each has a
// guide and an agent prompt (PROMPTS above).
const PRODUCTS = [
  {id: 'gateway', name: 'AI 网关', to: '/docs/simple_proxy', prompt: 'gateway', text: '为每个应用提供 OpenAI 兼容的单一端点，内置虚拟密钥、预算、花费日志与防护栏。'},
  {id: 'tools', name: '你的应用与 AI 工具', to: '/docs/proxy/client_setup/overview', prompt: 'clients', text: '任意 OpenAI 或 Anthropic SDK，以及 Claude Code、Codex 与 Cursor，都可以指向网关。'},
  {id: 'sdk', name: 'Python SDK', to: '/docs/', prompt: 'sdk', text: '面向单个 Python 应用的库：completion() 覆盖 100+ 提供商，自带路由、回退与单次调用成本。'},
  {id: 'mcp', name: 'MCP 网关', to: '/docs/mcp', prompt: 'mcp', text: '所有 MCP 工具共用一个端点，可按密钥与团队设置访问权限，并追踪成本。'},
  {id: 'agents', name: 'Agent 网关（A2A）', to: '/docs/a2a', prompt: 'agents', text: '通过网关调用 A2A Agent，具备日志与按团队的访问控制。'},
  {id: 'autorouter', name: 'Auto Router（附加组件）', to: '/docs/auto_router/', prompt: 'autorouter', text: '把每个请求路由到能出色回答它的最便宜模型。'},
  {id: 'enterprise', name: '企业版', to: '/docs/enterprise', prompt: 'enterprise', text: '一个许可证密钥，即可在同一网关上获得 SSO、审计日志、分级管理员与多区域部署。'},
];

module.exports = {
  PRODUCTS,
  USE_CASES,
  PRODUCT_CARDS,
  CARD_GROUPS,
  ENTERPRISE_HERO,
  TIERS,
  DOCS,
  SALES_URL,
  TRIAL_URL,
  withUtm,
  PROMPTS,
  INSTALLS,
  ONE_CLICK,
  GATEWAY_COMPOSE,
  QUICKSTART,
  INSTALLER,
};
