// 中文镜像站信息：canonical / sitemap / robots 均以镜像为准，
// OG 图等媒体资源指向上游。
export const siteUrl = "https://lif3ng-vibe.github.io/docs-cn/agent-browser";
export const upstreamUrl = "https://agent-browser.dev";
export const siteName = "agent-browser 中文文档";
export const siteDescription =
  "agent-browser 中文文档（非官方翻译）：面向 AI 智能体的浏览器自动化 CLI——快照、下钻、操作、验证循环驱动真实浏览器，支持无头/有头、CDP、网络拦截与视频录制。";

export function canonicalUrlFor(href: string): string {
  return `${siteUrl}${href === "/" ? "" : href}`;
}
