import { transformerMetaHighlight } from '@shikijs/transformers';
import {
  defineGeistdocsSourceConfig,
  geistdocsFrontmatterSchema,
  geistdocsMetaSchema,
  geistShikiTheme,
} from '@vercel/geistdocs/source-config';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineDocs } from 'fumadocs-mdx/config';
import {
  rehypeCodeTemplates,
  remarkCodeTemplates,
} from './lib/geistdocs/code-templates.mjs';

const createDocsCollection = (dir: string) =>
  defineDocs({
    dir,
    docs: {
      schema: geistdocsFrontmatterSchema,
      postprocess: {
        includeProcessedMarkdown: true,
      },
    },
    meta: {
      schema: geistdocsMetaSchema,
    },
  });

export const docsV7 = createDocsCollection('content/v7/docs');
export const providersV7 = createDocsCollection('content/v7/providers');
export const cookbookV7 = createDocsCollection('content/v7/cookbook');

export default defineGeistdocsSourceConfig({
  mdxOptions: {
    // 中文镜像构建机无外网（远程图片无法下载量尺寸），关闭 remarkImage
    // 插件：图片保持原 URL 直出（损失 blur 占位与 CLS 预算）。
    remarkImageOptions: false,
    remarkPlugins: [remarkCodeTemplates],
    rehypePlugins: defaults => [rehypeCodeTemplates, ...defaults],
    rehypeCodeOptions: {
      // Themes are overridden by defineGeistdocsSourceConfig at runtime, but
      // required at the type level when passing rehypeCodeOptions.
      themes: { light: geistShikiTheme, dark: geistShikiTheme },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        // Supports `{1,3-5}` fence meta produced by the sync-content
        // transform from the legacy `highlight="1,3-5"` convention.
        transformerMetaHighlight(),
      ],
    },
  },
});
