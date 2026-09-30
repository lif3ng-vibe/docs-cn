import type { MetadataRoute } from "next";

const BASE_URL = "https://openship.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/login/",
          "/dashboard/",
          "/_next/",
          "/admin/",
          "/private/",
          "/*?*utm_",
          "/*?*ref=",
          "/*?*fbclid",
          "/*?*gclid",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/login", "/dashboard/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/login", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/login", "/dashboard/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/login", "/dashboard/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/login", "/dashboard/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}

// 静态导出：构建期生成一次（output: export 要求路由声明 force-static）
export const dynamic = "force-static";
