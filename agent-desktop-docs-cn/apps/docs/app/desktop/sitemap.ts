import { getPublicPath } from "@vercel/geistdocs/config";
import { isPageVisibleForSurface } from "@vercel/geistdocs/page-visibility";
import type { MetadataRoute } from "next";
import { config } from "@/lib/geistdocs/config";
import { absoluteUrl } from "@/lib/geistdocs/site-url";
import { source } from "@/lib/geistdocs/source";

// 静态导出镜像：sitemap 全静态生成（无需 ISR 运行时）。
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) =>
    absoluteUrl(getPublicPath(path, config.basePath));

  const pages: MetadataRoute.Sitemap = [];

  for (const page of source.getPages()) {
    if (!isPageVisibleForSurface(page, "sitemap")) {
      continue;
    }

    const data = page.data as { lastModified?: Date };

    pages.push({
      changeFrequency: "weekly" as const,
      lastModified: data.lastModified ? new Date(data.lastModified) : undefined,
      priority: 0.5,
      url: url(page.url),
    });
  }

  return pages;
}

export const revalidate = false;
