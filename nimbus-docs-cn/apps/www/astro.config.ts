import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";

// 部署位置可用环境变量覆盖（GitHub Pages 项目页：DOCS_SITE=https://<user>.github.io
// DOCS_BASE=/docs-cn/<slug>/）。默认保持上游官方站配置。
const site = process.env.DOCS_SITE || "https://nimbus-docs.com";
const base = process.env.DOCS_BASE || "/";

const nimbusConfig = defineNimbusConfig({
  site,
  title: "Nimbus",
  description: "为智能体网络（agentic web）而生的文档。",
  locale: "zh-CN",
  github: "https://github.com/cloudflare/nimbus",
  homeLabel: "首页",
  socialImageAlt: "Nimbus 文档预览",
  sidebar: {
    indexDisplay: "overview-leaf",
    items: [
      "get-started",
      "installation",
      "philosophy",
      "cli",
      "registry",
      "project-structure",
      "configuration",
      "api-reference",
      "adding-components",
      { label: "写作", icon: "ph:pencil-simple", autogenerate: { directory: "writing" } },
      { label: "导航", icon: "ph:compass", autogenerate: { directory: "navigation" } },
      { label: "样式", icon: "ph:palette", autogenerate: { directory: "styling" } },
      { label: "面向 AI", icon: "ph:sparkle", autogenerate: { directory: "ai" } },
      {
        label: "组件",
        icon: "ph:puzzle-piece",
        collapsed: false,
        autogenerate: { collection: "components" },
      },
    ],
  },
});

export default defineConfig({
  output: "static",
  site,
  base,
  integrations: [react(), nimbus(nimbusConfig)],
  vite: {
    // Tailwind v4 via its Vite plugin (replaces the PostCSS plugin, which
    // doesn't build under Astro 7's Vite 8 bundler).
    plugins: [tailwindcss()],
    // Dedupe React across the module graph. In dev, Vite serves modules
    // individually and a separate React instance can sneak in via
    // pre-bundled deps (framer-motion, @astrojs/react renderer, our card
    // components) — surfaces as "Invalid hook call" in the SSR log. Forcing
    // single resolution fixes it.
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "framer-motion"],
    },
    ssr: {
      noExternal: ["framer-motion"],
    },
  },
});
