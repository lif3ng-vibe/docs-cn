import {
  Braces,
  ChartLine,
  ChartNoAxesColumn,
  Database,
  File,
  Flag,
  Gauge,
  Image,
  ListOrdered,
  type LucideIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import {
  GoogleIcon,
  NextIcon,
  NuxtIcon,
  OpenAIIcon,
  SolidIcon,
  SvelteIcon,
} from '@/components/docs/template-icons';

type TemplateType =
  | 'generative-ui'
  | 'starter-kits'
  | 'security'
  | 'frameworks'
  | 'feature-exploration';

type TTemplate = {
  title: string;
  description: string;
  logos: (ComponentType<{ size?: number }> | LucideIcon)[];
  type: TemplateType;
  link: string;
};

const TEMPLATES: TTemplate[] = [
  {
    title: 'Gemini 聊天机器人',
    description: '使用 Google Gemini、AI SDK 与 Next.js。',
    logos: [NextIcon, GoogleIcon],
    type: 'generative-ui',
    link: 'https://vercel.com/templates/next.js/gemini-ai-chatbot',
  },
  {
    title: '机器人防护',
    description: '使用 Kasada、OpenAI GPT-4、AI SDK 与 Next.js。',
    logos: [ShieldCheck, NextIcon, OpenAIIcon],
    type: 'security',
    link: 'https://vercel.com/templates/next.js/advanced-ai-bot-protection',
  },
  {
    title: '速率限制',
    description: '使用 Vercel KV、OpenAI GPT-4、AI SDK 与 Next.js。',
    logos: [Gauge, NextIcon, OpenAIIcon],
    type: 'security',
    link: 'https://github.com/vercel/ai/tree/main/examples/next-openai-upstash-rate-limits',
  },
  {
    title: 'Next.js OpenAI 起步模板',
    description: '使用 OpenAI GPT-4、AI SDK 与 Next.js。',
    logos: [NextIcon, OpenAIIcon],
    type: 'frameworks',
    link: 'https://github.com/vercel/ai/tree/main/examples/next-openai',
  },
  {
    title: 'Nuxt OpenAI 起步模板',
    description: '使用 OpenAI GPT-4、AI SDK 与 Nuxt.js。',
    logos: [NuxtIcon, OpenAIIcon],
    type: 'frameworks',
    link: 'https://github.com/vercel/ai/tree/main/examples/nuxt-openai',
  },
  {
    title: 'SvelteKit OpenAI 起步模板',
    description: '使用 OpenAI GPT-4、AI SDK 与 SvelteKit。',
    logos: [SvelteIcon, OpenAIIcon],
    type: 'frameworks',
    link: 'https://github.com/vercel/ai/tree/main/examples/sveltekit-openai',
  },
  {
    title: 'Solid OpenAI 起步模板',
    description: '使用 OpenAI GPT-4、AI SDK 与 Solid。',
    logos: [SolidIcon, OpenAIIcon],
    type: 'frameworks',
    link: 'https://github.com/vercel/ai/tree/main/examples/solidstart-openai',
  },
  {
    title: 'Chatbot Starter Template',
    description:
      '使用 AI SDK 与 Next.js，具备持久化、多模态聊天等能力。',
    logos: [NextIcon, Sparkles],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/next.js/nextjs-ai-chatbot',
  },
  {
    title: 'eve Chat',
    description:
      '由 eve 驱动的持久化 AI SDK 聊天应用：持久的智能体会话、工具与集成。',
    logos: [NextIcon, Sparkles],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/eve/eve-chat-template',
  },
  {
    title: '内部知识库（RAG）',
    description:
      '使用 AI SDK 语言模型中间件实现 RAG 与护栏约束。',
    logos: [NextIcon, Database],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/next.js/ai-sdk-internal-knowledge-base',
  },

  {
    title: '用 RSC 构建生成式 UI（实验性）',
    description:
      '使用 Next.js、AI SDK 与 streamUI，基于 React 服务器组件创建生成式 UI。',
    logos: [NextIcon, OpenAIIcon],
    type: 'generative-ui',
    link: 'https://vercel.com/templates/next.js/rsc-genui',
  },
  {
    title: '多模态聊天',
    description:
      '使用 Next.js 与 AI SDK 的 useChat Hook 构建多模态消息聊天界面。',
    logos: [NextIcon, File],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/next.js/multi-modal-chatbot',
  },
  {
    title: '语义图像搜索',
    description:
      '基于 Next.js、AI SDK 与 Postgres 构建的 AI 语义图像搜索应用模板。',
    logos: [NextIcon, Image],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/next.js/semantic-image-search',
  },
  {
    title: '自然语言 PostgreSQL',
    description:
      '用 AI SDK 与 GPT-4o 以自然语言查询 PostgreSQL。',
    logos: [NextIcon, ChartLine],
    type: 'starter-kits',
    link: 'https://vercel.com/templates/next.js/natural-language-postgres',
  },
  {
    title: 'Feature Flags 示例',
    description:
      'AI SDK 结合 Next.js、Feature Flags 与 Edge Config 实现动态模型切换。',
    logos: [NextIcon, Flag],
    type: 'feature-exploration',
    link: 'https://vercel.com/templates/next.js/ai-sdk-feature-flags-edge-config',
  },
  {
    title: '带遥测的聊天机器人',
    description: '支持 OpenTelemetry 的 AI SDK 聊天机器人。',
    logos: [NextIcon, ChartNoAxesColumn],
    type: 'feature-exploration',
    link: 'https://vercel.com/templates/next.js/ai-chatbot-telemetry',
  },
  {
    title: '结构化对象流式生成',
    description:
      '使用 AI SDK 的 useObject Hook 流式生成结构化对象。',
    logos: [NextIcon, Braces],
    type: 'feature-exploration',
    link: 'https://vercel.com/templates/next.js/use-object',
  },
  {
    title: '多步工具调用',
    description:
      '使用 AI SDK 的 streamText 函数自动处理多步工具调用。',
    logos: [NextIcon, ListOrdered],
    type: 'feature-exploration',
    link: 'https://vercel.com/templates/next.js/ai-sdk-roundtrips',
  },
];

export const Templates = ({ type }: { type: TemplateType }) => {
  return (
    <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
      {TEMPLATES.filter(template => template.type === type).map(template => (
        <Link
          href={template.link}
          key={template.title}
          rel="noreferrer"
          target="_blank"
        >
          <div className="flex h-full flex-col rounded-lg border border-gray-alpha-400 transition-colors hover:border-gray-alpha-600">
            <div className="flex flex-row items-center justify-center gap-6 rounded-t-lg bg-background-100 p-8 text-gray-1000">
              {template.logos.map((Logo, index) => {
                const isLogo =
                  template.type === 'frameworks' ||
                  template.type === 'generative-ui' ||
                  index === 0;
                // biome-ignore lint/suspicious/noArrayIndexKey: we control the static content
                return <Logo key={index} size={isLogo ? 32 : 24} />;
              })}
            </div>
            <div className="flex-1 rounded-b-lg border-gray-alpha-400 border-t bg-background-200 p-4">
              <div className="font-medium text-gray-1000">{template.title}</div>
              <div className="text-gray-900 text-sm leading-6">
                {template.description}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
