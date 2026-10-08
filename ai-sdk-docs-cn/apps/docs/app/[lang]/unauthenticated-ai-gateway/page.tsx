import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoIconVercelSvg } from '@vercel/geistdocs/assets/logos';
import { Snippet } from '@/components/docs/snippet';

export const metadata: Metadata = {
  title: '获取你的 API 密钥',
  description:
    '把 AI SDK 接入 AI Gateway，或配置专用的模型提供商。',
};

const code = (value: string) => (
  <pre className="not-prose my-4 overflow-x-auto rounded-md border border-gray-400 bg-background-100 p-4 font-mono text-[13px] leading-6">
    <code>{value}</code>
  </pre>
);

export default function UnauthenticatedAiGatewayPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <article className="prose">
        <h1>获取你的 API 密钥</h1>

        <h2>AI Gateway</h2>
        <p>
          The{' '}
          <Link href="/providers/ai-sdk-providers/ai-gateway" prefetch={true}>
            Vercel AI Gateway
          </Link>{' '}
          让 AI SDK 可以访问 OpenAI、Anthropic、Google 等提供商的模型。使用{' '}
          <a href="https://vercel.com/docs/ai-gateway/getting-started#set-up-your-api-key">
            AI Gateway API 密钥
          </a>{' '}
          或{' '}
          <a href="https://vercel.com/docs/ai-gateway/authentication#oidc-token">
            OIDC
          </a>
          完成认证。
        </p>
        <p>
          <a
            className="not-prose inline-flex items-center gap-2 rounded-md border border-gray-400 bg-background-100 px-4 py-2 text-sm font-medium no-underline hover:bg-background-200"
            href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys%3Futm_source%3Dgateway-models-page%26showCreateKeyModal%3Dtrue&title=Get+Started+with+Vercel+AI+Gateway"
          >
            <LogoIconVercelSvg />
            获取 API 密钥
          </a>
        </p>
        <p>把 API 密钥加入你的环境变量：</p>
        <Snippet prompt={false} text="AI_GATEWAY_API_KEY=your_api_key_here" />
        <p>
          AI Gateway is the default{' '}
          <Link
            href="/docs/ai-sdk-core/provider-management#global-provider-configuration"
            prefetch={true}
          >
            全局提供商
          </Link>
          ，因此无需引入提供商包即可直接使用 <code>creator/model</code> 形式的模型字符串。
        </p>
        {code(`import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.5',
  prompt: 'What is love?',
});`)}

        <h2>使用专用提供商</h2>
        <p>
          You can use{' '}
          <Link href="/providers/ai-sdk-providers" prefetch={true}>
            一方提供商
          </Link>
          、OpenAI 兼容提供商与社区提供商。
        </p>
        <Snippet text="pnpm add @ai-sdk/anthropic" />
        {code(`import { anthropic } from '@ai-sdk/anthropic';

model: anthropic('claude-sonnet-4-5');`)}

        <h2>自定义提供商</h2>
        <p>
          实现 AI SDK 的模型规范即可接入其他模型服务。完整的提供商契约见{' '}
          <Link
            href="/providers/community-providers/custom-providers"
            prefetch={true}
          >
            编写自定义提供商
          </Link>{' '}
          for the complete provider contract.
        </p>
      </article>
    </main>
  );
}
