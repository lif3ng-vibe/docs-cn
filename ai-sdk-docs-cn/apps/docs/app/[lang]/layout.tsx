import '../global.css';
import '@/lib/geistdocs/site-url-warning';
import { Footer } from '@vercel/geistdocs/footer';
import { Navbar } from '@vercel/geistdocs/navbar';
import type { Metadata, Viewport } from 'next';
import { DocsProvider } from '@/components/docs/provider';
import { config } from '@/lib/geistdocs/config';
import { mono, sans } from '@/lib/geistdocs/fonts';
import { getRootLang } from '@/lib/geistdocs/root-params';
import { isSiteUrlConfigured, siteUrl } from '@/lib/geistdocs/site-url';

// 纯中文单语镜像：root param 只枚举 'cn'（geistdocs 的中文 locale 键，
// 不出现在 URL 中）；<html lang> 映射回标准的 zh-CN。
export const generateStaticParams = () => [{ lang: 'cn' }];

export const metadata: Metadata = {
  metadataBase: isSiteUrlConfigured ? siteUrl : undefined,
  title: {
    default: 'AI SDK',
    template: '%s | AI SDK',
  },
  description: '用于构建 AI 应用与智能体的 TypeScript 工具集。',
  openGraph: {
    siteName: 'AI SDK',
    type: 'website',
  },
  // Twitter falls back to the page's og:image; the card type must be set
  // for large cards.
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { color: '#ffffff', media: '(prefers-color-scheme: light)' },
    { color: '#000000', media: '(prefers-color-scheme: dark)' },
  ],
};

const RootLayout = async ({ children }: LayoutProps<'/[lang]'>) => {
  const lang = await getRootLang();

  return (
    <html
      className={`${sans.variable} ${mono.variable} antialiased`}
      lang={lang === 'cn' ? 'zh-CN' : lang}
      suppressHydrationWarning
    >
      <body>
        <DocsProvider config={config} lang={lang}>
          <Navbar config={config} />
          {children}
          <Footer />
        </DocsProvider>
      </body>
    </html>
  );
};

export default RootLayout;
