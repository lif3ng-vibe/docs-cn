import { Badge } from '@vercel/geistdocs/components/badge';
import { Button } from '@vercel/geistdocs/components/button';
import {
  CommandPromptContent,
  CommandPromptCopy,
  CommandPromptList,
  CommandPromptPrefix,
  CommandPromptRoot,
  CommandPromptSurface,
  CommandPromptTrigger,
  CommandPromptTriggerDivider,
  CommandPromptViewport,
} from '@vercel/geistdocs/components/command-prompt';
import { LogoIconAngularSvg } from '@vercel/geistdocs/assets/logos/logo-icon-angular-svg';
import { LogoIconNuxtSvg } from '@vercel/geistdocs/assets/logos/logo-icon-nuxt-svg';
import { LogoIconReactSvg } from '@vercel/geistdocs/assets/logos/logo-icon-react-svg';
import { LogoIconSolidstartSvg } from '@vercel/geistdocs/assets/logos/logo-icon-solidstart-svg';
import { LogoIconSvelteSvg } from '@vercel/geistdocs/assets/logos/logo-icon-svelte-svg';
import { LogoIconVueSvg } from '@vercel/geistdocs/assets/logos/logo-icon-vue-svg';
import { LogoNextJs } from '@vercel/geistdocs/assets/logos/logo-next-js';
import { IconArrowDown } from '@vercel/geistdocs/assets/icons/icon-arrow-down';
import { IconRoute } from '@vercel/geistdocs/assets/icons/icon-route';
import { IconShieldCheck } from '@vercel/geistdocs/assets/icons/icon-shield-check';
import { IconToggleOn } from '@vercel/geistdocs/assets/icons/icon-toggle-on';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { PROMPT_TEMPLATES } from '@/lib/home/prompt-templates';
import { CardSnippet } from './card-snippet';
import { LogoElementor, LogoOpencode } from './company-logos';
import { CodeExamplesSection } from './code-examples';
import { HeroInteractive } from './hero-interactive';
import { InstallCommand } from './install-command';
import { OssStatsSection } from './oss-stats-section';

const frameworks = [
  { name: 'Next.js', logo: <LogoNextJs height={48} /> },
  { name: 'React', logo: <LogoIconReactSvg size={48} /> },
  { name: 'Svelte', logo: <LogoIconSvelteSvg size={48} /> },
  { name: 'Angular', logo: <LogoIconAngularSvg size={48} /> },
  { name: 'Vue', logo: <LogoIconVueSvg size={48} /> },
  { name: 'Nuxt', logo: <LogoIconNuxtSvg size={48} /> },
  { name: 'Solid', logo: <LogoIconSolidstartSvg size={48} /> },
];
const features = [
  {
    title: '多提供商支持',
    description: '一行代码即可切换提供商。',
    Icon: IconToggleOn,
  },
  {
    title: '开箱即用的流式输出',
    description: '实时响应，无需自行解析。',
    Icon: IconArrowDown,
  },
  {
    title: '内建回退机制',
    description: '默认即具备可靠的生产级行为。',
    Icon: IconShieldCheck,
  },
  {
    title: '兼容 AI Gateway',
    description: '通过一个端点路由到任意模型。',
    Icon: IconRoute,
  },
];
const integrations = [
  {
    title: 'Vercel AI Gateway',
    description: '访问 100 多个模型，无加价，无需管理多个 API 密钥。',
    href: 'https://vercel.com/ai-gateway',
    command: 'npm i ai',
  },
  {
    title: 'Vercel Sandbox',
    description: '安全、大规模地运行智能体生成的代码。',
    href: 'https://vercel.com/sandbox',
    command: 'npm i @vercel/sandbox',
  },
  {
    title: 'Workflows',
    description:
      '构建可挂起、可恢复、能扛住函数超时的长时运行 AI 智能体与应用。',
    href: 'https://vercel.com/workflow',
    command: 'npm i workflow',
    badge: '新',
  },
  {
    title: 'AI Elements',
    description: '一个 UI 组件库与自定义 registry，帮你更快构建 AI 原生应用。',
    href: 'https://elements.ai-sdk.dev',
    command: 'npx ai-elements',
  },
];
const testimonials = [
  {
    quote:
      '我们用 AI SDK 构建了一个拥有 40 多个工具、可恢复流与多步推理的完整 AI 智能体。以前我们靠各种临时手段勉强解决的难题——流式输出、工具调用修复、消息管理、基于工具的 UI——它都已经有干净的 API 了。',
    name: 'Adir Duchan',
    role: 'Senior AI Engineer',
    company: 'Elementor',
    Logo: LogoElementor,
  },
  {
    quote: 'OpenCode 用的就是 AI SDK。',
    name: 'Dax Raad',
    role: 'CEO & Founder',
    company: 'OpenCode',
    Logo: LogoOpencode,
  },
];

const sectionHeading = 'text-heading-32 lg:text-heading-48';

/** Linked card with a copy snippet, styled after the Chat SDK and vercel.com. */
function LinkCard({
  title,
  description,
  href,
  badge,
  children,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <a
      className="flex flex-col gap-8 rounded-xs border border-gray-300 p-8 no-underline transition-colors outline-none hover:border-gray-500 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 has-[[data-card-snippet]:hover]:border-gray-300"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="flex h-full flex-col justify-between gap-2 lg:gap-3">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-heading-16 font-medium! text-gray-1000 sm:text-heading-20">
            {title}
            {badge ? (
              <Badge size="sm" variant="inverted">
                {badge}
              </Badge>
            ) : null}
          </span>
          <span className="max-w-[32ch] text-copy-16 text-balance text-gray-900">
            {description}
          </span>
        </div>
        {children}
      </div>
    </a>
  );
}

export function LandingPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-[1448px] px-4 pb-12 sm:px-6 lg:pb-20">
        <section
          aria-labelledby="home-title"
          className="flex flex-col items-center py-16 md:py-24 lg:py-32"
        >
          <h1
            className="max-w-5xl text-balance text-center text-heading-40 md:text-heading-48 lg:text-heading-64"
            id="home-title"
          >
            构建框架与智能体的通用 AI 层
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-center text-copy-16 text-gray-900 md:text-copy-18 lg:text-copy-20">
            统一的 TypeScript SDK，以现代流式输出、回退机制与多模型支持构建
            AI 应用——由 Vercel 打造
          </p>
          <CommandPromptRoot
            className="mt-8 flex w-full flex-col items-center gap-2"
            defaultValue="humans"
          >
            <CommandPromptList>
              <CommandPromptTrigger value="humans">
                给人类
              </CommandPromptTrigger>
              <CommandPromptTriggerDivider />
              <CommandPromptTrigger value="agents">
                给智能体
              </CommandPromptTrigger>
            </CommandPromptList>
            <CommandPromptSurface>
              <CommandPromptPrefix>$</CommandPromptPrefix>
              <CommandPromptViewport>
                <CommandPromptContent value="humans">
                  npm install ai
                </CommandPromptContent>
                <CommandPromptContent value="agents">
                  npx skills add vercel/ai
                </CommandPromptContent>
              </CommandPromptViewport>
              <CommandPromptCopy aria-label="复制安装命令" />
            </CommandPromptSurface>
          </CommandPromptRoot>
          <HeroInteractive className="mt-16 w-full md:mt-20" />
        </section>
        <OssStatsSection />
        <section
          aria-labelledby="home-frameworks"
          className="grid grid-cols-1 items-center gap-y-4 py-12 md:py-20 lg:grid-cols-12 lg:gap-x-12"
        >
          {/* The heading and logos share the first row so the logos center on
              the heading; the description sits below the heading. */}
          <h2
            className={`${sectionHeading} text-balance lg:col-span-4`}
            id="home-frameworks"
          >
            框架无关的 AI 工具集
          </h2>
          <p className="max-w-md text-pretty text-copy-18 text-gray-900 lg:col-span-4 lg:row-start-2">
            开源的 AI 工具集，帮助开发者用 React、Next.js、Vue、Svelte、
            Node.js 等技术构建 AI 应用与智能体。
          </p>
          <ul className="mt-6 flex flex-wrap items-center gap-6 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:mt-0 lg:flex-nowrap lg:justify-between lg:gap-0">
            {frameworks.map(({ name, logo }) => (
              <li
                className="flex size-12 items-center justify-center"
                key={name}
                title={name}
              >
                {logo}
                <span className="sr-only">{name}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="AI SDK 特性" className="py-12 md:py-20">
          <ul className="grid gap-10 md:grid-cols-2 md:gap-x-8 lg:grid-cols-4">
            {features.map(({ title, description, Icon }) => (
              <li className="flex flex-col gap-3" key={title}>
                <h3 className="flex items-center gap-2 text-copy-16 font-medium text-gray-900">
                  <Icon aria-hidden="true" size={16} />
                  {title}
                </h3>
                <p className="text-copy-18 text-gray-900 lg:max-w-[200px]">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <CodeExamplesSection />
        <section aria-labelledby="home-scale" className="py-12 md:py-20">
          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-12 lg:gap-x-12">
            <h2 className={`${sectionHeading} lg:col-span-5`} id="home-scale">
              放心扩展规模
            </h2>
            <p className="text-pretty text-copy-18 text-gray-900 lg:col-span-5 lg:col-start-8">
              把 AI SDK 接入一整个为可扩展现代 AI 应用设计的生态。
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
            {integrations.map(({ command, ...item }) => (
              <LinkCard key={item.title} {...item}>
                <CardSnippet text={command} />
              </LinkCard>
            ))}
          </div>
        </section>
        {/* Pull-out quotes, styled like the quote on vercel.com/ai-sdk. */}
        <section
          aria-labelledby="home-testimonials"
          className="grid gap-24 py-24 lg:grid-cols-2 lg:gap-x-24"
        >
          <h2 className="sr-only" id="home-testimonials">
            开发者这样评价 AI SDK
          </h2>
          {testimonials.map(item => (
            // Left-aligned like the compact pull-out quote on vercel.com, with
            // the opening mark hung in the margin so the text edge stays flush.
            <figure
              className="m-0 flex flex-col justify-between gap-6 md:gap-9"
              key={item.name}
            >
              <blockquote className="m-0 max-w-[44ch] text-left text-heading-24 font-normal! text-pretty text-gray-1000 lg:text-heading-32">
                <span className="-ml-[0.45em] inline-block w-[0.45em] text-right">
                  &ldquo;
                </span>
                {item.quote}
                <span className="tracking-[-0.02em]">&rdquo;</span>
              </blockquote>
              <figcaption className="flex items-end justify-between gap-6">
                <span className="flex flex-col gap-1 font-sans text-label-14 font-medium">
                  <span className="text-gray-1000">{item.name}</span>
                  <span className="font-normal text-gray-900">
                    {item.role}, {item.company}
                  </span>
                </span>
                <item.Logo className="shrink-0 text-gray-1000" height={18} />
              </figcaption>
            </figure>
          ))}
        </section>
        <section aria-labelledby="home-get-started" className="py-12 md:py-20">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              {/* "SDK" is a CSS pill sized in ems, as in the vercel.com/ai-sdk
                  and /ai-gateway headings, so "AI" keeps the heading's weight. */}
              <h2 className={sectionHeading} id="home-get-started">
                立即用{' '}
                <span className="relative -top-1 inline-flex items-center rounded-full border-[3px] border-gray-1000 bg-background-200 px-[0.3em] py-[0.03em] align-middle text-[0.6em] leading-none font-semibold tracking-[-0.037em] uppercase lg:border-4">
                  AI SDK
                </span>{' '}
                开始构建
              </h2>
              <p className="mt-4 max-w-md text-copy-18 text-gray-900">
                通过菜谱或模板快速上手 AI SDK。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="shrink-0"
                href="/docs/introduction"
                prefetch={true}
              >
                <Button Component="span" className="rounded-full" size="large">
                  阅读文档
                </Button>
              </Link>
              <InstallCommand command="npm i ai" />
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
            {PROMPT_TEMPLATES.map(template => (
              <LinkCard
                description={template.description}
                href={template.link}
                key={template.title}
                title={template.title}
              >
                <CardSnippet
                  label="复制安装提示词"
                  text={template.prompt}
                />
              </LinkCard>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
