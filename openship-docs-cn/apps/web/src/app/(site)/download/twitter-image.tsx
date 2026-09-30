import { renderOgImage, OG_SIZE } from "@/lib/og-image";

export const runtime = "edge";
export const alt =
  "Download Openship - CLI, native desktop app, and self-hosted dashboard for macOS, Windows, and Linux";
export const size = OG_SIZE;
export const contentType = "image/png";

const SEAFOAM = { glow: "0,184,148", solid: "#00B894", soft: "#7FEFD5" };

export default function TwitterImage() {
  return renderOgImage({
    eyebrow: "Download",
    title: "Install Openship. Deploy in seconds.",
    subtitle:
      "CLI, native desktop app, and self-hosted dashboard - macOS, Windows, Linux. Same backend, your choice of surface.",
    accent: SEAFOAM,
  });
}

// 静态导出：构建期生成一次（output: export 要求路由声明 force-static）
export const dynamic = "force-static";
