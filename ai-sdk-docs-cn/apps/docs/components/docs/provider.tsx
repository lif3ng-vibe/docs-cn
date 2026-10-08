'use client';

import { GeistdocsProvider } from '@vercel/geistdocs/layout';
import { config } from '@/lib/geistdocs/config';
import { StaticSearchDialog } from '@/components/docs/static-search-dialog';
import type { SharedProps } from 'fumadocs-ui/contexts/search';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useCallback } from 'react';
import type { ComponentProps } from 'react';

type ProviderSearch = NonNullable<
  ComponentProps<typeof GeistdocsProvider>['search']
>;

/**
 * Mounted in [lang]/layout. 静态导出镜像：搜索对话框替换为
 * `type: 'static'` 版本（从构建期索引检索，无服务端 API）。
 */
export const DocsProvider = (
  props: Omit<ComponentProps<typeof GeistdocsProvider>, 'search'>,
) => {
  const segment = useSelectedLayoutSegment();
  const version = segment === 'v5' || segment === 'v6' ? segment : 'v7';

  const search: ProviderSearch = {
    // The tag becomes part of the search URL and the client's cache key.
    options: { tag: version },
    SearchDialog: useCallback(
      (dialogProps: SharedProps & { tag?: string }) => (
        <StaticSearchDialog
          from={`${config.basePath ?? ''}/api/search`}
          {...dialogProps}
        />
      ),
      [],
    ),
  };

  return <GeistdocsProvider {...props} search={search} />;
};
