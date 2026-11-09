import type { Metadata } from "next";
import { PAGE_TITLES } from "./page-titles";

import { canonicalUrlFor, siteDescription, siteName, upstreamUrl } from "./site";

export function pageMetadata(slug: string): Metadata {
  const title = PAGE_TITLES[slug];
  if (!title) return {};

  const displayTitle = title.replace(/\n/g, " ");
  const fullTitle = slug
    ? `${displayTitle} | ${siteName}`
    : `${siteName} | AI 浏览器自动化 CLI`;
  // OG 图沿用上游动态生成的图片（静态镜像不再自带 og 渲染路由）。
  const ogImageUrl = slug ? `${upstreamUrl}/og/${slug}` : `${upstreamUrl}/og`;
  const href = slug ? `/${slug}` : "/";

  return {
    title: slug ? displayTitle : { absolute: fullTitle },
    description: siteDescription,
    alternates: {
      canonical: canonicalUrlFor(href),
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: "agent-browser",
      title: fullTitle,
      description: siteDescription,
      url: canonicalUrlFor(href),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: slug ? `${displayTitle} - agent-browser` : "agent-browser",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: siteDescription,
      images: [ogImageUrl],
    },
  };
}
