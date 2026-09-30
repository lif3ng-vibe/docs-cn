import { docsSource } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// 静态镜像：构建期把整份搜索索引（zbsearch db 导出）落成静态文件，
// 客户端 orama-static 本地检索。对应 UI 需 RootProvider search.options.type = "static"。
// 上游原版是 GET 按查询服务端检索（handler 自带 dynamic="error"），静态导出不兼容。
export const dynamic = "force-static";
export const { staticGET: GET } = createFromSource(docsSource);