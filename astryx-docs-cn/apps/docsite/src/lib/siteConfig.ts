// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file siteConfig.ts
 *
 * Single source of truth for the docsite's public origin and identity.
 * Consumed by the root layout (metadataBase, OG/Twitter) and the sitemap so
 * absolute URLs stay consistent across metadata and crawler surfaces.
 *
 * Override SITE_URL per environment (e.g. preview deploys) via
 * NEXT_PUBLIC_SITE_URL; it defaults to the production domain so social
 * scrapers resolve relative OG image paths to absolute URLs.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://astryx.atmeta.com';

/**
 * Prefix a root-absolute asset path with the build's basePath. Native `<img>`
 * sources, metadata `images`, and `icons` entries do not get basePath applied
 * automatically (only next/link and next/image do), so every hand-written
 * root-absolute asset reference must go through this helper. No-op when the
 * build has no basePath (canonical dev/Vercel builds).
 */
export function withBasePath(path: string): string {
  const base = process.env.__NEXT_ROUTER_BASEPATH ?? '';
  return path.startsWith('/') ? `${base}${path}` : path;
}

export const SITE_NAME = 'Astryx';
export const SITE_TITLE = 'Astryx 设计系统';
export const SITE_DESCRIPTION =
  '完全可定制、面向智能体（agent-ready）的开源设计系统。';
