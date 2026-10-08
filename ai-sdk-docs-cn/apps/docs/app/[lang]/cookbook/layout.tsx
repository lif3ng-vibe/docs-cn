import { GeistdocsDocsLayout } from '@vercel/geistdocs/layout';
import { getRootLang } from '@/lib/geistdocs/root-params';
import type { ReactNode } from 'react';
import { config } from '@/lib/geistdocs/config';
import { cookbookV7Source } from '@/lib/geistdocs/source';

const CookbookLayout = async ({ children }: { children: ReactNode }) => {
  const lang = await getRootLang();
  return (
    <GeistdocsDocsLayout
      config={config}
      containerProps={{
        className: 'mx-auto max-w-[1448px] bg-background-200',
      }}
      tree={cookbookV7Source.source.pageTree[lang]}
    >
      {children}
    </GeistdocsDocsLayout>
  );
};

export default CookbookLayout;
