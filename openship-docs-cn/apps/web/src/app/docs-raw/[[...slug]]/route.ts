import { docsSource } from "@/lib/source";
import { pageToMarkdown, type LlmPage } from "@/lib/llms";

/**
 * Raw-markdown variant of a docs page — no HTML shell, just the source.
 * Public URL is `/docs/<slug>.md` (rewritten to here in next.config.mjs), the
 * standard llms.txt way to fetch a doc for an LLM/agent.
 */
export const dynamic = "force-static";

// 静态导出：optional catch-all 下 slug ["api"] 与 ["api","apps"] 会撞同一 out 路径
// （文件 vs 目录），故镜像只导出根路径一个占位文件；逐页 .md 端点由官方站承载，
// llms.txt 的 .md 链接经 lib/llms.ts 指回官方站。
export function generateStaticParams() {
  if (process.env.NEXT_OUTPUT === "export") return [{ slug: undefined }];
  return docsSource.generateParams();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);
  if (!page) return new Response("Not found", { status: 404 });

  return new Response(await pageToMarkdown(page as unknown as LlmPage), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
