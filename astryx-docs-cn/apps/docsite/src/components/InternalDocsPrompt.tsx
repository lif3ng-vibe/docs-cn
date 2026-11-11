// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Build target, configured docs origin, exact-origin reachability, and
 *   the current docs view
 * @output The internal-docs banner after reachability, otherwise the public Canary banner
 * @position Root-owned detection; banner content lives in the page shell
 */

import {createContext, Suspense, useContext, type ReactNode} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CURRENT_TARGET, urlForTarget} from '../lib/docsVersions';
import {
  INTERNAL_DOCS_ORIGIN,
  useInternalDocsPrompt,
} from '../lib/useInternalDocsPrompt';

const ReachabilityContext = createContext(false);

export function InternalDocsReachabilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const isReachable = useInternalDocsPrompt();
  return (
    <ReachabilityContext value={isReachable}>{children}</ReachabilityContext>
  );
}

export function internalDocsHref(
  pathname: string,
  search: string,
): string | undefined {
  if (!INTERNAL_DOCS_ORIGIN) {
    return undefined;
  }
  // Shared route families use the same topic/name/slug semantics. Public-only
  // pages (blog, community, changelog, preview) have no same-path counterpart.
  const hasCounterpart =
    pathname === '/' ||
    /^\/(docs|components|templates)(\/[^/]+)?\/?$/.test(pathname) ||
    /^\/(themes|playground)\/?$/.test(pathname);
  const url = new URL(INTERNAL_DOCS_ORIGIN);
  if (hasCounterpart) {
    url.pathname = pathname;
    url.search = search;
  }
  return url.href;
}

export function DocsBanner() {
  return (
    <Suspense fallback={<CanaryNotice />}>
      <InternalDocsPrompt />
    </Suspense>
  );
}

function CanaryNotice() {
  const pathname = usePathname();
  return CURRENT_TARGET === 'canary' ? (
    <DocsInfoBanner productionHref={urlForTarget('latest', pathname)} />
  ) : null;
}

export function InternalDocsPrompt() {
  const isReachable = useContext(ReachabilityContext);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const isCanary = CURRENT_TARGET === 'canary';
  const view = `${pathname}${search ? `?${search}` : ''}`;

  return isCanary || isReachable ? (
    <DocsInfoBanner
      key={view}
      internalHref={
        isReachable ? internalDocsHref(pathname, search) : undefined
      }
      productionHref={isCanary ? urlForTarget('latest', view) : null}
    />
  ) : null;
}

function DocsInfoBanner({
  internalHref,
  productionHref,
}: {
  internalHref?: string;
  productionHref: string | null;
}) {
  const isCanary = CURRENT_TARGET === 'canary';
  return (
    <Banner
      role="region"
      aria-label="文档提示"
      container="section"
      status={internalHref ? 'info' : 'warning'}
      isDismissable
      dismissLabel="在本次页面浏览中关闭文档提示"
      title={
        internalHref
          ? '在 Meta 内部工具上工作？'
          : '你正在查看 Canary 文档'
      }
      description={
        <>
          {internalHref &&
            'Meta 内部文档包含 Meta 专属的组件与指引。'}
          {isCanary && internalHref && <br />}
          {isCanary && (
            <>
              这些文档可能包含未发布的组件与 props。查看生产版文档以获取最新稳定版本。
            </>
          )}
        </>
      }
      endContent={
        <>
          {internalHref && (
            <Button
              label="Meta 内部文档"
              variant="secondary"
              href={internalHref}
            />
          )}
          {productionHref && (
            <Button
              label="查看生产版"
              variant="secondary"
              href={productionHref}
            />
          )}
        </>
      }
    />
  );
}
