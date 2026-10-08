import Link from 'next/link';

const NotFound = () => (
  <main className="mx-auto grid min-h-[60vh] w-full max-w-2xl content-center gap-5 px-6 py-20">
    <p className="font-mono text-gray-900 text-sm">404</p>
    <h1 className="font-[450] text-4xl tracking-tight">页面不存在</h1>
    <p className="text-gray-900 text-lg">
      请求的页面不存在。可以浏览文档，或使用机器可读的索引找到最接近的现有页面。
    </p>
    <ul className="grid gap-2">
      <li>
        <Link className="underline" href="/docs">
          浏览文档
        </Link>
      </li>
      {/* Route handlers, not pages: full navigation is intentional. */}
      <li>
        {/* oxlint-disable-next-line no-html-link-for-pages */}
        <a className="underline" href="/sitemap.md">
          打开语义 sitemap
        </a>
      </li>
      <li>
        {/* oxlint-disable-next-line no-html-link-for-pages */}
        <a className="underline" href="/llms.txt">
          打开完整的 Markdown 语料
        </a>
      </li>
    </ul>
  </main>
);

export default NotFound;
