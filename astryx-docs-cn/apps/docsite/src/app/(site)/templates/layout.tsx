// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Supplies metadata for the /templates gallery index. That page reads
 * `?preview=` via useSearchParams (so it's a client component and cannot export
 * metadata); this server layout provides it without touching that render path.
 */

import type {Metadata} from 'next';
import {pageMetadata} from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: '模板',
  description:
    '开箱即用的页面模板，助你快速启动项目：仪表盘、设置、表单、AI 聊天等。',
  path: '/templates',
});

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
