import { createTokenizer as createTokenizerMandarin } from '@orama/tokenizers/mandarin';
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';
import type { AdvancedOptions } from 'fumadocs-core/search/server';
import { config } from '@/lib/geistdocs/config';
import { v7Sources } from '@/lib/geistdocs/source';

/**
 * 静态导出搜索：导出 fumadocs 的静态搜索索引（`staticGET`），构建期
 * 预渲染为静态文件；客户端 `components/docs/static-search-dialog.tsx`
 * 以 `type: 'static'` 拉取本文件在本地完成检索。
 *
 * 语言映射复制自 @vercel/geistdocs 的 search 路由：仅 'cn' 挂载
 * Orama 中文分词器（服务端无中文 stemmer）。
 */
const languages = Array.from(
  new Set([config.defaultLanguage, ...Object.keys(config.translations ?? {})]),
);

const localeMap: Record<
  string,
  string | Partial<AdvancedOptions> | undefined
> = Object.fromEntries(
  Object.entries(config.translations ?? {}).map(([locale, translation]) => [
    locale,
    translation.displayName.toLowerCase(),
  ]),
);
localeMap.cn = {
  components: {
    tokenizer: createTokenizerMandarin(),
  },
  search: {
    threshold: 0,
    tolerance: 0,
  },
};

const api = createI18nSearchAPI('advanced', {
  i18n: {
    defaultLanguage: config.defaultLanguage,
    languages,
    hideLocale: 'default-locale',
  },
  indexes: () =>
    languages.flatMap(locale =>
      v7Sources.flatMap(source =>
        source.source.getPages(locale).map(page => {
          const data = page.data as PageDataLike;
          return {
            id: page.url,
            title: data.title ?? page.url,
            description: data.description ?? '',
            locale,
            structuredData: data.structuredData ?? {
              headings: [],
              contents: [],
            },
            url: page.url,
          };
        }),
      ),
    ),
  localeMap,
});

type PageDataLike = {
  title?: string;
  description?: string;
  structuredData?: StructuredData;
};

// 静态导出：构建期生成索引文件（无 Request 依赖）。
export const dynamic = 'force-static';

export const GET = api.staticGET;
