import { renderOgImage, OG_SIZE, OG_ALT } from "@/lib/og-image";

export const runtime = "edge";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return renderOgImage();
}

// 静态导出：构建期生成一次（output: export 要求路由声明 force-static）
export const dynamic = "force-static";
