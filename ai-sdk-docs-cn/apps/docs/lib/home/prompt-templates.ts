export const PROMPT_TEMPLATES = [
  {
    label: '聊天机器人',
    title: '聊天机器人入门模板',
    description:
      '学习构建一个功能完备的 AI 聊天机器人：带持久化、多模态聊天等能力。',
    link: 'https://vercel.com/templates/next.js/chatbot',
    prompt: `# About
Template for a full-featured Next.js AI chatbot

# Requirements
This template uses the Vercel AI Gateway to access multiple AI models through a unified interface. The default model is OpenAI GPT-4.1 Mini, with support for Anthropic, Google, and xAI models.

For Vercel deployments: Authentication is handled automatically via OIDC tokens.

For non-Vercel deployments: You need to provide an AI Gateway API key by setting the AI_GATEWAY_API_KEY environment variable in your .env.local file.

# Installation
– Clone the repository: git clone https://github.com/vercel/chatbot
– Install dependencies: pnpm i
– Set up database: pnpm db:migrate
– Start the dev server: pnpm dev

Further information about environment variables is available on the templates page (https://vercel.com/templates/next.js/chatbot).
`,
  },
  {
    label: 'Slackbot 智能体',
    title: '构建 Slackbot 智能体',
    description:
      '学习构建一个能响应私信与频道提及的 Slackbot。',
    link: 'https://vercel.com/templates/other/ai-sdk-slackbot',
    prompt: `# About
An AI-powered Slackbot that responds to direct messages and mentions in channels.

# Requirements
This template uses the AI SDK with built-in tools for weather lookup and web search via Exa. Configure the SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, OPENAI_API_KEY, and EXA_API_KEY environment variables.

# Installation
– Clone the repository: git clone https://github.com/vercel-labs/ai-sdk-slackbot
– Install dependencies: pnpm install
– Start the dev server: pnpm vercel dev --listen 3000 --yes
– Tunnel localhost for Slack events: npx untun@latest tunnel http://localhost:3000`,
  },
  {
    label: 'SQL 智能体',
    title: '构建 SQL 智能体',
    description:
      '学习构建一个用自然语言操作 PostgreSQL 数据库的应用。',
    link: 'https://vercel.com/templates/next.js/natural-language-postgres',
    prompt: `# About
A Next.js app that converts plain English into SQL queries against a PostgreSQL database.

# Requirements
Uses the AI SDK with GPT-4o for natural language to SQL conversion. Includes data visualization with auto-selected chart types via Recharts. Configure your OPENAI_API_KEY and PostgreSQL connection string.

# Installation
– Clone the repository: git clone https://github.com/vercel-labs/natural-language-postgres
– Install dependencies: pnpm install
– Copy env file: cp .env.example .env
– Seed the database: pnpm run seed
– Start the dev server: pnpm run dev`,
  },
];
