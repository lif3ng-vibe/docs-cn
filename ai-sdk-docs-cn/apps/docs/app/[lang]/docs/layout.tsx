import { GeistdocsDocsLayout } from '@vercel/geistdocs/layout';
import { getRootLang } from '@/lib/geistdocs/root-params';
import type { ReactNode } from 'react';
import { config } from '@/lib/geistdocs/config';
import { v7Source } from '@/lib/geistdocs/source';

const DocsLayout = async ({ children }: { children: ReactNode }) => {
  const lang = await getRootLang();
  return (
    <GeistdocsDocsLayout
      config={config}
      containerProps={{
        className: 'mx-auto max-w-[1448px] bg-background-200',
      }}
      tree={v7Source.source.pageTree[lang]}
    >
      {children}
    </GeistdocsDocsLayout>
  );
};

export default DocsLayout;
