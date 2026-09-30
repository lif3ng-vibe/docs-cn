import { docsSource } from "@/lib/source";
import { renderDocsOgImage } from "@/lib/docs-og";

/**
 * Per-page social card for a docs page — `/docs-og/<slug>`.
 *
 * A route handler rather than the `opengraph-image` file convention because the
 * docs route is an OPTIONAL catch-all (`[[...slug]]`), and Next refuses an image
 * segment nested under one ("optional catch-all must be the last part of the
 * URL"). Same shape as the sibling `docs-raw` handler, and referenced explicitly
 * from the docs page's `generateMetadata`.
 *
 * force-static + generateStaticParams → every card is a PNG written at build
 * time, so a crawler never triggers a render.
 *
 * 中文镜像：静态导出模式下跳过逐页 OG 卡（164 张 ImageResponse 拖慢 CI 且导出无
 * 扩展名社交爬虫不认），generateStaticParams 置空 → 该路由不产出文件，
 * 页面 metadata 里的 og:image 引用成为无害死链。
 */
export const dynamic = "force-static";

const isExport = process.env.NEXT_OUTPUT === "export";

export function generateStaticParams() {
  // 导出模式：[[...slug]] 不允许空数组，只产出根路径一张占位卡
  if (isExport) return [{ slug: undefined }] as { slug?: string[] }[];
  return docsSource.generateParams();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  if (!docsSource.getPage(slug)) return new Response("Not found", { status: 404 });

  return renderDocsOgImage(slug);
}
