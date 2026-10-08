import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { socialCard } from '@/lib/og';
import Link from 'next/link';
import { Templates } from '@/components/docs/templates';

export const metadata: Metadata = {
  alternates: { canonical: '/resources/templates' },
  title: 'AI SDK 模板',
  description:
    '用 AI SDK 构建的官方应用模板、示例与框架集成。',
  ...socialCard(
    'AI SDK Templates',
    '用 AI SDK 构建的官方应用模板、示例与框架集成。',
  ),
};

const TemplatesPage = () => (
  <div className="mx-auto flex w-full max-w-[900px] flex-col gap-10 p-4 pb-16 md:px-6">
    <div className="flex flex-col gap-2 pt-12">
      <div className="text-gray-900 text-sm">
        <Link className="hover:underline" href="/resources">
          资源
        </Link>{' '}
        / 模板
      </div>
      <h1 className="font-semibold text-4xl text-gray-1000">模板</h1>
      <p className="text-gray-900 text-xl">
        从用 AI SDK 构建的官方应用模板、示例与框架集成起步。
      </p>
    </div>

    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-2xl text-gray-1000">Starter Kits</h2>
        <Link
          className="inline-flex items-center gap-1 text-sm hover:underline"
          href="https://vercel.com/templates?type=ai"
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <Templates type="starter-kits" />
    </section>

    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-2xl text-gray-1000">
        Feature Exploration
      </h2>
      <Templates type="feature-exploration" />
    </section>

    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-2xl text-gray-1000">Frameworks</h2>
      <Templates type="frameworks" />
    </section>

    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-2xl text-gray-1000">Generative UI</h2>
      <Templates type="generative-ui" />
    </section>

    <section className="flex flex-col gap-5">
      <h2 className="font-semibold text-2xl text-gray-1000">Security</h2>
      <Templates type="security" />
    </section>
  </div>
);

export default TemplatesPage;
