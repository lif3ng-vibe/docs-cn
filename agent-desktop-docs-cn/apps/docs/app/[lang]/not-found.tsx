import { getLocalizedPath } from "@/lib/geistdocs/public-path";

const NotFound = async () => {
  const path = (value: string) => getLocalizedPath("cn", value);

  return (
    <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl content-center gap-5 px-6 py-20">
      <p className="font-mono text-gray-900 text-sm">404</p>
      <h1 className="font-[450] text-4xl tracking-tight">页面不存在</h1>
      <p className="text-gray-900 text-lg">
        所请求的页面不存在。可浏览文档目录，或使用站内搜索找到最相关的页面。
      </p>
      <ul className="grid gap-2">
        <li>
          <a className="underline" href={path("/desktop")}>
            浏览文档
          </a>
        </li>
      </ul>
    </main>
  );
};

export default NotFound;
