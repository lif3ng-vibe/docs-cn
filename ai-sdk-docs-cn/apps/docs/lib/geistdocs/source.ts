import { createVersionedSources } from '@vercel/geistdocs/source';
import { cookbookV7, docsV7, providersV7 } from '@/.source/server';
import { config } from './config';

/**
 * 中文镜像只收录 v7（当前版）文档：v5/v6 维护版不翻译，
 * 版本切换器随 config.versions 一并移除。
 */
export const versions = createVersionedSources({
  config,
  current: 'v7',
  versions: [
    {
      id: 'v7',
      label: 'v7',
      docs: docsV7,
      baseUrl: '/docs',
      routePrefix: '',
    },
  ],
});

export const providerVersions = createVersionedSources({
  config,
  current: 'v7',
  versions: [
    {
      id: 'v7',
      label: 'v7',
      docs: providersV7,
      baseUrl: '/providers',
      routePrefix: '',
    },
  ],
});

export const cookbookVersions = createVersionedSources({
  config,
  current: 'v7',
  versions: [
    {
      id: 'v7',
      label: 'v7',
      docs: cookbookV7,
      baseUrl: '/cookbook',
      routePrefix: '',
    },
  ],
});

/**
 * The same cookbook content served under /resources/recipes, mirroring
 * production: ai-sdk.dev renders every recipe on both URL surfaces (the
 * sitemap and agent surfaces canonicalize on /cookbook).
 */
export const recipesVersions = createVersionedSources({
  config,
  current: 'v7',
  versions: [
    {
      id: 'v7',
      label: 'v7',
      docs: cookbookV7,
      baseUrl: '/resources/recipes',
      routePrefix: '',
    },
  ],
});

export const v7Source = versions.byId.v7;
export const providersV7Source = providerVersions.byId.v7;
export const cookbookV7Source = cookbookVersions.byId.v7;
export const recipesV7Source = recipesVersions.byId.v7;

/**
 * Sources for a version across every content family. The /resources/recipes
 * bundles are intentionally excluded: production canonicalizes the sitemap,
 * llms.txt, and search on the /cookbook URLs.
 */
export const v7Sources = [v7Source, providersV7Source, cookbookV7Source];

/** Every source bundle (all versions, all families). */
export const sources = [...v7Sources];
