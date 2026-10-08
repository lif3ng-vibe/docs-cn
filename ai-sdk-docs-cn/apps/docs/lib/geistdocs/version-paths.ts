import { collectVersionPaths } from '@vercel/geistdocs/source';
import type { GeistdocsVersionPaths } from '@vercel/geistdocs/versions';
import { recipesV7Source, v7Sources } from './source';

/**
 * Existing prefix-relative paths for version switching. The recipes mirror
 * participates even though sitemap, llms.txt, and search use /cookbook.
 *
 * 中文镜像只收录 v7：此表仅剩一项，版本切换器已随 config.versions 移除，
 * 保留函数以便 layout 守卫与类型继续成立。
 */
export const getVersionPaths = (
  lang: string,
): Record<string, GeistdocsVersionPaths> => ({
  v7: {
    fallbackPath: '/docs/introduction',
    paths: collectVersionPaths({
      lang,
      sources: [...v7Sources, recipesV7Source],
    }),
  },
});
