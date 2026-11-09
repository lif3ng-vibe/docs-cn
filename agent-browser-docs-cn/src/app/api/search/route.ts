import { createSearchRoute } from "@vercel/geistdocs/routes/search";
import { config } from "@/lib/geistdocs/config";
import { geistdocsSource } from "@/lib/geistdocs/source";

// 静态导出镜像：geistdocs 补丁（patches/@vercel__geistdocs@2.7.5.patch）把
// createSearchRoute 的返回换成 staticGET——构建期生成静态搜索索引
// （out/api/search，无扩展名文件），客户端 useDocsSearch type:'static' 直读。
export const dynamic = "force-static";

export const GET = createSearchRoute({ config, source: geistdocsSource });
