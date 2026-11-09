import {
  createSource,
  type GeistdocsSourceBundle,
} from "@vercel/geistdocs/source";
import { docs } from "@/.source/server";
import { config } from "./config";

// 静态导出镜像：上游额外覆盖的 getPageMarkdown（服务端 markdown 协商，
// 供 .md 路由 / WebMCP / Ask AI 使用）在静态站无运行时，去掉覆盖。
export const geistdocsSource: GeistdocsSourceBundle = createSource({
  docs,
  config,
  baseUrl: "/",
});
