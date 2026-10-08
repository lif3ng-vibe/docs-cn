import type { Metadata } from 'next';
import { LandingPage } from '@/components/home/landing-page';
import { absoluteUrl } from '@/lib/geistdocs/site-url';

const description =
  '统一的 TypeScript SDK，以现代流式输出、回退机制与多模型支持构建 AI 应用——由 Vercel 打造。';
const image = 'https://e742qlubrjnjqpp0.public.blob.vercel-storage.com/og.png';

export const metadata: Metadata = {
  title: { absolute: 'AI SDK' },
  description,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: 'AI SDK',
    description,
    url: absoluteUrl('/'),
    siteName: 'AI SDK',
    type: 'website',
    images: [{ url: image }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI SDK',
    description,
    images: [image],
  },
};

export default LandingPage;
